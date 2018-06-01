module Comarch.Utils.TreeComparator {
    export interface ITreeComparator {
        Compare(): ComparisionResult;
    }
    interface INodeLookup<T> {
        [key: string]: NodeInfo<T>
    }
    
    export class NodeInfo<T> {
        constructor(i?:NodeInfo<T>){if(i){Object.assign(this,i)}}
        Node:T;
        Index:number;
    }
    class ComparisionPair<T> {
        constructor(public A: T, public B: T) { }
    }

    interface IChildComparisionInfo<T> {
        Result:ComparisionResult;
        ComparisionPairs:ComparisionPair<T>[]
    }
    export interface INodeComparatorFactory<T> {
        Create(options: TreeComparatorOptionsBase<T>): INodeComparator;
    }
    export interface INodeComparator {
        Compare(): ComparisionResult;
    }

    export class NodeComparatorFactory<T> implements INodeComparatorFactory<T> {
        Create(options: TreeComparatorOptionsBase<T>): INodeComparator {
            return new NodeComparator(options);
        }
    }
    export enum ComparisionResult {
        Equivalent,
        Different
    }
    abstract class ComparatorBase<T> {
        private readonly _options:TreeComparatorOptionsBase<T>;

        protected get Options(): TreeComparatorOptionsBase<T>{ return this._options; }
        
        protected get A(): T { return this._options.A; }

        protected get B(): T {return this._options.B;}

        protected get UniqueNameSelector(): (x: T) => string {
            return this._options.UniqueNameSelector;
        }

        protected get ChildrenSelector(): (x: T) => T[] {
            return this._options.ChildrenSelector;
        }


        protected constructor(options:TreeComparatorOptionsBase<T>) {
            this._options=options;
        }
    }
    export class NodeComparator<T> extends ComparatorBase<T> implements INodeComparator {
        constructor(options:TreeComparatorOptionsBase<T>) {
            super(options);
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
            if(!childrenA && !childrenB) return true;
            return childrenA.length === childrenB.length;
        }

        private NamesMatch(a: T, b: T) {
            return this.UniqueNameSelector(a) === this.UniqueNameSelector(b);
        }
    }

    export class TreeComparatorOptionsBase<T>{
        
        constructor(i?:TreeComparatorOptionsBase<T>){if(i){Object.assign(this,i)}}
        A: T;
        B: T;
        UniqueNameSelector: (x: T) => string;
        ChildrenSelector: (x: T) => T[];
        
    }
    
    export class TreeComparatorOptions<T> extends TreeComparatorOptionsBase<T>{
        constructor(i?:TreeComparatorOptions<T>){super(null);if(i){Object.assign(this,i)}}
        OrderInvariant:boolean=true;
        NodeComparatorFactory: INodeComparatorFactory<T>=new NodeComparatorFactory<T>();
        NodeProcessingCallback:(a:T,b:T)=>void=()=>{}
    }

    export class TreeComparator<T> extends ComparatorBase<T> implements ITreeComparator{
        
        get NewOptions():TreeComparatorOptions<T>{return this.Options as TreeComparatorOptions<T>}
        get NodeComparatorFactory(): INodeComparatorFactory<T>{return this.NewOptions.NodeComparatorFactory;}
        get NodeProcessingCallback():(a:T,b:T)=>void {return this.NewOptions.NodeProcessingCallback;}
        
        constructor(options:TreeComparatorOptions<T>) {
            super(options);
            
        }

        public Compare(): ComparisionResult {
            return this.CompareCore(this.A, this.B);
        }
        public CompareCore(a: T, b: T): ComparisionResult {
            this.NodeProcessingCallback(a,b);
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
            var children=this.ChildrenSelector(a);
            for (let i=0;i<children.length;i++){
                var childInfo=new NodeInfo<T>(<NodeInfo<T>>{Node:children[i],Index:i});
                var matchingChildInfo = lookup[this.UniqueNameSelector(childInfo.Node)];
                if (matchingChildInfo  && this.OrderMatch(childInfo.Index,matchingChildInfo.Index)) {
                    result.ComparisionPairs.push(new ComparisionPair<T>(childInfo.Node, matchingChildInfo.Node))
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
            return this.NodeComparatorFactory.Create(new TreeComparatorOptionsBase<T>(<TreeComparatorOptionsBase<T>>{
                A:a,
                B:b,
                UniqueNameSelector:this.UniqueNameSelector,
                ChildrenSelector:this.ChildrenSelector
                
            }));
        }

        private CreateLookup(b: T) {
            var lookup: INodeLookup<T> = {};
            this.ChildrenSelector(b).forEach((x,index) => 
                lookup[this.UniqueNameSelector(x)] = new NodeInfo<T>(<NodeInfo<T>>{Node:x,Index:index}));
            return lookup;
        }

        private OrderMatch(indexA: number, indexB: number) {
            if(this.NewOptions.OrderInvariant) return true;
            return indexA===indexB;
        }
    }
    


}   