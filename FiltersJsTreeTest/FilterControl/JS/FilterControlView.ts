namespace Comarch.Controls.FilterControlModule {
    import MemberFilterType = FilterControlModule.Common.MemberFilterType;
    import IMemberNode = FilterControlModule.Common.IMemberNode;
    import IJstreeRedrawNodeArgs = FilterControlModule.Common.IJstreeRedrawNodeArgs;

    interface ISelectItem<T> {
        Id:T,
        Caption:string;
    }
    interface IValueChangedEventsArgs {
      value: any ;
    }

    interface IContextMenuItemClickEventArgs<T> {
        itemData: IContextMenuItem<T> ;
    }

    interface IContextMenuItem<T> {
        id: T;
        text: string;
        icon?: string;
        beginGroup?:boolean;
    }

    enum MoreOptionsType {
        ExpandAll,
        RevertSelection,
        CollapseAll,
        ShowOnlySelected,
        ShowOnlyDeselected,
        ShowAll
    
    }

    export interface IFilterControlViewFactory {
        Create(targetContainer:JQuery,template:string,presenter: FilterControl): IFilterControlView;
    }

    export class FilterControlControlViewFactory implements IFilterControlViewFactory {
        Create(targetContainer:JQuery,template:string,presenter: FilterControlModule.FilterControl): IFilterControlView {
            return new FilterControlView(targetContainer,template,presenter);
        }
    }


    export interface IFilterControlView {
        JstreeInstance: JSTree;
        FilterLevel: string;
        FilterLevelNumber: number;
        MemberFilterType: MemberFilterType;
        SearchPattern: string;
        Reset();
        UpdateTotalElementsLoadedCount(text: string);
        ShowNotAllElementsAreVisible();
        HideNotAllElementsAreVisible();
        UpdateLevelsMenu();
        UpdateFilterTypeSelect();
        CreateTree();
        RenderTree(members: FilterControlModule.Common.IMemberNode[]);
        SignalTreeReady();
        GetTreeState(): IMemberNode[];
        GetTreeNode(id:any,asDom?:boolean):IMemberNode;
        GetTreeNodeClone(obj:any):IMemberNode;
        ReloadTreeNode(obj:any, afterLoadCallback?: () => void);
        ClearSearchText();
        ClearSearchHighlight();
        RedrawNode(node:any, deep: boolean, isCallback?: boolean, forceRender?: boolean);
        ShowAllTreeLoadingIndicator();
        HideAllTreeLoadingIndicator();
        DestroyTree();
        DisableSearchBox();
        EnableSearchBox();
        ShowLoadAllUserConfirmation(totalElementsCount:number): Promise<boolean>;
        ShowFirstNElementsConfirmation(totalElementsCount: number, maxTotalElementsCount: number): Promise<boolean>;
        ShowMaxLimitReached(isLoadingAllElements: boolean);
        CollapseAll();
    }

    export class FilterControlView implements IFilterControlView {
        private _$targetContainer: JQuery;
        private readonly _presenter: FilterControl;
        
        private _$jstreeContainer: JQuery;
        private _redrwedNodes: string[];
        private _refreshTreeResolveFunction: (value?: Object | PromiseLike<Object>) => void;
        private _searchPattern: string;
        private _elementsToLoadStartIndex: number;
        private _memberFilterType:MemberFilterType;
        private _renderingCallback:any;
        private _filterLevel:string;
        private _filterTypeSymbolMap: { [key: string]:string };
        
        private _memberFilterTypeSelectContainer: JQuery;
        private _filterTxtContainer : JQuery;
        private _moreOptionsButton : JQuery;
        private _jstreeContainer: JQuery;
        private _notAllElementsVisibleContainer: JQuery;
        private _notAllElementsVisibleTxt: JQuery;
        private _notAllElementsVisibleCount: JQuery;
        private _optionsMenuContainer: JQuery;
        private _levelsMenuButton: JQuery;
        private _levelsMenuContainer: JQuery;
        
        constructor(targetContainer:JQuery,template:string,presenter: FilterControl) {
            this._$targetContainer = targetContainer;
            this._presenter = presenter;
            this.InsertTemplate(template);
            this.Init();
        }

        private Init() {
            this.CreateSymbolMap();
            this.GetDomReferences();
            this.CreateInnerControls();
            this.BindEvents();
        }
        
        private CreateSymbolMap() {
            var map = {};
            map[MemberFilterType[MemberFilterType.Contains]] = "*x*";
            map[MemberFilterType[MemberFilterType.BeginsWith]] = "x*";
            map[MemberFilterType[MemberFilterType.EndsWith]] = "*x";
            this._filterTypeSymbolMap = map;
        }

        private GetMappedSymbol(type: MemberFilterType) {
            return this._filterTypeSymbolMap[MemberFilterType[type]];
        }

        private GetDomReferences() {
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
            this._filterTxtContainer.on("mousedown touch",this.OnTextContainerClick.bind(this));
            this.MoreOptionsMenuInstance.on("itemClick", this.OnMoreOptionsMenuItemClicked.bind(this));
            this.LevelMenuInstance.on("itemClick", this.OnLevelMenuItemClicked.bind(this));

        }

        private BindJsTreeEvents() {
            this._jstreeContainer.on("changed.jstree", this.OnSelectionChanged.bind(this));
            this._jstreeContainer.on("comarch_redraw_node.comarch.jstree", this.OnTreeRedrawNode.bind(this));
            this._jstreeContainer.on("load_node.jstree", this.OnNodeLoaded.bind(this));
            this._jstreeContainer.on("ready.jstree", this.OnTreeReady.bind(this));
        }

        private CreateInnerControls() {
            this.CreateSelect(this._memberFilterTypeSelectContainer);
            this.CreateFilterTextBox();
            this.CreateNotElementVisibleIndicator();
            this.CreateMoreOptionsMenu();
            this.CreateLevelControl();
        }

        private GetByAttribute(dataId:string):JQuery {
            return this._$targetContainer.find("[data-id='"+dataId+"']");
        }
        
        get JstreeInstance(): JSTree {
            return $.jstree.reference(this._jstreeContainer);
        }
        
        get FilterLevel(): string {
            return this._filterLevel;
        }

        get FilterLevelNumber(): number {
            return this._presenter.GetLevelNumberFromUniqueName(this.FilterLevel);
        }

        get MemberFilterType(): MemberFilterType {
            return this._memberFilterType;
        }

        get SearchPattern(): string {
            return this._searchPattern;
        };
        
        private InsertTemplate(template: string) {
            this._$targetContainer.html(template);
        }
        
        private get LevelMenuInstance(): DevExpress.ui.dxContextMenu {
            return this._levelsMenuContainer.dxContextMenu("instance");
        }

        private get MemberFilterTypeSelectInstance(): DevExpress.ui.dxSelectBox {
            return this._memberFilterTypeSelectContainer.dxSelectBox("instance");
        }

        private get FilterTextBoxInstance(): DevExpress.ui.dxTextBox {
            return this._filterTxtContainer.dxTextBox("instance");
        }

        private get MoreOptionsMenuInstance(): DevExpress.ui.dxContextMenu {
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

        UpdateTotalElementsLoadedCount(text: string) {
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
            var items: ISelectItem<number>[] = [
                { Id: MemberFilterType.Contains, Caption: this.GetMappedSymbol(MemberFilterType.Contains) +" "+this._presenter.GetResource("Contains") },
                { Id: MemberFilterType.BeginsWith, Caption: this.GetMappedSymbol(MemberFilterType.BeginsWith) +" "+this._presenter.GetResource("BeginsWith") },
                { Id: MemberFilterType.EndsWith, Caption: this.GetMappedSymbol(MemberFilterType.EndsWith) +" "+this._presenter.GetResource("EndsWith") },
            ];
            this.UpdateSelectBoxItems(this.MemberFilterTypeSelectInstance,items);
            this.UpdateSelectBoxSelectedItem(this.MemberFilterTypeSelectInstance,MemberFilterType.Contains);
        }

        private CreateSelect(container:JQuery) {
            container.dxSelectBox({
                items: [],
                displayExpr: "Caption",
                valueExpr: "Id",
                searchEnabled: true,
                width:"70px",
                onOpened: ev => {                
                    setTimeout(() => { ev.component.content().parent().width(300) });
                },
                fieldTemplate:(selectedItem:ISelectItem<MemberFilterType>, fieldElement)=> {
                    var textBox = $("<div>").dxTextBox({
                        value: selectedItem ? this.GetMappedSymbol(selectedItem.Id) : ''
                    });
                    fieldElement.append(textBox);
                }
            });
        }

        private UpdateSelectBoxItems(instance:DevExpress.ui.dxSelectBox,items:any) {
            instance.option("items", items);
        }
        private UpdateSelectBoxSelectedItem(instance:DevExpress.ui.dxSelectBox,id:any) {
            instance.option("value", id);
        }
        private UpdateTexBoxPlaceholder(instance:DevExpress.ui.dxTextBox,value:any) {
            instance.option("placeholder", value);
        }

        private UpdateMenuItems(instance:DevExpress.ui.dxContextMenu,items:any) {
            instance.option("dataSource", items);
        }

        private CreateFilterTextBox() {
            this._filterTxtContainer.dxTextBox({
                mode: "search",
                valueChangeEvent:"keyup blur change"
            });
        }

        private CreateNotElementVisibleIndicator() {
            this._notAllElementsVisibleTxt.text(this._presenter.GetResource("NotAllElementsAreVisible"));
        }

        

        private CreateMenuCore(container:JQuery,target:JQuery) {
            container.dxContextMenu({
                dataSource: [],
                showEvent: { name: "dxcontextmenu dxclick" },
                target: target
            });
        }

        private CreateLevelControl() {
            this.CreateMenuCore(this._levelsMenuContainer,this._levelsMenuButton);
        }

        private CreateMoreOptionsMenu() {
            let items: IContextMenuItem<MoreOptionsType>[] = [
                { id: MoreOptionsType.ShowAll,text:this._presenter.GetResource("ShowAll")},
                { id: MoreOptionsType.ShowOnlySelected,text:this._presenter.GetResource("ShowOnlySelected")},
                { id: MoreOptionsType.ShowOnlyDeselected,text:this._presenter.GetResource("ShowOnlyDeselected")},
                { id: MoreOptionsType.ExpandAll,text:this._presenter.GetResource("ExpandAll") ,beginGroup:true},
                { id: MoreOptionsType.CollapseAll,text:this._presenter.GetResource("CollapseAll")},
                { id: MoreOptionsType.RevertSelection,text:this._presenter.GetResource("RevertSelection"),beginGroup:true},
                ];
            this.CreateMenuCore(this._optionsMenuContainer,this._moreOptionsButton);
            this.UpdateMenuItems(this.MoreOptionsMenuInstance,items);
        }

        UpdateLevelsMenu() {
            var items = this._presenter.Metadata.SortedLevels.map(l => { return { id: l.UniqueName, text: l.Caption,icon:"fa fa-th-large", beginGroup:true } as IContextMenuItem<string>}) ||[];
            this.UpdateMenuItems(this.LevelMenuInstance,items);
            let defaultLevel = this._presenter.Metadata.SortedLevels[0];
            this._filterLevel = defaultLevel.UniqueName;
            this.UpdateTexBoxPlaceholder(this.FilterTextBoxInstance,this.GetPlaceHolderText(defaultLevel.Caption));
        }

        private GetPlaceHolderText(levelName:string): any {
            return `${this._presenter.GetResource("FilterPlaceholderText")} ${levelName}`;
        }

        ClearSearchHighlight() {
            this._jstreeContainer.find(".comarch-search-highlight").each((i, e) => $(e).removeClass("comarch-search-highlight"));
        }

        ShowMaxLimitReached(isLoadingAllElements: boolean) {
            if (isLoadingAllElements) {
                return;
            }
            alert(this._presenter.GetResource("MaxLimitOfElementsReachedMessage"));
        }

        ShowLoadAllUserConfirmation(totalElementsCount:number): Promise<boolean> {
            return this.ShowLoadAllUserConfirmationCore(String.format(this._presenter.GetResource("ShowAllConfirmationMessage"),totalElementsCount));
        }

        ShowFirstNElementsConfirmation(totalElementsCount: number, maxTotalElementsCount: number): Promise<boolean> {
            return this.ShowLoadAllUserConfirmationCore(String.format(this._presenter.GetResource("ShowFirstNElementMessage"),totalElementsCount,maxTotalElementsCount));
        }

        async ShowLoadAllUserConfirmationCore(message: string): Promise<boolean> {
            return new Promise<boolean>((resolve) => {
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

        RenderTree(members: FilterControlModule.Common.IMemberNode[]) {
            this._renderingCallback.call(this.JstreeInstance, members);
        }
        

        SignalTreeReady() {
            this._refreshTreeResolveFunction();
        }

        GetTreeState(): Object[] {  return this.JstreeInstance.get_json("#");}
        
        GetTreeNode(id, asDom?: boolean):IMemberNode {
            return this.JstreeInstance.get_node(id, asDom);
        }

        GetTreeNodeClone(obj:any):IMemberNode {
            return this.JstreeInstance.get_json(obj) as IMemberNode;
        }

        ReloadTreeNode(obj: any, afterLoadCallback?: () => void) {
            this.JstreeInstance.load_node(obj,() => {
                if (afterLoadCallback) {
                    afterLoadCallback();
                }
            });
        }

        RedrawNode(node:any, deep: boolean, isCallback: boolean=false, forceRender: boolean=false) {
            this.JstreeInstance.redraw_node(node, deep, isCallback, forceRender);
        }

        CollapseAll() {
            this.JstreeInstance.close_all();
        }
        
        private OnFilter() {
            if (this.SearchPattern) {
                this._presenter.Search();
            } else {
                this.OnClearFilter();
            }
            
        }

        private OnClearFilter() {
           this._presenter.ExecuteClearFilter();
        }
        
        private OnConditionalSelect(node: IMemberNode):boolean {
           return this._presenter.HandleConditionalSelect(node);
        }
        private OnSelectionChanged(e:JQueryEventObject,data: {action:string,node:IMemberNode}) {
            this._presenter.HandleSelectionChanged(data);
        }
        private OnTreeRedrawNode(e:JQueryEventObject,data: IJstreeRedrawNodeArgs<any, any>) {
            this._presenter.HandleTreeRedrawNode(data);
        }
        private OnNodeLoaded() {
            this._presenter.HandleNodeLoaded();
        }
        private OnTreeReady() {
            this._presenter.HandleTreeReady();
        }
        
        private OnMemberFilterTypeChanged(e:IValueChangedEventsArgs) {
            this._memberFilterType = e.value;
        }

        private OnFilterTextChanged(e: IValueChangedEventsArgs) {
            this._searchPattern = e.value;
        }

        private OnTextContainerClick(e: JQueryEventObject) {
            let target = $(e.target);
            if (target.hasClass("dx-icon-search")) {
                this.OnFilter();
            } else if(target.hasClass("dx-icon-clear")) {
                this.OnClearFilter();
            }
        }

        private OnLevelMenuItemClicked(e:IContextMenuItemClickEventArgs<string>) {
            this._filterLevel = e.itemData.id;
            this.FilterTextBoxInstance.reset();
            this.UpdateTexBoxPlaceholder(this.FilterTextBoxInstance,this.GetPlaceHolderText(e.itemData.text));
        }

        private OnMoreOptionsMenuItemClicked(e:IContextMenuItemClickEventArgs<MoreOptionsType>) {
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


}