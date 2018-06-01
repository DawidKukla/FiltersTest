var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
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
                    Remove(uniqueName) {
                        delete this._innerObject[uniqueName];
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
                    Except(other) {
                        other.ForEach((key) => { delete this._innerObject[key]; });
                        return this;
                    }
                    Clone() {
                        var clone = new AffectedNodesSet();
                        this.ForEach((key) => {
                            clone.Add(key);
                        });
                        return clone;
                    }
                    ToArray() {
                        return Object.keys(this._innerObject);
                    }
                    Clear() {
                        this.ForEach((key) => { delete this._innerObject[key]; });
                        return this;
                    }
                    Contains(uniqueName) {
                        return Boolean(this._innerObject[uniqueName]);
                    }
                    ForEach(operation) {
                        const keys = Object.keys(this._innerObject);
                        for (let index in keys) {
                            if (keys.hasOwnProperty(index)) {
                                operation(keys[index]);
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
                    constructor(UniqueName, Caption, SortedLevels, RootMembersTotalCount, AllLevelsMembersTotalCount, DefaultMember) {
                        this.UniqueName = UniqueName;
                        this.Caption = Caption;
                        this.SortedLevels = SortedLevels;
                        this.RootMembersTotalCount = RootMembersTotalCount;
                        this.AllLevelsMembersTotalCount = AllLevelsMembersTotalCount;
                        this.DefaultMember = DefaultMember;
                    }
                    DeepCopy(obj) {
                        return new FilterMetadata(obj.UniqueName, obj.Caption, JSON.parse(JSON.stringify(obj.SortedLevels)), obj.RootMembersTotalCount, obj.AllLevelsMembersTotalCount, JSON.parse(JSON.stringify(this.DefaultMember)));
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
                    constructor(Metadata, CleanedStateInfo) {
                        this.Metadata = Metadata;
                        this.CleanedStateInfo = CleanedStateInfo;
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
                    constructor(fieldUniqueName, Parent, Start, Count) {
                        super(fieldUniqueName);
                        this.Parent = Parent;
                        this.Start = Start;
                        this.Count = Count;
                    }
                }
                Common.ChildrenRequest = ChildrenRequest;
                class FiltredElementsChildrenCountRequest {
                    constructor(FieldUniqueName, NodesUniqueNames, Filter) {
                        this.FieldUniqueName = FieldUniqueName;
                        this.NodesUniqueNames = NodesUniqueNames;
                        this.Filter = Filter;
                    }
                }
                Common.FiltredElementsChildrenCountRequest = FiltredElementsChildrenCountRequest;
                class GetMembersByStatusRequest extends FilterRequestBase {
                    constructor(fieldUniqueName, Start = 0, Count = 0, Status, Filter) {
                        super(fieldUniqueName);
                        this.Start = Start;
                        this.Count = Count;
                        this.Status = Status;
                        this.Filter = Filter;
                    }
                }
                Common.GetMembersByStatusRequest = GetMembersByStatusRequest;
                class FiltredElementsChildrenCountResponse {
                    constructor(ChildrenCountInfoLookup = {}) {
                        this.ChildrenCountInfoLookup = ChildrenCountInfoLookup;
                    }
                }
                Common.FiltredElementsChildrenCountResponse = FiltredElementsChildrenCountResponse;
                let FilterItemState;
                (function (FilterItemState) {
                    FilterItemState[FilterItemState["Checked"] = 0] = "Checked";
                    FilterItemState[FilterItemState["Unchecked"] = 1] = "Unchecked";
                })(FilterItemState = Common.FilterItemState || (Common.FilterItemState = {}));
                class MemberNodesHelper {
                    static GetAllParentsNames(parentsLookup, targetNode) {
                        return MemberNodesHelper.GetAllParentsDataCore(parentsLookup, targetNode, x => x.id);
                    }
                    static GetAllParents(parentsLookup, targetNode) {
                        return MemberNodesHelper.GetAllParentsDataCore(parentsLookup, targetNode, x => x);
                    }
                    static GetAllParentsDataCore(parentsLookup, targetNode, dataSelector) {
                        const result = [];
                        while (true) {
                            const parentNode = parentsLookup[targetNode.data.parentUniqueName];
                            if (!parentNode)
                                break;
                            result.push(dataSelector(parentNode));
                            targetNode = parentNode;
                        }
                        return result;
                    }
                    static GetAllParentsWithPriority(priorityLookupList, targetNode, dataSelector) {
                        const result = [];
                        while (true) {
                            let parentNode = null;
                            for (let i = 0; i < priorityLookupList.length; i++) {
                                const parentsLookup = priorityLookupList[i];
                                parentNode = parentsLookup[targetNode.data.parentUniqueName];
                                if (parentNode) {
                                    break;
                                }
                            }
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
                class ControlStateInfo {
                    constructor(_filterControl) {
                        this._filterControl = _filterControl;
                    }
                    Save() {
                        this._treeState = this._filterControl.TreeState;
                        this._loadedElementsCount = this._filterControl.LoadedElementsCount;
                        this._isMaxVisibleElementsLimitReached = this._filterControl.MaxVisibleElementsLimitReached;
                    }
                    Restore(onReadyCallback = () => { }) {
                        this._filterControl.LoadedElementsCount = this._loadedElementsCount;
                        this._filterControl.MaxVisibleElementsLimitReached = this._isMaxVisibleElementsLimitReached;
                        this._filterControl.RestoreTreeState(this._treeState, onReadyCallback);
                    }
                }
                Common.ControlStateInfo = ControlStateInfo;
            })(Common = FilterControlModule.Common || (FilterControlModule.Common = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsT0FBTyxDQW1ZaEI7QUFuWUQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBbVl6QjtJQW5ZaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0FtWTdDO1FBblkwQixXQUFBLG1CQUFtQjtZQUFDLElBQUEsTUFBTSxDQW1ZcEQ7WUFuWThDLFdBQUEsTUFBTTtnQkFVakQsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDRCxZQUFZLENBQUM7b0JBQ2IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxVQUFTLE9BQU8sRUFBRSxNQUFNO3dCQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVTs0QkFDdkQsTUFBTSxFQUFFLEdBQUcsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzs0QkFDckQsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzs0QkFDckUsSUFBSSxHQUFHLEVBQUU7Z0NBQ0wsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQ3JDLE1BQU0sSUFBSSxHQUFHO29DQUNULGtCQUFrQixFQUFHLEdBQXFCO29DQUMxQyxjQUFjLEVBQUUsT0FBTztvQ0FDdkIsUUFBUSxFQUFFLFFBQVE7aUNBQ3JCLENBQUM7Z0NBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxv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QyxTQUFTLENBQUM7d0JBQ2hELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDO3dCQUNwRSxJQUFJLENBQUMsaUNBQWlDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsQ0FBQztvQkFDaEcsQ0FBQztvQkFFRCxPQUFPLENBQUMsa0JBQThCLEdBQUcsRUFBRSxHQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO3dCQUNwRSxJQUFJLENBQUMsY0FBYyxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQzt3QkFDNUYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUMzRSxDQUFDO2lCQUVKO2dCQW5CWSx1QkFBZ0IsbUJBbUI1QixDQUFBO1lBZ0JMLENBQUMsRUFuWThDLE1BQU0sR0FBTiwwQkFBTSxLQUFOLDBCQUFNLFFBbVlwRDtRQUFELENBQUMsRUFuWTBCLG1CQUFtQixHQUFuQiw0QkFBbUIsS0FBbkIsNEJBQW1CLFFBbVk3QztJQUFELENBQUMsRUFuWWlCLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBbVl6QjtBQUFELENBQUMsRUFuWVMsT0FBTyxLQUFQLE9BQU8sUUFtWWhCIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIENvbWFyY2guQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24ge1xyXG4gICAgaW1wb3J0IElGaWx0ZXJTdGF0ZU1hbmFnZXIgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5JRmlsdGVyU3RhdGVNYW5hZ2VyO1xyXG4gICAgaW1wb3J0IElGaWx0ZXJJdGVtID0gRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuQ29tbW9uLklGaWx0ZXJJdGVtO1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUpzdHJlZVJlZHJhd05vZGVBcmdzPFREYXRhLCBUVHlwZT4ge1xyXG4gICAgICAgIEN1cnJlbnROb2RlRWxlbWVudDogSFRNTExJRWxlbWVudDtcclxuICAgICAgICBDdXJyZW50Tm9kZU9iajogSUpzVHJlZU5vZGU8VERhdGEsIFRUeXBlPjtcclxuICAgICAgICBDYWxsYmFjazogYW55O1xyXG4gICAgfVxyXG5cclxuICAgICgkID0+IHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICAkLmpzdHJlZS5wbHVnaW5zW1wiY29tYXJjaF9yZWRyYXdfbm9kZVwiXSA9IGZ1bmN0aW9uKG9wdGlvbnMsIHBhcmVudCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5yZWRyYXdfbm9kZSA9IGZ1bmN0aW9uKG9iaiwgZGVlcCwgY2FsbGJhY2ssIGZvcmNlX2RyYXcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiA/IG9ialtcImlkXCJdIDogb2JqOyAvL3N0b3JlIGNvcHkgYmVjYXVzZSB0aGVuIG9iaiBjaGFuZ2VzIGZyb20gc3RyaW5nIHRvIERPTSBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICBvYmogPSBwYXJlbnQucmVkcmF3X25vZGUuY2FsbCh0aGlzLCBvYmosIGRlZXAsIGNhbGxiYWNrLCBmb3JjZV9kcmF3KTtcclxuICAgICAgICAgICAgICAgIGlmIChvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlT2JqID0gdGhpcy5fbW9kZWwuZGF0YVtpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ3VycmVudE5vZGVFbGVtZW50OiAob2JqIGFzIEhUTUxMSUVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDdXJyZW50Tm9kZU9iajogbm9kZU9iaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2s6IGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJjb21hcmNoX3JlZHJhd19ub2RlLmNvbWFyY2guanN0cmVlXCIsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgfSkoalF1ZXJ5KTtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElSZXNvdXJjZXNNYXAge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElKc1RyZWVOb2RlU3RhdGUge1xyXG4gICAgICAgIG9wZW5lZD86IGJvb2xlYW47XHJcbiAgICAgICAgZGlzYWJsZWQ/OiBib29sZWFuO1xyXG4gICAgICAgIHNlbGVjdGVkPzogYm9vbGVhbjtcclxuICAgICAgICBoaWRkZW4/OiBib29sZWFuO1xyXG4gICAgICAgIHVuZGV0ZXJtaW5lZD86IGJvb2xlYW47XHJcbiAgICAgICAgbG9hZGVkPzogYm9vbGVhbjtcclxuICAgICAgICBsb2FkaW5nPzogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElKc1RyZWVOb2RlPFREYXRhLCBUVHlwZT4ge1xyXG4gICAgICAgIGlkPzogc3RyaW5nO1xyXG4gICAgICAgIHRleHQ/OiBzdHJpbmc7XHJcbiAgICAgICAgaWNvbj86IHN0cmluZztcclxuICAgICAgICB0eXBlPzogVFR5cGU7XHJcbiAgICAgICAgbGF6eT86IGJvb2xlYW47XHJcbiAgICAgICAgZGF0YT86IFREYXRhO1xyXG4gICAgICAgIHN0YXRlPzogSUpzVHJlZU5vZGVTdGF0ZTtcclxuICAgICAgICBsaV9hdHRyPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICAgICAgICBhX2F0dHI/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gICAgICAgIGNoaWxkcmVuPzogQXJyYXk8c3RyaW5nIHwgSUpzVHJlZU5vZGU8VERhdGEsIFRUeXBlPj47XHJcbiAgICAgICAgY2hpbGRyZW5fZD86IEFycmF5PHN0cmluZz47XHJcbiAgICAgICAgcGFyZW50Pzogc3RyaW5nO1xyXG4gICAgICAgIHBhcmVudHM/OiBBcnJheTxzdHJpbmc+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSU1lbWJlck5vZGVEYXRhIHtcclxuICAgICAgICBsZXZlbD86IG51bWJlcjtcclxuICAgICAgICBpc1Nob3dNb3JlTWVtYmVyPzogYm9vbGVhbjtcclxuICAgICAgICBuZXh0TG9hZFN0YXJ0SW5kZXg/OiBudW1iZXI7XHJcbiAgICAgICAgcGFyZW50VW5pcXVlTmFtZT86IHN0cmluZztcclxuICAgICAgICBjaGlsZHJlblRvdGFsQ291bnQ/OiBudW1iZXI7XHJcbiAgICAgICAgZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudD86IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElNZW1iZXJOb2RlIGV4dGVuZHMgSUpzVHJlZU5vZGU8SU1lbWJlck5vZGVEYXRhLCBhbnk+IHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJTWVtYmVyTm9kZUxvb2t1cCB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogSU1lbWJlck5vZGVcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElNZW1iZXJOb2RlVW5pcXVlTmFtZUxvb2t1cCB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYm9vbGVhblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBZmZlY3RlZE5vZGVzU2V0IHtcclxuICAgICAgICBzdGF0aWMgRW1wdHk9bmV3IEFmZmVjdGVkTm9kZXNTZXQoKTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBfaW5uZXJPYmplY3QgPSB7fTtcclxuXHJcbiAgICAgICAgQWRkKHVuaXF1ZU5hbWU6IHN0cmluZyk6IEFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICB0aGlzLl9pbm5lck9iamVjdFt1bmlxdWVOYW1lXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUmVtb3ZlKHVuaXF1ZU5hbWU6IHN0cmluZyk6IEFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5faW5uZXJPYmplY3RbdW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQWRkUmFuZ2UodW5pcXVlTmFtZXM6IHN0cmluZ1tdKTogQWZmZWN0ZWROb2Rlc1NldCB7XHJcbiAgICAgICAgICAgIHVuaXF1ZU5hbWVzLmZvckVhY2goeCA9PiB0aGlzLkFkZCh4KSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVW5pb24ob3RoZXI6IEFmZmVjdGVkTm9kZXNTZXQpOiBBZmZlY3RlZE5vZGVzU2V0IHtcclxuICAgICAgICAgICAgb3RoZXIuRm9yRWFjaCh4ID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQWRkKHgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEV4Y2VwdChvdGhlcjogQWZmZWN0ZWROb2Rlc1NldCk6IEFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICBvdGhlci5Gb3JFYWNoKChrZXkpID0+IHsgZGVsZXRlIHRoaXMuX2lubmVyT2JqZWN0W2tleV07IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENsb25lKCk6IEFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBuZXcgQWZmZWN0ZWROb2Rlc1NldCgpO1xyXG4gICAgICAgICAgICB0aGlzLkZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xvbmUuQWRkKGtleSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gY2xvbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBUb0FycmF5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5faW5uZXJPYmplY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ2xlYXIoKTogQWZmZWN0ZWROb2Rlc1NldCB7XHJcbiAgICAgICAgICAgIHRoaXMuRm9yRWFjaCgoa2V5KSA9PiB7IGRlbGV0ZSB0aGlzLl9pbm5lck9iamVjdFtrZXldOyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDb250YWlucyh1bmlxdWVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4odGhpcy5faW5uZXJPYmplY3RbdW5pcXVlTmFtZV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRm9yRWFjaChvcGVyYXRpb246IChrZXk6IHN0cmluZykgPT4gdm9pZCkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5faW5uZXJPYmplY3QpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleCBpbiBrZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5cy5oYXNPd25Qcm9wZXJ0eShpbmRleCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24oa2V5c1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBlbnVtIE1lbWJlckZpbHRlclR5cGUge1xyXG4gICAgICAgIEJlZ2luc1dpdGgsXHJcbiAgICAgICAgRW5kc1dpdGgsXHJcbiAgICAgICAgQ29udGFpbnMsXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbWJlckZpbHRlciB7XHJcbiAgICAgICAgY29uc3RydWN0b3IocmVhZG9ubHkgVmFsdWU6IHN0cmluZywgcmVhZG9ubHkgVHlwZTogTWVtYmVyRmlsdGVyVHlwZSkge31cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyTGV2ZWwge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBVbmlxdWVOYW1lOiBzdHJpbmcsIHB1YmxpYyBDYXB0aW9uOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBEZWVwQ29weShvYmo6IEZpbHRlckxldmVsKTogRmlsdGVyTGV2ZWwge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZpbHRlckxldmVsKG9iai5VbmlxdWVOYW1lLCBvYmouQ2FwdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJNZXRhZGF0YSB7XHJcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIFVuaXF1ZU5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgcHVibGljIENhcHRpb246IHN0cmluZyxcclxuICAgICAgICAgICAgcHVibGljIFNvcnRlZExldmVsczogRmlsdGVyTGV2ZWxbXSxcclxuICAgICAgICAgICAgcHVibGljIFJvb3RNZW1iZXJzVG90YWxDb3VudDogbnVtYmVyLFxyXG4gICAgICAgICAgICBwdWJsaWMgQWxsTGV2ZWxzTWVtYmVyc1RvdGFsQ291bnQ6IG51bWJlcixcclxuICAgICAgICAgICAgcHVibGljIERlZmF1bHRNZW1iZXI6IElGaWx0ZXJJbmZvKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBEZWVwQ29weShvYmo6IEZpbHRlck1ldGFkYXRhKTogRmlsdGVyTWV0YWRhdGEge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZpbHRlck1ldGFkYXRhKG9iai5VbmlxdWVOYW1lLFxyXG4gICAgICAgICAgICAgICAgb2JqLkNhcHRpb24sXHJcbiAgICAgICAgICAgICAgICBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iai5Tb3J0ZWRMZXZlbHMpKSxcclxuICAgICAgICAgICAgICAgIG9iai5Sb290TWVtYmVyc1RvdGFsQ291bnQsXHJcbiAgICAgICAgICAgICAgICBvYmouQWxsTGV2ZWxzTWVtYmVyc1RvdGFsQ291bnQsXHJcbiAgICAgICAgICAgICAgICBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuRGVmYXVsdE1lbWJlcikpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICBDb25uZWN0aW9uU3RyaW5nOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBGaWVsZFVuaXF1ZU5hbWUpIHt9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1ldGFkYXRhUmVxdWVzdCBleHRlbmRzIEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZmllbGRVbmlxdWVOYW1lOiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSBFeGlzdGluZ0xlYWZzOiBzdHJpbmdbXSkgeyBzdXBlcihmaWVsZFVuaXF1ZU5hbWUpOyB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1ldGFkYXRhUmVzcG9uc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBNZXRhZGF0YTogRmlsdGVyTWV0YWRhdGEsIHB1YmxpYyByZWFkb25seSBDbGVhbmVkU3RhdGVJbmZvOiBJQ2xlYW5lZFN0YXRlSW5mbykge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lbWJlcnNSZXF1ZXN0QmFzZSBleHRlbmRzIEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihmaWVsZFVuaXF1ZU5hbWU6IHN0cmluZywgcHVibGljIFN0YXJ0OiBudW1iZXIgPSAwLCBwdWJsaWMgQ291bnQ6IG51bWJlciA9IDAsIHB1YmxpYyBGaWx0ZXI6IE1lbWJlckZpbHRlciA9IG51bGwpIHsgc3VwZXIoZmllbGRVbmlxdWVOYW1lKSB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbWJlcnNSZXF1ZXN0IGV4dGVuZHMgTWVtYmVyc1JlcXVlc3RCYXNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihmaWVsZFVuaXF1ZU5hbWU6IHN0cmluZywgcHVibGljIFN0YXJ0OiBudW1iZXIgPSAwLCBwdWJsaWMgQ291bnQ6IG51bWJlciA9IDAsIHB1YmxpYyBGaWx0ZXI6IE1lbWJlckZpbHRlciA9IG51bGwpIHtcclxuICAgICAgICAgICAgc3VwZXIoZmllbGRVbmlxdWVOYW1lLCBTdGFydCwgQ291bnQsIEZpbHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBMZWFmTWVtYmVyc1JlcXVlc3QgZXh0ZW5kcyBNZW1iZXJzUmVxdWVzdEJhc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGZpZWxkVW5pcXVlTmFtZTogc3RyaW5nLCBwdWJsaWMgU3RhcnQ6IG51bWJlciA9IDAsIHB1YmxpYyBDb3VudDogbnVtYmVyID0gMCwgcHVibGljIEZpbHRlcjogTWVtYmVyRmlsdGVyID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcihmaWVsZFVuaXF1ZU5hbWUsIFN0YXJ0LCBDb3VudCwgRmlsdGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1lbWJlcnNSZXNwb25zZSB7XHJcbiAgICAgICAgRmlsdGVySW5mbzogSUZpbHRlckluZm87XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENoaWxkcmVuUmVxdWVzdCBleHRlbmRzIEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihmaWVsZFVuaXF1ZU5hbWU6IHN0cmluZywgcHVibGljIFBhcmVudDogc3RyaW5nLCBwdWJsaWMgU3RhcnQ6IG51bWJlciwgcHVibGljIENvdW50OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgc3VwZXIoZmllbGRVbmlxdWVOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXF1ZXN0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgRmllbGRVbmlxdWVOYW1lOiBzdHJpbmcsIHB1YmxpYyBOb2Rlc1VuaXF1ZU5hbWVzOiBzdHJpbmdbXSwgcHVibGljIEZpbHRlcjogTWVtYmVyRmlsdGVyKSB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgR2V0TWVtYmVyc0J5U3RhdHVzUmVxdWVzdCBleHRlbmRzIEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihmaWVsZFVuaXF1ZU5hbWU6IHN0cmluZywgcHVibGljIFN0YXJ0OiBudW1iZXIgPSAwLCBwdWJsaWMgQ291bnQ6IG51bWJlciA9IDAsIHB1YmxpYyBTdGF0dXM6IEZpbHRlckl0ZW1TdGF0ZSwgcHVibGljIEZpbHRlcjogSUZpbHRlckl0ZW0pIHtcclxuICAgICAgICAgICAgc3VwZXIoZmllbGRVbmlxdWVOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IElDaGlsZHJlbkNvdW50SW5mbztcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElDaGlsZHJlbkNvdW50SW5mbyB7XHJcbiAgICAgICAgQ2hpbGRyZW5Db3VudDogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVzcG9uc2Uge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBDaGlsZHJlbkNvdW50SW5mb0xvb2t1cDogSUNoaWxkcmVuQ291bnRJbmZvTG9va3VwID0ge30pIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBlbnVtIEZpbHRlckl0ZW1TdGF0ZSB7XHJcbiAgICAgICAgQ2hlY2tlZCxcclxuICAgICAgICBVbmNoZWNrZWRcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElGaWx0ZXJJbmZvIHtcclxuICAgICAgICByZWFkb25seSBQYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cDtcclxuICAgICAgICByZWFkb25seSBMYXN0TGV2ZWxOb2RlczogSU1lbWJlck5vZGVbXTtcclxuICAgICAgICByZWFkb25seSBIYXNNb3JlTWVtYmVyczogYm9vbGVhbjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElDbGVhbmVkU3RhdGVJbmZvIHtcclxuICAgICAgICByZWFkb25seSBFeGlzdGluZ01lbWJlcnNIaWVyYXJjaHlMb29rdXA6IElNZW1iZXJOb2RlTG9va3VwO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNZW1iZXJOb2Rlc0hlbHBlciB7XHJcbiAgICAgICAgc3RhdGljIEdldEFsbFBhcmVudHNOYW1lcyhwYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cCwgdGFyZ2V0Tm9kZTogSU1lbWJlck5vZGUpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNZW1iZXJOb2Rlc0hlbHBlci5HZXRBbGxQYXJlbnRzRGF0YUNvcmU8c3RyaW5nPihwYXJlbnRzTG9va3VwLCB0YXJnZXROb2RlLCB4ID0+IHguaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIEdldEFsbFBhcmVudHMocGFyZW50c0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXAsIHRhcmdldE5vZGU6IElNZW1iZXJOb2RlKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNZW1iZXJOb2Rlc0hlbHBlci5HZXRBbGxQYXJlbnRzRGF0YUNvcmU8SU1lbWJlck5vZGU+KHBhcmVudHNMb29rdXAsIHRhcmdldE5vZGUsIHggPT4geCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgR2V0QWxsUGFyZW50c0RhdGFDb3JlPFQ+KHBhcmVudHNMb29rdXA6IElNZW1iZXJOb2RlTG9va3VwLCB0YXJnZXROb2RlOiBJTWVtYmVyTm9kZSwgZGF0YVNlbGVjdG9yOiAoeDogSU1lbWJlck5vZGUpID0+IFQpOiBUW10ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRbXSA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHBhcmVudHNMb29rdXBbdGFyZ2V0Tm9kZS5kYXRhLnBhcmVudFVuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnROb2RlKSBicmVhaztcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRhdGFTZWxlY3RvcihwYXJlbnROb2RlKSk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXROb2RlID0gcGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIEdldEFsbFBhcmVudHNXaXRoUHJpb3JpdHk8VD4ocHJpb3JpdHlMb29rdXBMaXN0OiBJTWVtYmVyTm9kZUxvb2t1cFtdLCB0YXJnZXROb2RlOiBJTWVtYmVyTm9kZSwgZGF0YVNlbGVjdG9yOiAoeDogSU1lbWJlck5vZGUpID0+IFQpOiBUW10ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRbXSA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudE5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmlvcml0eUxvb2t1cExpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRzTG9va3VwID0gcHJpb3JpdHlMb29rdXBMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE5vZGUgPSBwYXJlbnRzTG9va3VwW3RhcmdldE5vZGUuZGF0YS5wYXJlbnRVbmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudE5vZGUpIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZGF0YVNlbGVjdG9yKHBhcmVudE5vZGUpKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldE5vZGUgPSBwYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgSGllcmFyY2hpemVOb2Rlcyhub2RlczogSU1lbWJlck5vZGVbXSwgcGFyZW50c0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXApOiBJTWVtYmVyTm9kZVtdIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdE5vZGVzOiBJTWVtYmVyTm9kZVtdID0gW107XHJcbiAgICAgICAgICAgIHZhciBub2Rlc1RvY2hpbGRyZW5Mb29rdXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gfSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgdmFyIHByb2Nlc3NOb2RlID0gKHBhcmVudFVuaXF1ZU5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgIG5vZGVUb05vZGVzQ2hpbGRyZW5Mb29rdXBNYXA6IHsgW2tleTogc3RyaW5nXTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuOyB9OyB9LFxyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGU6IElNZW1iZXJOb2RlLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0Tm9kZXM6IElNZW1iZXJOb2RlW10pID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbkxvb2t1cCA9IG5vZGVUb05vZGVzQ2hpbGRyZW5Mb29rdXBNYXBbcGFyZW50VW5pcXVlTmFtZV0gfHwgKG5vZGVUb05vZGVzQ2hpbGRyZW5Mb29rdXBNYXBbcGFyZW50VW5pcXVlTmFtZV0gPSB7fSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuTG9va3VwW2N1cnJlbnROb2RlLmlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdE5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuTG9va3VwW2N1cnJlbnROb2RlLmlkXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGN1cnJlbnROb2RlID0+IHtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50OiBJTWVtYmVyTm9kZSA9IHBhcmVudHNMb29rdXBbY3VycmVudE5vZGUuZGF0YS5wYXJlbnRVbmlxdWVOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzTm9kZShcIiNcIiwgbm9kZXNUb2NoaWxkcmVuTG9va3VwLCBjdXJyZW50Tm9kZSwgcmVzdWx0Tm9kZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzTm9kZShwYXJlbnQuaWQsIG5vZGVzVG9jaGlsZHJlbkxvb2t1cCwgY3VycmVudE5vZGUsIHBhcmVudC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJR2V0Tm9kZXNJbmZvIHtcclxuICAgICAgICBNZW1iZXJzOiBJTWVtYmVyTm9kZVtdO1xyXG4gICAgICAgIE1heEVsZW1lbnRMaW1pdFJlYWNoZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgSGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzOiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVNlcmlhbGl6YWJsZVN0YXRlQ29udHJvbCB7XHJcblxyXG4gICAgICAgIFRyZWVTdGF0ZTogSU1lbWJlck5vZGVbXTtcclxuICAgICAgICBMb2FkZWRFbGVtZW50c0NvdW50OiBudW1iZXI7XHJcbiAgICAgICAgTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkOiBib29sZWFuO1xyXG4gICAgICAgIFJlc3RvcmVUcmVlU3RhdGUoc2F2ZWRTdGF0ZTogSU1lbWJlck5vZGVbXSwgb25SZWFkeUNhbGxiYWNrOiAoKSA9PiB2b2lkKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29udHJvbFN0YXRlSW5mbyB7XHJcbiAgICAgICAgcHJpdmF0ZSBfdHJlZVN0YXRlOiBBcnJheTxJTWVtYmVyTm9kZT47XHJcbiAgICAgICAgcHJpdmF0ZSBfbG9hZGVkRWxlbWVudHNDb3VudDogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgX2lzTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkOiBib29sZWFuO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9maWx0ZXJDb250cm9sOiBJU2VyaWFsaXphYmxlU3RhdGVDb250cm9sKSB7fVxyXG5cclxuICAgICAgICBTYXZlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl90cmVlU3RhdGUgPSB0aGlzLl9maWx0ZXJDb250cm9sLlRyZWVTdGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudCA9IHRoaXMuX2ZpbHRlckNvbnRyb2wuTG9hZGVkRWxlbWVudHNDb3VudDtcclxuICAgICAgICAgICAgdGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQgPSB0aGlzLl9maWx0ZXJDb250cm9sLk1heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlc3RvcmUob25SZWFkeUNhbGxiYWNrOiAoKSA9PiB2b2lkID0gKCkgPT4ge30pIHtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyQ29udHJvbC5Mb2FkZWRFbGVtZW50c0NvdW50ID0gdGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudDtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyQ29udHJvbC5NYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQgPSB0aGlzLl9pc01heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZDtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyQ29udHJvbC5SZXN0b3JlVHJlZVN0YXRlKHRoaXMuX3RyZWVTdGF0ZSwgb25SZWFkeUNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSB7XHJcbiAgICAgICAgQ3JlYXRlKF9jb25uZWN0aW9uU3RyaW5nOiBzdHJpbmcpOiBJRmlsdGVyQ29udHJvbFNlcnZpY2U7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyQ29udHJvbFNlcnZpY2Uge1xyXG4gICAgICAgIEdldE1ldGFkYXRhKHJlcXVlc3Q6IE1ldGFkYXRhUmVxdWVzdCk6IFByb21pc2U8TWV0YWRhdGFSZXNwb25zZT47XHJcbiAgICAgICAgR2V0TWVtYmVycyhyZXF1ZXN0OiBNZW1iZXJzUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPjtcclxuICAgICAgICBHZXRMZWFmTWVtYmVycyhyZXF1ZXN0OiBMZWFmTWVtYmVyc1JlcXVlc3QpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT47XHJcbiAgICAgICAgR2V0Q2hpbGRyZW4ocmVxdWVzdDogQ2hpbGRyZW5SZXF1ZXN0KTogUHJvbWlzZTxNZW1iZXJzUmVzcG9uc2U+O1xyXG4gICAgICAgIEdldE1lbWJlcnNCeVN0YXR1cyhyZXF1ZXN0OiBHZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0LCBzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT47XHJcbiAgICAgICAgR2V0RmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudChyZXF1ZXN0OiBGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVxdWVzdCk6IFByb21pc2U8RmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlc3BvbnNlPjtcclxuICAgIH1cclxuXHJcblxyXG59Il19