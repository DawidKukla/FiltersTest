module ManualModule {
    import MockService = Comarch.Controls.FilterControlModule.MockServiceModule.Service.MockService;


    export class ManualPage {
        _service:MockService;
        constructor() {
            this._service = new MockService(window["_fakeTree"],window["_fakeDefaultMember"]);
            this.CreateReferenceTree($("#referenceJstreeContainer"),this._service.GetFullData());
            this.CreateReferenceTree($("#referenceJstreeContainer2"),this._service.GetFullData());

        }
        CreateReferenceTree($container:JQuery,data: Object[]) {
            $container.jstree(
                {
                    'plugins': ["core", "checkbox"],
                    'core': {
                        'data': data,
                        'check_callback': (operation) => {
                            return operation === "create_node" || operation==="delete_node";
                        },
                    },
                }).on('loaded.jstree',() => {
                $container.jstree('open_all');
            }).on('ready.jstree',() => {
                //  data.forEach(x=>this.ReferenceJstreeInstance.create_node("#",x));
            });


        }

       
    }
}

var p = new ManualModule.ManualPage();