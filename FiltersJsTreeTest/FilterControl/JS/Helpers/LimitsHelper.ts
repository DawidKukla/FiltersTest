namespace Comarch.Controls.FilterControlModule.Helpers {
    import IMemberNode = FilterControlModule.Common.IMemberNode;
    import TreeHelpers = Utils.TreeUtils.TreeHelpers;
    import ForwardTreeTraversalIteratorFactory = Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;

    export interface ILimitsHelperFactory {
        Create(owner: ILimitsHelperOwner, maxTotalElementsCount: number, allMembersTotalCount: number): ILimitsHelper;
    }

    export class LimitsHelperFactory implements ILimitsHelperFactory {
        Create(owner: ILimitsHelperOwner, maxTotalElementsCount: number, allMembersTotalCount: number): ILimitsHelper {
            return new LimitsHelper(owner, maxTotalElementsCount, allMembersTotalCount);
        }
    }

    export interface ILimitsHelperOwner {
        GetTreeNode(id: string): IMemberNode;
        HideNotAllElementsAreVisible();
        UpdateTotalElementsLoadedCount(text: string);
        ShowNotAllElementsAreVisible();
        IsInFilterMode: boolean;
    }

    export interface ILimitsHelper {
        LoadedElementsCount: number;
        EnforceLimits(nodesToLoad: IMemberNode[]): boolean;
    }

    export class LimitsHelper implements ILimitsHelper {
        private _allMembersTotalCount: number;
        private _maxTotalElementsCount: number=0;
        private _owner: ILimitsHelperOwner=null;
        private _loadedElementsCount: number=0;

        get LoadedElementsCount(): number { return this._loadedElementsCount; }

        set LoadedElementsCount(value: number) {
            this._loadedElementsCount = value;
            this._owner.UpdateTotalElementsLoadedCount(this.GetTotalElementsMessage(value));
        }

        constructor(owner: ILimitsHelperOwner, maxTotalElementsCount: number, allMembersTotalCount: number) {
            this._maxTotalElementsCount = maxTotalElementsCount;
            this._owner = owner;
            this._allMembersTotalCount = allMembersTotalCount;
        }

        private GetTotalElementsMessage(count: number) {
            this._loadedElementsCount = count;
            let text: string;
            if (this._owner.IsInFilterMode) {
                text = `(${this._loadedElementsCount}/*)`;
            } else {
                text = `(${this._loadedElementsCount}/${this._allMembersTotalCount})`;
            }
            return text;
        }

        EnforceLimits(loadedNodes: IMemberNode[]): boolean {
            const info = this.GetElementsToRemoveInfo(loadedNodes);

            this.RemoveElements(loadedNodes, info.ElementsOverLimit);

            return this.UpdateLimits(info.CurrentRequestOnlyItemsCounter, info.ElementsOverLimit);
        }

        private UpdateLimits(currentRequestCounter: number, elementsToRemove: { [key: string]: boolean; }) {
            const elementsCountAfterLoad = this._loadedElementsCount + currentRequestCounter;
            if (elementsCountAfterLoad === this._allMembersTotalCount) {
                this.LoadedElementsCount = elementsCountAfterLoad;
                this._owner.HideNotAllElementsAreVisible();
                return true;
            } else {
                if (elementsCountAfterLoad < this._maxTotalElementsCount) {
                    this.LoadedElementsCount = elementsCountAfterLoad;
                    this._owner.ShowNotAllElementsAreVisible();
                    return true;
                } else {
                    this.LoadedElementsCount = elementsCountAfterLoad - Object.keys(elementsToRemove).length;
                    return false;
                }
            }
        }


        private RemoveElements(loadedNodes: IMemberNode[], elementsToRemove: { [key: string]: boolean; }) {
            TreeHelpers.TraverseListPreorder(loadedNodes,
                x => x.children as IMemberNode[],
                (current, parent, level, index) => {
                    if (elementsToRemove[current.id]) {
                        const children = parent ? parent.children : loadedNodes;
                        children.splice(index, 1);
                    }
                    return true;
                });
        }

        private GetElementsToRemoveInfo(loadedNodes: IMemberNode[]) {
            var currentRequestCounter = 0;
            var elementsToRemove: {[key: string]: boolean;} = {};
            TreeHelpers.TraverseListPreorder(loadedNodes,
                x => x.children as IMemberNode[],
                (current) => {
                    if (!this._owner.GetTreeNode(current.id)) {
                        currentRequestCounter++;
                        if (this._loadedElementsCount + currentRequestCounter > this._maxTotalElementsCount) {
                            elementsToRemove[current.id] = true;
                        }
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory());
            return { ElementsOverLimit:elementsToRemove, CurrentRequestOnlyItemsCounter:currentRequestCounter };
        }
    }


}