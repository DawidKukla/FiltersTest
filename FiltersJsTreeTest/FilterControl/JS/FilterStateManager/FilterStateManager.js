var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var FilterStateManagerModule;
            (function (FilterStateManagerModule) {
                var TreeHelpers = Comarch.Utils.TreeUtils.TreeHelpers;
                var ForwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
                var AffectedNodesSet = FilterControlModule.Common.AffectedNodesSet;
                var BackwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.BackwardTreeTraversalIteratorFactory;
                var SelectionMode = FilterStateManagerModule.Common.SelectionMode;
                var FilterType = FilterStateManagerModule.Common.FilterType;
                class FilterStateManagerFactory {
                    Create(rootType, childrenTotalCount, isFiltred) {
                        return new FilterStateManager(rootType, childrenTotalCount, isFiltred);
                    }
                }
                FilterStateManagerModule.FilterStateManagerFactory = FilterStateManagerFactory;
                class FilterStateManager {
                    constructor(rootType, childrenTotalCount, _isFiltred) {
                        this._isFiltred = _isFiltred;
                        this._root = this.GetEmptyRootItem(rootType);
                        this._root.ChildrenTotalCount = childrenTotalCount;
                        this._root.AllItemsLookup = {};
                        this._root.AllItemsLookup[this._root.UniqueName] = this._root;
                    }
                    get Root() { return this._root; }
                    ;
                    get IsFiltred() { return this._isFiltred; }
                    ;
                    GetEmptyRootItem(rootType) {
                        return new FilterStateManagerModule.ExtendedFilterItem("#", null, -1, -1, -1, this, rootType);
                    }
                    AddNodes(sortedParents, targetNode, isSelected, autoRefresh, iteratorFactory = new BackwardTreeTraversalIteratorFactory()) {
                        const affectedNodes = new AffectedNodesSet();
                        const iterator = iteratorFactory.Create(sortedParents);
                        while (iterator.MoveNext()) {
                            this.AddNode(iterator.Current, isSelected, false, affectedNodes, autoRefresh);
                        }
                        this.AddNode(targetNode, isSelected, true, affectedNodes, autoRefresh);
                        return affectedNodes;
                    }
                    AddNode(node, isSelected, isTargetNode, affectedNodesSet, autoRefresh) {
                        const existingNode = this._root.AllItemsLookup[node.UniqueName];
                        const existingParentNode = this._root.AllItemsLookup[node.ParentUniqueName];
                        if (!existingNode) {
                            if (existingParentNode) {
                                existingParentNode.AddChild(node, isSelected, isTargetNode);
                                if (isTargetNode) {
                                    node.HandleSelectionChange(isSelected, isTargetNode, affectedNodesSet, autoRefresh);
                                }
                            }
                            else {
                                throw new Error("Can not add node to not existing parent.");
                            }
                            return false;
                        }
                        else {
                            if (isTargetNode) {
                                existingNode.HandleSelectionChange(isSelected, true, affectedNodesSet, autoRefresh);
                            }
                        }
                        return true;
                    }
                    Reset(isSelect) {
                        this._root.RemoveAllChildren();
                        this._root.Type = isSelect ? FilterType.Excluded : FilterType.Included;
                        return AffectedNodesSet.Empty.Add("#");
                    }
                    GetState() { return this._root; }
                    Serialize() {
                        const result = TreeHelpers.Convert(this._root, x => x.ChildrenArray, x => x.Children, (current) => {
                            const result = { Type: current.Type, UniqueName: current.UniqueName, Children: [] };
                            return result;
                        });
                        return result;
                    }
                    Deserialize(serializedRoot, rootElementsCount, cleanedStateInfo, clean = true) {
                        var lookup = {};
                        this._root = TreeHelpers.Convert(serializedRoot, x => x.Children, x => null, (current, parent, cp, level) => {
                            var newChildrenTotalCount = -1;
                            var parentUniqueName = parent ? parent.UniqueName : null;
                            if (clean) {
                                if (parent) {
                                    const refreshedNode = cleanedStateInfo.ExistingMembersHierarchyLookup[current.UniqueName];
                                    if (refreshedNode) {
                                        newChildrenTotalCount = refreshedNode.data.childrenTotalCount;
                                    }
                                    else {
                                        return null;
                                    }
                                }
                                else {
                                    newChildrenTotalCount = rootElementsCount;
                                }
                            }
                            const result = new FilterStateManagerModule.ExtendedFilterItem(current.UniqueName, parentUniqueName, newChildrenTotalCount, -1, level - 1, this, current.Type);
                            result.AllItemsLookup = lookup;
                            lookup[result.UniqueName] = result;
                            return result;
                        }, (parent, child) => parent.Children[child.UniqueName] = child);
                        this.Refresh();
                        console.log("DESERIALIZED STATE:");
                        this.Print();
                        return this;
                    }
                    GetSelectionStatus(sortedParents, id, iteratorFactory = new ForwardTreeTraversalIteratorFactory()) {
                        let status = null;
                        let currentParent;
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
                            }
                            else {
                                currentChildUniqueName = currentParentUniqueName;
                            }
                        }
                        if (!status) {
                            status = this.GetSelectionStatus(["#"], currentChildUniqueName);
                        }
                        return status;
                    }
                    GetAllNodeSelectionStatus() {
                        return this._root.GetSelectionMode();
                    }
                    static GetLeafs(root) {
                        if (!root)
                            return [];
                        var result = [];
                        TreeHelpers.TraversePreorder(root, x => x.Children, (current) => {
                            if (!current.Children || !current.Children.length) {
                                result.push(current.UniqueName);
                            }
                            return true;
                        }, new ForwardTreeTraversalIteratorFactory());
                        return result;
                    }
                    DeepCopy(rootChildrenTotalCount) {
                        return new FilterStateManager(this.GetRootType(), rootChildrenTotalCount, this.IsFiltred).Deserialize(this.Serialize(), rootChildrenTotalCount, null, false);
                    }
                    Print() {
                        console.log("#:", this._root);
                        console.log("LOOKUP:", this._root.AllItemsLookup);
                        var text = "";
                        var writeLevelIndent = (text, level) => {
                            for (let i = 0; i < level; i++) {
                                text = text + "| ";
                            }
                            return text;
                        };
                        TreeHelpers.TraversePreorder(this._root, x => Object.keys(x.Children).map(key => x.Children[key]), (current, parent, level) => {
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
                        }, new ForwardTreeTraversalIteratorFactory());
                        console.log(text);
                    }
                    PrintFilterItem(filterItem) {
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
                    CreateItem(id, parentUniqueName, childrenCount, filtredChildrenTotalCount, level) {
                        return new FilterStateManagerModule.ExtendedFilterItem(id, parentUniqueName, childrenCount, filtredChildrenTotalCount, level, this);
                    }
                    GetRootType() { return this._root.Type; }
                    UpdateFilteredChildrensTotalCount(existingElementsChildrenCountLookup, nodesWithUpdatedCount) {
                        const nodeWithUpdatedCounts = [];
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
                    Contains(uniqueName) {
                        return Boolean(this._root.AllItemsLookup[uniqueName]);
                    }
                    CloneBranch(uniqueName, withChildren) {
                        const filterItem = this._root.AllItemsLookup[uniqueName];
                        return filterItem.Clone(withChildren);
                    }
                    IsEmpty() {
                        return this.Root.CurrentChildrenCount === 0;
                    }
                    RevertSelection() {
                        this.Root.RevertSelection();
                    }
                    Refresh() {
                        const t0 = performance.now();
                        TreeHelpers.TraversePostOrder(this.Root, x => x.ChildrenArray, (current, parent) => {
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
                        });
                        const t1 = performance.now();
                        console.info(`Call to Refresh took ${t1 - t0} milliseconds.`);
                    }
                }
                FilterStateManagerModule.FilterStateManager = FilterStateManager;
            })(FilterStateManagerModule = FilterControlModule.FilterStateManagerModule || (FilterControlModule.FilterStateManagerModule = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyU3RhdGVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmlsdGVyU3RhdGVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsT0FBTyxDQTZUaEI7QUE3VEQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBNlR6QjtJQTdUaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0E2VDdDO1FBN1QwQixXQUFBLG1CQUFtQjtZQUFDLElBQUEsd0JBQXdCLENBNlR0RTtZQTdUOEMsV0FBQSx3QkFBd0I7Z0JBQ25FLElBQU8sV0FBVyxHQUFHLFFBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7Z0JBQ2pELElBQU8sbUNBQW1DLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLG1DQUFtQyxDQUFDO2dCQUNqRyxJQUFPLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFJdEUsSUFBTyxvQ0FBb0MsR0FBRyxRQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsb0NBQW9DLENBQUM7Z0JBRW5HLElBQU8sYUFBYSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQ3JFLElBQU8sVUFBVSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBRy9EO29CQUNJLE1BQU0sQ0FBQyxRQUFvQixFQUFFLGtCQUEwQixFQUFFLFNBQWtCO3dCQUN2RSxPQUFPLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUMzRSxDQUFDO2lCQUNKO2dCQUpZLGtEQUF5Qiw0QkFJckMsQ0FBQTtnQkFnQ0Q7b0JBT0ksWUFBWSxRQUFvQixFQUFFLGtCQUEwQixFQUFVLFVBQW1CO3dCQUFuQixlQUFVLEdBQVYsVUFBVSxDQUFTO3dCQUNyRixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxn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QUFFO29DQUNSLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7aUNBQ3hEOzZCQUNKOzRCQUNELE9BQU8sSUFBSSxDQUFDO3dCQUNoQixDQUFDLENBQ0osQ0FBQzt3QkFDRixNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBQ2xFLENBQUM7aUJBQ0o7Z0JBM1FZLDJDQUFrQixxQkEyUTlCLENBQUE7WUFDTCxDQUFDLEVBN1Q4Qyx3QkFBd0IsR0FBeEIsNENBQXdCLEtBQXhCLDRDQUF3QixRQTZUdEU7UUFBRCxDQUFDLEVBN1QwQixtQkFBbUIsR0FBbkIsNEJBQW1CLEtBQW5CLDRCQUFtQixRQTZUN0M7SUFBRCxDQUFDLEVBN1RpQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQTZUekI7QUFBRCxDQUFDLEVBN1RTLE9BQU8sS0FBUCxPQUFPLFFBNlRoQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlIHtcclxuICAgIGltcG9ydCBUcmVlSGVscGVycyA9IFV0aWxzLlRyZWVVdGlscy5UcmVlSGVscGVycztcclxuICAgIGltcG9ydCBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSA9IFV0aWxzLlRyZWVVdGlscy5Gb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuICAgIGltcG9ydCBBZmZlY3RlZE5vZGVzU2V0ID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uQWZmZWN0ZWROb2Rlc1NldDtcclxuICAgIGltcG9ydCBJQ2xlYW5lZFN0YXRlSW5mbyA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklDbGVhbmVkU3RhdGVJbmZvO1xyXG4gICAgaW1wb3J0IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklDaGlsZHJlbkNvdW50SW5mb0xvb2t1cDtcclxuICAgIGltcG9ydCBJVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSA9IFV0aWxzLlRyZWVVdGlscy5JVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuICAgIGltcG9ydCBCYWNrd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkgPSBVdGlscy5UcmVlVXRpbHMuQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5O1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlTG9va3VwID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSU1lbWJlck5vZGVMb29rdXA7XHJcbiAgICBpbXBvcnQgU2VsZWN0aW9uTW9kZSA9IEZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5Db21tb24uU2VsZWN0aW9uTW9kZTtcclxuICAgIGltcG9ydCBGaWx0ZXJUeXBlID0gRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5GaWx0ZXJUeXBlO1xyXG4gICAgaW1wb3J0IElGaWx0ZXJJdGVtID0gRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5JRmlsdGVySXRlbTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyU3RhdGVNYW5hZ2VyRmFjdG9yeSBpbXBsZW1lbnRzIElGaWx0ZXJTdGF0ZU1hbmFnZXJGYWN0b3J5IHtcclxuICAgICAgICBDcmVhdGUocm9vdFR5cGU6IEZpbHRlclR5cGUsIGNoaWxkcmVuVG90YWxDb3VudDogbnVtYmVyLCBpc0ZpbHRyZWQ6IGJvb2xlYW4pOiBJRmlsdGVyU3RhdGVNYW5hZ2VyIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJTdGF0ZU1hbmFnZXIocm9vdFR5cGUsIGNoaWxkcmVuVG90YWxDb3VudCwgaXNGaWx0cmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlclN0YXRlTWFuYWdlckZhY3Rvcnkge1xyXG4gICAgICAgIENyZWF0ZShyb290VHlwZTogRmlsdGVyVHlwZSwgY2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXIsIGlzRmlsdHJlZDogYm9vbGVhbik6IElGaWx0ZXJTdGF0ZU1hbmFnZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyU3RhdGVNYW5hZ2VyIHtcclxuICAgICAgICBJc0ZpbHRyZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgQWRkTm9kZXMoc29ydGVkUGFyZW50czogRXh0ZW5kZWRGaWx0ZXJJdGVtW10sXHJcbiAgICAgICAgICAgIHRhcmdldE5vZGU6IEV4dGVuZGVkRmlsdGVySXRlbSxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZDogYm9vbGVhbixcclxuICAgICAgICAgICAgYXV0b1JlZnJlc2g6IGJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yRmFjdG9yeT86IElUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PEV4dGVuZGVkRmlsdGVySXRlbT4pOiBBZmZlY3RlZE5vZGVzU2V0O1xyXG4gICAgICAgIFJlc2V0KGlzU2VsZWN0OiBib29sZWFuKTtcclxuICAgICAgICBHZXRTdGF0ZSgpOiBFeHRlbmRlZEZpbHRlckl0ZW07XHJcbiAgICAgICAgU2VyaWFsaXplKCk6IElGaWx0ZXJJdGVtO1xyXG4gICAgICAgIERlc2VyaWFsaXplKHNlcmlhbGl6ZWRSb290OiBJRmlsdGVySXRlbSwgcm9vdEVsZW1lbnRzQ291bnQ6IG51bWJlciwgY2xlYW5lZFN0YXRlSW5mbzogSUNsZWFuZWRTdGF0ZUluZm8pO1xyXG4gICAgICAgIEdldFNlbGVjdGlvblN0YXR1cyhzb3J0ZWRQYXJlbnRzOiBzdHJpbmdbXSwgaWQ6IHN0cmluZywgaXRlcmF0b3JGYWN0b3J5PzogSVRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8c3RyaW5nPik6IFNlbGVjdGlvbk1vZGU7XHJcbiAgICAgICAgUHJpbnQoKTtcclxuICAgICAgICBDcmVhdGVJdGVtKGlkOiBzdHJpbmcsIHBhcmVudFVuaXF1ZU5hbWU6IHN0cmluZywgY2hpbGRyZW5Db3VudDogbnVtYmVyLCBmaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXIsIGxldmVsOiBudW1iZXIpOiBFeHRlbmRlZEZpbHRlckl0ZW07XHJcbiAgICAgICAgUmVmcmVzaCgpO1xyXG4gICAgICAgIFJldmVydFNlbGVjdGlvbigpO1xyXG4gICAgICAgIElzRW1wdHkoKTogYm9vbGVhbjtcclxuICAgICAgICBDbG9uZUJyYW5jaCh1bmlxdWVOYW1lOiBzdHJpbmcsIHdpdGhDaGlsZHJlbjogYm9vbGVhbik6IEV4dGVuZGVkRmlsdGVySXRlbTtcclxuICAgICAgICBDb250YWlucyh1bmlxdWVOYW1lOiBzdHJpbmcpOiBib29sZWFuO1xyXG4gICAgICAgIEdldFJvb3RUeXBlKCk6IEZpbHRlclR5cGU7XHJcbiAgICAgICAgVXBkYXRlRmlsdGVyZWRDaGlsZHJlbnNUb3RhbENvdW50KGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAsIG5vZGVzV2l0aFVwZGF0ZWRDb3VudDogSU1lbWJlck5vZGVMb29rdXApO1xyXG4gICAgICAgIEdldEFsbE5vZGVTZWxlY3Rpb25TdGF0dXMoKTogU2VsZWN0aW9uTW9kZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlclN0YXRlTWFuYWdlciBpbXBsZW1lbnRzIElGaWx0ZXJTdGF0ZU1hbmFnZXIge1xyXG4gICAgICAgIHByaXZhdGUgX3Jvb3Q6IEV4dGVuZGVkRmlsdGVySXRlbTtcclxuXHJcbiAgICAgICAgZ2V0IFJvb3QoKTogRXh0ZW5kZWRGaWx0ZXJJdGVtIHsgcmV0dXJuIHRoaXMuX3Jvb3QgfTtcclxuXHJcbiAgICAgICAgZ2V0IElzRmlsdHJlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2lzRmlsdHJlZCB9O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihyb290VHlwZTogRmlsdGVyVHlwZSwgY2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXIsIHByaXZhdGUgX2lzRmlsdHJlZDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLl9yb290ID0gdGhpcy5HZXRFbXB0eVJvb3RJdGVtKHJvb3RUeXBlKTtcclxuICAgICAgICAgICAgdGhpcy5fcm9vdC5DaGlsZHJlblRvdGFsQ291bnQgPSBjaGlsZHJlblRvdGFsQ291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuQWxsSXRlbXNMb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5fcm9vdC5BbGxJdGVtc0xvb2t1cFt0aGlzLl9yb290LlVuaXF1ZU5hbWVdID0gdGhpcy5fcm9vdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0RW1wdHlSb290SXRlbShyb290VHlwZTogRmlsdGVyVHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEV4dGVuZGVkRmlsdGVySXRlbShcIiNcIiwgbnVsbCwgLTEsIC0xLCAtMSwgdGhpcywgcm9vdFR5cGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQWRkTm9kZXMoc29ydGVkUGFyZW50czogRXh0ZW5kZWRGaWx0ZXJJdGVtW10sXHJcbiAgICAgICAgICAgIHRhcmdldE5vZGU6IEV4dGVuZGVkRmlsdGVySXRlbSxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZDogYm9vbGVhbixcclxuICAgICAgICAgICAgYXV0b1JlZnJlc2g6IGJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yRmFjdG9yeTogSVRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8RXh0ZW5kZWRGaWx0ZXJJdGVtPj1uZXcgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCkpOiBBZmZlY3RlZE5vZGVzU2V0IHtcclxuICAgICAgICAgICAgY29uc3QgYWZmZWN0ZWROb2RlcyA9IG5ldyBBZmZlY3RlZE5vZGVzU2V0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gaXRlcmF0b3JGYWN0b3J5LkNyZWF0ZShzb3J0ZWRQYXJlbnRzKTtcclxuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yLk1vdmVOZXh0KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQWRkTm9kZShpdGVyYXRvci5DdXJyZW50LCBpc1NlbGVjdGVkLCBmYWxzZSwgYWZmZWN0ZWROb2RlcywgYXV0b1JlZnJlc2gpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLkFkZE5vZGUodGFyZ2V0Tm9kZSwgaXNTZWxlY3RlZCwgdHJ1ZSwgYWZmZWN0ZWROb2RlcywgYXV0b1JlZnJlc2gpO1xyXG4gICAgICAgICAgICByZXR1cm4gYWZmZWN0ZWROb2RlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQWRkTm9kZShub2RlOiBFeHRlbmRlZEZpbHRlckl0ZW0sIGlzU2VsZWN0ZWQ6IGJvb2xlYW4sIGlzVGFyZ2V0Tm9kZTogYm9vbGVhbiwgYWZmZWN0ZWROb2Rlc1NldDogQWZmZWN0ZWROb2Rlc1NldCwgYXV0b1JlZnJlc2g6IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdOb2RlOiBFeHRlbmRlZEZpbHRlckl0ZW0gPSB0aGlzLl9yb290LkFsbEl0ZW1zTG9va3VwW25vZGUuVW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUGFyZW50Tm9kZTogRXh0ZW5kZWRGaWx0ZXJJdGVtID0gdGhpcy5fcm9vdC5BbGxJdGVtc0xvb2t1cFtub2RlLlBhcmVudFVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoIWV4aXN0aW5nTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nUGFyZW50Tm9kZS5BZGRDaGlsZChub2RlLCBpc1NlbGVjdGVkLCBpc1RhcmdldE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1RhcmdldE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5IYW5kbGVTZWxlY3Rpb25DaGFuZ2UoaXNTZWxlY3RlZCwgaXNUYXJnZXROb2RlLCBhZmZlY3RlZE5vZGVzU2V0LCBhdXRvUmVmcmVzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGFkZCBub2RlIHRvIG5vdCBleGlzdGluZyBwYXJlbnQuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzVGFyZ2V0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nTm9kZS5IYW5kbGVTZWxlY3Rpb25DaGFuZ2UoaXNTZWxlY3RlZCwgdHJ1ZSwgYWZmZWN0ZWROb2Rlc1NldCwgYXV0b1JlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlc2V0KGlzU2VsZWN0OiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuUmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5fcm9vdC5UeXBlID0gaXNTZWxlY3QgPyBGaWx0ZXJUeXBlLkV4Y2x1ZGVkIDogRmlsdGVyVHlwZS5JbmNsdWRlZDtcclxuICAgICAgICAgICAgcmV0dXJuIEFmZmVjdGVkTm9kZXNTZXQuRW1wdHkuQWRkKFwiI1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldFN0YXRlKCk6IEV4dGVuZGVkRmlsdGVySXRlbSB7IHJldHVybiB0aGlzLl9yb290OyB9XHJcblxyXG4gICAgICAgIFNlcmlhbGl6ZSgpOiBJRmlsdGVySXRlbSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFRyZWVIZWxwZXJzLkNvbnZlcnQ8RXh0ZW5kZWRGaWx0ZXJJdGVtLCBJRmlsdGVySXRlbT4odGhpcy5fcm9vdCxcclxuICAgICAgICAgICAgICAgIHggPT4geC5DaGlsZHJlbkFycmF5LFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LkNoaWxkcmVuLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7IFR5cGU6IGN1cnJlbnQuVHlwZSwgVW5pcXVlTmFtZTogY3VycmVudC5VbmlxdWVOYW1lLCBDaGlsZHJlbjogW10gfSBhcyBJRmlsdGVySXRlbTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBEZXNlcmlhbGl6ZShzZXJpYWxpemVkUm9vdDogSUZpbHRlckl0ZW0sIHJvb3RFbGVtZW50c0NvdW50OiBudW1iZXIsIGNsZWFuZWRTdGF0ZUluZm86IElDbGVhbmVkU3RhdGVJbmZvLCBjbGVhbjogYm9vbGVhbj10cnVlKSB7XHJcbiAgICAgICAgICAgIHZhciBsb29rdXA6IElFeHRlbmRlZEZpbHRlckl0ZW1Mb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5fcm9vdCA9IFRyZWVIZWxwZXJzLkNvbnZlcnQ8SUZpbHRlckl0ZW0sIEV4dGVuZGVkRmlsdGVySXRlbT4oc2VyaWFsaXplZFJvb3QsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguQ2hpbGRyZW4sXHJcbiAgICAgICAgICAgICAgICB4ID0+IG51bGwsXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBjcCwgbGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3Q2hpbGRyZW5Ub3RhbENvdW50ID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFVuaXF1ZU5hbWUgPSBwYXJlbnQgPyBwYXJlbnQuVW5pcXVlTmFtZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsZWFuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZnJlc2hlZE5vZGUgPSBjbGVhbmVkU3RhdGVJbmZvLkV4aXN0aW5nTWVtYmVyc0hpZXJhcmNoeUxvb2t1cFtjdXJyZW50LlVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlZnJlc2hlZE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZHJlblRvdGFsQ291bnQgPSByZWZyZXNoZWROb2RlLmRhdGEuY2hpbGRyZW5Ub3RhbENvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3JlbW92aW5nIG5vdCBleGlzdGluZyBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGRyZW5Ub3RhbENvdW50ID0gcm9vdEVsZW1lbnRzQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEV4dGVuZGVkRmlsdGVySXRlbShjdXJyZW50LlVuaXF1ZU5hbWUsIHBhcmVudFVuaXF1ZU5hbWUsIG5ld0NoaWxkcmVuVG90YWxDb3VudCwgLTEsIGxldmVsIC0gMSwgdGhpcywgY3VycmVudC5UeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWxsSXRlbXNMb29rdXAgPSBsb29rdXA7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9va3VwW3Jlc3VsdC5VbmlxdWVOYW1lXSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChwYXJlbnQsIGNoaWxkKSA9PiBwYXJlbnQuQ2hpbGRyZW5bY2hpbGQuVW5pcXVlTmFtZV0gPSBjaGlsZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLlJlZnJlc2goKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJERVNFUklBTElaRUQgU1RBVEU6XCIpO1xyXG4gICAgICAgICAgICB0aGlzLlByaW50KCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgR2V0U2VsZWN0aW9uU3RhdHVzKHNvcnRlZFBhcmVudHM6IHN0cmluZ1tdLCBpZDogc3RyaW5nLCBpdGVyYXRvckZhY3Rvcnk6IElUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PHN0cmluZz49bmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCkpOlxyXG4gICAgICAgICAgICBTZWxlY3Rpb25Nb2RlIHtcclxuICAgICAgICAgICAgbGV0IHN0YXR1cyA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50UGFyZW50OiBFeHRlbmRlZEZpbHRlckl0ZW07XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50Q2hpbGRVbmlxdWVOYW1lID0gaWQ7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fcm9vdC5DaGlsZHJlbkFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuUm9vdC5UeXBlID09PSBGaWx0ZXJUeXBlLkV4Y2x1ZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgPyBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgOiBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gaXRlcmF0b3JGYWN0b3J5LkNyZWF0ZShzb3J0ZWRQYXJlbnRzKTtcclxuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yLk1vdmVOZXh0KCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYXJlbnRVbmlxdWVOYW1lID0gaXRlcmF0b3IuQ3VycmVudDtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYXJlbnQgPSB0aGlzLl9yb290LkFsbEl0ZW1zTG9va3VwW2N1cnJlbnRQYXJlbnRVbmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gY3VycmVudFBhcmVudC5HZXRTZWxlY3Rpb25TdGF0dXMoY3VycmVudENoaWxkVW5pcXVlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDaGlsZFVuaXF1ZU5hbWUgPSBjdXJyZW50UGFyZW50VW5pcXVlTmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzID0gdGhpcy5HZXRTZWxlY3Rpb25TdGF0dXMoW1wiI1wiXSwgY3VycmVudENoaWxkVW5pcXVlTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBHZXRBbGxOb2RlU2VsZWN0aW9uU3RhdHVzKCk6IFNlbGVjdGlvbk1vZGUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5HZXRTZWxlY3Rpb25Nb2RlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgR2V0TGVhZnMocm9vdDogSUZpbHRlckl0ZW0pOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgICAgIGlmICghcm9vdCkgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlUHJlb3JkZXI8SUZpbHRlckl0ZW0+KHJvb3QsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguQ2hpbGRyZW4sXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudC5DaGlsZHJlbiB8fCAhY3VycmVudC5DaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY3VycmVudC5VbmlxdWVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PElGaWx0ZXJJdGVtPigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBEZWVwQ29weShyb290Q2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXIpOiBGaWx0ZXJTdGF0ZU1hbmFnZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZpbHRlclN0YXRlTWFuYWdlcih0aGlzLkdldFJvb3RUeXBlKCksIHJvb3RDaGlsZHJlblRvdGFsQ291bnQsIHRoaXMuSXNGaWx0cmVkKS5EZXNlcmlhbGl6ZSh0aGlzLlNlcmlhbGl6ZSgpLCByb290Q2hpbGRyZW5Ub3RhbENvdW50LCBudWxsLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBQcmludCgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIjOlwiLCB0aGlzLl9yb290KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMT09LVVA6XCIsIHRoaXMuX3Jvb3QuQWxsSXRlbXNMb29rdXApO1xyXG4gICAgICAgICAgICB2YXIgdGV4dCA9IFwiXCI7XHJcbiAgICAgICAgICAgIHZhciB3cml0ZUxldmVsSW5kZW50ID0gKHRleHQ6IHN0cmluZywgbGV2ZWw6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZXZlbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQgKyBcInwgXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VQcmVvcmRlcjxFeHRlbmRlZEZpbHRlckl0ZW0+KHRoaXMuX3Jvb3QsXHJcbiAgICAgICAgICAgICAgICB4ID0+IE9iamVjdC5rZXlzKHguQ2hpbGRyZW4pLm1hcChrZXkgPT4geC5DaGlsZHJlbltrZXldKSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHdyaXRlTGV2ZWxJbmRlbnQodGV4dCwgbGV2ZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCJ8XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHRoaXMuUHJpbnRGaWx0ZXJJdGVtKGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCIgW1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gYEw6JHtjdXJyZW50LkxldmVsfSBgO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gYEM6JHtjdXJyZW50LkNoaWxkcmVuVG90YWxDb3VudH0gYDtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IGN1cnJlbnQuRmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCA/IGBGQzoke2N1cnJlbnQuRmlsdHJlZENoaWxkcmVuVG90YWxDb3VudH1gIDogXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IFwiXVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCJcXG5cIjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8RXh0ZW5kZWRGaWx0ZXJJdGVtPigpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUHJpbnRGaWx0ZXJJdGVtKGZpbHRlckl0ZW06IEV4dGVuZGVkRmlsdGVySXRlbSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gXCJcIjtcclxuICAgICAgICAgICAgc3dpdGNoIChmaWx0ZXJJdGVtLlR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBGaWx0ZXJUeXBlLkluY2x1ZGVkOlxyXG4gICAgICAgICAgICAgICAgdHlwZSA9IHR5cGUgKyBcIihJKVwiO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRmlsdGVyVHlwZS5FeGNsdWRlZDpcclxuICAgICAgICAgICAgICAgIHR5cGUgPSB0eXBlICsgXCIoRSlcIjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJJdGVtLlVuaXF1ZU5hbWUgKyB0eXBlO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIENyZWF0ZUl0ZW0oaWQ6IHN0cmluZywgcGFyZW50VW5pcXVlTmFtZTogc3RyaW5nLCBjaGlsZHJlbkNvdW50OiBudW1iZXIsIGZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQ6IG51bWJlciwgbGV2ZWw6IG51bWJlcik6IEV4dGVuZGVkRmlsdGVySXRlbSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXh0ZW5kZWRGaWx0ZXJJdGVtKGlkLCBwYXJlbnRVbmlxdWVOYW1lLCBjaGlsZHJlbkNvdW50LCBmaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50LCBsZXZlbCwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBHZXRSb290VHlwZSgpOiBGaWx0ZXJUeXBlIHsgcmV0dXJuIHRoaXMuX3Jvb3QuVHlwZTsgfVxyXG5cclxuICAgICAgICBVcGRhdGVGaWx0ZXJlZENoaWxkcmVuc1RvdGFsQ291bnQoZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCwgbm9kZXNXaXRoVXBkYXRlZENvdW50OiBJTWVtYmVyTm9kZUxvb2t1cCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlV2l0aFVwZGF0ZWRDb3VudHM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBub2Rlc1dpdGhVcGRhdGVkQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2Rlc1dpdGhVcGRhdGVkQ291bnQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2Rlc1dpdGhVcGRhdGVkQ291bnQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5fcm9vdC5BbGxJdGVtc0xvb2t1cFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5GaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50ID0gZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXBba2V5XS5DaGlsZHJlbkNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVdpdGhVcGRhdGVkQ291bnRzLnB1c2goaXRlbS5VbmlxdWVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYCVjTk9ERSBXSVRIIFVQREFURUQgQ09VTlRTOiAke25vZGVXaXRoVXBkYXRlZENvdW50c31gLCBcImJhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiB5ZWxsb3dcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ29udGFpbnModW5pcXVlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuX3Jvb3QuQWxsSXRlbXNMb29rdXBbdW5pcXVlTmFtZV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ2xvbmVCcmFuY2godW5pcXVlTmFtZTogc3RyaW5nLCB3aXRoQ2hpbGRyZW46IGJvb2xlYW4pOiBFeHRlbmRlZEZpbHRlckl0ZW0ge1xyXG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJJdGVtID0gdGhpcy5fcm9vdC5BbGxJdGVtc0xvb2t1cFt1bmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlckl0ZW0uQ2xvbmUod2l0aENoaWxkcmVuKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIElzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJvb3QuQ3VycmVudENoaWxkcmVuQ291bnQgPT09IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZXZlcnRTZWxlY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuUm9vdC5SZXZlcnRTZWxlY3Rpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlZnJlc2goKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHQwID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlUG9zdE9yZGVyPEV4dGVuZGVkRmlsdGVySXRlbT4odGhpcy5Sb290LFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LkNoaWxkcmVuQXJyYXksXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uTW9kZSA9IGN1cnJlbnQuR2V0U2VsZWN0aW9uTW9kZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25Nb2RlICE9PSBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdCA9IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuQ2hhbmdlVGFyZ2V0VHlwZShpc1NlbGVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuUmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5SZWdpc3Rlck9yVW5yZWdpc3RlckluUGFyZW50KGlzU2VsZWN0LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKGBDYWxsIHRvIFJlZnJlc2ggdG9vayAke3QxIC0gdDB9IG1pbGxpc2Vjb25kcy5gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=