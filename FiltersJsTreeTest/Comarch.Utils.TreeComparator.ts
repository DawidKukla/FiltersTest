  module Comarch.Utils.TreeComparator {
    interface INodeLookup<T> {
        [key:string]:T
    }
    
    export interface ISingleNodeComparatorFactory<T> {
          Create(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[]): ISingleNodeComparator;
      }
     export interface ISingleNodeComparator {
         Compare(): ComparisionResult;
     }
     
     export class SingleNodeComparatorFactory<T> implements ISingleNodeComparatorFactory<T> {
         Create(a: T, b: T, uniqueNameSelector: (x: T) => string, childrenSelector: (x: T) => T[]): ISingleNodeComparator {
             return new SingleNodeComparator(a, b, uniqueNameSelector, childrenSelector);
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

        protected get A():T{ return this._a;}

        protected get B(): T {
            return this._b;
        }

        protected get UniqueNameSelector(): (x: T) => string {
            return this._uniqueNameSelector;
        }

        protected get ChildrenSelector(): (x: T) => T[] {
            return this._childrenSelector;
        }


        protected constructor(a:T ,b:T,uniqueNameSelector:(x:T)=>string,childrenSelector:(x:T)=>T[]){
            this._a = a;
            this._b = b;
            this._uniqueNameSelector = uniqueNameSelector;
            this._childrenSelector = childrenSelector;


        }
    }
    export class SingleNodeComparator<T> extends ComparatorBase<T> implements ISingleNodeComparator {
        constructor(a:T ,b:T,uniqueNameSelector:(x:T)=>string,childrenSelector:(x:T)=>T[]){
            super(a,b,uniqueNameSelector,childrenSelector);
        }

        Compare(): ComparisionResult {
            return this.CompareCore(this.A, this.B);
        }

        public CompareCore(a:T ,b:T):ComparisionResult{
            if (this.NamesMatch(a, b) || this.ChildrenCountMatch(a, b)){
                return ComparisionResult.Different
            } 
            return ComparisionResult.Different;
            
        }

        private ChildrenCountMatch(a: T, b: T) {
            return this.ChildrenSelector(a).length === this.ChildrenSelector(b).length;
        }

        private NamesMatch(a: T, b: T) {
            return this.UniqueNameSelector(a) === this.UniqueNameSelector(b);
        }
    }
    
    
    
    export class TreeComparator<T> extends ComparatorBase<T>{
        private _nodeComparatorFactory: ISingleNodeComparatorFactory<T>;
        
        constructor(a:T ,b:T,uniqueNameSelector:(x:T)=>string,childrenSelector:(x:T)=>T[],nodeComparatorFactory:ISingleNodeComparatorFactory<T>){
            super(a,b,uniqueNameSelector,childrenSelector);
            this._nodeComparatorFactory = nodeComparatorFactory;
        }
            
        
        public Compare():ComparisionResult{
            return this.CompareCore(this.A,this.B);
        }
        public CompareCore(a:T ,b:T):ComparisionResult{
            var comparator=this.CreateComparator(a, b);
            if (comparator.Compare()===ComparisionResult.Different) return ComparisionResult.Different;
            var lookup:INodeLookup<T>=this.CreateLookup(b);
            var comparisionPairs:ComparisionPair<T>[]=[];
            for (let child of this.ChildrenSelector(a))  {
                var matchingChild=lookup[this.UniqueNameSelector(child)];
                if(matchingChild){
                    comparisionPairs.push(new ComparisionPair<T>(child,matchingChild))
                }
                else {
                    return ComparisionResult.Different;
                }
            }
            
            
        }


        private CreateComparator(a: T, b: T) {
            return this._nodeComparatorFactory.Create(a, b, this.UniqueNameSelector, this.ChildrenSelector);
        }

        private CreateLookup(b: T) {
            var lookup:INodeLookup<T>={};
            this.ChildrenSelector(b).forEach(x=>lookup[this.UniqueNameSelector(x)]=x);
            return lookup;
        }
    }
    class ComparisionPair<T> {
        constructor(public A:T,public B:T){}
    }
    
}   