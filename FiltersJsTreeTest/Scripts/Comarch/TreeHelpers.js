var Comarch;
(function (Comarch) {
    var Utils;
    (function (Utils) {
        var TreeUtils;
        (function (TreeUtils) {
            class TreeTraversalIteratorFactoryBase {
            }
            TreeUtils.TreeTraversalIteratorFactoryBase = TreeTraversalIteratorFactoryBase;
            class ForwardTreeTraversalIteratorFactory extends TreeTraversalIteratorFactoryBase {
                Create(list) { return new FrowardTreeTraversalIterator(list); }
            }
            TreeUtils.ForwardTreeTraversalIteratorFactory = ForwardTreeTraversalIteratorFactory;
            class BackwardTreeTraversalIteratorFactory extends TreeTraversalIteratorFactoryBase {
                Create(list) { return new BackwardTreeTraversalIterator(list); }
            }
            TreeUtils.BackwardTreeTraversalIteratorFactory = BackwardTreeTraversalIteratorFactory;
            class TreeTraversalIteratorBase {
                constructor(list) {
                    this._list = list;
                }
                get Current() { return this._list[this._currentIndex]; }
                get CurrentIndex() { return this._currentIndex; }
            }
            TreeUtils.TreeTraversalIteratorBase = TreeTraversalIteratorBase;
            class FrowardTreeTraversalIterator extends TreeTraversalIteratorBase {
                constructor(list) {
                    super(list);
                    this._currentIndex = -1;
                }
                MoveNext() {
                    this._currentIndex++;
                    return this._currentIndex < this._list.length;
                }
            }
            TreeUtils.FrowardTreeTraversalIterator = FrowardTreeTraversalIterator;
            class BackwardTreeTraversalIterator extends TreeTraversalIteratorBase {
                constructor(list) {
                    super(list);
                    this._currentIndex = list.length;
                }
                MoveNext() {
                    this._currentIndex--;
                    return this._currentIndex >= 0;
                }
            }
            TreeUtils.BackwardTreeTraversalIterator = BackwardTreeTraversalIterator;
            class TreeHelpers {
                static TraverseListPreorder(list, childrenSelector, operation, iteratorFactory = new BackwardTreeTraversalIteratorFactory(), trackPath = false) {
                    var iterator = iteratorFactory.Create(list);
                    while (iterator.MoveNext()) {
                        TreeHelpers.TraversePreorder(iterator.Current, childrenSelector, operation, iteratorFactory, null, 0, iterator.CurrentIndex, trackPath, []);
                    }
                }
                static TraversePreorder(currentItem, childrenSelector, operation, iteratorFactory = new BackwardTreeTraversalIteratorFactory(), parent = null, level = 0, index = 0, trackPath = false, path = []) {
                    const canContinue = operation(currentItem, parent, level, index, path);
                    if (!canContinue)
                        return false;
                    if (trackPath) {
                        path.push(currentItem);
                    }
                    const children = childrenSelector(currentItem);
                    if (children) {
                        var iterator = iteratorFactory.Create(children);
                        while (iterator.MoveNext()) {
                            var nextLevel = level + 1;
                            TreeHelpers.TraversePreorder(iterator.Current, childrenSelector, operation, iteratorFactory, currentItem, nextLevel, iterator.CurrentIndex, trackPath, path.slice(0));
                        }
                    }
                    return true;
                }
                static TraverseListPostOrder(list, childrenSelector, operation, iteratorFactory = new BackwardTreeTraversalIteratorFactory(), canContinueProcessing = () => true) {
                    var iterator = iteratorFactory.Create(list);
                    while (iterator.MoveNext()) {
                        TreeHelpers.TraversePostOrder(iterator.Current, childrenSelector, operation, iteratorFactory, canContinueProcessing, null, 0, iterator.CurrentIndex);
                    }
                }
                static TraversePostOrder(currentItem, childrenSelector, operation, iteratorFactory = new BackwardTreeTraversalIteratorFactory(), canContinueProcessing = () => true, parent = null, level = 0, index = 0) {
                    const canContinue = canContinueProcessing(currentItem, parent, level, index);
                    if (!canContinue)
                        return false;
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
                static Convert(currentItem, childrenSelector, resultChildrenSelector, convertOperation, addChildrenOperation = null, parent = null, convertedParent = null, level = 0, index = 0) {
                    const convertedCurrentItem = convertOperation(currentItem, parent, convertedParent, level, index);
                    if (!convertedCurrentItem)
                        return null;
                    const children = childrenSelector(currentItem);
                    if (children) {
                        for (let i = 0; i < children.length; i++) {
                            const chi = children[i];
                            const nextLevel = level + 1;
                            const childConverted = TreeHelpers
                                .Convert(chi, childrenSelector, resultChildrenSelector, convertOperation, addChildrenOperation, currentItem, convertedCurrentItem, nextLevel, i);
                            if (childConverted) {
                                if (addChildrenOperation) {
                                    addChildrenOperation(convertedCurrentItem, childConverted);
                                }
                                else {
                                    resultChildrenSelector(convertedCurrentItem).push(childConverted);
                                }
                            }
                        }
                    }
                    return convertedCurrentItem;
                }
                static ConvertListToLookup(list, childrenSelector, keySelector) {
                    var result = new collections.Dictionary();
                    list.forEach(x => {
                        this.ConvertToLookup(x, childrenSelector, keySelector, result);
                    });
                    return result;
                }
                static ConvertToLookup(root, childrenSelector, keySelector, result = new collections.Dictionary()) {
                    TreeHelpers.TraversePreorder(root, childrenSelector, (x) => {
                        result.setValue(keySelector(x), x);
                        return true;
                    });
                    return result;
                }
                static GetByPredicate(input, childrenSelector, predicate, deepCopyFunction) {
                    var result = [];
                    TreeHelpers.TraversePreorder(input, childrenSelector, (x) => {
                        if (predicate(x)) {
                            result.push(deepCopyFunction(x));
                        }
                        return true;
                    });
                    return result;
                }
                static ReconstructFromLeafs(leafsList, fullHierarchyLookup, itemUniqueNameSelector, itemParentUniqueNameSelector, childrenSelector, deepCopyFunction) {
                    var lookup = new collections.Dictionary();
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
                static Union(rootA, rootB, itemUniqueNameSelector, childrenSelector, parentPropertyName, deepCopyFunction) {
                    const rootUniqueName = itemUniqueNameSelector(rootA);
                    var lookup = new collections.Dictionary();
                    var lookupFillFunction = (i, parent, level, index) => {
                        if (parent) {
                            i[parentPropertyName] = itemUniqueNameSelector(parent);
                        }
                        lookup.setValue(itemUniqueNameSelector(i), deepCopyFunction(i, false));
                        return true;
                    };
                    TreeHelpers.TraversePreorder(rootA, childrenSelector, (i, parent, level, index) => {
                        return lookupFillFunction(i, parent, level, index);
                    });
                    TreeHelpers.TraversePreorder(rootB, childrenSelector, (i, parent, level, index) => {
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
                static IntersectChildren(a, b, uniqueNameSelector) {
                    var result = [];
                    var aSet = new collections.Dictionary();
                    a.forEach(x => aSet.setValue(uniqueNameSelector(x), x));
                    var bSet = new collections.Dictionary();
                    b.forEach(x => bSet.setValue(uniqueNameSelector(x), x));
                    aSet.keys().forEach((key) => {
                        var value = bSet.getValue(key);
                        if (value) {
                            result.push(new IntersectionPair(aSet.getValue(key), value));
                        }
                    });
                    return result;
                }
                static Intersection(a, b, uniqueNameSelector, childrenSelector, childrenAppender, deepCopy) {
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
                    var children = [];
                    pairs.forEach((pair) => {
                        var child = TreeHelpers.Intersection(pair.A, pair.B, uniqueNameSelector, childrenSelector, childrenAppender, deepCopy);
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
                static Flatten(root, childrenSelector, includePredicate = (x) => { return true; }) {
                    return TreeHelpers.FlattenInternal([], childrenSelector(root), childrenSelector, includePredicate);
                }
                static FlattenArray(rootList, childrenSelector, includePredicate = (x) => { return true; }) {
                    return TreeHelpers.FlattenInternal([], rootList, childrenSelector, includePredicate);
                }
                static FlattenInternal(result, list, childrenSelector, includePredicate = (x) => { return true; }) {
                    var stack = new collections.Stack();
                    list.forEach(i => { stack.push(i); });
                    while (!stack.isEmpty()) {
                        const current = stack.pop();
                        if (includePredicate(current))
                            result.push(current);
                        const children = childrenSelector(current);
                        if (children) {
                            children.forEach(i => { stack.push(i); });
                        }
                    }
                    return result;
                }
                static TraverseListBFS(list, childrenSelector, operation, trackVisited = false) {
                    TreeHelpers.TraverseBFS(null, childrenSelector, operation, list.slice());
                }
                static TraverseBFS(currentItem, childrenSelector, operation, queue) {
                    var iterationIndex = 0;
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
            TreeHelpers.HIERARCHY_ROOT_UNIQUE_NAME = "HierarchyRoot_297473E5-182B-43E5-BBD0-C7A994992778";
            TreeUtils.TreeHelpers = TreeHelpers;
            class IntersectionPair {
                constructor(A, B) {
                    this.A = A;
                    this.B = B;
                }
            }
            TreeUtils.IntersectionPair = IntersectionPair;
        })(TreeUtils = Utils.TreeUtils || (Utils.TreeUtils = {}));
    })(Utils = Comarch.Utils || (Comarch.Utils = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJlZUhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUcmVlSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLE9BQU8sQ0F5WGI7QUF6WEQsV0FBTyxPQUFPO0lBQUMsSUFBQSxLQUFLLENBeVhuQjtJQXpYYyxXQUFBLEtBQUs7UUFBQyxJQUFBLFNBQVMsQ0F5WDdCO1FBelhvQixXQUFBLFNBQVM7WUFPMUI7YUFHQztZQUhzQiwwQ0FBZ0MsbUNBR3RELENBQUE7WUFFRCx5Q0FBb0QsU0FBUSxnQ0FBbUM7Z0JBQzNGLE1BQU0sQ0FBQyxJQUFTLElBQStCLE9BQU8sSUFBSSw0QkFBNEIsQ0FBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckc7WUFGWSw2Q0FBbUMsc0NBRS9DLENBQUE7WUFDRCwwQ0FBcUQsU0FBUSxnQ0FBbUM7Z0JBQzVGLE1BQU0sQ0FBQyxJQUFTLElBQStCLE9BQU8sSUFBSSw2QkFBNkIsQ0FBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEc7WUFGWSw4Q0FBb0MsdUNBRWhELENBQUE7WUFRRDtnQkFHSSxZQUFZLElBQWM7b0JBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixDQUFDO2dCQUNELElBQUksT0FBTyxLQUFRLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUEsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLFlBQVksS0FBYSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBRTVEO1lBVHFCLG1DQUF5Qiw0QkFTOUMsQ0FBQTtZQUVELGtDQUE2QyxTQUFRLHlCQUE0QjtnQkFDN0UsWUFBWSxJQUFjO29CQUN0QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ1osSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCxRQUFRO29CQUNKLElBQUks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LEtBQUwsYUFBSyxRQXlYbkI7QUFBRCxDQUFDLEVBelhNLE9BQU8sS0FBUCxPQUFPLFFBeVhiIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIENvbWFyY2guVXRpbHMuVHJlZVV0aWxzIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVRyYXZlcnNlUHJlT3JkZXJPcGVyYXRpb24ge1xyXG4gICAgICAgIE9wZXJhdGlvbjogKGksIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiBib29sZWFuO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxUPiB7XHJcbiAgICAgICAgQ3JlYXRlKGxpc3Q6IEFycmF5PFQ+KTogSVRyZWVUcmF2ZXJzYWxJdGVyYXRvcjxUPjtcclxuICAgIH1cclxuICAgIGV4cG9ydCBhYnN0cmFjdCAgY2xhc3MgVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeUJhc2U8VD4gaW1wbGVtZW50cyBJVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxUPlxyXG4gICAge1xyXG4gICAgICAgIGFic3RyYWN0IENyZWF0ZShsaXN0OiBBcnJheTxUPik6IElUcmVlVHJhdmVyc2FsSXRlcmF0b3I8VD47XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PFQ+IGV4dGVuZHMgVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeUJhc2U8VD4ge1xyXG4gICAgICAgIENyZWF0ZShsaXN0OiBUW10pOiBJVHJlZVRyYXZlcnNhbEl0ZXJhdG9yPFQ+IHsgcmV0dXJuIG5ldyBGcm93YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yPFQ+KGxpc3QpOyB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgY2xhc3MgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PFQ+IGV4dGVuZHMgVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeUJhc2U8VD4ge1xyXG4gICAgICAgIENyZWF0ZShsaXN0OiBUW10pOiBJVHJlZVRyYXZlcnNhbEl0ZXJhdG9yPFQ+IHsgcmV0dXJuIG5ldyBCYWNrd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvcjxUPihsaXN0KTsgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVRyZWVUcmF2ZXJzYWxJdGVyYXRvcjxUPiB7XHJcbiAgICAgICAgQ3VycmVudDogVDtcclxuICAgICAgICBDdXJyZW50SW5kZXg6IG51bWJlcjtcclxuICAgICAgICBNb3ZlTmV4dCgpOiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUcmVlVHJhdmVyc2FsSXRlcmF0b3JCYXNlPFQ+IGltcGxlbWVudHMgSVRyZWVUcmF2ZXJzYWxJdGVyYXRvcjxUPiB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9saXN0OiBBcnJheTxUPjtcclxuICAgICAgICBwcm90ZWN0ZWQgX2N1cnJlbnRJbmRleDogbnVtYmVyO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGxpc3Q6IEFycmF5PFQ+KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3QgPSBsaXN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgQ3VycmVudCgpOiBUIHsgcmV0dXJuIHRoaXMuX2xpc3RbdGhpcy5fY3VycmVudEluZGV4XSB9XHJcbiAgICAgICAgZ2V0IEN1cnJlbnRJbmRleCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY3VycmVudEluZGV4OyB9XHJcbiAgICAgICAgYWJzdHJhY3QgTW92ZU5leHQoKTogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRnJvd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvcjxUPiBleHRlbmRzIFRyZWVUcmF2ZXJzYWxJdGVyYXRvckJhc2U8VD4ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGxpc3Q6IEFycmF5PFQ+KSB7XHJcbiAgICAgICAgICAgIHN1cGVyKGxpc3QpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50SW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgTW92ZU5leHQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRJbmRleCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudEluZGV4IDwgdGhpcy5fbGlzdC5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCYWNrd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvcjxUPiBleHRlbmRzIFRyZWVUcmF2ZXJzYWxJdGVyYXRvckJhc2U8VD4ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGxpc3Q6IEFycmF5PFQ+KSB7XHJcbiAgICAgICAgICAgIHN1cGVyKGxpc3QpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50SW5kZXggPSBsaXN0Lmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgTW92ZU5leHQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRJbmRleC0tO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudEluZGV4ID49IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUcmVlSGVscGVycyB7XHJcblxyXG4gICAgICAgIHN0YXRpYyBISUVSQVJDSFlfUk9PVF9VTklRVUVfTkFNRSA9IFwiSGllcmFyY2h5Um9vdF8yOTc0NzNFNS0xODJCLTQzRTUtQkJEMC1DN0E5OTQ5OTI3NzhcIjtcclxuICAgICAgICBzdGF0aWMgVHJhdmVyc2VMaXN0UHJlb3JkZXI8VD4obGlzdDogVFtdLFxyXG4gICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yOiAoeDogVCkgPT4gQXJyYXk8VD4sXHJcbiAgICAgICAgICAgIG9wZXJhdGlvbjogKHg6IFQsIHBhcmVudD86IFQsIGxldmVsPzogbnVtYmVyLCBpbmRleD86IG51bWJlcixwYXRoPzpUW10pID0+IGJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yRmFjdG9yeTogSVRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8VD4gPSBuZXcgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PFQ+KCksXHJcbiAgICAgICAgICAgIHRyYWNrUGF0aCA9IGZhbHNlLFxyXG4gICAgICAgICAgICApIDogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhdG9yRmFjdG9yeS5DcmVhdGUobGlzdCk7XHJcbiAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvci5Nb3ZlTmV4dCgpKSB7XHJcbiAgICAgICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZVByZW9yZGVyPFQ+KGl0ZXJhdG9yLkN1cnJlbnQsIGNoaWxkcmVuU2VsZWN0b3IsIG9wZXJhdGlvbiwgaXRlcmF0b3JGYWN0b3J5LCBudWxsLCAwLCBpdGVyYXRvci5DdXJyZW50SW5kZXgsdHJhY2tQYXRoLFtdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBzdGF0aWMgVHJhdmVyc2VQcmVvcmRlcjxUPihjdXJyZW50SXRlbTogVCxcclxuICAgICAgICAgICAgY2hpbGRyZW5TZWxlY3RvcjogKHg6IFQpID0+IEFycmF5PFQ+LFxyXG4gICAgICAgICAgICBvcGVyYXRpb246ICh4OiBULCBwYXJlbnQ/OiBULCBsZXZlbD86IG51bWJlciwgaW5kZXg/OiBudW1iZXIscGF0aD86VFtdKSA9PiBib29sZWFuLFxyXG4gICAgICAgICAgICBpdGVyYXRvckZhY3Rvcnk6IElUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PFQ+ID0gbmV3IEJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxUPigpLFxyXG4gICAgICAgICAgICBwYXJlbnQ6IFQgPSBudWxsLFxyXG4gICAgICAgICAgICBsZXZlbDogbnVtYmVyID0gMCxcclxuICAgICAgICAgICAgaW5kZXg6IG51bWJlciA9IDAsXHJcbiAgICAgICAgICAgIHRyYWNrUGF0aCA9IGZhbHNlLFxyXG4gICAgICAgICAgICBwYXRoOlRbXT1bXVxyXG4gICAgICAgICkgOiBib29sZWFuIHtcclxuICAgICAgICAgICAgY29uc3QgY2FuQ29udGludWUgPSBvcGVyYXRpb24oY3VycmVudEl0ZW0sIHBhcmVudCwgbGV2ZWwsIGluZGV4LHBhdGgpO1xyXG4gICAgICAgICAgICBpZiAoIWNhbkNvbnRpbnVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmICh0cmFja1BhdGgpIHtcclxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChjdXJyZW50SXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBjaGlsZHJlblNlbGVjdG9yKGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYXRvckZhY3RvcnkuQ3JlYXRlKGNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvci5Nb3ZlTmV4dCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRMZXZlbCA9IGxldmVsICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZVByZW9yZGVyKGl0ZXJhdG9yLkN1cnJlbnQsIGNoaWxkcmVuU2VsZWN0b3IsIG9wZXJhdGlvbiwgaXRlcmF0b3JGYWN0b3J5LCBjdXJyZW50SXRlbSwgbmV4dExldmVsLCBpdGVyYXRvci5DdXJyZW50SW5kZXgsdHJhY2tQYXRoLHBhdGguc2xpY2UoMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIFRyYXZlcnNlTGlzdFBvc3RPcmRlcjxUPihsaXN0OiBUW10sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPixcclxuICAgICAgICAgICAgb3BlcmF0aW9uOiAoeDogVCwgcGFyZW50OiBULCBsZXZlbDogbnVtYmVyLCBpbmRleDogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgICAgICAgICBpdGVyYXRvckZhY3Rvcnk6IElUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PFQ+ID0gbmV3IEJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxUPigpLFxyXG4gICAgICAgICAgICBjYW5Db250aW51ZVByb2Nlc3Npbmc6ICh4OiBULCBwYXJlbnQ6IFQsIGxldmVsOiBudW1iZXIsIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW49KCk9PnRydWUsXHJcbiAgICAgICAgICAgKTp2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmF0b3JGYWN0b3J5LkNyZWF0ZShsaXN0KTtcclxuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yLk1vdmVOZXh0KCkpIHtcclxuICAgICAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlUG9zdE9yZGVyPFQ+KGl0ZXJhdG9yLkN1cnJlbnQsIGNoaWxkcmVuU2VsZWN0b3IsIG9wZXJhdGlvbiwgaXRlcmF0b3JGYWN0b3J5LCBjYW5Db250aW51ZVByb2Nlc3NpbmcsbnVsbCwwLGl0ZXJhdG9yLkN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBUcmF2ZXJzZVBvc3RPcmRlcjxUPihjdXJyZW50SXRlbTogVCxcclxuICAgICAgICAgICAgY2hpbGRyZW5TZWxlY3RvcjogKHg6IFQpID0+IEFycmF5PFQ+LFxyXG4gICAgICAgICAgICBvcGVyYXRpb246ICh4OiBULCBwYXJlbnQ6IFQsIGxldmVsOiBudW1iZXIsIGluZGV4OiBudW1iZXIpID0+IHZvaWQsXHJcbiAgICAgICAgICAgIGl0ZXJhdG9yRmFjdG9yeTogSVRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8VD4gPSBuZXcgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PFQ+KCksXHJcbiAgICAgICAgICAgIGNhbkNvbnRpbnVlUHJvY2Vzc2luZzogKHg6IFQsIHBhcmVudDogVCwgbGV2ZWw6IG51bWJlciwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbiA9ICgpID0+IHRydWUgLFxyXG4gICAgICAgICAgICBwYXJlbnQ6IFQgPSBudWxsLFxyXG4gICAgICAgICAgICBsZXZlbDogbnVtYmVyID0gMCxcclxuICAgICAgICAgICAgaW5kZXg6IG51bWJlciA9IDAsXHJcbiAgICAgICAgICAgICk6Ym9vbGVhbiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhbkNvbnRpbnVlID0gY2FuQ29udGludWVQcm9jZXNzaW5nKGN1cnJlbnRJdGVtLCBwYXJlbnQsIGxldmVsLCBpbmRleCk7XHJcbiAgICAgICAgICAgIGlmICghY2FuQ29udGludWUpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBjaGlsZHJlblNlbGVjdG9yKGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYXRvckZhY3RvcnkuQ3JlYXRlKGNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvci5Nb3ZlTmV4dCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRMZXZlbCA9IGxldmVsICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBUcmVlSGVscGVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuVHJhdmVyc2VQb3N0T3JkZXIoaXRlcmF0b3IuQ3VycmVudCwgY2hpbGRyZW5TZWxlY3Rvciwgb3BlcmF0aW9uLCBpdGVyYXRvckZhY3RvcnksIGNhbkNvbnRpbnVlUHJvY2Vzc2luZywgY3VycmVudEl0ZW0sIG5leHRMZXZlbCwgaXRlcmF0b3IuQ3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcGVyYXRpb24oY3VycmVudEl0ZW0sIHBhcmVudCwgbGV2ZWwsIGluZGV4KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgQ29udmVydDxULCBUUmVzdWx0PihcclxuICAgICAgICAgICAgY3VycmVudEl0ZW06IFQsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPixcclxuICAgICAgICAgICAgcmVzdWx0Q2hpbGRyZW5TZWxlY3RvcjogKHg6IFRSZXN1bHQpID0+IEFycmF5PFRSZXN1bHQ+LFxyXG4gICAgICAgICAgICBjb252ZXJ0T3BlcmF0aW9uOiAoeDogVCwgcGFyZW50OiBULCBjb252ZXJ0ZWRQYXJlbnQ6IFRSZXN1bHQsIGxldmVsOiBudW1iZXIsIGluZGV4OiBudW1iZXIpID0+IFRSZXN1bHQsXHJcbiAgICAgICAgICAgIGFkZENoaWxkcmVuT3BlcmF0aW9uOiAocGFyZW50OlRSZXN1bHQsY2hpbGQ6IFRSZXN1bHQpID0+IHZvaWQ9bnVsbCxcclxuICAgICAgICAgICAgcGFyZW50OiBUID0gbnVsbCxcclxuICAgICAgICAgICAgY29udmVydGVkUGFyZW50OiBUUmVzdWx0ID0gbnVsbCxcclxuICAgICAgICAgICAgbGV2ZWw6IG51bWJlciA9IDAsXHJcbiAgICAgICAgICAgIGluZGV4OiBudW1iZXIgPSAwKTogVFJlc3VsdCB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZEN1cnJlbnRJdGVtID0gY29udmVydE9wZXJhdGlvbihjdXJyZW50SXRlbSwgcGFyZW50LCBjb252ZXJ0ZWRQYXJlbnQsIGxldmVsLCBpbmRleCk7XHJcbiAgICAgICAgICAgIGlmICghY29udmVydGVkQ3VycmVudEl0ZW0pIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGNoaWxkcmVuU2VsZWN0b3IoY3VycmVudEl0ZW0pO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGkgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGV2ZWwgPSBsZXZlbCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDb252ZXJ0ZWQgPSBUcmVlSGVscGVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuQ29udmVydDxULCBUUmVzdWx0PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuU2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRDaGlsZHJlblNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udmVydE9wZXJhdGlvbiwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDaGlsZHJlbk9wZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udmVydGVkQ3VycmVudEl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0TGV2ZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRDb252ZXJ0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFkZENoaWxkcmVuT3BlcmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDaGlsZHJlbk9wZXJhdGlvbihjb252ZXJ0ZWRDdXJyZW50SXRlbSxjaGlsZENvbnZlcnRlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRDaGlsZHJlblNlbGVjdG9yKGNvbnZlcnRlZEN1cnJlbnRJdGVtKS5wdXNoKGNoaWxkQ29udmVydGVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY29udmVydGVkQ3VycmVudEl0ZW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgQ29udmVydExpc3RUb0xvb2t1cDxUPihsaXN0OiBUW10sIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPiwga2V5U2VsZWN0b3I6ICh4OiBUKSA9PiBzdHJpbmcpOiBjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PHN0cmluZywgVD4ge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IGNvbGxlY3Rpb25zLkRpY3Rpb25hcnk8c3RyaW5nLCBUPigpO1xyXG4gICAgICAgICAgICBsaXN0LmZvckVhY2goeCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNvbnZlcnRUb0xvb2t1cCh4LCBjaGlsZHJlblNlbGVjdG9yLCBrZXlTZWxlY3RvcixyZXN1bHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBDb252ZXJ0VG9Mb29rdXA8VD4ocm9vdDogVCwgY2hpbGRyZW5TZWxlY3RvcjogKHg6IFQpID0+IEFycmF5PFQ+LCBrZXlTZWxlY3RvcjogKHg6IFQpID0+IHN0cmluZyxyZXN1bHQ6Y29sbGVjdGlvbnMuRGljdGlvbmFyeTxzdHJpbmcsIFQ+PSBuZXcgY29sbGVjdGlvbnMuRGljdGlvbmFyeTxzdHJpbmcsIFQ+KCkpOiBjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PHN0cmluZywgVD4ge1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZVByZW9yZGVyKHJvb3QsXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuc2V0VmFsdWUoa2V5U2VsZWN0b3IoeCksIHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgR2V0QnlQcmVkaWNhdGU8VD4oaW5wdXQ6IFQsIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPiwgcHJlZGljYXRlOiAoeDogVCkgPT4gYm9vbGVhbiwgZGVlcENvcHlGdW5jdGlvbjogKHg6IFQpID0+IFQpOiBBcnJheTxUPiB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQ6IEFycmF5PFQ+ID0gW107XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlUHJlb3JkZXIoaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlKHgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRlZXBDb3B5RnVuY3Rpb24oeCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBSZWNvbnN0cnVjdEZyb21MZWFmczxUPihsZWFmc0xpc3Q6IEFycmF5PFQ+LFxyXG4gICAgICAgICAgICBmdWxsSGllcmFyY2h5TG9va3VwOiBjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PHN0cmluZywgVD4sXHJcbiAgICAgICAgICAgIGl0ZW1VbmlxdWVOYW1lU2VsZWN0b3I6ICh4OiBUKSA9PiBzdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW1QYXJlbnRVbmlxdWVOYW1lU2VsZWN0b3I6ICh4OiBUKSA9PiBzdHJpbmcsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPixcclxuICAgICAgICAgICAgZGVlcENvcHlGdW5jdGlvbjogKFQsIGJvb2xlYW4pID0+IFQpOiBUIHtcclxuICAgICAgICAgICAgdmFyIGxvb2t1cCA9IG5ldyBjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PHN0cmluZywgVD4oKTtcclxuICAgICAgICAgICAgbGVhZnNMaXN0LmZvckVhY2goeCA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHVuaXF1ZU5hbWUgPSBpdGVtVW5pcXVlTmFtZVNlbGVjdG9yKHgpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEl0ZW0gPSBmdWxsSGllcmFyY2h5TG9va3VwLmdldFZhbHVlKHVuaXF1ZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0gPSBkZWVwQ29weUZ1bmN0aW9uKGN1cnJlbnRJdGVtLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9va3VwLnNldFZhbHVlKHVuaXF1ZU5hbWUsIGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50VW5pcXVlTmFtZSA9IGl0ZW1QYXJlbnRVbmlxdWVOYW1lU2VsZWN0b3IoY3VycmVudEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gZnVsbEhpZXJhcmNoeUxvb2t1cC5nZXRWYWx1ZShwYXJlbnRVbmlxdWVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0gPSBkZWVwQ29weUZ1bmN0aW9uKGN1cnJlbnRJdGVtLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb2t1cC5zZXRWYWx1ZShwYXJlbnRVbmlxdWVOYW1lLCBjdXJyZW50SXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRVbmlxdWVOYW1lID0gaXRlbVBhcmVudFVuaXF1ZU5hbWVTZWxlY3RvcihjdXJyZW50SXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gZnVsbEhpZXJhcmNoeUxvb2t1cC5nZXRWYWx1ZShwYXJlbnRVbmlxdWVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbG9va3VwLmZvckVhY2goKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBsb29rdXAuZ2V0VmFsdWUoaXRlbVBhcmVudFVuaXF1ZU5hbWVTZWxlY3Rvcih2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuU2VsZWN0b3IocGFyZW50KS5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBsb29rdXAuZ2V0VmFsdWUoVHJlZUhlbHBlcnMuSElFUkFSQ0hZX1JPT1RfVU5JUVVFX05BTUUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBSZXR1cm5zIGRlZXBDb3B5IG9mIHVuaW9uIG9mIHR3byB0cmVlcyB3aXRoIGNvbW1vbiByb290IGFuZCBzYW1lIGRlcHRoXHJcbiAgICAgICAgKi9cclxuICAgICAgICBzdGF0aWMgVW5pb248VD4ocm9vdEE6IFQsXHJcbiAgICAgICAgICAgIHJvb3RCOiBULFxyXG4gICAgICAgICAgICBpdGVtVW5pcXVlTmFtZVNlbGVjdG9yOiAoeDogVCkgPT4gc3RyaW5nLFxyXG4gICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yOiAoeDogVCkgPT4gQXJyYXk8VD4sXHJcbiAgICAgICAgICAgIHBhcmVudFByb3BlcnR5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICBkZWVwQ29weUZ1bmN0aW9uOiAoVCwgYm9vbGVhbikgPT4gVCk6IFQge1xyXG4gICAgICAgICAgICBjb25zdCByb290VW5pcXVlTmFtZSA9IGl0ZW1VbmlxdWVOYW1lU2VsZWN0b3Iocm9vdEEpO1xyXG4gICAgICAgICAgICB2YXIgbG9va3VwID0gbmV3IGNvbGxlY3Rpb25zLkRpY3Rpb25hcnk8c3RyaW5nLCBUPigpO1xyXG4gICAgICAgICAgICB2YXIgbG9va3VwRmlsbEZ1bmN0aW9uID0gKGksIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaVtwYXJlbnRQcm9wZXJ0eU5hbWVdID0gaXRlbVVuaXF1ZU5hbWVTZWxlY3RvcihwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9va3VwLnNldFZhbHVlKGl0ZW1VbmlxdWVOYW1lU2VsZWN0b3IoaSksIGRlZXBDb3B5RnVuY3Rpb24oaSwgZmFsc2UpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZVByZW9yZGVyPFQ+KHJvb3RBLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5TZWxlY3RvcixcclxuICAgICAgICAgICAgICAgIChpLCBwYXJlbnQsIGxldmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb29rdXBGaWxsRnVuY3Rpb24oaSwgcGFyZW50LCBsZXZlbCwgaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlUHJlb3JkZXI8VD4ocm9vdEIsXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgKGksIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvb2t1cEZpbGxGdW5jdGlvbihpLCBwYXJlbnQsIGxldmVsLCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbG9va3VwLmZvckVhY2goKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRVbmlxdWVOYW1lID0gdmFsdWVbcGFyZW50UHJvcGVydHlOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRVbmlxdWVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbG9va3VwLmdldFZhbHVlKHBhcmVudFVuaXF1ZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5TZWxlY3RvcihwYXJlbnQpLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBsb29rdXAuZ2V0VmFsdWUocm9vdFVuaXF1ZU5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBJbnRlcnNlY3RDaGlsZHJlbjxUPihhOiBBcnJheTxUPiwgYjogQXJyYXk8VD4sIHVuaXF1ZU5hbWVTZWxlY3RvcjogKHg6IFQpID0+IHN0cmluZyk6IEFycmF5PEludGVyc2VjdGlvblBhaXI8VD4+IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgYVNldCA9IG5ldyBjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5PHN0cmluZywgVD4oKTtcclxuICAgICAgICAgICAgYS5mb3JFYWNoKHggPT4gYVNldC5zZXRWYWx1ZSh1bmlxdWVOYW1lU2VsZWN0b3IoeCksIHgpKTtcclxuICAgICAgICAgICAgdmFyIGJTZXQgPSBuZXcgY29sbGVjdGlvbnMuRGljdGlvbmFyeTxzdHJpbmcsIFQ+KCk7XHJcbiAgICAgICAgICAgIGIuZm9yRWFjaCh4ID0+IGJTZXQuc2V0VmFsdWUodW5pcXVlTmFtZVNlbGVjdG9yKHgpLCB4KSk7XHJcbiAgICAgICAgICAgIGFTZXQua2V5cygpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBiU2V0LmdldFZhbHVlKGtleSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgSW50ZXJzZWN0aW9uUGFpcihhU2V0LmdldFZhbHVlKGtleSksIHZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAqIFJldHVybnMgZGVlcENvcHkgb2YgaW50ZXJzZWN0aW9uIG9mIHR3byB0cmVlcyB3aXRoIGNvbW1vbiByb290LCB0cmVlIGNhbiBoYXZlIGRpZmZyZW50IGRlcHRoXHJcbiAgICAgKi9cclxuICAgICAgICBzdGF0aWMgSW50ZXJzZWN0aW9uPFQ+KGE6IFQsXHJcbiAgICAgICAgICAgIGI6IFQsXHJcbiAgICAgICAgICAgIHVuaXF1ZU5hbWVTZWxlY3RvcjogKHg6IFQpID0+IHN0cmluZyxcclxuICAgICAgICAgICAgY2hpbGRyZW5TZWxlY3RvcjogKHg6IFQpID0+IEFycmF5PFQ+LFxyXG4gICAgICAgICAgICBjaGlsZHJlbkFwcGVuZGVyOiAobm9kZTogVCwgY2hpbGQ6IFQpID0+IHZvaWQsXHJcbiAgICAgICAgICAgIGRlZXBDb3B5OiAoVCwgYm9vbGVhbikgPT4gVCk6IFQge1xyXG4gICAgICAgICAgICBpZiAoYSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGlmIChiID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgaWYgKHVuaXF1ZU5hbWVTZWxlY3RvcihhKSAhPT0gdW5pcXVlTmFtZVNlbGVjdG9yKGIpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlblNlbGVjdG9yKGEpLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWVwQ29weShiLCB0cnVlKTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuU2VsZWN0b3IoYikubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZXBDb3B5KGEsIHRydWUpO1xyXG4gICAgICAgICAgICBjb25zdCBwYWlycyA9IFRyZWVIZWxwZXJzLkludGVyc2VjdENoaWxkcmVuKGNoaWxkcmVuU2VsZWN0b3IoYSksIGNoaWxkcmVuU2VsZWN0b3IoYiksIHVuaXF1ZU5hbWVTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIGlmIChwYWlycy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuOiBBcnJheTxUPiA9IFtdO1xyXG4gICAgICAgICAgICBwYWlycy5mb3JFYWNoKChwYWlyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBUcmVlSGVscGVycy5JbnRlcnNlY3Rpb248VD4ocGFpci5BLCBwYWlyLkIsIHVuaXF1ZU5hbWVTZWxlY3RvciwgY2hpbGRyZW5TZWxlY3RvciwgY2hpbGRyZW5BcHBlbmRlciwgZGVlcENvcHkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGRlZXBDb3B5KGEsIGZhbHNlKTtcclxuICAgICAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7IGNoaWxkcmVuQXBwZW5kZXIocmVzdWx0LCBjaGlsZCk7IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0aWMgRmxhdHRlbjxUPihyb290OiBULCBjaGlsZHJlblNlbGVjdG9yOiAoeDogVCkgPT4gQXJyYXk8VD4sIGluY2x1ZGVQcmVkaWNhdGU6ICh4OiBUKSA9PiBib29sZWFuID0gKHgpID0+IHsgcmV0dXJuIHRydWU7IH0pOiBBcnJheTxUPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBUcmVlSGVscGVycy5GbGF0dGVuSW50ZXJuYWwoW10sIGNoaWxkcmVuU2VsZWN0b3Iocm9vdCksIGNoaWxkcmVuU2VsZWN0b3IsIGluY2x1ZGVQcmVkaWNhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIEZsYXR0ZW5BcnJheTxUPihyb290TGlzdDogQXJyYXk8VD4sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPixcclxuICAgICAgICAgICAgaW5jbHVkZVByZWRpY2F0ZTogKHg6IFQpID0+IGJvb2xlYW4gPSAoeCkgPT4geyByZXR1cm4gdHJ1ZTsgfSk6IEFycmF5PFQ+IHtcclxuICAgICAgICAgICAgcmV0dXJuIFRyZWVIZWxwZXJzLkZsYXR0ZW5JbnRlcm5hbChbXSwgcm9vdExpc3QsIGNoaWxkcmVuU2VsZWN0b3IsIGluY2x1ZGVQcmVkaWNhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgRmxhdHRlbkludGVybmFsPFQ+KHJlc3VsdDogQXJyYXk8VD4sXHJcbiAgICAgICAgICAgIGxpc3Q6IEFycmF5PFQ+LFxyXG4gICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yOiAoeDogVCkgPT4gQXJyYXk8VD4sXHJcbiAgICAgICAgICAgIGluY2x1ZGVQcmVkaWNhdGU6ICh4OiBUKSA9PiBib29sZWFuID0gKHgpID0+IHsgcmV0dXJuIHRydWU7IH0pOiBBcnJheTxUPiB7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RhY2sgPSBuZXcgY29sbGVjdGlvbnMuU3RhY2s8VD4oKTtcclxuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKGkgPT4geyBzdGFjay5wdXNoKGkpIH0pO1xyXG4gICAgICAgICAgICB3aGlsZSAoIXN0YWNrLmlzRW1wdHkoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVQcmVkaWNhdGUoY3VycmVudCkpIHJlc3VsdC5wdXNoKGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBjaGlsZHJlblNlbGVjdG9yKGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChpID0+IHsgc3RhY2sucHVzaChpKSB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFRyYXZlcnNlTGlzdEJGUzxUPihsaXN0OiBUW10sIGNoaWxkcmVuU2VsZWN0b3I6ICh4OiBUKSA9PiBBcnJheTxUPiwgb3BlcmF0aW9uOiAoY3VycmVudDogVCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbiwgdHJhY2tWaXNpdGVkOiBib29sZWFuPSBmYWxzZSkge1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUJGUyhudWxsLGNoaWxkcmVuU2VsZWN0b3Isb3BlcmF0aW9uLGxpc3Quc2xpY2UoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFRyYXZlcnNlQkZTPFQ+KGN1cnJlbnRJdGVtOiBULCBjaGlsZHJlblNlbGVjdG9yOiAoeDogVCkgPT4gQXJyYXk8VD4sIG9wZXJhdGlvbjogKGN1cnJlbnQ6IFQsIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW4scXVldWU6VFtdKSB7XHJcbiAgICAgICAgICAgIHZhciBpdGVyYXRpb25JbmRleDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKVxyXG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChjdXJyZW50SXRlbSk7XHJcbiAgICAgICAgICAgIHZhciBjYW5Db250aW51ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwICYmIGNhbkNvbnRpbnVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudCA9IHF1ZXVlLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblNlbGVjdG9yKGN1cnJlbnQpLmZvckVhY2goYyA9PiBxdWV1ZS5wdXNoKGMpKTtcclxuICAgICAgICAgICAgICAgIGNhbkNvbnRpbnVlID0gb3BlcmF0aW9uKGN1cnJlbnQsIGl0ZXJhdGlvbkluZGV4KTtcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbkluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEludGVyc2VjdGlvblBhaXI8VD4ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBBOiBULCBwdWJsaWMgQjogVCkge31cclxuICAgIH1cclxufSJdfQ==