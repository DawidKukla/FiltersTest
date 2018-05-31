var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var FilterStateManager = FilterControlModule.FilterStateManagerModule.FilterStateManager;
            var MemberNodesHelper = FilterControlModule.Common.MemberNodesHelper;
            var AffectedNodesSet = FilterControlModule.Common.AffectedNodesSet;
            var TreeHelpers = Comarch.Utils.TreeUtils.TreeHelpers;
            var ForwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
            var MetadataRequest = FilterControlModule.Common.MetadataRequest;
            var MembersRequest = FilterControlModule.Common.MembersRequest;
            var LeafMembersRequest = FilterControlModule.Common.LeafMembersRequest;
            var ChildrenRequest = FilterControlModule.Common.ChildrenRequest;
            var MemberFilter = FilterControlModule.Common.MemberFilter;
            var FiltredElementsChildrenCountRequest = FilterControlModule.Common.FiltredElementsChildrenCountRequest;
            var BackwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.BackwardTreeTraversalIteratorFactory;
            var FilterItemState = FilterControlModule.Common.FilterItemState;
            var GetMembersByStatusRequest = FilterControlModule.Common.GetMembersByStatusRequest;
            var ControlStateInfo = FilterControlModule.Common.ControlStateInfo;
            var FilterType = FilterControlModule.FilterStateManagerModule.Common.FilterType;
            var SelectionMode = FilterControlModule.FilterStateManagerModule.Common.SelectionMode;
            var LimitsHelperFactory = Controls.FilterControlModule.Helpers.LimitsHelperFactory;
            class FilterControl {
                constructor(options, viewFactory, serviceFactory, stateManagerFactory, limitsHelperFactory = new LimitsHelperFactory()) {
                    this._options = new FilterControlModule.Options().Merge(options);
                    this._view = viewFactory.Create(this._options.$TargetContainer, this._options.Template, this);
                    this._serviceFactory = serviceFactory;
                    this._stateManagerFactory = stateManagerFactory;
                    this._limitsHelperFactory = limitsHelperFactory;
                }
                static get Resources() { return window["filterControlResources_95ec3678f2ef437e8df72c771b74e45e"]; }
                ;
                static get Template() { return $("#filterControlTemplate_95ec3678f2ef437e8df72c771b74e45e").html(); }
                ;
                ResetInternalState() {
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
                    this._limitsHelper = null;
                }
                get Options() {
                    return this._options;
                }
                ;
                set Options(value) { this._options = value; }
                get Metadata() {
                    return this._metadata;
                }
                get ServiceFactory() {
                    return this._serviceFactory;
                }
                set ServiceFactory(value) {
                    this._serviceFactory = value;
                }
                get LoadedElementsCount() { return this._limitsHelper.LoadedElementsCount; }
                set LoadedElementsCount(value) { this._limitsHelper.LoadedElementsCount = value; }
                get TotalElementsCount() {
                    return this._metadata.AllLevelsMembersTotalCount;
                }
                get IsInSearchFilterMode() {
                    return this._isInSearchFilterMode;
                }
                ;
                set IsInSearchFilterMode(value) {
                    this._isInSearchFilterMode = value;
                    if (value) {
                        this._isInFilterMode = true;
                        this._isInStatusFilterMode = false;
                    }
                    else {
                        this._isInFilterMode = false;
                    }
                }
                ;
                get IsInStatusFilterMode() {
                    return this._isInStatusFilterMode;
                }
                ;
                set IsInStatusFilterMode(value) {
                    this._isInStatusFilterMode = value;
                    if (value) {
                        this._isInFilterMode = true;
                        this._isInSearchFilterMode = false;
                    }
                    else {
                        this._isInFilterMode = false;
                    }
                }
                ;
                get MaxVisibleElementsLimitReached() {
                    return this._isMaxVisibleElementsLimitReached;
                }
                set MaxVisibleElementsLimitReached(value) { this._isMaxVisibleElementsLimitReached = value; }
                get TreeState() {
                    return this._view.GetTreeState();
                }
                get IsInFilterMode() { return Boolean(this._isInFilterMode); }
                ;
                CreateControlTopBar() {
                    this._view.UpdateLevelsMenu();
                    this._view.UpdateFilterTypeSelect();
                }
                async RefreshTree(connectionString, fieldUniqueName, savedState) {
                    this.ShowAllTreeLoadingIndicator();
                    this._elementsToLoadStartIndex = this._options.CurrentWindow;
                    this._service = this.ServiceFactory.Create(connectionString);
                    const metadataResponse = (await this._service.GetMetadata(new MetadataRequest(fieldUniqueName, FilterStateManager.GetLeafs(savedState))));
                    this._metadata = metadataResponse.Metadata;
                    this._limitsHelper = this._limitsHelperFactory.Create(this, this._options.MaxTotalElementsCount, this._metadata.AllLevelsMembersTotalCount);
                    this._limitsHelper.LoadedElementsCount = 0;
                    this.CreateControlTopBar();
                    this._stateManager = this._stateManagerFactory.Create(FilterType.Excluded, this._metadata.RootMembersTotalCount, false);
                    if (savedState) {
                        this._stateManager.Deserialize(savedState, this._metadata.RootMembersTotalCount, metadataResponse.CleanedStateInfo);
                    }
                    else {
                        if (this._metadata.DefaultMember) {
                            this.HandleDefaultMember();
                        }
                        else {
                            this._stateManager.Reset(true);
                        }
                    }
                    return this.CreateTree();
                }
                CreateTree() {
                    return this._view.CreateTree();
                }
                HandleDefaultMember() {
                    this._stateManager.Reset(false);
                    const defaultMemberRoot = MemberNodesHelper.HierarchizeNodes(this._metadata.DefaultMember.LastLevelNodes, this._metadata.DefaultMember.ParentsLookup);
                    TreeHelpers.TraverseListPreorder(defaultMemberRoot, (x) => x.children, (current, parent, level, index, parents) => {
                        if (this.IsTreeLeaf(current)) {
                            parents = [{ id: "#" }].concat(parents);
                            this.AddStateNodeFromTree(this._stateManager, parents, current, true, true);
                        }
                        return true;
                    }, new ForwardTreeTraversalIteratorFactory(), true);
                }
                async GetNodeData(obj) {
                    const info = await this.LoadNodesCore(obj, this._elementsToLoadStartIndex);
                    if (info.MaxElementLimitReached && !info.HasTrimmedToLimitMembers) {
                        this.ManualResetLoadingAction(obj);
                        return;
                    }
                    this._view.RenderTree(info.Members);
                }
                ManualResetLoadingAction(obj) {
                    const node = this.GetTreeNode(obj.id);
                    const nodeElement = $(this.GetTreeNode(obj.id, true));
                    nodeElement.removeClass("jstree-loading");
                    node.state.loaded = true;
                    node.state.loading = false;
                    node.state.loaded = false;
                }
                async LoadNodesCore(obj, startIndex) {
                    let info;
                    if (this._isLoadingMoreElement || this._isRestoringTreeState) {
                        info = {
                            Members: this._elementsToLoad,
                            MaxElementLimitReached: false,
                            HasTrimmedToLimitMembers: false
                        };
                    }
                    else {
                        info = await this.LoadNodesFromServerCore(obj, startIndex);
                    }
                    return info;
                }
                async LoadNodesFromServerCore(obj, startIndex) {
                    if (this._isMaxVisibleElementsLimitReached) {
                        this.ShowMaxLimitReached();
                        return {
                            Members: [],
                            MaxElementLimitReached: true,
                            HasTrimmedToLimitMembers: false
                        };
                    }
                    var response = null;
                    let createAllNode = false;
                    let createFiltredStateSelectionNodes = false;
                    let hasTrimmedToLimitMembers = false;
                    if (obj.id === "#") {
                        createAllNode = true;
                        if (this.IsInFilterMode) {
                            createAllNode = false;
                            createFiltredStateSelectionNodes = true;
                            if (this.IsInSearchFilterMode) {
                                response = (await this._service.GetMembers(new MembersRequest(this._view.FilterLevel, this._filterElementsLoadMoreStartIndex, this._options.DataPackageSize, new MemberFilter(this._view.SearchPattern, this._view.MemberFilterType)))).FilterInfo;
                            }
                            else if (this.IsInStatusFilterMode) {
                                response = (await this._service.GetMembersByStatus(new GetMembersByStatusRequest(this._view.FilterLevel, this._filterElementsLoadMoreStartIndex, this._options.DataPackageSize, this._currentStatusFilter, this._stateManager.Serialize()), this._stateManager)).FilterInfo;
                            }
                            else {
                                throw new Error("Invalid state");
                            }
                        }
                        else if (this._isLoadingAllElements) {
                            response = (await this._service.GetLeafMembers(new LeafMembersRequest(this._view.FilterLevel, this._elementsToLoadStartIndex, this._options.MaxTotalElementsCount)))
                                .FilterInfo;
                        }
                        else {
                            response =
                                (await this._service.GetMembers(new MembersRequest(this._metadata.SortedLevels[0].UniqueName, this._elementsToLoadStartIndex, this._options.DataPackageSize)))
                                    .FilterInfo;
                        }
                    }
                    else {
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
                    };
                }
                async PrepareDataToLoad(invokingNode, response) {
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
                    }
                    else {
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
                async InitFiltredElementState(hierarchizedNodes, hasMoreMembers, response) {
                    const nodesWithUpdatedCount = JSON.parse(JSON.stringify(this._nodesWithoutFullChildrenCountLookup));
                    this._nodesWithoutFullChildrenCountLookup = {};
                    const existingElementsChildrenCountLookup = {};
                    this.FillAvailableFilterResultTotalCounts(hierarchizedNodes, this._nodesWithoutFullChildrenCountLookup, existingElementsChildrenCountLookup, hasMoreMembers);
                    this.CalculateUpdatedCountMemebers(nodesWithUpdatedCount, existingElementsChildrenCountLookup);
                    this.CreateFilterVisibleState(hierarchizedNodes, existingElementsChildrenCountLookup, nodesWithUpdatedCount, response);
                    console.log(`%cFILTER STATE:`, "background: #222; color: yellow");
                    this._filterStateManager.Print();
                }
                CalculateUpdatedCountMemebers(nodesWithUpdatedCount, existingElementsChildrenCountLookup) {
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
                CreateFilterVisibleState(hierarchizedNodes, existingElementsChildrenCountLookup, nodesWithUpdatedCount, response) {
                    var currentActionLastProcessedNodeUniqueName = null;
                    TreeHelpers.TraverseListPreorder(hierarchizedNodes, (x) => x.children, (current) => {
                        const childrenCount = existingElementsChildrenCountLookup[current.id].ChildrenCount;
                        current.data.filtredChildrenTotalCount = childrenCount;
                        currentActionLastProcessedNodeUniqueName = current.id;
                        return true;
                    }, new ForwardTreeTraversalIteratorFactory());
                    this.TransformOrginalStateIntoVisibleFilterState(hierarchizedNodes, existingElementsChildrenCountLookup);
                    this._filterStateManager.UpdateFilteredChildrensTotalCount(existingElementsChildrenCountLookup, nodesWithUpdatedCount);
                    this._lastProcessedNodeUniqeName = currentActionLastProcessedNodeUniqueName;
                    this._filterStateManager.Refresh();
                }
                TransformOrginalStateIntoVisibleFilterState(hierarchizedNodes, existingElementsChildrenCountLookup) {
                    var startProcessing = this._lastProcessedNodeUniqeName ? false : true;
                    TreeHelpers.TraverseListPreorder(hierarchizedNodes, (x) => x.children, (current, parent, level, index, parents) => {
                        if (startProcessing) {
                            if (current.data.level === this._view.FilterLevelNumber) {
                                parents.unshift(this.GetTreeNode("#"));
                                const selectionStatus = this._stateManager.GetSelectionStatus(parents.map(x => x.id), current.id, new BackwardTreeTraversalIteratorFactory());
                                switch (selectionStatus) {
                                    case SelectionMode.Selected:
                                        this.AddStateNodeFromTree(this._filterStateManager, parents, current, true, false);
                                        break;
                                    case SelectionMode.Deselected:
                                        this.AddStateNodeFromTree(this._filterStateManager, parents, current, false, false);
                                        break;
                                    case SelectionMode.Undetermined:
                                        const stateItem = this._stateManager.CloneBranch(current.id, true);
                                        TreeHelpers.TraversePreorder(stateItem, (x) => x.ChildrenArray, (current, parent, level, index, stateParents) => {
                                            current.Owner = this._filterStateManager;
                                            if (current.IsLeaf) {
                                                stateParents = parents.map(x => this.CreateFilterItemFromNode(x, this._filterStateManager)).concat(stateParents);
                                                const selectionMode = this._stateManager.GetSelectionStatus(stateParents.map(x => x.UniqueName), current.UniqueName, new BackwardTreeTraversalIteratorFactory());
                                                this.AddStateTransformationNodeCore(this._filterStateManager, stateParents, current, selectionMode === SelectionMode.Selected, false);
                                            }
                                            return true;
                                        }, new ForwardTreeTraversalIteratorFactory(), null, 0, 0, true);
                                        break;
                                }
                            }
                        }
                        else {
                            if (current.id === this._lastProcessedNodeUniqeName) {
                                startProcessing = true;
                            }
                        }
                        return true;
                    }, new ForwardTreeTraversalIteratorFactory(), true);
                }
                AddStateNodeFromTree(stateManager, parents, current, isSelect, autoRefresh) {
                    const sortedParents = parents.map(x => this.CreateFilterItemFromNode(x, stateManager));
                    const targetNode = this.CreateFilterItemFromNode(current, stateManager);
                    this.AddStateTransformationNodeCore(stateManager, sortedParents, targetNode, isSelect, autoRefresh);
                }
                AddStateTransformationNodeCore(stateManager, sortedParents, targetNode, isSelect, autoRefresh) {
                    stateManager.AddNodes(sortedParents, targetNode, isSelect, autoRefresh, new ForwardTreeTraversalIteratorFactory());
                }
                async LoadMissingNodesCount(nodesLackingFullChildrenCount, existingElementsChildrenCountLookup) {
                    const childrenCountLookup = await this._service.GetFiltredElementsChildrenCount(new FiltredElementsChildrenCountRequest(this._view.FilterLevel, nodesLackingFullChildrenCount, new MemberFilter(this._view.SearchPattern, this._view.MemberFilterType)));
                    for (let key in childrenCountLookup.ChildrenCountInfoLookup) {
                        if (childrenCountLookup.ChildrenCountInfoLookup.hasOwnProperty(key)) {
                            const info = childrenCountLookup.ChildrenCountInfoLookup[key];
                            existingElementsChildrenCountLookup[key] = info;
                        }
                    }
                }
                FillAvailableFilterResultTotalCounts(nodes, nodesLackingFullChildrenCount, existingElementsChildrenCountLookup, hasMoreMembers) {
                    var previousMember = null;
                    var lastLevelNumber = 0;
                    TreeHelpers.TraverseListBFS(nodes, x => $.isArray(x.children) ? x.children : [], (current) => {
                        var childrenTotalCount;
                        var targetNode = current;
                        if (current.data.level < this._view.FilterLevelNumber) {
                            childrenTotalCount = current.children.length;
                        }
                        else {
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
                UpdateCount(targetNode, childrenTotalCount, existingElementsChildrenCountLookup) {
                    targetNode.data.filtredChildrenTotalCount = childrenTotalCount;
                    existingElementsChildrenCountLookup[targetNode.id] = { ChildrenCount: childrenTotalCount };
                }
                IsLoadingWholeTree(invokingNode) {
                    return (this.IsInFilterMode && this.IsLoadingFilterLevelElements(invokingNode)) || this._isLoadingAllElements;
                }
                AssignLevelIndex(invokingNode, loadedNodes, isHierarchical) {
                    if (isHierarchical) {
                        TreeHelpers.TraverseListPreorder(loadedNodes, (x) => x.children, (current, parent, level) => {
                            current.data.level = level;
                            return true;
                        });
                    }
                    else {
                        let level = null;
                        if (invokingNode.id === "#") {
                            level = 0;
                        }
                        else {
                            level = invokingNode.data.level + 1;
                        }
                        loadedNodes.forEach(n => n.data.level = level);
                    }
                }
                HandleConditionalSelect(node) {
                    let result = true;
                    if (this.IsShowMoreMember(node)) {
                        console.log("Loading More Nodes");
                        this.LoadMoreNodes(node);
                        result = false;
                    }
                    return result;
                }
                MergeNewNodesIntoExistingTree(parentNode, newNodes) {
                    var existingNodes = [];
                    parentNode.children.forEach(childId => {
                        const node = this.GetTreeNode(childId);
                        if (!this.IsSpecialNode(node)) {
                            existingNodes.push(this._view.GetTreeNodeClone(node));
                        }
                    });
                    var existingNodesLookup = TreeHelpers.ConvertListToLookup(existingNodes, x => {
                        return Array.isArray(x.children) ? x.children : [];
                    }, x => x.id);
                    TreeHelpers.TraverseListPreorder(newNodes, x => x.children, (currentNode) => {
                        var existingNode = existingNodesLookup.getValue(currentNode.id);
                        if (!existingNode) {
                            const existingParentNode = existingNodesLookup.getValue(currentNode.data.parentUniqueName);
                            if (existingParentNode) {
                                existingParentNode.children.push(currentNode);
                            }
                            else {
                                existingNodes.push(currentNode);
                            }
                            return false;
                        }
                        return true;
                    }, new ForwardTreeTraversalIteratorFactory());
                    return existingNodes;
                }
                IsSpecialNode(node) {
                    return this.IsSelectAllMember(node) || this.IsShowMoreMember(node) || this.IsSelectFiltredMember(node) || this.IsDeSelectFiltredMember(node);
                }
                async LoadMoreNodes(targetNode) {
                    if (this._isMaxVisibleElementsLimitReached) {
                        this.ShowMaxLimitReached();
                        return;
                    }
                    this._isLoadingMoreElement = true;
                    this.ShowNodeLoadingIndicator(targetNode.id);
                    const parentNode = this.GetTreeNode(targetNode.parent);
                    this._elementsToLoadStartIndex = targetNode.data.nextLoadStartIndex;
                    this._elementsToLoad = (await this.LoadNodesFromServerCore(parentNode, this._elementsToLoadStartIndex)).Members;
                    this._view.ReloadTreeNode(parentNode, () => {
                        this._isLoadingMoreElement = false;
                        this._elementsToLoadStartIndex = 0;
                        this._elementsToLoad.length = 0;
                    });
                }
                ShowNodeLoadingIndicator(id) {
                    const $liElement = $(this.GetTreeNode(id, true));
                    $liElement.addClass("jstree-loading");
                }
                IsLoadingFilterLevelElements(parentNode) {
                    let loadedNodesLevelId = -1;
                    if (parentNode.data) {
                        loadedNodesLevelId = parentNode.data.level;
                    }
                    loadedNodesLevelId++;
                    if (loadedNodesLevelId <= this.GetLevelNumberFromUniqueName(this._view.FilterLevel)) {
                        return true;
                    }
                    return false;
                }
                CreateLoadMoreNode(parentNode, loadedLastLevelNodesNodes) {
                    let startIndex = loadedLastLevelNodesNodes.length;
                    if (parentNode.children.length) {
                        startIndex += parentNode.children.length;
                        startIndex--;
                        startIndex--;
                    }
                    if (this.IsInFilterMode && this.IsLoadingFilterLevelElements(parentNode)) {
                        this._filterElementsLoadMoreStartIndex += loadedLastLevelNodesNodes.length;
                        startIndex = this._filterElementsLoadMoreStartIndex;
                    }
                    const node = {
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
                CreateAllNode() {
                    const node = {
                        id: this._selectAllNodeId,
                        text: "All",
                    };
                    return node;
                }
                CreateSelectAllFiltredNode() {
                    const node = {
                        id: this._selectAllFiltredId,
                        text: "Select All",
                    };
                    return node;
                }
                CreateDeSelectAllFiltredNode() {
                    const node = {
                        id: this._deselectAllFiltredNodeId,
                        text: "Deselect All",
                    };
                    return node;
                }
                GetRandomId() {
                    return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(2, 10);
                }
                IsShowMoreMember(nodeObj) {
                    return nodeObj.data && nodeObj.data.isShowMoreMember;
                }
                IsSelectAllMember(nodeObj) {
                    return nodeObj.id === this._selectAllNodeId;
                }
                IsSelectFiltredMember(nodeObj) {
                    return nodeObj.id === this._selectAllFiltredId;
                }
                IsVirtualRootMember(nodeObj) {
                    return nodeObj.id === "#";
                }
                IsDeSelectFiltredMember(nodeObj) {
                    return nodeObj.id === this._deselectAllFiltredNodeId;
                }
                CreateReferenceTree($container, data) {
                    $container.jstree({
                        'plugins': ["core", "checkbox"],
                        'core': {
                            'data': data,
                            'check_callback': (operation) => {
                                return operation === "create_node" || operation === "delete_node";
                            },
                        },
                    }).on("loaded.jstree", () => {
                        $container.jstree("open_all");
                    }).on("ready.jstree", () => {
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
                SaveTreeState() {
                    this._controlStateInfo = new ControlStateInfo(this);
                    this._controlStateInfo.Save();
                }
                EnsureSaveTreeState() {
                    if (!this._controlStateInfo) {
                        this.SaveTreeState();
                    }
                }
                RestoreState() {
                    if (!this._controlStateInfo)
                        return;
                    this._controlStateInfo.Restore();
                }
                RestoreTreeState(savedState, onReadyCallback = () => { }) {
                    this._isRestoringTreeState = true;
                    this._elementsToLoad = savedState;
                    this._view.ReloadTreeNode(this.GetTreeNode("#"), () => {
                        this._elementsToLoad = null;
                        this._controlStateInfo = null;
                        this._isRestoringTreeState = false;
                        onReadyCallback();
                    });
                }
                SearchCore(searchPattern) {
                    $("#revertSelection").attr("disabled", "true");
                    this.IsInStatusFilterMode = false;
                    this.IsInSearchFilterMode = true;
                    this.FilterCore();
                }
                FilterCore() {
                    this._filterStateManager = this._stateManagerFactory.Create(this._stateManager.GetRootType(), -1, true);
                    this.EnsureSaveTreeState();
                    this.MaxVisibleElementsLimitReached = false;
                    this.LoadedElementsCount = 0;
                    this.ShowAllTreeLoadingIndicator();
                    this._view.ReloadTreeNode(this.GetTreeNode("#"));
                }
                ClearFilter(reloadTree = true, clearSearchPattern = false) {
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
                ClearSearchHighlight() {
                    if (!this.IsInSearchFilterMode)
                        return;
                    this._view.ClearSearchHighlight();
                }
                ExpandNodesToTargetLevel(loadedNodes, targetLevel, expandAll) {
                    TreeHelpers.TraverseListPreorder(loadedNodes, (x) => x.children, (current, parent, level) => {
                        var state = current.state || (current.state = {});
                        if (level < targetLevel || expandAll) {
                            state.opened = true;
                        }
                        return true;
                    });
                }
                async HandleSelectionChanged(data) {
                    const stateManager = this.GetCurrentModeStateManager();
                    if (data.action === "select_node") {
                        const clickedNode = data.node;
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
                        }
                        else if (targetNodeId === this._selectAllFiltredId) {
                            if (this.IsInSearchFilterMode) {
                                affectedNodes.Union(await this.ApplyServerSelecionForSearchFilter(true, targetLevelElements));
                            }
                            else if (this.IsInStatusFilterMode) {
                                affectedNodes.Union(await this.ApplyServerSelecionForStatusFilter(true, targetLevelElements));
                            }
                            else {
                                throw new Error("Invalid state");
                            }
                            fullRedraw = true;
                        }
                        else if (targetNodeId === this._deselectAllFiltredNodeId) {
                            if (this.IsInSearchFilterMode) {
                                affectedNodes.Union(await this.ApplyServerSelecionForSearchFilter(false, targetLevelElements));
                            }
                            else if (this.IsInStatusFilterMode) {
                                affectedNodes.Union(await this.ApplyServerSelecionForStatusFilter(false, targetLevelElements));
                            }
                            else {
                                throw new Error("Invalid state");
                            }
                            fullRedraw = true;
                        }
                        else {
                            const selectionMode = stateManager.GetSelectionStatus(clickedNode.parents, targetNodeId);
                            const isSelect = this.GetSelectionModeFromClick(selectionMode);
                            affectedNodes.Union(this.AddUserChangedNodeToState(clickedNode, isSelect));
                        }
                        this.RedrawAffectedNodes(affectedNodes, targetLevelElements, fullRedraw);
                        this.Log(stateManager, affectedNodes.ToArray());
                    }
                }
                GetCurrentModeStateManager() {
                    return this.IsInFilterMode ? this._filterStateManager : this._stateManager;
                }
                GetSelectionModeFromClick(selectionMode) {
                    if (selectionMode === SelectionMode.Deselected || selectionMode === SelectionMode.Undetermined) {
                        return true;
                    }
                    return false;
                }
                RedrawAffectedNodes(affectedNodes, targetLevelElements, fullRedraw) {
                    if (fullRedraw) {
                        this._view.RedrawNode(this.GetTreeNode("#"), true);
                        return;
                    }
                    affectedNodes.ForEach((id) => {
                        if (id !== "#") {
                            let deepDown = false;
                            if (targetLevelElements.Contains(id)) {
                                deepDown = true;
                            }
                            const node = this.GetTreeNode(id);
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
                Log(stateManager, affectedNodes) {
                    console.log("AFFECTED NODES", affectedNodes);
                    console.log("REDRAWED NODES", this._redrwedNodes);
                    console.log("STATE", stateManager.GetState());
                    console.log(stateManager.Print());
                }
                AddUserChangedNodeToState(node, isSelect) {
                    const stateManager = this.GetCurrentModeStateManager();
                    if (this.IsSpecialNode(node))
                        return AffectedNodesSet.Empty;
                    const sortedParents = [];
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
                CreateFilterItemFromNode(node, stateManager) {
                    let childrenCount = -1;
                    let filtredChildrenTotalCount = -1;
                    let parentUniqueName = null;
                    let level = -1;
                    if (node.id === "#") {
                        childrenCount = this._metadata.RootMembersTotalCount;
                        filtredChildrenTotalCount = -1;
                    }
                    else if (node.data) {
                        parentUniqueName = node.data.parentUniqueName || "#";
                        childrenCount = node.data.childrenTotalCount;
                        filtredChildrenTotalCount = node.data.filtredChildrenTotalCount;
                        level = node.data.level;
                    }
                    return stateManager.CreateItem(node.id, parentUniqueName, childrenCount, filtredChildrenTotalCount, level);
                }
                HandleTreeRedrawNode(e) {
                    let currentNode = e.CurrentNodeObj;
                    if (this.IsVirtualRootMember(currentNode))
                        return;
                    var stateManager = this.GetCurrentModeStateManager();
                    this._redrwedNodes.push(currentNode.id);
                    const $liElement = $(e.CurrentNodeElement);
                    const $anchor = $liElement.children(".jstree-anchor");
                    if (this.IsShowMoreMember(currentNode) ||
                        this.IsSelectFiltredMember(e.CurrentNodeObj) ||
                        this.IsDeSelectFiltredMember(e.CurrentNodeObj)) {
                        $anchor.children(".jstree-checkbox").remove();
                        $anchor.children(".jstree-themeicon").remove();
                    }
                    else {
                        let selectionMode;
                        if (this.IsInFilterMode && this._nodesWithoutFullChildrenCountLookup[e.CurrentNodeObj.id]) {
                            $anchor.addClass("comarch-disabled");
                            selectionMode = SelectionMode.Undetermined;
                        }
                        else {
                            if (this.IsSelectAllMember(e.CurrentNodeObj)) {
                                selectionMode = stateManager.GetAllNodeSelectionStatus();
                            }
                            else {
                                selectionMode = stateManager.GetSelectionStatus(e.CurrentNodeObj.parents, e.CurrentNodeObj.id);
                            }
                        }
                        const $checkboxElement = $("<i>").addClass("jstree-icon jstree-checkbox");
                        if (selectionMode === SelectionMode.Undetermined) {
                            $checkboxElement.addClass("jstree-comarch-undetermined");
                        }
                        else if (selectionMode === SelectionMode.Selected) {
                            $checkboxElement.addClass("jstree-comarch-selected");
                        }
                        else if (selectionMode === SelectionMode.Deselected) {
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
                RemoveOnlyTextHack($anchor) {
                    $anchor.contents().filter(function () {
                        return this.nodeType === 3;
                    }).remove();
                }
                async ApplyServerSelecionForSearchFilter(isSelect, targetLevelElements) {
                    this.ShowAllTreeLoadingIndicator();
                    const response = (await this._service.GetMembers(new MembersRequest(this._view.FilterLevel, 0, this._metadata.AllLevelsMembersTotalCount + 1, new MemberFilter(this._view.SearchPattern, this._view.MemberFilterType)))).FilterInfo;
                    return this.ProcessServerLoadedSelection(response, isSelect);
                }
                async ApplyServerSelecionForStatusFilter(isSelect, targetLevelElements) {
                    this.ShowAllTreeLoadingIndicator();
                    const response = (await this._service.GetMembersByStatus(new GetMembersByStatusRequest(this._view.FilterLevel, 0, this._metadata.AllLevelsMembersTotalCount + 1, this._currentStatusFilter, this._stateManager.Serialize()), this._stateManager)).FilterInfo;
                    return this.ProcessServerLoadedSelection(response, isSelect);
                }
                ProcessServerLoadedSelection(response, isSelect) {
                    const affectedNodes = new AffectedNodesSet();
                    const nodes = MemberNodesHelper.HierarchizeNodes(response.LastLevelNodes, response.ParentsLookup);
                    this.AssignLevelIndex(null, nodes, true);
                    TreeHelpers.TraverseListPreorder(nodes, (x) => x.children, (current, parent, level, index, path) => {
                        var parents = path;
                        if (level === this._view.FilterLevelNumber) {
                            affectedNodes.Union(this._stateManager.AddNodes(parents.map(x => this.CreateFilterItemFromNode(x, this._stateManager)), this.CreateFilterItemFromNode(current, this._stateManager), isSelect, false, new ForwardTreeTraversalIteratorFactory()));
                        }
                        return true;
                    }, new ForwardTreeTraversalIteratorFactory(), true);
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
                    }
                    else {
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
                    this.LoadedElementsCount = 0;
                    this._isLoadingAllElements = true;
                    this.ShowAllTreeLoadingIndicator();
                    this._view.ReloadTreeNode(this.GetTreeNode("#"), () => { this._isLoadingAllElements = false; });
                }
                async ShowLoadAllUserConfirmation() {
                    return this._view.ShowLoadAllUserConfirmation(this.TotalElementsCount);
                }
                async ShowFirstNElementsConfirmation() {
                    return this._view.ShowFirstNElementsConfirmation(this.TotalElementsCount, this._options.MaxTotalElementsCount);
                }
                ShowMaxLimitReached() {
                    this._view.ShowMaxLimitReached(this._isLoadingAllElements);
                }
                ShowNotAllElementsAreVisible() {
                    this._view.ShowNotAllElementsAreVisible();
                }
                HideNotAllElementsAreVisible() {
                    this._view.HideNotAllElementsAreVisible();
                }
                UpdateTotalElementsLoadedCount(text) {
                    this._view.UpdateTotalElementsLoadedCount(text);
                }
                GetLevelNumberFromUniqueName(uniqueName) {
                    return this._metadata.SortedLevels.map(x => x.UniqueName).indexOf(uniqueName);
                }
                ShowAllTreeLoadingIndicator() {
                    this._view.ShowAllTreeLoadingIndicator();
                }
                HideAllTreeLoadingIndicator() {
                    this._view.HideAllTreeLoadingIndicator();
                }
                HandleNodeLoaded() {
                    this.HideAllTreeLoadingIndicator();
                }
                HandleTreeReady() {
                    this._view.SignalTreeReady();
                }
                GetJstreeNodesFromById(parentId) {
                    return this.GetTreeNode(parentId).children.map(id => this.GetTreeNode(id)).filter(x => !this.IsSelectAllMember(x) && !this.IsShowMoreMember(x));
                }
                Reset() {
                    this._view.Reset();
                    this.ResetInternalState();
                    this.DestroyTree();
                }
                DestroyTree() {
                    this._view.DestroyTree();
                }
                async Connect(connectionString, fieldUniqueName, savedState) {
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
                    if (!this.IsInFilterMode)
                        return;
                    this.MergeStateCore(this.GetJstreeNodesFromById("#"), this._view.FilterLevelNumber, []);
                }
                MergeStateCore(startNodes, targetLevel, extenalParents) {
                    TreeHelpers.TraverseListPreorder(startNodes, x => this.GetJstreeNodesFromById(x.id), (current, parent, level, index, path) => {
                        if (!this.IsSpecialNode(current) && current.data.level === targetLevel) {
                            const parents = extenalParents.concat(path);
                            const selectionMode = this._filterStateManager.GetSelectionStatus(parents.map(x => x.id), current.id, new BackwardTreeTraversalIteratorFactory());
                            switch (selectionMode) {
                                case SelectionMode.Selected:
                                    this.SimulateSelectionChange(parents, current, true);
                                    break;
                                case SelectionMode.Deselected:
                                    this.SimulateSelectionChange(parents, current, false);
                                    break;
                                case SelectionMode.Undetermined:
                                    if (!current.state.loaded) {
                                    }
                                    else {
                                        parents.push(current);
                                        this.MergeStateCore(this.GetJstreeNodesFromById(current.id), current.data.level + 1, parents);
                                    }
                                    break;
                            }
                        }
                        return true;
                    }, new ForwardTreeTraversalIteratorFactory(), true);
                    this._stateManager.Refresh();
                }
                IsTreeLeaf(current) {
                    return current.children.length === 0;
                }
                SimulateSelectionChange(parents, current, isSelect) {
                    this._stateManager.AddNodes(parents.map(x => this.CreateFilterItemFromNode(x, this._stateManager)), this.CreateFilterItemFromNode(current, this._stateManager), isSelect, false, new ForwardTreeTraversalIteratorFactory());
                }
                IsStateLeaf(current) {
                    return !current.Children.length;
                }
                RevertSelection() {
                    const stateManager = this.GetCurrentModeStateManager();
                    stateManager.RevertSelection();
                    this._view.RedrawNode("#", true);
                }
                DisplayOnlySelectedElements() {
                    console.log("OnDisplayOnlySelectedElements");
                    this._currentStatusFilter = FilterItemState.Checked;
                    this.DisplayOnlyElementsCore();
                }
                DisableSearchBox() {
                    this._view.DisableSearchBox();
                }
                EnableSearchBox() {
                    this._view.EnableSearchBox();
                }
                DisplayOnlyDeselectedElements() {
                    console.log("OnDisplayOnlyDeselectedElements");
                    this._currentStatusFilter = FilterItemState.Unchecked;
                    this.DisplayOnlyElementsCore();
                }
                DisplayOnlyElementsCore() {
                    this.IsInSearchFilterMode = false;
                    this.IsInStatusFilterMode = true;
                    this.FilterCore();
                }
                GetResource(key) {
                    return this.Options.Resources[key];
                }
                CollapseAll() {
                    this._view.CollapseAll();
                }
                GetTreeNode(id, asDom) { return this._view.GetTreeNode(id, asDom); }
            }
            FilterControlModule.FilterControl = FilterControl;
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyQ29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZpbHRlckNvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxPQUFPLENBcXZDaEI7QUFydkNELFdBQVUsT0FBTztJQUFDLElBQUEsUUFBUSxDQXF2Q3pCO0lBcnZDaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0FxdkM3QztRQXJ2QzBCLFdBQUEsbUJBQW1CO1lBRzFDLElBQU8sa0JBQWtCLEdBQUcsb0JBQUEsd0JBQXdCLENBQUMsa0JBQWtCLENBQUM7WUFFeEUsSUFBTyxpQkFBaUIsR0FBRyxvQkFBQSxNQUFNLENBQUMsaUJBQWlCLENBQUM7WUFDcEQsSUFBTyxnQkFBZ0IsR0FBRyxvQkFBQSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFFbEQsSUFBTyxXQUFXLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUNqRCxJQUFPLG1DQUFtQyxHQUFHLFFBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQztZQUVqRyxJQUFPLGVBQWUsR0FBRyxvQkFBQSxNQUFNLENBQUMsZUFBZSxDQUFDO1lBRWhELElBQU8sY0FBYyxHQUFHLG9CQUFBLE1BQU0sQ0FBQyxjQUFjLENBQUM7WUFDOUMsSUFBTyxrQkFBa0IsR0FBRyxvQkFBQSxNQUFNLENBQUMsa0JBQWtCLENBQUM7WUFDdEQsSUFBTyxlQUFlLEdBQUcsb0JBQUEsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUNoRCxJQUFPLFlBQVksR0FBRyxvQkFBQSxNQUFNLENBQUMsWUFBWSxDQUFDO1lBRTFDLElBQU8sbUNBQW1DLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDO1lBRTVHLElBQU8sb0NBQW9DLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLG9DQUFvQyxDQUFDO1lBQ25HLElBQU8sZUFBZSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7WUFDcEUsSUFBTyx5QkFBeUIsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUM7WUFJeEYsSUFBTyxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFLdEUsSUFBTyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNuRixJQUFPLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO1lBS3pGLElBQU8sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztZQUd0RjtnQkFvQ0ksWUFDSSxPQUFnQixFQUNoQixXQUFzQyxFQUN0QyxjQUE0QyxFQUM1QyxtQkFBK0MsRUFDL0Msc0JBQXlDLElBQUksbUJBQW1CLEVBQUU7b0JBRWxFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxvQkFBQSxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1RixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDO29CQUNoRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7Z0JBQ3BELENBQUM7Z0JBOUNELE1BQU0sS0FBSyxTQUFTLEtBQWtCLE9BQU8sTUFBTSxDQUFDLHlEQUF5RCxDQUFDLENBQUEsQ0FBQSxDQUFDO2dCQUFBLENBQUM7Z0JBQ2hILE1BQU0sS0FBSyxRQUFRLEtBQVcsT0FBTyxDQUFDLENBQUMseURBQXlELENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFBLENBQUM7Z0JBQUEsQ0FBQztnQkErQ2xHLGtCQUFrQjtvQkFDdEIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztvQkFDbkMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztvQkFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxDQUFDLENBQUM7b0JBQ25DLElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxDQUFDLENBQUM7b0JBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUNyQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDO29CQUN0QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO29CQUNwQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7b0JBQzlDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxvQkFBb0IsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7b0JBQzFCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO29CQUN4QixJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO29CQUNuQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxDQUFDO29CQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztvQkFDdEIsSUFBSSxDQUFDLG9DQUFvQyxHQUFHLEVBQUUsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQztvQkFDeEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUM7b0JBQ3BELElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO29CQUM3QixJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO29CQUNuQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO29CQUNuQyxJQUFJLENBQUMsaUNBQWlDLEdBQUcsS0FBSyxDQUFDO29CQUMvQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO29CQUM5QixJQUFJLENBQUMsYUFBYSxHQUFDLElBQUksQ0FBQztnQkFDNUIsQ0FBQztnQkFFRCxJQUFJLE9BQU87b0JBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN6QixDQUFDO2dCQUFBLENBQUM7Z0JBRUYsSUFBSSxPQUFPLENBQUMsS0FBYyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFdEQsSUFBSSxRQUFRO29CQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDMUIsQ0FBQztnQkFFRCxJQUFJLGNBQWM7b0JBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO2dCQUNoQyxDQUFDO2dCQUVELElBQUksY0FBYyxDQUFDLEtBQW1DO29CQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztnQkFDakMsQ0FBQztnQkFFRCxJQUFJLG1CQUFtQixLQUFhLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBRXBGLElBQUksbUJBQW1CLENBQUMsS0FBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFHMUYsSUFBWSxrQkFBa0I7b0JBQzFCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQztnQkFDckQsQ0FBQztnQkFFRCxJQUFXLG9CQUFvQjtvQkFDM0IsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUM7Z0JBQ3RDLENBQUM7Z0JBQUEsQ0FBQztnQkFFRixJQUFXLG9CQUFvQixDQUFDLEtBQWM7b0JBQzFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7b0JBQ25DLElBQUksS0FBSyxFQUFFO3dCQUNQLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO3dCQUM1QixJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO3FCQUN0Qzt5QkFBTTt3QkFDSCxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztxQkFDaEM7Z0JBRUwsQ0FBQztnQkFBQSxDQUFDO2dCQUVGLElBQVksb0JBQW9CO29CQUM1QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztnQkFDdEMsQ0FBQztnQkFBQSxDQUFDO2dCQUVGLElBQVksb0JBQW9CLENBQUMsS0FBYztvQkFDM0MsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztvQkFDbkMsSUFBSSxLQUFLLEVBQUU7d0JBQ1AsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7d0JBQzVCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7cUJBQ3RDO3lCQUFNO3dCQUNILElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO3FCQUNoQztnQkFFTCxDQUFDO2dCQUFBLENBQUM7Z0JBRUYsSUFBSSw4QkFBOEI7b0JBQzlCLE9BQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUVELElBQUksOEJBQThCLENBQUMsS0FBYyxJQUFJLElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUV0RyxJQUFJLFNBQVM7b0JBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNyQyxDQUFDO2dCQUVELElBQUksY0FBYyxLQUFjLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQSxDQUFDLENBQUM7Z0JBQUEsQ0FBQztnQkFFL0QsbUJBQW1CO29CQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDeEMsQ0FBQztnQkFFTyxLQUFLLENBQUMsV0FBVyxDQUFDLGdCQUF3QixFQUFFLGVBQXVCLEVBQUUsVUFBdUI7b0JBQ2hHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO29CQUNuQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7b0JBQzdELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxlQUFlLENBQUMsZUFBZSxFQUFFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUksSUFBSSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7b0JBQzNDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzVJLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEdBQUMsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDeEgsSUFBSSxVQUFVLEVBQUU7d0JBQ1osSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztxQkFDdkg7eUJBQU07d0JBQ0gsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRTs0QkFDOUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7eUJBQzlCOzZCQUFNOzRCQUNILElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUNsQztxQkFDSjtvQkFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztnQkFHTyxVQUFVO29CQUNmLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFFTyxtQkFBbUI7b0JBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoQyxNQUFNLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDdEosV0FBVyxDQUFDLG9CQUFvQixDQUFjLGlCQUFpQixFQUMzRCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQXlCLEVBQ2xDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO3dCQUN2QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQzFCLE9BQU8sR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDdkQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7eUJBQy9FO3dCQUNELE9BQU8sSUFBSSxDQUFDO29CQUNoQixDQUFDLEVBQ0QsSUFBSSxtQ0FBbUMsRUFBZSxFQUN0RCxJQUFJLENBQUMsQ0FBQztnQkFDZCxDQUFDO2dCQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBZ0I7b0JBQzlCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7b0JBQzNFLElBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFO3dCQUMvRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ25DLE9BQU87cUJBQ1Y7b0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV4QyxDQUFDO2dCQUVPLHdCQUF3QixDQUFDLEdBQWdCO29CQUM3QyxNQUFNLElBQUksR0FBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDdkQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7b0JBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztvQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUM5QixDQUFDO2dCQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxVQUFrQjtvQkFDNUQsSUFBSSxJQUFtQixDQUFDO29CQUN4QixJQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7d0JBQzFELElBQUksR0FBRzs0QkFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWU7NEJBQzdCLHNCQUFzQixFQUFFLEtBQUs7NEJBQzdCLHdCQUF3QixFQUFFLEtBQUs7eUJBQ2xDLENBQUM7cUJBQ0w7eUJBQU07d0JBQ0gsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztxQkFDOUQ7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBRU8sS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQWdCLEVBQUUsVUFBa0I7b0JBQ3RFLElBQUksSUFBSSxDQUFDLGlDQUFpQyxFQUFFO3dCQUN4QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDM0IsT0FBTzs0QkFDSCxPQUFPLEVBQUUsRUFBRTs0QkFDWCxzQkFBc0IsRUFBRSxJQUFJOzRCQUM1Qix3QkFBd0IsRUFBRSxLQUFLO3lCQUVqQixDQUFDO3FCQUN0QjtvQkFDRCxJQUFJLFFBQVEsR0FBZ0IsSUFBSSxDQUFDO29CQUNqQyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7b0JBQzFCLElBQUksZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO29CQUM3QyxJQUFJLHdCQUF3QixHQUFHLEtBQUssQ0FBQztvQkFDckMsSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRTt3QkFDaEIsYUFBYSxHQUFHLElBQUksQ0FBQzt3QkFDckIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFOzRCQUNyQixhQUFhLEdBQUcsS0FBSyxDQUFDOzRCQUN0QixnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7NEJBQ3hDLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dDQUMzQixRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUNoRixJQUFJLENBQUMsaUNBQWlDLEVBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUM3QixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDOzZCQUM3RjtpQ0FBTSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQ0FDbEMsUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUkseUJBQXlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQy9GLElBQUksQ0FBQyxpQ0FBaUMsRUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQzdCLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7NkJBQ3ZDO2lDQUFNO2dDQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7NkJBQ3BDO3lCQUVKOzZCQUFNLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFOzRCQUNuQyxRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO2lDQUMvSixVQUFVLENBQUM7eUJBQ25COzZCQUFNOzRCQUNILFFBQVE7Z0NBQ0osQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3FDQUM3SixVQUFVLENBQUM7eUJBQ25CO3FCQUNKO3lCQUFNO3dCQUNILFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztxQkFDOUs7b0JBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNoRSxJQUFJLENBQUMsaUNBQWlDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDeEYsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsaUNBQWlDLEVBQUU7d0JBQ3BFLHdCQUF3QixHQUFHLElBQUksQ0FBQztxQkFDbkM7b0JBQ0QsSUFBSSxRQUFRLENBQUMsY0FBYyxFQUFFO3dCQUN6QixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7cUJBQzNFO29CQUNELElBQUksYUFBYSxFQUFFO3dCQUNmLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7cUJBQzdDO29CQUNELElBQUksZ0NBQWdDLEVBQUU7d0JBQ2xDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQztxQkFDL0Y7b0JBQ0QsT0FBTzt3QkFDSCxPQUFPLEVBQUUsV0FBVzt3QkFDcEIsc0JBQXNCLEVBQUUsd0JBQXdCO3dCQUNoRCx3QkFBd0IsRUFBRSx3QkFBd0I7cUJBQ3BDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLFlBQXlCLEVBQUUsUUFBcUI7b0JBQzVFLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUM7b0JBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3JGLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztvQkFDdEIsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7d0JBQzVCLFNBQVMsR0FBRyxJQUFJLENBQUM7cUJBQ3BCO29CQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxFQUFFO3dCQUN2QyxLQUFLLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDMUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ2pELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7cUJBQ3ZFO3lCQUFNO3dCQUNILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUNyRDtvQkFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTt3QkFDNUIsS0FBSyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBRW5FO29CQUNELElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxZQUFZLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRTt3QkFDaEQsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7cUJBQ2hGO29CQUNELE9BQU8sS0FBSyxDQUFDO2dCQUNqQixDQUFDO2dCQUVPLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBZ0MsRUFBRSxjQUF1QixFQUFFLFFBQXFCO29CQUNsSCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO29CQUNwRyxJQUFJLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFDO29CQUMvQyxNQUFNLG1DQUFtQyxHQUE2QixFQUFFLENBQUM7b0JBQ3pFLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsb0NBQW9DLEVBQUUsbUNBQW1DLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQzdKLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxxQkFBcUIsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO29CQUMvRixJQUFJLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLEVBQUUsbUNBQW1DLEVBQUUscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3ZILE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztvQkFDbEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNyQyxDQUFDO2dCQUVPLDZCQUE2QixDQUFDLHFCQUEwQixFQUFFLG1DQUE2RDtvQkFDM0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUNoRCxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTt3QkFDcEIsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFOzRCQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQy9CLE1BQU0saUJBQWlCLEdBQUcsbUNBQW1DLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQzFFLElBQUksaUJBQWlCLElBQUksaUJBQWlCLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxFQUFFO2dDQUM3RCxPQUFPLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDOzZCQUM1Qzt5QkFDSjtxQkFDSjtnQkFDTCxDQUFDO2dCQUVPLHdCQUF3QixDQUFDLGlCQUFnQyxFQUM3RCxtQ0FBNkQsRUFDN0QscUJBQXdDLEVBQ3hDLFFBQXFCO29CQUNyQixJQUFJLHdDQUF3QyxHQUFXLElBQUksQ0FBQztvQkFDNUQsV0FBVyxDQUFDLG9CQUFvQixDQUFjLGlCQUFpQixFQUMzRCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQXlCLEVBQ2xDLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ1IsTUFBTSxhQUFhLEdBQUcsbUNBQW1DLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQzt3QkFDcEYsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxhQUFhLENBQUM7d0JBQ3ZELHdDQUF3QyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQ3RELE9BQU8sSUFBSSxDQUFDO29CQUNoQixDQUFDLEVBQ0QsSUFBSSxtQ0FBbUMsRUFBRSxDQUFDLENBQUM7b0JBRS9DLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxpQkFBaUIsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO29CQUV6RyxJQUFJLENBQUMsbUJBQW1CLENBQUMsaUNBQWlDLENBQUMsbUNBQW1DLEVBQUUscUJBQXFCLENBQUMsQ0FBQztvQkFFdkgsSUFBSSxDQUFDLDJCQUEyQixHQUFHLHdDQUF3QyxDQUFDO29CQUU1RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBRU8sMkNBQTJDLENBQUMsaUJBQWdDLEVBQUUsbUNBQTZEO29CQUMvSSxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUN0RSxXQUFXLENBQUMsb0JBQW9CLENBQWMsaUJBQWlCLEVBQzNELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBeUIsRUFDbEMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ3ZDLElBQUksZUFBZSxFQUFFOzRCQUNqQixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUU7Z0NBQ3JELE9BQU8sQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUN4QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLG9DQUFvQyxFQUFVLENBQUMsQ0FBQztnQ0FDdEosUUFBUSxlQUFlLEVBQUU7b0NBQ3pCLEtBQUssYUFBYSxDQUFDLFFBQVE7d0NBQ3ZCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7d0NBQ25GLE1BQU07b0NBQ1YsS0FBSyxhQUFhLENBQUMsVUFBVTt3Q0FDekIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzt3Q0FDcEYsTUFBTTtvQ0FDVixLQUFLLGFBQWEsQ0FBQyxZQUFZO3dDQUMzQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO3dDQUNuRSxXQUFXLENBQUMsZ0JBQWdCLENBQXFCLFNBQVMsRUFDdEQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQ3RCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFFOzRDQUM1QyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQzs0Q0FDekMsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO2dEQUNoQixZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7Z0RBQ2pILE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFDM0YsT0FBTyxDQUFDLFVBQVUsRUFDbEIsSUFBSSxvQ0FBb0MsRUFBVSxDQUFDLENBQUM7Z0RBQ3hELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxhQUFhLEtBQUssYUFBYSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs2Q0FDekk7NENBQ0QsT0FBTyxJQUFJLENBQUM7d0NBQ2hCLENBQUMsRUFDRCxJQUFJLG1DQUFtQyxFQUFzQixFQUM3RCxJQUFJLEVBQ0osQ0FBQyxFQUNELENBQUMsRUFDRCxJQUFJLENBQ1AsQ0FBQzt3Q0FDRixNQUFNO2lDQUNUOzZCQUNKO3lCQUNKOzZCQUFNOzRCQUNILElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsMkJBQTJCLEVBQUU7Z0NBQ2pELGVBQWUsR0FBRyxJQUFJLENBQUM7NkJBQzFCO3lCQUNKO3dCQUNELE9BQU8sSUFBSSxDQUFDO29CQUVoQixDQUFDLEVBQ0QsSUFBSSxtQ0FBbUMsRUFBRSxFQUN6QyxJQUFJLENBQ1AsQ0FBQztnQkFFTixDQUFDO2dCQUVPLG9CQUFvQixDQUFDLFlBQWlDLEVBQUUsT0FBc0IsRUFBRSxPQUFvQixFQUFFLFFBQWlCLEVBQUUsV0FBb0I7b0JBQ2pKLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ3ZGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3hFLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3hHLENBQUM7Z0JBRU8sOEJBQThCLENBQUMsWUFBaUMsRUFDcEUsYUFBbUMsRUFDbkMsVUFBOEIsRUFDOUIsUUFBaUIsRUFDakIsV0FBb0I7b0JBQ3BCLFlBQVksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksbUNBQW1DLEVBQXNCLENBQUMsQ0FBQztnQkFDM0ksQ0FBQztnQkFFTyxLQUFLLENBQUMscUJBQXFCLENBQUMsNkJBQXVDLEVBQUUsbUNBQTZEO29CQUN0SSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUMxSSw2QkFBNkIsRUFDN0IsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUUsS0FBSyxJQUFJLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyx1QkFBdUIsRUFBRTt3QkFDekQsSUFBSSxtQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7NEJBQ2pFLE1BQU0sSUFBSSxHQUFHLG1CQUFtQixDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUM5RCxtQ0FBbUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7eUJBQ25EO3FCQUNKO2dCQUNMLENBQUM7Z0JBRU8sb0NBQW9DLENBQUMsS0FBb0IsRUFDN0QsNkJBQWdELEVBQ2hELG1DQUE2RCxFQUM3RCxjQUF1QjtvQkFFdkIsSUFBSSxjQUFjLEdBQWdCLElBQUksQ0FBQztvQkFDdkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssRUFDN0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQXlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFDN0QsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDUixJQUFJLGtCQUEwQixDQUFDO3dCQUMvQixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUM7d0JBQ3pCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTs0QkFDbkQsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7eUJBQ2hEOzZCQUFNOzRCQUNILGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7eUJBQ3hEO3dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLG1DQUFtQyxDQUFDLENBQUM7d0JBRXRGLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO3dCQUMvQixJQUFJLGVBQWUsS0FBSyxLQUFLLElBQUksY0FBYyxJQUFJLGNBQWMsRUFBRTs0QkFFL0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFO2dDQUMxRCw2QkFBNkIsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDO2dDQUNsRSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDOzZCQUM3RTs0QkFDRCxlQUFlLEdBQUcsS0FBSyxDQUFDO3lCQUUzQjt3QkFDRCxjQUFjLEdBQUcsT0FBTyxDQUFDO3dCQUN6QixPQUFPLElBQUksQ0FBQztvQkFDaEIsQ0FBQyxDQUFDLENBQUM7b0JBRVAsSUFBSSxDQUFDLGNBQWMsRUFBRTt3QkFDakIsbUNBQW1DLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUM5RTtnQkFDTCxDQUFDO2dCQUVPLFdBQVcsQ0FBQyxVQUF1QixFQUFFLGtCQUEwQixFQUFFLG1DQUE2RDtvQkFDbEksVUFBVSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxrQkFBa0IsQ0FBQztvQkFDL0QsbUNBQW1DLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLENBQUM7Z0JBQy9GLENBQUM7Z0JBRU8sa0JBQWtCLENBQUMsWUFBeUI7b0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztnQkFDbEgsQ0FBQztnQkFFTyxnQkFBZ0IsQ0FBQyxZQUF5QixFQUFFLFdBQTBCLEVBQUUsY0FBdUI7b0JBQ25HLElBQUksY0FBYyxFQUFFO3dCQUNoQixXQUFXLENBQUMsb0JBQW9CLENBQWMsV0FBVyxFQUNyRCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDLFFBQTBCLEVBQ3BDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTs0QkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOzRCQUMzQixPQUFPLElBQUksQ0FBQzt3QkFDaEIsQ0FBQyxDQUFDLENBQUM7cUJBQ1Y7eUJBQU07d0JBQ0gsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDO3dCQUN6QixJQUFJLFlBQVksQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFOzRCQUN6QixLQUFLLEdBQUcsQ0FBQyxDQUFDO3lCQUNiOzZCQUFNOzRCQUNILEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7eUJBQ3ZDO3dCQUNELFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztxQkFDbEQ7Z0JBRUwsQ0FBQztnQkFFRCx1QkFBdUIsQ0FBQyxJQUFpQjtvQkFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNsQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN6QixNQUFNLEdBQUcsS0FBSyxDQUFDO3FCQUNsQjtvQkFDRCxPQUFPLE1BQU0sQ0FBQztnQkFDbEIsQ0FBQztnQkFFTyw2QkFBNkIsQ0FBQyxVQUF1QixFQUFFLFFBQXVCO29CQUNsRixJQUFJLGFBQWEsR0FBaUIsRUFBRSxDQUFDO29CQUNyQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQzNCLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3lCQUN6RDtvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxJQUFJLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBYyxhQUFhLEVBQ2hGLENBQUMsQ0FBQyxFQUFFO3dCQUNBLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQyxRQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzFFLENBQUMsRUFDRCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFZixXQUFXLENBQUMsb0JBQW9CLENBQWMsUUFBUSxFQUNsRCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUF5QixFQUNoQyxDQUFDLFdBQVcsRUFBRSxFQUFFO3dCQUNaLElBQUksWUFBWSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2hFLElBQUksQ0FBQyxZQUFZLEVBQUU7NEJBQ2YsTUFBTSxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzRCQUMzRixJQUFJLGtCQUFrQixFQUFFO2dDQUNwQixrQkFBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzZCQUNqRDtpQ0FBTTtnQ0FDSCxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzZCQUNuQzs0QkFDRCxPQUFPLEtBQUssQ0FBQzt5QkFDaEI7d0JBQ0QsT0FBTyxJQUFJLENBQUM7b0JBQ2hCLENBQUMsRUFDRCxJQUFJLG1DQUFtQyxFQUFFLENBQzVDLENBQUM7b0JBRUYsT0FBTyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRU8sYUFBYSxDQUFDLElBQVM7b0JBQzNCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqSixDQUFDO2dCQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBdUI7b0JBQ3ZDLElBQUksSUFBSSxDQUFDLGlDQUFpQyxFQUFFO3dCQUN4QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDM0IsT0FBTztxQkFDVjtvQkFDRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUNsQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUM3QyxNQUFNLFVBQVUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7b0JBQ3BFLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ2hILElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFDaEMsR0FBRyxFQUFFO3dCQUNELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7d0JBQ25DLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxDQUFDLENBQUM7d0JBQ25DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFFTyx3QkFBd0IsQ0FBQyxFQUFVO29CQUN2QyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDO2dCQUVPLDRCQUE0QixDQUFDLFVBQXVCO29CQUN4RCxJQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUM1QixJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7d0JBQ2pCLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO3FCQUM5QztvQkFDRCxrQkFBa0IsRUFBRSxDQUFDO29CQUNyQixJQUFJLGtCQUFrQixJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUNqRixPQUFPLElBQUksQ0FBQztxQkFDZjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFFTyxrQkFBa0IsQ0FBQyxVQUF1QixFQUFFLHlCQUF3QztvQkFDeEYsSUFBSSxVQUFVLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDO29CQUNsRCxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUM1QixVQUFVLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7d0JBQ3pDLFVBQVUsRUFBRSxDQUFDO3dCQUNiLFVBQVUsRUFBRSxDQUFDO3FCQUNoQjtvQkFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUN0RSxJQUFJLENBQUMsaUNBQWlDLElBQUkseUJBQXlCLENBQUMsTUFBTSxDQUFDO3dCQUMzRSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDO3FCQUN2RDtvQkFFRCxNQUFNLElBQUksR0FBZ0I7d0JBQ3RCLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7d0JBQ3ZELElBQUksRUFBRSxhQUFhO3dCQUNuQixJQUFJLEVBQUU7NEJBQ0YsZ0JBQWdCLEVBQUUsSUFBSTs0QkFDdEIsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLEVBQUU7NEJBQy9CLGtCQUFrQixFQUFFLFVBQVU7eUJBQ2pDO3FCQUVKLENBQUM7b0JBRUYsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBRU8sYUFBYTtvQkFDakIsTUFBTSxJQUFJLEdBQWdCO3dCQUN0QixFQUFFLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjt3QkFDekIsSUFBSSxFQUFFLEtBQUs7cUJBQ2QsQ0FBQztvQkFDRixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztnQkFFTywwQkFBMEI7b0JBQzlCLE1BQU0sSUFBSSxHQUFnQjt3QkFDdEIsRUFBRSxFQUFFLElBQUksQ0FBQyxtQkFBbUI7d0JBQzVCLElBQUksRUFBRSxZQUFZO3FCQUNyQixDQUFDO29CQUNGLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUVPLDRCQUE0QjtvQkFDaEMsTUFBTSxJQUFJLEdBQWdCO3dCQUN0QixFQUFFLEVBQUUsSUFBSSxDQUFDLHlCQUF5Qjt3QkFDbEMsSUFBSSxFQUFFLGNBQWM7cUJBQ3ZCLENBQUM7b0JBQ0YsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBRU8sV0FBVztvQkFDZixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RSxDQUFDO2dCQUVPLGdCQUFnQixDQUFDLE9BQW9CO29CQUN6QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDekQsQ0FBQztnQkFFTyxpQkFBaUIsQ0FBQyxPQUFvQjtvQkFDMUMsT0FBTyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDaEQsQ0FBQztnQkFFTyxxQkFBcUIsQ0FBQyxPQUFvQjtvQkFDOUMsT0FBTyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztnQkFDbkQsQ0FBQztnQkFFTyxtQkFBbUIsQ0FBQyxPQUFvQjtvQkFDNUMsT0FBTyxPQUFPLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQztnQkFDOUIsQ0FBQztnQkFFTyx1QkFBdUIsQ0FBQyxPQUFvQjtvQkFDaEQsT0FBTyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztnQkFDekQsQ0FBQztnQkFFRCxtQkFBbUIsQ0FBQyxVQUFrQixFQUFFLElBQWM7b0JBQ2xELFVBQVUsQ0FBQyxNQUFNLENBQ2I7d0JBQ0ksU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQzt3QkFDL0IsTUFBTSxFQUFFOzRCQUNKLE1BQU0sRUFBRSxJQUFJOzRCQUNaLGdCQUFnQixFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0NBQzVCLE9BQU8sU0FBUyxLQUFLLGFBQWEsSUFBSSxTQUFTLEtBQUssYUFBYSxDQUFDOzRCQUN0RSxDQUFDO3lCQUNKO3FCQUNKLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUNyQixHQUFHLEVBQUU7d0JBQ0QsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDbEMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFDcEIsR0FBRyxFQUFFO29CQUVMLENBQUMsQ0FBQyxDQUFDO2dCQUVYLENBQUM7Z0JBR0QsTUFBTTtvQkFDRixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzlDLENBQUM7Z0JBRUQsZ0JBQWdCO29CQUNaLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3hCLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO2dCQUN2QyxDQUFDO2dCQUVELGtCQUFrQjtvQkFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztnQkFDekMsQ0FBQztnQkFFRCxPQUFPO29CQUNILElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLENBQUM7Z0JBR0Qsa0JBQWtCO29CQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLENBQUM7Z0JBRU8sYUFBYTtvQkFDakIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFHRCxtQkFBbUI7b0JBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDekIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO3FCQUN4QjtnQkFDTCxDQUFDO2dCQUVELFlBQVk7b0JBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7d0JBQUUsT0FBTztvQkFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQyxDQUFDO2dCQUVELGdCQUFnQixDQUFDLFVBQXlCLEVBQUUsa0JBQThCLEdBQUcsRUFBRSxHQUFFLENBQUM7b0JBQzlFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO29CQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUMzQyxHQUFHLEVBQUU7d0JBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7d0JBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7d0JBQzlCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7d0JBQ25DLGVBQWUsRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsQ0FBQztnQkFDWCxDQUFDO2dCQUVELFVBQVUsQ0FBQyxhQUFxQjtvQkFDNUIsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztvQkFDbEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztvQkFDakMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixDQUFDO2dCQUVPLFVBQVU7b0JBQ2QsSUFBSSxDQUFDLG1CQUFtQixHQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDdkcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxLQUFLLENBQUM7b0JBQzVDLElBQUksQ0FBQyxtQkFBbUIsR0FBQyxDQUFDLENBQUM7b0JBQzNCLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO29CQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBRUQsV0FBVyxDQUFDLFVBQVUsR0FBQyxJQUFJLEVBQUUsa0JBQWtCLEdBQUMsS0FBSztvQkFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztvQkFDaEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztvQkFDbEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztvQkFDbEMsSUFBSSxDQUFDLGlDQUFpQyxHQUFHLENBQUMsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLG9DQUFvQyxHQUFHLEVBQUUsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQztvQkFFeEMsSUFBSSxrQkFBa0IsRUFBRTt3QkFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztxQkFDaEM7b0JBQ0QsSUFBSSxVQUFVLEVBQUU7d0JBQ1osSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO3FCQUN2QjtvQkFDRCxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBR08sb0JBQW9CO29CQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQjt3QkFBRSxPQUFPO29CQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3RDLENBQUM7Z0JBRUQsd0JBQXdCLENBQUMsV0FBMEIsRUFBRSxXQUFtQixFQUFFLFNBQWtCO29CQUN4RixXQUFXLENBQUMsb0JBQW9CLENBQWMsV0FBVyxFQUNyRCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDLFFBQTBCLEVBQ3BDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTt3QkFDdkIsSUFBSSxLQUFLLEdBQXFCLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO3dCQUNwRSxJQUFJLEtBQUssR0FBRyxXQUFXLElBQUksU0FBUyxFQUFFOzRCQUNsQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzt5QkFDdkI7d0JBQ0QsT0FBTyxJQUFJLENBQUM7b0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUM7Z0JBR0QsS0FBSyxDQUFDLHNCQUFzQixDQUFDLElBQXNDO29CQUMvRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztvQkFDdkQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGFBQWEsRUFBRTt3QkFDL0IsTUFBTSxXQUFXLEdBQWdCLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzNDLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUM7d0JBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO3dCQUN4QixNQUFNLG1CQUFtQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ3JFLE1BQU0sYUFBYSxHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ3hFLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDdkIsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLGdCQUFnQixFQUFFOzRCQUN4QyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMseUJBQXlCLEVBQUUsQ0FBQzs0QkFDL0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDOzRCQUMvRCxhQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDbEQsVUFBVSxHQUFHLElBQUksQ0FBQzt5QkFDckI7NkJBQU0sSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLG1CQUFtQixFQUFFOzRCQUNsRCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQ0FDM0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDOzZCQUNqRztpQ0FBTSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQ0FDbEMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDOzZCQUNqRztpQ0FBTTtnQ0FDSCxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzZCQUNwQzs0QkFDRCxVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUNyQjs2QkFBTSxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMseUJBQXlCLEVBQUU7NEJBQ3hELElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dDQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7NkJBQ2xHO2lDQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dDQUNsQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7NkJBQ2xHO2lDQUFNO2dDQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7NkJBQ3BDOzRCQUNELFVBQVUsR0FBRyxJQUFJLENBQUM7eUJBQ3JCOzZCQUFNOzRCQUNILE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDOzRCQUN6RixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQy9ELGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3lCQUM5RTt3QkFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUN6RSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztxQkFDbkQ7Z0JBQ0wsQ0FBQztnQkFFTywwQkFBMEI7b0JBQzlCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO2dCQUMvRSxDQUFDO2dCQUVPLHlCQUF5QixDQUFDLGFBQTRCO29CQUMxRCxJQUFJLGFBQWEsS0FBSyxhQUFhLENBQUMsVUFBVSxJQUFJLGFBQWEsS0FBSyxhQUFhLENBQUMsWUFBWSxFQUFFO3dCQUM1RixPQUFPLElBQUksQ0FBQztxQkFDZjtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFFTyxtQkFBbUIsQ0FBQyxhQUErQixFQUFFLG1CQUFxQyxFQUFFLFVBQW1CO29CQUNuSCxJQUFJLFVBQVUsRUFBRTt3QkFDWixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsRCxPQUFPO3FCQUNWO29CQUNELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTt3QkFDekIsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFOzRCQUNaLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQzs0QkFDckIsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0NBQ2xDLFFBQVEsR0FBRyxJQUFJLENBQUM7NkJBQ25COzRCQUNELE1BQU0sSUFBSSxHQUFnQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRCQUMvQyxJQUFJLElBQUksRUFBRTtnQ0FDTixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0NBQ25DLElBQUksUUFBUSxFQUFFO29DQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dDQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dDQUN4QyxJQUFJLEtBQUssRUFBRTs0Q0FDUCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7eUNBQ3ZDO29DQUNMLENBQUMsQ0FBQyxDQUFDO2lDQUNOOzZCQUNKO3lCQUNKO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBRU8sR0FBRyxDQUFDLFlBQWlDLEVBQUUsYUFBdUI7b0JBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFFRCx5QkFBeUIsQ0FBQyxJQUFpQixFQUFFLFFBQWlCO29CQUMxRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztvQkFDdkQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQzt3QkFBRSxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQztvQkFDNUQsTUFBTSxhQUFhLEdBQXlCLEVBQUUsQ0FBQztvQkFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMxQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxJQUFJLFlBQVksS0FBSyxHQUFHLEVBQUU7NEJBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7NEJBQzNFLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7eUJBQ2xDO3FCQUNKO29CQUNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDM0UsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2xGLENBQUM7Z0JBRU8sd0JBQXdCLENBQUMsSUFBaUIsRUFBRSxZQUFpQztvQkFDakYsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLElBQUkseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ25DLElBQUksZ0JBQWdCLEdBQVcsSUFBSSxDQUFDO29CQUNwQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFO3dCQUNqQixhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQzt3QkFDckQseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ2xDO3lCQUFNLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDbEIsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxHQUFHLENBQUM7d0JBQ3JELGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO3dCQUM3Qyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDO3dCQUNoRSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7cUJBQzNCO29CQUNELE9BQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0csQ0FBQztnQkFFRCxvQkFBb0IsQ0FBQyxDQUFrQztvQkFDbkQsSUFBSSxXQUFXLEdBQWdCLENBQUMsQ0FBQyxjQUFjLENBQUM7b0JBQ2hELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQzt3QkFBRSxPQUFPO29CQUNsRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztvQkFDckQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN4QyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzNDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDO3dCQUNsQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQzt3QkFDNUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRTt3QkFDaEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUM5QyxPQUFPLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ2xEO3lCQUFNO3dCQUVILElBQUksYUFBNEIsQ0FBQzt3QkFDakMsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFOzRCQUN2RixPQUFPLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7NEJBQ3JDLGFBQWEsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDO3lCQUM5Qzs2QkFBTTs0QkFDSCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0NBQzFDLGFBQWEsR0FBRyxZQUFZLENBQUMseUJBQXlCLEVBQUUsQ0FBQzs2QkFDNUQ7aUNBQU07Z0NBQ0gsYUFBYSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzZCQUNsRzt5QkFDSjt3QkFFRCxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQzt3QkFDMUUsSUFBSSxhQUFhLEtBQUssYUFBYSxDQUFDLFlBQVksRUFBRTs0QkFDOUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLDZCQUE2QixDQUFDLENBQUM7eUJBQzVEOzZCQUFNLElBQUksYUFBYSxLQUFLLGFBQWEsQ0FBQyxRQUFRLEVBQUU7NEJBQ2pELGdCQUFnQixDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3lCQUN4RDs2QkFBTSxJQUFJLGFBQWEsS0FBSyxhQUFhLENBQUMsVUFBVSxFQUFFOzRCQUNuRCxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQzt5QkFDMUQ7d0JBQ0QsSUFBSSxJQUFJLENBQUMsb0JBQW9CLElBQUksV0FBVyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFOzRCQUMxRyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQzFCLElBQUksSUFBSSxFQUFFO2dDQUNOLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO2dDQUM3QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dDQUNwRSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQ0FDdEMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDeEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ3hFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQ0FDakMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDdkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7Z0NBQ3JGLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7NkJBQzNCO3lCQUVKO3dCQUNELGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDdkM7Z0JBQ0wsQ0FBQztnQkFFTyxrQkFBa0IsQ0FBQyxPQUFlO29CQUN0QyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO3dCQUV0QixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDO29CQUMvQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztnQkFFRCxLQUFLLENBQUMsa0NBQWtDLENBQUMsUUFBaUIsRUFBRSxtQkFBcUM7b0JBQzdGLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO29CQUNuQyxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQ3RGLENBQUMsRUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixHQUFHLENBQUMsRUFDN0MsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFFMUYsT0FBTyxJQUFJLENBQUMsNEJBQTRCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNqRSxDQUFDO2dCQUVELEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxRQUFpQixFQUFFLG1CQUFxQztvQkFDN0YsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7b0JBQ25DLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUNwRCxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUNoRCxDQUFDLEVBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsR0FBRyxDQUFDLEVBQzdDLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7b0JBRXBDLE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakUsQ0FBQztnQkFFTyw0QkFBNEIsQ0FBQyxRQUFxQixFQUFFLFFBQWlCO29CQUN6RSxNQUFNLGFBQWEsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7b0JBQzdDLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNsRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDekMsV0FBVyxDQUFDLG9CQUFvQixDQUFjLEtBQUssRUFDL0MsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFFLENBQUMsQ0FBQyxRQUEwQixFQUNwQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTt3QkFDcEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUNuQixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFOzRCQUN4QyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUNsSCxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsRUFDMUQsUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLG1DQUFtQyxFQUFzQixDQUFDLENBQUMsQ0FBQzt5QkFDdkU7d0JBQ0QsT0FBTyxJQUFJLENBQUM7b0JBQ2hCLENBQUMsRUFDRCxJQUFJLG1DQUFtQyxFQUFFLEVBQ3pDLElBQUksQ0FBQyxDQUFDO29CQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO29CQUNuQyxPQUFPLGFBQWEsQ0FBQztnQkFDekIsQ0FBQztnQkFFRCxLQUFLLENBQUMsU0FBUztvQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUN6QixJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFO3dCQUNoRSxJQUFJLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixFQUFFLEVBQUU7NEJBQzFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt5QkFDdEI7cUJBQ0o7eUJBQU07d0JBQ0gsSUFBSSxNQUFNLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxFQUFFOzRCQUM3QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7eUJBQ3RCO3FCQUNKO2dCQUNMLENBQUM7Z0JBRUQsS0FBSyxDQUFDLFdBQVc7b0JBQ2IsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO3dCQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDakM7b0JBQ0QsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUNyQixJQUFJLENBQUMsbUJBQW1CLEdBQUMsQ0FBQyxDQUFDO29CQUMzQixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUNsQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BHLENBQUM7Z0JBRUQsS0FBSyxDQUFDLDJCQUEyQjtvQkFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMxRSxDQUFDO2dCQUVELEtBQUssQ0FBQyw4QkFBOEI7b0JBQ2pDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNsSCxDQUFDO2dCQUVELG1CQUFtQjtvQkFDZixJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDO2dCQUVNLDRCQUE0QjtvQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO2dCQUM5QyxDQUFDO2dCQUVNLDRCQUE0QjtvQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO2dCQUM5QyxDQUFDO2dCQUVNLDhCQUE4QixDQUFDLElBQVk7b0JBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BELENBQUM7Z0JBRUQsNEJBQTRCLENBQUMsVUFBa0I7b0JBQzNDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbEYsQ0FBQztnQkFFTywyQkFBMkI7b0JBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztnQkFDN0MsQ0FBQztnQkFFTywyQkFBMkI7b0JBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztnQkFDN0MsQ0FBQztnQkFFRCxnQkFBZ0I7b0JBQ1osSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBRUQsZUFBZTtvQkFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNqQyxDQUFDO2dCQUVPLHNCQUFzQixDQUFDLFFBQWdCO29CQUMzQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwSixDQUFDO2dCQUVPLEtBQUs7b0JBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztnQkFFTyxXQUFXO29CQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBd0IsRUFBRSxlQUF1QixFQUFFLFVBQXVCO29CQUNwRixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDM0UsQ0FBQztnQkFHRCxRQUFRO29CQUNKLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLGFBQWEsQ0FBQyxVQUFVLEVBQUU7d0JBQzdFLE9BQU8sSUFBSSxDQUFDO3FCQUNmO29CQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDMUMsQ0FBQztnQkFFRCxXQUFXO29CQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYzt3QkFBRSxPQUFPO29CQUNqQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUU1RixDQUFDO2dCQUVPLGNBQWMsQ0FBQyxVQUF5QixFQUFFLFdBQW1CLEVBQUUsY0FBNkI7b0JBQ2hHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBYyxVQUFVLEVBQ3BELENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDdEMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7d0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRTs0QkFDcEUsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDNUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLG9DQUFvQyxFQUFVLENBQUMsQ0FBQzs0QkFDMUosUUFBUSxhQUFhLEVBQUU7Z0NBQ3ZCLEtBQUssYUFBYSxDQUFDLFFBQVE7b0NBQ3ZCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUNyRCxNQUFNO2dDQUNWLEtBQUssYUFBYSxDQUFDLFVBQVU7b0NBQ3pCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29DQUN0RCxNQUFNO2dDQUNWLEtBQUssYUFBYSxDQUFDLFlBQVk7b0NBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtxQ0FJMUI7eUNBQU07d0NBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3Q0FDdEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztxQ0FDakc7b0NBQ0QsTUFBTTs2QkFDVDt5QkFDSjt3QkFDRCxPQUFPLElBQUksQ0FBQztvQkFDaEIsQ0FBQyxFQUNELElBQUksbUNBQW1DLEVBQWUsRUFDdEQsSUFBSSxDQUFDLENBQUM7b0JBRVYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakMsQ0FBQztnQkFFTyxVQUFVLENBQUMsT0FBb0I7b0JBQ25DLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO2dCQUVPLHVCQUF1QixDQUFDLE9BQXNCLEVBQUUsT0FBb0IsRUFBRSxRQUFpQjtvQkFDM0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQzlGLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUMxRCxRQUFRLEVBQ1IsS0FBSyxFQUNMLElBQUksbUNBQW1DLEVBQXNCLENBQUMsQ0FBQztnQkFDdkUsQ0FBQztnQkFFTyxXQUFXLENBQUMsT0FBb0I7b0JBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDcEMsQ0FBQztnQkFFTSxlQUFlO29CQUNsQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztvQkFDdkQsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7Z0JBRU8sMkJBQTJCO29CQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7b0JBQzdDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDO29CQUNwRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFFbkMsQ0FBQztnQkFFTyxnQkFBZ0I7b0JBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFFTyxlQUFlO29CQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNqQyxDQUFDO2dCQUVPLDZCQUE2QjtvQkFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBRW5DLENBQUM7Z0JBRU8sdUJBQXVCO29CQUMzQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO29CQUNsQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO29CQUNqQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRXRCLENBQUM7Z0JBRUQsV0FBVyxDQUFDLEdBQVc7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBRUQsV0FBVztvQkFDUCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3QixDQUFDO2dCQUVELFdBQVcsQ0FBQyxFQUFNLEVBQUMsS0FBYyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsRjtZQTNzQ1ksaUNBQWEsZ0JBMnNDekIsQ0FBQTtRQUVMLENBQUMsRUFydkMwQixtQkFBbUIsR0FBbkIsNEJBQW1CLEtBQW5CLDRCQUFtQixRQXF2QzdDO0lBQUQsQ0FBQyxFQXJ2Q2lCLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBcXZDekI7QUFBRCxDQUFDLEVBcnZDUyxPQUFPLEtBQVAsT0FBTyxRQXF2Q2hCIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIENvbWFyY2guQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZSB7XHJcbiAgICBpbXBvcnQgSU1lbWJlck5vZGUgPSBDb21tb24uSU1lbWJlck5vZGU7XHJcbiAgICBpbXBvcnQgSUpzdHJlZVJlZHJhd05vZGVBcmdzID0gQ29tbW9uLklKc3RyZWVSZWRyYXdOb2RlQXJncztcclxuICAgIGltcG9ydCBGaWx0ZXJTdGF0ZU1hbmFnZXIgPSBGaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyO1xyXG4gICAgaW1wb3J0IEV4dGVuZGVkRmlsdGVySXRlbSA9IEZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5FeHRlbmRlZEZpbHRlckl0ZW07XHJcbiAgICBpbXBvcnQgTWVtYmVyTm9kZXNIZWxwZXIgPSBDb21tb24uTWVtYmVyTm9kZXNIZWxwZXI7XHJcbiAgICBpbXBvcnQgQWZmZWN0ZWROb2Rlc1NldCA9IENvbW1vbi5BZmZlY3RlZE5vZGVzU2V0O1xyXG4gICAgaW1wb3J0IElKc1RyZWVOb2RlU3RhdGUgPSBDb21tb24uSUpzVHJlZU5vZGVTdGF0ZTtcclxuICAgIGltcG9ydCBUcmVlSGVscGVycyA9IFV0aWxzLlRyZWVVdGlscy5UcmVlSGVscGVycztcclxuICAgIGltcG9ydCBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSA9IFV0aWxzLlRyZWVVdGlscy5Gb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuICAgIGltcG9ydCBGaWx0ZXJNZXRhZGF0YSA9IENvbW1vbi5GaWx0ZXJNZXRhZGF0YTtcclxuICAgIGltcG9ydCBNZXRhZGF0YVJlcXVlc3QgPSBDb21tb24uTWV0YWRhdGFSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IElGaWx0ZXJJbmZvID0gQ29tbW9uLklGaWx0ZXJJbmZvO1xyXG4gICAgaW1wb3J0IE1lbWJlcnNSZXF1ZXN0ID0gQ29tbW9uLk1lbWJlcnNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IExlYWZNZW1iZXJzUmVxdWVzdCA9IENvbW1vbi5MZWFmTWVtYmVyc1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgQ2hpbGRyZW5SZXF1ZXN0ID0gQ29tbW9uLkNoaWxkcmVuUmVxdWVzdDtcclxuICAgIGltcG9ydCBNZW1iZXJGaWx0ZXIgPSBDb21tb24uTWVtYmVyRmlsdGVyO1xyXG4gICAgaW1wb3J0IElGaWx0ZXJDb250cm9sU2VydmljZSA9IENvbW1vbi5JRmlsdGVyQ29udHJvbFNlcnZpY2U7XHJcbiAgICBpbXBvcnQgRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlcXVlc3QgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5GaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVxdWVzdDtcclxuICAgIGltcG9ydCBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JQ2hpbGRyZW5Db3VudEluZm9Mb29rdXA7XHJcbiAgICBpbXBvcnQgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5ID0gVXRpbHMuVHJlZVV0aWxzLkJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuICAgIGltcG9ydCBGaWx0ZXJJdGVtU3RhdGUgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5GaWx0ZXJJdGVtU3RhdGU7XHJcbiAgICBpbXBvcnQgR2V0TWVtYmVyc0J5U3RhdHVzUmVxdWVzdCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgSUdldE5vZGVzSW5mbyA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklHZXROb2Rlc0luZm87XHJcbiAgICBpbXBvcnQgSU1lbWJlck5vZGVMb29rdXAgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JTWVtYmVyTm9kZUxvb2t1cDtcclxuICAgIGltcG9ydCBJRmlsdGVyQ29udHJvbCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklTZXJpYWxpemFibGVTdGF0ZUNvbnRyb2w7XHJcbiAgICBpbXBvcnQgQ29udHJvbFN0YXRlSW5mbyA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkNvbnRyb2xTdGF0ZUluZm87XHJcbiAgICBpbXBvcnQgSUZpbHRlclN0YXRlTWFuYWdlciA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLklGaWx0ZXJTdGF0ZU1hbmFnZXI7XHJcbiAgICBpbXBvcnQgSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklGaWx0ZXJDb250cm9sU2VydmljZUZhY3Rvcnk7XHJcbiAgICBpbXBvcnQgSUZpbHRlclN0YXRlTWFuYWdlckZhY3RvcnkgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5JRmlsdGVyU3RhdGVNYW5hZ2VyRmFjdG9yeTtcclxuICAgIGltcG9ydCBJRmlsdGVySXRlbSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5JRmlsdGVySXRlbTtcclxuICAgIGltcG9ydCBGaWx0ZXJUeXBlID0gRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuQ29tbW9uLkZpbHRlclR5cGU7XHJcbiAgICBpbXBvcnQgU2VsZWN0aW9uTW9kZSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5TZWxlY3Rpb25Nb2RlO1xyXG4gICAgaW1wb3J0IElSZXNvdXJjZXNNYXAgPSBDb250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JUmVzb3VyY2VzTWFwO1xyXG4gICAgaW1wb3J0IElMaW1pdHNIZWxwZXJPd25lciA9IENvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuSGVscGVycy5JTGltaXRzSGVscGVyT3duZXI7XHJcbiAgICBpbXBvcnQgSUxpbWl0c0hlbHBlciA9IENvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuSGVscGVycy5JTGltaXRzSGVscGVyO1xyXG4gICAgaW1wb3J0IElMaW1pdHNIZWxwZXJGYWN0b3J5ID0gQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5IZWxwZXJzLklMaW1pdHNIZWxwZXJGYWN0b3J5O1xyXG4gICAgaW1wb3J0IExpbWl0c0hlbHBlckZhY3RvcnkgPSBDb250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLkhlbHBlcnMuTGltaXRzSGVscGVyRmFjdG9yeTtcclxuXHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlckNvbnRyb2wgaW1wbGVtZW50cyBJRmlsdGVyQ29udHJvbCwgSUxpbWl0c0hlbHBlck93bmVyIHtcclxuICAgICAgIFxyXG4gICAgICAgIHN0YXRpYyBnZXQgUmVzb3VyY2VzKCk6SVJlc291cmNlc01hcCB7cmV0dXJuIHdpbmRvd1tcImZpbHRlckNvbnRyb2xSZXNvdXJjZXNfOTVlYzM2NzhmMmVmNDM3ZThkZjcyYzc3MWI3NGU0NWVcIl19O1xyXG4gICAgICAgIHN0YXRpYyBnZXQgVGVtcGxhdGUoKTpzdHJpbmcge3JldHVybiAkKFwiI2ZpbHRlckNvbnRyb2xUZW1wbGF0ZV85NWVjMzY3OGYyZWY0MzdlOGRmNzJjNzcxYjc0ZTQ1ZVwiKS5odG1sKCl9O1xyXG5cclxuICAgICAgICBwcml2YXRlIF9zdGF0ZU1hbmFnZXJGYWN0b3J5OiBJRmlsdGVyU3RhdGVNYW5hZ2VyRmFjdG9yeTtcclxuICAgICAgICBwcml2YXRlIF9zZXJ2aWNlRmFjdG9yeTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeTtcclxuICAgICAgICBwcml2YXRlIF92aWV3OiBGaWx0ZXJDb250cm9sTW9kdWxlLklGaWx0ZXJDb250cm9sVmlldztcclxuICAgICAgICBwcml2YXRlIF9saW1pdHNIZWxwZXJGYWN0b3J5OklMaW1pdHNIZWxwZXJGYWN0b3J5O1xyXG4gICAgICAgIHByaXZhdGUgX29wdGlvbnM6T3B0aW9ucztcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBfc2VydmljZTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlO1xyXG4gICAgICAgIHByaXZhdGUgX2lzTG9hZGluZ01vcmVFbGVtZW50OiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2lzUmVzdG9yaW5nVHJlZVN0YXRlOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2VsZW1lbnRzVG9Mb2FkOiBJTWVtYmVyTm9kZVtdO1xyXG4gICAgICAgIHByaXZhdGUgX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleDogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgX2ZpbHRlckVsZW1lbnRzTG9hZE1vcmVTdGFydEluZGV4OiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBfbG9hZE1vcmVOb2RlSWRQYXJ0OiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0QWxsTm9kZUlkOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfc2VsZWN0QWxsRmlsdHJlZElkOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfZGVzZWxlY3RBbGxGaWx0cmVkTm9kZUlkOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfc3RhdGVNYW5hZ2VyOiBJRmlsdGVyU3RhdGVNYW5hZ2VyO1xyXG4gICAgICAgIHByaXZhdGUgX2ZpbHRlclN0YXRlTWFuYWdlcjogSUZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgICAgICBwcml2YXRlIF9yZWRyd2VkTm9kZXM6IHN0cmluZ1tdO1xyXG4gICAgICAgIHByaXZhdGUgX2lzTG9hZGluZ0FsbEVsZW1lbnRzOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX21ldGFkYXRhOiBGaWx0ZXJNZXRhZGF0YTtcclxuICAgICAgICBwcml2YXRlIF9ub2Rlc1dpdGhvdXRGdWxsQ2hpbGRyZW5Db3VudExvb2t1cDogSU1lbWJlck5vZGVMb29rdXA7XHJcbiAgICAgICAgcHJpdmF0ZSBfbGFzdFByb2Nlc3NlZE5vZGVVbmlxZU5hbWU6IHN0cmluZztcclxuICAgICAgICBwcml2YXRlIF9jdXJyZW50U3RhdHVzRmlsdGVyOiBGaWx0ZXJJdGVtU3RhdGU7XHJcbiAgICAgICAgcHJpdmF0ZSBfaXNJbkZpbHRlck1vZGU6IGJvb2xlYW47XHJcbiAgICAgICAgcHJpdmF0ZSBfaXNJblNlYXJjaEZpbHRlck1vZGU6IGJvb2xlYW47XHJcbiAgICAgICAgcHJpdmF0ZSBfaXNJblN0YXR1c0ZpbHRlck1vZGU6IGJvb2xlYW47XHJcbiAgICAgICAgcHJpdmF0ZSBfaXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHJpdmF0ZSBfY29udHJvbFN0YXRlSW5mbzogQ29udHJvbFN0YXRlSW5mbztcclxuICAgICAgICBwcml2YXRlIF9saW1pdHNIZWxwZXI6SUxpbWl0c0hlbHBlcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIG9wdGlvbnM6SU9wdGlvbnMsXHJcbiAgICAgICAgICAgIHZpZXdGYWN0b3J5OiBJRmlsdGVyQ29udHJvbFZpZXdGYWN0b3J5LFxyXG4gICAgICAgICAgICBzZXJ2aWNlRmFjdG9yeTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSxcclxuICAgICAgICAgICAgc3RhdGVNYW5hZ2VyRmFjdG9yeTogSUZpbHRlclN0YXRlTWFuYWdlckZhY3RvcnksXHJcbiAgICAgICAgICAgIGxpbWl0c0hlbHBlckZhY3Rvcnk6SUxpbWl0c0hlbHBlckZhY3Rvcnk9bmV3IExpbWl0c0hlbHBlckZhY3RvcnkoKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG5ldyBPcHRpb25zKCkuTWVyZ2Uob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcgPSB2aWV3RmFjdG9yeS5DcmVhdGUodGhpcy5fb3B0aW9ucy4kVGFyZ2V0Q29udGFpbmVyLHRoaXMuX29wdGlvbnMuVGVtcGxhdGUsdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlcnZpY2VGYWN0b3J5ID0gc2VydmljZUZhY3Rvcnk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlckZhY3RvcnkgPSBzdGF0ZU1hbmFnZXJGYWN0b3J5O1xyXG4gICAgICAgICAgICB0aGlzLl9saW1pdHNIZWxwZXJGYWN0b3J5ID0gbGltaXRzSGVscGVyRmFjdG9yeTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgUmVzZXRJbnRlcm5hbFN0YXRlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmdNb3JlRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc3RvcmluZ1RyZWVTdGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlckVsZW1lbnRzTG9hZE1vcmVTdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fc2VydmljZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRNb3JlTm9kZUlkUGFydCA9IFwiU2hvd01vcmVcIjtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0QWxsTm9kZUlkID0gXCJTZWxlY3RBbGxcIjtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0QWxsRmlsdHJlZElkID0gXCJTZWxlY3RBbGxGaWx0cmVkXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2VsZWN0QWxsRmlsdHJlZE5vZGVJZCA9IFwiRGVTZWxlY3RBbGxGaWx0cmVkXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZHJ3ZWROb2RlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl9tZXRhZGF0YSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzV2l0aG91dEZ1bGxDaGlsZHJlbkNvdW50TG9va3VwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWROb2RlVW5pcWVOYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXR1c0ZpbHRlciA9IEZpbHRlckl0ZW1TdGF0ZS5DaGVja2VkO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luU2VhcmNoRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luU3RhdHVzRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9pc01heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9jb250cm9sU3RhdGVJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fbGltaXRzSGVscGVyPW51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgT3B0aW9ucygpOiBPcHRpb25zIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2V0IE9wdGlvbnModmFsdWU6IE9wdGlvbnMpIHsgdGhpcy5fb3B0aW9ucyA9IHZhbHVlOyB9XHJcblxyXG4gICAgICAgIGdldCBNZXRhZGF0YSgpOiBGaWx0ZXJNZXRhZGF0YSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXRhZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBTZXJ2aWNlRmFjdG9yeSgpOiBJRmlsdGVyQ29udHJvbFNlcnZpY2VGYWN0b3J5IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlcnZpY2VGYWN0b3J5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2V0IFNlcnZpY2VGYWN0b3J5KHZhbHVlOiBJRmlsdGVyQ29udHJvbFNlcnZpY2VGYWN0b3J5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlcnZpY2VGYWN0b3J5ID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgTG9hZGVkRWxlbWVudHNDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbGltaXRzSGVscGVyLkxvYWRlZEVsZW1lbnRzQ291bnQ7IH1cclxuXHJcbiAgICAgICAgc2V0IExvYWRlZEVsZW1lbnRzQ291bnQodmFsdWU6IG51bWJlcikgeyB0aGlzLl9saW1pdHNIZWxwZXIuTG9hZGVkRWxlbWVudHNDb3VudCA9IHZhbHVlOyB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIGdldCBUb3RhbEVsZW1lbnRzQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ldGFkYXRhLkFsbExldmVsc01lbWJlcnNUb3RhbENvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgZ2V0IElzSW5TZWFyY2hGaWx0ZXJNb2RlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNJblNlYXJjaEZpbHRlck1vZGU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHNldCBJc0luU2VhcmNoRmlsdGVyTW9kZSh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luU2VhcmNoRmlsdGVyTW9kZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2lzSW5GaWx0ZXJNb2RlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2lzSW5TdGF0dXNGaWx0ZXJNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0luRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0IElzSW5TdGF0dXNGaWx0ZXJNb2RlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNJblN0YXR1c0ZpbHRlck1vZGU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzZXQgSXNJblN0YXR1c0ZpbHRlck1vZGUodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNJblN0YXR1c0ZpbHRlck1vZGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0luRmlsdGVyTW9kZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0luU2VhcmNoRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNJbkZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGdldCBNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc01heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNldCBNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQgPSB2YWx1ZTsgfVxyXG5cclxuICAgICAgICBnZXQgVHJlZVN0YXRlKCk6IElNZW1iZXJOb2RlW10ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmlldy5HZXRUcmVlU3RhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBJc0luRmlsdGVyTW9kZSgpOiBib29sZWFuIHsgcmV0dXJuIEJvb2xlYW4odGhpcy5faXNJbkZpbHRlck1vZGUpIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVDb250cm9sVG9wQmFyKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlVwZGF0ZUxldmVsc01lbnUoKTtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5VcGRhdGVGaWx0ZXJUeXBlU2VsZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgUmVmcmVzaFRyZWUoY29ubmVjdGlvblN0cmluZzogc3RyaW5nLCBmaWVsZFVuaXF1ZU5hbWU6IHN0cmluZywgc2F2ZWRTdGF0ZTogSUZpbHRlckl0ZW0pIHtcclxuICAgICAgICAgICAgdGhpcy5TaG93QWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4ID0gdGhpcy5fb3B0aW9ucy5DdXJyZW50V2luZG93O1xyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlID0gdGhpcy5TZXJ2aWNlRmFjdG9yeS5DcmVhdGUoY29ubmVjdGlvblN0cmluZyk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhUmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZXRhZGF0YShuZXcgTWV0YWRhdGFSZXF1ZXN0KGZpZWxkVW5pcXVlTmFtZSwgRmlsdGVyU3RhdGVNYW5hZ2VyLkdldExlYWZzKHNhdmVkU3RhdGUpKSkpO1xyXG4gICAgICAgICAgICB0aGlzLl9tZXRhZGF0YSA9IG1ldGFkYXRhUmVzcG9uc2UuTWV0YWRhdGE7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpbWl0c0hlbHBlciA9IHRoaXMuX2xpbWl0c0hlbHBlckZhY3RvcnkuQ3JlYXRlKHRoaXMsIHRoaXMuX29wdGlvbnMuTWF4VG90YWxFbGVtZW50c0NvdW50LCB0aGlzLl9tZXRhZGF0YS5BbGxMZXZlbHNNZW1iZXJzVG90YWxDb3VudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpbWl0c0hlbHBlci5Mb2FkZWRFbGVtZW50c0NvdW50PTA7XHJcbiAgICAgICAgICAgIHRoaXMuQ3JlYXRlQ29udHJvbFRvcEJhcigpO1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIgPSB0aGlzLl9zdGF0ZU1hbmFnZXJGYWN0b3J5LkNyZWF0ZShGaWx0ZXJUeXBlLkV4Y2x1ZGVkLCB0aGlzLl9tZXRhZGF0YS5Sb290TWVtYmVyc1RvdGFsQ291bnQsIGZhbHNlKTtcclxuICAgICAgICAgICAgaWYgKHNhdmVkU3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlci5EZXNlcmlhbGl6ZShzYXZlZFN0YXRlLCB0aGlzLl9tZXRhZGF0YS5Sb290TWVtYmVyc1RvdGFsQ291bnQsIG1ldGFkYXRhUmVzcG9uc2UuQ2xlYW5lZFN0YXRlSW5mbyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbWV0YWRhdGEuRGVmYXVsdE1lbWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuSGFuZGxlRGVmYXVsdE1lbWJlcigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuUmVzZXQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQ3JlYXRlVHJlZSgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlVHJlZSgpIHtcclxuICAgICAgICAgICByZXR1cm4gdGhpcy5fdmlldy5DcmVhdGVUcmVlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEhhbmRsZURlZmF1bHRNZW1iZXIoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlci5SZXNldChmYWxzZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNZW1iZXJSb290ID0gTWVtYmVyTm9kZXNIZWxwZXIuSGllcmFyY2hpemVOb2Rlcyh0aGlzLl9tZXRhZGF0YS5EZWZhdWx0TWVtYmVyLkxhc3RMZXZlbE5vZGVzLCB0aGlzLl9tZXRhZGF0YS5EZWZhdWx0TWVtYmVyLlBhcmVudHNMb29rdXApO1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4oZGVmYXVsdE1lbWJlclJvb3QsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQsIHBhcmVudCwgbGV2ZWwsIGluZGV4LCBwYXJlbnRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuSXNUcmVlTGVhZihjdXJyZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzID0gW3sgaWQ6IFwiI1wiIH0gYXMgSU1lbWJlck5vZGVdLmNvbmNhdChwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5BZGRTdGF0ZU5vZGVGcm9tVHJlZSh0aGlzLl9zdGF0ZU1hbmFnZXIsIHBhcmVudHMsIGN1cnJlbnQsIHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8SU1lbWJlck5vZGU+KCksXHJcbiAgICAgICAgICAgICAgICB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldE5vZGVEYXRhKG9iajogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IHRoaXMuTG9hZE5vZGVzQ29yZShvYmosIHRoaXMuX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpbmZvLk1heEVsZW1lbnRMaW1pdFJlYWNoZWQgJiYgIWluZm8uSGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLk1hbnVhbFJlc2V0TG9hZGluZ0FjdGlvbihvYmopO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVuZGVyVHJlZShpbmZvLk1lbWJlcnMpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTWFudWFsUmVzZXRMb2FkaW5nQWN0aW9uKG9iajogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZTogSU1lbWJlck5vZGUgPSAgdGhpcy5HZXRUcmVlTm9kZShvYmouaWQpO1xyXG4gICAgICAgICAgICBjb25zdCBub2RlRWxlbWVudCA9ICQoIHRoaXMuR2V0VHJlZU5vZGUob2JqLmlkLCB0cnVlKSk7XHJcbiAgICAgICAgICAgIG5vZGVFbGVtZW50LnJlbW92ZUNsYXNzKFwianN0cmVlLWxvYWRpbmdcIik7XHJcbiAgICAgICAgICAgIG5vZGUuc3RhdGUubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbm9kZS5zdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG5vZGUuc3RhdGUubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIExvYWROb2Rlc0NvcmUob2JqOiBJTWVtYmVyTm9kZSwgc3RhcnRJbmRleDogbnVtYmVyKTogUHJvbWlzZTxJR2V0Tm9kZXNJbmZvPiB7XHJcbiAgICAgICAgICAgIGxldCBpbmZvOiBJR2V0Tm9kZXNJbmZvO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNMb2FkaW5nTW9yZUVsZW1lbnQgfHwgdGhpcy5faXNSZXN0b3JpbmdUcmVlU3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIGluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWVtYmVyczogdGhpcy5fZWxlbWVudHNUb0xvYWQsXHJcbiAgICAgICAgICAgICAgICAgICAgTWF4RWxlbWVudExpbWl0UmVhY2hlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgSGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluZm8gPSBhd2FpdCB0aGlzLkxvYWROb2Rlc0Zyb21TZXJ2ZXJDb3JlKG9iaiwgc3RhcnRJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGluZm87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIExvYWROb2Rlc0Zyb21TZXJ2ZXJDb3JlKG9iajogSU1lbWJlck5vZGUsIHN0YXJ0SW5kZXg6IG51bWJlcik6IFByb21pc2U8SUdldE5vZGVzSW5mbz4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuU2hvd01heExpbWl0UmVhY2hlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBNZW1iZXJzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBNYXhFbGVtZW50TGltaXRSZWFjaGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIEhhc1RyaW1tZWRUb0xpbWl0TWVtYmVyczogZmFsc2VcclxuXHJcbiAgICAgICAgICAgICAgICB9IGFzIElHZXROb2Rlc0luZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlOiBJRmlsdGVySW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBjcmVhdGVBbGxOb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBjcmVhdGVGaWx0cmVkU3RhdGVTZWxlY3Rpb25Ob2RlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgaGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChvYmouaWQgPT09IFwiI1wiKSB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGVBbGxOb2RlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLklzSW5GaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQWxsTm9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUZpbHRyZWRTdGF0ZVNlbGVjdGlvbk5vZGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IChhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldE1lbWJlcnMobmV3IE1lbWJlcnNSZXF1ZXN0KHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbnMuRGF0YVBhY2thZ2VTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE1lbWJlckZpbHRlcih0aGlzLl92aWV3LlNlYXJjaFBhdHRlcm4sIHRoaXMuX3ZpZXcuTWVtYmVyRmlsdGVyVHlwZSkpKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuSXNJblN0YXR1c0ZpbHRlck1vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZW1iZXJzQnlTdGF0dXMobmV3IEdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3QodGhpcy5fdmlldy5GaWx0ZXJMZXZlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zLkRhdGFQYWNrYWdlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdHVzRmlsdGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlci5TZXJpYWxpemUoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIpKS5GaWx0ZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IChhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldExlYWZNZW1iZXJzKG5ldyBMZWFmTWVtYmVyc1JlcXVlc3QodGhpcy5fdmlldy5GaWx0ZXJMZXZlbCwgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4LCB0aGlzLl9vcHRpb25zLk1heFRvdGFsRWxlbWVudHNDb3VudCkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZW1iZXJzKG5ldyBNZW1iZXJzUmVxdWVzdCh0aGlzLl9tZXRhZGF0YS5Tb3J0ZWRMZXZlbHNbMF0uVW5pcXVlTmFtZSwgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4LCB0aGlzLl9vcHRpb25zLkRhdGFQYWNrYWdlU2l6ZSkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0Q2hpbGRyZW4obmV3IENoaWxkcmVuUmVxdWVzdCh0aGlzLl9tZXRhZGF0YS5Tb3J0ZWRMZXZlbHNbMF0uVW5pcXVlTmFtZSwgb2JqLmlkLCBzdGFydEluZGV4LCB0aGlzLl9vcHRpb25zLkRhdGFQYWNrYWdlU2l6ZSkpKS5GaWx0ZXJJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzVG9Mb2FkID0gYXdhaXQgdGhpcy5QcmVwYXJlRGF0YVRvTG9hZChvYmosIHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgdGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQgPSAhdGhpcy5fbGltaXRzSGVscGVyLkVuZm9yY2VMaW1pdHMobm9kZXNUb0xvYWQpO1xyXG4gICAgICAgICAgICBpZiAobm9kZXNUb0xvYWQubGVuZ3RoICE9PSAwICYmIHRoaXMuX2lzTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNUcmltbWVkVG9MaW1pdE1lbWJlcnMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5IYXNNb3JlTWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgbm9kZXNUb0xvYWQucHVzaCh0aGlzLkNyZWF0ZUxvYWRNb3JlTm9kZShvYmosIHJlc3BvbnNlLkxhc3RMZXZlbE5vZGVzKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNyZWF0ZUFsbE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzVG9Mb2FkLnVuc2hpZnQodGhpcy5DcmVhdGVBbGxOb2RlKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjcmVhdGVGaWx0cmVkU3RhdGVTZWxlY3Rpb25Ob2Rlcykge1xyXG4gICAgICAgICAgICAgICAgbm9kZXNUb0xvYWQudW5zaGlmdCh0aGlzLkNyZWF0ZVNlbGVjdEFsbEZpbHRyZWROb2RlKCksIHRoaXMuQ3JlYXRlRGVTZWxlY3RBbGxGaWx0cmVkTm9kZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgTWVtYmVyczogbm9kZXNUb0xvYWQsXHJcbiAgICAgICAgICAgICAgICBNYXhFbGVtZW50TGltaXRSZWFjaGVkOiBoYXNUcmltbWVkVG9MaW1pdE1lbWJlcnMsXHJcbiAgICAgICAgICAgICAgICBIYXNUcmltbWVkVG9MaW1pdE1lbWJlcnM6IGhhc1RyaW1tZWRUb0xpbWl0TWVtYmVyc1xyXG4gICAgICAgICAgICB9IGFzIElHZXROb2Rlc0luZm87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIFByZXBhcmVEYXRhVG9Mb2FkKGludm9raW5nTm9kZTogSU1lbWJlck5vZGUsIHJlc3BvbnNlOiBJRmlsdGVySW5mbykge1xyXG4gICAgICAgICAgICBsZXQgbm9kZXMgPSByZXNwb25zZS5MYXN0TGV2ZWxOb2RlcztcclxuICAgICAgICAgICAgY29uc3QgZXhwYW5kVG9MZXZlbEluZGV4ID0gdGhpcy5HZXRMZXZlbE51bWJlckZyb21VbmlxdWVOYW1lKHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwpO1xyXG4gICAgICAgICAgICBsZXQgZXhwYW5kQWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgZXhwYW5kQWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc0xvYWRpbmdXaG9sZVRyZWUoaW52b2tpbmdOb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZXMgPSBNZW1iZXJOb2Rlc0hlbHBlci5IaWVyYXJjaGl6ZU5vZGVzKG5vZGVzLCByZXNwb25zZS5QYXJlbnRzTG9va3VwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuQXNzaWduTGV2ZWxJbmRleChpbnZva2luZ05vZGUsIG5vZGVzLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuRXhwYW5kTm9kZXNUb1RhcmdldExldmVsKG5vZGVzLCBleHBhbmRUb0xldmVsSW5kZXgsIGV4cGFuZEFsbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFzc2lnbkxldmVsSW5kZXgoaW52b2tpbmdOb2RlLCBub2RlcywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNMb2FkaW5nTW9yZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzID0gdGhpcy5NZXJnZU5ld05vZGVzSW50b0V4aXN0aW5nVHJlZShpbnZva2luZ05vZGUsIG5vZGVzKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNJbkZpbHRlck1vZGUgJiYgaW52b2tpbmdOb2RlLmlkID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5Jbml0RmlsdHJlZEVsZW1lbnRTdGF0ZShub2RlcywgcmVzcG9uc2UuSGFzTW9yZU1lbWJlcnMsIHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIEluaXRGaWx0cmVkRWxlbWVudFN0YXRlKGhpZXJhcmNoaXplZE5vZGVzOiBJTWVtYmVyTm9kZVtdLCBoYXNNb3JlTWVtYmVyczogYm9vbGVhbiwgcmVzcG9uc2U6IElGaWx0ZXJJbmZvKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzV2l0aFVwZGF0ZWRDb3VudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5fbm9kZXNXaXRob3V0RnVsbENoaWxkcmVuQ291bnRMb29rdXApKTtcclxuICAgICAgICAgICAgdGhpcy5fbm9kZXNXaXRob3V0RnVsbENoaWxkcmVuQ291bnRMb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLkZpbGxBdmFpbGFibGVGaWx0ZXJSZXN1bHRUb3RhbENvdW50cyhoaWVyYXJjaGl6ZWROb2RlcywgdGhpcy5fbm9kZXNXaXRob3V0RnVsbENoaWxkcmVuQ291bnRMb29rdXAsIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwLCBoYXNNb3JlTWVtYmVycyk7XHJcbiAgICAgICAgICAgIHRoaXMuQ2FsY3VsYXRlVXBkYXRlZENvdW50TWVtZWJlcnMobm9kZXNXaXRoVXBkYXRlZENvdW50LCBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cCk7XHJcbiAgICAgICAgICAgIHRoaXMuQ3JlYXRlRmlsdGVyVmlzaWJsZVN0YXRlKGhpZXJhcmNoaXplZE5vZGVzLCBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cCwgbm9kZXNXaXRoVXBkYXRlZENvdW50LCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlY0ZJTFRFUiBTVEFURTpgLCBcImJhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiB5ZWxsb3dcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlci5QcmludCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDYWxjdWxhdGVVcGRhdGVkQ291bnRNZW1lYmVycyhub2Rlc1dpdGhVcGRhdGVkQ291bnQ6IGFueSwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobm9kZXNXaXRoVXBkYXRlZENvdW50KTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXggaW4ga2V5cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleXMuaGFzT3duUHJvcGVydHkoaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pcXVlTmFtZSA9IGtleXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuQ291bnRJbmZvID0gZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXBbdW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuQ291bnRJbmZvICYmIGNoaWxkcmVuQ291bnRJbmZvLkNoaWxkcmVuQ291bnQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBub2Rlc1dpdGhVcGRhdGVkQ291bnRbdW5pcXVlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZUZpbHRlclZpc2libGVTdGF0ZShoaWVyYXJjaGl6ZWROb2RlczogSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCxcclxuICAgICAgICAgICAgbm9kZXNXaXRoVXBkYXRlZENvdW50OiBJTWVtYmVyTm9kZUxvb2t1cCxcclxuICAgICAgICAgICAgcmVzcG9uc2U6IElGaWx0ZXJJbmZvKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50QWN0aW9uTGFzdFByb2Nlc3NlZE5vZGVVbmlxdWVOYW1lOiBzdHJpbmcgPSBudWxsO1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4oaGllcmFyY2hpemVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbkNvdW50ID0gZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXBbY3VycmVudC5pZF0uQ2hpbGRyZW5Db3VudDtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRhdGEuZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCA9IGNoaWxkcmVuQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEFjdGlvbkxhc3RQcm9jZXNzZWROb2RlVW5pcXVlTmFtZSA9IGN1cnJlbnQuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5UcmFuc2Zvcm1PcmdpbmFsU3RhdGVJbnRvVmlzaWJsZUZpbHRlclN0YXRlKGhpZXJhcmNoaXplZE5vZGVzLCBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIuVXBkYXRlRmlsdGVyZWRDaGlsZHJlbnNUb3RhbENvdW50KGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwLCBub2Rlc1dpdGhVcGRhdGVkQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZE5vZGVVbmlxZU5hbWUgPSBjdXJyZW50QWN0aW9uTGFzdFByb2Nlc3NlZE5vZGVVbmlxdWVOYW1lO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyLlJlZnJlc2goKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgVHJhbnNmb3JtT3JnaW5hbFN0YXRlSW50b1Zpc2libGVGaWx0ZXJTdGF0ZShoaWVyYXJjaGl6ZWROb2RlczogSU1lbWJlck5vZGVbXSwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhcnRQcm9jZXNzaW5nID0gdGhpcy5fbGFzdFByb2Nlc3NlZE5vZGVVbmlxZU5hbWUgPyBmYWxzZSA6IHRydWU7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPihoaWVyYXJjaGl6ZWROb2RlcyxcclxuICAgICAgICAgICAgICAgICh4KSA9PiB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCwgaW5kZXgsIHBhcmVudHMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRQcm9jZXNzaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmRhdGEubGV2ZWwgPT09IHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWxOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHMudW5zaGlmdCggdGhpcy5HZXRUcmVlTm9kZShcIiNcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uU3RhdHVzID0gdGhpcy5fc3RhdGVNYW5hZ2VyLkdldFNlbGVjdGlvblN0YXR1cyhwYXJlbnRzLm1hcCh4ID0+IHguaWQpLCBjdXJyZW50LmlkLCBuZXcgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PHN0cmluZz4oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHNlbGVjdGlvblN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuQWRkU3RhdGVOb2RlRnJvbVRyZWUodGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyLCBwYXJlbnRzLCBjdXJyZW50LCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkFkZFN0YXRlTm9kZUZyb21UcmVlKHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciwgcGFyZW50cywgY3VycmVudCwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVJdGVtID0gdGhpcy5fc3RhdGVNYW5hZ2VyLkNsb25lQnJhbmNoKGN1cnJlbnQuaWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlUHJlb3JkZXI8RXh0ZW5kZWRGaWx0ZXJJdGVtPihzdGF0ZUl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh4KSA9PiB4LkNoaWxkcmVuQXJyYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsLCBpbmRleCwgc3RhdGVQYXJlbnRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Lk93bmVyID0gdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuSXNMZWFmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVQYXJlbnRzID0gcGFyZW50cy5tYXAoeCA9PiB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZSh4LCB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIpKS5jb25jYXQoc3RhdGVQYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25Nb2RlID0gdGhpcy5fc3RhdGVNYW5hZ2VyLkdldFNlbGVjdGlvblN0YXR1cyhzdGF0ZVBhcmVudHMubWFwKHggPT4geC5VbmlxdWVOYW1lKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5VbmlxdWVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PHN0cmluZz4oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5BZGRTdGF0ZVRyYW5zZm9ybWF0aW9uTm9kZUNvcmUodGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyLCBzdGF0ZVBhcmVudHMsIGN1cnJlbnQsIHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8RXh0ZW5kZWRGaWx0ZXJJdGVtPigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlIC8vVE9ETyBjaGVjayBpbiBQb2ludCBhbmQgY2hhbmdlIG9yZGVyIG9mIHRyYWNrIHBhdGggdG8gYmUgZmlyc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuaWQgPT09IHRoaXMuX2xhc3RQcm9jZXNzZWROb2RlVW5pcWVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkoKSxcclxuICAgICAgICAgICAgICAgIHRydWVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEFkZFN0YXRlTm9kZUZyb21UcmVlKHN0YXRlTWFuYWdlcjogSUZpbHRlclN0YXRlTWFuYWdlciwgcGFyZW50czogSU1lbWJlck5vZGVbXSwgY3VycmVudDogSU1lbWJlck5vZGUsIGlzU2VsZWN0OiBib29sZWFuLCBhdXRvUmVmcmVzaDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBjb25zdCBzb3J0ZWRQYXJlbnRzID0gcGFyZW50cy5tYXAoeCA9PiB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZSh4LCBzdGF0ZU1hbmFnZXIpKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IHRoaXMuQ3JlYXRlRmlsdGVySXRlbUZyb21Ob2RlKGN1cnJlbnQsIHN0YXRlTWFuYWdlcik7XHJcbiAgICAgICAgICAgIHRoaXMuQWRkU3RhdGVUcmFuc2Zvcm1hdGlvbk5vZGVDb3JlKHN0YXRlTWFuYWdlciwgc29ydGVkUGFyZW50cywgdGFyZ2V0Tm9kZSwgaXNTZWxlY3QsIGF1dG9SZWZyZXNoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQWRkU3RhdGVUcmFuc2Zvcm1hdGlvbk5vZGVDb3JlKHN0YXRlTWFuYWdlcjogSUZpbHRlclN0YXRlTWFuYWdlcixcclxuICAgICAgICAgICAgc29ydGVkUGFyZW50czogRXh0ZW5kZWRGaWx0ZXJJdGVtW10sXHJcbiAgICAgICAgICAgIHRhcmdldE5vZGU6IEV4dGVuZGVkRmlsdGVySXRlbSxcclxuICAgICAgICAgICAgaXNTZWxlY3Q6IGJvb2xlYW4sXHJcbiAgICAgICAgICAgIGF1dG9SZWZyZXNoOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHN0YXRlTWFuYWdlci5BZGROb2Rlcyhzb3J0ZWRQYXJlbnRzLCB0YXJnZXROb2RlLCBpc1NlbGVjdCwgYXV0b1JlZnJlc2gsIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxFeHRlbmRlZEZpbHRlckl0ZW0+KCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBMb2FkTWlzc2luZ05vZGVzQ291bnQobm9kZXNMYWNraW5nRnVsbENoaWxkcmVuQ291bnQ6IHN0cmluZ1tdLCBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cDogSUNoaWxkcmVuQ291bnRJbmZvTG9va3VwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuQ291bnRMb29rdXAgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnQobmV3IEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXF1ZXN0KHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwsXHJcbiAgICAgICAgICAgICAgICBub2Rlc0xhY2tpbmdGdWxsQ2hpbGRyZW5Db3VudCxcclxuICAgICAgICAgICAgICAgIG5ldyBNZW1iZXJGaWx0ZXIodGhpcy5fdmlldy5TZWFyY2hQYXR0ZXJuLCB0aGlzLl92aWV3Lk1lbWJlckZpbHRlclR5cGUpKSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBjaGlsZHJlbkNvdW50TG9va3VwLkNoaWxkcmVuQ291bnRJbmZvTG9va3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5Db3VudExvb2t1cC5DaGlsZHJlbkNvdW50SW5mb0xvb2t1cC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IGNoaWxkcmVuQ291bnRMb29rdXAuQ2hpbGRyZW5Db3VudEluZm9Mb29rdXBba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cFtrZXldID0gaW5mbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBGaWxsQXZhaWxhYmxlRmlsdGVyUmVzdWx0VG90YWxDb3VudHMobm9kZXM6IElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgIG5vZGVzTGFja2luZ0Z1bGxDaGlsZHJlbkNvdW50OiBJTWVtYmVyTm9kZUxvb2t1cCxcclxuICAgICAgICAgICAgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCxcclxuICAgICAgICAgICAgaGFzTW9yZU1lbWJlcnM6IGJvb2xlYW4pIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91c01lbWJlcjogSU1lbWJlck5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgbGFzdExldmVsTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0QkZTKG5vZGVzLFxyXG4gICAgICAgICAgICAgICAgeCA9PiAkLmlzQXJyYXkoeC5jaGlsZHJlbikgPyB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10gOiBbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuVG90YWxDb3VudDogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXROb2RlID0gY3VycmVudDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5kYXRhLmxldmVsIDwgdGhpcy5fdmlldy5GaWx0ZXJMZXZlbE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblRvdGFsQ291bnQgPSBjdXJyZW50LmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblRvdGFsQ291bnQgPSBjdXJyZW50LmRhdGEuY2hpbGRyZW5Ub3RhbENvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLlVwZGF0ZUNvdW50KHRhcmdldE5vZGUsIGNoaWxkcmVuVG90YWxDb3VudCwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGV2ZWwgPSBjdXJyZW50LmRhdGEubGV2ZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RMZXZlbE51bWJlciAhPT0gbGV2ZWwgJiYgcHJldmlvdXNNZW1iZXIgJiYgaGFzTW9yZU1lbWJlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c01lbWJlci5kYXRhLmxldmVsIDwgdGhpcy5fdmlldy5GaWx0ZXJMZXZlbE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNMYWNraW5nRnVsbENoaWxkcmVuQ291bnRbcHJldmlvdXNNZW1iZXIuaWRdID0gcHJldmlvdXNNZW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLlVwZGF0ZUNvdW50KHByZXZpb3VzTWVtYmVyLCAtMSwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RMZXZlbE51bWJlciA9IGxldmVsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNNZW1iZXIgPSBjdXJyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWhhc01vcmVNZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cFtcIiNcIl0gPSB7IENoaWxkcmVuQ291bnQ6IG5vZGVzLmxlbmd0aCB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFVwZGF0ZUNvdW50KHRhcmdldE5vZGU6IElNZW1iZXJOb2RlLCBjaGlsZHJlblRvdGFsQ291bnQ6IG51bWJlciwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCkge1xyXG4gICAgICAgICAgICB0YXJnZXROb2RlLmRhdGEuZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCA9IGNoaWxkcmVuVG90YWxDb3VudDtcclxuICAgICAgICAgICAgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXBbdGFyZ2V0Tm9kZS5pZF0gPSB7IENoaWxkcmVuQ291bnQ6IGNoaWxkcmVuVG90YWxDb3VudCB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc0xvYWRpbmdXaG9sZVRyZWUoaW52b2tpbmdOb2RlOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuSXNJbkZpbHRlck1vZGUgJiYgdGhpcy5Jc0xvYWRpbmdGaWx0ZXJMZXZlbEVsZW1lbnRzKGludm9raW5nTm9kZSkpIHx8IHRoaXMuX2lzTG9hZGluZ0FsbEVsZW1lbnRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBBc3NpZ25MZXZlbEluZGV4KGludm9raW5nTm9kZTogSU1lbWJlck5vZGUsIGxvYWRlZE5vZGVzOiBJTWVtYmVyTm9kZVtdLCBpc0hpZXJhcmNoaWNhbDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBpZiAoaXNIaWVyYXJjaGljYWwpIHtcclxuICAgICAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPihsb2FkZWROb2RlcyxcclxuICAgICAgICAgICAgICAgICAgICAoeCkgPT4gKHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSksXHJcbiAgICAgICAgICAgICAgICAgICAgKGN1cnJlbnQsIHBhcmVudCwgbGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kYXRhLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxldmVsOiBudW1iZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludm9raW5nTm9kZS5pZCA9PT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvL3Jvb3Qgb3Igc2VhcmNoXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWwgPSBpbnZva2luZ05vZGUuZGF0YS5sZXZlbCArIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsb2FkZWROb2Rlcy5mb3JFYWNoKG4gPT4gbi5kYXRhLmxldmVsID0gbGV2ZWwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgSGFuZGxlQ29uZGl0aW9uYWxTZWxlY3Qobm9kZTogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzU2hvd01vcmVNZW1iZXIobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9hZGluZyBNb3JlIE5vZGVzXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Mb2FkTW9yZU5vZGVzKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTWVyZ2VOZXdOb2Rlc0ludG9FeGlzdGluZ1RyZWUocGFyZW50Tm9kZTogSU1lbWJlck5vZGUsIG5ld05vZGVzOiBJTWVtYmVyTm9kZVtdKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIHZhciBleGlzdGluZ05vZGVzOklNZW1iZXJOb2RlW10gPSBbXTtcclxuICAgICAgICAgICAgcGFyZW50Tm9kZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkSWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuR2V0VHJlZU5vZGUoY2hpbGRJZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuSXNTcGVjaWFsTm9kZShub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nTm9kZXMucHVzaCh0aGlzLl92aWV3LkdldFRyZWVOb2RlQ2xvbmUobm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBleGlzdGluZ05vZGVzTG9va3VwID0gVHJlZUhlbHBlcnMuQ29udmVydExpc3RUb0xvb2t1cDxJTWVtYmVyTm9kZT4oZXhpc3RpbmdOb2RlcyxcclxuICAgICAgICAgICAgICAgIHggPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHguY2hpbGRyZW4pID8gKHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSkgOiBbXTsgLy9mb3IgbGF6eSBsb2FkZWQgZWxlbWVudHMgYWxyZWFkeSBpbiB0cmVlIHdoaWNoIGhhcyBjaGlsZHJlbj10cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LmlkKTtcclxuXHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPihuZXdOb2RlcyxcclxuICAgICAgICAgICAgICAgIHggPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnROb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nTm9kZSA9IGV4aXN0aW5nTm9kZXNMb29rdXAuZ2V0VmFsdWUoY3VycmVudE5vZGUuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RpbmdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUGFyZW50Tm9kZSA9IGV4aXN0aW5nTm9kZXNMb29rdXAuZ2V0VmFsdWUoY3VycmVudE5vZGUuZGF0YS5wYXJlbnRVbmlxdWVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdQYXJlbnROb2RlLmNoaWxkcmVuLnB1c2goY3VycmVudE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdOb2Rlcy5wdXNoKGN1cnJlbnROb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSgpXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZXhpc3RpbmdOb2RlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNTcGVjaWFsTm9kZShub2RlOiBhbnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuSXNTZWxlY3RBbGxNZW1iZXIobm9kZSkgfHwgdGhpcy5Jc1Nob3dNb3JlTWVtYmVyKG5vZGUpIHx8IHRoaXMuSXNTZWxlY3RGaWx0cmVkTWVtYmVyKG5vZGUpIHx8IHRoaXMuSXNEZVNlbGVjdEZpbHRyZWRNZW1iZXIobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBMb2FkTW9yZU5vZGVzKHRhcmdldE5vZGU6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc01heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TaG93TWF4TGltaXRSZWFjaGVkKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nTW9yZUVsZW1lbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLlNob3dOb2RlTG9hZGluZ0luZGljYXRvcih0YXJnZXROb2RlLmlkKTtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50Tm9kZSA9ICB0aGlzLkdldFRyZWVOb2RlKHRhcmdldE5vZGUucGFyZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4ID0gdGFyZ2V0Tm9kZS5kYXRhLm5leHRMb2FkU3RhcnRJbmRleDtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWQgPSAoYXdhaXQgdGhpcy5Mb2FkTm9kZXNGcm9tU2VydmVyQ29yZShwYXJlbnROb2RlLCB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXgpKS5NZW1iZXJzO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlJlbG9hZFRyZWVOb2RlKHBhcmVudE5vZGUsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nTW9yZUVsZW1lbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgU2hvd05vZGVMb2FkaW5nSW5kaWNhdG9yKGlkOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgJGxpRWxlbWVudCA9ICQoIHRoaXMuR2V0VHJlZU5vZGUoaWQsIHRydWUpKTtcclxuICAgICAgICAgICAgJGxpRWxlbWVudC5hZGRDbGFzcyhcImpzdHJlZS1sb2FkaW5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc0xvYWRpbmdGaWx0ZXJMZXZlbEVsZW1lbnRzKHBhcmVudE5vZGU6IElNZW1iZXJOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGxldCBsb2FkZWROb2Rlc0xldmVsSWQgPSAtMTsgLy9yb290O1xyXG4gICAgICAgICAgICBpZiAocGFyZW50Tm9kZS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkZWROb2Rlc0xldmVsSWQgPSBwYXJlbnROb2RlLmRhdGEubGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbG9hZGVkTm9kZXNMZXZlbElkKys7IC8vd2UgYXJlIGFjdHVhbHkgbG9hZGluZyBuZXh0IGxldmVsIG5vdCBwYXJlbnQgbGV2ZWxcclxuICAgICAgICAgICAgaWYgKGxvYWRlZE5vZGVzTGV2ZWxJZCA8PSB0aGlzLkdldExldmVsTnVtYmVyRnJvbVVuaXF1ZU5hbWUodGhpcy5fdmlldy5GaWx0ZXJMZXZlbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlTG9hZE1vcmVOb2RlKHBhcmVudE5vZGU6IElNZW1iZXJOb2RlLCBsb2FkZWRMYXN0TGV2ZWxOb2Rlc05vZGVzOiBJTWVtYmVyTm9kZVtdKTogSU1lbWJlck5vZGUge1xyXG4gICAgICAgICAgICBsZXQgc3RhcnRJbmRleCA9IGxvYWRlZExhc3RMZXZlbE5vZGVzTm9kZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggKz0gcGFyZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4LS07IC8vU2VsZWN0QWxsXHJcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4LS07IC8vU2hvd01vcmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc0luRmlsdGVyTW9kZSAmJiB0aGlzLklzTG9hZGluZ0ZpbHRlckxldmVsRWxlbWVudHMocGFyZW50Tm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlckVsZW1lbnRzTG9hZE1vcmVTdGFydEluZGV4ICs9IGxvYWRlZExhc3RMZXZlbE5vZGVzTm9kZXMubGVuZ3RoOyAvL2hlcmUgdGhlcmUgaXMgbm8gYWRkaXRpb25hbCBleHRlbmRlZCBwYWNrZWQgbm9kZVxyXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleCA9IHRoaXMuX2ZpbHRlckVsZW1lbnRzTG9hZE1vcmVTdGFydEluZGV4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBub2RlOiBJTWVtYmVyTm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHt0aGlzLl9sb2FkTW9yZU5vZGVJZFBhcnR9XyR7dGhpcy5HZXRSYW5kb21JZCgpfWAsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIi4uLlNob3dNb3JlXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNTaG93TW9yZU1lbWJlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRVbmlxdWVOYW1lOiBwYXJlbnROb2RlLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHRMb2FkU3RhcnRJbmRleDogc3RhcnRJbmRleFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVBbGxOb2RlKCk6IElNZW1iZXJOb2RlIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZTogSU1lbWJlck5vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5fc2VsZWN0QWxsTm9kZUlkLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCJBbGxcIixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZVNlbGVjdEFsbEZpbHRyZWROb2RlKCk6IElNZW1iZXJOb2RlIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZTogSU1lbWJlck5vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5fc2VsZWN0QWxsRmlsdHJlZElkLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCJTZWxlY3QgQWxsXCIsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVEZVNlbGVjdEFsbEZpbHRyZWROb2RlKCk6IElNZW1iZXJOb2RlIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZTogSU1lbWJlck5vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5fZGVzZWxlY3RBbGxGaWx0cmVkTm9kZUlkLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCJEZXNlbGVjdCBBbGxcIixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEdldFJhbmRvbUlkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikucmVwbGFjZSgvW15hLXpdKy9nLCBcIlwiKS5zdWJzdHIoMiwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc1Nob3dNb3JlTWVtYmVyKG5vZGVPYmo6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlT2JqLmRhdGEgJiYgbm9kZU9iai5kYXRhLmlzU2hvd01vcmVNZW1iZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzU2VsZWN0QWxsTWVtYmVyKG5vZGVPYmo6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlT2JqLmlkID09PSB0aGlzLl9zZWxlY3RBbGxOb2RlSWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzU2VsZWN0RmlsdHJlZE1lbWJlcihub2RlT2JqOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZU9iai5pZCA9PT0gdGhpcy5fc2VsZWN0QWxsRmlsdHJlZElkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc1ZpcnR1YWxSb290TWVtYmVyKG5vZGVPYmo6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlT2JqLmlkID09PSBcIiNcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNEZVNlbGVjdEZpbHRyZWRNZW1iZXIobm9kZU9iajogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVPYmouaWQgPT09IHRoaXMuX2Rlc2VsZWN0QWxsRmlsdHJlZE5vZGVJZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENyZWF0ZVJlZmVyZW5jZVRyZWUoJGNvbnRhaW5lcjogSlF1ZXJ5LCBkYXRhOiBPYmplY3RbXSkge1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmpzdHJlZShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAncGx1Z2lucyc6IFtcImNvcmVcIiwgXCJjaGVja2JveFwiXSxcclxuICAgICAgICAgICAgICAgICAgICAnY29yZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnY2hlY2tfY2FsbGJhY2snOiAob3BlcmF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0aW9uID09PSBcImNyZWF0ZV9ub2RlXCIgfHwgb3BlcmF0aW9uID09PSBcImRlbGV0ZV9ub2RlXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0pLm9uKFwibG9hZGVkLmpzdHJlZVwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuanN0cmVlKFwib3Blbl9hbGxcIik7XHJcbiAgICAgICAgICAgICAgICB9KS5vbihcInJlYWR5LmpzdHJlZVwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICBkYXRhLmZvckVhY2goeD0+dGhpcy5SZWZlcmVuY2VKc3RyZWVJbnN0YW5jZS5jcmVhdGVfbm9kZShcIiNcIix4KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgU2VhcmNoKCkge1xyXG4gICAgICAgICAgICB0aGlzLkNsZWFyRmlsdGVyKGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5TZWFyY2hDb3JlKHRoaXMuX3ZpZXcuU2VhcmNoUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBTaG93T25seVNlbGVjdGVkKCkge1xyXG4gICAgICAgICAgICB0aGlzLkNsZWFyRmlsdGVyKGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5EaXNwbGF5T25seVNlbGVjdGVkRWxlbWVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNob3dPbmx5RGVTZWxlY3RlZCgpIHtcclxuICAgICAgICAgICAgdGhpcy5DbGVhckZpbHRlcihmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuRGlzcGxheU9ubHlEZXNlbGVjdGVkRWxlbWVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNob3dBbGwoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQ2xlYXJGaWx0ZXIodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgRXhlY3V0ZUNsZWFyRmlsdGVyKCkge1xyXG4gICAgICAgICAgICB0aGlzLkNsZWFyRmlsdGVyKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBTYXZlVHJlZVN0YXRlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jb250cm9sU3RhdGVJbmZvID0gbmV3IENvbnRyb2xTdGF0ZUluZm8odGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRyb2xTdGF0ZUluZm8uU2F2ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9mb3IgbXVsdGlwbGUgc2VxdWVudGlhbCBzZWFyY2hlc1xyXG4gICAgICAgIEVuc3VyZVNhdmVUcmVlU3RhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29udHJvbFN0YXRlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TYXZlVHJlZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlc3RvcmVTdGF0ZSgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jb250cm9sU3RhdGVJbmZvKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRyb2xTdGF0ZUluZm8uUmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUmVzdG9yZVRyZWVTdGF0ZShzYXZlZFN0YXRlOiBJTWVtYmVyTm9kZVtdLCBvblJlYWR5Q2FsbGJhY2s6ICgpID0+IHZvaWQgPSAoKSA9PiB7fSkge1xyXG4gICAgICAgICAgICB0aGlzLl9pc1Jlc3RvcmluZ1RyZWVTdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkID0gc2F2ZWRTdGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5SZWxvYWRUcmVlTm9kZSh0aGlzLkdldFRyZWVOb2RlKFwiI1wiKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29udHJvbFN0YXRlSW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNSZXN0b3JpbmdUcmVlU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBvblJlYWR5Q2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgU2VhcmNoQ29yZShzZWFyY2hQYXR0ZXJuOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgJChcIiNyZXZlcnRTZWxlY3Rpb25cIikuYXR0cihcImRpc2FibGVkXCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5Jc0luU3RhdHVzRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLklzSW5TZWFyY2hGaWx0ZXJNb2RlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5GaWx0ZXJDb3JlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEZpbHRlckNvcmUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciA9dGhpcy5fc3RhdGVNYW5hZ2VyRmFjdG9yeS5DcmVhdGUodGhpcy5fc3RhdGVNYW5hZ2VyLkdldFJvb3RUeXBlKCksIC0xLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5FbnN1cmVTYXZlVHJlZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuTG9hZGVkRWxlbWVudHNDb3VudD0wO1xyXG4gICAgICAgICAgICB0aGlzLlNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlJlbG9hZFRyZWVOb2RlKHRoaXMuR2V0VHJlZU5vZGUoXCIjXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENsZWFyRmlsdGVyKHJlbG9hZFRyZWU9dHJ1ZSwgY2xlYXJTZWFyY2hQYXR0ZXJuPWZhbHNlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ0xFQVIgU0VBUkNIOlwiKTtcclxuICAgICAgICAgICAgdGhpcy5NZXJnZVN0YXRlcygpO1xyXG4gICAgICAgICAgICB0aGlzLkNsZWFyU2VhcmNoSGlnaGxpZ2h0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuSXNJblNlYXJjaEZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5Jc0luU3RhdHVzRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzV2l0aG91dEZ1bGxDaGlsZHJlbkNvdW50TG9va3VwID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWROb2RlVW5pcWVOYW1lID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjbGVhclNlYXJjaFBhdHRlcm4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXcuQ2xlYXJTZWFyY2hUZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlbG9hZFRyZWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuUmVzdG9yZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChcIiNyZXZlcnRTZWxlY3Rpb25cIikucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgQ2xlYXJTZWFyY2hIaWdobGlnaHQoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LkNsZWFyU2VhcmNoSGlnaGxpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBFeHBhbmROb2Rlc1RvVGFyZ2V0TGV2ZWwobG9hZGVkTm9kZXM6IElNZW1iZXJOb2RlW10sIHRhcmdldExldmVsOiBudW1iZXIsIGV4cGFuZEFsbDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4obG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4gKHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSksXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZTogSUpzVHJlZU5vZGVTdGF0ZSA9IGN1cnJlbnQuc3RhdGUgfHwgKGN1cnJlbnQuc3RhdGUgPSB7fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldmVsIDwgdGFyZ2V0TGV2ZWwgfHwgZXhwYW5kQWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm9wZW5lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgYXN5bmMgSGFuZGxlU2VsZWN0aW9uQ2hhbmdlZChkYXRhOiB7YWN0aW9uOnN0cmluZyxub2RlOklNZW1iZXJOb2RlfSkge1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZU1hbmFnZXIgPSB0aGlzLkdldEN1cnJlbnRNb2RlU3RhdGVNYW5hZ2VyKCk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PT0gXCJzZWxlY3Rfbm9kZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGlja2VkTm9kZTogSU1lbWJlck5vZGUgPSBkYXRhLm5vZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlSWQgPSBjbGlja2VkTm9kZS5pZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZHJ3ZWROb2RlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0TGV2ZWxFbGVtZW50cyA9IG5ldyBBZmZlY3RlZE5vZGVzU2V0KCkuQWRkKHRhcmdldE5vZGVJZCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhZmZlY3RlZE5vZGVzID0gbmV3IEFmZmVjdGVkTm9kZXNTZXQoKS5BZGQodGhpcy5fc2VsZWN0QWxsTm9kZUlkKTtcclxuICAgICAgICAgICAgICAgIGxldCBmdWxsUmVkcmF3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Tm9kZUlkID09PSB0aGlzLl9zZWxlY3RBbGxOb2RlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25Nb2RlID0gc3RhdGVNYW5hZ2VyLkdldEFsbE5vZGVTZWxlY3Rpb25TdGF0dXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdCA9IHRoaXMuR2V0U2VsZWN0aW9uTW9kZUZyb21DbGljayhzZWxlY3Rpb25Nb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKHN0YXRlTWFuYWdlci5SZXNldChpc1NlbGVjdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxSZWRyYXcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0YXJnZXROb2RlSWQgPT09IHRoaXMuX3NlbGVjdEFsbEZpbHRyZWRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLklzSW5TZWFyY2hGaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24oYXdhaXQgdGhpcy5BcHBseVNlcnZlclNlbGVjaW9uRm9yU2VhcmNoRmlsdGVyKHRydWUsIHRhcmdldExldmVsRWxlbWVudHMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuSXNJblN0YXR1c0ZpbHRlck1vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWROb2Rlcy5Vbmlvbihhd2FpdCB0aGlzLkFwcGx5U2VydmVyU2VsZWNpb25Gb3JTdGF0dXNGaWx0ZXIodHJ1ZSwgdGFyZ2V0TGV2ZWxFbGVtZW50cykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxSZWRyYXcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0YXJnZXROb2RlSWQgPT09IHRoaXMuX2Rlc2VsZWN0QWxsRmlsdHJlZE5vZGVJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLklzSW5TZWFyY2hGaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24oYXdhaXQgdGhpcy5BcHBseVNlcnZlclNlbGVjaW9uRm9yU2VhcmNoRmlsdGVyKGZhbHNlLCB0YXJnZXRMZXZlbEVsZW1lbnRzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLklzSW5TdGF0dXNGaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24oYXdhaXQgdGhpcy5BcHBseVNlcnZlclNlbGVjaW9uRm9yU3RhdHVzRmlsdGVyKGZhbHNlLCB0YXJnZXRMZXZlbEVsZW1lbnRzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzdGF0ZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbFJlZHJhdyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbk1vZGUgPSBzdGF0ZU1hbmFnZXIuR2V0U2VsZWN0aW9uU3RhdHVzKGNsaWNrZWROb2RlLnBhcmVudHMsIHRhcmdldE5vZGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3QgPSB0aGlzLkdldFNlbGVjdGlvbk1vZGVGcm9tQ2xpY2soc2VsZWN0aW9uTW9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWROb2Rlcy5Vbmlvbih0aGlzLkFkZFVzZXJDaGFuZ2VkTm9kZVRvU3RhdGUoY2xpY2tlZE5vZGUsIGlzU2VsZWN0KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5SZWRyYXdBZmZlY3RlZE5vZGVzKGFmZmVjdGVkTm9kZXMsIHRhcmdldExldmVsRWxlbWVudHMsIGZ1bGxSZWRyYXcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Mb2coc3RhdGVNYW5hZ2VyLCBhZmZlY3RlZE5vZGVzLlRvQXJyYXkoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0Q3VycmVudE1vZGVTdGF0ZU1hbmFnZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLklzSW5GaWx0ZXJNb2RlID8gdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyIDogdGhpcy5fc3RhdGVNYW5hZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRTZWxlY3Rpb25Nb2RlRnJvbUNsaWNrKHNlbGVjdGlvbk1vZGU6IFNlbGVjdGlvbk1vZGUpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZCB8fCBzZWxlY3Rpb25Nb2RlID09PSBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIFJlZHJhd0FmZmVjdGVkTm9kZXMoYWZmZWN0ZWROb2RlczogQWZmZWN0ZWROb2Rlc1NldCwgdGFyZ2V0TGV2ZWxFbGVtZW50czogQWZmZWN0ZWROb2Rlc1NldCwgZnVsbFJlZHJhdzogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBpZiAoZnVsbFJlZHJhdykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmlldy5SZWRyYXdOb2RlKHRoaXMuR2V0VHJlZU5vZGUoXCIjXCIpLHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuRm9yRWFjaCgoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpZCAhPT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVlcERvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0TGV2ZWxFbGVtZW50cy5Db250YWlucyhpZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVlcERvd24gPSB0cnVlOyAvL3dlIHdhbnQgZnVsbCByZWZyZXNoIGRvd24gYmVjYXVzZSBub3QgYWxsIG5vZGVzIGV4aXN0IGluIHN0YXRlIFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlOiBJTWVtYmVyTm9kZSA9IHRoaXMuR2V0VHJlZU5vZGUoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVkcmF3Tm9kZShub2RlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWVwRG93bikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbl9kLmZvckVhY2goY2hpbGRJZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLkdldFRyZWVOb2RlKGNoaWxkSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92aWV3LlJlZHJhd05vZGUoY2hpbGQsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIExvZyhzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIsIGFmZmVjdGVkTm9kZXM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQUZGRUNURUQgTk9ERVNcIiwgYWZmZWN0ZWROb2Rlcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUkVEUkFXRUQgTk9ERVNcIiwgdGhpcy5fcmVkcndlZE5vZGVzKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTVEFURVwiLCBzdGF0ZU1hbmFnZXIuR2V0U3RhdGUoKSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0YXRlTWFuYWdlci5QcmludCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEFkZFVzZXJDaGFuZ2VkTm9kZVRvU3RhdGUobm9kZTogSU1lbWJlck5vZGUsIGlzU2VsZWN0OiBib29sZWFuKTogQWZmZWN0ZWROb2Rlc1NldCB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlTWFuYWdlciA9IHRoaXMuR2V0Q3VycmVudE1vZGVTdGF0ZU1hbmFnZXIoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNTcGVjaWFsTm9kZShub2RlKSkgcmV0dXJuIEFmZmVjdGVkTm9kZXNTZXQuRW1wdHk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRlZFBhcmVudHM6IEV4dGVuZGVkRmlsdGVySXRlbVtdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5wYXJlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnROb2RlSWQgPSBub2RlLnBhcmVudHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50Tm9kZUlkICE9PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLkdldFRyZWVOb2RlKHBhcmVudE5vZGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVySXRlbSA9IHRoaXMuQ3JlYXRlRmlsdGVySXRlbUZyb21Ob2RlKHBhcmVudE5vZGUsIHN0YXRlTWFuYWdlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGVkUGFyZW50cy5wdXNoKGZpbHRlckl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEZpbHRlck5vZGUgPSB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShub2RlLCBzdGF0ZU1hbmFnZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGVNYW5hZ2VyLkFkZE5vZGVzKHNvcnRlZFBhcmVudHMsIHRhcmdldEZpbHRlck5vZGUsIGlzU2VsZWN0LCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlRmlsdGVySXRlbUZyb21Ob2RlKG5vZGU6IElNZW1iZXJOb2RlLCBzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIpOiBFeHRlbmRlZEZpbHRlckl0ZW0ge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGRyZW5Db3VudCA9IC0xO1xyXG4gICAgICAgICAgICBsZXQgZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCA9IC0xO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50VW5pcXVlTmFtZTogc3RyaW5nID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IGxldmVsID0gLTE7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmlkID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5Db3VudCA9IHRoaXMuX21ldGFkYXRhLlJvb3RNZW1iZXJzVG90YWxDb3VudDtcclxuICAgICAgICAgICAgICAgIGZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSAtMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudFVuaXF1ZU5hbWUgPSBub2RlLmRhdGEucGFyZW50VW5pcXVlTmFtZSB8fCBcIiNcIjtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuQ291bnQgPSBub2RlLmRhdGEuY2hpbGRyZW5Ub3RhbENvdW50O1xyXG4gICAgICAgICAgICAgICAgZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudCA9IG5vZGUuZGF0YS5maWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50O1xyXG4gICAgICAgICAgICAgICAgbGV2ZWwgPSBub2RlLmRhdGEubGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlTWFuYWdlci5DcmVhdGVJdGVtKG5vZGUuaWQsIHBhcmVudFVuaXF1ZU5hbWUsIGNoaWxkcmVuQ291bnQsIGZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQsIGxldmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEhhbmRsZVRyZWVSZWRyYXdOb2RlKGU6IElKc3RyZWVSZWRyYXdOb2RlQXJnczxhbnksIGFueT4pIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnROb2RlOiBJTWVtYmVyTm9kZSA9IGUuQ3VycmVudE5vZGVPYmo7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzVmlydHVhbFJvb3RNZW1iZXIoY3VycmVudE5vZGUpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZU1hbmFnZXIgPSB0aGlzLkdldEN1cnJlbnRNb2RlU3RhdGVNYW5hZ2VyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZHJ3ZWROb2Rlcy5wdXNoKGN1cnJlbnROb2RlLmlkKTtcclxuICAgICAgICAgICAgY29uc3QgJGxpRWxlbWVudCA9ICQoZS5DdXJyZW50Tm9kZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICBjb25zdCAkYW5jaG9yID0gJGxpRWxlbWVudC5jaGlsZHJlbihcIi5qc3RyZWUtYW5jaG9yXCIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc1Nob3dNb3JlTWVtYmVyKGN1cnJlbnROb2RlKSB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5Jc1NlbGVjdEZpbHRyZWRNZW1iZXIoZS5DdXJyZW50Tm9kZU9iaikgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuSXNEZVNlbGVjdEZpbHRyZWRNZW1iZXIoZS5DdXJyZW50Tm9kZU9iaikpIHtcclxuICAgICAgICAgICAgICAgICRhbmNob3IuY2hpbGRyZW4oXCIuanN0cmVlLWNoZWNrYm94XCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJGFuY2hvci5jaGlsZHJlbihcIi5qc3RyZWUtdGhlbWVpY29uXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3Rpb25Nb2RlOiBTZWxlY3Rpb25Nb2RlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuSXNJbkZpbHRlck1vZGUgJiYgdGhpcy5fbm9kZXNXaXRob3V0RnVsbENoaWxkcmVuQ291bnRMb29rdXBbZS5DdXJyZW50Tm9kZU9iai5pZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAkYW5jaG9yLmFkZENsYXNzKFwiY29tYXJjaC1kaXNhYmxlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25Nb2RlID0gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLklzU2VsZWN0QWxsTWVtYmVyKGUuQ3VycmVudE5vZGVPYmopKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbk1vZGUgPSBzdGF0ZU1hbmFnZXIuR2V0QWxsTm9kZVNlbGVjdGlvblN0YXR1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbk1vZGUgPSBzdGF0ZU1hbmFnZXIuR2V0U2VsZWN0aW9uU3RhdHVzKGUuQ3VycmVudE5vZGVPYmoucGFyZW50cywgZS5DdXJyZW50Tm9kZU9iai5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0ICRjaGVja2JveEVsZW1lbnQgPSAkKFwiPGk+XCIpLmFkZENsYXNzKFwianN0cmVlLWljb24ganN0cmVlLWNoZWNrYm94XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuVW5kZXRlcm1pbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNoZWNrYm94RWxlbWVudC5hZGRDbGFzcyhcImpzdHJlZS1jb21hcmNoLXVuZGV0ZXJtaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5TZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRjaGVja2JveEVsZW1lbnQuYWRkQ2xhc3MoXCJqc3RyZWUtY29tYXJjaC1zZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNoZWNrYm94RWxlbWVudC5hZGRDbGFzcyhcImpzdHJlZS1jb21hcmNoLWRlc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSAmJiBjdXJyZW50Tm9kZS5kYXRhICYmIGN1cnJlbnROb2RlLmRhdGEubGV2ZWwgPT09IHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWxOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dCA9ICRhbmNob3IudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWFyY2hQYXR0ZXJuID0gdGhpcy5fdmlldy5TZWFyY2hQYXR0ZXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0ZXh0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hQYXR0ZXJuLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJlZml4ID0gdGV4dC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VhcmNoQ29udGVudCA9IHRleHQuc3Vic3RyaW5nKGluZGV4LCBpbmRleCArIHNlYXJjaFBhdHRlcm4ubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvc3RmaXggPSB0ZXh0LnN1YnN0cmluZyhpbmRleCArIHNlYXJjaFBhdHRlcm4ubGVuZ3RoLCB0ZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuUmVtb3ZlT25seVRleHRIYWNrKCRhbmNob3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5jaG9yLmFwcGVuZChwcmVmaXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5jaG9yLmFwcGVuZCgkKFwiPHNwYW4+XCIpLnRleHQoc2VhcmNoQ29udGVudCkuYWRkQ2xhc3MoXCJjb21hcmNoLXNlYXJjaC1oaWdobGlnaHRcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5jaG9yLmFwcGVuZChwb3N0Zml4KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJGNoZWNrYm94RWxlbWVudC5wcmVwZW5kVG8oJGFuY2hvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgUmVtb3ZlT25seVRleHRIYWNrKCRhbmNob3I6IEpRdWVyeSkge1xyXG4gICAgICAgICAgICAkYW5jaG9yLmNvbnRlbnRzKCkuZmlsdGVyKGZ1bmN0aW9uKCkge1xyXG4vLyBSZVNoYXJwZXIgZGlzYWJsZSBvbmNlIFN1c3BpY2lvdXNUaGlzVXNhZ2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGVUeXBlID09PSAzO1xyXG4gICAgICAgICAgICB9KS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEFwcGx5U2VydmVyU2VsZWNpb25Gb3JTZWFyY2hGaWx0ZXIoaXNTZWxlY3Q6IGJvb2xlYW4sIHRhcmdldExldmVsRWxlbWVudHM6IEFmZmVjdGVkTm9kZXNTZXQpOiBQcm9taXNlPEFmZmVjdGVkTm9kZXNTZXQ+IHtcclxuICAgICAgICAgICAgdGhpcy5TaG93QWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZW1iZXJzKG5ldyBNZW1iZXJzUmVxdWVzdCh0aGlzLl92aWV3LkZpbHRlckxldmVsLFxyXG4gICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgIHRoaXMuX21ldGFkYXRhLkFsbExldmVsc01lbWJlcnNUb3RhbENvdW50ICsgMSxcclxuICAgICAgICAgICAgICAgIG5ldyBNZW1iZXJGaWx0ZXIodGhpcy5fdmlldy5TZWFyY2hQYXR0ZXJuLCB0aGlzLl92aWV3Lk1lbWJlckZpbHRlclR5cGUpKSkpLkZpbHRlckluZm87XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5Qcm9jZXNzU2VydmVyTG9hZGVkU2VsZWN0aW9uKHJlc3BvbnNlLCBpc1NlbGVjdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBBcHBseVNlcnZlclNlbGVjaW9uRm9yU3RhdHVzRmlsdGVyKGlzU2VsZWN0OiBib29sZWFuLCB0YXJnZXRMZXZlbEVsZW1lbnRzOiBBZmZlY3RlZE5vZGVzU2V0KTogUHJvbWlzZTxBZmZlY3RlZE5vZGVzU2V0PiB7XHJcbiAgICAgICAgICAgIHRoaXMuU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0TWVtYmVyc0J5U3RhdHVzKFxyXG4gICAgICAgICAgICAgICAgbmV3IEdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3QodGhpcy5fdmlldy5GaWx0ZXJMZXZlbCxcclxuICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21ldGFkYXRhLkFsbExldmVsc01lbWJlcnNUb3RhbENvdW50ICsgMSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdHVzRmlsdGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlci5TZXJpYWxpemUoKSksXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIpKS5GaWx0ZXJJbmZvO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUHJvY2Vzc1NlcnZlckxvYWRlZFNlbGVjdGlvbihyZXNwb25zZSwgaXNTZWxlY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBQcm9jZXNzU2VydmVyTG9hZGVkU2VsZWN0aW9uKHJlc3BvbnNlOiBJRmlsdGVySW5mbywgaXNTZWxlY3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgY29uc3QgYWZmZWN0ZWROb2RlcyA9IG5ldyBBZmZlY3RlZE5vZGVzU2V0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gTWVtYmVyTm9kZXNIZWxwZXIuSGllcmFyY2hpemVOb2RlcyhyZXNwb25zZS5MYXN0TGV2ZWxOb2RlcywgcmVzcG9uc2UuUGFyZW50c0xvb2t1cCk7XHJcbiAgICAgICAgICAgIHRoaXMuQXNzaWduTGV2ZWxJbmRleChudWxsLCBub2RlcywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPihub2RlcyxcclxuICAgICAgICAgICAgICAgICh4KSA9PiAoeC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdKSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsLCBpbmRleCwgcGF0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRzID0gcGF0aDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGV2ZWwgPT09IHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWxOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWROb2Rlcy5Vbmlvbih0aGlzLl9zdGF0ZU1hbmFnZXIuQWRkTm9kZXMocGFyZW50cy5tYXAoeCA9PiB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZSh4LCB0aGlzLl9zdGF0ZU1hbmFnZXIpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuQ3JlYXRlRmlsdGVySXRlbUZyb21Ob2RlKGN1cnJlbnQsIHRoaXMuX3N0YXRlTWFuYWdlciksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PEV4dGVuZGVkRmlsdGVySXRlbT4oKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkoKSxcclxuICAgICAgICAgICAgICAgIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuUmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIuUmVzZXQoaXNTZWxlY3QpO1xyXG4gICAgICAgICAgICB0aGlzLkhpZGVBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgICAgICByZXR1cm4gYWZmZWN0ZWROb2RlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEV4cGFuZEFsbCgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPbkxvYWRBbGxcIik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLlRvdGFsRWxlbWVudHNDb3VudCA8PSB0aGlzLl9vcHRpb25zLk1heFRvdGFsRWxlbWVudHNDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IHRoaXMuU2hvd0xvYWRBbGxVc2VyQ29uZmlybWF0aW9uKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkxvYWRBbGxDb3JlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5TaG93Rmlyc3RORWxlbWVudHNDb25maXJtYXRpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9hZEFsbENvcmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgTG9hZEFsbENvcmUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzSW5GaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNsZWFyRmlsdGVyKGZhbHNlLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLlNhdmVUcmVlU3RhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5Mb2FkZWRFbGVtZW50c0NvdW50PTA7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZ0FsbEVsZW1lbnRzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5TaG93QWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5SZWxvYWRUcmVlTm9kZSh0aGlzLkdldFRyZWVOb2RlKFwiI1wiKSwgKCkgPT4geyB0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cyA9IGZhbHNlOyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIFNob3dMb2FkQWxsVXNlckNvbmZpcm1hdGlvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICByZXR1cm4gdGhpcy5fdmlldy5TaG93TG9hZEFsbFVzZXJDb25maXJtYXRpb24odGhpcy5Ub3RhbEVsZW1lbnRzQ291bnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgU2hvd0ZpcnN0TkVsZW1lbnRzQ29uZmlybWF0aW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgIHJldHVybiB0aGlzLl92aWV3LlNob3dGaXJzdE5FbGVtZW50c0NvbmZpcm1hdGlvbih0aGlzLlRvdGFsRWxlbWVudHNDb3VudCwgdGhpcy5fb3B0aW9ucy5NYXhUb3RhbEVsZW1lbnRzQ291bnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBTaG93TWF4TGltaXRSZWFjaGVkKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlNob3dNYXhMaW1pdFJlYWNoZWQodGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFNob3dOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuU2hvd05vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIEhpZGVOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuSGlkZU5vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5VcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQodGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIEdldExldmVsTnVtYmVyRnJvbVVuaXF1ZU5hbWUodW5pcXVlTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXRhZGF0YS5Tb3J0ZWRMZXZlbHMubWFwKHggPT4geC5VbmlxdWVOYW1lKS5pbmRleE9mKHVuaXF1ZU5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBTaG93QWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEhpZGVBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5IaWRlQWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEhhbmRsZU5vZGVMb2FkZWQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuSGlkZUFsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIYW5kbGVUcmVlUmVhZHkoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuU2lnbmFsVHJlZVJlYWR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgR2V0SnN0cmVlTm9kZXNGcm9tQnlJZChwYXJlbnRJZDogc3RyaW5nKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkdldFRyZWVOb2RlKHBhcmVudElkKS5jaGlsZHJlbi5tYXAoaWQgPT4gdGhpcy5HZXRUcmVlTm9kZShpZCkpLmZpbHRlcih4ID0+ICF0aGlzLklzU2VsZWN0QWxsTWVtYmVyKHgpICYmICF0aGlzLklzU2hvd01vcmVNZW1iZXIoeCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBSZXNldCgpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5SZXNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLlJlc2V0SW50ZXJuYWxTdGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLkRlc3Ryb3lUcmVlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIERlc3Ryb3lUcmVlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LkRlc3Ryb3lUcmVlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBDb25uZWN0KGNvbm5lY3Rpb25TdHJpbmc6IHN0cmluZywgZmllbGRVbmlxdWVOYW1lOiBzdHJpbmcsIHNhdmVkU3RhdGU6IElGaWx0ZXJJdGVtKSB7XHJcbiAgICAgICAgICAgIHRoaXMuUmVzZXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUmVmcmVzaFRyZWUoY29ubmVjdGlvblN0cmluZywgZmllbGRVbmlxdWVOYW1lLCBzYXZlZFN0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBHZXRTdGF0ZSgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3N0YXRlTWFuYWdlci5HZXRBbGxOb2RlU2VsZWN0aW9uU3RhdHVzKCkgPT09IFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlTWFuYWdlci5TZXJpYWxpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE1lcmdlU3RhdGVzKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuSXNJbkZpbHRlck1vZGUpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5NZXJnZVN0YXRlQ29yZSh0aGlzLkdldEpzdHJlZU5vZGVzRnJvbUJ5SWQoXCIjXCIpLCB0aGlzLl92aWV3LkZpbHRlckxldmVsTnVtYmVyLCBbXSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBNZXJnZVN0YXRlQ29yZShzdGFydE5vZGVzOiBJTWVtYmVyTm9kZVtdLCB0YXJnZXRMZXZlbDogbnVtYmVyLCBleHRlbmFsUGFyZW50czogSU1lbWJlck5vZGVbXSkge1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4oc3RhcnROb2RlcyxcclxuICAgICAgICAgICAgICAgIHggPT4gdGhpcy5HZXRKc3RyZWVOb2Rlc0Zyb21CeUlkKHguaWQpLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQsIHBhcmVudCwgbGV2ZWwsIGluZGV4LCBwYXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLklzU3BlY2lhbE5vZGUoY3VycmVudCkgJiYgY3VycmVudC5kYXRhLmxldmVsID09PSB0YXJnZXRMZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRzID0gZXh0ZW5hbFBhcmVudHMuY29uY2F0KHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25Nb2RlID0gdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyLkdldFNlbGVjdGlvblN0YXR1cyhwYXJlbnRzLm1hcCh4ID0+IHguaWQpLCBjdXJyZW50LmlkLCBuZXcgQmFja3dhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PHN0cmluZz4oKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc2VsZWN0aW9uTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLlNpbXVsYXRlU2VsZWN0aW9uQ2hhbmdlKHBhcmVudHMsIGN1cnJlbnQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5TaW11bGF0ZVNlbGVjdGlvbkNoYW5nZShwYXJlbnRzLCBjdXJyZW50LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudC5zdGF0ZS5sb2FkZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBsZWFmIGlzIHVuZGV0ZXJtaW5lZCBhbmQgbm90IGxvYWRlZCBpdCBtZWFucyB0aGF0IHRoZXJlIGlzIHNlbGVjdGlvbiBvbiBsb3dlciBsZXZlbHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhpcyBpcyBvbmx5IHVzZXIgdmlzaWJsZSBzdGF0ZSB3aGljaCBtZWFucyB0aGF0IHVzZXIgZG9lcyBub3QgZXhwYW5kICxsb2FkIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBtb2RpZnkgc2VsZWN0aW9uIGluIHRoaXMgYnJhbmNoIHNvIHdlIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuTWVyZ2VTdGF0ZUNvcmUodGhpcy5HZXRKc3RyZWVOb2Rlc0Zyb21CeUlkKGN1cnJlbnQuaWQpLCBjdXJyZW50LmRhdGEubGV2ZWwgKyAxLCBwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxJTWVtYmVyTm9kZT4oKSxcclxuICAgICAgICAgICAgICAgIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyLlJlZnJlc2goKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNUcmVlTGVhZihjdXJyZW50OiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudC5jaGlsZHJlbi5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFNpbXVsYXRlU2VsZWN0aW9uQ2hhbmdlKHBhcmVudHM6IElNZW1iZXJOb2RlW10sIGN1cnJlbnQ6IElNZW1iZXJOb2RlLCBpc1NlbGVjdDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuQWRkTm9kZXMocGFyZW50cy5tYXAoeCA9PiB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZSh4LCB0aGlzLl9zdGF0ZU1hbmFnZXIpKSxcclxuICAgICAgICAgICAgICAgIHRoaXMuQ3JlYXRlRmlsdGVySXRlbUZyb21Ob2RlKGN1cnJlbnQsIHRoaXMuX3N0YXRlTWFuYWdlciksXHJcbiAgICAgICAgICAgICAgICBpc1NlbGVjdCxcclxuICAgICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PEV4dGVuZGVkRmlsdGVySXRlbT4oKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzU3RhdGVMZWFmKGN1cnJlbnQ6IElGaWx0ZXJJdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhY3VycmVudC5DaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgUmV2ZXJ0U2VsZWN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZU1hbmFnZXIgPSB0aGlzLkdldEN1cnJlbnRNb2RlU3RhdGVNYW5hZ2VyKCk7XHJcbiAgICAgICAgICAgIHN0YXRlTWFuYWdlci5SZXZlcnRTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5SZWRyYXdOb2RlKFwiI1wiLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgRGlzcGxheU9ubHlTZWxlY3RlZEVsZW1lbnRzKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9uRGlzcGxheU9ubHlTZWxlY3RlZEVsZW1lbnRzXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdHVzRmlsdGVyID0gRmlsdGVySXRlbVN0YXRlLkNoZWNrZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuRGlzcGxheU9ubHlFbGVtZW50c0NvcmUoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIERpc2FibGVTZWFyY2hCb3goKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuRGlzYWJsZVNlYXJjaEJveCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBFbmFibGVTZWFyY2hCb3goKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuRW5hYmxlU2VhcmNoQm94KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIERpc3BsYXlPbmx5RGVzZWxlY3RlZEVsZW1lbnRzKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9uRGlzcGxheU9ubHlEZXNlbGVjdGVkRWxlbWVudHNcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0dXNGaWx0ZXIgPSBGaWx0ZXJJdGVtU3RhdGUuVW5jaGVja2VkO1xyXG4gICAgICAgICAgICB0aGlzLkRpc3BsYXlPbmx5RWxlbWVudHNDb3JlKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEaXNwbGF5T25seUVsZW1lbnRzQ29yZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLklzSW5TdGF0dXNGaWx0ZXJNb2RlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5GaWx0ZXJDb3JlKCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBHZXRSZXNvdXJjZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5PcHRpb25zLlJlc291cmNlc1trZXldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQ29sbGFwc2VBbGwoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuQ29sbGFwc2VBbGwoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldFRyZWVOb2RlKGlkOmFueSxhc0RvbT86Ym9vbGVhbikgeyByZXR1cm4gdGhpcy5fdmlldy5HZXRUcmVlTm9kZShpZCxhc0RvbSk7IH1cclxuICAgIH1cclxuXHJcbn0iXX0=