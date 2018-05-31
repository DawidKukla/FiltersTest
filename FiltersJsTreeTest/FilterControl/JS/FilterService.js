var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var FilterServiceModule;
            (function (FilterServiceModule) {
                var AjaxHelper = AjaxHelperModule.AjaxHelper;
                class FilterControlServiceFactory {
                    Create(_connectionString) { return new FilterService(_connectionString); }
                }
                FilterServiceModule.FilterControlServiceFactory = FilterControlServiceFactory;
                class TestRequest {
                    constructor(Value) {
                        this.Value = Value;
                    }
                }
                FilterServiceModule.TestRequest = TestRequest;
                class TestResponse {
                }
                FilterServiceModule.TestResponse = TestResponse;
                class FilterService {
                    constructor(_connectionString) {
                        this._connectionString = _connectionString;
                    }
                    FillCommonData(request) {
                        request.ConnectionString = this._connectionString;
                        return request;
                    }
                    async Echo() {
                        const response = await AjaxHelper.PostData({ url: "api/FilterControl/Echo", data: new TestRequest("Dawid") });
                        console.log("ECHO", response);
                        return response;
                    }
                    async GetMetadata(request) {
                        return AjaxHelper.PostData({ url: "api/FilterControl/GetMetadata", data: this.FillCommonData(request) });
                    }
                    async GetMembers(request) {
                        return AjaxHelper.PostData({ url: "api/FilterControl/GetMembers", data: this.FillCommonData(request) });
                    }
                    async GetLeafMembers(request) {
                        return AjaxHelper.PostData({ url: "api/FilterControl/GetLeafMembers", data: this.FillCommonData(request) });
                    }
                    async GetChildren(request) {
                        return AjaxHelper.PostData({ url: "api/FilterControl/GetChildren", data: this.FillCommonData(request) });
                    }
                    GetMembersByStatus(request, stateManager) {
                        return AjaxHelper.PostData({ url: "api/FilterControl/GetMembersByStatus", data: this.FillCommonData(request) });
                    }
                    async GetFiltredElementsChildrenCount(request) {
                        return null;
                    }
                }
                FilterServiceModule.FilterService = FilterService;
            })(FilterServiceModule = FilterControlModule.FilterServiceModule || (FilterControlModule.FilterServiceModule = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZpbHRlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxPQUFPLENBMkVoQjtBQTNFRCxXQUFVLE9BQU87SUFBQyxJQUFBLFFBQVEsQ0EyRXpCO0lBM0VpQixXQUFBLFFBQVE7UUFBQyxJQUFBLG1CQUFtQixDQTJFN0M7UUEzRTBCLFdBQUEsbUJBQW1CO1lBQUMsSUFBQSxtQkFBbUIsQ0EyRWpFO1lBM0U4QyxXQUFBLG1CQUFtQjtnQkFTOUQsSUFBTyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2dCQVFoRDtvQkFDSSxNQUFNLENBQUMsaUJBQXlCLElBQTJCLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDNUc7Z0JBRlksK0NBQTJCLDhCQUV2QyxDQUFBO2dCQUVEO29CQUNJLFlBQW1CLEtBQWE7d0JBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtvQkFBRyxDQUFDO2lCQUN2QztnQkFGWSwrQkFBVyxjQUV2QixDQUFBO2dCQUVEO2lCQUVDO2dCQUZZLGdDQUFZLGVBRXhCLENBQUE7Z0JBRUQ7b0JBRUksWUFBb0IsaUJBQXlCO3dCQUF6QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQVE7b0JBRTdDLENBQUM7b0JBRU8sY0FBYyxDQUFDLE9BQTBCO3dCQUM3QyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO3dCQUNsRCxNQUFNLENBQUMsT0FBTyxDQUFDO29CQUNuQixDQUFDO29CQUVPLEtBQUssQ0FBQyxJQUFJO3dCQUNkLE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUM5RyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDOUIsTUFBTSxDQUFDLFFBQVEsQ0FBQztvQkFDcEIsQ0FBQztvQkFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQXdCO3dCQUN0QyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBbUIsRUFBRSxHQUFHLEVBQUUsK0JBQStCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMvSCxDQUFDO29CQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBdUI7d0JBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFrQixFQUFFLEdBQUcsRUFBRSw4QkFBOEIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzdILENBQUM7b0JBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUEyQjt3QkFDNUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQWtCLEVBQUUsR0FBRyxFQUFFLGtDQUFrQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakksQ0FBQztvQkFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQXdCO3dCQUN0QyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBa0IsRUFBRSxHQUFHLEVBQUUsK0JBQStCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUM5SCxDQUFDO29CQUVELGtCQUFrQixDQUFDLE9BQWtDLEVBQUUsWUFBaUM7d0JBRXBGLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFrQixFQUFFLEdBQUcsRUFBRSxzQ0FBc0MsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3JJLENBQUM7b0JBRUQsS0FBSyxDQUFDLCtCQUErQixDQUFDLE9BQTRDO3dCQUU5RSxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNoQixDQUFDO2lCQUVKO2dCQTNDWSxpQ0FBYSxnQkEyQ3pCLENBQUE7WUFHTCxDQUFDLEVBM0U4QyxtQkFBbUIsR0FBbkIsdUNBQW1CLEtBQW5CLHVDQUFtQixRQTJFakU7UUFBRCxDQUFDLEVBM0UwQixtQkFBbUIsR0FBbkIsNEJBQW1CLEtBQW5CLDRCQUFtQixRQTJFN0M7SUFBRCxDQUFDLEVBM0VpQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQTJFekI7QUFBRCxDQUFDLEVBM0VTLE9BQU8sS0FBUCxPQUFPLFFBMkVoQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU2VydmljZU1vZHVsZSB7XHJcbiAgICBpbXBvcnQgTWV0YWRhdGFSZXF1ZXN0ID0gQ29tbW9uLk1ldGFkYXRhUmVxdWVzdDtcclxuICAgIGltcG9ydCBNZXRhZGF0YVJlc3BvbnNlID0gQ29tbW9uLk1ldGFkYXRhUmVzcG9uc2U7XHJcbiAgICBpbXBvcnQgTWVtYmVyc1JlcXVlc3QgPSBDb21tb24uTWVtYmVyc1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgTWVtYmVyc1Jlc3BvbnNlID0gQ29tbW9uLk1lbWJlcnNSZXNwb25zZTtcclxuICAgIGltcG9ydCBMZWFmTWVtYmVyc1JlcXVlc3QgPSBDb21tb24uTGVhZk1lbWJlcnNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IENoaWxkcmVuUmVxdWVzdCA9IENvbW1vbi5DaGlsZHJlblJlcXVlc3Q7XHJcbiAgICBpbXBvcnQgSUZpbHRlckNvbnRyb2xTZXJ2aWNlID0gQ29tbW9uLklGaWx0ZXJDb250cm9sU2VydmljZTtcclxuICAgIGltcG9ydCBGaWx0ZXJSZXF1ZXN0QmFzZSA9IENvbW1vbi5GaWx0ZXJSZXF1ZXN0QmFzZTtcclxuICAgIGltcG9ydCBBamF4SGVscGVyID0gQWpheEhlbHBlck1vZHVsZS5BamF4SGVscGVyO1xyXG4gICAgaW1wb3J0IEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXNwb25zZSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXNwb25zZTtcclxuICAgIGltcG9ydCBGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVxdWVzdCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IEdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3QgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5HZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IEZpbHRlclN0YXRlTWFuYWdlciA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgIGltcG9ydCBJRmlsdGVyU3RhdGVNYW5hZ2VyID0gQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuSUZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgIGltcG9ydCBJRmlsdGVyQ29udHJvbFNlcnZpY2VGYWN0b3J5ID0gQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeTtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyQ29udHJvbFNlcnZpY2VGYWN0b3J5IGltcGxlbWVudHMgSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSB7XHJcbiAgICAgICAgQ3JlYXRlKF9jb25uZWN0aW9uU3RyaW5nOiBzdHJpbmcpOiBJRmlsdGVyQ29udHJvbFNlcnZpY2UgeyByZXR1cm4gbmV3IEZpbHRlclNlcnZpY2UoX2Nvbm5lY3Rpb25TdHJpbmcpOyB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBjbGFzcyBUZXN0UmVxdWVzdCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIFZhbHVlOiBzdHJpbmcpIHt9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RSZXNwb25zZSB7XHJcbiAgICAgICAgVmFsdWU6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJTZXJ2aWNlIGltcGxlbWVudHMgSUZpbHRlckNvbnRyb2xTZXJ2aWNlIHtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSBfY29ubmVjdGlvblN0cmluZzogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBGaWxsQ29tbW9uRGF0YShyZXF1ZXN0OiBGaWx0ZXJSZXF1ZXN0QmFzZSk6IEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICAgICAgcmVxdWVzdC5Db25uZWN0aW9uU3RyaW5nID0gdGhpcy5fY29ubmVjdGlvblN0cmluZztcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIEVjaG8oKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQWpheEhlbHBlci5Qb3N0RGF0YSh7IHVybDogXCJhcGkvRmlsdGVyQ29udHJvbC9FY2hvXCIsIGRhdGE6IG5ldyBUZXN0UmVxdWVzdChcIkRhd2lkXCIpIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVDSE9cIiwgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXRNZXRhZGF0YShyZXF1ZXN0OiBNZXRhZGF0YVJlcXVlc3QpOiBQcm9taXNlPE1ldGFkYXRhUmVzcG9uc2U+IHtcclxuICAgICAgICAgICAgcmV0dXJuIEFqYXhIZWxwZXIuUG9zdERhdGE8TWV0YWRhdGFSZXNwb25zZT4oeyB1cmw6IFwiYXBpL0ZpbHRlckNvbnRyb2wvR2V0TWV0YWRhdGFcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldE1lbWJlcnMocmVxdWVzdDogTWVtYmVyc1JlcXVlc3QpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gQWpheEhlbHBlci5Qb3N0RGF0YTxNZW1iZXJzUmVzcG9uc2U+KHsgdXJsOiBcImFwaS9GaWx0ZXJDb250cm9sL0dldE1lbWJlcnNcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldExlYWZNZW1iZXJzKHJlcXVlc3Q6IExlYWZNZW1iZXJzUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBBamF4SGVscGVyLlBvc3REYXRhPE1lbWJlcnNSZXNwb25zZT4oeyB1cmw6IFwiYXBpL0ZpbHRlckNvbnRyb2wvR2V0TGVhZk1lbWJlcnNcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldENoaWxkcmVuKHJlcXVlc3Q6IENoaWxkcmVuUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBBamF4SGVscGVyLlBvc3REYXRhPE1lbWJlcnNSZXNwb25zZT4oeyB1cmw6IFwiYXBpL0ZpbHRlckNvbnRyb2wvR2V0Q2hpbGRyZW5cIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldE1lbWJlcnNCeVN0YXR1cyhyZXF1ZXN0OiBHZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0LCBzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIEFqYXhIZWxwZXIuUG9zdERhdGE8TWVtYmVyc1Jlc3BvbnNlPih7IHVybDogXCJhcGkvRmlsdGVyQ29udHJvbC9HZXRNZW1iZXJzQnlTdGF0dXNcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnQocmVxdWVzdDogRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlcXVlc3QpOiBQcm9taXNlPEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICAvL1RPRE9cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG59Il19