
///<reference path="./_TypeScriptReferences/Areas/RandomTreeGenerator.ts"/>

import * as Mock from "typemoq";
import RandomTreeGenerator=RandomTreeGeneratorModule.RandomTreeGenerator;

export interface ITest{
    GetData():number;
}

describe("Test Suite", function () {
    var a;

    it("Example", function () {
        a = true;
        console.log("ABC")
        expect(a).toBe(true);
    });

    it("Mock", function() {
        var mock=Mock.Mock.ofType<ITest>();
        mock.setup(x => x.GetData()).returns(() => 100);
        expect(mock.target.GetData()).toBe(100);
    });
    
    it("ReferenceExternal", function() {
        var generator=new RandomTreeGenerator()
    });

});

