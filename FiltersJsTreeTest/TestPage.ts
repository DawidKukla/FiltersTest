namespace TestPageModule {
    import FilterControl = Comarch.Controls.FilterControlModule.FilterControl;
    import AjaxHelper = AjaxHelperModule.AjaxHelper;
    import ICleanedStateInfo = Comarch.Controls.FilterControlModule.Common.ICleanedStateInfo;
    import FilterControlControlViewFactory = Comarch.Controls.FilterControlModule.FilterControlControlViewFactory;
    import FilterStateManagerFactory = Comarch.Controls.FilterControlModule.FilterStateManagerModule.FilterStateManagerFactory;
    import IFilterItem = Comarch.Controls.FilterControlModule.FilterStateManagerModule.Common.IFilterItem;
    import MockService = Comarch.Controls.FilterControlModule.MockServiceModule.Service.MockService;
    import FilterControlServiceMockFactory = Comarch.Controls.FilterControlModule.MockServiceModule.Service.FilterControlServiceMockFactory;
    import FilterControlServiceFactory = Comarch.Controls.FilterControlModule.FilterServiceModule.Service.FilterControlServiceFactory;

    interface IStateRequest {
        StateString: string;
        CleanedStateString: string;
    }

    export class TestPage {
        _filterControl: FilterControl;
        _state: IFilterItem;
        _isMock: boolean;
        private _dataPackageSize: number=2;
        private _maxTotalElementsCount: number=40;
        private _currentWindow:number=0;

        get $JstreeContainer(): JQuery {
            return $("#jstreeContainer");
        }

        get ConnectionString(): string {
            return $("#connectionStringTxt").val();
        }

        get FieldUniqueName(): string {
            return $("#fieldUniqueNameTxt").val();
        }

        constructor() {
            console.log("TestTree created.");
            this.Init();


            $("#packageSize").on("keyup change",() => {
                this._dataPackageSize = parseInt($("#packageSize").val());
                this.UpdateOptions();
            });
            $("#totalElementsCount").on("keyup change",() => {
                this._maxTotalElementsCount = parseInt($("#totalElementsCount").val());
                this.UpdateOptions();
            });
            $("#currentWindow").on("keyup change",() => {
                this._currentWindow =  parseInt($("#currentWindow").val());
                this.UpdateOptions();
            });

            $("#changeConnection").click(() => this.Reload(false));
            $("#mockConnection").click(() => this.Reload(true));
            $("#loadState").click(this.OnLoadState.bind(this));
            $("#saveState").click(this.OnSaveState.bind(this));
            $("#disableLogs").click(this.OnDisableLogs.bind(this));
            $("#enableLogs").click(this.OnEnableLogs.bind(this));
        }

        async Init() {
           $("#packageSize").val(this._dataPackageSize);
            $("#totalElementsCount").val(this._maxTotalElementsCount);
            $("#currentWindow").val(this._currentWindow);
            this._filterControl = new FilterControl(this.GetOptions(),new FilterControlControlViewFactory(), this.GetServiceFactory(true), new FilterStateManagerFactory());
            this.Reload(true);
        }

        private async Reload(mock: boolean) {
            this._isMock = mock;
            this._filterControl.ServiceFactory = this.GetServiceFactory(mock);
            this.UpdateOptions();
            await this._filterControl.Connect(this.ConnectionString, this.FieldUniqueName, this._state);
            console.log("FILTER CONTROL READY");
        }

        private UpdateOptions() {
            this._filterControl.Options.Merge(this.GetOptions());
        }

        private async OnLoadState() {
            const state = await AjaxHelper.GetData<string>({ url: "api/State/Load" });
            const cleanedState = await AjaxHelper.GetData<string>({ url: "api/State/LoadCleanedState" });
            this._state = JSON.parse(state as any);
            window["_fakeCleanedState"] = JSON.parse(cleanedState as any);
            console.log("LOADED STATE:", this._state);
            this.Reload(true);
        }

        private async OnSaveState() {
            let cleanedStateInfo = {
                ExistingMembersHierarchyLookup: {}
            } as ICleanedStateInfo;

            if (this._isMock) {
                cleanedStateInfo = {
                    ExistingMembersHierarchyLookup: (this._filterControl["_service"] as MockService).AllMembersLookup
                } as ICleanedStateInfo;
            }

            const state = JSON.stringify(this._filterControl.GetState());
            const cleanState = JSON.stringify(cleanedStateInfo);

            await AjaxHelper.PostData({ url: "api/State/Save", data: { StateString: state, CleanedStateString: cleanState } as IStateRequest });
            console.log("SAVED STATE:", state);
        }

        OnDisableLogs() {
            window["_orginalConsole"] = console;

            const newConsole = {};
            newConsole["log"] = function() {};
            newConsole["info"] = function() { window["_orginalConsole"].info(arguments) };

            console = newConsole as any;
        }

        OnEnableLogs() {
            console = window["_orginalConsole"];
        }

        GetServiceFactory(mock: boolean): Comarch.Controls.FilterControlModule.Common.IFilterControlServiceFactory {
            if (mock) return new FilterControlServiceMockFactory();
            return new FilterControlServiceFactory();
        }

        GetOptions(): Comarch.Controls.FilterControlModule.IOptions {
            return {
                $TargetContainer:$("#filterControlContainer"),
                Template:FilterControl.Template,
                Resources:FilterControl.Resources,
                DataPackageSize: this._dataPackageSize,
                MaxTotalElementsCount: this._maxTotalElementsCount,
                CurrentWindow: this._currentWindow
            };
        }
    }
}

var page = new TestPageModule.TestPage();