var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var FilterServiceModule;
            (function (FilterServiceModule) {
                var Service;
                (function (Service) {
                    var AjaxHelper = AjaxHelperModule.AjaxHelper;
                    class FilterControlServiceFactory {
                        Create(_connectionString) { return new FilterService(_connectionString); }
                    }
                    Service.FilterControlServiceFactory = FilterControlServiceFactory;
                    class TestRequest {
                        constructor(Value) {
                            this.Value = Value;
                        }
                    }
                    Service.TestRequest = TestRequest;
                    class TestResponse {
                    }
                    Service.TestResponse = TestResponse;
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
                    Service.FilterService = FilterService;
                })(Service = FilterServiceModule.Service || (FilterServiceModule.Service = {}));
            })(FilterServiceModule = FilterControlModule.FilterServiceModule || (FilterControlModule.FilterServiceModule = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZpbHRlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxPQUFPLENBMEVoQjtBQTFFRCxXQUFVLE9BQU87SUFBQyxJQUFBLFFBQVEsQ0EwRXpCO0lBMUVpQixXQUFBLFFBQVE7UUFBQyxJQUFBLG1CQUFtQixDQTBFN0M7UUExRTBCLFdBQUEsbUJBQW1CO1lBQUMsSUFBQSxtQkFBbUIsQ0EwRWpFO1lBMUU4QyxXQUFBLG1CQUFtQjtnQkFBQyxJQUFBLE9BQU8sQ0EwRXpFO2dCQTFFa0UsV0FBQSxPQUFPO29CQVN0RSxJQUFPLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7b0JBT2hEO3dCQUNJLE1BQU0sQ0FBQyxpQkFBeUIsSUFBMkIsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUM1RztvQkFGWSxtQ0FBMkIsOEJBRXZDLENBQUE7b0JBRUQ7d0JBQ0ksWUFBbUIsS0FBYTs0QkFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO3dCQUFHLENBQUM7cUJBQ3ZDO29CQUZZLG1CQUFXLGNBRXZCLENBQUE7b0JBRUQ7cUJBRUM7b0JBRlksb0JBQVksZUFFeEIsQ0FBQTtvQkFFRDt3QkFFSSxZQUFvQixpQkFBeUI7NEJBQXpCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUTt3QkFFN0MsQ0FBQzt3QkFFTyxjQUFjLENBQUMsT0FBMEI7NEJBQzdDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7NEJBQ2xELE1BQU0sQ0FBQyxPQUFPLENBQUM7d0JBQ25CLENBQUM7d0JBRU8sS0FBSyxDQUFDLElBQUk7NEJBQ2QsTUFBTSxRQUFRLEdBQUcsTUFBTSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQzlHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDO3dCQUNwQixDQUFDO3dCQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBd0I7NEJBQ3RDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFtQixFQUFFLEdBQUcsRUFBRSwrQkFBK0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQy9ILENBQUM7d0JBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUF1Qjs0QkFDcEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQWtCLEVBQUUsR0FBRyxFQUFFLDhCQUE4QixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDN0gsQ0FBQzt3QkFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQTJCOzRCQUM1QyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBa0IsRUFBRSxHQUFHLEVBQUUsa0NBQWtDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNqSSxDQUFDO3dCQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBd0I7NEJBQ3RDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFrQixFQUFFLEdBQUcsRUFBRSwrQkFBK0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzlILENBQUM7d0JBRUQsa0JBQWtCLENBQUMsT0FBa0MsRUFBRSxZQUFpQzs0QkFFcEYsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQWtCLEVBQUUsR0FBRyxFQUFFLHNDQUFzQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDckksQ0FBQzt3QkFFRCxLQUFLLENBQUMsK0JBQStCLENBQUMsT0FBNEM7NEJBRTlFLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ2hCLENBQUM7cUJBRUo7b0JBM0NZLHFCQUFhLGdCQTJDekIsQ0FBQTtnQkFHTCxDQUFDLEVBMUVrRSxPQUFPLEdBQVAsMkJBQU8sS0FBUCwyQkFBTyxRQTBFekU7WUFBRCxDQUFDLEVBMUU4QyxtQkFBbUIsR0FBbkIsdUNBQW1CLEtBQW5CLHVDQUFtQixRQTBFakU7UUFBRCxDQUFDLEVBMUUwQixtQkFBbUIsR0FBbkIsNEJBQW1CLEtBQW5CLDRCQUFtQixRQTBFN0M7SUFBRCxDQUFDLEVBMUVpQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQTBFekI7QUFBRCxDQUFDLEVBMUVTLE9BQU8sS0FBUCxPQUFPLFFBMEVoQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU2VydmljZU1vZHVsZS5TZXJ2aWNlIHtcclxuICAgIGltcG9ydCBNZXRhZGF0YVJlcXVlc3QgPSBDb21tb24uTWV0YWRhdGFSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IE1ldGFkYXRhUmVzcG9uc2UgPSBDb21tb24uTWV0YWRhdGFSZXNwb25zZTtcclxuICAgIGltcG9ydCBNZW1iZXJzUmVxdWVzdCA9IENvbW1vbi5NZW1iZXJzUmVxdWVzdDtcclxuICAgIGltcG9ydCBNZW1iZXJzUmVzcG9uc2UgPSBDb21tb24uTWVtYmVyc1Jlc3BvbnNlO1xyXG4gICAgaW1wb3J0IExlYWZNZW1iZXJzUmVxdWVzdCA9IENvbW1vbi5MZWFmTWVtYmVyc1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgQ2hpbGRyZW5SZXF1ZXN0ID0gQ29tbW9uLkNoaWxkcmVuUmVxdWVzdDtcclxuICAgIGltcG9ydCBJRmlsdGVyQ29udHJvbFNlcnZpY2UgPSBDb21tb24uSUZpbHRlckNvbnRyb2xTZXJ2aWNlO1xyXG4gICAgaW1wb3J0IEZpbHRlclJlcXVlc3RCYXNlID0gQ29tbW9uLkZpbHRlclJlcXVlc3RCYXNlO1xyXG4gICAgaW1wb3J0IEFqYXhIZWxwZXIgPSBBamF4SGVscGVyTW9kdWxlLkFqYXhIZWxwZXI7XHJcbiAgICBpbXBvcnQgRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlc3BvbnNlID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlc3BvbnNlO1xyXG4gICAgaW1wb3J0IEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXF1ZXN0ID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlcXVlc3Q7XHJcbiAgICBpbXBvcnQgR2V0TWVtYmVyc0J5U3RhdHVzUmVxdWVzdCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgSUZpbHRlclN0YXRlTWFuYWdlciA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLklGaWx0ZXJTdGF0ZU1hbmFnZXI7XHJcbiAgICBpbXBvcnQgSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLklGaWx0ZXJDb250cm9sU2VydmljZUZhY3Rvcnk7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeSBpbXBsZW1lbnRzIElGaWx0ZXJDb250cm9sU2VydmljZUZhY3Rvcnkge1xyXG4gICAgICAgIENyZWF0ZShfY29ubmVjdGlvblN0cmluZzogc3RyaW5nKTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlIHsgcmV0dXJuIG5ldyBGaWx0ZXJTZXJ2aWNlKF9jb25uZWN0aW9uU3RyaW5nKTsgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUZXN0UmVxdWVzdCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIFZhbHVlOiBzdHJpbmcpIHt9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFRlc3RSZXNwb25zZSB7XHJcbiAgICAgICAgVmFsdWU6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJTZXJ2aWNlIGltcGxlbWVudHMgSUZpbHRlckNvbnRyb2xTZXJ2aWNlIHtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSBfY29ubmVjdGlvblN0cmluZzogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBGaWxsQ29tbW9uRGF0YShyZXF1ZXN0OiBGaWx0ZXJSZXF1ZXN0QmFzZSk6IEZpbHRlclJlcXVlc3RCYXNlIHtcclxuICAgICAgICAgICAgcmVxdWVzdC5Db25uZWN0aW9uU3RyaW5nID0gdGhpcy5fY29ubmVjdGlvblN0cmluZztcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIEVjaG8oKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQWpheEhlbHBlci5Qb3N0RGF0YSh7IHVybDogXCJhcGkvRmlsdGVyQ29udHJvbC9FY2hvXCIsIGRhdGE6IG5ldyBUZXN0UmVxdWVzdChcIkRhd2lkXCIpIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVDSE9cIiwgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXRNZXRhZGF0YShyZXF1ZXN0OiBNZXRhZGF0YVJlcXVlc3QpOiBQcm9taXNlPE1ldGFkYXRhUmVzcG9uc2U+IHtcclxuICAgICAgICAgICAgcmV0dXJuIEFqYXhIZWxwZXIuUG9zdERhdGE8TWV0YWRhdGFSZXNwb25zZT4oeyB1cmw6IFwiYXBpL0ZpbHRlckNvbnRyb2wvR2V0TWV0YWRhdGFcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldE1lbWJlcnMocmVxdWVzdDogTWVtYmVyc1JlcXVlc3QpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gQWpheEhlbHBlci5Qb3N0RGF0YTxNZW1iZXJzUmVzcG9uc2U+KHsgdXJsOiBcImFwaS9GaWx0ZXJDb250cm9sL0dldE1lbWJlcnNcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldExlYWZNZW1iZXJzKHJlcXVlc3Q6IExlYWZNZW1iZXJzUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBBamF4SGVscGVyLlBvc3REYXRhPE1lbWJlcnNSZXNwb25zZT4oeyB1cmw6IFwiYXBpL0ZpbHRlckNvbnRyb2wvR2V0TGVhZk1lbWJlcnNcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldENoaWxkcmVuKHJlcXVlc3Q6IENoaWxkcmVuUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBBamF4SGVscGVyLlBvc3REYXRhPE1lbWJlcnNSZXNwb25zZT4oeyB1cmw6IFwiYXBpL0ZpbHRlckNvbnRyb2wvR2V0Q2hpbGRyZW5cIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldE1lbWJlcnNCeVN0YXR1cyhyZXF1ZXN0OiBHZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0LCBzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIEFqYXhIZWxwZXIuUG9zdERhdGE8TWVtYmVyc1Jlc3BvbnNlPih7IHVybDogXCJhcGkvRmlsdGVyQ29udHJvbC9HZXRNZW1iZXJzQnlTdGF0dXNcIiwgZGF0YTogdGhpcy5GaWxsQ29tbW9uRGF0YShyZXF1ZXN0KSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnQocmVxdWVzdDogRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlcXVlc3QpOiBQcm9taXNlPEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICAvL1RPRE9cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG59Il19