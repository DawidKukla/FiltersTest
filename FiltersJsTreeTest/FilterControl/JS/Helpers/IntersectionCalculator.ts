namespace Comarch.Controls.FilterControlModule.Helpers {
    import IFilterItem = FilterControlModule.FilterStateManagerModule.Common.IFilterItem;
    import FilterType = Controls.FilterControlModule.FilterStateManagerModule.Common.FilterType;

    export interface IIntersectionCalculatorFactory {
        Create(a: IFilterItem,b:IFilterItem):IIntersectionCalculator;
    }

    export  class IntersectionCalculatorFactory implements IIntersectionCalculatorFactory {
        Create(a: IFilterItem, b: IFilterItem): IIntersectionCalculator { return new IntersectionCalculator(a, b); }
    }

    export interface IIntersectionCalculator {
        Intersect();
    }

    class IntersectionPair<T> {
        constructor(public A: T, public B: T) {}
    }

    export interface IFilterItemLookup {
        [key:string]:IFilterItem
    }

    export class IntersectionCalculator implements IIntersectionCalculator {
        private _b;
        private _a;

        constructor(a: IFilterItem,b:IFilterItem) {
            this._b = b;
            this._a = a;
        }

        public Intersect() {
            return this.IntersectCore(this._a, this._b);
        }

        private IntersectCore<T>(a:IFilterItem,b: IFilterItem) :IFilterItem {
            if (a == null)
                return null;
            if (b == null)
                return null;
            if (a.UniqueName !== b.UniqueName)
                return null;
            if (a.Children.length === 0)
                return this.CloneFilterItem(b, true);
            if (b.Children.length === 0)
                return this.CloneFilterItem(a, true);
            const pairs = this.IntersectChildren(a, b);
            if (pairs.length === 0)
                return null;
            var children: Array<IFilterItem> = [];
            pairs.forEach((pair) => {
                var child = this.IntersectCore<T>(pair.A, pair.B);
                if (child != null) {
                    children.push(child);
                }
            });
            if (children.length === 0)
                return null;
            var result = this.CloneFilterItem(a, false);
            children.forEach(child => { result.Children.push(child) });
            return result;
        }

        private IntersectChildren<T>(a: IFilterItem, b: IFilterItem): Array<IntersectionPair<IFilterItem>> {
            var result: IntersectionPair<IFilterItem>[];
            var aSet: IFilterItemLookup = {};
            a.Children.forEach(x => aSet[x.UniqueName] = x);
            var bSet: IFilterItemLookup = {};
            b.Children.forEach(x => bSet[x.UniqueName] = x);

            if ((a.Type === FilterType.Included && b.Type === FilterType.Included)) {
                result =  Enumerable.from(a.Children).intersect(b.Children, x => x.UniqueName).select(x => new IntersectionPair(aSet[x.UniqueName], bSet[x.UniqueName])).toArray();
            } else if(a.Type === FilterType.Excluded && b.Type === FilterType.Excluded) {
                result =  Enumerable.from(a.Children).union(b.Children, x => x.UniqueName).select(x => new IntersectionPair(aSet[x.UniqueName], bSet[x.UniqueName])).toArray();
            }
            else {
                //if (a.Type === FilterType.Included && b.Type === FilterType.Excluded) {
                //    if (a.Children.length >= b.Children.length) {
                //       result = Enumerable.from(a.Children).except(b.Children,x=>x.UniqueName).select(x=>new IntersectionPair(x,x)).toArray();
                //    } else {
                //        result = Enumerable.from(b.Children).except(a.Children,x=>x.UniqueName).select(x=>new IntersectionPair(x,x)).toArray();
                //    }
                //}
                //if (a.Type === FilterType.Excluded && b.Type === FilterType.Included) {
                //    if (a.Children.length >= b.Children.length) {
                //        result = Enumerable.from(a.Children).except(b.Children,x=>x.UniqueName).select(x=>new IntersectionPair(x,x)).toArray();
                //    } else {
                //        result = Enumerable.from(b.Children).except(a.Children,x=>x.UniqueName).select(x=>new IntersectionPair(x,x)).toArray();
                //    }
                //}
            }
            
            return result;
        }

        private CloneFilterItem(obj:IFilterItem,deep: boolean):IFilterItem {
            var clone: IFilterItem = { UniqueName: obj.UniqueName, Type: obj.Type, Children: obj.Children };
            if (deep) {
                obj.Children.forEach(child => {
                    clone.Children.push(this.CloneFilterItem(child, deep));
                });
            }
            return clone;
        }
       
    }

    
}