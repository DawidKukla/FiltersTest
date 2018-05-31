var TestTree;
(function (TestTree) {
    var Common;
    (function (Common) {
        ($ => {
            "use strict";
            $.jstree.plugins["comarch_redraw_node"] = function (options, parent) {
                console.log(options);
                this.redraw_node = function (obj, deep, callback, force_draw) {
                    const id = typeof obj === "object" ? obj["id"] : obj;
                    obj = parent.redraw_node.call(this, obj, deep, callback, force_draw);
                    if (obj) {
                        const nodeObj = this._model.data[id];
                        const args = {
                            CurrentNodeElement: obj,
                            CurrentNodeObj: nodeObj,
                            Callback: callback
                        };
                        this.trigger("comarch_redraw_node.comarch.jstree", args);
                    }
                    return obj;
                };
            };
        })(jQuery);
        class AffectedNodesSet {
            constructor() {
                this._innerObject = {};
            }
            Add(uniqueName) {
                this._innerObject[uniqueName] = true;
                return this;
            }
            AddRange(uniqueNames) {
                uniqueNames.forEach(x => this.Add(x));
                return this;
            }
            Union(other) {
                other.ForEach(x => {
                    this.Add(x);
                    return true;
                });
                return this;
            }
            ToArray() {
                return Object.keys(this._innerObject);
            }
            Contains(uniqueName) {
                return Boolean(this._innerObject[uniqueName]);
            }
            ForEach(operation) {
                let innerObject = this._innerObject;
                for (var key in innerObject) {
                    if (innerObject.hasOwnProperty(key)) {
                        operation(key);
                    }
                }
            }
        }
        AffectedNodesSet.Empty = new AffectedNodesSet();
        Common.AffectedNodesSet = AffectedNodesSet;
        let MemberFilterType;
        (function (MemberFilterType) {
            MemberFilterType[MemberFilterType["BeginsWith"] = 0] = "BeginsWith";
            MemberFilterType[MemberFilterType["EndsWith"] = 1] = "EndsWith";
            MemberFilterType[MemberFilterType["Contains"] = 2] = "Contains";
        })(MemberFilterType = Common.MemberFilterType || (Common.MemberFilterType = {}));
        class MemberFilter {
            constructor(Value, Type) {
                this.Value = Value;
                this.Type = Type;
            }
        }
        Common.MemberFilter = MemberFilter;
        class FilterLevel {
            constructor(UniqueName, Caption) {
                this.UniqueName = UniqueName;
                this.Caption = Caption;
            }
            DeepCopy(obj) {
                return new FilterLevel(obj.UniqueName, obj.Caption);
            }
        }
        Common.FilterLevel = FilterLevel;
        class FilterMetadata {
            constructor(UniqueName, Caption, SortedLevels, RootMembersTotalCount, AllLevelsMembersTotalCount) {
                this.UniqueName = UniqueName;
                this.Caption = Caption;
                this.SortedLevels = SortedLevels;
                this.RootMembersTotalCount = RootMembersTotalCount;
                this.AllLevelsMembersTotalCount = AllLevelsMembersTotalCount;
            }
            DeepCopy(obj) {
                return new FilterMetadata(obj.UniqueName, obj.Caption, JSON.parse(JSON.stringify(obj.SortedLevels)), obj.RootMembersTotalCount, obj.AllLevelsMembersTotalCount);
            }
        }
        Common.FilterMetadata = FilterMetadata;
        class FilterRequestBase {
            constructor(FieldUniqueName) {
                this.FieldUniqueName = FieldUniqueName;
            }
        }
        Common.FilterRequestBase = FilterRequestBase;
        class MetadataRequest extends FilterRequestBase {
            constructor(fieldUniqueName, ExistingLeafs) {
                super(fieldUniqueName);
                this.fieldUniqueName = fieldUniqueName;
                this.ExistingLeafs = ExistingLeafs;
            }
        }
        Common.MetadataRequest = MetadataRequest;
        class MetadataResponse {
            constructor(Metadata, CleanedLeafs) {
                this.Metadata = Metadata;
                this.CleanedLeafs = CleanedLeafs;
            }
        }
        Common.MetadataResponse = MetadataResponse;
        class MembersRequestBase extends FilterRequestBase {
            constructor(fieldUniqueName, Start = 0, Count = 0, Filter = null) {
                super(fieldUniqueName);
                this.Start = Start;
                this.Count = Count;
                this.Filter = Filter;
            }
        }
        Common.MembersRequestBase = MembersRequestBase;
        class MembersRequest extends MembersRequestBase {
            constructor(fieldUniqueName, Start = 0, Count = 0, Filter = null) {
                super(fieldUniqueName, Start, Count, Filter);
                this.Start = Start;
                this.Count = Count;
                this.Filter = Filter;
            }
        }
        Common.MembersRequest = MembersRequest;
        class LeafMembersRequest extends MembersRequestBase {
            constructor(fieldUniqueName, Start = 0, Count = 0, Filter = null) {
                super(fieldUniqueName, Start, Count, Filter);
                this.Start = Start;
                this.Count = Count;
                this.Filter = Filter;
            }
        }
        Common.LeafMembersRequest = LeafMembersRequest;
        class MembersResponse {
        }
        Common.MembersResponse = MembersResponse;
        class ChildrenRequest extends FilterRequestBase {
            constructor(Parent, Start, Count) {
                super(null);
                this.Parent = Parent;
                this.Start = Start;
                this.Count = Count;
            }
        }
        Common.ChildrenRequest = ChildrenRequest;
        class MemberNodesHelper {
            static GetAllParentsNames(parentsLookup, targetNode) {
                return MemberNodesHelper.GetAllParentsDataCore(parentsLookup, targetNode, x => x.id);
            }
            static GetAllParents(parentsLookup, targetNode) {
                return MemberNodesHelper.GetAllParentsDataCore(parentsLookup, targetNode, x => x);
            }
            static GetAllParentsDataCore(parentsLookup, targetNode, dataSelector) {
                var result = [];
                while (true) {
                    let parentNode = parentsLookup[targetNode.data.parentUniqueName];
                    if (!parentNode)
                        break;
                    result.push(dataSelector(parentNode));
                    targetNode = parentNode;
                }
                return result;
            }
            static HierarchizeNodes(nodes, parentsLookup) {
                var resultNodes = [];
                var nodesTochildrenLookup = {};
                var processNode = (parentUniqueName, nodeToNodesChildrenLookupMap, currentNode, resultNodes) => {
                    var childrenLookup = nodeToNodesChildrenLookupMap[parentUniqueName] || (nodeToNodesChildrenLookupMap[parentUniqueName] = {});
                    if (!childrenLookup[currentNode.id]) {
                        resultNodes.push(currentNode);
                        childrenLookup[currentNode.id] = true;
                    }
                };
                nodes.forEach(currentNode => {
                    while (true) {
                        const parent = parentsLookup[currentNode.data.parentUniqueName];
                        if (!parent) {
                            processNode("#", nodesTochildrenLookup, currentNode, resultNodes);
                            break;
                        }
                        else {
                            processNode(parent.id, nodesTochildrenLookup, currentNode, parent.children);
                            currentNode = parent;
                        }
                    }
                });
                return resultNodes;
            }
        }
        Common.MemberNodesHelper = MemberNodesHelper;
    })(Common = TestTree.Common || (TestTree.Common = {}));
})(TestTree || (TestTree = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsUUFBUSxDQXdPakI7QUF4T0QsV0FBVSxRQUFRO0lBQUMsSUFBQSxNQUFNLENBd094QjtJQXhPa0IsV0FBQSxNQUFNO1FBTXJCLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDRCxZQUFZLENBQUM7WUFDYixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLFVBQVMsT0FBTyxFQUFFLE1BQU07Z0JBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVO29CQUN2RCxNQUFNLEVBQUUsR0FBRyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNyRCxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNyRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNOLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNyQyxNQUFNLElBQUksR0FBRzs0QkFDVCxrQkFBa0IsRUFBRyxHQUFxQjs0QkFDMUMsY0FBYyxFQUFFLE9BQU87NEJBQ3ZCLFFBQVEsRUFBRSxRQUFRO3lCQUNyQixDQUFDO3dCQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzdELENBQUM7b0JBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztn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V0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDOUIsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQzFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFBO2dCQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3hCLE9BQU8sSUFBSSxFQUFFLENBQUM7d0JBQ1YsTUFBTSxNQUFNLEdBQWdCLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQzdFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs0QkFDVixXQUFXLENBQUMsR0FBRyxFQUFDLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzs0QkFDakUsS0FBSyxDQUFDO3dCQUNWLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ0osV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUMscUJBQXFCLEVBQUUsV0FBVyxFQUFHLE1BQU0sQ0FBQyxRQUF5QixDQUFDLENBQUM7NEJBQzdGLFdBQVcsR0FBRyxNQUFNLENBQUM7d0JBQ3pCLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ3ZCLENBQUM7U0FFSjtRQTdDWSx3QkFBaUIsb0JBNkM3QixDQUFBO0lBU0wsQ0FBQyxFQXhPa0IsTUFBTSxHQUFOLGVBQU0sS0FBTixlQUFNLFFBd094QjtBQUFELENBQUMsRUF4T1MsUUFBUSxLQUFSLFFBQVEsUUF3T2pCIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIFRlc3RUcmVlLkNvbW1vbiB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElKc3RyZWVSZWRyYXdOb2RlQXJnczxURGF0YSwgVFR5cGU+IHtcclxuICAgICAgICBDdXJyZW50Tm9kZUVsZW1lbnQ6IEhUTUxMSUVsZW1lbnQ7XHJcbiAgICAgICAgQ3VycmVudE5vZGVPYmo6IElKc1RyZWVOb2RlPFREYXRhLCBUVHlwZT47XHJcbiAgICAgICAgQ2FsbGJhY2s6IGFueTtcclxuICAgIH1cclxuICAgICgkID0+IHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICAkLmpzdHJlZS5wbHVnaW5zW1wiY29tYXJjaF9yZWRyYXdfbm9kZVwiXSA9IGZ1bmN0aW9uKG9wdGlvbnMsIHBhcmVudCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5yZWRyYXdfbm9kZSA9IGZ1bmN0aW9uKG9iaiwgZGVlcCwgY2FsbGJhY2ssIGZvcmNlX2RyYXcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiA/IG9ialtcImlkXCJdIDogb2JqOyAvL3N0b3JlIGNvcHkgYmVjYXVzZSB0aGVuIG9iaiBjaGFuZ2VzIGZyb20gc3RyaW5nIHRvIERPTSBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICBvYmogPSBwYXJlbnQucmVkcmF3X25vZGUuY2FsbCh0aGlzLCBvYmosIGRlZXAsIGNhbGxiYWNrLCBmb3JjZV9kcmF3KTtcclxuICAgICAgICAgICAgICAgIGlmIChvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlT2JqID0gdGhpcy5fbW9kZWwuZGF0YVtpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ3VycmVudE5vZGVFbGVtZW50OiAob2JqIGFzIEhUTUxMSUVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDdXJyZW50Tm9kZU9iajogbm9kZU9iaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2s6IGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJjb21hcmNoX3JlZHJhd19ub2RlLmNvbWFyY2guanN0cmVlXCIsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgfSkoalF1ZXJ5KTtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElKc1RyZWVOb2RlU3RhdGUge1xyXG4gICAgICAgIG9wZW5lZD86IGJvb2xlYW47XHJcbiAgICAgICAgZGlzYWJsZWQ/OiBib29sZWFuO1xyXG4gICAgICAgIHNlbGVjdGVkPzogYm9vbGVhbjtcclxuICAgICAgICBoaWRkZW4/OiBib29sZWFuO1xyXG4gICAgICAgIHVuZGV0ZXJtaW5lZD86Ym9vbGVhbjtcclxuICAgICAgICBsb2FkZWQ/OmJvb2xlYW47XHJcbiAgICB9XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElKc1RyZWVOb2RlPFREYXRhLCBUVHlwZT4ge1xyXG4gICAgICAgIGlkPzogc3RyaW5nO1xyXG4gICAgICAgIHRleHQ/OiBzdHJpbmc7XHJcbiAgICAgICAgaWNvbj86IHN0cmluZztcclxuICAgICAgICB0eXBlPzogVFR5cGU7XHJcbiAgICAgICAgbGF6eT86IGJvb2xlYW47XHJcbiAgICAgICAgZGF0YT86IFREYXRhO1xyXG4gICAgICAgIHN0YXRlPzogSUpzVHJlZU5vZGVTdGF0ZTtcclxuICAgICAgICBsaV9hdHRyPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICAgICAgICBhX2F0dHI/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gICAgICAgIGNoaWxkcmVuPzogQXJyYXk8c3RyaW5nIHwgSUpzVHJlZU5vZGU8VERhdGEsIFRUeXBlPj47XHJcbiAgICAgICAgY2hpbGRyZW5fZD86IEFycmF5PHN0cmluZz47XHJcbiAgICAgICAgcGFyZW50Pzogc3RyaW5nO1xyXG4gICAgICAgIHBhcmVudHM/OiBBcnJheTxzdHJpbmc+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSU1lbWJlck5vZGVEYXRhIHtcclxuICAgICAgICBsZXZlbD86bnVtYmVyO1xyXG4gICAgICAgIGlzU2hvd01vcmVNZW1iZXI/OiBib29sZWFuLFxyXG4gICAgICAgIG5leHRMb2FkU3RhcnRJbmRleD86IG51bWJlcjtcclxuICAgICAgICBwYXJlbnRVbmlxdWVOYW1lPzpzdHJpbmc7XHJcbiAgICAgICAgY2hpbGRyZW5Ub3RhbENvdW50PzpudW1iZXI7XHJcbn1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElNZW1iZXJOb2RlIGV4dGVuZHMgSUpzVHJlZU5vZGU8SU1lbWJlck5vZGVEYXRhLCBhbnk+IHtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElNZW1iZXJOb2RlTG9va3VwIHtcclxuICAgICAgICBba2V5OnN0cmluZ106SU1lbWJlck5vZGVcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQWZmZWN0ZWROb2Rlc1NldCB7XHJcbiAgICAgICAgc3RhdGljIEVtcHR5PW5ldyBBZmZlY3RlZE5vZGVzU2V0KCk7XHJcblxyXG4gICAgICAgIHByaXZhdGUgX2lubmVyT2JqZWN0ID0ge307XHJcblxyXG4gICAgICAgIEFkZCh1bmlxdWVOYW1lOiBzdHJpbmcpOkFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICB0aGlzLl9pbm5lck9iamVjdFt1bmlxdWVOYW1lXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBBZGRSYW5nZSh1bmlxdWVOYW1lczogc3RyaW5nW10pOkFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICB1bmlxdWVOYW1lcy5mb3JFYWNoKHg9PnRoaXMuQWRkKHgpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVbmlvbihvdGhlcjogQWZmZWN0ZWROb2Rlc1NldCk6QWZmZWN0ZWROb2Rlc1NldCB7XHJcbiAgICAgICAgICAgIG90aGVyLkZvckVhY2goeCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFkZCh4KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBUb0FycmF5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5faW5uZXJPYmplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ29udGFpbnModW5pcXVlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2lubmVyT2JqZWN0W3VuaXF1ZU5hbWVdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEZvckVhY2gob3BlcmF0aW9uOiAoY3VycmVudDogc3RyaW5nKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgICAgIGxldCBpbm5lck9iamVjdCA9IHRoaXMuX2lubmVyT2JqZWN0O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gaW5uZXJPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbm5lck9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uKGtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnQgZW51bSBNZW1iZXJGaWx0ZXJUeXBlIHtcclxuICAgICAgICBCZWdpbnNXaXRoLCBFbmRzV2l0aCwgQ29udGFpbnNcclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBNZW1iZXJGaWx0ZXJcclxuICAgIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBWYWx1ZTogc3RyaW5nLCByZWFkb25seSBUeXBlOiBNZW1iZXJGaWx0ZXJUeXBlKSB7fVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJMZXZlbCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIFVuaXF1ZU5hbWU6IHN0cmluZywgcHVibGljIENhcHRpb246IHN0cmluZykge1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgRGVlcENvcHkob2JqOiBGaWx0ZXJMZXZlbCk6IEZpbHRlckxldmVsIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJMZXZlbChvYmouVW5pcXVlTmFtZSwgb2JqLkNhcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyTWV0YWRhdGEge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBVbmlxdWVOYW1lOnN0cmluZyxwdWJsaWMgQ2FwdGlvbjpzdHJpbmcscHVibGljIFNvcnRlZExldmVsczpGaWx0ZXJMZXZlbFtdLHB1YmxpYyBSb290TWVtYmVyc1RvdGFsQ291bnQ6bnVtYmVyLHB1YmxpYyBBbGxMZXZlbHNNZW1iZXJzVG90YWxDb3VudDpudW1iZXIpIHsgIH1cclxuICAgICAgICBEZWVwQ29weShvYmo6IEZpbHRlck1ldGFkYXRhKTogRmlsdGVyTWV0YWRhdGEge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZpbHRlck1ldGFkYXRhKG9iai5VbmlxdWVOYW1lLCBvYmouQ2FwdGlvbixKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iai5Tb3J0ZWRMZXZlbHMpKSxvYmouUm9vdE1lbWJlcnNUb3RhbENvdW50LG9iai5BbGxMZXZlbHNNZW1iZXJzVG90YWxDb3VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGaWx0ZXJSZXF1ZXN0QmFzZSB7XHJcbiAgICAgICAgcHVibGljIENvbm5lY3Rpb25TdHJpbmc6c3RyaW5nO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBGaWVsZFVuaXF1ZU5hbWUpIHsgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWV0YWRhdGFSZXF1ZXN0IGV4dGVuZHMgRmlsdGVyUmVxdWVzdEJhc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBmaWVsZFVuaXF1ZU5hbWU6IHN0cmluZyxwdWJsaWMgcmVhZG9ubHkgRXhpc3RpbmdMZWFmczpzdHJpbmdbXSkgeyBzdXBlcihmaWVsZFVuaXF1ZU5hbWUpOyB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1ldGFkYXRhUmVzcG9uc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBNZXRhZGF0YTogRmlsdGVyTWV0YWRhdGEsIHB1YmxpYyByZWFkb25seSBDbGVhbmVkTGVhZnMpIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBhYnN0cmFjdCAgY2xhc3MgTWVtYmVyc1JlcXVlc3RCYXNlIGV4dGVuZHMgRmlsdGVyUmVxdWVzdEJhc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGZpZWxkVW5pcXVlTmFtZTogc3RyaW5nLCBwdWJsaWMgU3RhcnQ6IG51bWJlciA9IDAsIHB1YmxpYyBDb3VudDogbnVtYmVyID0gMCwgcHVibGljIEZpbHRlcjogTWVtYmVyRmlsdGVyID0gbnVsbCkge3N1cGVyKGZpZWxkVW5pcXVlTmFtZSl9XHJcbiAgICB9ICBcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVtYmVyc1JlcXVlc3QgZXh0ZW5kcyBNZW1iZXJzUmVxdWVzdEJhc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGZpZWxkVW5pcXVlTmFtZTogc3RyaW5nLCBwdWJsaWMgU3RhcnQ6IG51bWJlciA9IDAsIHB1YmxpYyBDb3VudDogbnVtYmVyID0gMCwgcHVibGljIEZpbHRlcjogTWVtYmVyRmlsdGVyID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcihmaWVsZFVuaXF1ZU5hbWUsIFN0YXJ0LCBDb3VudCwgRmlsdGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9ICAgXHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIExlYWZNZW1iZXJzUmVxdWVzdCBleHRlbmRzIE1lbWJlcnNSZXF1ZXN0QmFzZSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoZmllbGRVbmlxdWVOYW1lOiBzdHJpbmcsIHB1YmxpYyBTdGFydDogbnVtYmVyID0gMCwgcHVibGljIENvdW50OiBudW1iZXIgPSAwLCBwdWJsaWMgRmlsdGVyOiBNZW1iZXJGaWx0ZXIgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKGZpZWxkVW5pcXVlTmFtZSwgU3RhcnQsIENvdW50LCBGaWx0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH0gICBcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTWVtYmVyc1Jlc3BvbnNlIHtcclxuICAgICAgICBGaWx0ZXJJbmZvOiBJRmlsdGVySW5mbztcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ2hpbGRyZW5SZXF1ZXN0IGV4dGVuZHMgRmlsdGVyUmVxdWVzdEJhc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBQYXJlbnQ6IHN0cmluZywgcHVibGljIFN0YXJ0OiBudW1iZXIsIHB1YmxpYyBDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElGaWx0ZXJJbmZvIHtcclxuICAgICAgICByZWFkb25seSBQYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cDtcclxuICAgICAgICByZWFkb25seSBMYXN0TGV2ZWxOb2RlczpJTWVtYmVyTm9kZVtdO1xyXG4gICAgICAgIHJlYWRvbmx5IEhhc01vcmVNZW1iZXJzOmJvb2xlYW47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBjbGFzcyBNZW1iZXJOb2Rlc0hlbHBlciB7XHJcbiAgICAgICAgc3RhdGljIEdldEFsbFBhcmVudHNOYW1lcyhwYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cCwgdGFyZ2V0Tm9kZTogSU1lbWJlck5vZGUpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNZW1iZXJOb2Rlc0hlbHBlci5HZXRBbGxQYXJlbnRzRGF0YUNvcmU8c3RyaW5nPihwYXJlbnRzTG9va3VwLCB0YXJnZXROb2RlLCB4ID0+IHguaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0aWMgR2V0QWxsUGFyZW50cyhwYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cCwgdGFyZ2V0Tm9kZTogSU1lbWJlck5vZGUpOiBJTWVtYmVyTm9kZVtdIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1lbWJlck5vZGVzSGVscGVyLkdldEFsbFBhcmVudHNEYXRhQ29yZTxJTWVtYmVyTm9kZT4ocGFyZW50c0xvb2t1cCwgdGFyZ2V0Tm9kZSwgeCA9PiB4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGljIEdldEFsbFBhcmVudHNEYXRhQ29yZTxUPihwYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cCwgdGFyZ2V0Tm9kZTogSU1lbWJlck5vZGUsZGF0YVNlbGVjdG9yOih4OklNZW1iZXJOb2RlKT0+VCk6IFRbXSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQ6IFRbXSA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudE5vZGUgPSBwYXJlbnRzTG9va3VwW3RhcmdldE5vZGUuZGF0YS5wYXJlbnRVbmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmICghcGFyZW50Tm9kZSkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChkYXRhU2VsZWN0b3IocGFyZW50Tm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Tm9kZSA9IHBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBIaWVyYXJjaGl6ZU5vZGVzKG5vZGVzOiBJTWVtYmVyTm9kZVtdLCBwYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cCk6IElNZW1iZXJOb2RlW10ge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0Tm9kZXM6IElNZW1iZXJOb2RlW10gPSBbXTtcclxuICAgICAgICAgICAgdmFyIG5vZGVzVG9jaGlsZHJlbkxvb2t1cDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSB9ID0ge307XHJcblxyXG4gICAgICAgICAgICB2YXIgcHJvY2Vzc05vZGUgPSAocGFyZW50VW5pcXVlTmFtZTpzdHJpbmcsbm9kZVRvTm9kZXNDaGlsZHJlbkxvb2t1cE1hcDogeyBba2V5OiBzdHJpbmddOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW47IH07IH0sIGN1cnJlbnROb2RlOiBJTWVtYmVyTm9kZSwgcmVzdWx0Tm9kZXM6IElNZW1iZXJOb2RlW10pPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuTG9va3VwID0gbm9kZVRvTm9kZXNDaGlsZHJlbkxvb2t1cE1hcFtwYXJlbnRVbmlxdWVOYW1lXSB8fCAobm9kZVRvTm9kZXNDaGlsZHJlbkxvb2t1cE1hcFtwYXJlbnRVbmlxdWVOYW1lXSA9IHt9KTtcclxuICAgICAgICAgICAgICAgIGlmICghY2hpbGRyZW5Mb29rdXBbY3VycmVudE5vZGUuaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZXMucHVzaChjdXJyZW50Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5Mb29rdXBbY3VycmVudE5vZGUuaWRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbm9kZXMuZm9yRWFjaChjdXJyZW50Tm9kZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudDogSU1lbWJlck5vZGUgPSBwYXJlbnRzTG9va3VwW2N1cnJlbnROb2RlLmRhdGEucGFyZW50VW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc05vZGUoXCIjXCIsbm9kZXNUb2NoaWxkcmVuTG9va3VwLCBjdXJyZW50Tm9kZSwgcmVzdWx0Tm9kZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzTm9kZShwYXJlbnQuaWQsbm9kZXNUb2NoaWxkcmVuTG9va3VwLCBjdXJyZW50Tm9kZSwgIHBhcmVudC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyQ29udHJvbFNlcnZpY2Uge1xyXG4gICAgICAgIEdldE1ldGFkYXRhKHJlcXVlc3Q6IE1ldGFkYXRhUmVxdWVzdCk6IFByb21pc2U8TWV0YWRhdGFSZXNwb25zZT47XHJcbiAgICAgICAgR2V0TWVtYmVycyhyZXF1ZXN0OiBNZW1iZXJzUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPjtcclxuICAgICAgICBHZXRMZWFmTWVtYmVycyhyZXF1ZXN0OiBMZWFmTWVtYmVyc1JlcXVlc3QpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT47XHJcbiAgICAgICAgR2V0Q2hpbGRyZW4ocmVxdWVzdDogQ2hpbGRyZW5SZXF1ZXN0KTogUHJvbWlzZTxNZW1iZXJzUmVzcG9uc2U+O1xyXG4gICAgfVxyXG5cclxufSJdfQ==