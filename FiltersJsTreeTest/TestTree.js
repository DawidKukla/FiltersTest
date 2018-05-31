var TestTree;
(function (TestTree_1) {
    var RandomTreeGenerator = RandomTreeGeneratorModule.RandomTreeGenerator;
    var FilterStateManager = FilterStateManagerModule.FilterStateManager;
    var ExtendedFilterItem = FilterStateManagerModule.ExtendedFilterItem;
    var SelectionMode = FilterStateManagerModule.SelectionMode;
    var MemberNodesHelper = TestTree_1.Common.MemberNodesHelper;
    var AffectedNodesSet = TestTree_1.Common.AffectedNodesSet;
    var TreeHelpers = Comarch.Utils.TreeUtils.TreeHelpers;
    var ForwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
    var MetadataRequest = TestTree_1.Common.MetadataRequest;
    var MembersRequest = TestTree_1.Common.MembersRequest;
    var LeafMembersRequest = TestTree_1.Common.LeafMembersRequest;
    var ChildrenRequest = TestTree_1.Common.ChildrenRequest;
    var MemberFilter = TestTree_1.Common.MemberFilter;
    var FilterService = TestTree_1.FilterServiceModule.FilterService;
    class TestTree {
        constructor() {
            this._dataPackageSize = 0;
            this._maxTotalElementsCount = 0;
            this._data = [];
            this._elementsToLoadStartIndex = 0;
            this._tempTreeState = null;
            this._searchElementsLoadMoreStartIndex = 0;
            this._loadMoreNodeIdPart = "ShowMore";
            this._selectAllNodeId = "SelectAll";
            this._redrwedNodes = [];
            this._searchModeIsSelectAllSelected = true;
            this._isLoadingAllElements = false;
            this._isInSearchMode = false;
            this._loadedElementsCount = 0;
            this._metadata = null;
            console.log("TestTree created.");
            this._generator = new RandomTreeGenerator();
            this.Init();
        }
        get IsInSearchMode() { return Boolean(this._isInSearchMode); }
        ;
        get $ReferenceJstreeContainer() {
            return this._$referenceJstreeContainer || (this._$referenceJstreeContainer = $("#referenceJstreeContainer"));
        }
        get ReferenceJstreeInstance() {
            return $.jstree.reference(this.$ReferenceJstreeContainer);
        }
        get $ReferenceJstreeContainer2() {
            return this._$referenceJstreeContainer2 || (this._$referenceJstreeContainer2 = $("#referenceJstreeContainer2"));
        }
        get ReferenceJstreeInstance2() {
            return $.jstree.reference(this.$ReferenceJstreeContainer2);
        }
        get $JstreeContainer() {
            return this._$jstreeContainer || (this._$jstreeContainer = $("#jstreeContainer"));
        }
        get JstreeInstance() {
            return $.jstree.reference(this.$JstreeContainer);
        }
        get $SearchTextBox() {
            return $("#searchTxt");
        }
        get $LevelsSelect() {
            return $("#levelsSelect");
        }
        get $SearchButton() {
            return $("#searchButton");
        }
        get SearchLevel() {
            return this.$LevelsSelect.val();
        }
        get LastLevelIndex() {
            return 4;
        }
        get TotalElementsCount() {
            return this._metadata.AllLevelsMembersTotalCount;
        }
        get MemberFilterType() {
            return parseInt($("#memberFilterType").val());
        }
        get ConnectionString() {
            return $("#connectionStringTxt").val();
        }
        get FieldUniqueName() {
            return $("#fieldUniqueNameTxt").val();
        }
        async Init() {
            this.ShowAllTreeLoadingIndicator();
            this._dataPackageSize = parseInt($("#packageSize").val());
            this._maxTotalElementsCount = parseInt($("#totalElementsCount").val());
            this._service = new FilterService(this.ConnectionString);
            this._metadata = (await this._service.GetMetadata(new MetadataRequest(this.FieldUniqueName, []))).Metadata;
            this.CreateLevelsSelect();
            this._stateManager = new FilterStateManager(this._metadata.RootMembersTotalCount);
            this.BindEvents();
            this.GenerateData();
            this._stateManager.ClearState(false);
            this.RefreshTree();
        }
        BindEvents() {
            $("#packageSize").change(() => {
                this._dataPackageSize = parseInt($("#packageSize").val());
            });
            $("#totalElementsCount").change(() => {
                this._maxTotalElementsCount = parseInt($("#totalElementsCount").val());
            });
            this.$SearchButton.click(this.OnSearch.bind(this));
            $("#clearSearchButton").click(this.OnClearSearch.bind(this));
            $("#loadState").click(this.OnLoadState.bind(this));
            $("#saveState").click(this.OnSaveState.bind(this));
            $("#displayAllElements").click(this.OnDisplayAllElements.bind(this));
            $("#displayOnlySelectedElements").click(this.OnDisplayOnlySelectedElements.bind(this));
            $("#displayOnlyDeselectedElements").click(this.OnDisplayOnlyDeselectedElements.bind(this));
            $("#loadAll").click(this.OnLoadAll.bind(this));
        }
        OnLoadState() {
            this._stateManager.Deserialize((window["_fakeState"]));
            this.RefreshTree();
        }
        CreateLevelsSelect() {
            this.$LevelsSelect.append(this._metadata.SortedLevels.map(l => $("<option>").text(l.Caption).val(l.UniqueName)));
        }
        OnSaveState() {
            const state = this._stateManager.Serialize();
            console.log(state);
            console.log(JSON.stringify(state));
        }
        BindJsTreeEvents() {
            this.$JstreeContainer.on("changed.jstree", this.OnSelectionChanged.bind(this));
            this.$JstreeContainer.on("comarch_redraw_node.comarch.jstree", this.OnRedrawNode.bind(this));
            this.$JstreeContainer.on("load_node.jstree", this.OnNodeLoaded.bind(this));
        }
        RefreshTree() {
            this.$JstreeContainer.jstree("destroy");
            this.$JstreeContainer.addClass("jstree-checkbox-selection").jstree({
                'plugins': ["core", , "comarch_redraw_node", "conditionalselect"],
                'core': {
                    'data': (obj, cb) => {
                        this.GetNodeData(obj, cb);
                    },
                    'strings': {
                        'Loading ...': ' '
                    },
                    'check_callback': (operation) => {
                        return operation === "create_node" || operation === "delete_node";
                    },
                },
                'conditionalselect': this.OnConditionalSelect.bind(this)
            });
            this.BindJsTreeEvents();
        }
        GenerateData() {
            this._data = this._generator.GetRandomNodes(100);
            console.log(this._data);
        }
        async GetNodeData(obj, renderingCallback) {
            const loadedNodes = await this.LoadNodesCore(obj, this._elementsToLoadStartIndex);
            renderingCallback.call(this.JstreeInstance, loadedNodes);
        }
        async LoadNodesCore(obj, startIndex) {
            let loadedNodes;
            if (this._isLoadingMoreElement || this._isChangingDisplayStatus || this._isRestoringTreeState) {
                loadedNodes = this._elementsToLoad;
            }
            else {
                loadedNodes = await this.LoadNodesFromServerCore(obj, startIndex);
            }
            return loadedNodes;
        }
        async LoadNodesFromServerCore(obj, startIndex) {
            let response;
            let createAllNode = false;
            if (obj.id === "#") {
                createAllNode = true;
                if (this.IsInSearchMode) {
                    response = (await this._service.GetMembers(new MembersRequest(this.SearchLevel, this._searchElementsLoadMoreStartIndex, this._dataPackageSize, new MemberFilter(this._searchPattern, this.MemberFilterType)))).FilterInfo;
                }
                else if (this._isLoadingAllElements) {
                    response = (await this._service.GetLeafMembers(new LeafMembersRequest(this.SearchLevel, this._elementsToLoadStartIndex, this._maxTotalElementsCount))).FilterInfo;
                }
                else {
                    response = (await this._service.GetMembers(new MembersRequest(this._metadata.SortedLevels[0].UniqueName, this._elementsToLoadStartIndex, this._dataPackageSize))).FilterInfo;
                }
            }
            else {
                response = (await this._service.GetChildren(new ChildrenRequest(obj.id, startIndex, this._dataPackageSize))).FilterInfo;
            }
            const nodesToLoad = this.PrepareDataToLoad(obj, response);
            var isWithinLimit = this.HandleLoadLimits(nodesToLoad);
            if (response.HasMoreMembers && isWithinLimit) {
                nodesToLoad.push(this.CreateLoadMoreNode(obj, response.LastLevelNodes));
            }
            if (createAllNode) {
                nodesToLoad.unshift(this.CreateAllNode());
            }
            return nodesToLoad;
        }
        PrepareDataToLoad(invokingNode, response) {
            let nodes = response.LastLevelNodes;
            var expandToLevelIndex = this.GetLevelNumberFromUniqueName(this.SearchLevel);
            var expandAll = false;
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
            return nodes;
        }
        IsLoadingWholeTree(invokingNode) {
            return (this.IsInSearchMode && this.IsLoadingSearchLevelElements(invokingNode)) || this._isLoadingAllElements;
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
        OnConditionalSelect(node) {
            let result = true;
            if (this.IsShowMoreMember(node)) {
                console.log("Loading More Nodes");
                this.LoadMoreNodes(node);
                result = false;
            }
            return result;
        }
        async LoadMoreNodes(targetNode) {
            this.ShowNodeLoadingIndicator(targetNode.id);
            const parentNode = this.JstreeInstance.get_node(targetNode.parent);
            this._elementsToLoadStartIndex = targetNode.data.nextLoadStartIndex;
            var existingNodes = [];
            parentNode.children.forEach(childId => {
                existingNodes.push(this.JstreeInstance.get_json(this.JstreeInstance.get_node(childId)));
            });
            existingNodes.pop();
            var existingNodesLookup = TreeHelpers.ConvertListToLookup(existingNodes, x => {
                return Array.isArray(x.children) ? x.children : [];
            }, x => x.id);
            const loadedNodes = await this.LoadNodesFromServerCore(parentNode, this._elementsToLoadStartIndex);
            TreeHelpers.TraverseListPreorder(loadedNodes, x => x.children, (currentNode) => {
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
            this._elementsToLoad = existingNodes;
            this._isLoadingMoreElement = true;
            this.JstreeInstance.load_node(parentNode, () => {
                this._isLoadingMoreElement = false;
                this._elementsToLoadStartIndex = 0;
                this._elementsToLoad.length = 0;
            });
        }
        ShowNodeLoadingIndicator(id) {
            let $liElement = $(this.JstreeInstance.get_node(id, true));
            $liElement.addClass("jstree-loading");
        }
        IsLoadingSearchLevelElements(parentNode) {
            let loadedNodesLevelId = -1;
            if (parentNode.data) {
                loadedNodesLevelId = parentNode.data.level;
            }
            loadedNodesLevelId++;
            if (loadedNodesLevelId <= this.GetLevelNumberFromUniqueName(this.SearchLevel)) {
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
            if (this.IsInSearchMode && this.IsLoadingSearchLevelElements(parentNode)) {
                this._searchElementsLoadMoreStartIndex += loadedLastLevelNodesNodes.length;
                startIndex = this._searchElementsLoadMoreStartIndex;
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
        GetRandomId() {
            return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(2, 10);
        }
        IsShowMoreMember(nodeObj) {
            return nodeObj.data && nodeObj.data.isShowMoreMember;
        }
        IsSelectAllMember(nodeObj) {
            return nodeObj.id === this._selectAllNodeId;
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
        OnSearch(e) {
            this._searchPattern = this.$SearchTextBox.val();
            console.log(this._searchPattern, this.SearchLevel);
            if (!Boolean(this._searchPattern)) {
                this.ClearSearch();
                return;
            }
            this.Search(this._searchPattern);
        }
        OnClearSearch(e) {
            this.ClearSearch(true);
        }
        SaveTreeState() {
            this._tempTreeState = this.JstreeInstance.get_json("#");
            this._tempLoadedElementsCount = this._loadedElementsCount;
        }
        EnsureSaveTreeState() {
            if (!this._tempTreeState) {
                this.SaveTreeState();
            }
        }
        GetCopyOfSavedTreeState() {
            return JSON.parse(JSON.stringify(this._tempTreeState));
        }
        RestoreTreeState(onReadyCallback = () => { }) {
            if (!this._tempTreeState)
                return;
            this._isRestoringTreeState = true;
            this._elementsToLoad = this._tempTreeState;
            this.UpdateTotalElementsLoadedCount(this._tempLoadedElementsCount);
            this.JstreeInstance.load_node(this.JstreeInstance.get_node("#"), () => {
                this._elementsToLoad = null;
                this._tempTreeState = null;
                this._isRestoringTreeState = false;
                onReadyCallback();
            });
        }
        Search(searchPattern) {
            this.ClearSearch(false);
            this._isInSearchMode = true;
            this.EnsureSaveTreeState();
            this.UpdateTotalElementsLoadedCount(0);
            this.ShowAllTreeLoadingIndicator();
            this.JstreeInstance.load_node(this.JstreeInstance.get_node("#"), () => { });
        }
        ClearSearch(reloadTree = true, clearSearchPattern = false) {
            console.log("CLEAR SEARCH:");
            this._isInSearchMode = false;
            this._searchElementsLoadMoreStartIndex = 0;
            this._searchModeIsSelectAllSelected = true;
            if (clearSearchPattern) {
                this.$SearchTextBox.val('');
            }
            if (reloadTree) {
                this.RestoreTreeState();
            }
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
        async OnSelectionChanged(e, data) {
            if (data.action === "select_node") {
                let isSelect = false;
                const targetNodeId = data.node.id;
                if (this.IsInSearchMode && targetNodeId === this._selectAllNodeId) {
                    isSelect = this._searchModeIsSelectAllSelected;
                }
                else {
                    const selectionMode = this._stateManager.GetSelectionStatus(data.node.parents, targetNodeId);
                    if (selectionMode === SelectionMode.Deselected || selectionMode === SelectionMode.Undetermined) {
                        isSelect = true;
                    }
                }
                var targetLevelElements = new AffectedNodesSet().Add(targetNodeId);
                this._redrwedNodes = [];
                const affectedNodes = new AffectedNodesSet().Add(this._selectAllNodeId);
                if (targetNodeId === this._selectAllNodeId) {
                    if (this.IsInSearchMode) {
                        affectedNodes.Union(await this.ChangeSelectionForAllSearchedElements(isSelect, targetLevelElements));
                    }
                    else {
                        affectedNodes.Union(this._stateManager.ClearState(isSelect));
                        this.JstreeInstance.redraw_node(this.JstreeInstance.get_node("#"), true, false, false);
                        this.Log(affectedNodes.ToArray());
                        return;
                    }
                }
                else {
                    affectedNodes.Union(this.AddNodeToState(data.node, isSelect));
                }
                affectedNodes.ForEach((id) => {
                    let deepDown = false;
                    if (id !== "#") {
                        if (targetLevelElements.Contains(id)) {
                            deepDown = true;
                        }
                        let node = this.JstreeInstance.get_node(id);
                        if (node) {
                            this.JstreeInstance.redraw_node(node, false, false, false);
                            if (deepDown) {
                                node.children_d.forEach(childId => {
                                    let child = this.JstreeInstance.get_node(childId);
                                    if (child) {
                                        this.JstreeInstance.redraw_node(child, false, false, false);
                                    }
                                });
                            }
                        }
                    }
                });
                this.Log(affectedNodes.ToArray());
            }
        }
        Log(affectedNodes) {
            console.log("AFFECTED NODES", affectedNodes);
            console.log("REDRAWED NODES", this._redrwedNodes);
            console.log("STATE", this._stateManager.GetState());
            console.log(this._stateManager.Print());
        }
        AddNodeToState(node, isSelect) {
            if (node.id === this._selectAllNodeId)
                return AffectedNodesSet.Empty;
            const sortedParents = [];
            for (let i = node.parents.length - 1; i >= 0; i--) {
                const parentNodeId = node.parents[i];
                if (parentNodeId !== "#") {
                    const parentNode = this.JstreeInstance.get_node(parentNodeId);
                    const filterItem = this.CreateFilterItemFromNode(parentNode);
                    sortedParents.push(filterItem);
                }
            }
            const targetFilterNode = this.CreateFilterItemFromNode(node);
            return this._stateManager.AddNodes(sortedParents, targetFilterNode, isSelect);
        }
        CreateFilterItemFromNode(node) {
            let childrenCount = 0;
            let parentUniqueName = null;
            if (node.id === "#") {
                childrenCount = this._metadata.RootMembersTotalCount;
            }
            else if (node.data) {
                parentUniqueName = node.data.parentUniqueName || "#";
                childrenCount = node.data.childrenTotalCount;
            }
            return new ExtendedFilterItem(node.id, parentUniqueName, childrenCount);
        }
        OnRedrawNode(eventObject, e) {
            this._redrwedNodes.push(e.CurrentNodeObj.id);
            if (e.CurrentNodeObj.id === "#")
                return;
            const $liElement = $(e.CurrentNodeElement);
            const $anchor = $liElement.children(".jstree-anchor");
            if (this.IsShowMoreMember(e.CurrentNodeObj)) {
                $anchor.children(".jstree-checkbox").remove();
                $anchor.children(".jstree-themeicon").remove();
            }
            else {
                let selectionMode;
                if (this.IsSelectAllMember(e.CurrentNodeObj)) {
                    selectionMode = this._stateManager.GetAllNodeSelectionStatus();
                }
                else {
                    selectionMode = this._stateManager.GetSelectionStatus(e.CurrentNodeObj.parents, e.CurrentNodeObj.id);
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
                $checkboxElement.prependTo($anchor);
            }
        }
        OnDisplayAllElements() {
            console.log("OnDisplayAllElements");
            this.DisplayAllElementsCore();
        }
        DisplayAllElementsCore(callback = () => { }) {
            this._isChangingDisplayStatus = true;
            this.RestoreTreeState(() => {
                this._isChangingDisplayStatus = false;
                callback();
            });
        }
        OnDisplayOnlySelectedElements() {
            console.log("OnDisplayOnlySelectedElements");
            this.DisplayOnlyElementsCore(true);
        }
        OnDisplayOnlyDeselectedElements() {
            console.log("OnDisplayOnlyDeselectedElements");
            this.DisplayOnlyElementsCore(false);
        }
        DisplayOnlyElementsCore(isShowSelected) {
            console.log("OnDisplayOnlySelectedElements");
            this.EnsureSaveTreeState();
            this._isChangingDisplayStatus = true;
            const temp = this.GetCopyOfSavedTreeState();
            this._elementsToLoad = this.TrimTreeBasedOnStatus(temp, isShowSelected ? SelectionMode.Deselected : SelectionMode.Selected);
            this.JstreeInstance.load_node(this.JstreeInstance.get_node("#"), () => {
                this._isChangingDisplayStatus = false;
            });
        }
        TrimTreeBasedOnStatus(input, targetStatus) {
            var parentsLookup = {};
            TreeHelpers.TraverseListPreorder(input, x => x.children, (current, parent, level, index) => {
                if (!this.IsSelectAllMember(current) && !this.IsShowMoreMember(current)) {
                    if (parent) {
                        parentsLookup[parent.id] = parent;
                    }
                    const parentIds = MemberNodesHelper.GetAllParentsNames(parentsLookup, current);
                    parentIds.push("#");
                    const selectionStatus = this._stateManager.GetSelectionStatus(parentIds, current.id);
                    if (selectionStatus === targetStatus) {
                        const childrenCollection = parent ? parent.children : input;
                        childrenCollection.splice(index, 1);
                        return false;
                    }
                    if (current.children.length) {
                        current.state.opened =
                            true;
                    }
                    return true;
                }
                return true;
            });
            return input;
        }
        async ChangeSelectionForAllSearchedElements(isSelect, targetLevelElements) {
            const affectedNodes = new AffectedNodesSet();
            var response = (await this._service.GetMembers(new MembersRequest(this.SearchLevel, 0, this._maxTotalElementsCount, new MemberFilter(this._searchPattern, this.MemberFilterType)))).FilterInfo;
            if (response.HasMoreMembers) {
                alert("Search result is to large. Limit your criteria.");
            }
            else {
                for (let node of response.LastLevelNodes) {
                    targetLevelElements.Add(node.id);
                    const parents = MemberNodesHelper.GetAllParents(response.ParentsLookup, node).map(node => {
                        var item = this.CreateFilterItemFromNode(node);
                        return item;
                    }).reverse();
                    parents.unshift(this.CreateFilterItemFromNode(this.JstreeInstance.get_node("#")));
                    affectedNodes.Union(this._stateManager.AddNodes(parents, this.CreateFilterItemFromNode(node), isSelect));
                }
                this._searchModeIsSelectAllSelected = !this._searchModeIsSelectAllSelected;
            }
            return affectedNodes;
        }
        async OnLoadAll() {
            console.log("OnLoadAll");
            if (this.TotalElementsCount <= this._maxTotalElementsCount) {
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
            if (this.IsInSearchMode) {
                this.ClearSearch(false, true);
            }
            this.SaveTreeState();
            this.UpdateTotalElementsLoadedCount(0);
            this._isLoadingAllElements = true;
            this.ShowAllTreeLoadingIndicator();
            this.JstreeInstance.load_node(this.JstreeInstance.get_node("#"), () => {
                this._isLoadingAllElements = false;
            });
        }
        async ShowLoadAllUserConfirmation() {
            return this.ShowLoadAllUserConfirmationCore(`Dimension contains ${this.TotalElementsCount} elements. Do you what load them all`);
        }
        async ShowFirstNElementsConfirmation() {
            return this.ShowLoadAllUserConfirmationCore(`Dimension contains ${this.TotalElementsCount} elements. Maximum elements that you can load is ${this._maxTotalElementsCount}. Do you what to load elements up to the limit.`);
        }
        async ShowLoadAllUserConfirmationCore(message) {
            return new Promise((resolve) => {
                var result = confirm(message);
                resolve(result);
            });
        }
        ShowMaxLimitReached() {
            alert("Maximum limit of loaded elments has been reached. Use search or limit your search criteria");
        }
        ShowNotAllElementsAreVisible() {
            $("#notAllElementsVisible").show();
        }
        HideNotAllElementsAreVisible() {
            $("#notAllElementsVisible").show();
        }
        UpdateTotalElementsLoadedCount(count) {
            this._loadedElementsCount = count;
            var text = `${this._loadedElementsCount}/${this.TotalElementsCount}`;
            $("#loadedElementsCount").text(text);
        }
        HandleLoadLimits(loadedNodes) {
            var currentRequestCounter = 0;
            var elementsToRemove = {};
            TreeHelpers.TraverseListPreorder(loadedNodes, x => x.children, (current) => {
                if (!this.JstreeInstance.get_node(current.id)) {
                    currentRequestCounter++;
                    if (this._loadedElementsCount + currentRequestCounter > this._maxTotalElementsCount) {
                        elementsToRemove[current.id] = true;
                    }
                }
                return true;
            }, new ForwardTreeTraversalIteratorFactory());
            TreeHelpers.TraverseListPreorder(loadedNodes, x => x.children, (current, parent, level, index) => {
                if (elementsToRemove[current.id]) {
                    var children = parent ? parent.children : loadedNodes;
                    children.splice(index, 1);
                }
                return true;
            });
            var elementsCountAfterLoad = this._loadedElementsCount + currentRequestCounter;
            if (elementsCountAfterLoad < this._maxTotalElementsCount) {
                this.ShowNotAllElementsAreVisible();
                this.UpdateTotalElementsLoadedCount(elementsCountAfterLoad);
            }
            else if (elementsCountAfterLoad === this._maxTotalElementsCount) {
                this.HideNotAllElementsAreVisible();
                this.UpdateTotalElementsLoadedCount(elementsCountAfterLoad);
                return false;
            }
            else {
                this.UpdateTotalElementsLoadedCount(elementsCountAfterLoad - Object.keys(elementsToRemove).length);
                this.ShowMaxLimitReached();
                return false;
            }
            return true;
        }
        GetLevelNumberFromUniqueName(uniqueName) {
            return this._metadata.SortedLevels.map(x => x.UniqueName).indexOf(uniqueName);
        }
        ShowAllTreeLoadingIndicator() {
            this.$JstreeContainer.addClass("comarch-whole-tree-loading");
        }
        HideAllTreeLoadingIndicator() {
            this.$JstreeContainer.removeClass("comarch-whole-tree-loading");
        }
        OnNodeLoaded(e, data) {
            console.log("OnNodeLoaded", arguments);
            this.HideAllTreeLoadingIndicator();
        }
    }
    TestTree_1.TestTree = TestTree;
})(TestTree || (TestTree = {}));
var page = new TestTree.TestTree();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFRyZWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUZXN0VHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLFFBQVEsQ0FrMEJqQjtBQWwwQkQsV0FBVSxVQUFRO0lBQ2QsSUFBTyxtQkFBbUIsR0FBRyx5QkFBeUIsQ0FBQyxtQkFBbUIsQ0FBQztJQUkzRSxJQUFPLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDO0lBQ3hFLElBQU8sa0JBQWtCLEdBQUcsd0JBQXdCLENBQUMsa0JBQWtCLENBQUM7SUFDeEUsSUFBTyxhQUFhLEdBQUcsd0JBQXdCLENBQUMsYUFBYSxDQUFDO0lBRTlELElBQU8saUJBQWlCLEdBQUcsV0FBQSxNQUFNLENBQUMsaUJBQWlCLENBQUM7SUFDcEQsSUFBTyxnQkFBZ0IsR0FBRyxXQUFBLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUVsRCxJQUFPLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDekQsSUFBTyxtQ0FBbUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQztJQUV6RyxJQUFPLGVBQWUsR0FBRyxXQUFBLE1BQU0sQ0FBQyxlQUFlLENBQUM7SUFFaEQsSUFBTyxjQUFjLEdBQUcsV0FBQSxNQUFNLENBQUMsY0FBYyxDQUFDO0lBQzlDLElBQU8sa0JBQWtCLEdBQUcsV0FBQSxNQUFNLENBQUMsa0JBQWtCLENBQUM7SUFDdEQsSUFBTyxlQUFlLEdBQUcsV0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDO0lBQ2hELElBQU8sWUFBWSxHQUFHLFdBQUEsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUcxQyxJQUFPLGFBQWEsR0FBRyxXQUFBLG1CQUFtQixDQUFDLGFBQWEsQ0FBQztJQUV6RDtRQXlGSTtZQXhGUSxxQkFBZ0IsR0FBUyxDQUFDLENBQUM7WUFDM0IsMkJBQXNCLEdBQVMsQ0FBQyxDQUFDO1lB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U0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTywyQkFBMkI7WUFDL0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDTywyQkFBMkI7WUFDL0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxZQUFZLENBQUMsQ0FBb0IsRUFBRSxJQUFJO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQ3ZDLENBQUM7S0FDSjtJQXZ5QlksbUJBQVEsV0F1eUJwQixDQUFBO0FBRUwsQ0FBQyxFQWwwQlMsUUFBUSxLQUFSLFFBQVEsUUFrMEJqQjtBQUVELElBQUksSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIFRlc3RUcmVlIHtcclxuICAgIGltcG9ydCBSYW5kb21UcmVlR2VuZXJhdG9yID0gUmFuZG9tVHJlZUdlbmVyYXRvck1vZHVsZS5SYW5kb21UcmVlR2VuZXJhdG9yO1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlID0gQ29tbW9uLklNZW1iZXJOb2RlO1xyXG4gICAgaW1wb3J0IElKc3RyZWVSZWRyYXdOb2RlQXJncyA9IENvbW1vbi5JSnN0cmVlUmVkcmF3Tm9kZUFyZ3M7XHJcbiAgICBpbXBvcnQgTW9ja1NlcnZpY2UgPSBNb2NrU2VydmljZU1vZHVsZS5Nb2NrU2VydmljZTtcclxuICAgIGltcG9ydCBGaWx0ZXJTdGF0ZU1hbmFnZXIgPSBGaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyO1xyXG4gICAgaW1wb3J0IEV4dGVuZGVkRmlsdGVySXRlbSA9IEZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5FeHRlbmRlZEZpbHRlckl0ZW07XHJcbiAgICBpbXBvcnQgU2VsZWN0aW9uTW9kZSA9IEZpbHRlclN0YXRlTWFuYWdlck1vZHVsZS5TZWxlY3Rpb25Nb2RlO1xyXG4gICAgaW1wb3J0IElUZXN0Tm9kZUxvb2t1cCA9IENvbW1vbi5JTWVtYmVyTm9kZUxvb2t1cDtcclxuICAgIGltcG9ydCBNZW1iZXJOb2Rlc0hlbHBlciA9IENvbW1vbi5NZW1iZXJOb2Rlc0hlbHBlcjtcclxuICAgIGltcG9ydCBBZmZlY3RlZE5vZGVzU2V0ID0gQ29tbW9uLkFmZmVjdGVkTm9kZXNTZXQ7XHJcbiAgICBpbXBvcnQgSUpzVHJlZU5vZGVTdGF0ZSA9IENvbW1vbi5JSnNUcmVlTm9kZVN0YXRlO1xyXG4gICAgaW1wb3J0IFRyZWVIZWxwZXJzID0gQ29tYXJjaC5VdGlscy5UcmVlVXRpbHMuVHJlZUhlbHBlcnM7XHJcbiAgICBpbXBvcnQgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkgPSBDb21hcmNoLlV0aWxzLlRyZWVVdGlscy5Gb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuICAgIGltcG9ydCBGaWx0ZXJNZXRhZGF0YSA9IENvbW1vbi5GaWx0ZXJNZXRhZGF0YTtcclxuICAgIGltcG9ydCBNZXRhZGF0YVJlcXVlc3QgPSBDb21tb24uTWV0YWRhdGFSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IElGaWx0ZXJJbmZvID0gQ29tbW9uLklGaWx0ZXJJbmZvO1xyXG4gICAgaW1wb3J0IE1lbWJlcnNSZXF1ZXN0ID0gQ29tbW9uLk1lbWJlcnNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IExlYWZNZW1iZXJzUmVxdWVzdCA9IENvbW1vbi5MZWFmTWVtYmVyc1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgQ2hpbGRyZW5SZXF1ZXN0ID0gQ29tbW9uLkNoaWxkcmVuUmVxdWVzdDtcclxuICAgIGltcG9ydCBNZW1iZXJGaWx0ZXIgPSBDb21tb24uTWVtYmVyRmlsdGVyO1xyXG4gICAgaW1wb3J0IE1lbWJlckZpbHRlclR5cGUgPSBDb21tb24uTWVtYmVyRmlsdGVyVHlwZTtcclxuICAgIGltcG9ydCBJRmlsdGVyQ29udHJvbFNlcnZpY2UgPSBDb21tb24uSUZpbHRlckNvbnRyb2xTZXJ2aWNlO1xyXG4gICAgaW1wb3J0IEZpbHRlclNlcnZpY2UgPSBGaWx0ZXJTZXJ2aWNlTW9kdWxlLkZpbHRlclNlcnZpY2U7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RUcmVlIHtcclxuICAgICAgICBwcml2YXRlIF9kYXRhUGFja2FnZVNpemU6IG51bWJlcj0wO1xyXG4gICAgICAgIHByaXZhdGUgX21heFRvdGFsRWxlbWVudHNDb3VudDogbnVtYmVyPTA7XHJcbiAgICAgICAgcHJpdmF0ZSBfZ2VuZXJhdG9yOiBSYW5kb21UcmVlR2VuZXJhdG9yO1xyXG4gICAgICAgIHByaXZhdGUgX2RhdGE6IEFycmF5PE9iamVjdD49W107XHJcbiAgICAgICAgcHJpdmF0ZSBfJGpzdHJlZUNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgXyRyZWZlcmVuY2VKc3RyZWVDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIF8kcmVmZXJlbmNlSnN0cmVlQ29udGFpbmVyMjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgX2lzTG9hZGluZ01vcmVFbGVtZW50OiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2lzQ2hhbmdpbmdEaXNwbGF5U3RhdHVzOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2lzUmVzdG9yaW5nVHJlZVN0YXRlOiBib29sZWFuO1xyXG4gICAgICAgIHByaXZhdGUgX2VsZW1lbnRzVG9Mb2FkOiBJTWVtYmVyTm9kZVtdO1xyXG4gICAgICAgIHByaXZhdGUgX2VsZW1lbnRzVG9Mb2FkU3RhcnRJbmRleDogbnVtYmVyPTA7XHJcbiAgICAgICAgcHJpdmF0ZSBfc2VhcmNoUGF0dGVybjogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgX3RlbXBUcmVlU3RhdGU6IEFycmF5PE9iamVjdD49bnVsbDsgLy9ieSBkZXNpZ24gaWYgeW91IHdhbnQgdG9cclxuICAgICAgICBwcml2YXRlIF90ZW1wTG9hZGVkRWxlbWVudHNDb3VudDogbnVtYmVyOyAvL2J5IGRlc2lnbiBpZiB5b3Ugd2FudCB0b1xyXG4gICAgICAgIHByaXZhdGUgX3NlYXJjaEVsZW1lbnRzTG9hZE1vcmVTdGFydEluZGV4OiBudW1iZXI9MDtcclxuICAgICAgICBwcml2YXRlIF9zZXJ2aWNlOiBJRmlsdGVyQ29udHJvbFNlcnZpY2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfbG9hZE1vcmVOb2RlSWRQYXJ0PVwiU2hvd01vcmVcIjtcclxuICAgICAgICBwcml2YXRlIF9zZWxlY3RBbGxOb2RlSWQ9XCJTZWxlY3RBbGxcIjtcclxuICAgICAgICBwcml2YXRlIF9zdGF0ZU1hbmFnZXI6IEZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgICAgICBwcml2YXRlIF9yZWRyd2VkTm9kZXM6IHN0cmluZ1tdPVtdO1xyXG4gICAgICAgIHByaXZhdGUgX3NlYXJjaE1vZGVJc1NlbGVjdEFsbFNlbGVjdGVkOiBib29sZWFuPXRydWU7XHJcbiAgICAgICAgcHJpdmF0ZSBfaXNMb2FkaW5nQWxsRWxlbWVudHM6IGJvb2xlYW49ZmFsc2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfaXNJblNlYXJjaE1vZGU6IGJvb2xlYW49ZmFsc2U7XHJcbiAgICAgICAgcHJpdmF0ZSBfbG9hZGVkRWxlbWVudHNDb3VudDogbnVtYmVyPTA7XHJcbiAgICAgICAgcHJpdmF0ZSBfbWV0YWRhdGE6RmlsdGVyTWV0YWRhdGE9bnVsbDtcclxuICAgICAgICBcclxuICAgICAgICBnZXQgSXNJblNlYXJjaE1vZGUoKTogYm9vbGVhbiB7IHJldHVybiBCb29sZWFuKHRoaXMuX2lzSW5TZWFyY2hNb2RlKSB9O1xyXG5cclxuICAgICAgICBnZXQgJFJlZmVyZW5jZUpzdHJlZUNvbnRhaW5lcigpOiBKUXVlcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fJHJlZmVyZW5jZUpzdHJlZUNvbnRhaW5lciB8fCAodGhpcy5fJHJlZmVyZW5jZUpzdHJlZUNvbnRhaW5lciA9ICQoXCIjcmVmZXJlbmNlSnN0cmVlQ29udGFpbmVyXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBSZWZlcmVuY2VKc3RyZWVJbnN0YW5jZSgpOiBKU1RyZWUge1xyXG4gICAgICAgICAgICByZXR1cm4gJC5qc3RyZWUucmVmZXJlbmNlKHRoaXMuJFJlZmVyZW5jZUpzdHJlZUNvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgJFJlZmVyZW5jZUpzdHJlZUNvbnRhaW5lcjIoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuXyRyZWZlcmVuY2VKc3RyZWVDb250YWluZXIyIHx8ICh0aGlzLl8kcmVmZXJlbmNlSnN0cmVlQ29udGFpbmVyMiA9ICQoXCIjcmVmZXJlbmNlSnN0cmVlQ29udGFpbmVyMlwiKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgUmVmZXJlbmNlSnN0cmVlSW5zdGFuY2UyKCk6IEpTVHJlZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkLmpzdHJlZS5yZWZlcmVuY2UodGhpcy4kUmVmZXJlbmNlSnN0cmVlQ29udGFpbmVyMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgJEpzdHJlZUNvbnRhaW5lcigpOiBKUXVlcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fJGpzdHJlZUNvbnRhaW5lciB8fCAodGhpcy5fJGpzdHJlZUNvbnRhaW5lciA9ICQoXCIjanN0cmVlQ29udGFpbmVyXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBKc3RyZWVJbnN0YW5jZSgpOiBKU1RyZWUge1xyXG4gICAgICAgICAgICByZXR1cm4gJC5qc3RyZWUucmVmZXJlbmNlKHRoaXMuJEpzdHJlZUNvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgJFNlYXJjaFRleHRCb3goKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuICQoXCIjc2VhcmNoVHh0XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0ICRMZXZlbHNTZWxlY3QoKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuICQoXCIjbGV2ZWxzU2VsZWN0XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0ICRTZWFyY2hCdXR0b24oKTogSlF1ZXJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuICQoXCIjc2VhcmNoQnV0dG9uXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IFNlYXJjaExldmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRMZXZlbHNTZWxlY3QudmFsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgTGFzdExldmVsSW5kZXgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCBUb3RhbEVsZW1lbnRzQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21ldGFkYXRhLkFsbExldmVsc01lbWJlcnNUb3RhbENvdW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IE1lbWJlckZpbHRlclR5cGUoKTogTWVtYmVyRmlsdGVyVHlwZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCgkKFwiI21lbWJlckZpbHRlclR5cGVcIikudmFsKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IENvbm5lY3Rpb25TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuICQoXCIjY29ubmVjdGlvblN0cmluZ1R4dFwiKS52YWwoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBGaWVsZFVuaXF1ZU5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuICQoXCIjZmllbGRVbmlxdWVOYW1lVHh0XCIpLnZhbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGVzdFRyZWUgY3JlYXRlZC5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRvciA9IG5ldyBSYW5kb21UcmVlR2VuZXJhdG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMuSW5pdCgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEluaXQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuU2hvd0FsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGFQYWNrYWdlU2l6ZSA9IHBhcnNlSW50KCQoXCIjcGFja2FnZVNpemVcIikudmFsKCkpO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXhUb3RhbEVsZW1lbnRzQ291bnQgPSBwYXJzZUludCgkKFwiI3RvdGFsRWxlbWVudHNDb3VudFwiKS52YWwoKSk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5fc2VydmljZSA9IG5ldyBNb2NrU2VydmljZSh3aW5kb3dbXCJfZmFrZVRyZWVcIl0sXCJUT0RPXCIsXCJUT0RPXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IEZpbHRlclNlcnZpY2UodGhpcy5Db25uZWN0aW9uU3RyaW5nKTtcclxuICAgICAgICAgICAgdGhpcy5fbWV0YWRhdGEgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZXRhZGF0YShuZXcgTWV0YWRhdGFSZXF1ZXN0KHRoaXMuRmllbGRVbmlxdWVOYW1lLFtdKSkpLk1ldGFkYXRhO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZUxldmVsc1NlbGVjdCgpO1xyXG4gICAgICAgICAgICAvL3RoaXMuX3NlcnZpY2UgPSBuZXcgTW9ja1NlcnZpY2UoTW9ja1NlcnZpY2UuQ3JlYXRlRmFrZVRpbWVIaWVyYXJjaHkoMjcpKTtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyID0gbmV3IEZpbHRlclN0YXRlTWFuYWdlcih0aGlzLl9tZXRhZGF0YS5Sb290TWVtYmVyc1RvdGFsQ291bnQpO1xyXG4gICAgICAgICAgICAvL3RoaXMuQ3JlYXRlUmVmZXJlbmNlVHJlZSh0aGlzLiRSZWZlcmVuY2VKc3RyZWVDb250YWluZXIsIHRoaXMuX3NlcnZpY2UuR2V0RnVsbERhdGEoKSk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5DcmVhdGVSZWZlcmVuY2VUcmVlKHRoaXMuJFJlZmVyZW5jZUpzdHJlZUNvbnRhaW5lcjIsIHRoaXMuX3NlcnZpY2UuR2V0RnVsbERhdGEoKSk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5DcmVhdGVSZWZlcmVuY2VUcmVlKHRoaXMuX2dlbmVyYXRvci5HZW5lcmF0ZUZsYXREYXRhQ29yZSg1MDApKTtcclxuICAgICAgICAgICAgdGhpcy5CaW5kRXZlbnRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuR2VuZXJhdGVEYXRhKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlTWFuYWdlci5DbGVhclN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5SZWZyZXNoVHJlZSgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQmluZEV2ZW50cygpIHtcclxuICAgICAgICAgICAgJChcIiNwYWNrYWdlU2l6ZVwiKS5jaGFuZ2UoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVBhY2thZ2VTaXplID0gcGFyc2VJbnQoJChcIiNwYWNrYWdlU2l6ZVwiKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKFwiI3RvdGFsRWxlbWVudHNDb3VudFwiKS5jaGFuZ2UoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50ID0gcGFyc2VJbnQoJChcIiN0b3RhbEVsZW1lbnRzQ291bnRcIikudmFsKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy4kU2VhcmNoQnV0dG9uLmNsaWNrKHRoaXMuT25TZWFyY2guYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICQoXCIjY2xlYXJTZWFyY2hCdXR0b25cIikuY2xpY2sodGhpcy5PbkNsZWFyU2VhcmNoLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKFwiI2xvYWRTdGF0ZVwiKS5jbGljayh0aGlzLk9uTG9hZFN0YXRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKFwiI3NhdmVTdGF0ZVwiKS5jbGljayh0aGlzLk9uU2F2ZVN0YXRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKFwiI2Rpc3BsYXlBbGxFbGVtZW50c1wiKS5jbGljayh0aGlzLk9uRGlzcGxheUFsbEVsZW1lbnRzLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKFwiI2Rpc3BsYXlPbmx5U2VsZWN0ZWRFbGVtZW50c1wiKS5jbGljayh0aGlzLk9uRGlzcGxheU9ubHlTZWxlY3RlZEVsZW1lbnRzLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAkKFwiI2Rpc3BsYXlPbmx5RGVzZWxlY3RlZEVsZW1lbnRzXCIpLmNsaWNrKHRoaXMuT25EaXNwbGF5T25seURlc2VsZWN0ZWRFbGVtZW50cy5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgJChcIiNsb2FkQWxsXCIpLmNsaWNrKHRoaXMuT25Mb2FkQWxsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBPbkxvYWRTdGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdGVNYW5hZ2VyLkRlc2VyaWFsaXplKCh3aW5kb3dbXCJfZmFrZVN0YXRlXCJdKSk7XHJcbiAgICAgICAgICAgIHRoaXMuUmVmcmVzaFRyZWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlTGV2ZWxzU2VsZWN0KCkge1xyXG4gICAgICAgICAgICB0aGlzLiRMZXZlbHNTZWxlY3QuYXBwZW5kKHRoaXMuX21ldGFkYXRhLlNvcnRlZExldmVscy5tYXAobCA9PiAkKFwiPG9wdGlvbj5cIikudGV4dChsLkNhcHRpb24pLnZhbChsLlVuaXF1ZU5hbWUpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIE9uU2F2ZVN0YXRlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuX3N0YXRlTWFuYWdlci5TZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coc3RhdGUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShzdGF0ZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmluZEpzVHJlZUV2ZW50cygpIHtcclxuICAgICAgICAgICAgdGhpcy4kSnN0cmVlQ29udGFpbmVyLm9uKFwiY2hhbmdlZC5qc3RyZWVcIiwgdGhpcy5PblNlbGVjdGlvbkNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJEpzdHJlZUNvbnRhaW5lci5vbihcImNvbWFyY2hfcmVkcmF3X25vZGUuY29tYXJjaC5qc3RyZWVcIiwgdGhpcy5PblJlZHJhd05vZGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuJEpzdHJlZUNvbnRhaW5lci5vbihcImxvYWRfbm9kZS5qc3RyZWVcIiwgdGhpcy5Pbk5vZGVMb2FkZWQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZWZyZXNoVHJlZSgpIHtcclxuICAgICAgICAgICAgdGhpcy4kSnN0cmVlQ29udGFpbmVyLmpzdHJlZShcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgICAgIHRoaXMuJEpzdHJlZUNvbnRhaW5lci5hZGRDbGFzcyhcImpzdHJlZS1jaGVja2JveC1zZWxlY3Rpb25cIikuanN0cmVlKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICdwbHVnaW5zJzogW1wiY29yZVwiLCAvKlwiY2hlY2tib3hcIiovLCBcImNvbWFyY2hfcmVkcmF3X25vZGVcIiwgXCJjb25kaXRpb25hbHNlbGVjdFwiXSxcclxuICAgICAgICAgICAgICAgICAgICAnY29yZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiAob2JqLCBjYikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5HZXROb2RlRGF0YShvYmosIGNiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJpbmdzJzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0xvYWRpbmcgLi4uJzogJyAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdjaGVja19jYWxsYmFjayc6IChvcGVyYXRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb24gPT09IFwiY3JlYXRlX25vZGVcIiB8fCBvcGVyYXRpb24gPT09IFwiZGVsZXRlX25vZGVcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWxzZWxlY3QnOiB0aGlzLk9uQ29uZGl0aW9uYWxTZWxlY3QuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLkJpbmRKc1RyZWVFdmVudHMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEdlbmVyYXRlRGF0YSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dlbmVyYXRvci5HZXRSYW5kb21Ob2RlcygxMDApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLl9kYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldE5vZGVEYXRhKG9iajogSU1lbWJlck5vZGUsIHJlbmRlcmluZ0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRlZE5vZGVzID0gYXdhaXQgdGhpcy5Mb2FkTm9kZXNDb3JlKG9iaiwgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4KTtcclxuICAgICAgICAgICAgcmVuZGVyaW5nQ2FsbGJhY2suY2FsbCh0aGlzLkpzdHJlZUluc3RhbmNlLCBsb2FkZWROb2Rlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIExvYWROb2Rlc0NvcmUob2JqOiBJTWVtYmVyTm9kZSwgc3RhcnRJbmRleDogbnVtYmVyKTogUHJvbWlzZTxJTWVtYmVyTm9kZVtdPiB7XHJcbiAgICAgICAgICAgIGxldCBsb2FkZWROb2RlczogSU1lbWJlck5vZGVbXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzTG9hZGluZ01vcmVFbGVtZW50IHx8IHRoaXMuX2lzQ2hhbmdpbmdEaXNwbGF5U3RhdHVzIHx8IHRoaXMuX2lzUmVzdG9yaW5nVHJlZVN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBsb2FkZWROb2RlcyA9IHRoaXMuX2VsZW1lbnRzVG9Mb2FkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbG9hZGVkTm9kZXMgPSBhd2FpdCB0aGlzLkxvYWROb2Rlc0Zyb21TZXJ2ZXJDb3JlKG9iaiwgc3RhcnRJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRlZE5vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBMb2FkTm9kZXNGcm9tU2VydmVyQ29yZShvYmo6IElNZW1iZXJOb2RlLCBzdGFydEluZGV4OiBudW1iZXIpOiBQcm9taXNlPElNZW1iZXJOb2RlW10+IHtcclxuICAgICAgICAgICAgbGV0IHJlc3BvbnNlOiBJRmlsdGVySW5mbztcclxuICAgICAgICAgICAgbGV0IGNyZWF0ZUFsbE5vZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKG9iai5pZCA9PT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZUFsbE5vZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuSXNJblNlYXJjaE1vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IChhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldE1lbWJlcnMobmV3IE1lbWJlcnNSZXF1ZXN0KHRoaXMuU2VhcmNoTGV2ZWwsIHRoaXMuX3NlYXJjaEVsZW1lbnRzTG9hZE1vcmVTdGFydEluZGV4LCB0aGlzLl9kYXRhUGFja2FnZVNpemUsbmV3IE1lbWJlckZpbHRlcih0aGlzLl9zZWFyY2hQYXR0ZXJuLHRoaXMuTWVtYmVyRmlsdGVyVHlwZSkpKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IChhd2FpdCB0aGlzLl9zZXJ2aWNlLkdldExlYWZNZW1iZXJzKG5ldyBMZWFmTWVtYmVyc1JlcXVlc3QodGhpcy5TZWFyY2hMZXZlbCwgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4LCB0aGlzLl9tYXhUb3RhbEVsZW1lbnRzQ291bnQpKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5fc2VydmljZS5HZXRNZW1iZXJzKG5ldyBNZW1iZXJzUmVxdWVzdCh0aGlzLl9tZXRhZGF0YS5Tb3J0ZWRMZXZlbHNbMF0uVW5pcXVlTmFtZSwgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4LCB0aGlzLl9kYXRhUGFja2FnZVNpemUpKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0Q2hpbGRyZW4obmV3IENoaWxkcmVuUmVxdWVzdChvYmouaWQsc3RhcnRJbmRleCx0aGlzLl9kYXRhUGFja2FnZVNpemUpKSkuRmlsdGVySW5mbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBub2Rlc1RvTG9hZCA9IHRoaXMuUHJlcGFyZURhdGFUb0xvYWQob2JqLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHZhciBpc1dpdGhpbkxpbWl0ID0gdGhpcy5IYW5kbGVMb2FkTGltaXRzKG5vZGVzVG9Mb2FkKTtcclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLkhhc01vcmVNZW1iZXJzICYmIGlzV2l0aGluTGltaXQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzVG9Mb2FkLnB1c2godGhpcy5DcmVhdGVMb2FkTW9yZU5vZGUob2JqLCByZXNwb25zZS5MYXN0TGV2ZWxOb2RlcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjcmVhdGVBbGxOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBub2Rlc1RvTG9hZC51bnNoaWZ0KHRoaXMuQ3JlYXRlQWxsTm9kZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZXNUb0xvYWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFByZXBhcmVEYXRhVG9Mb2FkKGludm9raW5nTm9kZTogSU1lbWJlck5vZGUsIHJlc3BvbnNlOiBJRmlsdGVySW5mbykge1xyXG4gICAgICAgICAgICBsZXQgbm9kZXMgPSByZXNwb25zZS5MYXN0TGV2ZWxOb2RlcztcclxuICAgICAgICAgICAgdmFyIGV4cGFuZFRvTGV2ZWxJbmRleCA9IHRoaXMuR2V0TGV2ZWxOdW1iZXJGcm9tVW5pcXVlTmFtZSh0aGlzLlNlYXJjaExldmVsKTtcclxuICAgICAgICAgICAgdmFyIGV4cGFuZEFsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIGV4cGFuZEFsbCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNMb2FkaW5nV2hvbGVUcmVlKGludm9raW5nTm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVzID0gTWVtYmVyTm9kZXNIZWxwZXIuSGllcmFyY2hpemVOb2Rlcyhub2RlcywgcmVzcG9uc2UuUGFyZW50c0xvb2t1cCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFzc2lnbkxldmVsSW5kZXgoaW52b2tpbmdOb2RlLG5vZGVzLHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5FeHBhbmROb2Rlc1RvVGFyZ2V0TGV2ZWwobm9kZXMsZXhwYW5kVG9MZXZlbEluZGV4LGV4cGFuZEFsbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkFzc2lnbkxldmVsSW5kZXgoaW52b2tpbmdOb2RlLG5vZGVzLGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgSXNMb2FkaW5nV2hvbGVUcmVlKGludm9raW5nTm9kZTogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLklzSW5TZWFyY2hNb2RlICYmIHRoaXMuSXNMb2FkaW5nU2VhcmNoTGV2ZWxFbGVtZW50cyhpbnZva2luZ05vZGUpKSB8fCB0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQXNzaWduTGV2ZWxJbmRleChpbnZva2luZ05vZGU6IElNZW1iZXJOb2RlLCBsb2FkZWROb2RlczogSU1lbWJlck5vZGVbXSxpc0hpZXJhcmNoaWNhbDpib29sZWFuKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0hpZXJhcmNoaWNhbCkge1xyXG4gICAgICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KGxvYWRlZE5vZGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICh4KSA9PiAoeC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdKSxcclxuICAgICAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRhdGEubGV2ZWwgID0gbGV2ZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxldmVsOiBudW1iZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludm9raW5nTm9kZS5pZD09PVwiI1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9yb290IG9yIHNlYXJjaFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsID0gaW52b2tpbmdOb2RlLmRhdGEubGV2ZWwgKyAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbG9hZGVkTm9kZXMuZm9yRWFjaChuPT5uLmRhdGEubGV2ZWw9bGV2ZWwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgT25Db25kaXRpb25hbFNlbGVjdChub2RlOiBJTWVtYmVyTm9kZSkge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuSXNTaG93TW9yZU1lbWJlcihub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2FkaW5nIE1vcmUgTm9kZXNcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkxvYWRNb3JlTm9kZXMobm9kZSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGFzeW5jIExvYWRNb3JlTm9kZXModGFyZ2V0Tm9kZTogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5TaG93Tm9kZUxvYWRpbmdJbmRpY2F0b3IodGFyZ2V0Tm9kZS5pZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKHRhcmdldE5vZGUucGFyZW50KTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWRTdGFydEluZGV4ID0gdGFyZ2V0Tm9kZS5kYXRhLm5leHRMb2FkU3RhcnRJbmRleDtcclxuICAgICAgICAgICAgdmFyIGV4aXN0aW5nTm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgcGFyZW50Tm9kZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkSWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgZXhpc3RpbmdOb2Rlcy5wdXNoKHRoaXMuSnN0cmVlSW5zdGFuY2UuZ2V0X2pzb24odGhpcy5Kc3RyZWVJbnN0YW5jZS5nZXRfbm9kZShjaGlsZElkKSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZXhpc3RpbmdOb2Rlcy5wb3AoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBleGlzdGluZ05vZGVzTG9va3VwID0gVHJlZUhlbHBlcnMuQ29udmVydExpc3RUb0xvb2t1cDxJTWVtYmVyTm9kZT4oZXhpc3RpbmdOb2RlcyxcclxuICAgICAgICAgICAgICAgIHggPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHguY2hpbGRyZW4pID8gKHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSkgOiBbXTsgLy9mb3IgbGF6eSBsb2FkZWQgZWxlbWVudHMgYWxyZWFkeSBpbiB0cmVlIHdoaWNoIGhhcyBjaGlsZHJlbj10cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LmlkKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRlZE5vZGVzID0gYXdhaXQgdGhpcy5Mb2FkTm9kZXNGcm9tU2VydmVyQ29yZShwYXJlbnROb2RlLCB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXgpO1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4obG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50Tm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBleGlzdGluZ05vZGUgPSBleGlzdGluZ05vZGVzTG9va3VwLmdldFZhbHVlKGN1cnJlbnROb2RlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0aW5nTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1BhcmVudE5vZGUgPSBleGlzdGluZ05vZGVzTG9va3VwLmdldFZhbHVlKGN1cnJlbnROb2RlLmRhdGEucGFyZW50VW5pcXVlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1BhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nUGFyZW50Tm9kZS5jaGlsZHJlbi5wdXNoKGN1cnJlbnROb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nTm9kZXMucHVzaChjdXJyZW50Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkoKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWQgPSBleGlzdGluZ05vZGVzO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmdNb3JlRWxlbWVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuSnN0cmVlSW5zdGFuY2UubG9hZF9ub2RlKHBhcmVudE5vZGUsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nTW9yZUVsZW1lbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFNob3dOb2RlTG9hZGluZ0luZGljYXRvcihpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIGxldCAkbGlFbGVtZW50ID0gJCh0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKGlkLCB0cnVlKSk7XHJcbiAgICAgICAgICAgICRsaUVsZW1lbnQuYWRkQ2xhc3MoXCJqc3RyZWUtbG9hZGluZ1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNMb2FkaW5nU2VhcmNoTGV2ZWxFbGVtZW50cyhwYXJlbnROb2RlOiBJTWVtYmVyTm9kZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBsZXQgbG9hZGVkTm9kZXNMZXZlbElkID0gLTE7IC8vcm9vdDtcclxuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGUuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgbG9hZGVkTm9kZXNMZXZlbElkID0gcGFyZW50Tm9kZS5kYXRhLmxldmVsOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsb2FkZWROb2Rlc0xldmVsSWQrKzsgLy93ZSBhcmUgYWN0dWFseSBsb2FkaW5nIG5leHQgbGV2ZWwgbm90IHBhcmVudCBsZXZlbFxyXG4gICAgICAgICAgICBpZiAobG9hZGVkTm9kZXNMZXZlbElkIDw9IHRoaXMuR2V0TGV2ZWxOdW1iZXJGcm9tVW5pcXVlTmFtZSh0aGlzLlNlYXJjaExldmVsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVMb2FkTW9yZU5vZGUocGFyZW50Tm9kZTogSU1lbWJlck5vZGUsIGxvYWRlZExhc3RMZXZlbE5vZGVzTm9kZXM6IElNZW1iZXJOb2RlW10pOiBJTWVtYmVyTm9kZSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gbG9hZGVkTGFzdExldmVsTm9kZXNOb2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnROb2RlLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleCArPSBwYXJlbnROb2RlLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXgtLTsgLy9TZWxlY3RBbGxcclxuICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXgtLTsgLy9TaG93TW9yZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzSW5TZWFyY2hNb2RlICYmIHRoaXMuSXNMb2FkaW5nU2VhcmNoTGV2ZWxFbGVtZW50cyhwYXJlbnROb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoRWxlbWVudHNMb2FkTW9yZVN0YXJ0SW5kZXggKz0gbG9hZGVkTGFzdExldmVsTm9kZXNOb2Rlcy5sZW5ndGg7IC8vaGVyZSB0aGVyZSBpcyBubyBhZGRpdGlvbmFsIGV4dGVuZGVkIHBhY2tlZCBub2RlXHJcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gdGhpcy5fc2VhcmNoRWxlbWVudHNMb2FkTW9yZVN0YXJ0SW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGU6IElNZW1iZXJOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke3RoaXMuX2xvYWRNb3JlTm9kZUlkUGFydH1fJHt0aGlzLkdldFJhbmRvbUlkKCl9YCxcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiLi4uU2hvd01vcmVcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICBpc1Nob3dNb3JlTWVtYmVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudFVuaXF1ZU5hbWU6IHBhcmVudE5vZGUuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dExvYWRTdGFydEluZGV4OiBzdGFydEluZGV4XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZUFsbE5vZGUoKTogSU1lbWJlck5vZGUge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlOiBJTWVtYmVyTm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiB0aGlzLl9zZWxlY3RBbGxOb2RlSWQsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIkFsbFwiLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0UmFuZG9tSWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5yZXBsYWNlKC9bXmEtel0rL2csIFwiXCIpLnN1YnN0cigyLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIElzU2hvd01vcmVNZW1iZXIobm9kZU9iajogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVPYmouZGF0YSAmJiBub2RlT2JqLmRhdGEuaXNTaG93TW9yZU1lbWJlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgSXNTZWxlY3RBbGxNZW1iZXIobm9kZU9iajogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVPYmouaWQgPT09IHRoaXMuX3NlbGVjdEFsbE5vZGVJZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENyZWF0ZVJlZmVyZW5jZVRyZWUoJGNvbnRhaW5lcjogSlF1ZXJ5LCBkYXRhOiBPYmplY3RbXSkge1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmpzdHJlZShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAncGx1Z2lucyc6IFtcImNvcmVcIiwgXCJjaGVja2JveFwiXSxcclxuICAgICAgICAgICAgICAgICAgICAnY29yZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnY2hlY2tfY2FsbGJhY2snOiAob3BlcmF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0aW9uID09PSBcImNyZWF0ZV9ub2RlXCIgfHwgb3BlcmF0aW9uID09PSBcImRlbGV0ZV9ub2RlXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0pLm9uKFwibG9hZGVkLmpzdHJlZVwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuanN0cmVlKFwib3Blbl9hbGxcIik7XHJcbiAgICAgICAgICAgICAgICB9KS5vbihcInJlYWR5LmpzdHJlZVwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICBkYXRhLmZvckVhY2goeD0+dGhpcy5SZWZlcmVuY2VKc3RyZWVJbnN0YW5jZS5jcmVhdGVfbm9kZShcIiNcIix4KSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgT25TZWFyY2goZTogSlF1ZXJ5RXZlbnRPYmplY3QpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2VhcmNoUGF0dGVybiA9IHRoaXMuJFNlYXJjaFRleHRCb3gudmFsKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuX3NlYXJjaFBhdHRlcm4sIHRoaXMuU2VhcmNoTGV2ZWwpO1xyXG4gICAgICAgICAgICBpZiAoIUJvb2xlYW4odGhpcy5fc2VhcmNoUGF0dGVybikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQ2xlYXJTZWFyY2goKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLlNlYXJjaCh0aGlzLl9zZWFyY2hQYXR0ZXJuKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE9uQ2xlYXJTZWFyY2goZTogSlF1ZXJ5RXZlbnRPYmplY3QpIHtcclxuICAgICAgICAgICAgdGhpcy5DbGVhclNlYXJjaCh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgU2F2ZVRyZWVTdGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVtcFRyZWVTdGF0ZSA9IHRoaXMuSnN0cmVlSW5zdGFuY2UuZ2V0X2pzb24oXCIjXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl90ZW1wTG9hZGVkRWxlbWVudHNDb3VudCA9IHRoaXMuX2xvYWRlZEVsZW1lbnRzQ291bnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2ZvciBtdWx0aXBsZSBzZXF1ZW50aWFsIHNlYXJjaGVzXHJcbiAgICAgICAgRW5zdXJlU2F2ZVRyZWVTdGF0ZSgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wVHJlZVN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlNhdmVUcmVlU3RhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgR2V0Q29weU9mU2F2ZWRUcmVlU3RhdGUoKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuX3RlbXBUcmVlU3RhdGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlc3RvcmVUcmVlU3RhdGUob25SZWFkeUNhbGxiYWNrOiAoKSA9PiB2b2lkID0gKCkgPT4ge30pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90ZW1wVHJlZVN0YXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuX2lzUmVzdG9yaW5nVHJlZVN0YXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHNUb0xvYWQgPSB0aGlzLl90ZW1wVHJlZVN0YXRlO1xyXG4gICAgICAgICAgICB0aGlzLlVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCh0aGlzLl90ZW1wTG9hZGVkRWxlbWVudHNDb3VudCk7XHJcbiAgICAgICAgICAgIHRoaXMuSnN0cmVlSW5zdGFuY2UubG9hZF9ub2RlKHRoaXMuSnN0cmVlSW5zdGFuY2UuZ2V0X25vZGUoXCIjXCIpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzVG9Mb2FkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl90ZW1wVHJlZVN0YXRlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc1Jlc3RvcmluZ1RyZWVTdGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uUmVhZHlDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBTZWFyY2goc2VhcmNoUGF0dGVybjogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQ2xlYXJTZWFyY2goZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luU2VhcmNoTW9kZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuRW5zdXJlU2F2ZVRyZWVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLlVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCgwKTtcclxuICAgICAgICAgICAgdGhpcy5TaG93QWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICAgICAgdGhpcy5Kc3RyZWVJbnN0YW5jZS5sb2FkX25vZGUodGhpcy5Kc3RyZWVJbnN0YW5jZS5nZXRfbm9kZShcIiNcIiksICgpID0+IHt9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENsZWFyU2VhcmNoKHJlbG9hZFRyZWU9dHJ1ZSxjbGVhclNlYXJjaFBhdHRlcm49ZmFsc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDTEVBUiBTRUFSQ0g6XCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9pc0luU2VhcmNoTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9zZWFyY2hFbGVtZW50c0xvYWRNb3JlU3RhcnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaE1vZGVJc1NlbGVjdEFsbFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKGNsZWFyU2VhcmNoUGF0dGVybikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kU2VhcmNoVGV4dEJveC52YWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWxvYWRUcmVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlJlc3RvcmVUcmVlU3RhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBFeHBhbmROb2Rlc1RvVGFyZ2V0TGV2ZWwobG9hZGVkTm9kZXM6IElNZW1iZXJOb2RlW10sIHRhcmdldExldmVsOiBudW1iZXIsIGV4cGFuZEFsbDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4obG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4gKHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSksXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZTpJSnNUcmVlTm9kZVN0YXRlID0gY3VycmVudC5zdGF0ZSB8fCAoY3VycmVudC5zdGF0ZSA9IHt9KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGV2ZWwgPCB0YXJnZXRMZXZlbCB8fCBleHBhbmRBbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3BlbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBhc3luYyBPblNlbGVjdGlvbkNoYW5nZWQoZTogSlF1ZXJ5RXZlbnRPYmplY3QsIGRhdGEpIHtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIk9uU2VsZWN0aW9uQ2hhbmdlZFwiLGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PT0gXCJzZWxlY3Rfbm9kZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaXNTZWxlY3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGVJZCA9IGRhdGEubm9kZS5pZDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLklzSW5TZWFyY2hNb2RlICYmIHRhcmdldE5vZGVJZD09PXRoaXMuX3NlbGVjdEFsbE5vZGVJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzU2VsZWN0ID0gdGhpcy5fc2VhcmNoTW9kZUlzU2VsZWN0QWxsU2VsZWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbk1vZGUgPSB0aGlzLl9zdGF0ZU1hbmFnZXIuR2V0U2VsZWN0aW9uU3RhdHVzKGRhdGEubm9kZS5wYXJlbnRzLCB0YXJnZXROb2RlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25Nb2RlID09PSBTZWxlY3Rpb25Nb2RlLkRlc2VsZWN0ZWQgfHwgc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5VbmRldGVybWluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXRMZXZlbEVsZW1lbnRzID0gbmV3IEFmZmVjdGVkTm9kZXNTZXQoKS5BZGQodGFyZ2V0Tm9kZUlkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZHJ3ZWROb2RlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYWZmZWN0ZWROb2RlcyA9IG5ldyBBZmZlY3RlZE5vZGVzU2V0KCkuQWRkKHRoaXMuX3NlbGVjdEFsbE5vZGVJZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Tm9kZUlkID09PSB0aGlzLl9zZWxlY3RBbGxOb2RlSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5Jc0luU2VhcmNoTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKGF3YWl0IHRoaXMuQ2hhbmdlU2VsZWN0aW9uRm9yQWxsU2VhcmNoZWRFbGVtZW50cyhpc1NlbGVjdCwgdGFyZ2V0TGV2ZWxFbGVtZW50cykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuVW5pb24odGhpcy5fc3RhdGVNYW5hZ2VyLkNsZWFyU3RhdGUoaXNTZWxlY3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5Kc3RyZWVJbnN0YW5jZS5yZWRyYXdfbm9kZSh0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKFwiI1wiKSwgdHJ1ZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5Mb2coYWZmZWN0ZWROb2Rlcy5Ub0FycmF5KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKHRoaXMuQWRkTm9kZVRvU3RhdGUoZGF0YS5ub2RlLCBpc1NlbGVjdCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGFmZmVjdGVkTm9kZXMuRm9yRWFjaCgoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVlcERvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaWQgIT09IFwiI1wiKSB7Ly9jYXN1c2VzIGZ1bGwgdHJlZSByZWRyYXdcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldExldmVsRWxlbWVudHMuQ29udGFpbnMoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWVwRG93biA9IHRydWU7IC8vd2Ugd2FudCBmdWxsIHJlZnJlc2ggZG93biBiZWNhdXNlIG5vdCBhbGwgbm9kZXMgZXhpc3QgaW4gc3RhdGUgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGU6SU1lbWJlck5vZGUgPSB0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKGlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuSnN0cmVlSW5zdGFuY2UucmVkcmF3X25vZGUobm9kZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVlcERvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuX2QuZm9yRWFjaChjaGlsZElkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gdGhpcy5Kc3RyZWVJbnN0YW5jZS5nZXRfbm9kZShjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkpzdHJlZUluc3RhbmNlLnJlZHJhd19ub2RlKGNoaWxkLCBmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuTG9nKGFmZmVjdGVkTm9kZXMuVG9BcnJheSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBMb2coYWZmZWN0ZWROb2Rlczogc3RyaW5nW10pIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBRkZFQ1RFRCBOT0RFU1wiLCBhZmZlY3RlZE5vZGVzKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSRURSQVdFRCBOT0RFU1wiLCB0aGlzLl9yZWRyd2VkTm9kZXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNUQVRFXCIsIHRoaXMuX3N0YXRlTWFuYWdlci5HZXRTdGF0ZSgpKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5fc3RhdGVNYW5hZ2VyLlByaW50KCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQWRkTm9kZVRvU3RhdGUobm9kZTogSU1lbWJlck5vZGUsIGlzU2VsZWN0OiBib29sZWFuKTogQWZmZWN0ZWROb2Rlc1NldCB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmlkID09PSB0aGlzLl9zZWxlY3RBbGxOb2RlSWQpIHJldHVybiBBZmZlY3RlZE5vZGVzU2V0LkVtcHR5O1xyXG4gICAgICAgICAgICBjb25zdCBzb3J0ZWRQYXJlbnRzOiBFeHRlbmRlZEZpbHRlckl0ZW1bXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbm9kZS5wYXJlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnROb2RlSWQgPSBub2RlLnBhcmVudHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50Tm9kZUlkICE9PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKHBhcmVudE5vZGVJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVySXRlbSA9IHRoaXMuQ3JlYXRlRmlsdGVySXRlbUZyb21Ob2RlKHBhcmVudE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRlZFBhcmVudHMucHVzaChmaWx0ZXJJdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRGaWx0ZXJOb2RlID0gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZU1hbmFnZXIuQWRkTm9kZXMoc29ydGVkUGFyZW50cywgdGFyZ2V0RmlsdGVyTm9kZSwgaXNTZWxlY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUobm9kZTogSU1lbWJlck5vZGUpOiBFeHRlbmRlZEZpbHRlckl0ZW0ge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGRyZW5Db3VudDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbGV0IHBhcmVudFVuaXF1ZU5hbWU6IHN0cmluZyA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmlkID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5Db3VudCA9IHRoaXMuX21ldGFkYXRhLlJvb3RNZW1iZXJzVG90YWxDb3VudDtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRVbmlxdWVOYW1lID0gbm9kZS5kYXRhLnBhcmVudFVuaXF1ZU5hbWUgfHwgXCIjXCI7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbkNvdW50ID0gbm9kZS5kYXRhLmNoaWxkcmVuVG90YWxDb3VudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEV4dGVuZGVkRmlsdGVySXRlbShub2RlLmlkLCBwYXJlbnRVbmlxdWVOYW1lLCBjaGlsZHJlbkNvdW50KTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBPblJlZHJhd05vZGUoZXZlbnRPYmplY3Q6IEpRdWVyeUV2ZW50T2JqZWN0LCBlOiBJSnN0cmVlUmVkcmF3Tm9kZUFyZ3M8YW55LCBhbnk+KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZHJ3ZWROb2Rlcy5wdXNoKGUuQ3VycmVudE5vZGVPYmouaWQpO1xyXG4gICAgICAgICAgICBpZiAoZS5DdXJyZW50Tm9kZU9iai5pZCA9PT0gXCIjXCIpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3QgJGxpRWxlbWVudCA9ICQoZS5DdXJyZW50Tm9kZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICBjb25zdCAkYW5jaG9yID0gJGxpRWxlbWVudC5jaGlsZHJlbihcIi5qc3RyZWUtYW5jaG9yXCIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5Jc1Nob3dNb3JlTWVtYmVyKGUuQ3VycmVudE5vZGVPYmopKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5jaG9yLmNoaWxkcmVuKFwiLmpzdHJlZS1jaGVja2JveFwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRhbmNob3IuY2hpbGRyZW4oXCIuanN0cmVlLXRoZW1laWNvblwiKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3Rpb25Nb2RlOiBTZWxlY3Rpb25Nb2RlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuSXNTZWxlY3RBbGxNZW1iZXIoZS5DdXJyZW50Tm9kZU9iaikpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25Nb2RlID0gdGhpcy5fc3RhdGVNYW5hZ2VyLkdldEFsbE5vZGVTZWxlY3Rpb25TdGF0dXMoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uTW9kZSA9IHRoaXMuX3N0YXRlTWFuYWdlci5HZXRTZWxlY3Rpb25TdGF0dXMoZS5DdXJyZW50Tm9kZU9iai5wYXJlbnRzLCBlLkN1cnJlbnROb2RlT2JqLmlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0ICRjaGVja2JveEVsZW1lbnQgPSAkKFwiPGk+XCIpLmFkZENsYXNzKFwianN0cmVlLWljb24ganN0cmVlLWNoZWNrYm94XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuVW5kZXRlcm1pbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNoZWNrYm94RWxlbWVudC5hZGRDbGFzcyhcImpzdHJlZS1jb21hcmNoLXVuZGV0ZXJtaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5TZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRjaGVja2JveEVsZW1lbnQuYWRkQ2xhc3MoXCJqc3RyZWUtY29tYXJjaC1zZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNoZWNrYm94RWxlbWVudC5hZGRDbGFzcyhcImpzdHJlZS1jb21hcmNoLWRlc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkY2hlY2tib3hFbGVtZW50LnByZXBlbmRUbygkYW5jaG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBPbkRpc3BsYXlBbGxFbGVtZW50cygpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPbkRpc3BsYXlBbGxFbGVtZW50c1wiKTtcclxuICAgICAgICAgICAgdGhpcy5EaXNwbGF5QWxsRWxlbWVudHNDb3JlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBEaXNwbGF5QWxsRWxlbWVudHNDb3JlKGNhbGxiYWNrOiAoKSA9PiB2b2lkID0gKCkgPT4ge30pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNDaGFuZ2luZ0Rpc3BsYXlTdGF0dXMgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLlJlc3RvcmVUcmVlU3RhdGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faXNDaGFuZ2luZ0Rpc3BsYXlTdGF0dXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBPbkRpc3BsYXlPbmx5U2VsZWN0ZWRFbGVtZW50cygpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPbkRpc3BsYXlPbmx5U2VsZWN0ZWRFbGVtZW50c1wiKTtcclxuICAgICAgICAgICAgdGhpcy5EaXNwbGF5T25seUVsZW1lbnRzQ29yZSh0cnVlKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIE9uRGlzcGxheU9ubHlEZXNlbGVjdGVkRWxlbWVudHMoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT25EaXNwbGF5T25seURlc2VsZWN0ZWRFbGVtZW50c1wiKTtcclxuICAgICAgICAgICAgdGhpcy5EaXNwbGF5T25seUVsZW1lbnRzQ29yZShmYWxzZSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEaXNwbGF5T25seUVsZW1lbnRzQ29yZShpc1Nob3dTZWxlY3RlZDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9uRGlzcGxheU9ubHlTZWxlY3RlZEVsZW1lbnRzXCIpO1xyXG4gICAgICAgICAgICB0aGlzLkVuc3VyZVNhdmVUcmVlU3RhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5faXNDaGFuZ2luZ0Rpc3BsYXlTdGF0dXMgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gdGhpcy5HZXRDb3B5T2ZTYXZlZFRyZWVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZCA9IHRoaXMuVHJpbVRyZWVCYXNlZE9uU3RhdHVzKHRlbXAsIGlzU2hvd1NlbGVjdGVkID8gU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkIDogU2VsZWN0aW9uTW9kZS5TZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuSnN0cmVlSW5zdGFuY2UubG9hZF9ub2RlKHRoaXMuSnN0cmVlSW5zdGFuY2UuZ2V0X25vZGUoXCIjXCIpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzQ2hhbmdpbmdEaXNwbGF5U3RhdHVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFRyaW1UcmVlQmFzZWRPblN0YXR1cyhpbnB1dDogSU1lbWJlck5vZGVbXSwgdGFyZ2V0U3RhdHVzOiBTZWxlY3Rpb25Nb2RlKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJlbnRzTG9va3VwOiBJVGVzdE5vZGVMb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KGlucHV0LFxyXG4gICAgICAgICAgICAgICAgeCA9PiB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAoY3VycmVudCwgcGFyZW50LCBsZXZlbCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuSXNTZWxlY3RBbGxNZW1iZXIoY3VycmVudCkgJiYgIXRoaXMuSXNTaG93TW9yZU1lbWJlcihjdXJyZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzTG9va3VwW3BhcmVudC5pZF0gPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50SWRzID0gTWVtYmVyTm9kZXNIZWxwZXIuR2V0QWxsUGFyZW50c05hbWVzKHBhcmVudHNMb29rdXAsIGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJZHMucHVzaChcIiNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvblN0YXR1cyA9IHRoaXMuX3N0YXRlTWFuYWdlci5HZXRTZWxlY3Rpb25TdGF0dXMocGFyZW50SWRzLCBjdXJyZW50LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvblN0YXR1cyA9PT0gdGFyZ2V0U3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbkNvbGxlY3Rpb24gPSBwYXJlbnQgPyBwYXJlbnQuY2hpbGRyZW4gOiBpbnB1dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbi5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5zdGF0ZS5vcGVuZWQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWU7IC8vanN0cmVlIHJlbW92ZXMgdGhpcyBpbiBnZXRfanNvbiBtZXRob2Qgc28gd2hlbiB3ZSBleHBhbmQganN0cmVlIGxvYWRzIGl0IG9uZU1vcmVUaW1lIGFuZCBzaG93cyBlbGVtZW50IHdoaWNoIHNob3VkIG5vdCBiZSB2aXNpYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXN5bmMgQ2hhbmdlU2VsZWN0aW9uRm9yQWxsU2VhcmNoZWRFbGVtZW50cyhpc1NlbGVjdDogYm9vbGVhbiwgdGFyZ2V0TGV2ZWxFbGVtZW50czogQWZmZWN0ZWROb2Rlc1NldCk6IFByb21pc2U8QWZmZWN0ZWROb2Rlc1NldD4ge1xyXG4gICAgICAgICAgICBjb25zdCBhZmZlY3RlZE5vZGVzID0gbmV3IEFmZmVjdGVkTm9kZXNTZXQoKTtcclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuX3NlcnZpY2UuR2V0TWVtYmVycyhuZXcgTWVtYmVyc1JlcXVlc3QodGhpcy5TZWFyY2hMZXZlbCwgMCwgdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50LG5ldyBNZW1iZXJGaWx0ZXIodGhpcy5fc2VhcmNoUGF0dGVybix0aGlzLk1lbWJlckZpbHRlclR5cGUpKSkpLkZpbHRlckluZm87XHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5IYXNNb3JlTWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJTZWFyY2ggcmVzdWx0IGlzIHRvIGxhcmdlLiBMaW1pdCB5b3VyIGNyaXRlcmlhLlwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVzcG9uc2UuTGFzdExldmVsTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZXZlbEVsZW1lbnRzLkFkZChub2RlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRzID0gTWVtYmVyTm9kZXNIZWxwZXIuR2V0QWxsUGFyZW50cyhyZXNwb25zZS5QYXJlbnRzTG9va3VwLCBub2RlKS5tYXAobm9kZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRzLnVuc2hpZnQodGhpcy5DcmVhdGVGaWx0ZXJJdGVtRnJvbU5vZGUodGhpcy5Kc3RyZWVJbnN0YW5jZS5nZXRfbm9kZShcIiNcIikpKTtcclxuICAgICAgICAgICAgICAgICAgICBhZmZlY3RlZE5vZGVzLlVuaW9uKHRoaXMuX3N0YXRlTWFuYWdlci5BZGROb2RlcyhwYXJlbnRzLCB0aGlzLkNyZWF0ZUZpbHRlckl0ZW1Gcm9tTm9kZShub2RlKSwgaXNTZWxlY3QpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaE1vZGVJc1NlbGVjdEFsbFNlbGVjdGVkID0gIXRoaXMuX3NlYXJjaE1vZGVJc1NlbGVjdEFsbFNlbGVjdGVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhZmZlY3RlZE5vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgT25Mb2FkQWxsKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9uTG9hZEFsbFwiKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuVG90YWxFbGVtZW50c0NvdW50IDw9IHRoaXMuX21heFRvdGFsRWxlbWVudHNDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IHRoaXMuU2hvd0xvYWRBbGxVc2VyQ29uZmlybWF0aW9uKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkxvYWRBbGxDb3JlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5TaG93Rmlyc3RORWxlbWVudHNDb25maXJtYXRpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9hZEFsbENvcmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgTG9hZEFsbENvcmUoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLklzSW5TZWFyY2hNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNsZWFyU2VhcmNoKGZhbHNlLHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuU2F2ZVRyZWVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLlVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCgwKTtcclxuICAgICAgICAgICAgdGhpcy5faXNMb2FkaW5nQWxsRWxlbWVudHMgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLlNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgICAgICB0aGlzLkpzdHJlZUluc3RhbmNlLmxvYWRfbm9kZSh0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKFwiI1wiKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0xvYWRpbmdBbGxFbGVtZW50cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBTaG93TG9hZEFsbFVzZXJDb25maXJtYXRpb24oKTpQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuU2hvd0xvYWRBbGxVc2VyQ29uZmlybWF0aW9uQ29yZShgRGltZW5zaW9uIGNvbnRhaW5zICR7dGhpcy5Ub3RhbEVsZW1lbnRzQ291bnR9IGVsZW1lbnRzLiBEbyB5b3Ugd2hhdCBsb2FkIHRoZW0gYWxsYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzeW5jIFNob3dGaXJzdE5FbGVtZW50c0NvbmZpcm1hdGlvbigpOlByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5TaG93TG9hZEFsbFVzZXJDb25maXJtYXRpb25Db3JlKGBEaW1lbnNpb24gY29udGFpbnMgJHt0aGlzLlRvdGFsRWxlbWVudHNDb3VudH0gZWxlbWVudHMuIE1heGltdW0gZWxlbWVudHMgdGhhdCB5b3UgY2FuIGxvYWQgaXMgJHt0aGlzLl9tYXhUb3RhbEVsZW1lbnRzQ291bnR9LiBEbyB5b3Ugd2hhdCB0byBsb2FkIGVsZW1lbnRzIHVwIHRvIHRoZSBsaW1pdC5gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXN5bmMgU2hvd0xvYWRBbGxVc2VyQ29uZmlybWF0aW9uQ29yZShtZXNzYWdlOnN0cmluZyk6UHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbmZpcm0obWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNob3dNYXhMaW1pdFJlYWNoZWQoKXtcclxuICAgICAgICAgICBhbGVydChcIk1heGltdW0gbGltaXQgb2YgbG9hZGVkIGVsbWVudHMgaGFzIGJlZW4gcmVhY2hlZC4gVXNlIHNlYXJjaCBvciBsaW1pdCB5b3VyIHNlYXJjaCBjcml0ZXJpYVwiKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFNob3dOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKSB7XHJcbiAgICAgICAgICAgICQoXCIjbm90QWxsRWxlbWVudHNWaXNpYmxlXCIpLnNob3coKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpdmF0ZSBIaWRlTm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCkge1xyXG4gICAgICAgICAgICAkKFwiI25vdEFsbEVsZW1lbnRzVmlzaWJsZVwiKS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByaXZhdGUgVXBkYXRlVG90YWxFbGVtZW50c0xvYWRlZENvdW50KGNvdW50Om51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50ID0gY291bnQ7XHJcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gYCR7dGhpcy5fbG9hZGVkRWxlbWVudHNDb3VudH0vJHt0aGlzLlRvdGFsRWxlbWVudHNDb3VudH1gO1xyXG4gICAgICAgICAgICAkKFwiI2xvYWRlZEVsZW1lbnRzQ291bnRcIikudGV4dCh0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEhhbmRsZUxvYWRMaW1pdHMobG9hZGVkTm9kZXM6SU1lbWJlck5vZGVbXSk6Ym9vbGVhbiB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50UmVxdWVzdENvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudHNUb1JlbW92ZTogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXIobG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLkpzdHJlZUluc3RhbmNlLmdldF9ub2RlKGN1cnJlbnQuaWQpKSB7IC8vc29tZSBwYXJlbnRzIG1heSBhbHJlYWR5IGV4aXN0IGluIHRoZSB0cmVlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3RDb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50ICsgY3VycmVudFJlcXVlc3RDb3VudGVyID4gdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1RvUmVtb3ZlW2N1cnJlbnQuaWRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCkpO1xyXG5cclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXIobG9hZGVkTm9kZXMsXHJcbiAgICAgICAgICAgICAgICB4ID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50LHBhcmVudCxsZXZlbCxpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1RvUmVtb3ZlW2N1cnJlbnQuaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHBhcmVudCA/IHBhcmVudC5jaGlsZHJlbiA6IGxvYWRlZE5vZGVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzQ291bnRBZnRlckxvYWQgPSB0aGlzLl9sb2FkZWRFbGVtZW50c0NvdW50ICsgY3VycmVudFJlcXVlc3RDb3VudGVyO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnRzQ291bnRBZnRlckxvYWQgPCB0aGlzLl9tYXhUb3RhbEVsZW1lbnRzQ291bnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuU2hvd05vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5VcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQoZWxlbWVudHNDb3VudEFmdGVyTG9hZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudHNDb3VudEFmdGVyTG9hZCA9PT0gdGhpcy5fbWF4VG90YWxFbGVtZW50c0NvdW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkhpZGVOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuVXBkYXRlVG90YWxFbGVtZW50c0xvYWRlZENvdW50KGVsZW1lbnRzQ291bnRBZnRlckxvYWQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5VcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQoZWxlbWVudHNDb3VudEFmdGVyTG9hZC1PYmplY3Qua2V5cyhlbGVtZW50c1RvUmVtb3ZlKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TaG93TWF4TGltaXRSZWFjaGVkKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBHZXRMZXZlbE51bWJlckZyb21VbmlxdWVOYW1lKHVuaXF1ZU5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWV0YWRhdGEuU29ydGVkTGV2ZWxzLm1hcCh4PT54LlVuaXF1ZU5hbWUpLmluZGV4T2YodW5pcXVlTmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpIHtcclxuICAgICAgICAgICAgdGhpcy4kSnN0cmVlQ29udGFpbmVyLmFkZENsYXNzKFwiY29tYXJjaC13aG9sZS10cmVlLWxvYWRpbmdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByaXZhdGUgSGlkZUFsbFRyZWVMb2FkaW5nSW5kaWNhdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRKc3RyZWVDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJjb21hcmNoLXdob2xlLXRyZWUtbG9hZGluZ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgT25Ob2RlTG9hZGVkKGU6IEpRdWVyeUV2ZW50T2JqZWN0LCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT25Ob2RlTG9hZGVkXCIsYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgdGhpcy5IaWRlQWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxudmFyIHBhZ2UgPSBuZXcgVGVzdFRyZWUuVGVzdFRyZWUoKTsiXX0=