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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyQ29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZpbHRlckNvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxPQUFPLENBcXZDaEI7QUFydkNELFdBQVUsT0FBTztJQUFDLElBQUEsUUFBUSxDQXF2Q3pCO0lBcnZDaUIsV0FBQSxRQUFRO1FBQUMsSUFBQSxtQkFBbUIsQ0FxdkM3QztRQXJ2QzBCLFdBQUEsbUJBQW1CO1lBRzFDLElBQU8sa0JBQWtCLEdBQUcsb0JBQUEsd0JBQXdCLENBQUMsa0JBQWtCLENBQUM7WUFFeEUsSUFBTyxpQkFBaUIsR0FBRyxvQkFBQSxNQUFNLENBQUMsaUJBQWlCLENBQUM7WUFDcEQsSUFBTyxnQkFBZ0IsR0FBRyxvQkFBQSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFFbEQsSUFBTyxXQUFXLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUNqRCxJQUFPLG1DQUFtQyxHQUFHLFFBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQztZQUVqRyxJQUFPLGVBQWUsR0FBRyxvQkFBQSxNQUFNLENBQUMsZUFBZSxDQUFDO1lBRWhELElBQU8sY0FBYyxHQUFHLG9CQUFBLE1BQU0sQ0FBQyxjQUFjLENBQUM7WUFDOUMsSUFBTyxrQkFBa0IsR0FBRyxvQkFBQSxNQUFNLENBQUMsa0JBQWtCLENBQUM7WUFDdEQsSUFBTyxlQUFlLEdBQUcsb0JBQUEsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUNoRCxJQUFPLFlBQVksR0FBRyxvQkFBQSxNQUFNLENBQUMsWUFBWSxDQUFDO1lBRTFDLElBQU8sbUNBQW1DLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDO1lBRTVHLElBQU8sb0NBQW9DLEdBQUcsUUFBQSxLQUFLLENBQUMsU0FBUyxDQUFDLG9DQUFvQyxDQUFDO1lBQ25HLElBQU8sZUFBZSxHQUFHLG1CQUFtQixDQUFDLE1BQU0s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LENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBRUQsV0FBVyxDQUFDLEVBQU0sRUFBQyxLQUFjLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEY7WUEzc0NZLGlDQUFhLGdCQTJzQ3pCLENBQUE7UUFFTCxDQUFDLEVBcnZDMEIsbUJBQW1CLEdBQW5CLDRCQUFtQixLQUFuQiw0QkFBbUIsUUFxdkM3QztJQUFELENBQUMsRUFydkNpQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQXF2Q3pCO0FBQUQsQ0FBQyxFQXJ2Q1MsT0FBTyxLQUFQLE9BQU8sUUFxdkNoQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUge1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlID0gQ29tbW9uLklNZW1iZXJOb2RlO1xyXG4gICAgaW1wb3J0IElKc3RyZWVSZWRyYXdOb2RlQXJncyA9IENvbW1vbi5JSnN0cmVlUmVkcmF3Tm9kZUFyZ3M7XHJcbiAgICBpbXBvcnQgRmlsdGVyU3RhdGVNYW5hZ2VyID0gRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgIGltcG9ydCBFeHRlbmRlZEZpbHRlckl0ZW0gPSBGaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuRXh0ZW5kZWRGaWx0ZXJJdGVtO1xyXG4gICAgaW1wb3J0IE1lbWJlck5vZGVzSGVscGVyID0gQ29tbW9uLk1lbWJlck5vZGVzSGVscGVyO1xyXG4gICAgaW1wb3J0IEFmZmVjdGVkTm9kZXNTZXQgPSBDb21tb24uQWZmZWN0ZWROb2Rlc1NldDtcclxuICAgIGltcG9ydCBJSnNUcmVlTm9kZVN0YXRlID0gQ29tbW9uLklKc1RyZWVOb2RlU3RhdGU7XHJcbiAgICBpbXBvcnQgVHJlZUhlbHBlcnMgPSBVdGlscy5UcmVlVXRpbHMuVHJlZUhlbHBlcnM7XHJcbiAgICBpbXBvcnQgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkgPSBVdGlscy5UcmVlVXRpbHMuRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk7XHJcbiAgICBpbXBvcnQgRmlsdGVyTWV0YWRhdGEgPSBDb21tb24uRmlsdGVyTWV0YWRhdGE7XHJcbiAgICBpbXBvcnQgTWV0YWRhdGFSZXF1ZXN0ID0gQ29tbW9uLk1ldGFkYXRhUmVxdWVzdDtcclxuICAgIGltcG9ydCBJRmlsdGVySW5mbyA9IENvbW1vbi5JRmlsdGVySW5mbztcclxuICAgIGltcG9ydCBNZW1iZXJzUmVxdWVzdCA9IENvbW1vbi5NZW1iZXJzUmVxdWVzdDtcclxuICAgIGltcG9ydCBMZWFmTWVtYmVyc1JlcXVlc3QgPSBDb21tb24uTGVhZk1lbWJlcnNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IENoaWxkcmVuUmVxdWVzdCA9IENvbW1vbi5DaGlsZHJlblJlcXVlc3Q7XHJcbiAgICBpbXBvcnQgTWVtYmVyRmlsdGVyID0gQ29tbW9uLk1lbWJlckZpbHRlcjtcclxuICAgIGltcG9ydCBJRmlsdGVyQ29udHJvbFNlcnZpY2UgPSBDb21tb24uSUZpbHRlckNvbnRyb2xTZXJ2aWNlO1xyXG4gICAgaW1wb3J0IEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXF1ZXN0ID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlcXVlc3Q7XHJcbiAgICBpbXBvcnQgSUNoaWxkcmVuQ291bnRJbmZvTG9va3VwID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSUNoaWxkcmVuQ291bnRJbmZvTG9va3VwO1xyXG4gICAgaW1wb3J0IEJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSA9IFV0aWxzLlRyZWVVdGlscy5CYWNrd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk7XHJcbiAgICBpbXBvcnQgRmlsdGVySXRlbVN0YXRlID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uRmlsdGVySXRlbVN0YXRlO1xyXG4gICAgaW1wb3J0IEdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3QgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5HZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IElHZXROb2Rlc0luZm8gPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JR2V0Tm9kZXNJbmZvO1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlTG9va3VwID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSU1lbWJlck5vZGVMb29rdXA7XHJcbiAgICBpbXBvcnQgSUZpbHRlckNvbnRyb2wgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JU2VyaWFsaXphYmxlU3RhdGVDb250cm9sO1xyXG4gICAgaW1wb3J0IENvbnRyb2xTdGF0ZUluZm8gPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5Db250cm9sU3RhdGVJbmZvO1xyXG4gICAgaW1wb3J0IElGaWx0ZXJTdGF0ZU1hbmFnZXIgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5JRmlsdGVyU3RhdGVNYW5hZ2VyO1xyXG4gICAgaW1wb3J0IElGaWx0ZXJDb250cm9sU2VydmljZUZhY3RvcnkgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JRmlsdGVyQ29udHJvbFNlcnZpY2VGYWN0b3J5O1xyXG4gICAgaW1wb3J0IElGaWx0ZXJTdGF0ZU1hbmFnZXJGYWN0b3J5ID0gRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuSUZpbHRlclN0YXRlTWFuYWdlckZhY3Rvcnk7XHJcbiAgICBpbXBvcnQgSUZpbHRlckl0ZW0gPSBGaWx0ZXJDb250cm9sTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5Db21tb24uSUZpbHRlckl0ZW07XHJcbiAgICBpbXBvcnQgRmlsdGVyVHlwZSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5GaWx0ZXJUeXBlO1xyXG4gICAgaW1wb3J0IFNlbGVjdGlvbk1vZGUgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5Db21tb24uU2VsZWN0aW9uTW9kZTtcclxuICAgIGltcG9ydCBJUmVzb3VyY2VzTWFwID0gQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSVJlc291cmNlc01hcDtcclxuICAgIGltcG9ydCBJTGltaXRzSGVscGVyT3duZXIgPSBDb250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLkhlbHBlcnMuSUxpbWl0c0hlbHBlck93bmVyO1xyXG4gICAgaW1wb3J0IElMaW1pdHNIZWxwZXIgPSBDb250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLkhlbHBlcnMuSUxpbWl0c0hlbHBlcjtcclxuICAgIGltcG9ydCBJTGltaXRzSGVscGVyRmFjdG9yeSA9IENvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuSGVscGVycy5JTGltaXRzSGVscGVyRmFjdG9yeTtcclxuICAgIGltcG9ydCBMaW1pdHNIZWxwZXJGYWN0b3J5ID0gQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5IZWxwZXJzLkxpbWl0c0hlbHBlckZhY3Rvcnk7XHJcblxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJDb250cm9sIGltcGxlbWVudHMgSUZpbHRlckNvbnRyb2wsIElMaW1pdHNIZWxwZXJPd25lciB7XHJcbiAgICAgICBcclxuICAgICAgICBzdGF0aWMgZ2V0IFJlc291cmNlcygpOklSZXNvdXJjZXNNYXAge3JldHVybiB3aW5kb3dbXCJmaWx0ZXJDb250cm9sUmVzb3VyY2VzXzk1ZWMzNjc4ZjJlZjQzN2U4ZGY3MmM3NzFiNzRlNDVlXCJdfTtcclxuICAgICAgICBzdGF0aWMgZ2V0IFRlbXBsYXRlKCk6c3RyaW5nIHtyZXR1cm4gJChcIiNmaWx0ZXJDb250cm9sVGVtcGxhdGVfOTVlYzM2NzhmMmVmNDM3ZThkZjcyYzc3MWI3NGU0NWVcIikuaHRtbCgpfTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBfc3RhdGVNYW5hZ2VyRmFjdG9yeTogSUZpbHRlclN0YXRlTWFuYWdlckZhY3Rvcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfc2VydmljZUZhY3Rvcnk6IElGaWx0ZXJDb250cm9sU2VydmljZUZhY3Rvcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfdmlldzogRmlsdGVyQ29udHJvbE1vZHVsZS5JRmlsdGVyQ29udHJvbFZpZXc7XHJcbiAgICAgICAgcHJpdmF0ZSBfbGltaXRzSGVscGVyRmFjdG9yeTpJTGltaXRzSGVscGVyRmFjdG9yeTtcclxuICAgICAgICBwcml2YXRlIF9vcHRpb25zOk9wdGlvbnM7XHJcblxyXG4gICAgICAgIHByaXZhdGUgX3NlcnZpY2U6IElGaWx0ZXJDb250cm9sU2VydmljZTtcclxuICAgICAgICBwcml2YXRlIF9pc0xvYWRpbmdNb3JlRWxlbWVudDogYm9vbGVhbjtcclxuICAgICAgICBwcml2YXRlIF9pc1Jlc3RvcmluZ1RyZWVTdGF0ZTogYm9vbGVhbjtcclxuICAgICAgICBwcml2YXRlIF9lbGVtZW50c1RvTG9hZDogSU1lbWJlck5vZGVbXTtcclxuICAgICAgICBwcml2YXRlIF9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXg6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIF9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleDogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgX2xvYWRNb3JlTm9kZUlkUGFydDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgX3NlbGVjdEFsbE5vZGVJZDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgX3NlbGVjdEFsbEZpbHRyZWRJZDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgX2Rlc2VsZWN0QWxsRmlsdHJlZE5vZGVJZDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgX3N0YXRlTWFuYWdlcjogSUZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgICAgICBwcml2YXRlIF9maWx0ZXJTdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBfcmVkcndlZE5vZGVzOiBzdHJpbmdbXTtcclxuICAgICAgICBwcml2YXRlIF9pc0xvYWRpbmdBbGxFbGVtZW50czogYm9vbGVhbjtcclxuICAgICAgICBwcml2YXRlIF9tZXRhZGF0YTogRmlsdGVyTWV0YWRhdGE7XHJcbiAgICAgICAgcHJpdmF0ZSBfbm9kZXNXaXRob3V0RnVsbENoaWxkcmVuQ291bnRMb29rdXA6IElNZW1iZXJOb2RlTG9va3VwO1xyXG4gICAgICAgIHByaXZhdGUgX2xhc3RQcm9jZXNzZWROb2RlVW5pcWVOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfY3VycmVudFN0YXR1c0ZpbHRlcjogRmlsdGVySXRlbVN0YXRlO1xyXG4gICAgICAgIHByaXZhdGUgX2lzSW5GaWx0ZXJNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2lzSW5TZWFyY2hGaWx0ZXJNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2lzSW5TdGF0dXNGaWx0ZXJNb2RlOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2lzTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2NvbnRyb2xTdGF0ZUluZm86IENvbnRyb2xTdGF0ZUluZm87XHJcbiAgICAgICAgcHJpdmF0ZSBfbGltaXRzSGVscGVyOklMaW1pdHNIZWxwZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICBvcHRpb25zOklPcHRpb25zLFxyXG4gICAgICAgICAgICB2aWV3RmFjdG9yeTogSUZpbHRlckNvbnRyb2xWaWV3RmFjdG9yeSxcclxuICAgICAgICAgICAgc2VydmljZUZhY3Rvcnk6IElGaWx0ZXJDb250cm9sU2VydmljZUZhY3RvcnksXHJcbiAgICAgICAgICAgIHN0YXRlTWFuYWdlckZhY3Rvcnk6IElGaWx0ZXJTdGF0ZU1hbmFnZXJGYWN0b3J5LFxyXG4gICAgICAgICAgICBsaW1pdHNIZWxwZXJGYWN0b3J5OklMaW1pdHNIZWxwZXJGYWN0b3J5PW5ldyBMaW1pdHNIZWxwZXJGYWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSBuZXcgT3B0aW9ucygpLk1lcmdlKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3ID0gdmlld0ZhY3RvcnkuQ3JlYXRlKHRoaXMuX29wdGlvbnMuJFRhcmdldENvbnRhaW5lcix0aGlzLl9vcHRpb25zLlRlbXBsYXRlLHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlRmFjdG9yeSA9IHNlcnZpY2VGYWN0b3J5O1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXJGYWN0b3J5ID0gc3RhdGVNYW5hZ2VyRmFjdG9yeTtcclxuICAgICAgICAgICAgdGhpcy5fbGltaXRzSGVscGVyRmFjdG9yeSA9IGxpbWl0c0hlbHBlckZhY3Rvcnk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFJlc2V0SW50ZXJuYWxTdGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nTW9yZUVsZW1lbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faXNSZXN0b3JpbmdUcmVlU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWQgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlcnZpY2UgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkTW9yZU5vZGVJZFBhcnQgPSBcIlNob3dNb3JlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdEFsbE5vZGVJZCA9IFwiU2VsZWN0QWxsXCI7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdEFsbEZpbHRyZWRJZCA9IFwiU2VsZWN0QWxsRmlsdHJlZFwiO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNlbGVjdEFsbEZpbHRyZWROb2RlSWQgPSBcIkRlU2VsZWN0QWxsRmlsdHJlZFwiO1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWRyd2VkTm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fbWV0YWRhdGEgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlc1dpdGhvdXRGdWxsQ2hpbGRyZW5Db3VudExvb2t1cCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkTm9kZVVuaXFlTmFtZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0dXNGaWx0ZXIgPSBGaWx0ZXJJdGVtU3RhdGUuQ2hlY2tlZDtcclxuICAgICAgICAgICAgdGhpcy5faXNJbkZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faXNJblNlYXJjaEZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faXNJblN0YXR1c0ZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fY29udHJvbFN0YXRlSW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpbWl0c0hlbHBlcj1udWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IE9wdGlvbnMoKTogT3B0aW9ucyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNldCBPcHRpb25zKHZhbHVlOiBPcHRpb25zKSB7IHRoaXMuX29wdGlvbnMgPSB2YWx1ZTsgfVxyXG5cclxuICAgICAgICBnZXQgTWV0YWRhdGEoKTogRmlsdGVyTWV0YWRhdGEge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWV0YWRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgU2VydmljZUZhY3RvcnkoKTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlRmFjdG9yeTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNldCBTZXJ2aWNlRmFjdG9yeSh2YWx1ZTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlRmFjdG9yeSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IExvYWRlZEVsZW1lbnRzQ291bnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2xpbWl0c0hlbHBlci5Mb2FkZWRFbGVtZW50c0NvdW50OyB9XHJcblxyXG4gICAgICAgIHNldCBMb2FkZWRFbGVtZW50c0NvdW50KHZhbHVlOiBudW1iZXIpIHsgdGhpcy5fbGltaXRzSGVscGVyLkxvYWRlZEVsZW1lbnRzQ291bnQgPSB2YWx1ZTsgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBnZXQgVG90YWxFbGVtZW50c0NvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXRhZGF0YS5BbGxMZXZlbHNNZW1iZXJzVG90YWxDb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGdldCBJc0luU2VhcmNoRmlsdGVyTW9kZSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5TZWFyY2hGaWx0ZXJNb2RlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXQgSXNJblNlYXJjaEZpbHRlck1vZGUodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNJblNlYXJjaEZpbHRlck1vZGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0luRmlsdGVyTW9kZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0luU3RhdHVzRmlsdGVyTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNJbkZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwcml2YXRlIGdldCBJc0luU3RhdHVzRmlsdGVyTW9kZSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5TdGF0dXNGaWx0ZXJNb2RlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2V0IElzSW5TdGF0dXNGaWx0ZXJNb2RlKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5TdGF0dXNGaWx0ZXJNb2RlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNJbkZpbHRlck1vZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNJblNlYXJjaEZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2lzSW5GaWx0ZXJNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICBnZXQgTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXQgTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkKHZhbHVlOiBib29sZWFuKSB7IHRoaXMuX2lzTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkID0gdmFsdWU7IH1cclxuXHJcbiAgICAgICAgZ2V0IFRyZWVTdGF0ZSgpOiBJTWVtYmVyTm9kZVtdIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXcuR2V0VHJlZVN0YXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgSXNJbkZpbHRlck1vZGUoKTogYm9vbGVhbiB7IHJldHVybiBCb29sZWFuKHRoaXMuX2lzSW5GaWx0ZXJNb2RlKSB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlQ29udHJvbFRvcEJhcigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5VcGRhdGVMZXZlbHNNZW51KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuVXBkYXRlRmlsdGVyVHlwZVNlbGVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIGFzeW5jIFJlZnJlc2hUcmVlKGNvbm5lY3Rpb25TdHJpbmc6IHN0cmluZywgZmllbGRVbmlxdWVOYW1lOiBzdHJpbmcsIHNhdmVkU3RhdGU6IElGaWx0ZXJJdGVtKSB7XHJcbiAgICAgICAgICAgIHRoaXMuU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleCA9IHRoaXMuX29wdGlvbnMuQ3VycmVudFdpbmRvdztcclxuICAgICAgICAgICAgdGhpcy5fc2VydmljZSA9IHRoaXMuU2VydmljZUZhY3RvcnkuQ3JlYXRlKGNvbm5lY3Rpb25TdHJpbmcpO1xyXG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YVJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0TWV0YWRhdGEobmV3IE1ldGFkYXRhUmVxdWVzdChmaWVsZFVuaXF1ZU5hbWUsIEZpbHRlclN0YXRlTWFuYWdlci5HZXRMZWFmcyhzYXZlZFN0YXRlKSkpKTtcclxuICAgICAgICAgICAgdGhpcy5fbWV0YWRhdGEgPSBtZXRhZGF0YVJlc3BvbnNlLk1ldGFkYXRhO1xyXG4gICAgICAgICAgICB0aGlzLl9saW1pdHNIZWxwZXIgPSB0aGlzLl9saW1pdHNIZWxwZXJGYWN0b3J5LkNyZWF0ZSh0aGlzLCB0aGlzLl9vcHRpb25zLk1heFRvdGFsRWxlbWVudHNDb3VudCwgdGhpcy5fbWV0YWRhdGEuQWxsTGV2ZWxzTWVtYmVyc1RvdGFsQ291bnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9saW1pdHNIZWxwZXIuTG9hZGVkRWxlbWVudHNDb3VudD0wO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZUNvbnRyb2xUb3BCYXIoKTtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyID0gdGhpcy5fc3RhdGVNYW5hZ2VyRmFjdG9yeS5DcmVhdGUoRmlsdGVyVHlwZS5FeGNsdWRlZCwgdGhpcy5fbWV0YWRhdGEuUm9vdE1lbWJlcnNUb3RhbENvdW50LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGlmIChzYXZlZFN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuRGVzZXJpYWxpemUoc2F2ZWRTdGF0ZSwgdGhpcy5fbWV0YWRhdGEuUm9vdE1lbWJlcnNUb3RhbENvdW50LCBtZXRhZGF0YVJlc3BvbnNlLkNsZWFuZWRTdGF0ZUluZm8pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX21ldGFkYXRhLkRlZmF1bHRNZW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkhhbmRsZURlZmF1bHRNZW1iZXIoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyLlJlc2V0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkNyZWF0ZVRyZWUoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZVRyZWUoKSB7XHJcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXcuQ3JlYXRlVHJlZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBIYW5kbGVEZWZhdWx0TWVtYmVyKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuUmVzZXQoZmFsc2UpO1xyXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0TWVtYmVyUm9vdCA9IE1lbWJlck5vZGVzSGVscGVyLkhpZXJhcmNoaXplTm9kZXModGhpcy5fbWV0YWRhdGEuRGVmYXVsdE1lbWJlci5MYXN0TGV2ZWxOb2RlcywgdGhpcy5fbWV0YWRhdGEuRGVmYXVsdE1lbWJlci5QYXJlbnRzTG9va3VwKTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KGRlZmF1bHRNZW1iZXJSb290LFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsLCBpbmRleCwgcGFyZW50cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLklzVHJlZUxlYWYoY3VycmVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50cyA9IFt7IGlkOiBcIiNcIiB9IGFzIElNZW1iZXJOb2RlXS5jb25jYXQocGFyZW50cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuQWRkU3RhdGVOb2RlRnJvbVRyZWUodGhpcy5fc3RhdGVNYW5hZ2VyLCBwYXJlbnRzLCBjdXJyZW50LCB0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PElNZW1iZXJOb2RlPigpLFxyXG4gICAgICAgICAgICAgICAgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXROb2RlRGF0YShvYmo6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCB0aGlzLkxvYWROb2Rlc0NvcmUob2JqLCB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAoaW5mby5NYXhFbGVtZW50TGltaXRSZWFjaGVkICYmICFpbmZvLkhhc1RyaW1tZWRUb0xpbWl0TWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5NYW51YWxSZXNldExvYWRpbmdBY3Rpb24ob2JqKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlJlbmRlclRyZWUoaW5mby5NZW1iZXJzKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIE1hbnVhbFJlc2V0TG9hZGluZ0FjdGlvbihvYmo6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGU6IElNZW1iZXJOb2RlID0gIHRoaXMuR2V0VHJlZU5vZGUob2JqLmlkKTtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUVsZW1lbnQgPSAkKCB0aGlzLkdldFRyZWVOb2RlKG9iai5pZCwgdHJ1ZSkpO1xyXG4gICAgICAgICAgICBub2RlRWxlbWVudC5yZW1vdmVDbGFzcyhcImpzdHJlZS1sb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICBub2RlLnN0YXRlLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5vZGUuc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBub2RlLnN0YXRlLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBMb2FkTm9kZXNDb3JlKG9iajogSU1lbWJlck5vZGUsIHN0YXJ0SW5kZXg6IG51bWJlcik6IFByb21pc2U8SUdldE5vZGVzSW5mbz4ge1xyXG4gICAgICAgICAgICBsZXQgaW5mbzogSUdldE5vZGVzSW5mbztcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzTG9hZGluZ01vcmVFbGVtZW50IHx8IHRoaXMuX2lzUmVzdG9yaW5nVHJlZVN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIE1lbWJlcnM6IHRoaXMuX2VsZW1lbnRzVG9Mb2FkLFxyXG4gICAgICAgICAgICAgICAgICAgIE1heEVsZW1lbnRMaW1pdFJlYWNoZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIEhhc1RyaW1tZWRUb0xpbWl0TWVtYmVyczogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvID0gYXdhaXQgdGhpcy5Mb2FkTm9kZXNGcm9tU2VydmVyQ29yZShvYmosIHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBMb2FkTm9kZXNGcm9tU2VydmVyQ29yZShvYmo6IElNZW1iZXJOb2RlLCBzdGFydEluZGV4OiBudW1iZXIpOiBQcm9taXNlPElHZXROb2Rlc0luZm8+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlNob3dNYXhMaW1pdFJlYWNoZWQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWVtYmVyczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgTWF4RWxlbWVudExpbWl0UmVhY2hlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBIYXNUcmltbWVkVG9MaW1pdE1lbWJlcnM6IGZhbHNlXHJcblxyXG4gICAgICAgICAgICAgICAgfSBhcyBJR2V0Tm9kZXNJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZTogSUZpbHRlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgY3JlYXRlQWxsTm9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgY3JlYXRlRmlsdHJlZFN0YXRlU2VsZWN0aW9uTm9kZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IGhhc1RyaW1tZWRUb0xpbWl0TWVtYmVycyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAob2JqLmlkID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlQWxsTm9kZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc0luRmlsdGVyTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUFsbE5vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVGaWx0cmVkU3RhdGVTZWxlY3Rpb25Ob2RlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuSXNJblNlYXJjaEZpbHRlck1vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZW1iZXJzKG5ldyBNZW1iZXJzUmVxdWVzdCh0aGlzLl92aWV3LkZpbHRlckxldmVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyRWxlbWVudHNMb2FkTW9yZVN0YXJ0SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zLkRhdGFQYWNrYWdlU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBNZW1iZXJGaWx0ZXIodGhpcy5fdmlldy5TZWFyY2hQYXR0ZXJuLCB0aGlzLl92aWV3Lk1lbWJlckZpbHRlclR5cGUpKSkpLkZpbHRlckluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLklzSW5TdGF0dXNGaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0TWVtYmVyc0J5U3RhdHVzKG5ldyBHZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0KHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyRWxlbWVudHNMb2FkTW9yZVN0YXJ0SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5EYXRhUGFja2FnZVNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXR1c0ZpbHRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuU2VyaWFsaXplKCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHN0YXRlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzTG9hZGluZ0FsbEVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRMZWFmTWVtYmVycyhuZXcgTGVhZk1lbWJlcnNSZXF1ZXN0KHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwsIHRoaXMuX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleCwgdGhpcy5fb3B0aW9ucy5NYXhUb3RhbEVsZW1lbnRzQ291bnQpKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLkZpbHRlckluZm87XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0TWVtYmVycyhuZXcgTWVtYmVyc1JlcXVlc3QodGhpcy5fbWV0YWRhdGEuU29ydGVkTGV2ZWxzWzBdLlVuaXF1ZU5hbWUsIHRoaXMuX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleCwgdGhpcy5fb3B0aW9ucy5EYXRhUGFja2FnZVNpemUpKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLkZpbHRlckluZm87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IChhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldENoaWxkcmVuKG5ldyBDaGlsZHJlblJlcXVlc3QodGhpcy5fbWV0YWRhdGEuU29ydGVkTGV2ZWxzWzBdLlVuaXF1ZU5hbWUsIG9iai5pZCwgc3RhcnRJbmRleCwgdGhpcy5fb3B0aW9ucy5EYXRhUGFja2FnZVNpemUpKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBub2Rlc1RvTG9hZCA9IGF3YWl0IHRoaXMuUHJlcGFyZURhdGFUb0xvYWQob2JqLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTWF4VmlzaWJsZUVsZW1lbnRzTGltaXRSZWFjaGVkID0gIXRoaXMuX2xpbWl0c0hlbHBlci5FbmZvcmNlTGltaXRzKG5vZGVzVG9Mb2FkKTtcclxuICAgICAgICAgICAgaWYgKG5vZGVzVG9Mb2FkLmxlbmd0aCAhPT0gMCAmJiB0aGlzLl9pc01heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgaGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuSGFzTW9yZU1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzVG9Mb2FkLnB1c2godGhpcy5DcmVhdGVMb2FkTW9yZU5vZGUob2JqLCByZXNwb25zZS5MYXN0TGV2ZWxOb2RlcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjcmVhdGVBbGxOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBub2Rlc1RvTG9hZC51bnNoaWZ0KHRoaXMuQ3JlYXRlQWxsTm9kZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY3JlYXRlRmlsdHJlZFN0YXRlU2VsZWN0aW9uTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzVG9Mb2FkLnVuc2hpZnQodGhpcy5DcmVhdGVTZWxlY3RBbGxGaWx0cmVkTm9kZSgpLCB0aGlzLkNyZWF0ZURlU2VsZWN0QWxsRmlsdHJlZE5vZGUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIE1lbWJlcnM6IG5vZGVzVG9Mb2FkLFxyXG4gICAgICAgICAgICAgICAgTWF4RWxlbWVudExpbWl0UmVhY2hlZDogaGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzLFxyXG4gICAgICAgICAgICAgICAgSGFzVHJpbW1lZFRvTGltaXRNZW1iZXJzOiBoYXNUcmltbWVkVG9MaW1pdE1lbWJlcnNcclxuICAgICAgICAgICAgfSBhcyBJR2V0Tm9kZXNJbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBQcmVwYXJlRGF0YVRvTG9hZChpbnZva2luZ05vZGU6IElNZW1iZXJOb2RlLCByZXNwb25zZTogSUZpbHRlckluZm8pIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVzID0gcmVzcG9uc2UuTGFzdExldmVsTm9kZXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4cGFuZFRvTGV2ZWxJbmRleCA9IHRoaXMuR2V0TGV2ZWxOdW1iZXJGcm9tVW5pcXVlTmFtZSh0aGlzLl92aWV3LkZpbHRlckxldmVsKTtcclxuICAgICAgICAgICAgbGV0IGV4cGFuZEFsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIGV4cGFuZEFsbCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNMb2FkaW5nV2hvbGVUcmVlKGludm9raW5nTm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzID0gTWVtYmVyTm9kZXNIZWxwZXIuSGllcmFyY2hpemVOb2Rlcyhub2RlcywgcmVzcG9uc2UuUGFyZW50c0xvb2t1cCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFzc2lnbkxldmVsSW5kZXgoaW52b2tpbmdOb2RlLCBub2RlcywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkV4cGFuZE5vZGVzVG9UYXJnZXRMZXZlbChub2RlcywgZXhwYW5kVG9MZXZlbEluZGV4LCBleHBhbmRBbGwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Bc3NpZ25MZXZlbEluZGV4KGludm9raW5nTm9kZSwgbm9kZXMsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzTG9hZGluZ01vcmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBub2RlcyA9IHRoaXMuTWVyZ2VOZXdOb2Rlc0ludG9FeGlzdGluZ1RyZWUoaW52b2tpbmdOb2RlLCBub2Rlcyk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzSW5GaWx0ZXJNb2RlICYmIGludm9raW5nTm9kZS5pZCA9PT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuSW5pdEZpbHRyZWRFbGVtZW50U3RhdGUobm9kZXMsIHJlc3BvbnNlLkhhc01vcmVNZW1iZXJzLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBJbml0RmlsdHJlZEVsZW1lbnRTdGF0ZShoaWVyYXJjaGl6ZWROb2RlczogSU1lbWJlck5vZGVbXSwgaGFzTW9yZU1lbWJlcnM6IGJvb2xlYW4sIHJlc3BvbnNlOiBJRmlsdGVySW5mbykge1xyXG4gICAgICAgICAgICBjb25zdCBub2Rlc1dpdGhVcGRhdGVkQ291bnQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuX25vZGVzV2l0aG91dEZ1bGxDaGlsZHJlbkNvdW50TG9va3VwKSk7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzV2l0aG91dEZ1bGxDaGlsZHJlbkNvdW50TG9va3VwID0ge307XHJcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5GaWxsQXZhaWxhYmxlRmlsdGVyUmVzdWx0VG90YWxDb3VudHMoaGllcmFyY2hpemVkTm9kZXMsIHRoaXMuX25vZGVzV2l0aG91dEZ1bGxDaGlsZHJlbkNvdW50TG9va3VwLCBleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cCwgaGFzTW9yZU1lbWJlcnMpO1xyXG4gICAgICAgICAgICB0aGlzLkNhbGN1bGF0ZVVwZGF0ZWRDb3VudE1lbWViZXJzKG5vZGVzV2l0aFVwZGF0ZWRDb3VudCwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXApO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZUZpbHRlclZpc2libGVTdGF0ZShoaWVyYXJjaGl6ZWROb2RlcywgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXAsIG5vZGVzV2l0aFVwZGF0ZWRDb3VudCwgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWNGSUxURVIgU1RBVEU6YCwgXCJiYWNrZ3JvdW5kOiAjMjIyOyBjb2xvcjogeWVsbG93XCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIuUHJpbnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ2FsY3VsYXRlVXBkYXRlZENvdW50TWVtZWJlcnMobm9kZXNXaXRoVXBkYXRlZENvdW50OiBhbnksIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXApIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG5vZGVzV2l0aFVwZGF0ZWRDb3VudCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4IGluIGtleXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXlzLmhhc093blByb3BlcnR5KGluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZU5hbWUgPSBrZXlzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbkNvdW50SW5mbyA9IGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwW3VuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbkNvdW50SW5mbyAmJiBjaGlsZHJlbkNvdW50SW5mby5DaGlsZHJlbkNvdW50ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbm9kZXNXaXRoVXBkYXRlZENvdW50W3VuaXF1ZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVGaWx0ZXJWaXNpYmxlU3RhdGUoaGllcmFyY2hpemVkTm9kZXM6IElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAsXHJcbiAgICAgICAgICAgIG5vZGVzV2l0aFVwZGF0ZWRDb3VudDogSU1lbWJlck5vZGVMb29rdXAsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlOiBJRmlsdGVySW5mbykge1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEFjdGlvbkxhc3RQcm9jZXNzZWROb2RlVW5pcXVlTmFtZTogc3RyaW5nID0gbnVsbDtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KGhpZXJhcmNoaXplZE5vZGVzLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW5Db3VudCA9IGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwW2N1cnJlbnQuaWRdLkNoaWxkcmVuQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kYXRhLmZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSBjaGlsZHJlbkNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRBY3Rpb25MYXN0UHJvY2Vzc2VkTm9kZVVuaXF1ZU5hbWUgPSBjdXJyZW50LmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSgpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuVHJhbnNmb3JtT3JnaW5hbFN0YXRlSW50b1Zpc2libGVGaWx0ZXJTdGF0ZShoaWVyYXJjaGl6ZWROb2RlcywgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyLlVwZGF0ZUZpbHRlcmVkQ2hpbGRyZW5zVG90YWxDb3VudChleGlzdGluZ0VsZW1lbnRzQ2hpbGRyZW5Db3VudExvb2t1cCwgbm9kZXNXaXRoVXBkYXRlZENvdW50KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWROb2RlVW5pcWVOYW1lID0gY3VycmVudEFjdGlvbkxhc3RQcm9jZXNzZWROb2RlVW5pcXVlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlci5SZWZyZXNoKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFRyYW5zZm9ybU9yZ2luYWxTdGF0ZUludG9WaXNpYmxlRmlsdGVyU3RhdGUoaGllcmFyY2hpemVkTm9kZXM6IElNZW1iZXJOb2RlW10sIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXApIHtcclxuICAgICAgICAgICAgdmFyIHN0YXJ0UHJvY2Vzc2luZyA9IHRoaXMuX2xhc3RQcm9jZXNzZWROb2RlVW5pcWVOYW1lID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4oaGllcmFyY2hpemVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQsIHBhcmVudCwgbGV2ZWwsIGluZGV4LCBwYXJlbnRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0UHJvY2Vzc2luZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5kYXRhLmxldmVsID09PSB0aGlzLl92aWV3LkZpbHRlckxldmVsTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzLnVuc2hpZnQoIHRoaXMuR2V0VHJlZU5vZGUoXCIjXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvblN0YXR1cyA9IHRoaXMuX3N0YXRlTWFuYWdlci5HZXRTZWxlY3Rpb25TdGF0dXMocGFyZW50cy5tYXAoeCA9PiB4LmlkKSwgY3VycmVudC5pZCwgbmV3IEJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxzdHJpbmc+KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzZWxlY3Rpb25TdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgU2VsZWN0aW9uTW9kZS5TZWxlY3RlZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkFkZFN0YXRlTm9kZUZyb21UcmVlKHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciwgcGFyZW50cywgY3VycmVudCwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5BZGRTdGF0ZU5vZGVGcm9tVHJlZSh0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIsIHBhcmVudHMsIGN1cnJlbnQsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFNlbGVjdGlvbk1vZGUuVW5kZXRlcm1pbmVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlSXRlbSA9IHRoaXMuX3N0YXRlTWFuYWdlci5DbG9uZUJyYW5jaChjdXJyZW50LmlkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZVByZW9yZGVyPEV4dGVuZGVkRmlsdGVySXRlbT4oc3RhdGVJdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoeCkgPT4geC5DaGlsZHJlbkFycmF5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCwgaW5kZXgsIHN0YXRlUGFyZW50cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5Pd25lciA9IHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LklzTGVhZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlUGFyZW50cyA9IHBhcmVudHMubWFwKHggPT4gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUoeCwgdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyKSkuY29uY2F0KHN0YXRlUGFyZW50cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uTW9kZSA9IHRoaXMuX3N0YXRlTWFuYWdlci5HZXRTZWxlY3Rpb25TdGF0dXMoc3RhdGVQYXJlbnRzLm1hcCh4ID0+IHguVW5pcXVlTmFtZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuVW5pcXVlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxzdHJpbmc+KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuQWRkU3RhdGVUcmFuc2Zvcm1hdGlvbk5vZGVDb3JlKHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciwgc3RhdGVQYXJlbnRzLCBjdXJyZW50LCBzZWxlY3Rpb25Nb2RlID09PSBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5PEV4dGVuZGVkRmlsdGVySXRlbT4oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSAvL1RPRE8gY2hlY2sgaW4gUG9pbnQgYW5kIGNoYW5nZSBvcmRlciBvZiB0cmFjayBwYXRoIHRvIGJlIGZpcnN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmlkID09PSB0aGlzLl9sYXN0UHJvY2Vzc2VkTm9kZVVuaXFlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRQcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCksXHJcbiAgICAgICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBBZGRTdGF0ZU5vZGVGcm9tVHJlZShzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIsIHBhcmVudHM6IElNZW1iZXJOb2RlW10sIGN1cnJlbnQ6IElNZW1iZXJOb2RlLCBpc1NlbGVjdDogYm9vbGVhbiwgYXV0b1JlZnJlc2g6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgY29uc3Qgc29ydGVkUGFyZW50cyA9IHBhcmVudHMubWFwKHggPT4gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUoeCwgc3RhdGVNYW5hZ2VyKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShjdXJyZW50LCBzdGF0ZU1hbmFnZXIpO1xyXG4gICAgICAgICAgICB0aGlzLkFkZFN0YXRlVHJhbnNmb3JtYXRpb25Ob2RlQ29yZShzdGF0ZU1hbmFnZXIsIHNvcnRlZFBhcmVudHMsIHRhcmdldE5vZGUsIGlzU2VsZWN0LCBhdXRvUmVmcmVzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEFkZFN0YXRlVHJhbnNmb3JtYXRpb25Ob2RlQ29yZShzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIsXHJcbiAgICAgICAgICAgIHNvcnRlZFBhcmVudHM6IEV4dGVuZGVkRmlsdGVySXRlbVtdLFxyXG4gICAgICAgICAgICB0YXJnZXROb2RlOiBFeHRlbmRlZEZpbHRlckl0ZW0sXHJcbiAgICAgICAgICAgIGlzU2VsZWN0OiBib29sZWFuLFxyXG4gICAgICAgICAgICBhdXRvUmVmcmVzaDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBzdGF0ZU1hbmFnZXIuQWRkTm9kZXMoc29ydGVkUGFyZW50cywgdGFyZ2V0Tm9kZSwgaXNTZWxlY3QsIGF1dG9SZWZyZXNoLCBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8RXh0ZW5kZWRGaWx0ZXJJdGVtPigpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgTG9hZE1pc3NpbmdOb2Rlc0NvdW50KG5vZGVzTGFja2luZ0Z1bGxDaGlsZHJlbkNvdW50OiBzdHJpbmdbXSwgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXA6IElDaGlsZHJlbkNvdW50SW5mb0xvb2t1cCkge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbkNvdW50TG9va3VwID0gYXdhaXQgdGhpcy5fc2VydmljZS5HZXRGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50KG5ldyBGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVxdWVzdCh0aGlzLl92aWV3LkZpbHRlckxldmVsLFxyXG4gICAgICAgICAgICAgICAgbm9kZXNMYWNraW5nRnVsbENoaWxkcmVuQ291bnQsXHJcbiAgICAgICAgICAgICAgICBuZXcgTWVtYmVyRmlsdGVyKHRoaXMuX3ZpZXcuU2VhcmNoUGF0dGVybiwgdGhpcy5fdmlldy5NZW1iZXJGaWx0ZXJUeXBlKSkpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gY2hpbGRyZW5Db3VudExvb2t1cC5DaGlsZHJlbkNvdW50SW5mb0xvb2t1cCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuQ291bnRMb29rdXAuQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZm8gPSBjaGlsZHJlbkNvdW50TG9va3VwLkNoaWxkcmVuQ291bnRJbmZvTG9va3VwW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXBba2V5XSA9IGluZm87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgRmlsbEF2YWlsYWJsZUZpbHRlclJlc3VsdFRvdGFsQ291bnRzKG5vZGVzOiBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICBub2Rlc0xhY2tpbmdGdWxsQ2hpbGRyZW5Db3VudDogSU1lbWJlck5vZGVMb29rdXAsXHJcbiAgICAgICAgICAgIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAsXHJcbiAgICAgICAgICAgIGhhc01vcmVNZW1iZXJzOiBib29sZWFuKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNNZW1iZXI6IElNZW1iZXJOb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIGxhc3RMZXZlbE51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdEJGUyhub2RlcyxcclxuICAgICAgICAgICAgICAgIHggPT4gJC5pc0FycmF5KHguY2hpbGRyZW4pID8geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdIDogW10sXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlblRvdGFsQ291bnQ6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0Tm9kZSA9IGN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuZGF0YS5sZXZlbCA8IHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWxOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5Ub3RhbENvdW50ID0gY3VycmVudC5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5Ub3RhbENvdW50ID0gY3VycmVudC5kYXRhLmNoaWxkcmVuVG90YWxDb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5VcGRhdGVDb3VudCh0YXJnZXROb2RlLCBjaGlsZHJlblRvdGFsQ291bnQsIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxldmVsID0gY3VycmVudC5kYXRhLmxldmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0TGV2ZWxOdW1iZXIgIT09IGxldmVsICYmIHByZXZpb3VzTWVtYmVyICYmIGhhc01vcmVNZW1iZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNNZW1iZXIuZGF0YS5sZXZlbCA8IHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWxOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzTGFja2luZ0Z1bGxDaGlsZHJlbkNvdW50W3ByZXZpb3VzTWVtYmVyLmlkXSA9IHByZXZpb3VzTWVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5VcGRhdGVDb3VudChwcmV2aW91c01lbWJlciwgLTEsIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0TGV2ZWxOdW1iZXIgPSBsZXZlbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzTWVtYmVyID0gY3VycmVudDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFoYXNNb3JlTWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgZXhpc3RpbmdFbGVtZW50c0NoaWxkcmVuQ291bnRMb29rdXBbXCIjXCJdID0geyBDaGlsZHJlbkNvdW50OiBub2Rlcy5sZW5ndGggfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBVcGRhdGVDb3VudCh0YXJnZXROb2RlOiBJTWVtYmVyTm9kZSwgY2hpbGRyZW5Ub3RhbENvdW50OiBudW1iZXIsIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwOiBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXApIHtcclxuICAgICAgICAgICAgdGFyZ2V0Tm9kZS5kYXRhLmZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSBjaGlsZHJlblRvdGFsQ291bnQ7XHJcbiAgICAgICAgICAgIGV4aXN0aW5nRWxlbWVudHNDaGlsZHJlbkNvdW50TG9va3VwW3RhcmdldE5vZGUuaWRdID0geyBDaGlsZHJlbkNvdW50OiBjaGlsZHJlblRvdGFsQ291bnQgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNMb2FkaW5nV2hvbGVUcmVlKGludm9raW5nTm9kZTogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLklzSW5GaWx0ZXJNb2RlICYmIHRoaXMuSXNMb2FkaW5nRmlsdGVyTGV2ZWxFbGVtZW50cyhpbnZva2luZ05vZGUpKSB8fCB0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQXNzaWduTGV2ZWxJbmRleChpbnZva2luZ05vZGU6IElNZW1iZXJOb2RlLCBsb2FkZWROb2RlczogSU1lbWJlck5vZGVbXSwgaXNIaWVyYXJjaGljYWw6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgaWYgKGlzSGllcmFyY2hpY2FsKSB7XHJcbiAgICAgICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4obG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgKHgpID0+ICh4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10pLFxyXG4gICAgICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuZGF0YS5sZXZlbCA9IGxldmVsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBsZXZlbDogbnVtYmVyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmIChpbnZva2luZ05vZGUuaWQgPT09IFwiI1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9yb290IG9yIHNlYXJjaFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsID0gaW52b2tpbmdOb2RlLmRhdGEubGV2ZWwgKyAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9hZGVkTm9kZXMuZm9yRWFjaChuID0+IG4uZGF0YS5sZXZlbCA9IGxldmVsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEhhbmRsZUNvbmRpdGlvbmFsU2VsZWN0KG5vZGU6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc1Nob3dNb3JlTWVtYmVyKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvYWRpbmcgTW9yZSBOb2Rlc1wiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuTG9hZE1vcmVOb2Rlcyhub2RlKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIE1lcmdlTmV3Tm9kZXNJbnRvRXhpc3RpbmdUcmVlKHBhcmVudE5vZGU6IElNZW1iZXJOb2RlLCBuZXdOb2RlczogSU1lbWJlck5vZGVbXSk6IElNZW1iZXJOb2RlW10ge1xyXG4gICAgICAgICAgICB2YXIgZXhpc3RpbmdOb2RlczpJTWVtYmVyTm9kZVtdID0gW107XHJcbiAgICAgICAgICAgIHBhcmVudE5vZGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZElkID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLkdldFRyZWVOb2RlKGNoaWxkSWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLklzU3BlY2lhbE5vZGUobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ05vZGVzLnB1c2godGhpcy5fdmlldy5HZXRUcmVlTm9kZUNsb25lKG5vZGUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB2YXIgZXhpc3RpbmdOb2Rlc0xvb2t1cCA9IFRyZWVIZWxwZXJzLkNvbnZlcnRMaXN0VG9Mb29rdXA8SU1lbWJlck5vZGU+KGV4aXN0aW5nTm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh4LmNoaWxkcmVuKSA/ICh4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10pIDogW107IC8vZm9yIGxhenkgbG9hZGVkIGVsZW1lbnRzIGFscmVhZHkgaW4gdHJlZSB3aGljaCBoYXMgY2hpbGRyZW49dHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHggPT4geC5pZCk7XHJcblxyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4obmV3Tm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50Tm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBleGlzdGluZ05vZGUgPSBleGlzdGluZ05vZGVzTG9va3VwLmdldFZhbHVlKGN1cnJlbnROb2RlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0aW5nTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1BhcmVudE5vZGUgPSBleGlzdGluZ05vZGVzTG9va3VwLmdldFZhbHVlKGN1cnJlbnROb2RlLmRhdGEucGFyZW50VW5pcXVlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1BhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nUGFyZW50Tm9kZS5jaGlsZHJlbi5wdXNoKGN1cnJlbnROb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nTm9kZXMucHVzaChjdXJyZW50Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkoKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nTm9kZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzU3BlY2lhbE5vZGUobm9kZTogYW55KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLklzU2VsZWN0QWxsTWVtYmVyKG5vZGUpIHx8IHRoaXMuSXNTaG93TW9yZU1lbWJlcihub2RlKSB8fCB0aGlzLklzU2VsZWN0RmlsdHJlZE1lbWJlcihub2RlKSB8fCB0aGlzLklzRGVTZWxlY3RGaWx0cmVkTWVtYmVyKG5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgTG9hZE1vcmVOb2Rlcyh0YXJnZXROb2RlOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNNYXhWaXNpYmxlRWxlbWVudHNMaW1pdFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuU2hvd01heExpbWl0UmVhY2hlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVFbGVtZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5TaG93Tm9kZUxvYWRpbmdJbmRpY2F0b3IodGFyZ2V0Tm9kZS5pZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSAgdGhpcy5HZXRUcmVlTm9kZSh0YXJnZXROb2RlLnBhcmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleCA9IHRhcmdldE5vZGUuZGF0YS5uZXh0TG9hZFN0YXJ0SW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkID0gKGF3YWl0IHRoaXMuTG9hZE5vZGVzRnJvbVNlcnZlckNvcmUocGFyZW50Tm9kZSwgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4KSkuTWVtYmVycztcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5SZWxvYWRUcmVlTm9kZShwYXJlbnROb2RlLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzTG9hZGluZ01vcmVFbGVtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZC5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFNob3dOb2RlTG9hZGluZ0luZGljYXRvcihpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0ICRsaUVsZW1lbnQgPSAkKCB0aGlzLkdldFRyZWVOb2RlKGlkLCB0cnVlKSk7XHJcbiAgICAgICAgICAgICRsaUVsZW1lbnQuYWRkQ2xhc3MoXCJqc3RyZWUtbG9hZGluZ1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNMb2FkaW5nRmlsdGVyTGV2ZWxFbGVtZW50cyhwYXJlbnROb2RlOiBJTWVtYmVyTm9kZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBsZXQgbG9hZGVkTm9kZXNMZXZlbElkID0gLTE7IC8vcm9vdDtcclxuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGUuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgbG9hZGVkTm9kZXNMZXZlbElkID0gcGFyZW50Tm9kZS5kYXRhLmxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxvYWRlZE5vZGVzTGV2ZWxJZCsrOyAvL3dlIGFyZSBhY3R1YWx5IGxvYWRpbmcgbmV4dCBsZXZlbCBub3QgcGFyZW50IGxldmVsXHJcbiAgICAgICAgICAgIGlmIChsb2FkZWROb2Rlc0xldmVsSWQgPD0gdGhpcy5HZXRMZXZlbE51bWJlckZyb21VbmlxdWVOYW1lKHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZUxvYWRNb3JlTm9kZShwYXJlbnROb2RlOiBJTWVtYmVyTm9kZSwgbG9hZGVkTGFzdExldmVsTm9kZXNOb2RlczogSU1lbWJlck5vZGVbXSk6IElNZW1iZXJOb2RlIHtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBsb2FkZWRMYXN0TGV2ZWxOb2Rlc05vZGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4ICs9IHBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleC0tOyAvL1NlbGVjdEFsbFxyXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleC0tOyAvL1Nob3dNb3JlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNJbkZpbHRlck1vZGUgJiYgdGhpcy5Jc0xvYWRpbmdGaWx0ZXJMZXZlbEVsZW1lbnRzKHBhcmVudE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleCArPSBsb2FkZWRMYXN0TGV2ZWxOb2Rlc05vZGVzLmxlbmd0aDsgLy9oZXJlIHRoZXJlIGlzIG5vIGFkZGl0aW9uYWwgZXh0ZW5kZWQgcGFja2VkIG5vZGVcclxuICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSB0aGlzLl9maWx0ZXJFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm9kZTogSU1lbWJlck5vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7dGhpcy5fbG9hZE1vcmVOb2RlSWRQYXJ0fV8ke3RoaXMuR2V0UmFuZG9tSWQoKX1gLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCIuLi5TaG93TW9yZVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzU2hvd01vcmVNZW1iZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50VW5pcXVlTmFtZTogcGFyZW50Tm9kZS5pZCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0TG9hZFN0YXJ0SW5kZXg6IHN0YXJ0SW5kZXhcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlQWxsTm9kZSgpOiBJTWVtYmVyTm9kZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGU6IElNZW1iZXJOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuX3NlbGVjdEFsbE5vZGVJZCxcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiQWxsXCIsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVTZWxlY3RBbGxGaWx0cmVkTm9kZSgpOiBJTWVtYmVyTm9kZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGU6IElNZW1iZXJOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuX3NlbGVjdEFsbEZpbHRyZWRJZCxcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiU2VsZWN0IEFsbFwiLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlRGVTZWxlY3RBbGxGaWx0cmVkTm9kZSgpOiBJTWVtYmVyTm9kZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGU6IElNZW1iZXJOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuX2Rlc2VsZWN0QWxsRmlsdHJlZE5vZGVJZCxcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiRGVzZWxlY3QgQWxsXCIsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRSYW5kb21JZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnJlcGxhY2UoL1teYS16XSsvZywgXCJcIikuc3Vic3RyKDIsIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNTaG93TW9yZU1lbWJlcihub2RlT2JqOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZU9iai5kYXRhICYmIG5vZGVPYmouZGF0YS5pc1Nob3dNb3JlTWVtYmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc1NlbGVjdEFsbE1lbWJlcihub2RlT2JqOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZU9iai5pZCA9PT0gdGhpcy5fc2VsZWN0QWxsTm9kZUlkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc1NlbGVjdEZpbHRyZWRNZW1iZXIobm9kZU9iajogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVPYmouaWQgPT09IHRoaXMuX3NlbGVjdEFsbEZpbHRyZWRJZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNWaXJ0dWFsUm9vdE1lbWJlcihub2RlT2JqOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZU9iai5pZCA9PT0gXCIjXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzRGVTZWxlY3RGaWx0cmVkTWVtYmVyKG5vZGVPYmo6IElNZW1iZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlT2JqLmlkID09PSB0aGlzLl9kZXNlbGVjdEFsbEZpbHRyZWROb2RlSWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDcmVhdGVSZWZlcmVuY2VUcmVlKCRjb250YWluZXI6IEpRdWVyeSwgZGF0YTogT2JqZWN0W10pIHtcclxuICAgICAgICAgICAgJGNvbnRhaW5lci5qc3RyZWUoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3BsdWdpbnMnOiBbXCJjb3JlXCIsIFwiY2hlY2tib3hcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NvcmUnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhJzogZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2NoZWNrX2NhbGxiYWNrJzogKG9wZXJhdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wZXJhdGlvbiA9PT0gXCJjcmVhdGVfbm9kZVwiIHx8IG9wZXJhdGlvbiA9PT0gXCJkZWxldGVfbm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9KS5vbihcImxvYWRlZC5qc3RyZWVcIixcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmpzdHJlZShcIm9wZW5fYWxsXCIpO1xyXG4gICAgICAgICAgICAgICAgfSkub24oXCJyZWFkeS5qc3RyZWVcIixcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgZGF0YS5mb3JFYWNoKHg9PnRoaXMuUmVmZXJlbmNlSnN0cmVlSW5zdGFuY2UuY3JlYXRlX25vZGUoXCIjXCIseCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIFNlYXJjaCgpIHtcclxuICAgICAgICAgICAgdGhpcy5DbGVhckZpbHRlcihmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuU2VhcmNoQ29yZSh0aGlzLl92aWV3LlNlYXJjaFBhdHRlcm4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgU2hvd09ubHlTZWxlY3RlZCgpIHtcclxuICAgICAgICAgICAgdGhpcy5DbGVhckZpbHRlcihmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuRGlzcGxheU9ubHlTZWxlY3RlZEVsZW1lbnRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBTaG93T25seURlU2VsZWN0ZWQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQ2xlYXJGaWx0ZXIoZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLkRpc3BsYXlPbmx5RGVzZWxlY3RlZEVsZW1lbnRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBTaG93QWxsKCkge1xyXG4gICAgICAgICAgICB0aGlzLkNsZWFyRmlsdGVyKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIEV4ZWN1dGVDbGVhckZpbHRlcigpIHtcclxuICAgICAgICAgICAgdGhpcy5DbGVhckZpbHRlcih0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgU2F2ZVRyZWVTdGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29udHJvbFN0YXRlSW5mbyA9IG5ldyBDb250cm9sU3RhdGVJbmZvKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9jb250cm9sU3RhdGVJbmZvLlNhdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vZm9yIG11bHRpcGxlIHNlcXVlbnRpYWwgc2VhcmNoZXNcclxuICAgICAgICBFbnN1cmVTYXZlVHJlZVN0YXRlKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2NvbnRyb2xTdGF0ZUluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuU2F2ZVRyZWVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZXN0b3JlU3RhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29udHJvbFN0YXRlSW5mbykgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLl9jb250cm9sU3RhdGVJbmZvLlJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlc3RvcmVUcmVlU3RhdGUoc2F2ZWRTdGF0ZTogSU1lbWJlck5vZGVbXSwgb25SZWFkeUNhbGxiYWNrOiAoKSA9PiB2b2lkID0gKCkgPT4ge30pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNSZXN0b3JpbmdUcmVlU3RhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZCA9IHNhdmVkU3RhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVsb2FkVHJlZU5vZGUodGhpcy5HZXRUcmVlTm9kZShcIiNcIiksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRyb2xTdGF0ZUluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzUmVzdG9yaW5nVHJlZVN0YXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgb25SZWFkeUNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNlYXJjaENvcmUoc2VhcmNoUGF0dGVybjogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICQoXCIjcmV2ZXJ0U2VsZWN0aW9uXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBcInRydWVcIik7XHJcbiAgICAgICAgICAgIHRoaXMuSXNJblN0YXR1c0ZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuRmlsdGVyQ29yZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBGaWx0ZXJDb3JlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIgPXRoaXMuX3N0YXRlTWFuYWdlckZhY3RvcnkuQ3JlYXRlKHRoaXMuX3N0YXRlTWFuYWdlci5HZXRSb290VHlwZSgpLCAtMSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuRW5zdXJlU2F2ZVRyZWVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLk1heFZpc2libGVFbGVtZW50c0xpbWl0UmVhY2hlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLkxvYWRlZEVsZW1lbnRzQ291bnQ9MDtcclxuICAgICAgICAgICAgdGhpcy5TaG93QWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5SZWxvYWRUcmVlTm9kZSh0aGlzLkdldFRyZWVOb2RlKFwiI1wiKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDbGVhckZpbHRlcihyZWxvYWRUcmVlPXRydWUsIGNsZWFyU2VhcmNoUGF0dGVybj1mYWxzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNMRUFSIFNFQVJDSDpcIik7XHJcbiAgICAgICAgICAgIHRoaXMuTWVyZ2VTdGF0ZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5DbGVhclNlYXJjaEhpZ2hsaWdodCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJTdGF0ZU1hbmFnZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLklzSW5TZWFyY2hGaWx0ZXJNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuSXNJblN0YXR1c0ZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyRWxlbWVudHNMb2FkTW9yZVN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlc1dpdGhvdXRGdWxsQ2hpbGRyZW5Db3VudExvb2t1cCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkTm9kZVVuaXFlTmFtZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2xlYXJTZWFyY2hQYXR0ZXJuKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3LkNsZWFyU2VhcmNoVGV4dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWxvYWRUcmVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlJlc3RvcmVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoXCIjcmV2ZXJ0U2VsZWN0aW9uXCIpLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIENsZWFyU2VhcmNoSGlnaGxpZ2h0KCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuSXNJblNlYXJjaEZpbHRlck1vZGUpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5DbGVhclNlYXJjaEhpZ2hsaWdodCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRXhwYW5kTm9kZXNUb1RhcmdldExldmVsKGxvYWRlZE5vZGVzOiBJTWVtYmVyTm9kZVtdLCB0YXJnZXRMZXZlbDogbnVtYmVyLCBleHBhbmRBbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KGxvYWRlZE5vZGVzLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+ICh4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10pLFxyXG4gICAgICAgICAgICAgICAgKGN1cnJlbnQsIHBhcmVudCwgbGV2ZWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGU6IElKc1RyZWVOb2RlU3RhdGUgPSBjdXJyZW50LnN0YXRlIHx8IChjdXJyZW50LnN0YXRlID0ge30pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXZlbCA8IHRhcmdldExldmVsIHx8IGV4cGFuZEFsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vcGVuZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGFzeW5jIEhhbmRsZVNlbGVjdGlvbkNoYW5nZWQoZGF0YToge2FjdGlvbjpzdHJpbmcsbm9kZTpJTWVtYmVyTm9kZX0pIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVNYW5hZ2VyID0gdGhpcy5HZXRDdXJyZW50TW9kZVN0YXRlTWFuYWdlcigpO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5hY3Rpb24gPT09IFwic2VsZWN0X25vZGVcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xpY2tlZE5vZGU6IElNZW1iZXJOb2RlID0gZGF0YS5ub2RlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZUlkID0gY2xpY2tlZE5vZGUuaWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWRyd2VkTm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldExldmVsRWxlbWVudHMgPSBuZXcgQWZmZWN0ZWROb2Rlc1NldCgpLkFkZCh0YXJnZXROb2RlSWQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYWZmZWN0ZWROb2RlcyA9IG5ldyBBZmZlY3RlZE5vZGVzU2V0KCkuQWRkKHRoaXMuX3NlbGVjdEFsbE5vZGVJZCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZnVsbFJlZHJhdyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldE5vZGVJZCA9PT0gdGhpcy5fc2VsZWN0QWxsTm9kZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uTW9kZSA9IHN0YXRlTWFuYWdlci5HZXRBbGxOb2RlU2VsZWN0aW9uU3RhdHVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3QgPSB0aGlzLkdldFNlbGVjdGlvbk1vZGVGcm9tQ2xpY2soc2VsZWN0aW9uTW9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWZmZWN0ZWROb2Rlcy5VbmlvbihzdGF0ZU1hbmFnZXIuUmVzZXQoaXNTZWxlY3QpKTtcclxuICAgICAgICAgICAgICAgICAgICBmdWxsUmVkcmF3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0Tm9kZUlkID09PSB0aGlzLl9zZWxlY3RBbGxGaWx0cmVkSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKGF3YWl0IHRoaXMuQXBwbHlTZXJ2ZXJTZWxlY2lvbkZvclNlYXJjaEZpbHRlcih0cnVlLCB0YXJnZXRMZXZlbEVsZW1lbnRzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLklzSW5TdGF0dXNGaWx0ZXJNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24oYXdhaXQgdGhpcy5BcHBseVNlcnZlclNlbGVjaW9uRm9yU3RhdHVzRmlsdGVyKHRydWUsIHRhcmdldExldmVsRWxlbWVudHMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHN0YXRlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmdWxsUmVkcmF3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0Tm9kZUlkID09PSB0aGlzLl9kZXNlbGVjdEFsbEZpbHRyZWROb2RlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc0luU2VhcmNoRmlsdGVyTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKGF3YWl0IHRoaXMuQXBwbHlTZXJ2ZXJTZWxlY2lvbkZvclNlYXJjaEZpbHRlcihmYWxzZSwgdGFyZ2V0TGV2ZWxFbGVtZW50cykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5Jc0luU3RhdHVzRmlsdGVyTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKGF3YWl0IHRoaXMuQXBwbHlTZXJ2ZXJTZWxlY2lvbkZvclN0YXR1c0ZpbHRlcihmYWxzZSwgdGFyZ2V0TGV2ZWxFbGVtZW50cykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxSZWRyYXcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25Nb2RlID0gc3RhdGVNYW5hZ2VyLkdldFNlbGVjdGlvblN0YXR1cyhjbGlja2VkTm9kZS5wYXJlbnRzLCB0YXJnZXROb2RlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzU2VsZWN0ID0gdGhpcy5HZXRTZWxlY3Rpb25Nb2RlRnJvbUNsaWNrKHNlbGVjdGlvbk1vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24odGhpcy5BZGRVc2VyQ2hhbmdlZE5vZGVUb1N0YXRlKGNsaWNrZWROb2RlLCBpc1NlbGVjdCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuUmVkcmF3QWZmZWN0ZWROb2RlcyhhZmZlY3RlZE5vZGVzLCB0YXJnZXRMZXZlbEVsZW1lbnRzLCBmdWxsUmVkcmF3KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuTG9nKHN0YXRlTWFuYWdlciwgYWZmZWN0ZWROb2Rlcy5Ub0FycmF5KCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEdldEN1cnJlbnRNb2RlU3RhdGVNYW5hZ2VyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5Jc0luRmlsdGVyTW9kZSA/IHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlciA6IHRoaXMuX3N0YXRlTWFuYWdlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0U2VsZWN0aW9uTW9kZUZyb21DbGljayhzZWxlY3Rpb25Nb2RlOiBTZWxlY3Rpb25Nb2RlKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3Rpb25Nb2RlID09PSBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQgfHwgc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJpdmF0ZSBSZWRyYXdBZmZlY3RlZE5vZGVzKGFmZmVjdGVkTm9kZXM6IEFmZmVjdGVkTm9kZXNTZXQsIHRhcmdldExldmVsRWxlbWVudHM6IEFmZmVjdGVkTm9kZXNTZXQsIGZ1bGxSZWRyYXc6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgaWYgKGZ1bGxSZWRyYXcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVkcmF3Tm9kZSh0aGlzLkdldFRyZWVOb2RlKFwiI1wiKSx0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZmZlY3RlZE5vZGVzLkZvckVhY2goKGlkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWQgIT09IFwiI1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlZXBEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldExldmVsRWxlbWVudHMuQ29udGFpbnMoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBEb3duID0gdHJ1ZTsgLy93ZSB3YW50IGZ1bGwgcmVmcmVzaCBkb3duIGJlY2F1c2Ugbm90IGFsbCBub2RlcyBleGlzdCBpbiBzdGF0ZSBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZTogSU1lbWJlck5vZGUgPSB0aGlzLkdldFRyZWVOb2RlKGlkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92aWV3LlJlZHJhd05vZGUobm9kZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVlcERvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5fZC5mb3JFYWNoKGNoaWxkSWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5HZXRUcmVlTm9kZShjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmlldy5SZWRyYXdOb2RlKGNoaWxkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBMb2coc3RhdGVNYW5hZ2VyOiBJRmlsdGVyU3RhdGVNYW5hZ2VyLCBhZmZlY3RlZE5vZGVzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFGRkVDVEVEIE5PREVTXCIsIGFmZmVjdGVkTm9kZXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJFRFJBV0VEIE5PREVTXCIsIHRoaXMuX3JlZHJ3ZWROb2Rlcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU1RBVEVcIiwgc3RhdGVNYW5hZ2VyLkdldFN0YXRlKCkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZU1hbmFnZXIuUHJpbnQoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBBZGRVc2VyQ2hhbmdlZE5vZGVUb1N0YXRlKG5vZGU6IElNZW1iZXJOb2RlLCBpc1NlbGVjdDogYm9vbGVhbik6IEFmZmVjdGVkTm9kZXNTZXQge1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZU1hbmFnZXIgPSB0aGlzLkdldEN1cnJlbnRNb2RlU3RhdGVNYW5hZ2VyKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzU3BlY2lhbE5vZGUobm9kZSkpIHJldHVybiBBZmZlY3RlZE5vZGVzU2V0LkVtcHR5O1xyXG4gICAgICAgICAgICBjb25zdCBzb3J0ZWRQYXJlbnRzOiBFeHRlbmRlZEZpbHRlckl0ZW1bXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUucGFyZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50Tm9kZUlkID0gbm9kZS5wYXJlbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE5vZGVJZCAhPT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5HZXRUcmVlTm9kZShwYXJlbnROb2RlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlckl0ZW0gPSB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShwYXJlbnROb2RlLCBzdGF0ZU1hbmFnZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRlZFBhcmVudHMucHVzaChmaWx0ZXJJdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRGaWx0ZXJOb2RlID0gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUobm9kZSwgc3RhdGVNYW5hZ2VyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlTWFuYWdlci5BZGROb2Rlcyhzb3J0ZWRQYXJlbnRzLCB0YXJnZXRGaWx0ZXJOb2RlLCBpc1NlbGVjdCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShub2RlOiBJTWVtYmVyTm9kZSwgc3RhdGVNYW5hZ2VyOiBJRmlsdGVyU3RhdGVNYW5hZ2VyKTogRXh0ZW5kZWRGaWx0ZXJJdGVtIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkcmVuQ291bnQgPSAtMTtcclxuICAgICAgICAgICAgbGV0IGZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSAtMTtcclxuICAgICAgICAgICAgbGV0IHBhcmVudFVuaXF1ZU5hbWU6IHN0cmluZyA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBsZXZlbCA9IC0xO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5pZCA9PT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuQ291bnQgPSB0aGlzLl9tZXRhZGF0YS5Sb290TWVtYmVyc1RvdGFsQ291bnQ7XHJcbiAgICAgICAgICAgICAgICBmaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50ID0gLTE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRVbmlxdWVOYW1lID0gbm9kZS5kYXRhLnBhcmVudFVuaXF1ZU5hbWUgfHwgXCIjXCI7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbkNvdW50ID0gbm9kZS5kYXRhLmNoaWxkcmVuVG90YWxDb3VudDtcclxuICAgICAgICAgICAgICAgIGZpbHRyZWRDaGlsZHJlblRvdGFsQ291bnQgPSBub2RlLmRhdGEuZmlsdHJlZENoaWxkcmVuVG90YWxDb3VudDtcclxuICAgICAgICAgICAgICAgIGxldmVsID0gbm9kZS5kYXRhLmxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZU1hbmFnZXIuQ3JlYXRlSXRlbShub2RlLmlkLCBwYXJlbnRVbmlxdWVOYW1lLCBjaGlsZHJlbkNvdW50LCBmaWx0cmVkQ2hpbGRyZW5Ub3RhbENvdW50LCBsZXZlbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIYW5kbGVUcmVlUmVkcmF3Tm9kZShlOiBJSnN0cmVlUmVkcmF3Tm9kZUFyZ3M8YW55LCBhbnk+KSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50Tm9kZTogSU1lbWJlck5vZGUgPSBlLkN1cnJlbnROb2RlT2JqO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc1ZpcnR1YWxSb290TWVtYmVyKGN1cnJlbnROb2RlKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgc3RhdGVNYW5hZ2VyID0gdGhpcy5HZXRDdXJyZW50TW9kZVN0YXRlTWFuYWdlcigpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWRyd2VkTm9kZXMucHVzaChjdXJyZW50Tm9kZS5pZCk7XHJcbiAgICAgICAgICAgIGNvbnN0ICRsaUVsZW1lbnQgPSAkKGUuQ3VycmVudE5vZGVFbGVtZW50KTtcclxuICAgICAgICAgICAgY29uc3QgJGFuY2hvciA9ICRsaUVsZW1lbnQuY2hpbGRyZW4oXCIuanN0cmVlLWFuY2hvclwiKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNTaG93TW9yZU1lbWJlcihjdXJyZW50Tm9kZSkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuSXNTZWxlY3RGaWx0cmVkTWVtYmVyKGUuQ3VycmVudE5vZGVPYmopIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLklzRGVTZWxlY3RGaWx0cmVkTWVtYmVyKGUuQ3VycmVudE5vZGVPYmopKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5jaG9yLmNoaWxkcmVuKFwiLmpzdHJlZS1jaGVja2JveFwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRhbmNob3IuY2hpbGRyZW4oXCIuanN0cmVlLXRoZW1laWNvblwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0aW9uTW9kZTogU2VsZWN0aW9uTW9kZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLklzSW5GaWx0ZXJNb2RlICYmIHRoaXMuX25vZGVzV2l0aG91dEZ1bGxDaGlsZHJlbkNvdW50TG9va3VwW2UuQ3VycmVudE5vZGVPYmouaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGFuY2hvci5hZGRDbGFzcyhcImNvbWFyY2gtZGlzYWJsZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uTW9kZSA9IFNlbGVjdGlvbk1vZGUuVW5kZXRlcm1pbmVkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc1NlbGVjdEFsbE1lbWJlcihlLkN1cnJlbnROb2RlT2JqKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25Nb2RlID0gc3RhdGVNYW5hZ2VyLkdldEFsbE5vZGVTZWxlY3Rpb25TdGF0dXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25Nb2RlID0gc3RhdGVNYW5hZ2VyLkdldFNlbGVjdGlvblN0YXR1cyhlLkN1cnJlbnROb2RlT2JqLnBhcmVudHMsIGUuQ3VycmVudE5vZGVPYmouaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCAkY2hlY2tib3hFbGVtZW50ID0gJChcIjxpPlwiKS5hZGRDbGFzcyhcImpzdHJlZS1pY29uIGpzdHJlZS1jaGVja2JveFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25Nb2RlID09PSBTZWxlY3Rpb25Nb2RlLlVuZGV0ZXJtaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRjaGVja2JveEVsZW1lbnQuYWRkQ2xhc3MoXCJqc3RyZWUtY29tYXJjaC11bmRldGVybWluZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkY2hlY2tib3hFbGVtZW50LmFkZENsYXNzKFwianN0cmVlLWNvbWFyY2gtc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRjaGVja2JveEVsZW1lbnQuYWRkQ2xhc3MoXCJqc3RyZWUtY29tYXJjaC1kZXNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuSXNJblNlYXJjaEZpbHRlck1vZGUgJiYgY3VycmVudE5vZGUuZGF0YSAmJiBjdXJyZW50Tm9kZS5kYXRhLmxldmVsID09PSB0aGlzLl92aWV3LkZpbHRlckxldmVsTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRleHQgPSAkYW5jaG9yLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VhcmNoUGF0dGVybiA9IHRoaXMuX3ZpZXcuU2VhcmNoUGF0dGVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGV4dC50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoUGF0dGVybi50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZWZpeCA9IHRleHQuc3Vic3RyaW5nKDAsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlYXJjaENvbnRlbnQgPSB0ZXh0LnN1YnN0cmluZyhpbmRleCwgaW5kZXggKyBzZWFyY2hQYXR0ZXJuLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3N0Zml4ID0gdGV4dC5zdWJzdHJpbmcoaW5kZXggKyBzZWFyY2hQYXR0ZXJuLmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLlJlbW92ZU9ubHlUZXh0SGFjaygkYW5jaG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGFuY2hvci5hcHBlbmQocHJlZml4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGFuY2hvci5hcHBlbmQoJChcIjxzcGFuPlwiKS50ZXh0KHNlYXJjaENvbnRlbnQpLmFkZENsYXNzKFwiY29tYXJjaC1zZWFyY2gtaGlnaGxpZ2h0XCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGFuY2hvci5hcHBlbmQocG9zdGZpeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRjaGVja2JveEVsZW1lbnQucHJlcGVuZFRvKCRhbmNob3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFJlbW92ZU9ubHlUZXh0SGFjaygkYW5jaG9yOiBKUXVlcnkpIHtcclxuICAgICAgICAgICAgJGFuY2hvci5jb250ZW50cygpLmZpbHRlcihmdW5jdGlvbigpIHtcclxuLy8gUmVTaGFycGVyIGRpc2FibGUgb25jZSBTdXNwaWNpb3VzVGhpc1VzYWdlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ub2RlVHlwZSA9PT0gMztcclxuICAgICAgICAgICAgfSkucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBBcHBseVNlcnZlclNlbGVjaW9uRm9yU2VhcmNoRmlsdGVyKGlzU2VsZWN0OiBib29sZWFuLCB0YXJnZXRMZXZlbEVsZW1lbnRzOiBBZmZlY3RlZE5vZGVzU2V0KTogUHJvbWlzZTxBZmZlY3RlZE5vZGVzU2V0PiB7XHJcbiAgICAgICAgICAgIHRoaXMuU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0TWVtYmVycyhuZXcgTWVtYmVyc1JlcXVlc3QodGhpcy5fdmlldy5GaWx0ZXJMZXZlbCxcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tZXRhZGF0YS5BbGxMZXZlbHNNZW1iZXJzVG90YWxDb3VudCArIDEsXHJcbiAgICAgICAgICAgICAgICBuZXcgTWVtYmVyRmlsdGVyKHRoaXMuX3ZpZXcuU2VhcmNoUGF0dGVybiwgdGhpcy5fdmlldy5NZW1iZXJGaWx0ZXJUeXBlKSkpKS5GaWx0ZXJJbmZvO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuUHJvY2Vzc1NlcnZlckxvYWRlZFNlbGVjdGlvbihyZXNwb25zZSwgaXNTZWxlY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgQXBwbHlTZXJ2ZXJTZWxlY2lvbkZvclN0YXR1c0ZpbHRlcihpc1NlbGVjdDogYm9vbGVhbiwgdGFyZ2V0TGV2ZWxFbGVtZW50czogQWZmZWN0ZWROb2Rlc1NldCk6IFByb21pc2U8QWZmZWN0ZWROb2Rlc1NldD4ge1xyXG4gICAgICAgICAgICB0aGlzLlNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IChhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldE1lbWJlcnNCeVN0YXR1cyhcclxuICAgICAgICAgICAgICAgIG5ldyBHZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0KHRoaXMuX3ZpZXcuRmlsdGVyTGV2ZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tZXRhZGF0YS5BbGxMZXZlbHNNZW1iZXJzVG90YWxDb3VudCArIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXR1c0ZpbHRlcixcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZU1hbmFnZXIuU2VyaWFsaXplKCkpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyKSkuRmlsdGVySW5mbztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlByb2Nlc3NTZXJ2ZXJMb2FkZWRTZWxlY3Rpb24ocmVzcG9uc2UsIGlzU2VsZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgUHJvY2Vzc1NlcnZlckxvYWRlZFNlbGVjdGlvbihyZXNwb25zZTogSUZpbHRlckluZm8sIGlzU2VsZWN0OiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFmZmVjdGVkTm9kZXMgPSBuZXcgQWZmZWN0ZWROb2Rlc1NldCgpO1xyXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IE1lbWJlck5vZGVzSGVscGVyLkhpZXJhcmNoaXplTm9kZXMocmVzcG9uc2UuTGFzdExldmVsTm9kZXMsIHJlc3BvbnNlLlBhcmVudHNMb29rdXApO1xyXG4gICAgICAgICAgICB0aGlzLkFzc2lnbkxldmVsSW5kZXgobnVsbCwgbm9kZXMsIHRydWUpO1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4obm9kZXMsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4gKHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSksXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCwgaW5kZXgsIHBhdGgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50cyA9IHBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldmVsID09PSB0aGlzLl92aWV3LkZpbHRlckxldmVsTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24odGhpcy5fc3RhdGVNYW5hZ2VyLkFkZE5vZGVzKHBhcmVudHMubWFwKHggPT4gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUoeCwgdGhpcy5fc3RhdGVNYW5hZ2VyKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShjdXJyZW50LCB0aGlzLl9zdGF0ZU1hbmFnZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxFeHRlbmRlZEZpbHRlckl0ZW0+KCkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCksXHJcbiAgICAgICAgICAgICAgICB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyLlJlZnJlc2goKTtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyU3RhdGVNYW5hZ2VyLlJlc2V0KGlzU2VsZWN0KTtcclxuICAgICAgICAgICAgdGhpcy5IaWRlQWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGFmZmVjdGVkTm9kZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBFeHBhbmRBbGwoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT25Mb2FkQWxsXCIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5Ub3RhbEVsZW1lbnRzQ291bnQgPD0gdGhpcy5fb3B0aW9ucy5NYXhUb3RhbEVsZW1lbnRzQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhd2FpdCB0aGlzLlNob3dMb2FkQWxsVXNlckNvbmZpcm1hdGlvbigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5Mb2FkQWxsQ29yZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IHRoaXMuU2hvd0ZpcnN0TkVsZW1lbnRzQ29uZmlybWF0aW9uKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkxvYWRBbGxDb3JlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIExvYWRBbGxDb3JlKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc0luRmlsdGVyTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5DbGVhckZpbHRlcihmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5TYXZlVHJlZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuTG9hZGVkRWxlbWVudHNDb3VudD0wO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVsb2FkVHJlZU5vZGUodGhpcy5HZXRUcmVlTm9kZShcIiNcIiksICgpID0+IHsgdGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMgPSBmYWxzZTsgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBTaG93TG9hZEFsbFVzZXJDb25maXJtYXRpb24oKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXcuU2hvd0xvYWRBbGxVc2VyQ29uZmlybWF0aW9uKHRoaXMuVG90YWxFbGVtZW50c0NvdW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIFNob3dGaXJzdE5FbGVtZW50c0NvbmZpcm1hdGlvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICByZXR1cm4gdGhpcy5fdmlldy5TaG93Rmlyc3RORWxlbWVudHNDb25maXJtYXRpb24odGhpcy5Ub3RhbEVsZW1lbnRzQ291bnQsIHRoaXMuX29wdGlvbnMuTWF4VG90YWxFbGVtZW50c0NvdW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgU2hvd01heExpbWl0UmVhY2hlZCgpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5TaG93TWF4TGltaXRSZWFjaGVkKHRoaXMuX2lzTG9hZGluZ0FsbEVsZW1lbnRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTaG93Tm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlNob3dOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBIaWRlTm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LkhpZGVOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBVcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuVXBkYXRlVG90YWxFbGVtZW50c0xvYWRlZENvdW50KHRleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBHZXRMZXZlbE51bWJlckZyb21VbmlxdWVOYW1lKHVuaXF1ZU5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWV0YWRhdGEuU29ydGVkTGV2ZWxzLm1hcCh4ID0+IHguVW5pcXVlTmFtZSkuaW5kZXhPZih1bmlxdWVOYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBIaWRlQWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuSGlkZUFsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIYW5kbGVOb2RlTG9hZGVkKCkge1xyXG4gICAgICAgICAgICB0aGlzLkhpZGVBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgSGFuZGxlVHJlZVJlYWR5KCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LlNpZ25hbFRyZWVSZWFkeSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIEdldEpzdHJlZU5vZGVzRnJvbUJ5SWQocGFyZW50SWQ6IHN0cmluZyk6IElNZW1iZXJOb2RlW10ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5HZXRUcmVlTm9kZShwYXJlbnRJZCkuY2hpbGRyZW4ubWFwKGlkID0+IHRoaXMuR2V0VHJlZU5vZGUoaWQpKS5maWx0ZXIoeCA9PiAhdGhpcy5Jc1NlbGVjdEFsbE1lbWJlcih4KSAmJiAhdGhpcy5Jc1Nob3dNb3JlTWVtYmVyKHgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgUmVzZXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5SZXNldEludGVybmFsU3RhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5EZXN0cm95VHJlZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEZXN0cm95VHJlZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmlldy5EZXN0cm95VHJlZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgQ29ubmVjdChjb25uZWN0aW9uU3RyaW5nOiBzdHJpbmcsIGZpZWxkVW5pcXVlTmFtZTogc3RyaW5nLCBzYXZlZFN0YXRlOiBJRmlsdGVySXRlbSkge1xyXG4gICAgICAgICAgICB0aGlzLlJlc2V0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlJlZnJlc2hUcmVlKGNvbm5lY3Rpb25TdHJpbmcsIGZpZWxkVW5pcXVlTmFtZSwgc2F2ZWRTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgR2V0U3RhdGUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZU1hbmFnZXIuR2V0QWxsTm9kZVNlbGVjdGlvblN0YXR1cygpID09PSBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZU1hbmFnZXIuU2VyaWFsaXplKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBNZXJnZVN0YXRlcygpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLklzSW5GaWx0ZXJNb2RlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuTWVyZ2VTdGF0ZUNvcmUodGhpcy5HZXRKc3RyZWVOb2Rlc0Zyb21CeUlkKFwiI1wiKSwgdGhpcy5fdmlldy5GaWx0ZXJMZXZlbE51bWJlciwgW10pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTWVyZ2VTdGF0ZUNvcmUoc3RhcnROb2RlczogSU1lbWJlck5vZGVbXSwgdGFyZ2V0TGV2ZWw6IG51bWJlciwgZXh0ZW5hbFBhcmVudHM6IElNZW1iZXJOb2RlW10pIHtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KHN0YXJ0Tm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHRoaXMuR2V0SnN0cmVlTm9kZXNGcm9tQnlJZCh4LmlkKSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsLCBpbmRleCwgcGF0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5Jc1NwZWNpYWxOb2RlKGN1cnJlbnQpICYmIGN1cnJlbnQuZGF0YS5sZXZlbCA9PT0gdGFyZ2V0TGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50cyA9IGV4dGVuYWxQYXJlbnRzLmNvbmNhdChwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uTW9kZSA9IHRoaXMuX2ZpbHRlclN0YXRlTWFuYWdlci5HZXRTZWxlY3Rpb25TdGF0dXMocGFyZW50cy5tYXAoeCA9PiB4LmlkKSwgY3VycmVudC5pZCwgbmV3IEJhY2t3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxzdHJpbmc+KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHNlbGVjdGlvbk1vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBTZWxlY3Rpb25Nb2RlLlNlbGVjdGVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5TaW11bGF0ZVNlbGVjdGlvbkNoYW5nZShwYXJlbnRzLCBjdXJyZW50LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFNlbGVjdGlvbk1vZGUuRGVzZWxlY3RlZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuU2ltdWxhdGVTZWxlY3Rpb25DaGFuZ2UocGFyZW50cywgY3VycmVudCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQuc3RhdGUubG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgbGVhZiBpcyB1bmRldGVybWluZWQgYW5kIG5vdCBsb2FkZWQgaXQgbWVhbnMgdGhhdCB0aGVyZSBpcyBzZWxlY3Rpb24gb24gbG93ZXIgbGV2ZWxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoaXMgaXMgb25seSB1c2VyIHZpc2libGUgc3RhdGUgd2hpY2ggbWVhbnMgdGhhdCB1c2VyIGRvZXMgbm90IGV4cGFuZCAsbG9hZCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgbW9kaWZ5IHNlbGVjdGlvbiBpbiB0aGlzIGJyYW5jaCBzbyB3ZSBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChjdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLk1lcmdlU3RhdGVDb3JlKHRoaXMuR2V0SnN0cmVlTm9kZXNGcm9tQnlJZChjdXJyZW50LmlkKSwgY3VycmVudC5kYXRhLmxldmVsICsgMSwgcGFyZW50cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3Rvcnk8SU1lbWJlck5vZGU+KCksXHJcbiAgICAgICAgICAgICAgICB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlci5SZWZyZXNoKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzVHJlZUxlYWYoY3VycmVudDogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQuY2hpbGRyZW4ubGVuZ3RoID09PSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBTaW11bGF0ZVNlbGVjdGlvbkNoYW5nZShwYXJlbnRzOiBJTWVtYmVyTm9kZVtdLCBjdXJyZW50OiBJTWVtYmVyTm9kZSwgaXNTZWxlY3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyLkFkZE5vZGVzKHBhcmVudHMubWFwKHggPT4gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUoeCwgdGhpcy5fc3RhdGVNYW5hZ2VyKSksXHJcbiAgICAgICAgICAgICAgICB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShjdXJyZW50LCB0aGlzLl9zdGF0ZU1hbmFnZXIpLFxyXG4gICAgICAgICAgICAgICAgaXNTZWxlY3QsXHJcbiAgICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTxFeHRlbmRlZEZpbHRlckl0ZW0+KCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJc1N0YXRlTGVhZihjdXJyZW50OiBJRmlsdGVySXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIWN1cnJlbnQuQ2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFJldmVydFNlbGVjdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVNYW5hZ2VyID0gdGhpcy5HZXRDdXJyZW50TW9kZVN0YXRlTWFuYWdlcigpO1xyXG4gICAgICAgICAgICBzdGF0ZU1hbmFnZXIuUmV2ZXJ0U2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuUmVkcmF3Tm9kZShcIiNcIiwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIERpc3BsYXlPbmx5U2VsZWN0ZWRFbGVtZW50cygpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPbkRpc3BsYXlPbmx5U2VsZWN0ZWRFbGVtZW50c1wiKTtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXR1c0ZpbHRlciA9IEZpbHRlckl0ZW1TdGF0ZS5DaGVja2VkO1xyXG4gICAgICAgICAgICB0aGlzLkRpc3BsYXlPbmx5RWxlbWVudHNDb3JlKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEaXNhYmxlU2VhcmNoQm94KCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LkRpc2FibGVTZWFyY2hCb3goKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgRW5hYmxlU2VhcmNoQm94KCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LkVuYWJsZVNlYXJjaEJveCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEaXNwbGF5T25seURlc2VsZWN0ZWRFbGVtZW50cygpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPbkRpc3BsYXlPbmx5RGVzZWxlY3RlZEVsZW1lbnRzXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdHVzRmlsdGVyID0gRmlsdGVySXRlbVN0YXRlLlVuY2hlY2tlZDtcclxuICAgICAgICAgICAgdGhpcy5EaXNwbGF5T25seUVsZW1lbnRzQ29yZSgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgRGlzcGxheU9ubHlFbGVtZW50c0NvcmUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuSXNJblNlYXJjaEZpbHRlck1vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5Jc0luU3RhdHVzRmlsdGVyTW9kZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuRmlsdGVyQ29yZSgpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgR2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuT3B0aW9ucy5SZXNvdXJjZXNba2V5XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENvbGxhcHNlQWxsKCkge1xyXG4gICAgICAgICAgICB0aGlzLl92aWV3LkNvbGxhcHNlQWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBHZXRUcmVlTm9kZShpZDphbnksYXNEb20/OmJvb2xlYW4pIHsgcmV0dXJuIHRoaXMuX3ZpZXcuR2V0VHJlZU5vZGUoaWQsYXNEb20pOyB9XHJcbiAgICB9XHJcblxyXG59Il19