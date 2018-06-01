module Comarch.Utils.TreeComparator {
    export interface ITreeComparator {
        Compare(): ComparisionResult;
    }
    interface INodeLookup<T> {
        [key: string]: T
    }
    class ComparisionPair<T> {
        constructor(public A: T, public B: T) { }
    }

    interface IChildComparisionInfo<T> {
        Result:ComparisionResult;
        ComparisionPairs:ComparisionPair<T>[]
    }
    export interface INodeComparatorFactory<T> {
        Create(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[]): INodeComparator;
    }
    export interface INodeComparator {
        Compare(): ComparisionResult;
    }

    export class NodeComparatorFactory<T> implements INodeComparatorFactory<T> {
        Create(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[]): INodeComparator {
            return new NodeComparator(a, b, uniqueNameSelector, childrenSelector);
        }
    }
    export enum ComparisionResult {
        Equivalent,
        Different
    }
    abstract class ComparatorBase<T> {
        private readonly _a: T;
        private readonly _b: T;
        private readonly _uniqueNameSelector: (x: T) => string;
        private readonly _childrenSelector: (x: T) => T[];

        protected get A(): T { return this._a; }

        protected get B(): T {
            return this._b;
        }

        protected get UniqueNameSelector(): (x: T) => string {
            return this._uniqueNameSelector;
        }

        protected get ChildrenSelector(): (x: T) => T[] {
            return this._childrenSelector;
        }


        protected constructor(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[]) {
            this._a = a;
            this._b = b;
            this._uniqueNameSelector = uniqueNameSelector;
            this._childrenSelector = childrenSelector;


        }
    }
    export class NodeComparator<T> extends ComparatorBase<T> implements INodeComparator {
        constructor(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[]) {
            super(a, b, uniqueNameSelector, childrenSelector);
        }

        Compare(): ComparisionResult {
            return this.CompareCore(this.A, this.B);
        }

        public CompareCore(a: T, b: T): ComparisionResult {
            if (this.NamesMatch(a, b) && this.ChildrenCountMatch(a, b)) {
                return ComparisionResult.Equivalent
            }
            return ComparisionResult.Different;

        }

        private ChildrenCountMatch(a: T, b: T) {
            let childrenA = this.ChildrenSelector(a);
            let childrenB = this.ChildrenSelector(b);
            if(!childrenA&& !childrenB) return true;
            return childrenA.length === childrenB.length;
        }

        private NamesMatch(a: T, b: T) {
            return this.UniqueNameSelector(a) === this.UniqueNameSelector(b);
        }
    }



    export class TreeComparator<T> extends ComparatorBase<T> implements ITreeComparator{
        
        private _nodeComparatorFactory: INodeComparatorFactory<T>=new NodeComparatorFactory<T>();

        constructor(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[], nodeComparatorFactory: INodeComparatorFactory<T>) {
            super(a, b, uniqueNameSelector, childrenSelector);
            this._nodeComparatorFactory = nodeComparatorFactory;
        }


        public Compare(): ComparisionResult {
            return this.CompareCore(this.A, this.B);
        }
        public CompareCore(a: T, b: T): ComparisionResult {
            var comparator = this.CreateComparator(a, b);
            var result=comparator.Compare();
            if (result === ComparisionResult.Different) return ComparisionResult.Different;
            var info = this.GetChildrenComparisionInfo(a,b);
            if(info.Result==ComparisionResult.Different) return ComparisionResult.Different;
            for (let pair of info.ComparisionPairs){
                result=this.CompareCore(pair.A,pair.B);
                if(result==ComparisionResult.Different) return ComparisionResult.Different;
            } 
            return result;
        }


        private GetChildrenComparisionInfo(a: T,b: T,):IChildComparisionInfo<T> {
            var result:IChildComparisionInfo<T>={
                ComparisionPairs:[],
                Result:ComparisionResult.Different
            };
            var lookup: INodeLookup<T> = this.CreateLookup(b);
            for (let child of this.ChildrenSelector(a)) {
                var matchingChild = lookup[this.UniqueNameSelector(child)];
                if (matchingChild) {
                    result.ComparisionPairs.push(new ComparisionPair<T>(child, matchingChild))
                }
                else {
                    result.ComparisionPairs.length=0;
                    return result;
                }
            }
            result.Result=ComparisionResult.Equivalent;
            return result;
        }

        private CreateComparator(a: T, b: T) {
            return this._nodeComparatorFactory.Create(a, b, this.UniqueNameSelector, this.ChildrenSelector);
        }

        private CreateLookup(b: T) {
            var lookup: INodeLookup<T> = {};
            this.ChildrenSelector(b).forEach(x => lookup[this.UniqueNameSelector(x)] = x);
            return lookup;
        }
    }
    


}   