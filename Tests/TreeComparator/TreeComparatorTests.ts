

///<reference path="../_TypeScriptReferences/Areas/Comarch.Utils.TreeComparator.ts"/>
module TreeComparatorTests {
    import TreeComparator = Comarch.Utils.TreeComparator.TreeComparator;
    import ComparisionResult = Comarch.Utils.TreeComparator.ComparisionResult;
    import TreeComparatorOptions = Comarch.Utils.TreeComparator.TreeComparatorOptions;
    interface ITestNode {
        Id: any;
        Children?: TestNode[];
    }
    class TestNode implements ITestNode {
        public Id:string;
        public Children: TestNode[]=[];
        constructor(i:ITestNode){
            Object.assign(this,i)
        }}
    
    class TestHelper{
        static GetOrderInvarianComparator(a:TestNode, b:TestNode, nodeProcessingCallback:(a:TestNode,b:TestNode)=>void =()=>{}): TreeComparator<TestNode>{
            return new TreeComparator<TestNode>(this.GetOptions(a, b, nodeProcessingCallback));
        }
        static GetComparator(a:TestNode, b:TestNode, nodeProcessingCallback:(a:TestNode,b:TestNode)=>void =()=>{}): TreeComparator<TestNode>{
            let treeComparatorOptions = this.GetOptions(a, b, nodeProcessingCallback);
            treeComparatorOptions.OrderInvariant=false;
            return new TreeComparator<TestNode>(treeComparatorOptions);
        }

        private static GetOptions(a: TestNode, b: TestNode, nodeProcessingCallback: (a: TestNode, b: TestNode) => void) {
            return new TreeComparatorOptions<TestNode>(<TreeComparatorOptions<TestNode>>{
                A: a,
                B: b,
                UniqueNameSelector: x => x.Id,
                ChildrenSelector: x => x.Children,
                NodeProcessingCallback: nodeProcessingCallback
            });
        }
    }
    
    describe("TreeComparatorTests", () => {
        
        it("Should_BeEquivalent_When_ComparingSingleMatchingNodes", () => {
            let a=new TestNode({Id:"1"});
            let b=new TestNode({Id:"1"});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);
            
            let result = sut.Compare();
            
            should(result).be.exactly(ComparisionResult.Equivalent);
            
            expect(true).toBe(true);
        });

        it("Should_BeDifferent_When_ComparingSingleNOTMatchingNodes", () => {
            let a=new TestNode({Id:"1"});
            let b=new TestNode({Id:"2"});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Different);

            expect(true).toBe(true);
        });

        it("Should_BeDifferent_When_ComparingNodesWithNOTMatchingChildrenCount", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Different);

            expect(true).toBe(true);
        });

        it("Should_BeEquivalent_When_ComparingNodesWithSameCountAndMatchingChildren", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Equivalent);

            expect(true).toBe(true);
        });

        it("Should_BeEquivalent_When_InDiffrentOrder", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.2"}),new TestNode({Id:"1.1"})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Equivalent);

            expect(true).toBe(true);
        });

        it("Should_BeDifferent_When_ComparingNodesWithSameCountAndNOTMatchingChildren", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.3"})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Different);

            expect(true).toBe(true);
        });
        it("Should_Work_When_MultipleLevelRecursion", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1",Children:[new TestNode({Id:"1.1.1"}),new TestNode({Id:"1.1.2"})]}),new TestNode({Id:"1.2",Children:[new TestNode({Id:"1.2.1"}),new TestNode({Id:"1.2.2"})]})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1",Children:[new TestNode({Id:"1.1.1"}),new TestNode({Id:"1.1.2"})]}),new TestNode({Id:"1.2",Children:[new TestNode({Id:"1.2.1"}),new TestNode({Id:"1.2.2"})]})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);
            
            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Equivalent);
            
            b.Children[0].Children[0].Id="100";
                        
            result = sut.Compare();
            should(result).be.exactly(ComparisionResult.Different)

            expect(true).toBe(true);
        });

        it("Should_Stop_WhenFirstDifferenceFound", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.2"}),new TestNode({Id:"1.3"})]});
            var processedNodes={};
            let sut=TestHelper.GetOrderInvarianComparator(a,b,(a,b)=>{
                processedNodes[a.Id]=true;
                processedNodes[b.Id]=true;
            });

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Different);
            should(processedNodes).be.deepEqual({
                "1":true,
                })

            expect(true).toBe(true);
        });
        it("Should_IgnoreOrder_WhenInOrderInVariantMode", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.2"}),new TestNode({Id:"1.1"})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Equivalent);

            expect(true).toBe(true);
        });
        it("Should_BeDifferent_WhenInOrderVariantModeAndOrderDiffers", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.2"}),new TestNode({Id:"1.1"})]});
            let sut=TestHelper.GetComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Different);

            expect(true).toBe(true);
        });

        it("Should_BeEquivalent_WhenInOrderVariantModeAndOrderIsTheSame", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.2"}),new TestNode({Id:"1.1"})]});
            let sut=TestHelper.GetOrderInvarianComparator(a,b);

            let result = sut.Compare();

            should(result).be.exactly(ComparisionResult.Equivalent);

            expect(true).toBe(true);
        });

    });
}

