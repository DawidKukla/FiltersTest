var Index;
(function (Index_1) {
    var RandomTreeGenerator = RandomTreeGeneratorModule.RandomTreeGenerator;
    var Index = /** @class */ (function () {
        function Index() {
            console.log("Index created.");
            this._generator = new RandomTreeGenerator();
            console.log(this._generator.GetRandomNodes(1000));
        }
        Index.prototype.Init = function () {
        };
        return Index;
    }());
    Index_1.Index = Index;
})(Index || (Index = {}));
var index = new Index.Index();
index.Init();
//# sourceMappingURL=Index.js.map