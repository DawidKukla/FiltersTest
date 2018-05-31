namespace Comarch.Controls.FilterControlModule.FilterStateManagerModule {
    import TreeHelpers = Utils.TreeUtils.TreeHelpers;
    import ForwardTreeTraversalIteratorFactory = Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
    import AffectedNodesSet = FilterControlModule.Common.AffectedNodesSet;
    import ICleanedStateInfo = FilterControlModule.Common.ICleanedStateInfo;
    import IChildrenCountInfoLookup = FilterControlModule.Common.IChildrenCountInfoLookup;
    import ITreeTraversalIteratorFactory = Utils.TreeUtils.ITreeTraversalIteratorFactory;
    import BackwardTreeTraversalIteratorFactory = Utils.TreeUtils.BackwardTreeTraversalIteratorFactory;
    import IMemberNodeLookup = FilterControlModule.Common.IMemberNodeLookup;
    import SelectionMode = FilterStateManagerModule.Common.SelectionMode;
    import FilterType = FilterStateManagerModule.Common.FilterType;
    import IFilterItem = FilterStateManagerModule.Common.IFilterItem;

    export class FilterStateManagerFactory implements IFilterStateManagerFactory {
        Create(rootType: FilterType, childrenTotalCount: number, isFiltred: boolean): IFilterStateManager {
            return new FilterStateManager(rootType, childrenTotalCount, isFiltred);
        }
    }


    export interface IFilterStateManagerFactory {
        Create(rootType: FilterType, childrenTotalCount: number, isFiltred: boolean): IFilterStateManager;
    }

    export interface IFilterStateManager {
        IsFiltred: boolean;
        AddNodes(sortedParents: ExtendedFilterItem[],
            targetNode: ExtendedFilterItem,
            isSelected: boolean,
            autoRefresh: boolean,
            iteratorFactory?: ITreeTraversalIteratorFactory<ExtendedFilterItem>): AffectedNodesSet;
        Reset(isSelect: boolean);
        GetState(): ExtendedFilterItem;
        Serialize(): IFilterItem;
        Deserialize(serializedRoot: IFilterItem, rootElementsCount: number, cleanedStateInfo: ICleanedStateInfo);
        GetSelectionStatus(sortedParents: string[], id: string, iteratorFactory?: ITreeTraversalIteratorFactory<string>): SelectionMode;
        Print();
        CreateItem(id: string, parentUniqueName: string, childrenCount: number, filtredChildrenTotalCount: number, level: number): ExtendedFilterItem;
        Refresh();
        RevertSelection();
        IsEmpty(): boolean;
        CloneBranch(uniqueName: string, withChildren: boolean): ExtendedFilterItem;
        Contains(uniqueName: string): boolean;
        GetRootType(): FilterType;
        UpdateFilteredChildrensTotalCount(existingElementsChildrenCountLookup: IChildrenCountInfoLookup, nodesWithUpdatedCount: IMemberNodeLookup);
        GetAllNodeSelectionStatus(): SelectionMode;

    }

    export class FilterStateManager implements IFilterStateManager {
        private _root: ExtendedFilterItem;

        get Root(): ExtendedFilterItem { return this._root };

        get IsFiltred(): boolean { return this._isFiltred };

        constructor(rootType: FilterType, childrenTotalCount: number, private _isFiltred: boolean) {
            this._root = this.GetEmptyRootItem(rootType);
            this._root.ChildrenTotalCount = childrenTotalCount;
            this._root.AllItemsLookup = {};
            this._root.AllItemsLookup[this._root.UniqueName] = this._root;
        }

        private GetEmptyRootItem(rootType: FilterType) {
            return new ExtendedFilterItem("#", null, -1, -1, -1, this, rootType);
        }

        AddNodes(sortedParents: ExtendedFilterItem[],
            targetNode: ExtendedFilterItem,
            isSelected: boolean,
            autoRefresh: boolean,
            iteratorFactory: ITreeTraversalIteratorFactory<ExtendedFilterItem>=new BackwardTreeTraversalIteratorFactory()): AffectedNodesSet {
            const affectedNodes = new AffectedNodesSet();
            const iterator = iteratorFactory.Create(sortedParents);
            while (iterator.MoveNext()) {
                this.AddNode(iterator.Current, isSelected, false, affectedNodes, autoRefresh);
            }

            this.AddNode(targetNode, isSelected, true, affectedNodes, autoRefresh);
            return affectedNodes;
        }

        private AddNode(node: ExtendedFilterItem, isSelected: boolean, isTargetNode: boolean, affectedNodesSet: AffectedNodesSet, autoRefresh: boolean): boolean {
            const existingNode: ExtendedFilterItem = this._root.AllItemsLookup[node.UniqueName];
            const existingParentNode: ExtendedFilterItem = this._root.AllItemsLookup[node.ParentUniqueName];
            if (!existingNode) {
                if (existingParentNode) {
                    existingParentNode.AddChild(node, isSelected, isTargetNode);
                    if (isTargetNode) {
                        node.HandleSelectionChange(isSelected, isTargetNode, affectedNodesSet, autoRefresh);
                    }
                } else {
                    throw new Error("Can not add node to not existing parent.");
                }
                return false;
            } else {
                if (isTargetNode) {
                    existingNode.HandleSelectionChange(isSelected, true, affectedNodesSet, autoRefresh);
                }
            }

            return true;
        }

        Reset(isSelect: boolean) {
            this._root.RemoveAllChildren();
            this._root.Type = isSelect ? FilterType.Excluded : FilterType.Included;
            return AffectedNodesSet.Empty.Add("#");
        }

        GetState(): ExtendedFilterItem { return this._root; }

        Serialize(): IFilterItem {
            const result = TreeHelpers.Convert<ExtendedFilterItem, IFilterItem>(this._root,
                x => x.ChildrenArray,
                x => x.Children,
                (current) => {
                    const result = { Type: current.Type, UniqueName: current.UniqueName, Children: [] } as IFilterItem;
                    return result;
                });
            return result;
        }

        Deserialize(serializedRoot: IFilterItem, rootElementsCount: number, cleanedStateInfo: ICleanedStateInfo, clean: boolean=true) {
            var lookup: IExtendedFilterItemLookup = {};
            this._root = TreeHelpers.Convert<IFilterItem, ExtendedFilterItem>(serializedRoot,
                x => x.Children,
                x => null,
                (current, parent, cp, level) => {
                    var newChildrenTotalCount = -1;
                    var parentUniqueName = parent ? parent.UniqueName : null;
                    if (clean) {
                        if (parent) {
                            const refreshedNode = cleanedStateInfo.ExistingMembersHierarchyLookup[current.UniqueName];
                            if (refreshedNode) {
                                newChildrenTotalCount = refreshedNode.data.childrenTotalCount;
                            } else {
                                //removing not existing nodes
                                return null;
                            }
                        } else {
                            newChildrenTotalCount = rootElementsCount;
                        }
                    }
                    const result = new ExtendedFilterItem(current.UniqueName, parentUniqueName, newChildrenTotalCount, -1, level - 1, this, current.Type);
                    result.AllItemsLookup = lookup;
                    lookup[result.UniqueName] = result;
                    return result;
                },
                (parent, child) => parent.Children[child.UniqueName] = child
            );
            this.Refresh();
            console.log("DESERIALIZED STATE:");
            this.Print();
            return this;
        }

        GetSelectionStatus(sortedParents: string[], id: string, iteratorFactory: ITreeTraversalIteratorFactory<string>=new ForwardTreeTraversalIteratorFactory()):
            SelectionMode {
            let status = null;
            let currentParent: ExtendedFilterItem;
            let currentChildUniqueName = id;
            if (!this._root.ChildrenArray.length) {
                return this.Root.Type === FilterType.Excluded
                    ? SelectionMode.Selected
                    : SelectionMode.Deselected;
            }

            const iterator = iteratorFactory.Create(sortedParents);
            while (iterator.MoveNext()) {
                const currentParentUniqueName = iterator.Current;
                currentParent = this._root.AllItemsLookup[currentParentUniqueName];
                if (currentParent) {
                    status = currentParent.GetSelectionStatus(currentChildUniqueName);
                    break;
                } else {
                    currentChildUniqueName = currentParentUniqueName;
                }
            }
            if (!status) {
                status = this.GetSelectionStatus(["#"], currentChildUniqueName);
            }

            return status;
        }

        GetAllNodeSelectionStatus(): SelectionMode {
            return this._root.GetSelectionMode();
        }

        static GetLeafs(root: IFilterItem): string[] {
            if (!root) return [];
            var result = [];
            TreeHelpers.TraversePreorder<IFilterItem>(root,
                x => x.Children,
                (current) => {
                    if (!current.Children || !current.Children.length) {
                        result.push(current.UniqueName);
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory<IFilterItem>());
            return result;
        }


        DeepCopy(rootChildrenTotalCount: number): FilterStateManager {
            return new FilterStateManager(this.GetRootType(), rootChildrenTotalCount, this.IsFiltred).Deserialize(this.Serialize(), rootChildrenTotalCount, null, false);
        }

        Print() {
            console.log("#:", this._root);
            console.log("LOOKUP:", this._root.AllItemsLookup);
            var text = "";
            var writeLevelIndent = (text: string, level: number) => {
                for (let i = 0; i < level; i++) {
                    text = text + "| ";
                }
                return text;
            };
            TreeHelpers.TraversePreorder<ExtendedFilterItem>(this._root,
                x => Object.keys(x.Children).map(key => x.Children[key]),
                (current, parent, level) => {
                    text = writeLevelIndent(text, level);
                    text += "|";
                    text += "-";
                    text += this.PrintFilterItem(current);
                    text += " [";
                    text += `L:${current.Level} `;
                    text += `C:${current.ChildrenTotalCount} `;
                    text += current.FiltredChildrenTotalCount ? `FC:${current.FiltredChildrenTotalCount}` : "";
                    text += "]";
                    text += "\n";
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory<ExtendedFilterItem>()
            );
            console.log(text);
        }

        PrintFilterItem(filterItem: ExtendedFilterItem): string {
            let type = "";
            switch (filterItem.Type) {
            case FilterType.Included:
                type = type + "(I)";
                break;
            case FilterType.Excluded:
                type = type + "(E)";
                break;
            default:
            }
            return filterItem.UniqueName + type;
        }


        CreateItem(id: string, parentUniqueName: string, childrenCount: number, filtredChildrenTotalCount: number, level: number): ExtendedFilterItem {
            return new ExtendedFilterItem(id, parentUniqueName, childrenCount, filtredChildrenTotalCount, level, this);
        }

        GetRootType(): FilterType { return this._root.Type; }

        UpdateFilteredChildrensTotalCount(existingElementsChildrenCountLookup: IChildrenCountInfoLookup, nodesWithUpdatedCount: IMemberNodeLookup) {
            const nodeWithUpdatedCounts: string[] = [];
            for (let key in nodesWithUpdatedCount) {
                if (nodesWithUpdatedCount.hasOwnProperty(key)) {
                    if (nodesWithUpdatedCount.hasOwnProperty(key)) {
                        const item = this._root.AllItemsLookup[key];
                        if (item) {
                            item.FiltredChildrenTotalCount = existingElementsChildrenCountLookup[key].ChildrenCount;
                            nodeWithUpdatedCounts.push(item.UniqueName);
                        }
                    }

                }
            }
            console.log(`%cNODE WITH UPDATED COUNTS: ${nodeWithUpdatedCounts}`, "background: #222; color: yellow");

        }

        Contains(uniqueName: string): boolean {
            return Boolean(this._root.AllItemsLookup[uniqueName]);
        }

        CloneBranch(uniqueName: string, withChildren: boolean): ExtendedFilterItem {
            const filterItem = this._root.AllItemsLookup[uniqueName];
            return filterItem.Clone(withChildren);
        }

        IsEmpty(): boolean {
            return this.Root.CurrentChildrenCount === 0;
        }

        RevertSelection() {
            this.Root.RevertSelection();
        }

        Refresh() {
            const t0 = performance.now();
            TreeHelpers.TraversePostOrder<ExtendedFilterItem>(this.Root,
                x => x.ChildrenArray,
                (current, parent) => {
                    const selectionMode = current.GetSelectionMode();
                    if (selectionMode !== SelectionMode.Undetermined) {
                        const isSelect = selectionMode === SelectionMode.Selected;
                        current.ChangeTargetType(isSelect);
                        current.RemoveAllChildren();
                        if (parent) {
                            current.RegisterOrUnregisterInParent(isSelect, true);
                        }
                    }
                    return true;
                }
            );
            const t1 = performance.now();
            console.info(`Call to Refresh took ${t1 - t0} milliseconds.`);
        }
    }
}