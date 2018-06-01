var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var MemberFilterType = FilterControlModule.Common.MemberFilterType;
            let MoreOptionsType;
            (function (MoreOptionsType) {
                MoreOptionsType[MoreOptionsType["ExpandAll"] = 0] = "ExpandAll";
                MoreOptionsType[MoreOptionsType["RevertSelection"] = 1] = "RevertSelection";
                MoreOptionsType[MoreOptionsType["CollapseAll"] = 2] = "CollapseAll";
                MoreOptionsType[MoreOptionsType["ShowOnlySelected"] = 3] = "ShowOnlySelected";
                MoreOptionsType[MoreOptionsType["ShowOnlyDeselected"] = 4] = "ShowOnlyDeselected";
                MoreOptionsType[MoreOptionsType["ShowAll"] = 5] = "ShowAll";
            })(MoreOptionsType || (MoreOptionsType = {}));
            class FilterControlControlViewFactory {
                Create(targetContainer, template, presenter) {
                    return new FilterControlView(targetContainer, template, presenter);
                }
            }
            FilterControlModule.FilterControlControlViewFactory = FilterControlControlViewFactory;
            class FilterControlView {
                constructor(targetContainer, template, presenter) {
                    this._$targetContainer = targetContainer;
                    this._presenter = presenter;
                    this.InsertTemplate(template);
                    this.Init();
                }
                Init() {
                    this.CreateSymbolMap();
                    this.GetDomReferences();
                    this.CreateInnerControls();
                    this.BindEvents();
                }
                CreateSymbolMap() {
                    var map = {};
                    map[MemberFilterType[MemberFilterType.Contains]] = "*x*";
                    map[MemberFilterType[MemberFilterType.BeginsWith]] = "x*";
                    map[MemberFilterType[MemberFilterType.EndsWith]] = "*x";
                    this._filterTypeSymbolMap = map;
                }
                GetMappedSymbol(type) {
                    return this._filterTypeSymbolMap[MemberFilterType[type]];
                }
                GetDomReferences() {
                    this._memberFilterTypeSelectContainer = this.GetByAttribute("_memberFilterTypeSelectContainer");
                    this._filterTxtContainer = this.GetByAttribute("_filterTxtContainer");
                    this._moreOptionsButton = this.GetByAttribute("_moreOptionsButton");
                    this._jstreeContainer = this.GetByAttribute("_jstreeContainer");
                    this._notAllElementsVisibleContainer = this.GetByAttribute("_notAllElementsVisibleContainer");
                    this._notAllElementsVisibleTxt = this.GetByAttribute("_notAllElementsVisibleTxt");
                    this._notAllElementsVisibleCount = this.GetByAttribute("_notAllElementsVisibleCount");
                    this._optionsMenuContainer = this.GetByAttribute("_optionsMenuContainer");
                    this._levelsMenuButton = this.GetByAttribute("_levelsMenuButton");
                    this._levelsMenuContainer = this.GetByAttribute("_filterLevelMenuContainer");
                }
                BindEvents() {
                    this.MemberFilterTypeSelectInstance.on("valueChanged", this.OnMemberFilterTypeChanged.bind(this));
                    this.FilterTextBoxInstance.on("valueChanged", this.OnFilterTextChanged.bind(this));
                    this.FilterTextBoxInstance.on("enterKey", this.OnFilter.bind(this));
                    this._filterTxtContainer.on("mousedown touch", this.OnTextContainerClick.bind(this));
                    this.MoreOptionsMenuInstance.on("itemClick", this.OnMoreOptionsMenuItemClicked.bind(this));
                    this.LevelMenuInstance.on("itemClick", this.OnLevelMenuItemClicked.bind(this));
                }
                BindJsTreeEvents() {
                    this._jstreeContainer.on("changed.jstree", this.OnSelectionChanged.bind(this));
                    this._jstreeContainer.on("comarch_redraw_node.comarch.jstree", this.OnTreeRedrawNode.bind(this));
                    this._jstreeContainer.on("load_node.jstree", this.OnNodeLoaded.bind(this));
                    this._jstreeContainer.on("ready.jstree", this.OnTreeReady.bind(this));
                }
                CreateInnerControls() {
                    this.CreateSelect(this._memberFilterTypeSelectContainer);
                    this.CreateFilterTextBox();
                    this.CreateNotElementVisibleIndicator();
                    this.CreateMoreOptionsMenu();
                    this.CreateLevelControl();
                }
                GetByAttribute(dataId) {
                    return this._$targetContainer.find("[data-id='" + dataId + "']");
                }
                get JstreeInstance() {
                    return $.jstree.reference(this._jstreeContainer);
                }
                get FilterLevel() {
                    return this._filterLevel;
                }
                get FilterLevelNumber() {
                    return this._presenter.GetLevelNumberFromUniqueName(this.FilterLevel);
                }
                get MemberFilterType() {
                    return this._memberFilterType;
                }
                get SearchPattern() {
                    return this._searchPattern;
                }
                ;
                InsertTemplate(template) {
                    this._$targetContainer.html(template);
                }
                get LevelMenuInstance() {
                    return this._levelsMenuContainer.dxContextMenu("instance");
                }
                get MemberFilterTypeSelectInstance() {
                    return this._memberFilterTypeSelectContainer.dxSelectBox("instance");
                }
                get FilterTextBoxInstance() {
                    return this._filterTxtContainer.dxTextBox("instance");
                }
                get MoreOptionsMenuInstance() {
                    return this._optionsMenuContainer.dxContextMenu("instance");
                }
                Reset() {
                    this._$jstreeContainer = null;
                    this._redrwedNodes = [];
                    this._refreshTreeResolveFunction = null;
                    this._searchPattern = null;
                    this._elementsToLoadStartIndex = 0;
                    this._memberFilterType = MemberFilterType.Contains;
                    this._renderingCallback = null;
                    this._filterLevel = null;
                }
                UpdateTotalElementsLoadedCount(text) {
                    this._notAllElementsVisibleCount.text(text);
                }
                HideNotAllElementsAreVisible() {
                    this._notAllElementsVisibleContainer.hide();
                }
                ShowNotAllElementsAreVisible() {
                    this._notAllElementsVisibleContainer.show();
                }
                ShowAllTreeLoadingIndicator() {
                    this._jstreeContainer.addClass("comarch-whole-tree-loading");
                }
                HideAllTreeLoadingIndicator() {
                    this._jstreeContainer.removeClass("comarch-whole-tree-loading");
                }
                EnableSearchBox() {
                    this._filterTxtContainer.removeAttr("disabled").removeClass("filter-disabled");
                }
                DisableSearchBox() {
                    this._filterTxtContainer.attr("disabled", "true").addClass("filter-disabled");
                }
                ClearSearchText() {
                    this.FilterTextBoxInstance.reset();
                }
                UpdateFilterTypeSelect() {
                    var items = [
                        { Id: MemberFilterType.Contains, Caption: this.GetMappedSymbol(MemberFilterType.Contains) + " " + this._presenter.GetResource("Contains") },
                        { Id: MemberFilterType.BeginsWith, Caption: this.GetMappedSymbol(MemberFilterType.BeginsWith) + " " + this._presenter.GetResource("BeginsWith") },
                        { Id: MemberFilterType.EndsWith, Caption: this.GetMappedSymbol(MemberFilterType.EndsWith) + " " + this._presenter.GetResource("EndsWith") },
                    ];
                    this.UpdateSelectBoxItems(this.MemberFilterTypeSelectInstance, items);
                    this.UpdateSelectBoxSelectedItem(this.MemberFilterTypeSelectInstance, MemberFilterType.Contains);
                }
                CreateSelect(container) {
                    container.dxSelectBox({
                        items: [],
                        displayExpr: "Caption",
                        valueExpr: "Id",
                        searchEnabled: true,
                        width: "70px",
                        onOpened: ev => {
                            setTimeout(() => { ev.component.content().parent().width(300); });
                        },
                        fieldTemplate: (selectedItem, fieldElement) => {
                            var textBox = $("<div>").dxTextBox({
                                value: selectedItem ? this.GetMappedSymbol(selectedItem.Id) : ''
                            });
                            fieldElement.append(textBox);
                        }
                    });
                }
                UpdateSelectBoxItems(instance, items) {
                    instance.option("items", items);
                }
                UpdateSelectBoxSelectedItem(instance, id) {
                    instance.option("value", id);
                }
                UpdateTexBoxPlaceholder(instance, value) {
                    instance.option("placeholder", value);
                }
                UpdateMenuItems(instance, items) {
                    instance.option("dataSource", items);
                }
                CreateFilterTextBox() {
                    this._filterTxtContainer.dxTextBox({
                        mode: "search",
                        valueChangeEvent: "keyup blur change"
                    });
                }
                CreateNotElementVisibleIndicator() {
                    this._notAllElementsVisibleTxt.text(this._presenter.GetResource("NotAllElementsAreVisible"));
                }
                CreateMenuCore(container, target) {
                    container.dxContextMenu({
                        dataSource: [],
                        showEvent: { name: "dxcontextmenu dxclick" },
                        target: target
                    });
                }
                CreateLevelControl() {
                    this.CreateMenuCore(this._levelsMenuContainer, this._levelsMenuButton);
                }
                CreateMoreOptionsMenu() {
                    let items = [
                        { id: MoreOptionsType.ShowAll, text: this._presenter.GetResource("ShowAll") },
                        { id: MoreOptionsType.ShowOnlySelected, text: this._presenter.GetResource("ShowOnlySelected") },
                        { id: MoreOptionsType.ShowOnlyDeselected, text: this._presenter.GetResource("ShowOnlyDeselected") },
                        { id: MoreOptionsType.ExpandAll, text: this._presenter.GetResource("ExpandAll"), beginGroup: true },
                        { id: MoreOptionsType.CollapseAll, text: this._presenter.GetResource("CollapseAll") },
                        { id: MoreOptionsType.RevertSelection, text: this._presenter.GetResource("RevertSelection"), beginGroup: true },
                    ];
                    this.CreateMenuCore(this._optionsMenuContainer, this._moreOptionsButton);
                    this.UpdateMenuItems(this.MoreOptionsMenuInstance, items);
                }
                UpdateLevelsMenu() {
                    var items = this._presenter.Metadata.SortedLevels.map(l => { return { id: l.UniqueName, text: l.Caption, icon: "fa fa-th-large", beginGroup: true }; }) || [];
                    this.UpdateMenuItems(this.LevelMenuInstance, items);
                    let defaultLevel = this._presenter.Metadata.SortedLevels[0];
                    this._filterLevel = defaultLevel.UniqueName;
                    this.UpdateTexBoxPlaceholder(this.FilterTextBoxInstance, this.GetPlaceHolderText(defaultLevel.Caption));
                }
                GetPlaceHolderText(levelName) {
                    return `${this._presenter.GetResource("FilterPlaceholderText")} ${levelName}`;
                }
                ClearSearchHighlight() {
                    this._jstreeContainer.find(".comarch-search-highlight").each((i, e) => $(e).removeClass("comarch-search-highlight"));
                }
                ShowMaxLimitReached(isLoadingAllElements) {
                    if (isLoadingAllElements) {
                        return;
                    }
                    alert(this._presenter.GetResource("MaxLimitOfElementsReachedMessage"));
                }
                ShowLoadAllUserConfirmation(totalElementsCount) {
                    return this.ShowLoadAllUserConfirmationCore(String.format(this._presenter.GetResource("ShowAllConfirmationMessage"), totalElementsCount));
                }
                ShowFirstNElementsConfirmation(totalElementsCount, maxTotalElementsCount) {
                    return this.ShowLoadAllUserConfirmationCore(String.format(this._presenter.GetResource("ShowFirstNElementMessage"), totalElementsCount, maxTotalElementsCount));
                }
                async ShowLoadAllUserConfirmationCore(message) {
                    return new Promise((resolve) => {
                        var result = confirm(message);
                        resolve(result);
                    });
                }
                CreateTree() {
                    this._jstreeContainer.addClass("jstree-checkbox-selection").jstree({
                        'plugins': ["core", "comarch_redraw_node", "conditionalselect"],
                        'core': {
                            'data': (obj, cb) => {
                                this._renderingCallback = cb;
                                this._presenter.GetNodeData(obj);
                            },
                            'strings': {
                                'Loading ...': " "
                            },
                            'check_callback': (operation) => {
                                return operation === "create_node" || operation === "delete_node";
                            },
                            'force_text': true,
                            'themes': {
                                'name': "comarch-dark",
                                'dots': false,
                                'icons': false,
                                'responsive': true
                            },
                        },
                        'conditionalselect': this.OnConditionalSelect.bind(this)
                    });
                    this.BindJsTreeEvents();
                    return new Promise(resolve => {
                        this._refreshTreeResolveFunction = resolve;
                    });
                }
                DestroyTree() {
                    this._jstreeContainer.jstree("destroy");
                }
                RenderTree(members) {
                    this._renderingCallback.call(this.JstreeInstance, members);
                }
                SignalTreeReady() {
                    this._refreshTreeResolveFunction();
                }
                GetTreeState() { return this.JstreeInstance.get_json("#"); }
                GetTreeNode(id, asDom) {
                    return this.JstreeInstance.get_node(id, asDom);
                }
                GetTreeNodeClone(obj) {
                    return this.JstreeInstance.get_json(obj);
                }
                ReloadTreeNode(obj, afterLoadCallback) {
                    this.JstreeInstance.load_node(obj, () => {
                        if (afterLoadCallback) {
                            afterLoadCallback();
                        }
                    });
                }
                RedrawNode(node, deep, isCallback = false, forceRender = false) {
                    this.JstreeInstance.redraw_node(node, deep, isCallback, forceRender);
                }
                CollapseAll() {
                    this.JstreeInstance.close_all();
                }
                OnFilter() {
                    if (this.SearchPattern) {
                        this._presenter.Search();
                    }
                    else {
                        this.OnClearFilter();
                    }
                }
                OnClearFilter() {
                    this._presenter.ExecuteClearFilter();
                }
                OnConditionalSelect(node) {
                    return this._presenter.HandleConditionalSelect(node);
                }
                OnSelectionChanged(e, data) {
                    this._presenter.HandleSelectionChanged(data);
                }
                OnTreeRedrawNode(e, data) {
                    this._presenter.HandleTreeRedrawNode(data);
                }
                OnNodeLoaded() {
                    this._presenter.HandleNodeLoaded();
                }
                OnTreeReady() {
                    this._presenter.HandleTreeReady();
                }
                OnMemberFilterTypeChanged(e) {
                    this._memberFilterType = e.value;
                }
                OnFilterTextChanged(e) {
                    this._searchPattern = e.value;
                }
                OnTextContainerClick(e) {
                    let target = $(e.target);
                    if (target.hasClass("dx-icon-search")) {
                        this.OnFilter();
                    }
                    else if (target.hasClass("dx-icon-clear")) {
                        this.OnClearFilter();
                    }
                }
                OnLevelMenuItemClicked(e) {
                    this._filterLevel = e.itemData.id;
                    this.FilterTextBoxInstance.reset();
                    this.UpdateTexBoxPlaceholder(this.FilterTextBoxInstance, this.GetPlaceHolderText(e.itemData.text));
                }
                OnMoreOptionsMenuItemClicked(e) {
                    switch (e.itemData.id) {
                        case MoreOptionsType.ExpandAll:
                            this._presenter.ExpandAll();
                            break;
                        case MoreOptionsType.RevertSelection:
                            this._presenter.RevertSelection();
                            break;
                        case MoreOptionsType.CollapseAll:
                            this._presenter.CollapseAll();
                            break;
                        case MoreOptionsType.ShowOnlySelected:
                            this._presenter.ShowOnlySelected();
                            break;
                        case MoreOptionsType.ShowOnlyDeselected:
                            this._presenter.ShowOnlyDeSelected();
                            break;
                        case MoreOptionsType.ShowAll:
                            this._presenter.ShowAll();
                            break;
                    }
                }
            }
            FilterControlModule.FilterControlView = FilterControlView;
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyQ29udHJvbFZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGaWx0ZXJDb250cm9sVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLE9BQU8sQ0EyZ0JoQjtBQTNnQkQsV0FBVSxPQUFPO0lBQUMsSUFBQSxRQUFRLENBMmdCekI7SUEzZ0JpQixXQUFBLFFBQVE7UUFBQyxJQUFBLG1CQUFtQixDQTJnQjdDO1FBM2dCMEIsV0FBQSxtQkFBbUI7WUFDMUMsSUFBTyxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUF1QnRFLElBQUssZUFRSjtZQVJELFdBQUssZUFBZTtnQkFDaEIsK0RBQVMsQ0FBQTtnQkFDVCwyRUFBZSxDQUFBO2dCQUNmLG1FQUFXLENBQUE7Z0JBQ1gsNkVBQWdCLENBQUE7Z0JBQ2hCLGlGQUFrQixDQUFBO2dCQUNsQiwyREFBTyxDQUFBO1lBRVgsQ0FBQyxFQVJJLGVBQWUsS0FBZixlQUFlLFFBUW5CO1lBTUQ7Z0JBQ0ksTUFBTSxDQUFDLGVBQXNCLEVBQUMsUUFBZSxFQUFDLFNBQTRDO29CQUN0RixPQUFPLElBQUksaUJBQWlCLENBQUMsZUFBZSxFQUFDLFFBQVEsRUFBQyxTQUFTLENBQUMsQ0FBQztnQkFDckUsQ0FBQzthQUNKO1lBSlksbURBQStCLGtDQUkzQyxDQUFBO1lBb0NEO2dCQXlCSSxZQUFZLGVBQXNCLEVBQUMsUUFBZSxFQUFDLFNBQXdCO29CQUN2RSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDO29CQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoQixDQUFDO2dCQUVPLElBQUk7b0JBQ1IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN2QixJQUFJLENBQUMsZ0JBQWdC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YUFHSjtZQTFiWSxxQ0FBaUIsb0JBMGI3QixDQUFBO1FBR0wsQ0FBQyxFQTNnQjBCLG1CQUFtQixHQUFuQiw0QkFBbUIsS0FBbkIsNEJBQW1CLFFBMmdCN0M7SUFBRCxDQUFDLEVBM2dCaUIsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUEyZ0J6QjtBQUFELENBQUMsRUEzZ0JTLE9BQU8sS0FBUCxPQUFPLFFBMmdCaEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ29tYXJjaC5Db250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlIHtcclxuICAgIGltcG9ydCBNZW1iZXJGaWx0ZXJUeXBlID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uTWVtYmVyRmlsdGVyVHlwZTtcclxuICAgIGltcG9ydCBJTWVtYmVyTm9kZSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklNZW1iZXJOb2RlO1xyXG4gICAgaW1wb3J0IElKc3RyZWVSZWRyYXdOb2RlQXJncyA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklKc3RyZWVSZWRyYXdOb2RlQXJncztcclxuXHJcbiAgICBpbnRlcmZhY2UgSVNlbGVjdEl0ZW08VD4ge1xyXG4gICAgICAgIElkOlQsXHJcbiAgICAgICAgQ2FwdGlvbjpzdHJpbmc7XHJcbiAgICB9XHJcbiAgICBpbnRlcmZhY2UgSVZhbHVlQ2hhbmdlZEV2ZW50c0FyZ3Mge1xyXG4gICAgICB2YWx1ZTogYW55IDtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSUNvbnRleHRNZW51SXRlbUNsaWNrRXZlbnRBcmdzPFQ+IHtcclxuICAgICAgICBpdGVtRGF0YTogSUNvbnRleHRNZW51SXRlbTxUPiA7XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIElDb250ZXh0TWVudUl0ZW08VD4ge1xyXG4gICAgICAgIGlkOiBUO1xyXG4gICAgICAgIHRleHQ6IHN0cmluZztcclxuICAgICAgICBpY29uPzogc3RyaW5nO1xyXG4gICAgICAgIGJlZ2luR3JvdXA/OmJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgZW51bSBNb3JlT3B0aW9uc1R5cGUge1xyXG4gICAgICAgIEV4cGFuZEFsbCxcclxuICAgICAgICBSZXZlcnRTZWxlY3Rpb24sXHJcbiAgICAgICAgQ29sbGFwc2VBbGwsXHJcbiAgICAgICAgU2hvd09ubHlTZWxlY3RlZCxcclxuICAgICAgICBTaG93T25seURlc2VsZWN0ZWQsXHJcbiAgICAgICAgU2hvd0FsbFxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyQ29udHJvbFZpZXdGYWN0b3J5IHtcclxuICAgICAgICBDcmVhdGUodGFyZ2V0Q29udGFpbmVyOkpRdWVyeSx0ZW1wbGF0ZTpzdHJpbmcscHJlc2VudGVyOiBGaWx0ZXJDb250cm9sKTogSUZpbHRlckNvbnRyb2xWaWV3O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJDb250cm9sQ29udHJvbFZpZXdGYWN0b3J5IGltcGxlbWVudHMgSUZpbHRlckNvbnRyb2xWaWV3RmFjdG9yeSB7XHJcbiAgICAgICAgQ3JlYXRlKHRhcmdldENvbnRhaW5lcjpKUXVlcnksdGVtcGxhdGU6c3RyaW5nLHByZXNlbnRlcjogRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJDb250cm9sKTogSUZpbHRlckNvbnRyb2xWaWV3IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDb250cm9sVmlldyh0YXJnZXRDb250YWluZXIsdGVtcGxhdGUscHJlc2VudGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlckNvbnRyb2xWaWV3IHtcclxuICAgICAgICBKc3RyZWVJbnN0YW5jZTogSlNUcmVlO1xyXG4gICAgICAgIEZpbHRlckxldmVsOiBzdHJpbmc7XHJcbiAgICAgICAgRmlsdGVyTGV2ZWxOdW1iZXI6IG51bWJlcjtcclxuICAgICAgICBNZW1iZXJGaWx0ZXJUeXBlOiBNZW1iZXJGaWx0ZXJUeXBlO1xyXG4gICAgICAgIFNlYXJjaFBhdHRlcm46IHN0cmluZztcclxuICAgICAgICBSZXNldCgpO1xyXG4gICAgICAgIFVwZGF0ZVRvdGFsRWxlbWVudHNMb2FkZWRDb3VudCh0ZXh0OiBzdHJpbmcpO1xyXG4gICAgICAgIFNob3dOb3RBbGxFbGVtZW50c0FyZVZpc2libGUoKTtcclxuICAgICAgICBIaWRlTm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCk7XHJcbiAgICAgICAgVXBkYXRlTGV2ZWxzTWVudSgpO1xyXG4gICAgICAgIFVwZGF0ZUZpbHRlclR5cGVTZWxlY3QoKTtcclxuICAgICAgICBDcmVhdGVUcmVlKCk7XHJcbiAgICAgICAgUmVuZGVyVHJlZShtZW1iZXJzOiBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JTWVtYmVyTm9kZVtdKTtcclxuICAgICAgICBTaWduYWxUcmVlUmVhZHkoKTtcclxuICAgICAgICBHZXRUcmVlU3RhdGUoKTogSU1lbWJlck5vZGVbXTtcclxuICAgICAgICBHZXRUcmVlTm9kZShpZDphbnksYXNEb20/OmJvb2xlYW4pOklNZW1iZXJOb2RlO1xyXG4gICAgICAgIEdldFRyZWVOb2RlQ2xvbmUob2JqOmFueSk6SU1lbWJlck5vZGU7XHJcbiAgICAgICAgUmVsb2FkVHJlZU5vZGUob2JqOmFueSwgYWZ0ZXJMb2FkQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKTtcclxuICAgICAgICBDbGVhclNlYXJjaFRleHQoKTtcclxuICAgICAgICBDbGVhclNlYXJjaEhpZ2hsaWdodCgpO1xyXG4gICAgICAgIFJlZHJhd05vZGUobm9kZTphbnksIGRlZXA6IGJvb2xlYW4sIGlzQ2FsbGJhY2s/OiBib29sZWFuLCBmb3JjZVJlbmRlcj86IGJvb2xlYW4pO1xyXG4gICAgICAgIFNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgIEhpZGVBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpO1xyXG4gICAgICAgIERlc3Ryb3lUcmVlKCk7XHJcbiAgICAgICAgRGlzYWJsZVNlYXJjaEJveCgpO1xyXG4gICAgICAgIEVuYWJsZVNlYXJjaEJveCgpO1xyXG4gICAgICAgIFNob3dMb2FkQWxsVXNlckNvbmZpcm1hdGlvbih0b3RhbEVsZW1lbnRzQ291bnQ6bnVtYmVyKTogUHJvbWlzZTxib29sZWFuPjtcclxuICAgICAgICBTaG93Rmlyc3RORWxlbWVudHNDb25maXJtYXRpb24odG90YWxFbGVtZW50c0NvdW50OiBudW1iZXIsIG1heFRvdGFsRWxlbWVudHNDb3VudDogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPjtcclxuICAgICAgICBTaG93TWF4TGltaXRSZWFjaGVkKGlzTG9hZGluZ0FsbEVsZW1lbnRzOiBib29sZWFuKTtcclxuICAgICAgICBDb2xsYXBzZUFsbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJDb250cm9sVmlldyBpbXBsZW1lbnRzIElGaWx0ZXJDb250cm9sVmlldyB7XHJcbiAgICAgICAgcHJpdmF0ZSBfJHRhcmdldENvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgX3ByZXNlbnRlcjogRmlsdGVyQ29udHJvbDtcclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIF8kanN0cmVlQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfcmVkcndlZE5vZGVzOiBzdHJpbmdbXTtcclxuICAgICAgICBwcml2YXRlIF9yZWZyZXNoVHJlZVJlc29sdmVGdW5jdGlvbjogKHZhbHVlPzogT2JqZWN0IHwgUHJvbWlzZUxpa2U8T2JqZWN0PikgPT4gdm9pZDtcclxuICAgICAgICBwcml2YXRlIF9zZWFyY2hQYXR0ZXJuOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfZWxlbWVudHNUb0xvYWRTdGFydEluZGV4OiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBfbWVtYmVyRmlsdGVyVHlwZTpNZW1iZXJGaWx0ZXJUeXBlO1xyXG4gICAgICAgIHByaXZhdGUgX3JlbmRlcmluZ0NhbGxiYWNrOmFueTtcclxuICAgICAgICBwcml2YXRlIF9maWx0ZXJMZXZlbDpzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBfZmlsdGVyVHlwZVN5bWJvbE1hcDogeyBba2V5OiBzdHJpbmddOnN0cmluZyB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgX21lbWJlckZpbHRlclR5cGVTZWxlY3RDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIF9maWx0ZXJUeHRDb250YWluZXIgOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfbW9yZU9wdGlvbnNCdXR0b24gOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfanN0cmVlQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfbm90QWxsRWxlbWVudHNWaXNpYmxlQ29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfbm90QWxsRWxlbWVudHNWaXNpYmxlVHh0OiBKUXVlcnk7XHJcbiAgICAgICAgcHJpdmF0ZSBfbm90QWxsRWxlbWVudHNWaXNpYmxlQ291bnQ6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIF9vcHRpb25zTWVudUNvbnRhaW5lcjogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgX2xldmVsc01lbnVCdXR0b246IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIF9sZXZlbHNNZW51Q29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3RydWN0b3IodGFyZ2V0Q29udGFpbmVyOkpRdWVyeSx0ZW1wbGF0ZTpzdHJpbmcscHJlc2VudGVyOiBGaWx0ZXJDb250cm9sKSB7XHJcbiAgICAgICAgICAgIHRoaXMuXyR0YXJnZXRDb250YWluZXIgPSB0YXJnZXRDb250YWluZXI7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXNlbnRlciA9IHByZXNlbnRlcjtcclxuICAgICAgICAgICAgdGhpcy5JbnNlcnRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuSW5pdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBJbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZVN5bWJvbE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLkdldERvbVJlZmVyZW5jZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5DcmVhdGVJbm5lckNvbnRyb2xzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuQmluZEV2ZW50cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIENyZWF0ZVN5bWJvbE1hcCgpIHtcclxuICAgICAgICAgICAgdmFyIG1hcCA9IHt9O1xyXG4gICAgICAgICAgICBtYXBbTWVtYmVyRmlsdGVyVHlwZVtNZW1iZXJGaWx0ZXJUeXBlLkNvbnRhaW5zXV0gPSBcIip4KlwiO1xyXG4gICAgICAgICAgICBtYXBbTWVtYmVyRmlsdGVyVHlwZVtNZW1iZXJGaWx0ZXJUeXBlLkJlZ2luc1dpdGhdXSA9IFwieCpcIjtcclxuICAgICAgICAgICAgbWFwW01lbWJlckZpbHRlclR5cGVbTWVtYmVyRmlsdGVyVHlwZS5FbmRzV2l0aF1dID0gXCIqeFwiO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJUeXBlU3ltYm9sTWFwID0gbWFwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRNYXBwZWRTeW1ib2wodHlwZTogTWVtYmVyRmlsdGVyVHlwZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsdGVyVHlwZVN5bWJvbE1hcFtNZW1iZXJGaWx0ZXJUeXBlW3R5cGVdXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0RG9tUmVmZXJlbmNlcygpIHtcclxuICAgICAgICAgICAgdGhpcy5fbWVtYmVyRmlsdGVyVHlwZVNlbGVjdENvbnRhaW5lciA9IHRoaXMuR2V0QnlBdHRyaWJ1dGUoXCJfbWVtYmVyRmlsdGVyVHlwZVNlbGVjdENvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyVHh0Q29udGFpbmVyID0gdGhpcy5HZXRCeUF0dHJpYnV0ZShcIl9maWx0ZXJUeHRDb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX21vcmVPcHRpb25zQnV0dG9uID0gdGhpcy5HZXRCeUF0dHJpYnV0ZShcIl9tb3JlT3B0aW9uc0J1dHRvblwiKTtcclxuICAgICAgICAgICAgdGhpcy5fanN0cmVlQ29udGFpbmVyID0gdGhpcy5HZXRCeUF0dHJpYnV0ZShcIl9qc3RyZWVDb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX25vdEFsbEVsZW1lbnRzVmlzaWJsZUNvbnRhaW5lciA9IHRoaXMuR2V0QnlBdHRyaWJ1dGUoXCJfbm90QWxsRWxlbWVudHNWaXNpYmxlQ29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9ub3RBbGxFbGVtZW50c1Zpc2libGVUeHQgPSB0aGlzLkdldEJ5QXR0cmlidXRlKFwiX25vdEFsbEVsZW1lbnRzVmlzaWJsZVR4dFwiKTtcclxuICAgICAgICAgICAgdGhpcy5fbm90QWxsRWxlbWVudHNWaXNpYmxlQ291bnQgPSB0aGlzLkdldEJ5QXR0cmlidXRlKFwiX25vdEFsbEVsZW1lbnRzVmlzaWJsZUNvdW50XCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zTWVudUNvbnRhaW5lciA9IHRoaXMuR2V0QnlBdHRyaWJ1dGUoXCJfb3B0aW9uc01lbnVDb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2xldmVsc01lbnVCdXR0b24gPSB0aGlzLkdldEJ5QXR0cmlidXRlKFwiX2xldmVsc01lbnVCdXR0b25cIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2xldmVsc01lbnVDb250YWluZXIgPSB0aGlzLkdldEJ5QXR0cmlidXRlKFwiX2ZpbHRlckxldmVsTWVudUNvbnRhaW5lclwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuTWVtYmVyRmlsdGVyVHlwZVNlbGVjdEluc3RhbmNlLm9uKFwidmFsdWVDaGFuZ2VkXCIsIHRoaXMuT25NZW1iZXJGaWx0ZXJUeXBlQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5GaWx0ZXJUZXh0Qm94SW5zdGFuY2Uub24oXCJ2YWx1ZUNoYW5nZWRcIiwgdGhpcy5PbkZpbHRlclRleHRDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLkZpbHRlclRleHRCb3hJbnN0YW5jZS5vbihcImVudGVyS2V5XCIsIHRoaXMuT25GaWx0ZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclR4dENvbnRhaW5lci5vbihcIm1vdXNlZG93biB0b3VjaFwiLHRoaXMuT25UZXh0Q29udGFpbmVyQ2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIHRoaXMuTW9yZU9wdGlvbnNNZW51SW5zdGFuY2Uub24oXCJpdGVtQ2xpY2tcIiwgdGhpcy5Pbk1vcmVPcHRpb25zTWVudUl0ZW1DbGlja2VkLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLkxldmVsTWVudUluc3RhbmNlLm9uKFwiaXRlbUNsaWNrXCIsIHRoaXMuT25MZXZlbE1lbnVJdGVtQ2xpY2tlZC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEJpbmRKc1RyZWVFdmVudHMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2pzdHJlZUNvbnRhaW5lci5vbihcImNoYW5nZWQuanN0cmVlXCIsIHRoaXMuT25TZWxlY3Rpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLl9qc3RyZWVDb250YWluZXIub24oXCJjb21hcmNoX3JlZHJhd19ub2RlLmNvbWFyY2guanN0cmVlXCIsIHRoaXMuT25UcmVlUmVkcmF3Tm9kZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5fanN0cmVlQ29udGFpbmVyLm9uKFwibG9hZF9ub2RlLmpzdHJlZVwiLCB0aGlzLk9uTm9kZUxvYWRlZC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5fanN0cmVlQ29udGFpbmVyLm9uKFwicmVhZHkuanN0cmVlXCIsIHRoaXMuT25UcmVlUmVhZHkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZUlubmVyQ29udHJvbHMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQ3JlYXRlU2VsZWN0KHRoaXMuX21lbWJlckZpbHRlclR5cGVTZWxlY3RDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZUZpbHRlclRleHRCb3goKTtcclxuICAgICAgICAgICAgdGhpcy5DcmVhdGVOb3RFbGVtZW50VmlzaWJsZUluZGljYXRvcigpO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZU1vcmVPcHRpb25zTWVudSgpO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZUxldmVsQ29udHJvbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRCeUF0dHJpYnV0ZShkYXRhSWQ6c3RyaW5nKTpKUXVlcnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fJHRhcmdldENvbnRhaW5lci5maW5kKFwiW2RhdGEtaWQ9J1wiK2RhdGFJZCtcIiddXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBnZXQgSnN0cmVlSW5zdGFuY2UoKTogSlNUcmVlIHtcclxuICAgICAgICAgICAgcmV0dXJuICQuanN0cmVlLnJlZmVyZW5jZSh0aGlzLl9qc3RyZWVDb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBnZXQgRmlsdGVyTGV2ZWwoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbHRlckxldmVsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IEZpbHRlckxldmVsTnVtYmVyKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcmVzZW50ZXIuR2V0TGV2ZWxOdW1iZXJGcm9tVW5pcXVlTmFtZSh0aGlzLkZpbHRlckxldmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBNZW1iZXJGaWx0ZXJUeXBlKCk6IE1lbWJlckZpbHRlclR5cGUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWVtYmVyRmlsdGVyVHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBTZWFyY2hQYXR0ZXJuKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hQYXR0ZXJuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJpdmF0ZSBJbnNlcnRUZW1wbGF0ZSh0ZW1wbGF0ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuXyR0YXJnZXRDb250YWluZXIuaHRtbCh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgZ2V0IExldmVsTWVudUluc3RhbmNlKCk6IERldkV4cHJlc3MudWkuZHhDb250ZXh0TWVudSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZXZlbHNNZW51Q29udGFpbmVyLmR4Q29udGV4dE1lbnUoXCJpbnN0YW5jZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0IE1lbWJlckZpbHRlclR5cGVTZWxlY3RJbnN0YW5jZSgpOiBEZXZFeHByZXNzLnVpLmR4U2VsZWN0Qm94IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lbWJlckZpbHRlclR5cGVTZWxlY3RDb250YWluZXIuZHhTZWxlY3RCb3goXCJpbnN0YW5jZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0IEZpbHRlclRleHRCb3hJbnN0YW5jZSgpOiBEZXZFeHByZXNzLnVpLmR4VGV4dEJveCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWx0ZXJUeHRDb250YWluZXIuZHhUZXh0Qm94KFwiaW5zdGFuY2VcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdldCBNb3JlT3B0aW9uc01lbnVJbnN0YW5jZSgpOiBEZXZFeHByZXNzLnVpLmR4Q29udGV4dE1lbnUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uc01lbnVDb250YWluZXIuZHhDb250ZXh0TWVudShcImluc3RhbmNlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBSZXNldCgpIHtcclxuICAgICAgICAgICAgdGhpcy5fJGpzdHJlZUNvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZHJ3ZWROb2RlcyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoVHJlZVJlc29sdmVGdW5jdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaFBhdHRlcm4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c1RvTG9hZFN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl9tZW1iZXJGaWx0ZXJUeXBlID0gTWVtYmVyRmlsdGVyVHlwZS5Db250YWlucztcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyaW5nQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJMZXZlbCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVcGRhdGVUb3RhbEVsZW1lbnRzTG9hZGVkQ291bnQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25vdEFsbEVsZW1lbnRzVmlzaWJsZUNvdW50LnRleHQodGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIaWRlTm90QWxsRWxlbWVudHNBcmVWaXNpYmxlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9ub3RBbGxFbGVtZW50c1Zpc2libGVDb250YWluZXIuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgU2hvd05vdEFsbEVsZW1lbnRzQXJlVmlzaWJsZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fbm90QWxsRWxlbWVudHNWaXNpYmxlQ29udGFpbmVyLnNob3coKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNob3dBbGxUcmVlTG9hZGluZ0luZGljYXRvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5fanN0cmVlQ29udGFpbmVyLmFkZENsYXNzKFwiY29tYXJjaC13aG9sZS10cmVlLWxvYWRpbmdcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBIaWRlQWxsVHJlZUxvYWRpbmdJbmRpY2F0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2pzdHJlZUNvbnRhaW5lci5yZW1vdmVDbGFzcyhcImNvbWFyY2gtd2hvbGUtdHJlZS1sb2FkaW5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRW5hYmxlU2VhcmNoQm94KCkge1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJUeHRDb250YWluZXIucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpLnJlbW92ZUNsYXNzKFwiZmlsdGVyLWRpc2FibGVkXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRGlzYWJsZVNlYXJjaEJveCgpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyVHh0Q29udGFpbmVyLmF0dHIoXCJkaXNhYmxlZFwiLCBcInRydWVcIikuYWRkQ2xhc3MoXCJmaWx0ZXItZGlzYWJsZWRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDbGVhclNlYXJjaFRleHQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRmlsdGVyVGV4dEJveEluc3RhbmNlLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIFVwZGF0ZUZpbHRlclR5cGVTZWxlY3QoKSB7XHJcbiAgICAgICAgICAgIHZhciBpdGVtczogSVNlbGVjdEl0ZW08bnVtYmVyPltdID0gW1xyXG4gICAgICAgICAgICAgICAgeyBJZDogTWVtYmVyRmlsdGVyVHlwZS5Db250YWlucywgQ2FwdGlvbjogdGhpcy5HZXRNYXBwZWRTeW1ib2woTWVtYmVyRmlsdGVyVHlwZS5Db250YWlucykgK1wiIFwiK3RoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIkNvbnRhaW5zXCIpIH0sXHJcbiAgICAgICAgICAgICAgICB7IElkOiBNZW1iZXJGaWx0ZXJUeXBlLkJlZ2luc1dpdGgsIENhcHRpb246IHRoaXMuR2V0TWFwcGVkU3ltYm9sKE1lbWJlckZpbHRlclR5cGUuQmVnaW5zV2l0aCkgK1wiIFwiK3RoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIkJlZ2luc1dpdGhcIikgfSxcclxuICAgICAgICAgICAgICAgIHsgSWQ6IE1lbWJlckZpbHRlclR5cGUuRW5kc1dpdGgsIENhcHRpb246IHRoaXMuR2V0TWFwcGVkU3ltYm9sKE1lbWJlckZpbHRlclR5cGUuRW5kc1dpdGgpICtcIiBcIit0aGlzLl9wcmVzZW50ZXIuR2V0UmVzb3VyY2UoXCJFbmRzV2l0aFwiKSB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB0aGlzLlVwZGF0ZVNlbGVjdEJveEl0ZW1zKHRoaXMuTWVtYmVyRmlsdGVyVHlwZVNlbGVjdEluc3RhbmNlLGl0ZW1zKTtcclxuICAgICAgICAgICAgdGhpcy5VcGRhdGVTZWxlY3RCb3hTZWxlY3RlZEl0ZW0odGhpcy5NZW1iZXJGaWx0ZXJUeXBlU2VsZWN0SW5zdGFuY2UsTWVtYmVyRmlsdGVyVHlwZS5Db250YWlucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZVNlbGVjdChjb250YWluZXI6SlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5keFNlbGVjdEJveCh7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogW10sXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5RXhwcjogXCJDYXB0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZUV4cHI6IFwiSWRcIixcclxuICAgICAgICAgICAgICAgIHNlYXJjaEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDpcIjcwcHhcIixcclxuICAgICAgICAgICAgICAgIG9uT3BlbmVkOiBldiA9PiB7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBldi5jb21wb25lbnQuY29udGVudCgpLnBhcmVudCgpLndpZHRoKDMwMCkgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmllbGRUZW1wbGF0ZTooc2VsZWN0ZWRJdGVtOklTZWxlY3RJdGVtPE1lbWJlckZpbHRlclR5cGU+LCBmaWVsZEVsZW1lbnQpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZXh0Qm94ID0gJChcIjxkaXY+XCIpLmR4VGV4dEJveCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzZWxlY3RlZEl0ZW0gPyB0aGlzLkdldE1hcHBlZFN5bWJvbChzZWxlY3RlZEl0ZW0uSWQpIDogJydcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQuYXBwZW5kKHRleHRCb3gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgVXBkYXRlU2VsZWN0Qm94SXRlbXMoaW5zdGFuY2U6RGV2RXhwcmVzcy51aS5keFNlbGVjdEJveCxpdGVtczphbnkpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2Uub3B0aW9uKFwiaXRlbXNcIiwgaXRlbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcml2YXRlIFVwZGF0ZVNlbGVjdEJveFNlbGVjdGVkSXRlbShpbnN0YW5jZTpEZXZFeHByZXNzLnVpLmR4U2VsZWN0Qm94LGlkOmFueSkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5vcHRpb24oXCJ2YWx1ZVwiLCBpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByaXZhdGUgVXBkYXRlVGV4Qm94UGxhY2Vob2xkZXIoaW5zdGFuY2U6RGV2RXhwcmVzcy51aS5keFRleHRCb3gsdmFsdWU6YW55KSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm9wdGlvbihcInBsYWNlaG9sZGVyXCIsIHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgVXBkYXRlTWVudUl0ZW1zKGluc3RhbmNlOkRldkV4cHJlc3MudWkuZHhDb250ZXh0TWVudSxpdGVtczphbnkpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2Uub3B0aW9uKFwiZGF0YVNvdXJjZVwiLCBpdGVtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZUZpbHRlclRleHRCb3goKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclR4dENvbnRhaW5lci5keFRleHRCb3goe1xyXG4gICAgICAgICAgICAgICAgbW9kZTogXCJzZWFyY2hcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlRXZlbnQ6XCJrZXl1cCBibHVyIGNoYW5nZVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVOb3RFbGVtZW50VmlzaWJsZUluZGljYXRvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5fbm90QWxsRWxlbWVudHNWaXNpYmxlVHh0LnRleHQodGhpcy5fcHJlc2VudGVyLkdldFJlc291cmNlKFwiTm90QWxsRWxlbWVudHNBcmVWaXNpYmxlXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZU1lbnVDb3JlKGNvbnRhaW5lcjpKUXVlcnksdGFyZ2V0OkpRdWVyeSkge1xyXG4gICAgICAgICAgICBjb250YWluZXIuZHhDb250ZXh0TWVudSh7XHJcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiBbXSxcclxuICAgICAgICAgICAgICAgIHNob3dFdmVudDogeyBuYW1lOiBcImR4Y29udGV4dG1lbnUgZHhjbGlja1wiIH0sXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQ3JlYXRlTGV2ZWxDb250cm9sKCkge1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZU1lbnVDb3JlKHRoaXMuX2xldmVsc01lbnVDb250YWluZXIsdGhpcy5fbGV2ZWxzTWVudUJ1dHRvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENyZWF0ZU1vcmVPcHRpb25zTWVudSgpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW1zOiBJQ29udGV4dE1lbnVJdGVtPE1vcmVPcHRpb25zVHlwZT5bXSA9IFtcclxuICAgICAgICAgICAgICAgIHsgaWQ6IE1vcmVPcHRpb25zVHlwZS5TaG93QWxsLHRleHQ6dGhpcy5fcHJlc2VudGVyLkdldFJlc291cmNlKFwiU2hvd0FsbFwiKX0sXHJcbiAgICAgICAgICAgICAgICB7IGlkOiBNb3JlT3B0aW9uc1R5cGUuU2hvd09ubHlTZWxlY3RlZCx0ZXh0OnRoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIlNob3dPbmx5U2VsZWN0ZWRcIil9LFxyXG4gICAgICAgICAgICAgICAgeyBpZDogTW9yZU9wdGlvbnNUeXBlLlNob3dPbmx5RGVzZWxlY3RlZCx0ZXh0OnRoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIlNob3dPbmx5RGVzZWxlY3RlZFwiKX0sXHJcbiAgICAgICAgICAgICAgICB7IGlkOiBNb3JlT3B0aW9uc1R5cGUuRXhwYW5kQWxsLHRleHQ6dGhpcy5fcHJlc2VudGVyLkdldFJlc291cmNlKFwiRXhwYW5kQWxsXCIpICxiZWdpbkdyb3VwOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgeyBpZDogTW9yZU9wdGlvbnNUeXBlLkNvbGxhcHNlQWxsLHRleHQ6dGhpcy5fcHJlc2VudGVyLkdldFJlc291cmNlKFwiQ29sbGFwc2VBbGxcIil9LFxyXG4gICAgICAgICAgICAgICAgeyBpZDogTW9yZU9wdGlvbnNUeXBlLlJldmVydFNlbGVjdGlvbix0ZXh0OnRoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIlJldmVydFNlbGVjdGlvblwiKSxiZWdpbkdyb3VwOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgdGhpcy5DcmVhdGVNZW51Q29yZSh0aGlzLl9vcHRpb25zTWVudUNvbnRhaW5lcix0aGlzLl9tb3JlT3B0aW9uc0J1dHRvbik7XHJcbiAgICAgICAgICAgIHRoaXMuVXBkYXRlTWVudUl0ZW1zKHRoaXMuTW9yZU9wdGlvbnNNZW51SW5zdGFuY2UsaXRlbXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXBkYXRlTGV2ZWxzTWVudSgpIHtcclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5fcHJlc2VudGVyLk1ldGFkYXRhLlNvcnRlZExldmVscy5tYXAobCA9PiB7IHJldHVybiB7IGlkOiBsLlVuaXF1ZU5hbWUsIHRleHQ6IGwuQ2FwdGlvbixpY29uOlwiZmEgZmEtdGgtbGFyZ2VcIiwgYmVnaW5Hcm91cDp0cnVlIH0gYXMgSUNvbnRleHRNZW51SXRlbTxzdHJpbmc+fSkgfHxbXTtcclxuICAgICAgICAgICAgdGhpcy5VcGRhdGVNZW51SXRlbXModGhpcy5MZXZlbE1lbnVJbnN0YW5jZSxpdGVtcyk7XHJcbiAgICAgICAgICAgIGxldCBkZWZhdWx0TGV2ZWwgPSB0aGlzLl9wcmVzZW50ZXIuTWV0YWRhdGEuU29ydGVkTGV2ZWxzWzBdO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJMZXZlbCA9IGRlZmF1bHRMZXZlbC5VbmlxdWVOYW1lO1xyXG4gICAgICAgICAgICB0aGlzLlVwZGF0ZVRleEJveFBsYWNlaG9sZGVyKHRoaXMuRmlsdGVyVGV4dEJveEluc3RhbmNlLHRoaXMuR2V0UGxhY2VIb2xkZXJUZXh0KGRlZmF1bHRMZXZlbC5DYXB0aW9uKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEdldFBsYWNlSG9sZGVyVGV4dChsZXZlbE5hbWU6c3RyaW5nKTogYW55IHtcclxuICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIkZpbHRlclBsYWNlaG9sZGVyVGV4dFwiKX0gJHtsZXZlbE5hbWV9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENsZWFyU2VhcmNoSGlnaGxpZ2h0KCkge1xyXG4gICAgICAgICAgICB0aGlzLl9qc3RyZWVDb250YWluZXIuZmluZChcIi5jb21hcmNoLXNlYXJjaC1oaWdobGlnaHRcIikuZWFjaCgoaSwgZSkgPT4gJChlKS5yZW1vdmVDbGFzcyhcImNvbWFyY2gtc2VhcmNoLWhpZ2hsaWdodFwiKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBTaG93TWF4TGltaXRSZWFjaGVkKGlzTG9hZGluZ0FsbEVsZW1lbnRzOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0xvYWRpbmdBbGxFbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFsZXJ0KHRoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIk1heExpbWl0T2ZFbGVtZW50c1JlYWNoZWRNZXNzYWdlXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNob3dMb2FkQWxsVXNlckNvbmZpcm1hdGlvbih0b3RhbEVsZW1lbnRzQ291bnQ6bnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLlNob3dMb2FkQWxsVXNlckNvbmZpcm1hdGlvbkNvcmUoU3RyaW5nLmZvcm1hdCh0aGlzLl9wcmVzZW50ZXIuR2V0UmVzb3VyY2UoXCJTaG93QWxsQ29uZmlybWF0aW9uTWVzc2FnZVwiKSx0b3RhbEVsZW1lbnRzQ291bnQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFNob3dGaXJzdE5FbGVtZW50c0NvbmZpcm1hdGlvbih0b3RhbEVsZW1lbnRzQ291bnQ6IG51bWJlciwgbWF4VG90YWxFbGVtZW50c0NvdW50OiBudW1iZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuU2hvd0xvYWRBbGxVc2VyQ29uZmlybWF0aW9uQ29yZShTdHJpbmcuZm9ybWF0KHRoaXMuX3ByZXNlbnRlci5HZXRSZXNvdXJjZShcIlNob3dGaXJzdE5FbGVtZW50TWVzc2FnZVwiKSx0b3RhbEVsZW1lbnRzQ291bnQsbWF4VG90YWxFbGVtZW50c0NvdW50KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBTaG93TG9hZEFsbFVzZXJDb25maXJtYXRpb25Db3JlKG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBjb25maXJtKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDcmVhdGVUcmVlKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9qc3RyZWVDb250YWluZXIuYWRkQ2xhc3MoXCJqc3RyZWUtY2hlY2tib3gtc2VsZWN0aW9uXCIpLmpzdHJlZSh7XHJcbiAgICAgICAgICAgICAgICAncGx1Z2lucyc6IFtcImNvcmVcIiwgXCJjb21hcmNoX3JlZHJhd19ub2RlXCIsIFwiY29uZGl0aW9uYWxzZWxlY3RcIl0sXHJcbiAgICAgICAgICAgICAgICAnY29yZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YSc6IChvYmosIGNiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlbmRlcmluZ0NhbGxiYWNrID0gY2I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXNlbnRlci5HZXROb2RlRGF0YShvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3N0cmluZ3MnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdMb2FkaW5nIC4uLic6IFwiIFwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAnY2hlY2tfY2FsbGJhY2snOiAob3BlcmF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb24gPT09IFwiY3JlYXRlX25vZGVcIiB8fCBvcGVyYXRpb24gPT09IFwiZGVsZXRlX25vZGVcIjtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICdmb3JjZV90ZXh0JzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAndGhlbWVzJzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IFwiY29tYXJjaC1kYXJrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkb3RzJzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdpY29ucyc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVzcG9uc2l2ZSc6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICdjb25kaXRpb25hbHNlbGVjdCc6IHRoaXMuT25Db25kaXRpb25hbFNlbGVjdC5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLkJpbmRKc1RyZWVFdmVudHMoKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmcmVzaFRyZWVSZXNvbHZlRnVuY3Rpb24gPSByZXNvbHZlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBEZXN0cm95VHJlZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fanN0cmVlQ29udGFpbmVyLmpzdHJlZShcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZW5kZXJUcmVlKG1lbWJlcnM6IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklNZW1iZXJOb2RlW10pIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyaW5nQ2FsbGJhY2suY2FsbCh0aGlzLkpzdHJlZUluc3RhbmNlLCBtZW1iZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIFNpZ25hbFRyZWVSZWFkeSgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaFRyZWVSZXNvbHZlRnVuY3Rpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldFRyZWVTdGF0ZSgpOiBPYmplY3RbXSB7ICByZXR1cm4gdGhpcy5Kc3RyZWVJbnN0YW5jZS5nZXRfanNvbihcIiNcIik7fVxyXG4gICAgICAgIFxyXG4gICAgICAgIEdldFRyZWVOb2RlKGlkLCBhc0RvbT86IGJvb2xlYW4pOklNZW1iZXJOb2RlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuSnN0cmVlSW5zdGFuY2UuZ2V0X25vZGUoaWQsIGFzRG9tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldFRyZWVOb2RlQ2xvbmUob2JqOmFueSk6SU1lbWJlck5vZGUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5Kc3RyZWVJbnN0YW5jZS5nZXRfanNvbihvYmopIGFzIElNZW1iZXJOb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUmVsb2FkVHJlZU5vZGUob2JqOiBhbnksIGFmdGVyTG9hZENhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgICAgICB0aGlzLkpzdHJlZUluc3RhbmNlLmxvYWRfbm9kZShvYmosKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFmdGVyTG9hZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXJMb2FkQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSZWRyYXdOb2RlKG5vZGU6YW55LCBkZWVwOiBib29sZWFuLCBpc0NhbGxiYWNrOiBib29sZWFuPWZhbHNlLCBmb3JjZVJlbmRlcjogYm9vbGVhbj1mYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLkpzdHJlZUluc3RhbmNlLnJlZHJhd19ub2RlKG5vZGUsIGRlZXAsIGlzQ2FsbGJhY2ssIGZvcmNlUmVuZGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIENvbGxhcHNlQWxsKCkge1xyXG4gICAgICAgICAgICB0aGlzLkpzdHJlZUluc3RhbmNlLmNsb3NlX2FsbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIE9uRmlsdGVyKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5TZWFyY2hQYXR0ZXJuKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuU2VhcmNoKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLk9uQ2xlYXJGaWx0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgT25DbGVhckZpbHRlcigpIHtcclxuICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuRXhlY3V0ZUNsZWFyRmlsdGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgT25Db25kaXRpb25hbFNlbGVjdChub2RlOiBJTWVtYmVyTm9kZSk6Ym9vbGVhbiB7XHJcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ByZXNlbnRlci5IYW5kbGVDb25kaXRpb25hbFNlbGVjdChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpdmF0ZSBPblNlbGVjdGlvbkNoYW5nZWQoZTpKUXVlcnlFdmVudE9iamVjdCxkYXRhOiB7YWN0aW9uOnN0cmluZyxub2RlOklNZW1iZXJOb2RlfSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuSGFuZGxlU2VsZWN0aW9uQ2hhbmdlZChkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpdmF0ZSBPblRyZWVSZWRyYXdOb2RlKGU6SlF1ZXJ5RXZlbnRPYmplY3QsZGF0YTogSUpzdHJlZVJlZHJhd05vZGVBcmdzPGFueSwgYW55Pikge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuSGFuZGxlVHJlZVJlZHJhd05vZGUoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByaXZhdGUgT25Ob2RlTG9hZGVkKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuSGFuZGxlTm9kZUxvYWRlZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcml2YXRlIE9uVHJlZVJlYWR5KCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuSGFuZGxlVHJlZVJlYWR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgT25NZW1iZXJGaWx0ZXJUeXBlQ2hhbmdlZChlOklWYWx1ZUNoYW5nZWRFdmVudHNBcmdzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21lbWJlckZpbHRlclR5cGUgPSBlLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBPbkZpbHRlclRleHRDaGFuZ2VkKGU6IElWYWx1ZUNoYW5nZWRFdmVudHNBcmdzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaFBhdHRlcm4gPSBlLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBPblRleHRDb250YWluZXJDbGljayhlOiBKUXVlcnlFdmVudE9iamVjdCkge1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzQ2xhc3MoXCJkeC1pY29uLXNlYXJjaFwiKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5PbkZpbHRlcigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYodGFyZ2V0Lmhhc0NsYXNzKFwiZHgtaWNvbi1jbGVhclwiKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5PbkNsZWFyRmlsdGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgT25MZXZlbE1lbnVJdGVtQ2xpY2tlZChlOklDb250ZXh0TWVudUl0ZW1DbGlja0V2ZW50QXJnczxzdHJpbmc+KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlckxldmVsID0gZS5pdGVtRGF0YS5pZDtcclxuICAgICAgICAgICAgdGhpcy5GaWx0ZXJUZXh0Qm94SW5zdGFuY2UucmVzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5VcGRhdGVUZXhCb3hQbGFjZWhvbGRlcih0aGlzLkZpbHRlclRleHRCb3hJbnN0YW5jZSx0aGlzLkdldFBsYWNlSG9sZGVyVGV4dChlLml0ZW1EYXRhLnRleHQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgT25Nb3JlT3B0aW9uc01lbnVJdGVtQ2xpY2tlZChlOklDb250ZXh0TWVudUl0ZW1DbGlja0V2ZW50QXJnczxNb3JlT3B0aW9uc1R5cGU+KSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS5pdGVtRGF0YS5pZCkge1xyXG4gICAgICAgICAgICBjYXNlIE1vcmVPcHRpb25zVHlwZS5FeHBhbmRBbGw6XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuRXhwYW5kQWxsKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBNb3JlT3B0aW9uc1R5cGUuUmV2ZXJ0U2VsZWN0aW9uOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlc2VudGVyLlJldmVydFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTW9yZU9wdGlvbnNUeXBlLkNvbGxhcHNlQWxsOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlc2VudGVyLkNvbGxhcHNlQWxsKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBNb3JlT3B0aW9uc1R5cGUuU2hvd09ubHlTZWxlY3RlZDpcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXNlbnRlci5TaG93T25seVNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBNb3JlT3B0aW9uc1R5cGUuU2hvd09ubHlEZXNlbGVjdGVkOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlc2VudGVyLlNob3dPbmx5RGVTZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTW9yZU9wdGlvbnNUeXBlLlNob3dBbGw6XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVzZW50ZXIuU2hvd0FsbCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxufSJdfQ==