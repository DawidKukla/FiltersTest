namespace Comarch.Controls.FilterControlModule.FilterServiceModule.Service {
    import MetadataRequest = Common.MetadataRequest;
    import MetadataResponse = Common.MetadataResponse;
    import MembersRequest = Common.MembersRequest;
    import MembersResponse = Common.MembersResponse;
    import LeafMembersRequest = Common.LeafMembersRequest;
    import ChildrenRequest = Common.ChildrenRequest;
    import IFilterControlService = Common.IFilterControlService;
    import FilterRequestBase = Common.FilterRequestBase;
    import AjaxHelper = AjaxHelperModule.AjaxHelper;
    import FiltredElementsChildrenCountResponse = FilterControlModule.Common.FiltredElementsChildrenCountResponse;
    import FiltredElementsChildrenCountRequest = FilterControlModule.Common.FiltredElementsChildrenCountRequest;
    import GetMembersByStatusRequest = FilterControlModule.Common.GetMembersByStatusRequest;
    import IFilterStateManager = FilterControlModule.FilterStateManagerModule.IFilterStateManager;
    import IFilterControlServiceFactory = FilterControlModule.Common.IFilterControlServiceFactory;

    export class FilterControlServiceFactory implements IFilterControlServiceFactory {
        Create(_connectionString: string): IFilterControlService { return new FilterService(_connectionString); }
    }

    export class TestRequest {
        constructor(public Value: string) {}
    }

    export class TestResponse {
        Value: string
    }

    export class FilterService implements IFilterControlService {

        constructor(private _connectionString: string) {

        }

        private FillCommonData(request: FilterRequestBase): FilterRequestBase {
            request.ConnectionString = this._connectionString;
            return request;
        }

        private async Echo() {
            const response = await AjaxHelper.PostData({ url: "api/FilterControl/Echo", data: new TestRequest("Dawid") });
            console.log("ECHO", response);
            return response;
        }

        async GetMetadata(request: MetadataRequest): Promise<MetadataResponse> {
            return AjaxHelper.PostData<MetadataResponse>({ url: "api/FilterControl/GetMetadata", data: this.FillCommonData(request) });
        }

        async GetMembers(request: MembersRequest): Promise<MembersResponse> {
            return AjaxHelper.PostData<MembersResponse>({ url: "api/FilterControl/GetMembers", data: this.FillCommonData(request) });
        }

        async GetLeafMembers(request: LeafMembersRequest): Promise<MembersResponse> {
            return AjaxHelper.PostData<MembersResponse>({ url: "api/FilterControl/GetLeafMembers", data: this.FillCommonData(request) });
        }

        async GetChildren(request: ChildrenRequest): Promise<MembersResponse> {
            return AjaxHelper.PostData<MembersResponse>({ url: "api/FilterControl/GetChildren", data: this.FillCommonData(request) });
        }

        GetMembersByStatus(request: GetMembersByStatusRequest, stateManager: IFilterStateManager): Promise<MembersResponse> {

            return AjaxHelper.PostData<MembersResponse>({ url: "api/FilterControl/GetMembersByStatus", data: this.FillCommonData(request) });
        }

        async GetFiltredElementsChildrenCount(request: FiltredElementsChildrenCountRequest): Promise<FiltredElementsChildrenCountResponse> {
            //TODO
            return null;
        }

    }


}