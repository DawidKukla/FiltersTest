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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGltaXRzSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTGltaXRzSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsT0FBTyxDQXFIaEI7QUFySEQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBcUh6QjtJQXJIaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0FxSDdDO1FBckgwQixXQUFBLG1CQUFtQjtZQUFDLElBQUEsT0FBTyxDQXFIckQ7WUFySDhDLFdBQUEsT0FBTztnQkFFbEQsSUFBTyxXQUFXLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDakQsSUFBTyxtQ0FBbUMsR0FBRyxRQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUM7Z0JBTWpHO29CQUNJLE1BQU0sQ0FBQyxLQUF5QixFQUFFLHFCQUE2QixFQUFFLG9CQUE0Qjt3QkFDekYsTUFBTSxDQUFDLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO29CQUNoRixDQUFDO2lCQUNKO2dCQUpZLDJCQUFtQixzQkFJL0IsQ0FBQTtnQkFlRDtvQkFhSSxZQUFZLEtBQXlCLEVBQUUscUJBQTZCLEVBQUUsb0JBQTRCO3dCQVgxRiwyQkFBc0IsR0FBUyxDQUFDLENBQUM7d0JBQ2pDLFdBQU0sR0FBcUIsSUFBSSxDQUFDO3dCQUNoQyx5QkFBb0IsR0FBUyxDQUFDLENBQUM7d0JBVW5DLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQzt3QkFDcEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7d0JBQ3BCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQztvQkFDdEQsQ0FBQztvQkFYRCxJQUFJLG1CQUFtQixLQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO29CQUV2RSxJQUFJLG1CQUFtQixD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Y2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ29tYXJjaC5Db250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLkhlbHBlcnMge1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSU1lbWJlck5vZGU7XHJcbiAgICBpbXBvcnQgVHJlZUhlbHBlcnMgPSBVdGlscy5UcmVlVXRpbHMuVHJlZUhlbHBlcnM7XHJcbiAgICBpbXBvcnQgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkgPSBVdGlscy5UcmVlVXRpbHMuRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJTGltaXRzSGVscGVyRmFjdG9yeSB7XHJcbiAgICAgICAgQ3JlYXRlKG93bmVyOiBJTGltaXRzSGVscGVyT3duZXIsIG1heFRvdGFsRWxlbWVudHNDb3VudDogbnVtYmVyLCBhbGxNZW1iZXJzVG90YWxDb3VudDogbnVtYmVyKTogSUxpbWl0c0hlbHBlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTGltaXRzSGVscGVyRmFjdG9yeSBpbXBsZW1lbnRzIElMaW1pdHNIZWxwZXJGYWN0b3J5IHtcclxuICAgICAgICBDcmVhdGUob3duZXI6IElMaW1pdHNIZWxwZXJPd25lciwgbWF4VG90YWxFbGVtZW50c0NvdW50OiBudW1iZXIsIGFsbE1lbWJlcnNUb3RhbENvdW50OiBudW1iZXIpOiBJTGltaXRzSGVscGVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBMaW1pdHNIZWxwZXIob3duZXIsIG1heFRvdGFsRWxlbWVudHNDb3VudCwgYWxsTWVtYmVyc1RvdGFsQ291bnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElMaW1pdHNIZWxwZXJPd25lciB7XHJcbiAgICAgICAgR2V0VHJlZU5vZGUoaWQ6IHN0cmluZyk6IElNZW1iZXJOb2RlO1xyXG4gICAgICAgIEhpZGVOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKTtcclxuICAgICAgICBVcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQodGV4dDogc3RyaW5nKTtcclxuICAgICAgICBTaG93Tm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCk7XHJcbiAgICAgICAgSXNJbkZpbHRlck1vZGU6IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJTGltaXRzSGVscGVyIHtcclxuICAgICAgICBMb2FkZWRFbGVtZW50c0NvdW50OiBudW1iZXI7XHJcbiAgICAgICAgRW5mb3JjZUxpbWl0cyhub2Rlc1RvTG9hZDogSU1lbWJlck5vZGVbXSk6IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIExpbWl0c0hlbHBlciBpbXBsZW1lbnRzIElMaW1pdHNIZWxwZXIge1xyXG4gICAgICAgIHByaXZhdGUgX2FsbE1lbWJlcnNUb3RhbENvdW50OiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBfbWF4VG90YWxFbGVtZW50c0NvdW50OiBudW1iZXI9MDtcclxuICAgICAgICBwcml2YXRlIF9vd25lcjogSUxpbWl0c0hlbHBlck93bmVyPW51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBfbG9hZGVkRWxlbWVudHNDb3VudDogbnVtYmVyPTA7XHJcblxyXG4gICAgICAgIGdldCBMb2FkZWRFbGVtZW50c0NvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50OyB9XHJcblxyXG4gICAgICAgIHNldCBMb2FkZWRFbGVtZW50c0NvdW50KHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9vd25lci5VcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQodGhpcy5HZXRUb3RhbEVsZW1lbnRzTWVzc2FnZSh2YWx1ZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3RydWN0b3Iob3duZXI6IElMaW1pdHNIZWxwZXJPd25lciwgbWF4VG90YWxFbGVtZW50c0NvdW50OiBudW1iZXIsIGFsbE1lbWJlcnNUb3RhbENvdW50OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50ID0gbWF4VG90YWxFbGVtZW50c0NvdW50O1xyXG4gICAgICAgICAgICB0aGlzLl9vd25lciA9IG93bmVyO1xyXG4gICAgICAgICAgICB0aGlzLl9hbGxNZW1iZXJzVG90YWxDb3VudCA9IGFsbE1lbWJlcnNUb3RhbENvdW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRUb3RhbEVsZW1lbnRzTWVzc2FnZShjb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRlZEVsZW1lbnRzQ291bnQgPSBjb3VudDtcclxuICAgICAgICAgICAgbGV0IHRleHQ6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuX293bmVyLklzSW5GaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYCgke3RoaXMuX2xvYWRlZEVsZW1lbnRzQ291bnR9LyopYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgKCR7dGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudH0vJHt0aGlzLl9hbGxNZW1iZXJzVG90YWxDb3VudH0pYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEVuZm9yY2VMaW1pdHMobG9hZGVkTm9kZXM6IElNZW1iZXJOb2RlW10pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMuR2V0RWxlbWVudHNUb1JlbW92ZUluZm8obG9hZGVkTm9kZXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5SZW1vdmVFbGVtZW50cyhsb2FkZWROb2RlcywgaW5mby5FbGVtZW50c092ZXJMaW1pdCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5VcGRhdGVMaW1pdHMoaW5mby5DdXJyZW50UmVxdWVzdE9ubHlJdGVtc0NvdW50ZXIsIGluZm8uRWxlbWVudHNPdmVyTGltaXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBVcGRhdGVMaW1pdHMoY3VycmVudFJlcXVlc3RDb3VudGVyOiBudW1iZXIsIGVsZW1lbnRzVG9SZW1vdmU6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbjsgfSkge1xyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50c0NvdW50QWZ0ZXJMb2FkID0gdGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudCArIGN1cnJlbnRSZXF1ZXN0Q291bnRlcjtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnRzQ291bnRBZnRlckxvYWQgPT09IHRoaXMuX2FsbE1lbWJlcnNUb3RhbENvdW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkxvYWRlZEVsZW1lbnRzQ291bnQgPSBlbGVtZW50c0NvdW50QWZ0ZXJMb2FkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3duZXIuSGlkZU5vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNDb3VudEFmdGVyTG9hZCA8IHRoaXMuX21heFRvdGFsRWxlbWVudHNDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9hZGVkRWxlbWVudHNDb3VudCA9IGVsZW1lbnRzQ291bnRBZnRlckxvYWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3duZXIuU2hvd05vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkxvYWRlZEVsZW1lbnRzQ291bnQgPSBlbGVtZW50c0NvdW50QWZ0ZXJMb2FkIC0gT2JqZWN0LmtleXMoZWxlbWVudHNUb1JlbW92ZSkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgUmVtb3ZlRWxlbWVudHMobG9hZGVkTm9kZXM6IElNZW1iZXJOb2RlW10sIGVsZW1lbnRzVG9SZW1vdmU6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbjsgfSkge1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcihsb2FkZWROb2RlcyxcclxuICAgICAgICAgICAgICAgIHggPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQsIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzVG9SZW1vdmVbY3VycmVudC5pZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBwYXJlbnQgPyBwYXJlbnQuY2hpbGRyZW4gOiBsb2FkZWROb2RlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0RWxlbWVudHNUb1JlbW92ZUluZm8obG9hZGVkTm9kZXM6IElNZW1iZXJOb2RlW10pIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRSZXF1ZXN0Q291bnRlciA9IDA7XHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50c1RvUmVtb3ZlOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbjt9ID0ge307XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyKGxvYWRlZE5vZGVzLFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5fb3duZXIuR2V0VHJlZU5vZGUoY3VycmVudC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3RDb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50ICsgY3VycmVudFJlcXVlc3RDb3VudGVyID4gdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1RvUmVtb3ZlW2N1cnJlbnQuaWRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IEVsZW1lbnRzT3ZlckxpbWl0OmVsZW1lbnRzVG9SZW1vdmUsIEN1cnJlbnRSZXF1ZXN0T25seUl0ZW1zQ291bnRlcjpjdXJyZW50UmVxdWVzdENvdW50ZXIgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxufSJdfQ==