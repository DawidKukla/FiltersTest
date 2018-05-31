var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var FilterStateManagerModule;
            (function (FilterStateManagerModule) {
                var Common;
                (function (Common) {
                    let FilterType;
                    (function (FilterType) {
                        FilterType[FilterType["Included"] = 0] = "Included";
                        FilterType[FilterType["Excluded"] = 1] = "Excluded";
                    })(FilterType = Common.FilterType || (Common.FilterType = {}));
                    let SelectionMode;
                    (function (SelectionMode) {
                        SelectionMode[SelectionMode["Selected"] = "Selected"] = "Selected";
                        SelectionMode[SelectionMode["Deselected"] = "Deselected"] = "Deselected";
                        SelectionMode[SelectionMode["Undetermined"] = "Undetermined"] = "Undetermined";
                    })(SelectionMode = Common.SelectionMode || (Common.SelectionMode = {}));
                })(Common = FilterStateManagerModule.Common || (FilterStateManagerModule.Common = {}));
            })(FilterStateManagerModule = FilterControlModule.FilterStateManagerModule || (FilterControlModule.FilterStateManagerModule = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sT0FBTyxDQW1CYjtBQW5CRCxXQUFPLE9BQU87SUFBQyxJQUFBLFFBQVEsQ0FtQnRCO0lBbkJjLFdBQUEsUUFBUTtRQUFDLElBQUEsbUJBQW1CLENBbUIxQztRQW5CdUIsV0FBQSxtQkFBbUI7WUFBQyxJQUFBLHdCQUF3QixDQW1CbkU7WUFuQjJDLFdBQUEsd0JBQXdCO2dCQUFDLElBQUEsTUFBTSxDQW1CMUU7Z0JBbkJvRSxXQUFBLE1BQU07b0JBT3ZFLElBQVksVUFHWDtvQkFIRCxXQUFZLFVBQVU7d0JBQ2xCLG1EQUFRLENBQUE7d0JBQ1IsbURBQVEsQ0FBQTtvQkFDWixDQUFDLEVBSFcsVUFBVSxHQUFWLGlCQUFVLEtBQVYsaUJBQVUsUUFHckI7b0JBRUQsSUFBWSxhQUlYO29CQUpELFdBQVksYUFBYTt3QkFDckIsMENBQVcsVUFBaUIsY0FBQSxDQUFBO3dCQUM1Qiw0Q0FBYSxZQUFtQixnQkFBQSxDQUFBO3dCQUNoQyw4Q0FBZSxjQUFxQixrQkFBQSxDQUFBO29CQUN4QyxDQUFDLEVBSlcsYUFBYSxHQUFiLG9CQUFhLEtBQWIsb0JBQWEsUUFJeEI7Z0JBR0wsQ0FBQyxFQW5Cb0UsTUFBTSxHQUFOLCtCQUFNLEtBQU4sK0JBQU0sUUFtQjFFO1lBQUQsQ0FBQyxFQW5CMkMsd0JBQXdCLEdBQXhCLDRDQUF3QixLQUF4Qiw0Q0FBd0IsUUFtQm5FO1FBQUQsQ0FBQyxFQW5CdUIsbUJBQW1CLEdBQW5CLDRCQUFtQixLQUFuQiw0QkFBbUIsUUFtQjFDO0lBQUQsQ0FBQyxFQW5CYyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQW1CdEI7QUFBRCxDQUFDLEVBbkJNLE9BQU8sS0FBUCxPQUFPLFFBbUJiIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIENvbWFyY2guQ29udHJvbHMuRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuQ29tbW9uIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlckl0ZW0ge1xyXG4gICAgICAgIFR5cGU6IEZpbHRlclR5cGU7XHJcbiAgICAgICAgVW5pcXVlTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIENoaWxkcmVuOiBJRmlsdGVySXRlbVtdO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBlbnVtIEZpbHRlclR5cGUge1xyXG4gICAgICAgIEluY2x1ZGVkLFxyXG4gICAgICAgIEV4Y2x1ZGVkXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBlbnVtIFNlbGVjdGlvbk1vZGUge1xyXG4gICAgICAgIFNlbGVjdGVkID0gXCJTZWxlY3RlZFwiIGFzIGFueSxcclxuICAgICAgICBEZXNlbGVjdGVkID0gXCJEZXNlbGVjdGVkXCIgYXMgYW55LFxyXG4gICAgICAgIFVuZGV0ZXJtaW5lZCA9IFwiVW5kZXRlcm1pbmVkXCIgYXMgYW55XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG59Il19