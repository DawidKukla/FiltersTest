

///<reference path="../_TypeScriptReferences/Areas/Comarch.Utils.TreeComparator.ts"/>
module TreeComparatorTests {
    import TreeComparator = Comarch.Utils.TreeComparator.TreeComparator;
    import ComparisionResult = Comarch.Utils.TreeComparator.ComparisionResult;
    import NodeComparatorFactory = Comarch.Utils.TreeComparator.NodeComparatorFactory;
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
    
    
    
    describe("TreeComparatorTests", () => {
        
        it("ShouldBeEquivalent_When_ComparingSingleMatchingNodes", () => {
            let a=new TestNode({Id:"1"});
            let b=new TestNode({Id:"1"});
            let sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());
            
            let result = sut.Compare();
            
            expect(result).toBe(ComparisionResult.Equivalent);
        });

        it("ShouldBeDifferent_When_ComparingSingleNOTMatchingNodes", () => {
            let a=new TestNode({Id:"1"});
            let b=new TestNode({Id:"2"});
            let sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());

            let result = sut.Compare();

            expect(result).toBe(ComparisionResult.Different);
        });

        it("ShouldBeDifferent_When_ComparingNodesWithNOTMatchingChildrenCount", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"})]});
            let sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());

            let result = sut.Compare();

            expect(result).toBe(ComparisionResult.Different);
        });

        it("ShouldBeEquivalent_When_ComparingNodesWithSameCountAndMatchingChildren", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());

            let result = sut.Compare();

            expect(result).toBe(ComparisionResult.Equivalent);
        });

        it("ShouldBeDifferent_When_ComparingNodesWithSameCountAndNOTMatchingChildren", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.2"})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1"}),new TestNode({Id:"1.3"})]});
            let sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());

            let result = sut.Compare();

            expect(result).toBe(ComparisionResult.Different);
        });
        it("ShouldWork_When_MultipleLevelRecursion", () => {
            let a=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1",Children:[new TestNode({Id:"1.1.1"}),new TestNode({Id:"1.1.2"})]}),new TestNode({Id:"1.2",Children:[new TestNode({Id:"1.2.1"}),new TestNode({Id:"1.2.2"})]})]});
            let b=new TestNode({Id:"1",Children:[new TestNode({Id:"1.1",Children:[new TestNode({Id:"1.1.1"}),new TestNode({Id:"1.1.2"})]}),new TestNode({Id:"1.2",Children:[new TestNode({Id:"1.2.1"}),new TestNode({Id:"1.2.2"})]})]});
            let sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());
            
            let result = sut.Compare();
            
            expect(result).toBe(ComparisionResult.Equivalent);
            
            b.Children[0].Children[0].Id="100";
            sut=new TreeComparator<TestNode>(a,b,x=>x.Id,x=>x.Children,new NodeComparatorFactory());
            
            result = sut.Compare();
            
            expect(result).toBe(ComparisionResult.Different);
        });
    

    });
}

