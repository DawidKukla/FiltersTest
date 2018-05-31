namespace RandomTreeGeneratorModule {
    export class RandomTreeGenerator {
        GetRandomNodes(nodesNum) {
            return this.GenerateRandomTree(
                {
                    available: nodesNum,
                    id: 0,
                    levelProbDecelerator: 0.05,
                    randMaxPercentage: 0.01
                },
                0,
                nodesNum,
                (makeId, confId) => {
                    return {
                        text: makeId,
                        id: confId,
                        children: []
                    };
                },
                (node, data) => {
                    node.children = data;
                }
            );
        }

        GetNodeRecursive(data, id) {
            var result;
            data.forEach(el => {
                if (el.id === id && !result) {
                    result = el.itemsData;
                } else if (el.hasItems && !result) {
                    result = this.GetNodeRecursive(el.itemsData, id);
                }
            });
            return result;
        }

        GenerateRandomTree(
            conf,
            nextLevelProb,
            maxNumOfNodes,
            nodeBuilder,
            onRecursiveCall
        ) {
            const nodes = [];
            const randomNumOfNodes = Math.floor(Math.random() * maxNumOfNodes * conf.randMaxPercentage) + 1;
            conf.available -= randomNumOfNodes;
            for (let i = 0; i < randomNumOfNodes; i++) {
                const newEl = nodeBuilder(this.CreateRandomCaption(), conf.id++);
                if (conf.available > 0 && Math.round(Math.random() - nextLevelProb)) {
                    onRecursiveCall(
                        newEl,
                        this.GenerateRandomTree(
                            conf,
                            nextLevelProb + conf.levelProbDecelerator,
                            conf.available / randomNumOfNodes,
                            nodeBuilder,
                            onRecursiveCall
                        )
                    );
                }
                nodes.push(newEl);
            }
            return nodes;
        }

        GenerateFlatDataCore(numberOfElements: number,setId:boolean=false,startId:number=0,): Object[] {
            var result = [];
            for (var i = 0; i < numberOfElements; i++) {
                let item = {
                    text: this.CreateRandomCaption(),
                };
                if (setId) {
                    item["id"] = startId++;
                }
                result.push(item);
            }
            return result;

        }

        public CreateRandomCaption() {
            let text = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (let i = 0; i < 10; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }


    }
}