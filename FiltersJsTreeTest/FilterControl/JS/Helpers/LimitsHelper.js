var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var Helpers;
            (function (Helpers) {
                var TreeHelpers = Comarch.Utils.TreeUtils.TreeHelpers;
                var ForwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
                class LimitsHelperFactory {
                    Create(owner, maxTotalElementsCount, allMembersTotalCount) {
                        return new LimitsHelper(owner, maxTotalElementsCount, allMembersTotalCount);
                    }
                }
                Helpers.LimitsHelperFactory = LimitsHelperFactory;
                class LimitsHelper {
                    constructor(owner, maxTotalElementsCount, allMembersTotalCount) {
                        this._maxTotalElementsCount = 0;
                        this._owner = null;
                        this._loadedElementsCount = 0;
                        this._maxTotalElementsCount = maxTotalElementsCount;
                        this._owner = owner;
                        this._allMembersTotalCount = allMembersTotalCount;
                    }
                    get LoadedElementsCount() { return this._loadedElementsCount; }
                    set LoadedElementsCount(value) {
                        this._loadedElementsCount = value;
                        this._owner.UpdateTotalElementsLoadedCount(this.GetTotalElementsMessage(value));
                    }
                    GetTotalElementsMessage(count) {
                        this._loadedElementsCount = count;
                        let text;
                        if (this._owner.IsInFilterMode) {
                            text = `(${this._loadedElementsCount}/*)`;
                        }
                        else {
                            text = `(${this._loadedElementsCount}/${this._allMembersTotalCount})`;
                        }
                        return text;
                    }
                    EnforceLimits(loadedNodes) {
                        const info = this.GetElementsToRemoveInfo(loadedNodes);
                        this.RemoveElements(loadedNodes, info.ElementsOverLimit);
                        return this.UpdateLimits(info.CurrentRequestOnlyItemsCounter, info.ElementsOverLimit);
                    }
                    UpdateLimits(currentRequestCounter, elementsToRemove) {
                        const elementsCountAfterLoad = this._loadedElementsCount + currentRequestCounter;
                        if (elementsCountAfterLoad === this._allMembersTotalCount) {
                            this.LoadedElementsCount = elementsCountAfterLoad;
                            this._owner.HideNotAllElementsAreVisible();
                            return true;
                        }
                        else {
                            if (elementsCountAfterLoad < this._maxTotalElementsCount) {
                                this.LoadedElementsCount = elementsCountAfterLoad;
                                this._owner.ShowNotAllElementsAreVisible();
                                return true;
                            }
                            else {
                                this.LoadedElementsCount = elementsCountAfterLoad - Object.keys(elementsToRemove).length;
                                return false;
                            }
                        }
                    }
                    RemoveElements(loadedNodes, elementsToRemove) {
                        TreeHelpers.TraverseListPreorder(loadedNodes, x => x.children, (current, parent, level, index) => {
                            if (elementsToRemove[current.id]) {
                                const children = parent ? parent.children : loadedNodes;
                                children.splice(index, 1);
                            }
                            return true;
                        });
                    }
                    GetElementsToRemoveInfo(loadedNodes) {
                        var currentRequestCounter = 0;
                        var elementsToRemove = {};
                        TreeHelpers.TraverseListPreorder(loadedNodes, x => x.children, (current) => {
                            if (!this._owner.GetTreeNode(current.id)) {
                                currentRequestCounter++;
                                if (this._loadedElementsCount + currentRequestCounter > this._maxTotalElementsCount) {
                                    elementsToRemove[current.id] = true;
                                }
                            }
                            return true;
                        }, new ForwardTreeTraversalIteratorFactory());
                        return { ElementsOverLimit: elementsToRemove, CurrentRequestOnlyItemsCounter: currentRequestCounter };
                    }
                }
                Helpers.LimitsHelper = LimitsHelper;
            })(Helpers = FilterControlModule.Helpers || (FilterControlModule.Helpers = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGltaXRzSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTGltaXRzSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsT0FBTyxDQXFIaEI7QUFySEQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBcUh6QjtJQXJIaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0FxSDdDO1FBckgwQixXQUFBLG1CQUFtQjtZQUFDLElBQUEsT0FBTyxDQXFIckQ7WUFySDhDLFdBQUEsT0FBTztnQkFFbEQsSUFBTyxXQUFXLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDakQsSUFBTyxtQ0FBbUMsR0FBRyxRQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUM7Z0JBTWpHO29CQUNJLE1BQU0sQ0FBQyxLQUF5QixFQUFFLHFCQUE2QixFQUFFLG9CQUE0Qjt3QkFDekYsT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztvQkFDaEYsQ0FBQztpQkFDSjtnQkFKWSwyQkFBbUIsc0JBSS9CLENBQUE7Z0JBZUQ7b0JBYUksWUFBWSxLQUF5QixFQUFFLHFCQUE2QixFQUFFLG9CQUE0Qjt3QkFYMUYsMkJBQXNCLEdBQVMsQ0FBQyxDQUFDO3dCQUNqQyxXQUFNLEdBQXFCLElBQUksQ0FBQzt3QkFDaEMseUJBQW9CLEdBQVMsQ0FBQyxDQUFDO3dCQVVuQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcscUJBQXFCLENBQUM7d0JBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO3dCQUNwQixJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7b0JBQ3RELENBQUM7b0JBWEQsSUFBSSxtQkFBbUIsS0FBYSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7b0JBRXZFLElBQUksbUJBQW1CLENBQUMsS0FBYTt3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LEVBQ2hDLENBQUMsT0FBTyxFQUFFLEVBQUU7NEJBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQ0FDdEMscUJBQXFCLEVBQUUsQ0FBQztnQ0FDeEIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEdBQUcscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFO29DQUNqRixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO2lDQUN2Qzs2QkFDSjs0QkFDRCxPQUFPLElBQUksQ0FBQzt3QkFDaEIsQ0FBQyxFQUNELElBQUksbUNBQW1DLEVBQUUsQ0FBQyxDQUFDO3dCQUMvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUMsZ0JBQWdCLEVBQUUsOEJBQThCLEVBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDeEcsQ0FBQztpQkFDSjtnQkF0Rlksb0JBQVksZUFzRnhCLENBQUE7WUFHTCxDQUFDLEVBckg4QyxPQUFPLEdBQVAsMkJBQU8sS0FBUCwyQkFBTyxRQXFIckQ7UUFBRCxDQUFDLEVBckgwQixtQkFBbUIsR0FBbkIsNEJBQW1CLEtBQW5CLDRCQUFtQixRQXFIN0M7SUFBRCxDQUFDLEVBckhpQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQXFIekI7QUFBRCxDQUFDLEVBckhTLE9BQU8sS0FBUCxPQUFPLFFBcUhoQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuSGVscGVycyB7XHJcbiAgICBpbXBvcnQgSU1lbWJlck5vZGUgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JTWVtYmVyTm9kZTtcclxuICAgIGltcG9ydCBUcmVlSGVscGVycyA9IFV0aWxzLlRyZWVVdGlscy5UcmVlSGVscGVycztcclxuICAgIGltcG9ydCBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSA9IFV0aWxzLlRyZWVVdGlscy5Gb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElMaW1pdHNIZWxwZXJGYWN0b3J5IHtcclxuICAgICAgICBDcmVhdGUob3duZXI6IElMaW1pdHNIZWxwZXJPd25lciwgbWF4VG90YWxFbGVtZW50c0NvdW50OiBudW1iZXIsIGFsbE1lbWJlcnNUb3RhbENvdW50OiBudW1iZXIpOiBJTGltaXRzSGVscGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBMaW1pdHNIZWxwZXJGYWN0b3J5IGltcGxlbWVudHMgSUxpbWl0c0hlbHBlckZhY3Rvcnkge1xyXG4gICAgICAgIENyZWF0ZShvd25lcjogSUxpbWl0c0hlbHBlck93bmVyLCBtYXhUb3RhbEVsZW1lbnRzQ291bnQ6IG51bWJlciwgYWxsTWVtYmVyc1RvdGFsQ291bnQ6IG51bWJlcik6IElMaW1pdHNIZWxwZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IExpbWl0c0hlbHBlcihvd25lciwgbWF4VG90YWxFbGVtZW50c0NvdW50LCBhbGxNZW1iZXJzVG90YWxDb3VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUxpbWl0c0hlbHBlck93bmVyIHtcclxuICAgICAgICBHZXRUcmVlTm9kZShpZDogc3RyaW5nKTogSU1lbWJlck5vZGU7XHJcbiAgICAgICAgSGlkZU5vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpO1xyXG4gICAgICAgIFVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCh0ZXh0OiBzdHJpbmcpO1xyXG4gICAgICAgIFNob3dOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKTtcclxuICAgICAgICBJc0luRmlsdGVyTW9kZTogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElMaW1pdHNIZWxwZXIge1xyXG4gICAgICAgIExvYWRlZEVsZW1lbnRzQ291bnQ6IG51bWJlcjtcclxuICAgICAgICBFbmZvcmNlTGltaXRzKG5vZGVzVG9Mb2FkOiBJTWVtYmVyTm9kZVtdKTogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTGltaXRzSGVscGVyIGltcGxlbWVudHMgSUxpbWl0c0hlbHBlciB7XHJcbiAgICAgICAgcHJpdmF0ZSBfYWxsTWVtYmVyc1RvdGFsQ291bnQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIF9tYXhUb3RhbEVsZW1lbnRzQ291bnQ6IG51bWJlcj0wO1xyXG4gICAgICAgIHByaXZhdGUgX293bmVyOiBJTGltaXRzSGVscGVyT3duZXI9bnVsbDtcclxuICAgICAgICBwcml2YXRlIF9sb2FkZWRFbGVtZW50c0NvdW50OiBudW1iZXI9MDtcclxuXHJcbiAgICAgICAgZ2V0IExvYWRlZEVsZW1lbnRzQ291bnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2xvYWRlZEVsZW1lbnRzQ291bnQ7IH1cclxuXHJcbiAgICAgICAgc2V0IExvYWRlZEVsZW1lbnRzQ291bnQodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX293bmVyLlVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCh0aGlzLkdldFRvdGFsRWxlbWVudHNNZXNzYWdlKHZhbHVlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihvd25lcjogSUxpbWl0c0hlbHBlck93bmVyLCBtYXhUb3RhbEVsZW1lbnRzQ291bnQ6IG51bWJlciwgYWxsTWVtYmVyc1RvdGFsQ291bnQ6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9tYXhUb3RhbEVsZW1lbnRzQ291bnQgPSBtYXhUb3RhbEVsZW1lbnRzQ291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX293bmVyID0gb3duZXI7XHJcbiAgICAgICAgICAgIHRoaXMuX2FsbE1lbWJlcnNUb3RhbENvdW50ID0gYWxsTWVtYmVyc1RvdGFsQ291bnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEdldFRvdGFsRWxlbWVudHNNZXNzYWdlKGNvdW50OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudCA9IGNvdW50O1xyXG4gICAgICAgICAgICBsZXQgdGV4dDogc3RyaW5nO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXIuSXNJbkZpbHRlck1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgKCR7dGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudH0vKilgO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGV4dCA9IGAoJHt0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50fS8ke3RoaXMuX2FsbE1lbWJlcnNUb3RhbENvdW50fSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRW5mb3JjZUxpbWl0cyhsb2FkZWROb2RlczogSU1lbWJlck5vZGVbXSk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5HZXRFbGVtZW50c1RvUmVtb3ZlSW5mbyhsb2FkZWROb2Rlcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLlJlbW92ZUVsZW1lbnRzKGxvYWRlZE5vZGVzLCBpbmZvLkVsZW1lbnRzT3ZlckxpbWl0KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlVwZGF0ZUxpbWl0cyhpbmZvLkN1cnJlbnRSZXF1ZXN0T25seUl0ZW1zQ291bnRlciwgaW5mby5FbGVtZW50c092ZXJMaW1pdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFVwZGF0ZUxpbWl0cyhjdXJyZW50UmVxdWVzdENvdW50ZXI6IG51bWJlciwgZWxlbWVudHNUb1JlbW92ZTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuOyB9KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzQ291bnRBZnRlckxvYWQgPSB0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50ICsgY3VycmVudFJlcXVlc3RDb3VudGVyO1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudHNDb3VudEFmdGVyTG9hZCA9PT0gdGhpcy5fYWxsTWVtYmVyc1RvdGFsQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuTG9hZGVkRWxlbWVudHNDb3VudCA9IGVsZW1lbnRzQ291bnRBZnRlckxvYWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vd25lci5IaWRlTm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c0NvdW50QWZ0ZXJMb2FkIDwgdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5Mb2FkZWRFbGVtZW50c0NvdW50ID0gZWxlbWVudHNDb3VudEFmdGVyTG9hZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vd25lci5TaG93Tm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9hZGVkRWxlbWVudHNDb3VudCA9IGVsZW1lbnRzQ291bnRBZnRlckxvYWQgLSBPYmplY3Qua2V5cyhlbGVtZW50c1RvUmVtb3ZlKS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBSZW1vdmVFbGVtZW50cyhsb2FkZWROb2RlczogSU1lbWJlck5vZGVbXSwgZWxlbWVudHNUb1JlbW92ZTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuOyB9KSB7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyKGxvYWRlZE5vZGVzLFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNUb1JlbW92ZVtjdXJyZW50LmlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHBhcmVudCA/IHBhcmVudC5jaGlsZHJlbiA6IGxvYWRlZE5vZGVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRFbGVtZW50c1RvUmVtb3ZlSW5mbyhsb2FkZWROb2RlczogSU1lbWJlck5vZGVbXSkge1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudFJlcXVlc3RDb3VudGVyID0gMDtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzVG9SZW1vdmU6IHtba2V5OiBzdHJpbmddOiBib29sZWFuO30gPSB7fTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXIobG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9vd25lci5HZXRUcmVlTm9kZShjdXJyZW50LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdENvdW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRlZEVsZW1lbnRzQ291bnQgKyBjdXJyZW50UmVxdWVzdENvdW50ZXIgPiB0aGlzLl9tYXhUb3RhbEVsZW1lbnRzQ291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzVG9SZW1vdmVbY3VycmVudC5pZF0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSgpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgRWxlbWVudHNPdmVyTGltaXQ6ZWxlbWVudHNUb1JlbW92ZSwgQ3VycmVudFJlcXVlc3RPbmx5SXRlbXNDb3VudGVyOmN1cnJlbnRSZXF1ZXN0Q291bnRlciB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG59Il19