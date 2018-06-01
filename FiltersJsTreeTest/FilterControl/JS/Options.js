var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            class Options {
                constructor() {
                    this.DataPackageSize = 1000;
                    this.MaxTotalElementsCount = 10000;
                }
                Merge(options) {
                    $.extend(true, this, options);
                    return this;
                }
            }
            FilterControlModule.Options = Options;
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxPQUFPLENBMkJoQjtBQTNCRCxXQUFVLE9BQU87SUFBQyxJQUFBLFFBQVEsQ0EyQnpCO0lBM0JpQixXQUFBLFFBQVE7UUFBQyxJQUFBLG1CQUFtQixDQTJCN0M7UUEzQjBCLFdBQUEsbUJBQW1CO1lBWTFDO2dCQUFBO29CQUlJLG9CQUFlLEdBQVMsSUFBSSxDQUFDO29CQUM3QiwwQkFBcUIsR0FBUyxLQUFLLENBQUM7Z0JBT3hDLENBQUM7Z0JBSkcsS0FBSyxDQUFDLE9BQWlCO29CQUNuQixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzlCLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2FBQ0o7WUFaWSwyQkFBTyxVQVluQixDQUFBO1FBR0wsQ0FBQyxFQTNCMEIsbUJBQW1CLEdBQW5CLDRCQUFtQixLQUFuQiw0QkFBbUIsUUEyQjdDO0lBQUQsQ0FBQyxFQTNCaUIsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUEyQnpCO0FBQUQsQ0FBQyxFQTNCUyxPQUFPLEtBQVAsT0FBTyxRQTJCaEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ29tYXJjaC5Db250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlIHtcclxuICAgIGltcG9ydCBJUmVzb3VyY2VzTWFwID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSVJlc291cmNlc01hcDtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElPcHRpb25zIHtcclxuICAgICAgICAkVGFyZ2V0Q29udGFpbmVyOiBKUXVlcnk7XHJcbiAgICAgICAgVGVtcGxhdGU6IHN0cmluZztcclxuICAgICAgICBSZXNvdXJjZXM6IElSZXNvdXJjZXNNYXA7XHJcbiAgICAgICAgRGF0YVBhY2thZ2VTaXplOiBudW1iZXI7XHJcbiAgICAgICAgTWF4VG90YWxFbGVtZW50c0NvdW50OiBudW1iZXI7XHJcbiAgICAgICAgQ3VycmVudFdpbmRvdzogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBPcHRpb25zIGltcGxlbWVudHMgSU9wdGlvbnMge1xyXG4gICAgICAgICRUYXJnZXRDb250YWluZXI6IEpRdWVyeTtcclxuICAgICAgICBUZW1wbGF0ZTogc3RyaW5nO1xyXG4gICAgICAgIFJlc291cmNlczogSVJlc291cmNlc01hcDtcclxuICAgICAgICBEYXRhUGFja2FnZVNpemU6IG51bWJlcj0xMDAwO1xyXG4gICAgICAgIE1heFRvdGFsRWxlbWVudHNDb3VudDogbnVtYmVyPTEwMDAwO1xyXG4gICAgICAgIEN1cnJlbnRXaW5kb3c6IG51bWJlcjtcclxuXHJcbiAgICAgICAgTWVyZ2Uob3B0aW9uczogSU9wdGlvbnMpOiBPcHRpb25zIHtcclxuICAgICAgICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG59Il19