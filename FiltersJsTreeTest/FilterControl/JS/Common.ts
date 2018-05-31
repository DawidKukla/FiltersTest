namespace Comarch.Controls.FilterControlModule.Common {
    import IFilterStateManager = FilterControlModule.FilterStateManagerModule.IFilterStateManager;
    import IFilterItem = FilterControlModule.FilterStateManagerModule.Common.IFilterItem;

    export interface IJstreeRedrawNodeArgs<TData, TType> {
        CurrentNodeElement: HTMLLIElement;
        CurrentNodeObj: IJsTreeNode<TData, TType>;
        Callback: any;
    }

    ($ => {
        "use strict";
        $.jstree.plugins["comarch_redraw_node"] = function(options, parent) {
            console.log(options);
            this.redraw_node = function(obj, deep, callback, force_draw) {
                const id = typeof obj === "object" ? obj["id"] : obj; //store copy because then obj changes from string to DOM element
                obj = parent.redraw_node.call(this, obj, deep, callback, force_draw);
                if (obj) {
                    const nodeObj = this._model.data[id];
                    const args = {
                        CurrentNodeElement: (obj as HTMLLIElement),
                        CurrentNodeObj: nodeObj,
                        Callback: callback
                    };
                    this.trigger("comarch_redraw_node.comarch.jstree", args);
                }
                return obj;
            };
        };
    })(jQuery);

    export interface IResourcesMap {
        [key: string]: string;
    }

    export interface IJsTreeNodeState {
        opened?: boolean;
        disabled?: boolean;
        selected?: boolean;
        hidden?: boolean;
        undetermined?: boolean;
        loaded?: boolean;
        loading?: boolean;
    }

    export interface IJsTreeNode<TData, TType> {
        id?: string;
        text?: string;
        icon?: string;
        type?: TType;
        lazy?: boolean;
        data?: TData;
        state?: IJsTreeNodeState;
        li_attr?: { [key: string]: string };
        a_attr?: { [key: string]: string };
        children?: Array<string | IJsTreeNode<TData, TType>>;
        children_d?: Array<string>;
        parent?: string;
        parents?: Array<string>;
    }

    export interface IMemberNodeData {
        level?: number;
        isShowMoreMember?: boolean;
        nextLoadStartIndex?: number;
        parentUniqueName?: string;
        childrenTotalCount?: number;
        filtredChildrenTotalCount?: number;
    }

    export interface IMemberNode extends IJsTreeNode<IMemberNodeData, any> {

    }

    export interface IMemberNodeLookup {
        [key: string]: IMemberNode
    }

    export interface IMemberNodeUniqueNameLookup {
        [key: string]: boolean
    }

    export class AffectedNodesSet {
        static Empty=new AffectedNodesSet();

        private _innerObject = {};

        Add(uniqueName: string): AffectedNodesSet {
            this._innerObject[uniqueName] = true;
            return this;
        }

        Remove(uniqueName: string): AffectedNodesSet {
            delete this._innerObject[uniqueName];
            return this;
        }

        AddRange(uniqueNames: string[]): AffectedNodesSet {
            uniqueNames.forEach(x => this.Add(x));
            return this;
        }

        Union(other: AffectedNodesSet): AffectedNodesSet {
            other.ForEach(x => {
                this.Add(x);
                return true;
            });
            return this;
        }

        Except(other: AffectedNodesSet): AffectedNodesSet {
            other.ForEach((key) => { delete this._innerObject[key]; });
            return this;
        }

        Clone(): AffectedNodesSet {
            var clone = new AffectedNodesSet();
            this.ForEach((key) => {
                clone.Add(key);
            });
            return clone;
        }

        ToArray() {
            return Object.keys(this._innerObject);
        }

        Clear(): AffectedNodesSet {
            this.ForEach((key) => { delete this._innerObject[key]; });
            return this;
        }

        Contains(uniqueName: string): boolean {
            return Boolean(this._innerObject[uniqueName]);
        }

        ForEach(operation: (key: string) => void) {
            const keys = Object.keys(this._innerObject);
            for (let index in keys) {
                if (keys.hasOwnProperty(index)) {
                    operation(keys[index]);
                }
            }
        }
    }

    export enum MemberFilterType {
        BeginsWith,
        EndsWith,
        Contains,
    }

    export class MemberFilter {
        constructor(readonly Value: string, readonly Type: MemberFilterType) {}
    }

    export class FilterLevel {
        constructor(public UniqueName: string, public Caption: string) {

        }

        DeepCopy(obj: FilterLevel): FilterLevel {
            return new FilterLevel(obj.UniqueName, obj.Caption);
        }
    }

    export class FilterMetadata {
        constructor(public UniqueName: string,
            public Caption: string,
            public SortedLevels: FilterLevel[],
            public RootMembersTotalCount: number,
            public AllLevelsMembersTotalCount: number,
            public DefaultMember: IFilterInfo) {
        }

        DeepCopy(obj: FilterMetadata): FilterMetadata {
            return new FilterMetadata(obj.UniqueName,
                obj.Caption,
                JSON.parse(JSON.stringify(obj.SortedLevels)),
                obj.RootMembersTotalCount,
                obj.AllLevelsMembersTotalCount,
                JSON.parse(JSON.stringify(this.DefaultMember)));
        }
    }

    export abstract class FilterRequestBase {
        ConnectionString: string;

        constructor(public FieldUniqueName) {}
    }

    export class MetadataRequest extends FilterRequestBase {
        constructor(public fieldUniqueName: string, public readonly ExistingLeafs: string[]) { super(fieldUniqueName); }
    }

    export class MetadataResponse {
        constructor(public readonly Metadata: FilterMetadata, public readonly CleanedStateInfo: ICleanedStateInfo) {

        }
    }

    export abstract class MembersRequestBase extends FilterRequestBase {
        constructor(fieldUniqueName: string, public Start: number = 0, public Count: number = 0, public Filter: MemberFilter = null) { super(fieldUniqueName) }
    }

    export class MembersRequest extends MembersRequestBase {
        constructor(fieldUniqueName: string, public Start: number = 0, public Count: number = 0, public Filter: MemberFilter = null) {
            super(fieldUniqueName, Start, Count, Filter);
        }
    }

    export class LeafMembersRequest extends MembersRequestBase {
        constructor(fieldUniqueName: string, public Start: number = 0, public Count: number = 0, public Filter: MemberFilter = null) {
            super(fieldUniqueName, Start, Count, Filter);
        }
    }

    export class MembersResponse {
        FilterInfo: IFilterInfo;
    }

    export class ChildrenRequest extends FilterRequestBase {
        constructor(fieldUniqueName: string, public Parent: string, public Start: number, public Count: number) {
            super(fieldUniqueName);
        }
    }

    export class FiltredElementsChildrenCountRequest {
        constructor(public FieldUniqueName: string, public NodesUniqueNames: string[], public Filter: MemberFilter) {

        }
    }

    export class GetMembersByStatusRequest extends FilterRequestBase {
        constructor(fieldUniqueName: string, public Start: number = 0, public Count: number = 0, public Status: FilterItemState, public Filter: IFilterItem) {
            super(fieldUniqueName);
        }
    }

    export interface IChildrenCountInfoLookup {
        [key: string]: IChildrenCountInfo;
    }

    export interface IChildrenCountInfo {
        ChildrenCount: number;
    }

    export class FiltredElementsChildrenCountResponse {
        constructor(public ChildrenCountInfoLookup: IChildrenCountInfoLookup = {}) {

        }
    }

    export enum FilterItemState {
        Checked,
        Unchecked
    }

    export interface IFilterInfo {
        readonly ParentsLookup: IMemberNodeLookup;
        readonly LastLevelNodes: IMemberNode[];
        readonly HasMoreMembers: boolean;
    }

    export interface ICleanedStateInfo {
        readonly ExistingMembersHierarchyLookup: IMemberNodeLookup;
    }

    export class MemberNodesHelper {
        static GetAllParentsNames(parentsLookup: IMemberNodeLookup, targetNode: IMemberNode): string[] {
            return MemberNodesHelper.GetAllParentsDataCore<string>(parentsLookup, targetNode, x => x.id);
        }

        static GetAllParents(parentsLookup: IMemberNodeLookup, targetNode: IMemberNode): IMemberNode[] {
            return MemberNodesHelper.GetAllParentsDataCore<IMemberNode>(parentsLookup, targetNode, x => x);
        }

        static GetAllParentsDataCore<T>(parentsLookup: IMemberNodeLookup, targetNode: IMemberNode, dataSelector: (x: IMemberNode) => T): T[] {
            const result: T[] = [];
            while (true) {
                const parentNode = parentsLookup[targetNode.data.parentUniqueName];
                if (!parentNode) break;
                result.push(dataSelector(parentNode));
                targetNode = parentNode;
            }
            return result;
        }

        static GetAllParentsWithPriority<T>(priorityLookupList: IMemberNodeLookup[], targetNode: IMemberNode, dataSelector: (x: IMemberNode) => T): T[] {
            const result: T[] = [];
            while (true) {
                let parentNode = null;
                for (let i = 0; i < priorityLookupList.length; i++) {
                    const parentsLookup = priorityLookupList[i];
                    parentNode = parentsLookup[targetNode.data.parentUniqueName];
                    if (parentNode) {
                        break;
                    }
                }
                if (!parentNode) break;
                result.push(dataSelector(parentNode));
                targetNode = parentNode;
            }
            return result;
        }

        static HierarchizeNodes(nodes: IMemberNode[], parentsLookup: IMemberNodeLookup): IMemberNode[] {
            var resultNodes: IMemberNode[] = [];
            var nodesTochildrenLookup: { [key: string]: { [key: string]: boolean } } = {};

            var processNode = (parentUniqueName: string,
                nodeToNodesChildrenLookupMap: { [key: string]: { [key: string]: boolean; }; },
                currentNode: IMemberNode,
                resultNodes: IMemberNode[]) => {
                var childrenLookup = nodeToNodesChildrenLookupMap[parentUniqueName] || (nodeToNodesChildrenLookupMap[parentUniqueName] = {});
                if (!childrenLookup[currentNode.id]) {
                    resultNodes.push(currentNode);
                    childrenLookup[currentNode.id] = true;
                }
            };

            nodes.forEach(currentNode => {
                while (true) {
                    const parent: IMemberNode = parentsLookup[currentNode.data.parentUniqueName];
                    if (!parent) {
                        processNode("#", nodesTochildrenLookup, currentNode, resultNodes);
                        break;
                    } else {
                        processNode(parent.id, nodesTochildrenLookup, currentNode, parent.children as IMemberNode[]);
                        currentNode = parent;
                    }
                }
            });
            return resultNodes;
        }

    }

    export interface IGetNodesInfo {
        Members: IMemberNode[];
        MaxElementLimitReached: boolean;
        HasTrimmedToLimitMembers: boolean;
    }

    export interface ISerializableStateControl {

        TreeState: IMemberNode[];
        LoadedElementsCount: number;
        MaxVisibleElementsLimitReached: boolean;
        RestoreTreeState(savedState: IMemberNode[], onReadyCallback: () => void);
    }

    export class ControlStateInfo {
        private _treeState: Array<IMemberNode>;
        private _loadedElementsCount: number;
        private _isMaxVisibleElementsLimitReached: boolean;

        constructor(private _filterControl: ISerializableStateControl) {}

        Save() {
            this._treeState = this._filterControl.TreeState;
            this._loadedElementsCount = this._filterControl.LoadedElementsCount;
            this._isMaxVisibleElementsLimitReached = this._filterControl.MaxVisibleElementsLimitReached;
        }

        Restore(onReadyCallback: () => void = () => {}) {
            this._filterControl.LoadedElementsCount = this._loadedElementsCount;
            this._filterControl.MaxVisibleElementsLimitReached = this._isMaxVisibleElementsLimitReached;
            this._filterControl.RestoreTreeState(this._treeState, onReadyCallback);
        }

    }

    export interface IFilterControlServiceFactory {
        Create(_connectionString: string): IFilterControlService;
    }

    export interface IFilterControlService {
        GetMetadata(request: MetadataRequest): Promise<MetadataResponse>;
        GetMembers(request: MembersRequest): Promise<MembersResponse>;
        GetLeafMembers(request: LeafMembersRequest): Promise<MembersResponse>;
        GetChildren(request: ChildrenRequest): Promise<MembersResponse>;
        GetMembersByStatus(request: GetMembersByStatusRequest, stateManager: IFilterStateManager): Promise<MembersResponse>;
        GetFiltredElementsChildrenCount(request: FiltredElementsChildrenCountRequest): Promise<FiltredElementsChildrenCountResponse>;
    }


}