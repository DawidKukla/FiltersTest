namespace Comarch.Controls.FilterControlModule {
    import IMemberNode = Common.IMemberNode;
    import IJstreeRedrawNodeArgs = Common.IJstreeRedrawNodeArgs;
    import FilterStateManager = FilterStateManagerModule.FilterStateManager;
    import ExtendedFilterItem = FilterStateManagerModule.ExtendedFilterItem;
    import MemberNodesHelper = Common.MemberNodesHelper;
    import AffectedNodesSet = Common.AffectedNodesSet;
    import IJsTreeNodeState = Common.IJsTreeNodeState;
    import TreeHelpers = Utils.TreeUtils.TreeHelpers;
    import ForwardTreeTraversalIteratorFactory = Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
    import FilterMetadata = Common.FilterMetadata;
    import MetadataRequest = Common.MetadataRequest;
    import IFilterInfo = Common.IFilterInfo;
    import MembersRequest = Common.MembersRequest;
    import LeafMembersRequest = Common.LeafMembersRequest;
    import ChildrenRequest = Common.ChildrenRequest;
    import MemberFilter = Common.MemberFilter;
    import IFilterControlService = Common.IFilterControlService;
    import FiltredElementsChildrenCountRequest = FilterControlModule.Common.FiltredElementsChildrenCountRequest;
    import IChildrenCountInfoLookup = FilterControlModule.Common.IChildrenCountInfoLookup;
    import BackwardTreeTraversalIteratorFactory = Utils.TreeUtils.BackwardTreeTraversalIteratorFactory;
    import FilterItemState = FilterControlModule.Common.FilterItemState;
    import GetMembersByStatusRequest = FilterControlModule.Common.GetMembersByStatusRequest;
    import IGetNodesInfo = FilterControlModule.Common.IGetNodesInfo;
    import IMemberNodeLookup = FilterControlModule.Common.IMemberNodeLookup;
    import IFilterControl = FilterControlModule.Common.ISerializableStateControl;
    import ControlStateInfo = FilterControlModule.Common.ControlStateInfo;
    import IFilterStateManager = FilterControlModule.FilterStateManagerModule.IFilterStateManager;
    import IFilterControlServiceFactory = FilterControlModule.Common.IFilterControlServiceFactory;
    import IFilterStateManagerFactory = FilterControlModule.FilterStateManagerModule.IFilterStateManagerFactory;
    import IFilterItem = FilterControlModule.FilterStateManagerModule.Common.IFilterItem;
    import FilterType = FilterControlModule.FilterStateManagerModule.Common.FilterType;
    import SelectionMode = FilterControlModule.FilterStateManagerModule.Common.SelectionMode;
    import IResourcesMap = Controls.FilterControlModule.Common.IResourcesMap;
    import ILimitsHelperOwner = Controls.FilterControlModule.Helpers.ILimitsHelperOwner;
    import ILimitsHelper = Controls.FilterControlModule.Helpers.ILimitsHelper;
    import ILimitsHelperFactory = Controls.FilterControlModule.Helpers.ILimitsHelperFactory;
    import LimitsHelperFactory = Controls.FilterControlModule.Helpers.LimitsHelperFactory;


    export class FilterControl implements IFilterControl, ILimitsHelperOwner {
       
        static get Resources():IResourcesMap {return window["filterControlResources_95ec3678f2ef437e8df72c771b74e45e"]};
        static get Template():string {return $("#filterControlTemplate_95ec3678f2ef437e8df72c771b74e45e").html()};

        private _stateManagerFactory: IFilterStateManagerFactory;
        private _serviceFactory: IFilterControlServiceFactory;
        private _view: FilterControlModule.IFilterControlView;
        private _limitsHelperFactory:ILimitsHelperFactory;
        private _options:Options;

        private _service: IFilterControlService;
        private _isLoadingMoreElement: boolean;
        private _isRestoringTreeState: boolean;
        private _elementsToLoad: IMemberNode[];
        private _elementsToLoadStartIndex: number;
        private _filterElementsLoadMoreStartIndex: number;
        private _loadMoreNodeIdPart: string;
        private _selectAllNodeId: string;
        private _selectAllFiltredId: string;
        private _deselectAllFiltredNodeId: string;
        private _stateManager: IFilterStateManager;
        private _filterStateManager: IFilterStateManager;
        private _redrwedNodes: string[];
        private _isLoadingAllElements: boolean;
        private _metadata: FilterMetadata;
        private _nodesWithoutFullChildrenCountLookup: IMemberNodeLookup;
        private _lastProcessedNodeUniqeName: string;
        private _currentStatusFilter: FilterItemState;
        private _isInFilterMode: boolean;
        private _isInSearchFilterMode: boolean;
        private _isInStatusFilterMode: boolean;
        private _isMaxVisibleElementsLimitReached: boolean;
        private _controlStateInfo: ControlStateInfo;
        private _limitsHelper:ILimitsHelper;

        constructor(
            options:IOptions,
            viewFactory: IFilterControlViewFactory,
            serviceFactory: IFilterControlServiceFactory,
            stateManagerFactory: IFilterStateManagerFactory,
            limitsHelperFactory:ILimitsHelperFactory=new LimitsHelperFactory()) {
            
            this._options = new Options().Merge(options);
            this._view = viewFactory.Create(this._options.$TargetContainer,this._options.Template,this);
            this._serviceFactory = serviceFactory;
            this._stateManagerFactory = stateManagerFactory;
            this._limitsHelperFactory = limitsHelperFactory;
        }

        private ResetInternalState() {
            this._isLoadingMoreElement = false;
            this._isRestoringTreeState = false;
            this._elementsToLoad = null;
            this._elementsToLoadStartIndex = 0;
            this._filterElementsLoadMoreStartIndex = 0;
            this._service = null;
            this._loadMoreNodeIdPart = "ShowMore";
            this._selectAllNodeId = "SelectAll";
            this._selectAllFiltredId = "SelectAllFiltred";
            this._deselectAllFiltredNodeId = "DeSelectAllFiltred";
            this._stateManager = null;
            this._filterStateManager = null;
            this._redrwedNodes = [];
            this._isLoadingAllElements = false;
            this._elementsToLoadStartIndex = 0;
            this._metadata = null;
            this._nodesWithoutFullChildrenCountLookup = {};
            this._lastProcessedNodeUniqeName = null;
            this._currentStatusFilter = FilterItemState.Checked;
            this._isInFilterMode = false;
            this._isInSearchFilterMode = false;
            this._isInStatusFilterMode = false;
            this._isMaxVisibleElementsLimitReached = false;
            this._controlStateInfo = null;
            this._limitsHelper=null;
        }

        get Options(): Options {
            return this._options;
        };

        set Options(value: Options) { this._options = value; }

        get Metadata(): FilterMetadata {
            return this._metadata;
        }

        get ServiceFactory(): IFilterControlServiceFactory {
            return this._serviceFactory;
        }

        set ServiceFactory(value: IFilterControlServiceFactory) {
            this._serviceFactory = value;
        }

        get LoadedElementsCount(): number { return this._limitsHelper.LoadedElementsCount; }

        set LoadedElementsCount(value: number) { this._limitsHelper.LoadedElementsCount = value; }


        private get TotalElementsCount(): number {
            return this._metadata.AllLevelsMembersTotalCount;
        }
        
        public get IsInSearchFilterMode(): boolean {
            return this._isInSearchFilterMode;
        };

        public set IsInSearchFilterMode(value: boolean) {
            this._isInSearchFilterMode = value;
            if (value) {
                this._isInFilterMode = true;
                this._isInStatusFilterMode = false;
            } else {
                this._isInFilterMode = false;
            }

        };

        private get IsInStatusFilterMode(): boolean {
            return this._isInStatusFilterMode;
        };

        private set IsInStatusFilterMode(value: boolean) {
            this._isInStatusFilterMode = value;
            if (value) {
                this._isInFilterMode = true;
                this._isInSearchFilterMode = false;
            } else {
                this._isInFilterMode = false;
            }

        };
        
        get MaxVisibleElementsLimitReached(): boolean {
            return this._isMaxVisibleElementsLimitReached;
        }

        set MaxVisibleElementsLimitReached(value: boolean) { this._isMaxVisibleElementsLimitReached = value; }

        get TreeState(): IMemberNode[] {
            return this._view.GetTreeState();
        }

        get IsInFilterMode(): boolean { return Boolean(this._isInFilterMode) };
        
        private CreateControlTopBar() {
            this._view.UpdateLevelsMenu();
            this._view.UpdateFilterTypeSelect();
        }
        
        private async RefreshTree(connectionString: string, fieldUniqueName: string, savedState: IFilterItem) {
            this.ShowAllTreeLoadingIndicator();
            this._elementsToLoadStartIndex = this._options.CurrentWindow;
            this._service = this.ServiceFactory.Create(connectionString);
            const metadataResponse = (await this._service.GetMetadata(new MetadataRequest(fieldUniqueName, FilterStateManager.GetLeafs(savedState))));
            this._metadata = metadataResponse.Metadata;
            this._limitsHelper = this._limitsHelperFactory.Create(this, this._options.MaxTotalElementsCount, this._metadata.AllLevelsMembersTotalCount);
            this._limitsHelper.LoadedElementsCount=0;
            this.CreateControlTopBar();
            this._stateManager = this._stateManagerFactory.Create(FilterType.Excluded, this._metadata.RootMembersTotalCount, false);
            if (savedState) {
                this._stateManager.Deserialize(savedState, this._metadata.RootMembersTotalCount, metadataResponse.CleanedStateInfo);
            } else {
                if (this._metadata.DefaultMember) {
                    this.HandleDefaultMember();
                } else {
                    this._stateManager.Reset(true);
                }
            }
            return this.CreateTree();
        }


        private CreateTree() {
           return this._view.CreateTree();
        }

        private HandleDefaultMember() {
            this._stateManager.Reset(false);
            const defaultMemberRoot = MemberNodesHelper.HierarchizeNodes(this._metadata.DefaultMember.LastLevelNodes, this._metadata.DefaultMember.ParentsLookup);
            TreeHelpers.TraverseListPreorder<IMemberNode>(defaultMemberRoot,
                (x) => x.children as IMemberNode[],
                (current, parent, level, index, parents) => {
                    if (this.IsTreeLeaf(current)) {
                        parents = [{ id: "#" } as IMemberNode].concat(parents);
                        this.AddStateNodeFromTree(this._stateManager, parents, current, true, true);
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory<IMemberNode>(),
                true);
        }

        async GetNodeData(obj: IMemberNode) {
            const info = await this.LoadNodesCore(obj, this._elementsToLoadStartIndex);
            if (info.MaxElementLimitReached && !info.HasTrimmedToLimitMembers) {
                this.ManualResetLoadingAction(obj);
                return;
            }
            this._view.RenderTree(info.Members);

        }

        private ManualResetLoadingAction(obj: IMemberNode) {
            const node: IMemberNode =  this.GetTreeNode(obj.id);
            const nodeElement = $( this.GetTreeNode(obj.id, true));
            nodeElement.removeClass("jstree-loading");
            node.state.loaded = true;
            node.state.loading = false;
            node.state.loaded = false;
        }

        private async LoadNodesCore(obj: IMemberNode, startIndex: number): Promise<IGetNodesInfo> {
            let info: IGetNodesInfo;
            if (this._isLoadingMoreElement || this._isRestoringTreeState) {
                info = {
                    Members: this._elementsToLoad,
                    MaxElementLimitReached: false,
                    HasTrimmedToLimitMembers: false
                };
            } else {
                info = await this.LoadNodesFromServerCore(obj, startIndex);
            }
            return info;
        }

        private async LoadNodesFromServerCore(obj: IMemberNode, startIndex: number): Promise<IGetNodesInfo> {
            if (this._isMaxVisibleElementsLimitReached) {
                this.ShowMaxLimitReached();
                return {
                    Members: [],
                    MaxElementLimitReached: true,
                    HasTrimmedToLimitMembers: false

                } as IGetNodesInfo;
            }
            var response: IFilterInfo = null;
            let createAllNode = false;
            let createFiltredStateSelectionNodes = false;
            let hasTrimmedToLimitMembers = false;
            if (obj.id === "#") {
                createAllNode = true;
                if (this.IsInFilterMode) {
                    createAllNode = false;
                    createFiltredStateSelectionNodes = true;
                    if (this.IsInSearchFilterMode) {
                        response = (await this._service.GetMembers(new MembersRequest(this._view.FilterLevel,
                            this._filterElementsLoadMoreStartIndex,
                            this._options.DataPackageSize,
                            new MemberFilter(this._view.SearchPattern, this._view.MemberFilterType)))).FilterInfo;
                    } else if (this.IsInStatusFilterMode) {
                        response = (await this._service.GetMembersByStatus(new GetMembersByStatusRequest(this._view.FilterLevel,
                                this._filterElementsLoadMoreStartIndex,
                                this._options.DataPackageSize,
                                this._currentStatusFilter,
                                this._stateManager.Serialize()),
                            this._stateManager)).FilterInfo;
                    } else {
                        throw new Error("Invalid state");
                    }

                } else if (this._isLoadingAllElements) {
                    response = (await this._service.GetLeafMembers(new LeafMembersRequest(this._view.FilterLevel, this._elementsToLoadStartIndex, this._options.MaxTotalElementsCount)))
                        .FilterInfo;
                } else {
                    response =
                        (await this._service.GetMembers(new MembersRequest(this._metadata.SortedLevels[0].UniqueName, this._elementsToLoadStartIndex, this._options.DataPackageSize)))
                        .FilterInfo;
                }
            } else {
                response = (await this._service.GetChildren(new ChildrenRequest(this._metadata.SortedLevels[0].UniqueName, obj.id, startIndex, this._options.DataPackageSize))).FilterInfo;
            }
            const nodesToLoad = await this.PrepareDataToLoad(obj, response);
            this._isMaxVisibleElementsLimitReached = !this._limitsHelper.EnforceLimits(nodesToLoad);
            if (nodesToLoad.length !== 0 && this._isMaxVisibleElementsLimitReached) {
                hasTrimmedToLimitMembers = true;
            }
            if (response.HasMoreMembers) {
                nodesToLoad.push(this.CreateLoadMoreNode(obj, response.LastLevelNodes));
            }
            if (createAllNode) {
                nodesToLoad.unshift(this.CreateAllNode());
            }
            if (createFiltredStateSelectionNodes) {
                nodesToLoad.unshift(this.CreateSelectAllFiltredNode(), this.CreateDeSelectAllFiltredNode());
            }
            return {
                Members: nodesToLoad,
                MaxElementLimitReached: hasTrimmedToLimitMembers,
                HasTrimmedToLimitMembers: hasTrimmedToLimitMembers
            } as IGetNodesInfo;
        }

        private async PrepareDataToLoad(invokingNode: IMemberNode, response: IFilterInfo) {
            let nodes = response.LastLevelNodes;
            const expandToLevelIndex = this.GetLevelNumberFromUniqueName(this._view.FilterLevel);
            let expandAll = false;
            if (this._isLoadingAllElements) {
                expandAll = true;
            }
            if (this.IsLoadingWholeTree(invokingNode)) {
                nodes = MemberNodesHelper.HierarchizeNodes(nodes, response.ParentsLookup);
                this.AssignLevelIndex(invokingNode, nodes, true);
                this.ExpandNodesToTargetLevel(nodes, expandToLevelIndex, expandAll);
            } else {
                this.AssignLevelIndex(invokingNode, nodes, false);
            }

            if (this._isLoadingMoreElement) {
                nodes = this.MergeNewNodesIntoExistingTree(invokingNode, nodes);

            }
            if (this.IsInFilterMode && invokingNode.id === "#") {
                await this.InitFiltredElementState(nodes, response.HasMoreMembers, response);
            }
            return nodes;
        }

        private async InitFiltredElementState(hierarchizedNodes: IMemberNode[], hasMoreMembers: boolean, response: IFilterInfo) {
            const nodesWithUpdatedCount = JSON.parse(JSON.stringify(this._nodesWithoutFullChildrenCountLookup));
            this._nodesWithoutFullChildrenCountLookup = {};
            const existingElementsChildrenCountLookup: IChildrenCountInfoLookup = {};
            this.FillAvailableFilterResultTotalCounts(hierarchizedNodes, this._nodesWithoutFullChildrenCountLookup, existingElementsChildrenCountLookup, hasMoreMembers);
            this.CalculateUpdatedCountMemebers(nodesWithUpdatedCount, existingElementsChildrenCountLookup);
            this.CreateFilterVisibleState(hierarchizedNodes, existingElementsChildrenCountLookup, nodesWithUpdatedCount, response);
            console.log(`%cFILTER STATE:`, "background: #222; color: yellow");
            this._filterStateManager.Print();
        }

        private CalculateUpdatedCountMemebers(nodesWithUpdatedCount: any, existingElementsChildrenCountLookup: IChildrenCountInfoLookup) {
            const keys = Object.keys(nodesWithUpdatedCount);
            for (let index in keys) {
                if (keys.hasOwnProperty(index)) {
                    const uniqueName = keys[index];
                    const childrenCountInfo = existingElementsChildrenCountLookup[uniqueName];
                    if (childrenCountInfo && childrenCountInfo.ChildrenCount === -1) {
                        delete nodesWithUpdatedCount[uniqueName];
                    }
                }
            }
        }

        private CreateFilterVisibleState(hierarchizedNodes: IMemberNode[],
            existingElementsChildrenCountLookup: IChildrenCountInfoLookup,
            nodesWithUpdatedCount: IMemberNodeLookup,
            response: IFilterInfo) {
            var currentActionLastProcessedNodeUniqueName: string = null;
            TreeHelpers.TraverseListPreorder<IMemberNode>(hierarchizedNodes,
                (x) => x.children as IMemberNode[],
                (current) => {
                    const childrenCount = existingElementsChildrenCountLookup[current.id].ChildrenCount;
                    current.data.filtredChildrenTotalCount = childrenCount;
                    currentActionLastProcessedNodeUniqueName = current.id;
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory());

            this.TransformOrginalStateIntoVisibleFilterState(hierarchizedNodes, existingElementsChildrenCountLookup);

            this._filterStateManager.UpdateFilteredChildrensTotalCount(existingElementsChildrenCountLookup, nodesWithUpdatedCount);

            this._lastProcessedNodeUniqeName = currentActionLastProcessedNodeUniqueName;

            this._filterStateManager.Refresh();
        }

        private TransformOrginalStateIntoVisibleFilterState(hierarchizedNodes: IMemberNode[], existingElementsChildrenCountLookup: IChildrenCountInfoLookup) {
            var startProcessing = this._lastProcessedNodeUniqeName ? false : true;
            TreeHelpers.TraverseListPreorder<IMemberNode>(hierarchizedNodes,
                (x) => x.children as IMemberNode[],
                (current, parent, level, index, parents) => {
                    if (startProcessing) {
                        if (current.data.level === this._view.FilterLevelNumber) {
                            parents.unshift( this.GetTreeNode("#"));
                            const selectionStatus = this._stateManager.GetSelectionStatus(parents.map(x => x.id), current.id, new BackwardTreeTraversalIteratorFactory<string>());
                            switch (selectionStatus) {
                            case SelectionMode.Selected:
                                this.AddStateNodeFromTree(this._filterStateManager, parents, current, true, false);
                                break;
                            case SelectionMode.Deselected:
                                this.AddStateNodeFromTree(this._filterStateManager, parents, current, false, false);
                                break;
                            case SelectionMode.Undetermined:
                                const stateItem = this._stateManager.CloneBranch(current.id, true);
                                TreeHelpers.TraversePreorder<ExtendedFilterItem>(stateItem,
                                    (x) => x.ChildrenArray,
                                    (current, parent, level, index, stateParents) => {
                                        current.Owner = this._filterStateManager;
                                        if (current.IsLeaf) {
                                            stateParents = parents.map(x => this.CreateFilterItemFromNode(x, this._filterStateManager)).concat(stateParents);
                                            const selectionMode = this._stateManager.GetSelectionStatus(stateParents.map(x => x.UniqueName),
                                                current.UniqueName,
                                                new BackwardTreeTraversalIteratorFactory<string>());
                                            this.AddStateTransformationNodeCore(this._filterStateManager, stateParents, current, selectionMode === SelectionMode.Selected, false);
                                        }
                                        return true;
                                    },
                                    new ForwardTreeTraversalIteratorFactory<ExtendedFilterItem>(),
                                    null,
                                    0,
                                    0,
                                    true //TODO check in Point and change order of track path to be first
                                );
                                break;
                            }
                        }
                    } else {
                        if (current.id === this._lastProcessedNodeUniqeName) {
                            startProcessing = true;
                        }
                    }
                    return true;

                },
                new ForwardTreeTraversalIteratorFactory(),
                true
            );

        }

        private AddStateNodeFromTree(stateManager: IFilterStateManager, parents: IMemberNode[], current: IMemberNode, isSelect: boolean, autoRefresh: boolean) {
            const sortedParents = parents.map(x => this.CreateFilterItemFromNode(x, stateManager));
            const targetNode = this.CreateFilterItemFromNode(current, stateManager);
            this.AddStateTransformationNodeCore(stateManager, sortedParents, targetNode, isSelect, autoRefresh);
        }

        private AddStateTransformationNodeCore(stateManager: IFilterStateManager,
            sortedParents: ExtendedFilterItem[],
            targetNode: ExtendedFilterItem,
            isSelect: boolean,
            autoRefresh: boolean) {
            stateManager.AddNodes(sortedParents, targetNode, isSelect, autoRefresh, new ForwardTreeTraversalIteratorFactory<ExtendedFilterItem>());
        }

        private async LoadMissingNodesCount(nodesLackingFullChildrenCount: string[], existingElementsChildrenCountLookup: IChildrenCountInfoLookup) {
            const childrenCountLookup = await this._service.GetFiltredElementsChildrenCount(new FiltredElementsChildrenCountRequest(this._view.FilterLevel,
                nodesLackingFullChildrenCount,
                new MemberFilter(this._view.SearchPattern, this._view.MemberFilterType)));
            for (let key in childrenCountLookup.ChildrenCountInfoLookup) {
                if (childrenCountLookup.ChildrenCountInfoLookup.hasOwnProperty(key)) {
                    const info = childrenCountLookup.ChildrenCountInfoLookup[key];
                    existingElementsChildrenCountLookup[key] = info;
                }
            }
        }

        private FillAvailableFilterResultTotalCounts(nodes: IMemberNode[],
            nodesLackingFullChildrenCount: IMemberNodeLookup,
            existingElementsChildrenCountLookup: IChildrenCountInfoLookup,
            hasMoreMembers: boolean) {

            var previousMember: IMemberNode = null;
            var lastLevelNumber = 0;
            TreeHelpers.TraverseListBFS(nodes,
                x => $.isArray(x.children) ? x.children as IMemberNode[] : [],
                (current) => {
                    var childrenTotalCount: number;
                    var targetNode = current;
                    if (current.data.level < this._view.FilterLevelNumber) {
                        childrenTotalCount = current.children.length;
                    } else {
                        childrenTotalCount = current.data.childrenTotalCount;
                    }
                    this.UpdateCount(targetNode, childrenTotalCount, existingElementsChildrenCountLookup);

                    var level = current.data.level;
                    if (lastLevelNumber !== level && previousMember && hasMoreMembers) {

                        if (previousMember.data.level < this._view.FilterLevelNumber) {
                            nodesLackingFullChildrenCount[previousMember.id] = previousMember;
                            this.UpdateCount(previousMember, -1, existingElementsChildrenCountLookup);
                        }
                        lastLevelNumber = level;

                    }
                    previousMember = current;
                    return true;
                });

            if (!hasMoreMembers) {
                existingElementsChildrenCountLookup["#"] = { ChildrenCount: nodes.length };
            }
        }

        private UpdateCount(targetNode: IMemberNode, childrenTotalCount: number, existingElementsChildrenCountLookup: IChildrenCountInfoLookup) {
            targetNode.data.filtredChildrenTotalCount = childrenTotalCount;
            existingElementsChildrenCountLookup[targetNode.id] = { ChildrenCount: childrenTotalCount };
        }

        private IsLoadingWholeTree(invokingNode: IMemberNode) {
            return (this.IsInFilterMode && this.IsLoadingFilterLevelElements(invokingNode)) || this._isLoadingAllElements;
        }

        private AssignLevelIndex(invokingNode: IMemberNode, loadedNodes: IMemberNode[], isHierarchical: boolean) {
            if (isHierarchical) {
                TreeHelpers.TraverseListPreorder<IMemberNode>(loadedNodes,
                    (x) => (x.children as IMemberNode[]),
                    (current, parent, level) => {
                        current.data.level = level;
                        return true;
                    });
            } else {
                let level: number = null;
                if (invokingNode.id === "#") {
                    level = 0;
                } else { //root or search
                    level = invokingNode.data.level + 1;
                }
                loadedNodes.forEach(n => n.data.level = level);
            }

        }

        HandleConditionalSelect(node: IMemberNode) {
            let result = true;
            if (this.IsShowMoreMember(node)) {
                console.log("Loading More Nodes");
                this.LoadMoreNodes(node);
                result = false;
            }
            return result;
        }

        private MergeNewNodesIntoExistingTree(parentNode: IMemberNode, newNodes: IMemberNode[]): IMemberNode[] {
            var existingNodes:IMemberNode[] = [];
            parentNode.children.forEach(childId => {
                const node = this.GetTreeNode(childId);
                if (!this.IsSpecialNode(node)) {
                    existingNodes.push(this._view.GetTreeNodeClone(node));
                }
            });
            
            var existingNodesLookup = TreeHelpers.ConvertListToLookup<IMemberNode>(existingNodes,
                x => {
                    return Array.isArray(x.children) ? (x.children as IMemberNode[]) : []; //for lazy loaded elements already in tree which has children=true
                },
                x => x.id);

            TreeHelpers.TraverseListPreorder<IMemberNode>(newNodes,
                x => x.children as IMemberNode[],
                (currentNode) => {
                    var existingNode = existingNodesLookup.getValue(currentNode.id);
                    if (!existingNode) {
                        const existingParentNode = existingNodesLookup.getValue(currentNode.data.parentUniqueName);
                        if (existingParentNode) {
                            existingParentNode.children.push(currentNode);
                        } else {
                            existingNodes.push(currentNode);
                        }
                        return false;
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory()
            );

            return existingNodes;
        }

        private IsSpecialNode(node: any) {
            return this.IsSelectAllMember(node) || this.IsShowMoreMember(node) || this.IsSelectFiltredMember(node) || this.IsDeSelectFiltredMember(node);
        }

        async LoadMoreNodes(targetNode: IMemberNode) {
            if (this._isMaxVisibleElementsLimitReached) {
                this.ShowMaxLimitReached();
                return;
            }
            this._isLoadingMoreElement = true;
            this.ShowNodeLoadingIndicator(targetNode.id);
            const parentNode =  this.GetTreeNode(targetNode.parent);
            this._elementsToLoadStartIndex = targetNode.data.nextLoadStartIndex;
            this._elementsToLoad = (await this.LoadNodesFromServerCore(parentNode, this._elementsToLoadStartIndex)).Members;
            this._view.ReloadTreeNode(parentNode,
                () => {
                    this._isLoadingMoreElement = false;
                    this._elementsToLoadStartIndex = 0;
                    this._elementsToLoad.length = 0;
                });
        }

        private ShowNodeLoadingIndicator(id: string) {
            const $liElement = $( this.GetTreeNode(id, true));
            $liElement.addClass("jstree-loading");
        }

        private IsLoadingFilterLevelElements(parentNode: IMemberNode): boolean {
            let loadedNodesLevelId = -1; //root;
            if (parentNode.data) {
                loadedNodesLevelId = parentNode.data.level;
            }
            loadedNodesLevelId++; //we are actualy loading next level not parent level
            if (loadedNodesLevelId <= this.GetLevelNumberFromUniqueName(this._view.FilterLevel)) {
                return true;
            }
            return false;
        }

        private CreateLoadMoreNode(parentNode: IMemberNode, loadedLastLevelNodesNodes: IMemberNode[]): IMemberNode {
            let startIndex = loadedLastLevelNodesNodes.length;
            if (parentNode.children.length) {
                startIndex += parentNode.children.length;
                startIndex--; //SelectAll
                startIndex--; //ShowMore
            }
            if (this.IsInFilterMode && this.IsLoadingFilterLevelElements(parentNode)) {
                this._filterElementsLoadMoreStartIndex += loadedLastLevelNodesNodes.length; //here there is no additional extended packed node
                startIndex = this._filterElementsLoadMoreStartIndex;
            }

            const node: IMemberNode = {
                id: `${this._loadMoreNodeIdPart}_${this.GetRandomId()}`,
                text: "...ShowMore",
                data: {
                    isShowMoreMember: true,
                    parentUniqueName: parentNode.id,
                    nextLoadStartIndex: startIndex
                }

            };

            return node;
        }

        private CreateAllNode(): IMemberNode {
            const node: IMemberNode = {
                id: this._selectAllNodeId,
                text: "All",
            };
            return node;
        }

        private CreateSelectAllFiltredNode(): IMemberNode {
            const node: IMemberNode = {
                id: this._selectAllFiltredId,
                text: "Select All",
            };
            return node;
        }

        private CreateDeSelectAllFiltredNode(): IMemberNode {
            const node: IMemberNode = {
                id: this._deselectAllFiltredNodeId,
                text: "Deselect All",
            };
            return node;
        }

        private GetRandomId() {
            return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(2, 10);
        }

        private IsShowMoreMember(nodeObj: IMemberNode) {
            return nodeObj.data && nodeObj.data.isShowMoreMember;
        }

        private IsSelectAllMember(nodeObj: IMemberNode) {
            return nodeObj.id === this._selectAllNodeId;
        }

        private IsSelectFiltredMember(nodeObj: IMemberNode) {
            return nodeObj.id === this._selectAllFiltredId;
        }

        private IsVirtualRootMember(nodeObj: IMemberNode) {
            return nodeObj.id === "#";
        }

        private IsDeSelectFiltredMember(nodeObj: IMemberNode) {
            return nodeObj.id === this._deselectAllFiltredNodeId;
        }

        CreateReferenceTree($container: JQuery, data: Object[]) {
            $container.jstree(
                {
                    'plugins': ["core", "checkbox"],
                    'core': {
                        'data': data,
                        'check_callback': (operation) => {
                            return operation === "create_node" || operation === "delete_node";
                        },
                    },
                }).on("loaded.jstree",
                () => {
                    $container.jstree("open_all");
                }).on("ready.jstree",
                () => {
                    //  data.forEach(x=>this.ReferenceJstreeInstance.create_node("#",x));
                });

        }


        Search() {
            this.ClearFilter(false);
            this.SearchCore(this._view.SearchPattern);
        }

        ShowOnlySelected() {
            this.ClearFilter(false);
            this.DisplayOnlySelectedElements();
        }

        ShowOnlyDeSelected() {
            this.ClearFilter(false);
            this.DisplayOnlyDeselectedElements();
        }

        ShowAll() {
            this.ClearFilter(true);
        }


        ExecuteClearFilter() {
            this.ClearFilter(true);
        }

        private SaveTreeState() {
            this._controlStateInfo = new ControlStateInfo(this);
            this._controlStateInfo.Save();
        }

        //for multiple sequential searches
        EnsureSaveTreeState() {
            if (!this._controlStateInfo) {
                this.SaveTreeState();
            }
        }

        RestoreState() {
            if (!this._controlStateInfo) return;
            this._controlStateInfo.Restore();
        }

        RestoreTreeState(savedState: IMemberNode[], onReadyCallback: () => void = () => {}) {
            this._isRestoringTreeState = true;
            this._elementsToLoad = savedState;
            this._view.ReloadTreeNode(this.GetTreeNode("#"),
                () => {
                    this._elementsToLoad = null;
                    this._controlStateInfo = null;
                    this._isRestoringTreeState = false;
                    onReadyCallback();
                });
        }

        SearchCore(searchPattern: string) {
            $("#revertSelection").attr("disabled", "true");
            this.IsInStatusFilterMode = false;
            this.IsInSearchFilterMode = true;
            this.FilterCore();
        }

        private FilterCore() {
            this._filterStateManager =this._stateManagerFactory.Create(this._stateManager.GetRootType(), -1, true);
            this.EnsureSaveTreeState();
            this.MaxVisibleElementsLimitReached = false;
            this.LoadedElementsCount=0;
            this.ShowAllTreeLoadingIndicator();
            this._view.ReloadTreeNode(this.GetTreeNode("#"));
        }

        ClearFilter(reloadTree=true, clearSearchPattern=false) {
            console.log("CLEAR SEARCH:");
            this.MergeStates();
            this.ClearSearchHighlight();
            this._filterStateManager = null;
            this.IsInSearchFilterMode = false;
            this.IsInStatusFilterMode = false;
            this._filterElementsLoadMoreStartIndex = 0;
            this._nodesWithoutFullChildrenCountLookup = {};
            this._lastProcessedNodeUniqeName = null;

            if (clearSearchPattern) {
                this._view.ClearSearchText();
            }
            if (reloadTree) {
                this.RestoreState();
            }
            $("#revertSelection").removeAttr("disabled");
        }


        private ClearSearchHighlight() {
            if (!this.IsInSearchFilterMode) return;
            this._view.ClearSearchHighlight();
        }

        ExpandNodesToTargetLevel(loadedNodes: IMemberNode[], targetLevel: number, expandAll: boolean) {
            TreeHelpers.TraverseListPreorder<IMemberNode>(loadedNodes,
                (x) => (x.children as IMemberNode[]),
                (current, parent, level) => {
                    var state: IJsTreeNodeState = current.state || (current.state = {});
                    if (level < targetLevel || expandAll) {
                        state.opened = true;
                    }
                    return true;
                });
        }


        async HandleSelectionChanged(data: {action:string,node:IMemberNode}) {
            const stateManager = this.GetCurrentModeStateManager();
            if (data.action === "select_node") {
                const clickedNode: IMemberNode = data.node;
                const targetNodeId = clickedNode.id;
                this._redrwedNodes = [];
                const targetLevelElements = new AffectedNodesSet().Add(targetNodeId);
                const affectedNodes = new AffectedNodesSet().Add(this._selectAllNodeId);
                let fullRedraw = false;
                if (targetNodeId === this._selectAllNodeId) {
                    const selectionMode = stateManager.GetAllNodeSelectionStatus();
                    const isSelect = this.GetSelectionModeFromClick(selectionMode);
                    affectedNodes.Union(stateManager.Reset(isSelect));
                    fullRedraw = true;
                } else if (targetNodeId === this._selectAllFiltredId) {
                    if (this.IsInSearchFilterMode) {
                        affectedNodes.Union(await this.ApplyServerSelecionForSearchFilter(true, targetLevelElements));
                    } else if (this.IsInStatusFilterMode) {
                        affectedNodes.Union(await this.ApplyServerSelecionForStatusFilter(true, targetLevelElements));
                    } else {
                        throw new Error("Invalid state");
                    }
                    fullRedraw = true;
                } else if (targetNodeId === this._deselectAllFiltredNodeId) {
                    if (this.IsInSearchFilterMode) {
                        affectedNodes.Union(await this.ApplyServerSelecionForSearchFilter(false, targetLevelElements));
                    } else if (this.IsInStatusFilterMode) {
                        affectedNodes.Union(await this.ApplyServerSelecionForStatusFilter(false, targetLevelElements));
                    } else {
                        throw new Error("Invalid state");
                    }
                    fullRedraw = true;
                } else {
                    const selectionMode = stateManager.GetSelectionStatus(clickedNode.parents, targetNodeId);
                    const isSelect = this.GetSelectionModeFromClick(selectionMode);
                    affectedNodes.Union(this.AddUserChangedNodeToState(clickedNode, isSelect));
                }

                this.RedrawAffectedNodes(affectedNodes, targetLevelElements, fullRedraw);
                this.Log(stateManager, affectedNodes.ToArray());
            }
        }

        private GetCurrentModeStateManager() {
            return this.IsInFilterMode ? this._filterStateManager : this._stateManager;
        }

        private GetSelectionModeFromClick(selectionMode: SelectionMode) {
            if (selectionMode === SelectionMode.Deselected || selectionMode === SelectionMode.Undetermined) {
                return true;
            }
            return false;
        }
        
        private RedrawAffectedNodes(affectedNodes: AffectedNodesSet, targetLevelElements: AffectedNodesSet, fullRedraw: boolean) {
            if (fullRedraw) {
                this._view.RedrawNode(this.GetTreeNode("#"),true);
                return;
            }
            affectedNodes.ForEach((id) => {
                if (id !== "#") {
                    let deepDown = false;
                    if (targetLevelElements.Contains(id)) {
                        deepDown = true; //we want full refresh down because not all nodes exist in state 
                    }
                    const node: IMemberNode = this.GetTreeNode(id);
                    if (node) {
                        this._view.RedrawNode(node, false);
                        if (deepDown) {
                            node.children_d.forEach(childId => {
                                const child = this.GetTreeNode(childId);
                                if (child) {
                                    this._view.RedrawNode(child, false);
                                }
                            });
                        }
                    }
                }
            });
        }

        private Log(stateManager: IFilterStateManager, affectedNodes: string[]) {
            console.log("AFFECTED NODES", affectedNodes);
            console.log("REDRAWED NODES", this._redrwedNodes);
            console.log("STATE", stateManager.GetState());
            console.log(stateManager.Print());
        }

        AddUserChangedNodeToState(node: IMemberNode, isSelect: boolean): AffectedNodesSet {
            const stateManager = this.GetCurrentModeStateManager();
            if (this.IsSpecialNode(node)) return AffectedNodesSet.Empty;
            const sortedParents: ExtendedFilterItem[] = [];
            for (let i = 0; i < node.parents.length; i++) {
                const parentNodeId = node.parents[i];
                if (parentNodeId !== "#") {
                    const parentNode = this.GetTreeNode(parentNodeId);
                    const filterItem = this.CreateFilterItemFromNode(parentNode, stateManager);
                    sortedParents.push(filterItem);
                }
            }
            const targetFilterNode = this.CreateFilterItemFromNode(node, stateManager);
            return stateManager.AddNodes(sortedParents, targetFilterNode, isSelect, true);
        }

        private CreateFilterItemFromNode(node: IMemberNode, stateManager: IFilterStateManager): ExtendedFilterItem {
            let childrenCount = -1;
            let filtredChildrenTotalCount = -1;
            let parentUniqueName: string = null;
            let level = -1;
            if (node.id === "#") {
                childrenCount = this._metadata.RootMembersTotalCount;
                filtredChildrenTotalCount = -1;
            } else if (node.data) {
                parentUniqueName = node.data.parentUniqueName || "#";
                childrenCount = node.data.childrenTotalCount;
                filtredChildrenTotalCount = node.data.filtredChildrenTotalCount;
                level = node.data.level;
            }
            return stateManager.CreateItem(node.id, parentUniqueName, childrenCount, filtredChildrenTotalCount, level);
        }

        HandleTreeRedrawNode(e: IJstreeRedrawNodeArgs<any, any>) {
            let currentNode: IMemberNode = e.CurrentNodeObj;
            if (this.IsVirtualRootMember(currentNode)) return;
            var stateManager = this.GetCurrentModeStateManager();
            this._redrwedNodes.push(currentNode.id);
            const $liElement = $(e.CurrentNodeElement);
            const $anchor = $liElement.children(".jstree-anchor");
            if (this.IsShowMoreMember(currentNode) ||
                this.IsSelectFiltredMember(e.CurrentNodeObj) ||
                this.IsDeSelectFiltredMember(e.CurrentNodeObj)) {
                $anchor.children(".jstree-checkbox").remove();
                $anchor.children(".jstree-themeicon").remove();
            } else {

                let selectionMode: SelectionMode;
                if (this.IsInFilterMode && this._nodesWithoutFullChildrenCountLookup[e.CurrentNodeObj.id]) {
                    $anchor.addClass("comarch-disabled");
                    selectionMode = SelectionMode.Undetermined;
                } else {
                    if (this.IsSelectAllMember(e.CurrentNodeObj)) {
                        selectionMode = stateManager.GetAllNodeSelectionStatus();
                    } else {
                        selectionMode = stateManager.GetSelectionStatus(e.CurrentNodeObj.parents, e.CurrentNodeObj.id);
                    }
                }

                const $checkboxElement = $("<i>").addClass("jstree-icon jstree-checkbox");
                if (selectionMode === SelectionMode.Undetermined) {
                    $checkboxElement.addClass("jstree-comarch-undetermined");
                } else if (selectionMode === SelectionMode.Selected) {
                    $checkboxElement.addClass("jstree-comarch-selected");
                } else if (selectionMode === SelectionMode.Deselected) {
                    $checkboxElement.addClass("jstree-comarch-deselected");
                }
                if (this.IsInSearchFilterMode && currentNode.data && currentNode.data.level === this._view.FilterLevelNumber) {
                    var text = $anchor.text();
                    if (text) {
                        var searchPattern = this._view.SearchPattern;
                        var index = text.toLowerCase().indexOf(searchPattern.toLowerCase());
                        var prefix = text.substring(0, index);
                        var searchContent = text.substring(index, index + searchPattern.length);
                        var postfix = text.substring(index + searchPattern.length, text.length);
                        this.RemoveOnlyTextHack($anchor);
                        $anchor.append(prefix);
                        $anchor.append($("<span>").text(searchContent).addClass("comarch-search-highlight"));
                        $anchor.append(postfix);
                    }

                }
                $checkboxElement.prependTo($anchor);
            }
        }

        private RemoveOnlyTextHack($anchor: JQuery) {
            $anchor.contents().filter(function() {
// ReSharper disable once SuspiciousThisUsage
                return this.nodeType === 3;
            }).remove();
        }

        async ApplyServerSelecionForSearchFilter(isSelect: boolean, targetLevelElements: AffectedNodesSet): Promise<AffectedNodesSet> {
            this.ShowAllTreeLoadingIndicator();
            const response = (await this._service.GetMembers(new MembersRequest(this._view.FilterLevel,
                0,
                this._metadata.AllLevelsMembersTotalCount + 1,
                new MemberFilter(this._view.SearchPattern, this._view.MemberFilterType)))).FilterInfo;

            return this.ProcessServerLoadedSelection(response, isSelect);
        }

        async ApplyServerSelecionForStatusFilter(isSelect: boolean, targetLevelElements: AffectedNodesSet): Promise<AffectedNodesSet> {
            this.ShowAllTreeLoadingIndicator();
            const response = (await this._service.GetMembersByStatus(
                new GetMembersByStatusRequest(this._view.FilterLevel,
                    0,
                    this._metadata.AllLevelsMembersTotalCount + 1,
                    this._currentStatusFilter,
                    this._stateManager.Serialize()),
                this._stateManager)).FilterInfo;

            return this.ProcessServerLoadedSelection(response, isSelect);
        }

        private ProcessServerLoadedSelection(response: IFilterInfo, isSelect: boolean) {
            const affectedNodes = new AffectedNodesSet();
            const nodes = MemberNodesHelper.HierarchizeNodes(response.LastLevelNodes, response.ParentsLookup);
            this.AssignLevelIndex(null, nodes, true);
            TreeHelpers.TraverseListPreorder<IMemberNode>(nodes,
                (x) => (x.children as IMemberNode[]),
                (current, parent, level, index, path) => {
                    var parents = path;
                    if (level === this._view.FilterLevelNumber) {
                        affectedNodes.Union(this._stateManager.AddNodes(parents.map(x => this.CreateFilterItemFromNode(x, this._stateManager)),
                            this.CreateFilterItemFromNode(current, this._stateManager),
                            isSelect,
                            false,
                            new ForwardTreeTraversalIteratorFactory<ExtendedFilterItem>()));
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory(),
                true);
            this._stateManager.Refresh();
            this._filterStateManager.Reset(isSelect);
            this.HideAllTreeLoadingIndicator();
            return affectedNodes;
        }

        async ExpandAll() {
            console.log("OnLoadAll");
            if (this.TotalElementsCount <= this._options.MaxTotalElementsCount) {
                if (await this.ShowLoadAllUserConfirmation()) {
                    this.LoadAllCore();
                }
            } else {
                if (await this.ShowFirstNElementsConfirmation()) {
                    this.LoadAllCore();
                }
            }
        }

        async LoadAllCore() {
            if (this.IsInFilterMode) {
                this.ClearFilter(false, true);
            }
            this.SaveTreeState();
            this.LoadedElementsCount=0;
            this._isLoadingAllElements = true;
            this.ShowAllTreeLoadingIndicator();
            this._view.ReloadTreeNode(this.GetTreeNode("#"), () => { this._isLoadingAllElements = false; });
        }

        async ShowLoadAllUserConfirmation(): Promise<boolean> {
           return this._view.ShowLoadAllUserConfirmation(this.TotalElementsCount);
        }

        async ShowFirstNElementsConfirmation(): Promise<boolean> {
           return this._view.ShowFirstNElementsConfirmation(this.TotalElementsCount, this._options.MaxTotalElementsCount);
        }
        
        ShowMaxLimitReached() {
            this._view.ShowMaxLimitReached(this._isLoadingAllElements);
        }

        public ShowNotAllElementsAreVisible() {
            this._view.ShowNotAllElementsAreVisible();
        }

        public HideNotAllElementsAreVisible() {
            this._view.HideNotAllElementsAreVisible();
        }

        public UpdateTotalElementsLoadedCount(text: string) {
            this._view.UpdateTotalElementsLoadedCount(text);
        }
        
        GetLevelNumberFromUniqueName(uniqueName: string) {
            return this._metadata.SortedLevels.map(x => x.UniqueName).indexOf(uniqueName);
        }

        private ShowAllTreeLoadingIndicator() {
            this._view.ShowAllTreeLoadingIndicator();
        }

        private HideAllTreeLoadingIndicator() {
            this._view.HideAllTreeLoadingIndicator();
        }

        HandleNodeLoaded() {
            this.HideAllTreeLoadingIndicator();
        }

        HandleTreeReady() {
            this._view.SignalTreeReady();
        }
        
        private GetJstreeNodesFromById(parentId: string): IMemberNode[] {
            return this.GetTreeNode(parentId).children.map(id => this.GetTreeNode(id)).filter(x => !this.IsSelectAllMember(x) && !this.IsShowMoreMember(x));
        }

        private Reset() {
            this._view.Reset();
            this.ResetInternalState();
            this.DestroyTree();
        }

        private DestroyTree() {
            this._view.DestroyTree();
        }

        async Connect(connectionString: string, fieldUniqueName: string, savedState: IFilterItem) {
            this.Reset();
            return this.RefreshTree(connectionString, fieldUniqueName, savedState);
        }


        GetState() {
            if (this._stateManager.GetAllNodeSelectionStatus() === SelectionMode.Deselected) {
                return null;
            }
            return this._stateManager.Serialize();
        }

        MergeStates() {
            if (!this.IsInFilterMode) return;
            this.MergeStateCore(this.GetJstreeNodesFromById("#"), this._view.FilterLevelNumber, []);

        }

        private MergeStateCore(startNodes: IMemberNode[], targetLevel: number, extenalParents: IMemberNode[]) {
            TreeHelpers.TraverseListPreorder<IMemberNode>(startNodes,
                x => this.GetJstreeNodesFromById(x.id),
                (current, parent, level, index, path) => {
                    if (!this.IsSpecialNode(current) && current.data.level === targetLevel) {
                        const parents = extenalParents.concat(path);
                        const selectionMode = this._filterStateManager.GetSelectionStatus(parents.map(x => x.id), current.id, new BackwardTreeTraversalIteratorFactory<string>());
                        switch (selectionMode) {
                        case SelectionMode.Selected:
                            this.SimulateSelectionChange(parents, current, true);
                            break;
                        case SelectionMode.Deselected:
                            this.SimulateSelectionChange(parents, current, false);
                            break;
                        case SelectionMode.Undetermined:
                            if (!current.state.loaded) {
                                // if leaf is undetermined and not loaded it means that there is selection on lower levels
                                // but this is only user visible state which means that user does not expand ,load 
                                // and modify selection in this branch so we do nothing
                            } else {
                                parents.push(current);
                                this.MergeStateCore(this.GetJstreeNodesFromById(current.id), current.data.level + 1, parents);
                            }
                            break;
                        }
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory<IMemberNode>(),
                true);

            this._stateManager.Refresh();
        }

        private IsTreeLeaf(current: IMemberNode) {
            return current.children.length === 0;
        }

        private SimulateSelectionChange(parents: IMemberNode[], current: IMemberNode, isSelect: boolean) {
            this._stateManager.AddNodes(parents.map(x => this.CreateFilterItemFromNode(x, this._stateManager)),
                this.CreateFilterItemFromNode(current, this._stateManager),
                isSelect,
                false,
                new ForwardTreeTraversalIteratorFactory<ExtendedFilterItem>());
        }

        private IsStateLeaf(current: IFilterItem) {
            return !current.Children.length;
        }

        public RevertSelection() {
            const stateManager = this.GetCurrentModeStateManager();
            stateManager.RevertSelection();
            this._view.RedrawNode("#", true);
        }

        private DisplayOnlySelectedElements() {
            console.log("OnDisplayOnlySelectedElements");
            this._currentStatusFilter = FilterItemState.Checked;
            this.DisplayOnlyElementsCore();

        }

        private DisableSearchBox() {
            this._view.DisableSearchBox();
        }

        private EnableSearchBox() {
            this._view.EnableSearchBox();
        }

        private DisplayOnlyDeselectedElements() {
            console.log("OnDisplayOnlyDeselectedElements");
            this._currentStatusFilter = FilterItemState.Unchecked;
            this.DisplayOnlyElementsCore();

        }

        private DisplayOnlyElementsCore() {
            this.IsInSearchFilterMode = false;
            this.IsInStatusFilterMode = true;
            this.FilterCore();

        }
        
        GetResource(key: string) {
            return this.Options.Resources[key];
        }

        CollapseAll() {
            this._view.CollapseAll();
        }

        GetTreeNode(id:any,asDom?:boolean) { return this._view.GetTreeNode(id,asDom); }
    }

}