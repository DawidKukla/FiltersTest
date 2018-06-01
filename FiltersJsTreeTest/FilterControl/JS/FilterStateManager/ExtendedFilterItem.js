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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZW5kZWRGaWx0ZXJJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRXh0ZW5kZWRGaWx0ZXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsT0FBTyxDQStOaEI7QUEvTkQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBK056QjtJQS9OaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0ErTjdDO1FBL04wQixXQUFBLG1CQUFtQjtZQUFDLElBQUEsd0JBQXdCLENBK050RTtZQS9OOEMsV0FBQSx3QkFBd0I7Z0JBRW5FLElBQU8sYUFBYSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQ3JFLElBQU8sVUFBVSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBTS9EO29CQStCSSxZQUFZLFVBQWtCLEVBQzFCLGdCQUF3QixFQUN4QixrQkFBMEIsRUFDMUIseUJBQWlDLEVBQ2pDLEtBQWEsRUFDYixLQUEwQixFQUMxQixJQUFpQixFQUNqQixRQUFvQzt3QkFyQ2hDLCtCQUEwQixHQUFTLENBQUMsQ0FBQzt3QkFDckMsd0JBQW1CLEdBQVMsQ0FBQyxDQUFDO3dCQUs3QixhQUFRLEdBQThCLEVBQUUsQ0FBQzt3QkFFbEQsVUFBSyxHQUFzQixJQUFJLENBQUM7d0JBOEI1QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVU7NEJBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQzt3QkFDN0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO3dCQUMvQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLElBQUksQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcseUJBQXlCLElBQUksQ0FBQyxDQUFDO3dCQUNq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QUFJLENBQUMsQ0FBQyxDQUFDOzRCQUNwQixLQUFLLFVBQVUsQ0FBQyxRQUFRO2dDQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7Z0NBQ2hDLEtBQUssQ0FBQzs0QkFDVixLQUFLLFVBQVUsQ0FBQyxRQUFRO2dDQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7Z0NBQ2hDLEtBQUssQ0FBQzt3QkFDVixDQUFDO3dCQUNELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQ2pFLENBQUM7aUJBQ0o7Z0JBcE5ZLDJDQUFrQixxQkFvTjlCLENBQUE7WUFFTCxDQUFDLEVBL044Qyx3QkFBd0IsR0FBeEIsNENBQXdCLEtBQXhCLDRDQUF3QixRQStOdEU7UUFBRCxDQUFDLEVBL04wQixtQkFBbUIsR0FBbkIsNEJBQW1CLEtBQW5CLDRCQUFtQixRQStON0M7SUFBRCxDQUFDLEVBL05pQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQStOekI7QUFBRCxDQUFDLEVBL05TLE9BQU8sS0FBUCxPQUFPLFFBK05oQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlIHtcclxuICAgIGltcG9ydCBBZmZlY3RlZE5vZGVzU2V0ID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uQWZmZWN0ZWROb2Rlc1NldDtcclxuICAgIGltcG9ydCBTZWxlY3Rpb25Nb2RlID0gRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5TZWxlY3Rpb25Nb2RlO1xyXG4gICAgaW1wb3J0IEZpbHRlclR5cGUgPSBGaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuQ29tbW9uLkZpbHRlclR5cGU7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRXh0ZW5kZWRGaWx0ZXJJdGVtTG9va3VwIHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBFeHRlbmRlZEZpbHRlckl0ZW1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRXh0ZW5kZWRGaWx0ZXJJdGVtIHtcclxuICAgICAgICBwcml2YXRlIF9maWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXI9MDtcclxuICAgICAgICBwcml2YXRlIF9jaGlsZHJlblRvdGFsQ291bnQ6IG51bWJlcj0wO1xyXG4gICAgICAgIEFsbEl0ZW1zTG9va3VwOiBJRXh0ZW5kZWRGaWx0ZXJJdGVtTG9va3VwO1xyXG4gICAgICAgIFR5cGU6IEZpbHRlclR5cGU7XHJcbiAgICAgICAgcmVhZG9ubHkgUGFyZW50VW5pcXVlTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHJlYWRvbmx5IFVuaXF1ZU5hbWU6IHN0cmluZztcclxuICAgICAgICByZWFkb25seSBDaGlsZHJlbjogSUV4dGVuZGVkRmlsdGVySXRlbUxvb2t1cCA9IHt9O1xyXG4gICAgICAgIHJlYWRvbmx5IExldmVsOiBudW1iZXI7XHJcbiAgICAgICAgT3duZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXI9bnVsbDtcclxuXHJcbiAgICAgICAgZ2V0IENoaWxkcmVuQXJyYXkoKTogRXh0ZW5kZWRGaWx0ZXJJdGVtW10geyByZXR1cm4gT2JqZWN0LmtleXModGhpcy5DaGlsZHJlbikubWFwKGtleSA9PiB0aGlzLkNoaWxkcmVuW2tleV0pIH1cclxuXHJcbiAgICAgICAgZ2V0IEVmZmVjdGl2ZUNoaWxkcmVuVG90YWxDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5Pd25lci5Jc0ZpbHRyZWQgPyB0aGlzLkZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgOiB0aGlzLkNoaWxkcmVuVG90YWxDb3VudCB9O1xyXG5cclxuICAgICAgICBnZXQgQ2hpbGRyZW5Ub3RhbENvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9jaGlsZHJlblRvdGFsQ291bnQ7IH07XHJcblxyXG4gICAgICAgIHNldCBDaGlsZHJlblRvdGFsQ291bnQodmFsdWU6IG51bWJlcikgeyB0aGlzLl9jaGlsZHJlblRvdGFsQ291bnQgPSB2YWx1ZTsgfTtcclxuXHJcbiAgICAgICAgZ2V0IEZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2ZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQ7IH07XHJcblxyXG4gICAgICAgIHNldCBGaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50KHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCA9IHZhbHVlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdldCBQYXJlbnQoKTogRXh0ZW5kZWRGaWx0ZXJJdGVtIHsgcmV0dXJuIHRoaXMuUGFyZW50VW5pcXVlTmFtZSA/IHRoaXMuQWxsSXRlbXNMb29rdXBbdGhpcy5QYXJlbnRVbmlxdWVOYW1lXSA6IG51bGw7IH1cclxuXHJcbiAgICAgICAgZ2V0IEN1cnJlbnRDaGlsZHJlbkNvdW50KCk6IG51bWJlciB7IHJldHVybiBPYmplY3Qua2V5cyh0aGlzLkNoaWxkcmVuKS5sZW5ndGg7IH1cclxuXHJcbiAgICAgICAgZ2V0IElzTGVhZigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuQ3VycmVudENoaWxkcmVuQ291bnQgPT09IDA7IH1cclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IodW5pcXVlTmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICBwYXJlbnRVbmlxdWVOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuVG90YWxDb3VudDogbnVtYmVyLFxyXG4gICAgICAgICAgICBmaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXIsXHJcbiAgICAgICAgICAgIGxldmVsOiBudW1iZXIsXHJcbiAgICAgICAgICAgIG93bmVyOiBJRmlsdGVyU3RhdGVNYW5hZ2VyLFxyXG4gICAgICAgICAgICB0eXBlPzogRmlsdGVyVHlwZSxcclxuICAgICAgICAgICAgY2hpbGRyZW4/OiBJRXh0ZW5kZWRGaWx0ZXJJdGVtTG9va3VwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuVW5pcXVlTmFtZSA9IHVuaXF1ZU5hbWUsXHJcbiAgICAgICAgICAgICAgICB0aGlzLlBhcmVudFVuaXF1ZU5hbWUgPSBwYXJlbnRVbmlxdWVOYW1lO1xyXG4gICAgICAgICAgICB0aGlzLlR5cGUgPSB0eXBlIHx8IEZpbHRlclR5cGUuSW5jbHVkZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuQ2hpbGRyZW4gPSBjaGlsZHJlbiB8fCB7fTtcclxuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5Ub3RhbENvdW50ID0gY2hpbGRyZW5Ub3RhbENvdW50IHx8IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSBmaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50IHx8IDA7XHJcbiAgICAgICAgICAgIHRoaXMuTGV2ZWwgPSBsZXZlbDtcclxuICAgICAgICAgICAgdGhpcy5Pd25lciA9IG93bmVyO1xyXG4gICAgICAgICAgICB0aGlzLkFsbEl0ZW1zTG9va3VwID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBBZGRDaGlsZChjaGlsZDogRXh0ZW5kZWRGaWx0ZXJJdGVtLCBpc1NlbGVjdGVkOiBib29sZWFuLCBpc1RhcmdldE5vZGU6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5Jbmhlcml0VHlwZShjaGlsZCk7XHJcbiAgICAgICAgICAgIGNoaWxkLkFsbEl0ZW1zTG9va3VwID0gdGhpcy5BbGxJdGVtc0xvb2t1cDtcclxuICAgICAgICAgICAgY2hpbGQuUmVnaXN0ZXJPclVucmVnaXN0ZXJJblBhcmVudChpc1NlbGVjdGVkLCBpc1RhcmdldE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJbmhlcml0VHlwZShjaGlsZDogRXh0ZW5kZWRGaWx0ZXJJdGVtKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLlR5cGUgPSB0aGlzLlR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZWdpc3Rlck9yVW5yZWdpc3RlckluUGFyZW50KGlzU2VsZWN0ZWQ6IGJvb2xlYW4sIGlzVGFyZ2V0Tm9kZTogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuUGFyZW50KSByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICghaXNUYXJnZXROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFkZFRvUGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLlBhcmVudC5UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRmlsdGVyVHlwZS5JbmNsdWRlZDpcclxuICAgICAgICAgICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5BZGRUb1BhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLlJlbW92ZUZyb21QYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEZpbHRlclR5cGUuRXhjbHVkZWQ6XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuUmVtb3ZlRnJvbVBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkFkZFRvUGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUmVtb3ZlRnJvbVBhcmVudCgpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuUGFyZW50LkNoaWxkcmVuW3RoaXMuVW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLkFsbEl0ZW1zTG9va3VwW3RoaXMuVW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgIHRoaXMuTG9nVHJpbW1lZE5vZGUodGhpcy5VbmlxdWVOYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEFkZFRvUGFyZW50KCkge1xyXG4gICAgICAgICAgICB0aGlzLlBhcmVudC5DaGlsZHJlblt0aGlzLlVuaXF1ZU5hbWVdID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5BbGxJdGVtc0xvb2t1cFt0aGlzLlVuaXF1ZU5hbWVdID0gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEhhbmRsZVNlbGVjdGlvbkNoYW5nZShpc1NlbGVjdGVkOiBib29sZWFuLCBpc1RhcmdldE5vZGU6IGJvb2xlYW4sIGFmZmVjdGVkTm9kZXNTZXQ6IEFmZmVjdGVkTm9kZXNTZXQsIGF1dG9SZWZyZXNoOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1RhcmdldE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQ2hhbmdlVGFyZ2V0VHlwZShpc1NlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuTWFya1dob2xlUGF0aEFzQWZmZWN0ZWQoYWZmZWN0ZWROb2Rlc1NldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5SZWdpc3Rlck9yVW5yZWdpc3RlckluUGFyZW50KGlzU2VsZWN0ZWQsIGlzVGFyZ2V0Tm9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuUmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgaWYgKCFhdXRvUmVmcmVzaCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLlRyeVJlZnJlc2hVcChhZmZlY3RlZE5vZGVzU2V0LCBhdXRvUmVmcmVzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDaGFuZ2VUYXJnZXRUeXBlKGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5UeXBlID0gaXNTZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgPyBGaWx0ZXJUeXBlLkV4Y2x1ZGVkXHJcbiAgICAgICAgICAgICAgICA6IEZpbHRlclR5cGUuSW5jbHVkZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBUcnlSZWZyZXNoVXAoYWZmZWN0ZWROb2Rlc1NldDogQWZmZWN0ZWROb2Rlc1NldCwgYXV0b1JlZnJlc2g6IGJvb2xlYW49dHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuUGFyZW50KSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IG1vZGUgPSB0aGlzLlBhcmVudC5HZXRTZWxlY3Rpb25Nb2RlKCk7XHJcbiAgICAgICAgICAgIGlmIChtb2RlICE9PSBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5QYXJlbnQuSGFuZGxlU2VsZWN0aW9uQ2hhbmdlKG1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQsIHRydWUsIGFmZmVjdGVkTm9kZXNTZXQsIGF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgR2V0U2VsZWN0aW9uTW9kZSgpOiBTZWxlY3Rpb25Nb2RlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuRWZmZWN0aXZlQ2hpbGRyZW5Ub3RhbENvdW50ID09PSAtMSkgcmV0dXJuIFNlbGVjdGlvbk1vZGUuVW5kZXRlcm1pbmVkO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5FZmZlY3RpdmVDaGlsZHJlblRvdGFsQ291bnQgPiAwICYmIHRoaXMuRWZmZWN0aXZlQ2hpbGRyZW5Ub3RhbENvdW50ID09PSB0aGlzLkN1cnJlbnRDaGlsZHJlbkNvdW50ICYmIHRoaXMuQ2hlY2tBbGxDaGlkcmVuQXJlTGVhZnMoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuVHlwZSA9PT0gRmlsdGVyVHlwZS5JbmNsdWRlZFxyXG4gICAgICAgICAgICAgICAgICAgID8gU2VsZWN0aW9uTW9kZS5TZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgICAgIDogU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuQ3VycmVudENoaWxkcmVuQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLlR5cGUgPT09IEZpbHRlclR5cGUuRXhjbHVkZWRcclxuICAgICAgICAgICAgICAgICAgICA/IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICA6IFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBNYXJrV2hvbGVQYXRoQXNBZmZlY3RlZChhZmZlY3RlZE5vZGVzU2V0OiBBZmZlY3RlZE5vZGVzU2V0KSB7XHJcbiAgICAgICAgICAgIGFmZmVjdGVkTm9kZXNTZXQuQWRkKHRoaXMuVW5pcXVlTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5QYXJlbnQpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5QYXJlbnQuTWFya1dob2xlUGF0aEFzQWZmZWN0ZWQoYWZmZWN0ZWROb2Rlc1NldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDaGVja0FsbENoaWRyZW5BcmVMZWFmcygpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckl0ZW1Mb29rdXAgPSB0aGlzLkNoaWxkcmVuO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZEtleSBpbiBmaWx0ZXJJdGVtTG9va3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVySXRlbUxvb2t1cC5oYXNPd25Qcm9wZXJ0eShjaGlsZEtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGZpbHRlckl0ZW1Mb29rdXBbY2hpbGRLZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY2hpbGQuSXNMZWFmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlbW92ZUFsbENoaWxkcmVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5DaGlsZHJlbik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBrZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMuQ2hpbGRyZW5ba2V5c1tpXV07XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5SZW1vdmVBbGxDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuQWxsSXRlbXNMb29rdXBbY2hpbGQuVW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5DaGlsZHJlbltjaGlsZC5VbmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuTG9nVHJpbW1lZE5vZGUoY2hpbGQuVW5pcXVlTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTG9nVHJpbW1lZE5vZGUodW5pcXVlTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyBUUklNTUVEIE5PREUgJHt1bmlxdWVOYW1lfSBgLCBcImJhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjYmFkYTU1XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgR2V0U2VsZWN0aW9uU3RhdHVzKGNoaWxkVW5pcXVlTmFtZTogc3RyaW5nKTogU2VsZWN0aW9uTW9kZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5DaGlsZHJlbjtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltjaGlsZFVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQuQ3VycmVudENoaWxkcmVuQ291bnQgPiAwIHx8IGNoaWxkICYmIGNoaWxkLkVmZmVjdGl2ZUNoaWxkcmVuVG90YWxDb3VudCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEZpbHRlclR5cGUuSW5jbHVkZWQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICA/IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICA6IFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZDtcclxuICAgICAgICAgICAgY2FzZSBGaWx0ZXJUeXBlLkV4Y2x1ZGVkOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgPyBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICA6IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENsb25lKHdpdGhDaGlsZHJlbjogYm9vbGVhbik6IEV4dGVuZGVkRmlsdGVySXRlbSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbjogSUV4dGVuZGVkRmlsdGVySXRlbUxvb2t1cCA9IHt9O1xyXG4gICAgICAgICAgICBpZiAod2l0aENoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNoaWxkcmVuQXJyYXkuZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5bY2hpbGQuVW5pcXVlTmFtZV0gPSBjaGlsZC5DbG9uZSh3aXRoQ2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBFeHRlbmRlZEZpbHRlckl0ZW0odGhpcy5VbmlxdWVOYW1lLCB0aGlzLlBhcmVudFVuaXF1ZU5hbWUsIHRoaXMuQ2hpbGRyZW5Ub3RhbENvdW50LCB0aGlzLkZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQsIHRoaXMuTGV2ZWwsIG51bGwsIHRoaXMuVHlwZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUmV2ZXJ0U2VsZWN0aW9uKCkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEZpbHRlclR5cGUuSW5jbHVkZWQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLlR5cGUgPSBGaWx0ZXJUeXBlLkV4Y2x1ZGVkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRmlsdGVyVHlwZS5FeGNsdWRlZDpcclxuICAgICAgICAgICAgICAgIHRoaXMuVHlwZSA9IEZpbHRlclR5cGUuSW5jbHVkZWQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLkNoaWxkcmVuQXJyYXkuZm9yRWFjaChjaGlsZCA9PiBjaGlsZC5SZXZlcnRTZWxlY3Rpb24oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSJdfQ==