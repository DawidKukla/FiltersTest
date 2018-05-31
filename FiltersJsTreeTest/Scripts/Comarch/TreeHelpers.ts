module Comarch.Utils.TreeUtils {
    export interface ITraversePreOrderOperation {
        Operation: (i, parent, level, index) => boolean;
    }
    export interface ITreeTraversalIteratorFactory<T> {
        Create(list: Array<T>): ITreeTraversalIterator<T>;
    }
    export abstract  class TreeTraversalIteratorFactoryBase<T> implements ITreeTraversalIteratorFactory<T>
    {
        abstract Create(list: Array<T>): ITreeTraversalIterator<T>;
    }

    export class ForwardTreeTraversalIteratorFactory<T> extends TreeTraversalIteratorFactoryBase<T> {
        Create(list: T[]): ITreeTraversalIterator<T> { return new FrowardTreeTraversalIterator<T>(list); }
    }
    export class BackwardTreeTraversalIteratorFactory<T> extends TreeTraversalIteratorFactoryBase<T> {
        Create(list: T[]): ITreeTraversalIterator<T> { return new BackwardTreeTraversalIterator<T>(list); }
    }

    export interface ITreeTraversalIterator<T> {
        Current: T;
        CurrentIndex: number;
        MoveNext(): boolean;
    }

    export abstract class TreeTraversalIteratorBase<T> implements ITreeTraversalIterator<T> {
        protected readonly _list: Array<T>;
        protected _currentIndex: number;
        constructor(list: Array<T>) {
            this._list = list;
        }
        get Current(): T { return this._list[this._currentIndex] }
        get CurrentIndex(): number { return this._currentIndex; }
        abstract MoveNext(): boolean;
    }

    export class FrowardTreeTraversalIterator<T> extends TreeTraversalIteratorBase<T> {
        constructor(list: Array<T>) {
            super(list);
            this._currentIndex = -1;
        }
        MoveNext(): boolean {
            this._currentIndex++;
            return this._currentIndex < this._list.length;
        }
    }

    export class BackwardTreeTraversalIterator<T> extends TreeTraversalIteratorBase<T> {
        constructor(list: Array<T>) {
            super(list);
            this._currentIndex = list.length;
        }
        MoveNext(): boolean {
            this._currentIndex--;
            return this._currentIndex >= 0;
        }
    }

    export class TreeHelpers {

        static HIERARCHY_ROOT_UNIQUE_NAME = "HierarchyRoot_297473E5-182B-43E5-BBD0-C7A994992778";
        static TraverseListPreorder<T>(list: T[],
            childrenSelector: (x: T) => Array<T>,
            operation: (x: T, parent?: T, level?: number, index?: number,path?:T[]) => boolean,
            iteratorFactory: ITreeTraversalIteratorFactory<T> = new BackwardTreeTraversalIteratorFactory<T>(),
            trackPath = false,
            ) : void {
            var iterator = iteratorFactory.Create(list);
            while (iterator.MoveNext()) {
                TreeHelpers.TraversePreorder<T>(iterator.Current, childrenSelector, operation, iteratorFactory, null, 0, iterator.CurrentIndex,trackPath,[]);
            }
        }
        
        static TraversePreorder<T>(currentItem: T,
            childrenSelector: (x: T) => Array<T>,
            operation: (x: T, parent?: T, level?: number, index?: number,path?:T[]) => boolean,
            iteratorFactory: ITreeTraversalIteratorFactory<T> = new BackwardTreeTraversalIteratorFactory<T>(),
            parent: T = null,
            level: number = 0,
            index: number = 0,
            trackPath = false,
            path:T[]=[]
        ) : boolean {
            const canContinue = operation(currentItem, parent, level, index,path);
            if (!canContinue) return false;
            if (trackPath) {
                path.push(currentItem);
            }
            const children = childrenSelector(currentItem);
            if (children) {
                var iterator = iteratorFactory.Create(children);
                while (iterator.MoveNext()) {
                    var nextLevel = level + 1;
                    TreeHelpers.TraversePreorder(iterator.Current, childrenSelector, operation, iteratorFactory, currentItem, nextLevel, iterator.CurrentIndex,trackPath,path.slice(0));
                }
            }
            return true;
        }

        static TraverseListPostOrder<T>(list: T[],
            childrenSelector: (x: T) => Array<T>,
            operation: (x: T, parent: T, level: number, index: number) => void,
            iteratorFactory: ITreeTraversalIteratorFactory<T> = new BackwardTreeTraversalIteratorFactory<T>(),
            canContinueProcessing: (x: T, parent: T, level: number, index: number) => boolean=()=>true,
           ):void {
            var iterator = iteratorFactory.Create(list);
            while (iterator.MoveNext()) {
                TreeHelpers.TraversePostOrder<T>(iterator.Current, childrenSelector, operation, iteratorFactory, canContinueProcessing,null,0,iterator.CurrentIndex);
            }
        }

        static TraversePostOrder<T>(currentItem: T,
            childrenSelector: (x: T) => Array<T>,
            operation: (x: T, parent: T, level: number, index: number) => void,
            iteratorFactory: ITreeTraversalIteratorFactory<T> = new BackwardTreeTraversalIteratorFactory<T>(),
            canContinueProcessing: (x: T, parent: T, level: number, index: number) => boolean = () => true ,
            parent: T = null,
            level: number = 0,
            index: number = 0,
            ):boolean {
            const canContinue = canContinueProcessing(currentItem, parent, level, index);
            if (!canContinue) return false;
            const children = childrenSelector(currentItem);
            if (children) {
                var iterator = iteratorFactory.Create(children);
                while (iterator.MoveNext()) {
                    var nextLevel = level + 1;
                    TreeHelpers
                        .TraversePostOrder(iterator.Current, childrenSelector, operation, iteratorFactory, canContinueProcessing, currentItem, nextLevel, iterator.CurrentIndex);
                }
            }
            operation(currentItem, parent, level, index);
            return true;
        }

        static Convert<T, TResult>(
            currentItem: T,
            childrenSelector: (x: T) => Array<T>,
            resultChildrenSelector: (x: TResult) => Array<TResult>,
            convertOperation: (x: T, parent: T, convertedParent: TResult, level: number, index: number) => TResult,
            addChildrenOperation: (parent:TResult,child: TResult) => void=null,
            parent: T = null,
            convertedParent: TResult = null,
            level: number = 0,
            index: number = 0): TResult {
            const convertedCurrentItem = convertOperation(currentItem, parent, convertedParent, level, index);
            if (!convertedCurrentItem) return null;
            const children = childrenSelector(currentItem);
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    const chi = children[i];
                    const nextLevel = level + 1;
                    const childConverted = TreeHelpers
                        .Convert<T, TResult>(
                            chi,
                            childrenSelector,
                            resultChildrenSelector,
                            convertOperation, 
                            addChildrenOperation,
                            currentItem,
                            convertedCurrentItem,
                            nextLevel,
                            i);
                    if (childConverted) {
                        if (addChildrenOperation) {
                            addChildrenOperation(convertedCurrentItem,childConverted);
                        } else {
                            resultChildrenSelector(convertedCurrentItem).push(childConverted);
                        }
                    }
                }
            }
            return convertedCurrentItem;
        }

        static ConvertListToLookup<T>(list: T[], childrenSelector: (x: T) => Array<T>, keySelector: (x: T) => string): collections.Dictionary<string, T> {
            var result = new collections.Dictionary<string, T>();
            list.forEach(x => {
                this.ConvertToLookup(x, childrenSelector, keySelector,result);
            });
            return result;
        }

        static ConvertToLookup<T>(root: T, childrenSelector: (x: T) => Array<T>, keySelector: (x: T) => string,result:collections.Dictionary<string, T>= new collections.Dictionary<string, T>()): collections.Dictionary<string, T> {
            TreeHelpers.TraversePreorder(root,
                childrenSelector,
                (x) => {
                    result.setValue(keySelector(x), x);
                    return true;
                });
            return result;
        }

        static GetByPredicate<T>(input: T, childrenSelector: (x: T) => Array<T>, predicate: (x: T) => boolean, deepCopyFunction: (x: T) => T): Array<T> {
            var result: Array<T> = [];
            TreeHelpers.TraversePreorder(input,
                childrenSelector,
                (x) => {
                    if (predicate(x)) {
                        result.push(deepCopyFunction(x));
                    }
                    return true;
                });

            return result;
        }

        static ReconstructFromLeafs<T>(leafsList: Array<T>,
            fullHierarchyLookup: collections.Dictionary<string, T>,
            itemUniqueNameSelector: (x: T) => string,
            itemParentUniqueNameSelector: (x: T) => string,
            childrenSelector: (x: T) => Array<T>,
            deepCopyFunction: (T, boolean) => T): T {
            var lookup = new collections.Dictionary<string, T>();
            leafsList.forEach(x => {
                var currentItem = null;
                var uniqueName = itemUniqueNameSelector(x);
                currentItem = fullHierarchyLookup.getValue(uniqueName);
                if (currentItem) {
                    currentItem = deepCopyFunction(currentItem, false);
                    lookup.setValue(uniqueName, currentItem);
                    var parentUniqueName = itemParentUniqueNameSelector(currentItem);
                    currentItem = fullHierarchyLookup.getValue(parentUniqueName);
                    while (currentItem) {
                        currentItem = deepCopyFunction(currentItem, false);
                        lookup.setValue(parentUniqueName, currentItem);
                        var parentUniqueName = itemParentUniqueNameSelector(currentItem);
                        currentItem = fullHierarchyLookup.getValue(parentUniqueName);
                    }
                }
            });

            lookup.forEach((key, value) => {
                var parent = lookup.getValue(itemParentUniqueNameSelector(value));
                if (parent) {
                    childrenSelector(parent).push(value);
                }
            });
            return lookup.getValue(TreeHelpers.HIERARCHY_ROOT_UNIQUE_NAME);
        }

        /**
        * Returns deepCopy of union of two trees with common root and same depth
        */
        static Union<T>(rootA: T,
            rootB: T,
            itemUniqueNameSelector: (x: T) => string,
            childrenSelector: (x: T) => Array<T>,
            parentPropertyName: string,
            deepCopyFunction: (T, boolean) => T): T {
            const rootUniqueName = itemUniqueNameSelector(rootA);
            var lookup = new collections.Dictionary<string, T>();
            var lookupFillFunction = (i, parent, level, index) => {
                if (parent) {
                    i[parentPropertyName] = itemUniqueNameSelector(parent);
                }
                lookup.setValue(itemUniqueNameSelector(i), deepCopyFunction(i, false));
                return true;
            };
            TreeHelpers.TraversePreorder<T>(rootA,
                childrenSelector,
                (i, parent, level, index) => {
                    return lookupFillFunction(i, parent, level, index);
                });
            TreeHelpers.TraversePreorder<T>(rootB,
                childrenSelector,
                (i, parent, level, index) => {
                    return lookupFillFunction(i, parent, level, index);
                });
            lookup.forEach((key, value) => {
                var parentUniqueName = value[parentPropertyName];
                if (parentUniqueName) {
                    const parent = lookup.getValue(parentUniqueName);
                    if (parent) {
                        childrenSelector(parent).push(value);
                    }
                }
            });
            return lookup.getValue(rootUniqueName);
        }
        private static IntersectChildren<T>(a: Array<T>, b: Array<T>, uniqueNameSelector: (x: T) => string): Array<IntersectionPair<T>> {
            var result = [];
            var aSet = new collections.Dictionary<string, T>();
            a.forEach(x => aSet.setValue(uniqueNameSelector(x), x));
            var bSet = new collections.Dictionary<string, T>();
            b.forEach(x => bSet.setValue(uniqueNameSelector(x), x));
            aSet.keys().forEach((key: string) => {
                var value = bSet.getValue(key);
                if (value) {
                    result.push(new IntersectionPair(aSet.getValue(key), value));
                }
            });
            return result;
        }
        /**
     * Returns deepCopy of intersection of two trees with common root, tree can have diffrent depth
     */
        static Intersection<T>(a: T,
            b: T,
            uniqueNameSelector: (x: T) => string,
            childrenSelector: (x: T) => Array<T>,
            childrenAppender: (node: T, child: T) => void,
            deepCopy: (T, boolean) => T): T {
            if (a == null)
                return null;
            if (b == null)
                return null;
            if (uniqueNameSelector(a) !== uniqueNameSelector(b))
                return null;
            if (childrenSelector(a).length === 0)
                return deepCopy(b, true);
            if (childrenSelector(b).length === 0)
                return deepCopy(a, true);
            const pairs = TreeHelpers.IntersectChildren(childrenSelector(a), childrenSelector(b), uniqueNameSelector);
            if (pairs.length === 0)
                return null;
            var children: Array<T> = [];
            pairs.forEach((pair) => {
                var child = TreeHelpers.Intersection<T>(pair.A, pair.B, uniqueNameSelector, childrenSelector, childrenAppender, deepCopy);
                if (child != null) {
                    children.push(child);
                }
            });
            if (children.length === 0)
                return null;
            var result = deepCopy(a, false);
            children.forEach(child => { childrenAppender(result, child); });
            return result;
        }
        static Flatten<T>(root: T, childrenSelector: (x: T) => Array<T>, includePredicate: (x: T) => boolean = (x) => { return true; }): Array<T> {
            return TreeHelpers.FlattenInternal([], childrenSelector(root), childrenSelector, includePredicate);
        }

        static FlattenArray<T>(rootList: Array<T>,
            childrenSelector: (x: T) => Array<T>,
            includePredicate: (x: T) => boolean = (x) => { return true; }): Array<T> {
            return TreeHelpers.FlattenInternal([], rootList, childrenSelector, includePredicate);
        }

        private static FlattenInternal<T>(result: Array<T>,
            list: Array<T>,
            childrenSelector: (x: T) => Array<T>,
            includePredicate: (x: T) => boolean = (x) => { return true; }): Array<T> {

            var stack = new collections.Stack<T>();
            list.forEach(i => { stack.push(i) });
            while (!stack.isEmpty()) {
                const current = stack.pop();
                if (includePredicate(current)) result.push(current);
                const children = childrenSelector(current);
                if (children) {
                    children.forEach(i => { stack.push(i) });
                }
            }
            return result;
        }
        public static TraverseListBFS<T>(list: T[], childrenSelector: (x: T) => Array<T>, operation: (current: T, index: number) => boolean, trackVisited: boolean= false) {
            TreeHelpers.TraverseBFS(null,childrenSelector,operation,list.slice());
        }

        public static TraverseBFS<T>(currentItem: T, childrenSelector: (x: T) => Array<T>, operation: (current: T, index: number) => boolean,queue:T[]) {
            var iterationIndex: number = 0;
            if (currentItem)
                queue.push(currentItem);
            var canContinue = true;
            while (queue.length > 0 && canContinue) {
                var current = queue.shift();
                childrenSelector(current).forEach(c => queue.push(c));
                canContinue = operation(current, iterationIndex);
                iterationIndex++;
            }
        }
    }

    export class IntersectionPair<T> {
        constructor(public A: T, public B: T) {}
    }
}