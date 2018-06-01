namespace PerformanceModule {
    import RandomTreeGenerator = RandomTreeGeneratorModule.RandomTreeGenerator;


    export class PerformancePage {
        private _generator: RandomTreeGenerator;
        private _data:Array<Object>;
        constructor() {
            console.log("Index created.");
            this._generator = new RandomTreeGenerator();
        }

        Init() {
            $("#refreshButton").click(this.Refresh.bind(this));
            
        }

        Refresh() {
            this.GenerateFlatData();
            $('#jstreeContainer').jstree("destroy");
            $('#jstreeContainer').jstree(
                {
                    'plugins':["core","checkbox"],
                    'core': {
                        'data': this._data
                    }
                });
        }

        private GenerateData() {
           this._data = this._generator.GetRandomNodes($("#numberOfNodes").val());
            console.log(this._data);
        }
        private GenerateFlatData() {
           this._data = this._generator.GenerateFlatDataCore($("#numberOfNodes").val());
            console.log(this._data);
        }


        
    }
}

var index = new PerformanceModule.PerformancePage();
index.Init();