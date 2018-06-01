
///<reference path="./_TypeScriptReferences/Areas/RandomTreeGenerator.ts"/>
/*FOR TEST RUNNER TO ADD REFERENCES*/

import * as Mock from "typemoq";
import RandomTreeGenerator=RandomTreeGeneratorModule.RandomTreeGenerator;

export interface ITest{
    GetData():number;
}

describe("Test Suite", () => {
    var a;

    it("Example", () => {
        a = true;
        console.log("ABC")
        expect(a).toBe(true);
    });

    it("Mock", () => {
        var mock=Mock.Mock.ofType<ITest>();
        mock.setup(x => x.GetData()).returns(() => 100);
        expect(mock.target.GetData()).toBe(100);
    });
    
    it("ReferenceExternal", () => {
        var generator=new RandomTreeGenerator()
        var nodes= generator.GenerateFlatDataCore(10);
        expect(nodes.length).toBe(10);
        
    });

});

