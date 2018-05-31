namespace Comarch.Controls.FilterControlModule.FilterStateManagerModule {
    import AffectedNodesSet = FilterControlModule.Common.AffectedNodesSet;
    import SelectionMode = FilterStateManagerModule.Common.SelectionMode;
    import FilterType = FilterStateManagerModule.Common.FilterType;

    export interface IExtendedFilterItemLookup {
        [key: string]: ExtendedFilterItem
    }

    export class ExtendedFilterItem {
        private _filtredChildrenTotalCount: number=0;
        private _childrenTotalCount: number=0;
        AllItemsLookup: IExtendedFilterItemLookup;
        Type: FilterType;
        readonly ParentUniqueName: string;
        readonly UniqueName: string;
        readonly Children: IExtendedFilterItemLookup = {};
        readonly Level: number;
        Owner: IFilterStateManager=null;

        get ChildrenArray(): ExtendedFilterItem[] { return Object.keys(this.Children).map(key => this.Children[key]) }

        get EffectiveChildrenTotalCount(): number { return this.Owner.IsFiltred ? this.FiltredChildrenTotalCount : this.ChildrenTotalCount };

        get ChildrenTotalCount(): number { return this._childrenTotalCount; };

        set ChildrenTotalCount(value: number) { this._childrenTotalCount = value; };

        get FiltredChildrenTotalCount(): number { return this._filtredChildrenTotalCount; };

        set FiltredChildrenTotalCount(value: number) {
            this._filtredChildrenTotalCount = value;
        };

        get Parent(): ExtendedFilterItem { return this.ParentUniqueName ? this.AllItemsLookup[this.ParentUniqueName] : null; }

        get CurrentChildrenCount(): number { return Object.keys(this.Children).length; }

        get IsLeaf(): boolean { return this.CurrentChildrenCount === 0; }

        constructor(uniqueName: string,
            parentUniqueName: string,
            childrenTotalCount: number,
            filtredChildrenTotalCount: number,
            level: number,
            owner: IFilterStateManager,
            type?: FilterType,
            children?: IExtendedFilterItemLookup) {
            this.UniqueName = uniqueName,
                this.ParentUniqueName = parentUniqueName;
            this.Type = type || FilterType.Included;
            this.Children = children || {};
            this._childrenTotalCount = childrenTotalCount || 0;
            this._filtredChildrenTotalCount = filtredChildrenTotalCount || 0;
            this.Level = level;
            this.Owner = owner;
            this.AllItemsLookup = {};
        }

        AddChild(child: ExtendedFilterItem, isSelected: boolean, isTargetNode: boolean) {
            this.InheritType(child);
            child.AllItemsLookup = this.AllItemsLookup;
            child.RegisterOrUnregisterInParent(isSelected, isTargetNode);
        }

        private InheritType(child: ExtendedFilterItem) {
            child.Type = this.Type;
        }

        RegisterOrUnregisterInParent(isSelected: boolean, isTargetNode: boolean) {
            if (!this.Parent) return;
            if (!isTargetNode) {
                this.AddToParent();
                return;
            }
            switch (this.Parent.Type) {
            case FilterType.Included:
                if (isSelected) {
                    this.AddToParent();
                } else {
                    this.RemoveFromParent();
                }
                break;
            case FilterType.Excluded:
                if (isSelected) {
                    this.RemoveFromParent();
                } else {
                    this.AddToParent();
                }
                break;
            }
        }

        RemoveFromParent() {
            delete this.Parent.Children[this.UniqueName];
            delete this.AllItemsLookup[this.UniqueName];
            this.LogTrimmedNode(this.UniqueName);
        }

        AddToParent() {
            this.Parent.Children[this.UniqueName] = this;
            this.AllItemsLookup[this.UniqueName] = this;
        }

        HandleSelectionChange(isSelected: boolean, isTargetNode: boolean, affectedNodesSet: AffectedNodesSet, autoRefresh: boolean) {
            if (isTargetNode) {
                this.ChangeTargetType(isSelected);
                this.MarkWholePathAsAffected(affectedNodesSet);
            }
            this.RegisterOrUnregisterInParent(isSelected, isTargetNode);
            this.RemoveAllChildren();
            if (!autoRefresh) return;
            this.TryRefreshUp(affectedNodesSet, autoRefresh);
        }

        ChangeTargetType(isSelected: boolean) {
            this.Type = isSelected
                ? FilterType.Excluded
                : FilterType.Included;
        }

        TryRefreshUp(affectedNodesSet: AffectedNodesSet, autoRefresh: boolean=true) {
            if (!this.Parent) return;
            const mode = this.Parent.GetSelectionMode();
            if (mode !== SelectionMode.Undetermined) {
                this.Parent.HandleSelectionChange(mode === SelectionMode.Selected, true, affectedNodesSet, autoRefresh);
            }
        }

        GetSelectionMode(): SelectionMode {
            if (this.EffectiveChildrenTotalCount === -1) return SelectionMode.Undetermined;
            if (this.EffectiveChildrenTotalCount > 0 && this.EffectiveChildrenTotalCount === this.CurrentChildrenCount && this.CheckAllChidrenAreLeafs()) {
                return this.Type === FilterType.Included
                    ? SelectionMode.Selected
                    : SelectionMode.Deselected;
            } else if (this.CurrentChildrenCount === 0) {
                return this.Type === FilterType.Excluded
                    ? SelectionMode.Selected
                    : SelectionMode.Deselected;
            } else {
                return SelectionMode.Undetermined;
            }
        }

        private MarkWholePathAsAffected(affectedNodesSet: AffectedNodesSet) {
            affectedNodesSet.Add(this.UniqueName);
            if (!this.Parent) return;
            this.Parent.MarkWholePathAsAffected(affectedNodesSet);
        }

        CheckAllChidrenAreLeafs(): boolean {
            let result = true;
            const filterItemLookup = this.Children;
            for (let childKey in filterItemLookup) {
                if (filterItemLookup.hasOwnProperty(childKey)) {
                    const child = filterItemLookup[childKey];
                    if (!child.IsLeaf) {
                        result = false;
                        break;
                    }
                }
            }
            return result;
        }

        RemoveAllChildren() {
            const keys = Object.keys(this.Children);
            for (let i = keys.length - 1; i >= 0; i--) {
                const child = this.Children[keys[i]];
                child.RemoveAllChildren();
                delete this.AllItemsLookup[child.UniqueName];
                delete this.Children[child.UniqueName];
                this.LogTrimmedNode(child.UniqueName);
            }
        }

        private LogTrimmedNode(uniqueName: string) {
            console.log(`%c TRIMMED NODE ${uniqueName} `, "background: #222; color: #bada55");
        }

        GetSelectionStatus(childUniqueName: string): SelectionMode {
            const children = this.Children;
            const child = children[childUniqueName];
            if (child && child.CurrentChildrenCount > 0 || child && child.EffectiveChildrenTotalCount === -1) {
                return SelectionMode.Undetermined;
            }
            switch (this.Type) {
            case FilterType.Included:
                return child
                    ? SelectionMode.Selected
                    : SelectionMode.Deselected;
            case FilterType.Excluded:
                return child
                    ? SelectionMode.Deselected
                    : SelectionMode.Selected;
            default:
                return SelectionMode.Undetermined;
            }
        }

        Clone(withChildren: boolean): ExtendedFilterItem {
            var children: IExtendedFilterItemLookup = {};
            if (withChildren) {
                this.ChildrenArray.forEach(child => {
                    children[child.UniqueName] = child.Clone(withChildren);
                });
            }
            return new ExtendedFilterItem(this.UniqueName, this.ParentUniqueName, this.ChildrenTotalCount, this.FiltredChildrenTotalCount, this.Level, null, this.Type, children);
        }

        RevertSelection() {
            switch (this.Type) {
            case FilterType.Included:
                this.Type = FilterType.Excluded;
                break;
            case FilterType.Excluded:
                this.Type = FilterType.Included;
                break;
            }
            this.ChildrenArray.forEach(child => child.RevertSelection());
        }
    }

}