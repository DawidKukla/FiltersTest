var ManualModule;
(function (ManualModule) {
    var MockService = Comarch.Controls.FilterControlModule.MockServiceModule.Service.MockService;
    class ManualPage {
        constructor() {
            this._service = new MockService(window["_fakeTree"], window["_fakeDefaultMember"]);
            this.CreateReferenceTree($("#referenceJstreeContainer"), this._service.GetFullData());
            this.CreateReferenceTree($("#referenceJstreeContainer2"), this._service.GetFullData());
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
            }).on('loaded.jstree', () => {
                $container.jstree('open_all');
            }).on('ready.jstree', () => {
            });
        }
    }
    ManualModule.ManualPage = ManualPage;
})(ManualModule || (ManualModule = {}));
var p = new ManualModule.ManualPage();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFudWFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWFudWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sWUFBWSxDQWlDbEI7QUFqQ0QsV0FBTyxZQUFZO0lBQ2YsSUFBTyxXQUFXLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO0lBR2hHO1FBRUk7WUFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUUxRixDQUFDO1FBQ0QsbUJBQW1CLENBQUMsVUFBaUIsRUFBQyxJQUFjO1lBQ2hELFVBQVUsQ0FBQyxNQUFNLENBQ2I7Z0JBQ0ksU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztnQkFDL0IsTUFBTSxFQUFFO29CQUNKLE1BQU0sRUFBRSxJQUFJO29CQUNaLGdCQUFnQixFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUU7d0JBQzVCLE1BQU0sQ0FBQyxTQUFTLEtBQUssYUFBYSxJQUFJLFNBQVMsS0FBRyxhQUFhLENBQUM7b0JBQ3BFLENBQUM7aUJBQ0o7YUFDSixDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBQyxHQUFHLEVBQUU7Z0JBQzNCLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBQyxHQUFHLEVBQUU7WUFFMUIsQ0FBQyxDQUFDLENBQUM7UUFHUCxDQUFDO0tBR0o7SUE1QlksdUJBQVUsYUE0QnRCLENBQUE7QUFDTCxDQUFDLEVBakNNLFlBQVksS0FBWixZQUFZLFFBaUNsQjtBQUVELElBQUksQ0FBQyxHQUFHLElBQUksWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIE1hbnVhbE1vZHVsZSB7XHJcbiAgICBpbXBvcnQgTW9ja1NlcnZpY2UgPSBDb21hcmNoLkNvbnRyb2xzLkZpbHRlckNvbnRyb2xNb2R1bGUuTW9ja1NlcnZpY2VNb2R1bGUuU2VydmljZS5Nb2NrU2VydmljZTtcclxuXHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE1hbnVhbFBhZ2Uge1xyXG4gICAgICAgIF9zZXJ2aWNlOk1vY2tTZXJ2aWNlO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE1vY2tTZXJ2aWNlKHdpbmRvd1tcIl9mYWtlVHJlZVwiXSx3aW5kb3dbXCJfZmFrZURlZmF1bHRNZW1iZXJcIl0pO1xyXG4gICAgICAgICAgICB0aGlzLkNyZWF0ZVJlZmVyZW5jZVRyZWUoJChcIiNyZWZlcmVuY2VKc3RyZWVDb250YWluZXJcIiksdGhpcy5fc2VydmljZS5HZXRGdWxsRGF0YSgpKTtcclxuICAgICAgICAgICAgdGhpcy5DcmVhdGVSZWZlcmVuY2VUcmVlKCQoXCIjcmVmZXJlbmNlSnN0cmVlQ29udGFpbmVyMlwiKSx0aGlzLl9zZXJ2aWNlLkdldEZ1bGxEYXRhKCkpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgQ3JlYXRlUmVmZXJlbmNlVHJlZSgkY29udGFpbmVyOkpRdWVyeSxkYXRhOiBPYmplY3RbXSkge1xyXG4gICAgICAgICAgICAkY29udGFpbmVyLmpzdHJlZShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAncGx1Z2lucyc6IFtcImNvcmVcIiwgXCJjaGVja2JveFwiXSxcclxuICAgICAgICAgICAgICAgICAgICAnY29yZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEnOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnY2hlY2tfY2FsbGJhY2snOiAob3BlcmF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0aW9uID09PSBcImNyZWF0ZV9ub2RlXCIgfHwgb3BlcmF0aW9uPT09XCJkZWxldGVfbm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9KS5vbignbG9hZGVkLmpzdHJlZScsKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lci5qc3RyZWUoJ29wZW5fYWxsJyk7XHJcbiAgICAgICAgICAgIH0pLm9uKCdyZWFkeS5qc3RyZWUnLCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vICBkYXRhLmZvckVhY2goeD0+dGhpcy5SZWZlcmVuY2VKc3RyZWVJbnN0YW5jZS5jcmVhdGVfbm9kZShcIiNcIix4KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG52YXIgcCA9IG5ldyBNYW51YWxNb2R1bGUuTWFudWFsUGFnZSgpOyJdfQ==