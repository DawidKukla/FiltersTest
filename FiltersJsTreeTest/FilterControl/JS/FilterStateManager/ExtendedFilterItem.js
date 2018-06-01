var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var FilterStateManagerModule;
            (function (FilterStateManagerModule) {
                var SelectionMode = FilterStateManagerModule.Common.SelectionMode;
                var FilterType = FilterStateManagerModule.Common.FilterType;
                class ExtendedFilterItem {
                    constructor(uniqueName, parentUniqueName, childrenTotalCount, filtredChildrenTotalCount, level, owner, type, children) {
                        this._filtredChildrenTotalCount = 0;
                        this._childrenTotalCount = 0;
                        this.Children = {};
                        this.Owner = null;
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
                    get ChildrenArray() { return Object.keys(this.Children).map(key => this.Children[key]); }
                    get EffectiveChildrenTotalCount() { return this.Owner.IsFiltred ? this.FiltredChildrenTotalCount : this.ChildrenTotalCount; }
                    ;
                    get ChildrenTotalCount() { return this._childrenTotalCount; }
                    ;
                    set ChildrenTotalCount(value) { this._childrenTotalCount = value; }
                    ;
                    get FiltredChildrenTotalCount() { return this._filtredChildrenTotalCount; }
                    ;
                    set FiltredChildrenTotalCount(value) {
                        this._filtredChildrenTotalCount = value;
                    }
                    ;
                    get Parent() { return this.ParentUniqueName ? this.AllItemsLookup[this.ParentUniqueName] : null; }
                    get CurrentChildrenCount() { return Object.keys(this.Children).length; }
                    get IsLeaf() { return this.CurrentChildrenCount === 0; }
                    AddChild(child, isSelected, isTargetNode) {
                        this.InheritType(child);
                        child.AllItemsLookup = this.AllItemsLookup;
                        child.RegisterOrUnregisterInParent(isSelected, isTargetNode);
                    }
                    InheritType(child) {
                        child.Type = this.Type;
                    }
                    RegisterOrUnregisterInParent(isSelected, isTargetNode) {
                        if (!this.Parent)
                            return;
                        if (!isTargetNode) {
                            this.AddToParent();
                            return;
                        }
                        switch (this.Parent.Type) {
                            case FilterType.Included:
                                if (isSelected) {
                                    this.AddToParent();
                                }
                                else {
                                    this.RemoveFromParent();
                                }
                                break;
                            case FilterType.Excluded:
                                if (isSelected) {
                                    this.RemoveFromParent();
                                }
                                else {
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
                    HandleSelectionChange(isSelected, isTargetNode, affectedNodesSet, autoRefresh) {
                        if (isTargetNode) {
                            this.ChangeTargetType(isSelected);
                            this.MarkWholePathAsAffected(affectedNodesSet);
                        }
                        this.RegisterOrUnregisterInParent(isSelected, isTargetNode);
                        this.RemoveAllChildren();
                        if (!autoRefresh)
                            return;
                        this.TryRefreshUp(affectedNodesSet, autoRefresh);
                    }
                    ChangeTargetType(isSelected) {
                        this.Type = isSelected
                            ? FilterType.Excluded
                            : FilterType.Included;
                    }
                    TryRefreshUp(affectedNodesSet, autoRefresh = true) {
                        if (!this.Parent)
                            return;
                        const mode = this.Parent.GetSelectionMode();
                        if (mode !== SelectionMode.Undetermined) {
                            this.Parent.HandleSelectionChange(mode === SelectionMode.Selected, true, affectedNodesSet, autoRefresh);
                        }
                    }
                    GetSelectionMode() {
                        if (this.EffectiveChildrenTotalCount === -1)
                            return SelectionMode.Undetermined;
                        if (this.EffectiveChildrenTotalCount > 0 && this.EffectiveChildrenTotalCount === this.CurrentChildrenCount && this.CheckAllChidrenAreLeafs()) {
                            return this.Type === FilterType.Included
                                ? SelectionMode.Selected
                                : SelectionMode.Deselected;
                        }
                        else if (this.CurrentChildrenCount === 0) {
                            return this.Type === FilterType.Excluded
                                ? SelectionMode.Selected
                                : SelectionMode.Deselected;
                        }
                        else {
                            return SelectionMode.Undetermined;
                        }
                    }
                    MarkWholePathAsAffected(affectedNodesSet) {
                        affectedNodesSet.Add(this.UniqueName);
                        if (!this.Parent)
                            return;
                        this.Parent.MarkWholePathAsAffected(affectedNodesSet);
                    }
                    CheckAllChidrenAreLeafs() {
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
                    LogTrimmedNode(uniqueName) {
                        console.log(`%c TRIMMED NODE ${uniqueName} `, "background: #222; color: #bada55");
                    }
                    GetSelectionStatus(childUniqueName) {
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
                    Clone(withChildren) {
                        var children = {};
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
                FilterStateManagerModule.ExtendedFilterItem = ExtendedFilterItem;
            })(FilterStateManagerModule = FilterControlModule.FilterStateManagerModule || (FilterControlModule.FilterStateManagerModule = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZW5kZWRGaWx0ZXJJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRXh0ZW5kZWRGaWx0ZXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsT0FBTyxDQStOaEI7QUEvTkQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBK056QjtJQS9OaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0ErTjdDO1FBL04wQixXQUFBLG1CQUFtQjtZQUFDLElBQUEsd0JBQXdCLENBK050RTtZQS9OOEMsV0FBQSx3QkFBd0I7Z0JBRW5FLElBQU8sYUFBYSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQ3JFLElBQU8sVUFBVSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBTS9EO29CQStCSSxZQUFZLFVBQWtCLEVBQzFCLGdCQUF3QixFQUN4QixrQkFBMEIsRUFDMUIseUJBQWlDLEVBQ2pDLEtBQWEsRUFDYixLQUEwQixFQUMxQixJQUFpQixFQUNqQixRQUFvQzt3QkFyQ2hDLCtCQUEwQixHQUFTLENBQUMsQ0FBQzt3QkFDckMsd0JBQW1CLEdBQVMsQ0FBQyxDQUFDO3dCQUs3QixhQUFRLEdBQThCLEVBQUUsQ0FBQzt3QkFFbEQsVUFBSyxHQUFzQixJQUFJLENBQUM7d0JBOEI1QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVU7NEJBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQzt3QkFDN0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO3dCQUMvQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLElBQUksQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcseUJBQXlCLElBQUksQ0FBQyxDQUFDO3dCQUNq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M0QsQ0FBQyxDQUFDLENBQUM7eUJBQ047d0JBQ0QsT0FBTyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDMUssQ0FBQztvQkFFRCxlQUFlO3dCQUNYLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTs0QkFDbkIsS0FBSyxVQUFVLENBQUMsUUFBUTtnQ0FDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO2dDQUNoQyxNQUFNOzRCQUNWLEtBQUssVUFBVSxDQUFDLFFBQVE7Z0NBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztnQ0FDaEMsTUFBTTt5QkFDVDt3QkFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUNqRSxDQUFDO2lCQUNKO2dCQXBOWSwyQ0FBa0IscUJBb045QixDQUFBO1lBRUwsQ0FBQyxFQS9OOEMsd0JBQXdCLEdBQXhCLDRDQUF3QixLQUF4Qiw0Q0FBd0IsUUErTnRFO1FBQUQsQ0FBQyxFQS9OMEIsbUJBQW1CLEdBQW5CLDRCQUFtQixLQUFuQiw0QkFBbUIsUUErTjdDO0lBQUQsQ0FBQyxFQS9OaUIsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUErTnpCO0FBQUQsQ0FBQyxFQS9OUyxPQUFPLEtBQVAsT0FBTyxRQStOaEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ29tYXJjaC5Db250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlck1vZHVsZSB7XHJcbiAgICBpbXBvcnQgQWZmZWN0ZWROb2Rlc1NldCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkFmZmVjdGVkTm9kZXNTZXQ7XHJcbiAgICBpbXBvcnQgU2VsZWN0aW9uTW9kZSA9IEZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5Db21tb24uU2VsZWN0aW9uTW9kZTtcclxuICAgIGltcG9ydCBGaWx0ZXJUeXBlID0gRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5GaWx0ZXJUeXBlO1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUV4dGVuZGVkRmlsdGVySXRlbUxvb2t1cCB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogRXh0ZW5kZWRGaWx0ZXJJdGVtXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEV4dGVuZGVkRmlsdGVySXRlbSB7XHJcbiAgICAgICAgcHJpdmF0ZSBfZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudDogbnVtYmVyPTA7XHJcbiAgICAgICAgcHJpdmF0ZSBfY2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXI9MDtcclxuICAgICAgICBBbGxJdGVtc0xvb2t1cDogSUV4dGVuZGVkRmlsdGVySXRlbUxvb2t1cDtcclxuICAgICAgICBUeXBlOiBGaWx0ZXJUeXBlO1xyXG4gICAgICAgIHJlYWRvbmx5IFBhcmVudFVuaXF1ZU5hbWU6IHN0cmluZztcclxuICAgICAgICByZWFkb25seSBVbmlxdWVOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcmVhZG9ubHkgQ2hpbGRyZW46IElFeHRlbmRlZEZpbHRlckl0ZW1Mb29rdXAgPSB7fTtcclxuICAgICAgICByZWFkb25seSBMZXZlbDogbnVtYmVyO1xyXG4gICAgICAgIE93bmVyOiBJRmlsdGVyU3RhdGVNYW5hZ2VyPW51bGw7XHJcblxyXG4gICAgICAgIGdldCBDaGlsZHJlbkFycmF5KCk6IEV4dGVuZGVkRmlsdGVySXRlbVtdIHsgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuQ2hpbGRyZW4pLm1hcChrZXkgPT4gdGhpcy5DaGlsZHJlbltrZXldKSB9XHJcblxyXG4gICAgICAgIGdldCBFZmZlY3RpdmVDaGlsZHJlblRvdGFsQ291bnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuT3duZXIuSXNGaWx0cmVkID8gdGhpcy5GaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50IDogdGhpcy5DaGlsZHJlblRvdGFsQ291bnQgfTtcclxuXHJcbiAgICAgICAgZ2V0IENoaWxkcmVuVG90YWxDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY2hpbGRyZW5Ub3RhbENvdW50OyB9O1xyXG5cclxuICAgICAgICBzZXQgQ2hpbGRyZW5Ub3RhbENvdW50KHZhbHVlOiBudW1iZXIpIHsgdGhpcy5fY2hpbGRyZW5Ub3RhbENvdW50ID0gdmFsdWU7IH07XHJcblxyXG4gICAgICAgIGdldCBGaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9maWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50OyB9O1xyXG5cclxuICAgICAgICBzZXQgRmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSB2YWx1ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBnZXQgUGFyZW50KCk6IEV4dGVuZGVkRmlsdGVySXRlbSB7IHJldHVybiB0aGlzLlBhcmVudFVuaXF1ZU5hbWUgPyB0aGlzLkFsbEl0ZW1zTG9va3VwW3RoaXMuUGFyZW50VW5pcXVlTmFtZV0gOiBudWxsOyB9XHJcblxyXG4gICAgICAgIGdldCBDdXJyZW50Q2hpbGRyZW5Db3VudCgpOiBudW1iZXIgeyByZXR1cm4gT2JqZWN0LmtleXModGhpcy5DaGlsZHJlbikubGVuZ3RoOyB9XHJcblxyXG4gICAgICAgIGdldCBJc0xlYWYoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLkN1cnJlbnRDaGlsZHJlbkNvdW50ID09PSAwOyB9XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHVuaXF1ZU5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgcGFyZW50VW5pcXVlTmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICBjaGlsZHJlblRvdGFsQ291bnQ6IG51bWJlcixcclxuICAgICAgICAgICAgZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudDogbnVtYmVyLFxyXG4gICAgICAgICAgICBsZXZlbDogbnVtYmVyLFxyXG4gICAgICAgICAgICBvd25lcjogSUZpbHRlclN0YXRlTWFuYWdlcixcclxuICAgICAgICAgICAgdHlwZT86IEZpbHRlclR5cGUsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuPzogSUV4dGVuZGVkRmlsdGVySXRlbUxvb2t1cCkge1xyXG4gICAgICAgICAgICB0aGlzLlVuaXF1ZU5hbWUgPSB1bmlxdWVOYW1lLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5QYXJlbnRVbmlxdWVOYW1lID0gcGFyZW50VW5pcXVlTmFtZTtcclxuICAgICAgICAgICAgdGhpcy5UeXBlID0gdHlwZSB8fCBGaWx0ZXJUeXBlLkluY2x1ZGVkO1xyXG4gICAgICAgICAgICB0aGlzLkNoaWxkcmVuID0gY2hpbGRyZW4gfHwge307XHJcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuVG90YWxDb3VudCA9IGNoaWxkcmVuVG90YWxDb3VudCB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50ID0gZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLkxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgICAgIHRoaXMuT3duZXIgPSBvd25lcjtcclxuICAgICAgICAgICAgdGhpcy5BbGxJdGVtc0xvb2t1cCA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQWRkQ2hpbGQoY2hpbGQ6IEV4dGVuZGVkRmlsdGVySXRlbSwgaXNTZWxlY3RlZDogYm9vbGVhbiwgaXNUYXJnZXROb2RlOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuSW5oZXJpdFR5cGUoY2hpbGQpO1xyXG4gICAgICAgICAgICBjaGlsZC5BbGxJdGVtc0xvb2t1cCA9IHRoaXMuQWxsSXRlbXNMb29rdXA7XHJcbiAgICAgICAgICAgIGNoaWxkLlJlZ2lzdGVyT3JVbnJlZ2lzdGVySW5QYXJlbnQoaXNTZWxlY3RlZCwgaXNUYXJnZXROb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSW5oZXJpdFR5cGUoY2hpbGQ6IEV4dGVuZGVkRmlsdGVySXRlbSkge1xyXG4gICAgICAgICAgICBjaGlsZC5UeXBlID0gdGhpcy5UeXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUmVnaXN0ZXJPclVucmVnaXN0ZXJJblBhcmVudChpc1NlbGVjdGVkOiBib29sZWFuLCBpc1RhcmdldE5vZGU6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLlBhcmVudCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoIWlzVGFyZ2V0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5BZGRUb1BhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5QYXJlbnQuVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEZpbHRlclR5cGUuSW5jbHVkZWQ6XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuQWRkVG9QYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5SZW1vdmVGcm9tUGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBGaWx0ZXJUeXBlLkV4Y2x1ZGVkOlxyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLlJlbW92ZUZyb21QYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5BZGRUb1BhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlbW92ZUZyb21QYXJlbnQoKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLlBhcmVudC5DaGlsZHJlblt0aGlzLlVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5BbGxJdGVtc0xvb2t1cFt0aGlzLlVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICB0aGlzLkxvZ1RyaW1tZWROb2RlKHRoaXMuVW5pcXVlTmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBBZGRUb1BhcmVudCgpIHtcclxuICAgICAgICAgICAgdGhpcy5QYXJlbnQuQ2hpbGRyZW5bdGhpcy5VbmlxdWVOYW1lXSA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuQWxsSXRlbXNMb29rdXBbdGhpcy5VbmlxdWVOYW1lXSA9IHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIYW5kbGVTZWxlY3Rpb25DaGFuZ2UoaXNTZWxlY3RlZDogYm9vbGVhbiwgaXNUYXJnZXROb2RlOiBib29sZWFuLCBhZmZlY3RlZE5vZGVzU2V0OiBBZmZlY3RlZE5vZGVzU2V0LCBhdXRvUmVmcmVzaDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBpZiAoaXNUYXJnZXROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNoYW5nZVRhcmdldFR5cGUoaXNTZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLk1hcmtXaG9sZVBhdGhBc0FmZmVjdGVkKGFmZmVjdGVkTm9kZXNTZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuUmVnaXN0ZXJPclVucmVnaXN0ZXJJblBhcmVudChpc1NlbGVjdGVkLCBpc1RhcmdldE5vZGUpO1xyXG4gICAgICAgICAgICB0aGlzLlJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgIGlmICghYXV0b1JlZnJlc2gpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5UcnlSZWZyZXNoVXAoYWZmZWN0ZWROb2Rlc1NldCwgYXV0b1JlZnJlc2gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ2hhbmdlVGFyZ2V0VHlwZShpc1NlbGVjdGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuVHlwZSA9IGlzU2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgID8gRmlsdGVyVHlwZS5FeGNsdWRlZFxyXG4gICAgICAgICAgICAgICAgOiBGaWx0ZXJUeXBlLkluY2x1ZGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVHJ5UmVmcmVzaFVwKGFmZmVjdGVkTm9kZXNTZXQ6IEFmZmVjdGVkTm9kZXNTZXQsIGF1dG9SZWZyZXNoOiBib29sZWFuPXRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLlBhcmVudCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBtb2RlID0gdGhpcy5QYXJlbnQuR2V0U2VsZWN0aW9uTW9kZSgpO1xyXG4gICAgICAgICAgICBpZiAobW9kZSAhPT0gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuUGFyZW50LkhhbmRsZVNlbGVjdGlvbkNoYW5nZShtb2RlID09PSBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkLCB0cnVlLCBhZmZlY3RlZE5vZGVzU2V0LCBhdXRvUmVmcmVzaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldFNlbGVjdGlvbk1vZGUoKTogU2VsZWN0aW9uTW9kZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLkVmZmVjdGl2ZUNoaWxkcmVuVG90YWxDb3VudCA9PT0gLTEpIHJldHVybiBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuRWZmZWN0aXZlQ2hpbGRyZW5Ub3RhbENvdW50ID4gMCAmJiB0aGlzLkVmZmVjdGl2ZUNoaWxkcmVuVG90YWxDb3VudCA9PT0gdGhpcy5DdXJyZW50Q2hpbGRyZW5Db3VudCAmJiB0aGlzLkNoZWNrQWxsQ2hpZHJlbkFyZUxlYWZzKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLlR5cGUgPT09IEZpbHRlclR5cGUuSW5jbHVkZWRcclxuICAgICAgICAgICAgICAgICAgICA/IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICA6IFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLkN1cnJlbnRDaGlsZHJlbkNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5UeXBlID09PSBGaWx0ZXJUeXBlLkV4Y2x1ZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgPyBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgOiBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTWFya1dob2xlUGF0aEFzQWZmZWN0ZWQoYWZmZWN0ZWROb2Rlc1NldDogQWZmZWN0ZWROb2Rlc1NldCkge1xyXG4gICAgICAgICAgICBhZmZlY3RlZE5vZGVzU2V0LkFkZCh0aGlzLlVuaXF1ZU5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuUGFyZW50KSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuUGFyZW50Lk1hcmtXaG9sZVBhdGhBc0FmZmVjdGVkKGFmZmVjdGVkTm9kZXNTZXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ2hlY2tBbGxDaGlkcmVuQXJlTGVhZnMoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJJdGVtTG9va3VwID0gdGhpcy5DaGlsZHJlbjtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGRLZXkgaW4gZmlsdGVySXRlbUxvb2t1cCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckl0ZW1Mb29rdXAuaGFzT3duUHJvcGVydHkoY2hpbGRLZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBmaWx0ZXJJdGVtTG9va3VwW2NoaWxkS2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkLklzTGVhZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZW1vdmVBbGxDaGlsZHJlbigpIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuQ2hpbGRyZW4pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLkNoaWxkcmVuW2tleXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuUmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLkFsbEl0ZW1zTG9va3VwW2NoaWxkLlVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuQ2hpbGRyZW5bY2hpbGQuVW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLkxvZ1RyaW1tZWROb2RlKGNoaWxkLlVuaXF1ZU5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIExvZ1RyaW1tZWROb2RlKHVuaXF1ZU5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgVFJJTU1FRCBOT0RFICR7dW5pcXVlTmFtZX0gYCwgXCJiYWNrZ3JvdW5kOiAjMjIyOyBjb2xvcjogI2JhZGE1NVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldFNlbGVjdGlvblN0YXR1cyhjaGlsZFVuaXF1ZU5hbWU6IHN0cmluZyk6IFNlbGVjdGlvbk1vZGUge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuQ2hpbGRyZW47XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5bY2hpbGRVbmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkLkN1cnJlbnRDaGlsZHJlbkNvdW50ID4gMCB8fCBjaGlsZCAmJiBjaGlsZC5FZmZlY3RpdmVDaGlsZHJlblRvdGFsQ291bnQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLlR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBGaWx0ZXJUeXBlLkluY2x1ZGVkOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgPyBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgOiBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIGNhc2UgRmlsdGVyVHlwZS5FeGNsdWRlZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgID8gU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgOiBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNlbGVjdGlvbk1vZGUuVW5kZXRlcm1pbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDbG9uZSh3aXRoQ2hpbGRyZW46IGJvb2xlYW4pOiBFeHRlbmRlZEZpbHRlckl0ZW0ge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW46IElFeHRlbmRlZEZpbHRlckl0ZW1Mb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgaWYgKHdpdGhDaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5DaGlsZHJlbkFycmF5LmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuW2NoaWxkLlVuaXF1ZU5hbWVdID0gY2hpbGQuQ2xvbmUod2l0aENoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXh0ZW5kZWRGaWx0ZXJJdGVtKHRoaXMuVW5pcXVlTmFtZSwgdGhpcy5QYXJlbnRVbmlxdWVOYW1lLCB0aGlzLkNoaWxkcmVuVG90YWxDb3VudCwgdGhpcy5GaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50LCB0aGlzLkxldmVsLCBudWxsLCB0aGlzLlR5cGUsIGNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJldmVydFNlbGVjdGlvbigpIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLlR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBGaWx0ZXJUeXBlLkluY2x1ZGVkOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5UeXBlID0gRmlsdGVyVHlwZS5FeGNsdWRlZDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEZpbHRlclR5cGUuRXhjbHVkZWQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLlR5cGUgPSBGaWx0ZXJUeXBlLkluY2x1ZGVkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5DaGlsZHJlbkFycmF5LmZvckVhY2goY2hpbGQgPT4gY2hpbGQuUmV2ZXJ0U2VsZWN0aW9uKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iXX0=