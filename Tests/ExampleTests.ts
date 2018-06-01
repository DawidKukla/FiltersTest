
///<reference path="./_TypeScriptReferences/Areas/RandomTreeGenerator.ts"/>
/*FOR TEST RUNNER TO ADD REFERENCES*/
/*ALSO having index.ts in your project file breaks references*/

import * as Mock from "typemoq";
import RandomTreeGenerator=RandomTreeGeneratorModule.RandomTreeGenerator;


module ExampleTests{
    export interface ITest{
        GetData():number;
    }
    describe("ExampleTests", () => {
        var a;

        it("Example", () => {
            a = true;
            console.log("ABC")
            should(a).be.exactly(true);
            expect(true).toBe(true);
        });

        it("Mock", () => {
            var mock=Mock.Mock.ofType<ITest>();
            mock.setup(x => x.GetData()).returns(() => 100);
            should(mock.target.GetData()).be.exactly(100);
            expect(true).toBe(true);
        });

        it("ReferenceExternal", () => {
            var generator=new RandomTreeGenerator()
            var nodes= generator.GenerateFlatDataCore(10);
            should(nodes.length).be.exactly(10);
            expect(true).toBe(true);
        });

    });
}
 


