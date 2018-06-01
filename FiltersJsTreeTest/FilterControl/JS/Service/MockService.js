var Comarch;
(function (Comarch) {
    var Controls;
    (function (Controls) {
        var FilterControlModule;
        (function (FilterControlModule) {
            var MockServiceModule;
            (function (MockServiceModule) {
                var Service;
                (function (Service) {
                    var TestNodeHelper = FilterControlModule.Common.MemberNodesHelper;
                    var MemberFilterType = FilterControlModule.Common.MemberFilterType;
                    var MetadataResponse = FilterControlModule.Common.MetadataResponse;
                    var FilterMetadata = FilterControlModule.Common.FilterMetadata;
                    var FilterLevel = FilterControlModule.Common.FilterLevel;
                    var FiltredElementsChildrenCountResponse = FilterControlModule.Common.FiltredElementsChildrenCountResponse;
                    var SelectionMode = FilterControlModule.FilterStateManagerModule.Common.SelectionMode;
                    var FilterItemState = FilterControlModule.Common.FilterItemState;
                    var ForwardTreeTraversalIteratorFactory = Comarch.Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
                    var TreeHelpers = Comarch.Utils.TreeUtils.TreeHelpers;
                    class FilterControlServiceMockFactory {
                        Create(_connectionString) { return new MockService(window["_fakeTree"], window["_fakeDefaultMember"]); }
                    }
                    Service.FilterControlServiceMockFactory = FilterControlServiceMockFactory;
                    class MockService {
                        constructor(_testTree, _defaultMember) {
                            this._testTree = _testTree;
                            this._defaultMember = _defaultMember;
                            this._totalElementsCount = 0;
                            this._testSortedLevels = [new FilterLevel("Year", "Year"), new FilterLevel("Quater", "Quater"), new FilterLevel("Month", "Month"), new FilterLevel("Day", "Day")];
                            this._childrenTotalCountLookup = {};
                            this.AllMembersLookup = {};
                            this.CreateIds(_testTree);
                            this.AddParentUniqueNames_Levels_ChildCount_AndCalculateTotalElementsCount(_testTree, true);
                            if (this._defaultMember) {
                                this.CreateIds([_defaultMember]);
                                this.AddParentUniqueNames_Levels_ChildCount_AndCalculateTotalElementsCount([_defaultMember], false);
                            }
                        }
                        get CleanedState() {
                            return window["_fakeCleanedState"];
                        }
                        ;
                        GetLevelNumberFromUniqueName(uniqueName) {
                            return this._testSortedLevels.map(x => x.UniqueName).indexOf(uniqueName);
                        }
                        async GetMetadata(request) {
                            var defaultMemberInfo = null;
                            if (this._defaultMember) {
                                defaultMemberInfo = {
                                    ParentsLookup: {},
                                    LastLevelNodes: [],
                                    HasMoreMembers: false
                                };
                                TreeHelpers.TraversePreorder(this._defaultMember, (x) => x.children, (current) => {
                                    if (!current.children.length) {
                                        defaultMemberInfo.LastLevelNodes.push(current);
                                        return false;
                                    }
                                    else {
                                        defaultMemberInfo.ParentsLookup[current.id] = current;
                                    }
                                    current.data.childrenTotalCount = this._childrenTotalCountLookup[current.id].ChildrenCount;
                                    return true;
                                });
                                this.ClearParents(defaultMemberInfo.ParentsLookup);
                            }
                            const metadata = new FilterMetadata(request.FieldUniqueName, "Calendar Time", this._testSortedLevels, this._testTree.length, this._totalElementsCount, defaultMemberInfo);
                            return new MetadataResponse(metadata, this.CleanedState);
                        }
                        async GetMembers(request) {
                            const result = this.GetMembersCore(this.GetLevelNumberFromUniqueName(request.FieldUniqueName), request.Start, request.Count, request.Filter, false);
                            return { FilterInfo: result };
                        }
                        async GetLeafMembers(request) {
                            const result = this.GetMembersCore(this.GetLevelNumberFromUniqueName(request.FieldUniqueName), request.Start, request.Count, request.Filter, true);
                            return { FilterInfo: result };
                        }
                        async GetChildren(request) {
                            var result = null;
                            const temp = this.GetCopyOfWorkingTree();
                            TreeHelpers.TraverseListPreorder(temp, (x) => x.children, (x) => {
                                if (x.id === request.Parent) {
                                    result = x;
                                    return false;
                                }
                                return true;
                            });
                            result = this.SelectSpecyficElements(this.MakeLazyLoaded(result.children), request.Start, request.Count + 1);
                            const hasMoreNodes = this.HasMoreMembers(request.Count, result);
                            if (hasMoreNodes) {
                                result.pop();
                            }
                            result = this.ClearNotNeededData(result, {}, hasMoreNodes);
                            return { FilterInfo: result };
                        }
                        async GetFiltredElementsChildrenCount(request) {
                            var result = new FiltredElementsChildrenCountResponse();
                            let temp = this.GetCopyOfWorkingTree();
                            temp = this.SearchMembersCore(temp, this.GetLevelNumberFromUniqueName(request.FieldUniqueName), request.Filter);
                            TreeHelpers.TraverseListPreorder(temp, (x) => x.children, (x, parent, level, index) => {
                                if (request.NodesUniqueNames.indexOf(x.id) !== -1) {
                                    result.ChildrenCountInfoLookup[x.id] = { ChildrenCount: x.children.length };
                                }
                                return true;
                            }, new ForwardTreeTraversalIteratorFactory());
                            return result;
                        }
                        async GetMembersByStatus(request, stateManager) {
                            const temp = this.GetCopyOfWorkingTree();
                            var allParentsLookup = {};
                            var targetLevelElementsList = [];
                            TreeHelpers.TraverseListPreorder(temp, (x) => x.children, (current, parent, level, index, parents) => {
                                if (current.data && current.data.level === this.GetLevelNumberFromUniqueName(request.FieldUniqueName)) {
                                    if (current.children.length) {
                                        current.children = true;
                                    }
                                    const selectionStatus = stateManager.GetSelectionStatus(parents.map(x => x.id).reverse(), current.id);
                                    if (selectionStatus === SelectionMode.Selected && request.Status === FilterItemState.Checked) {
                                        targetLevelElementsList.push(current);
                                    }
                                    else if (selectionStatus === SelectionMode.Deselected && request.Status === FilterItemState.Unchecked) {
                                        targetLevelElementsList.push(current);
                                    }
                                }
                                if (parent) {
                                    allParentsLookup[parent.id] = parent;
                                }
                                return true;
                            }, new ForwardTreeTraversalIteratorFactory(), true);
                            return { FilterInfo: this.GetPackage(allParentsLookup, targetLevelElementsList, request.Start, request.Count) };
                        }
                        GetCopyOfWorkingTree() {
                            return this.GetCopyOfTree(this._testTree);
                        }
                        GetCopyOfTree(tree) {
                            return JSON.parse(JSON.stringify(tree));
                        }
                        MakeLazyLoaded(nodes) {
                            nodes.forEach(node => {
                                if (node.children.length) {
                                    node.children = true;
                                    delete node.state;
                                }
                            });
                            return nodes;
                        }
                        SelectSpecyficElements(nodes, startIndex, numberOfElements) {
                            const result = [];
                            for (let i = startIndex; i < nodes.length && result.length <= numberOfElements - 1; i++) {
                                result.push(nodes[i]);
                            }
                            return result;
                        }
                        GetMembersCore(targetLevelNumber, start, count, filter, onlyLeafs = false) {
                            let temp = this.GetCopyOfWorkingTree();
                            temp = this.SearchMembersCore(temp, targetLevelNumber, filter);
                            var allParentsLookup = {};
                            var targetLevelElementsList = [];
                            TreeHelpers.TraverseListPreorder(temp, (x) => x.children, (x, parent, level, index) => {
                                if (onlyLeafs) {
                                    if (x.data && x.data.childrenTotalCount === 0) {
                                        targetLevelElementsList.push(x);
                                    }
                                }
                                else if (x.data && x.data.level === targetLevelNumber) {
                                    if (x.children.length) {
                                        x.children = true;
                                    }
                                    targetLevelElementsList.push(x);
                                }
                                if (parent) {
                                    allParentsLookup[parent.id] = parent;
                                }
                                return true;
                            }, new ForwardTreeTraversalIteratorFactory());
                            return this.GetPackage(allParentsLookup, targetLevelElementsList, start, count);
                        }
                        GetPackage(allParentsLookup, targetLevelElementsList, start, count) {
                            var targetParentsLookup = {};
                            this.ClearParents(allParentsLookup);
                            const temp = this.SelectSpecyficElements(targetLevelElementsList, start, count + 1);
                            const hasMoreMembers = this.HasMoreMembers(count, temp);
                            if (hasMoreMembers) {
                                temp.pop();
                            }
                            temp.forEach(x => {
                                TestNodeHelper.GetAllParentsNames(allParentsLookup, x).forEach(parentName => {
                                    targetParentsLookup[parentName] = true;
                                });
                            });
                            for (let key in allParentsLookup) {
                                if (!targetParentsLookup[key]) {
                                    delete allParentsLookup[key];
                                }
                            }
                            return this.ClearNotNeededData(temp, allParentsLookup, hasMoreMembers);
                        }
                        ClearParents(allParentsLookup) {
                            for (let key in allParentsLookup) {
                                if (allParentsLookup.hasOwnProperty(key)) {
                                    const memberNode = allParentsLookup[key];
                                    if (memberNode && typeof memberNode.children !== "boolean") {
                                        memberNode.children.length = 0;
                                    }
                                }
                            }
                        }
                        ClearNotNeededData(lastLevelNodes, allParentsLookup, hasMoreMembers) {
                            lastLevelNodes.forEach(x => delete x.data.level);
                            for (let parentKey in allParentsLookup) {
                                delete allParentsLookup[parentKey].data.level;
                            }
                            return { LastLevelNodes: lastLevelNodes, ParentsLookup: allParentsLookup, HasMoreMembers: hasMoreMembers };
                        }
                        SearchMembersCore(input, targetLevelNumber, filter) {
                            if (!filter || !filter.Value)
                                return input;
                            var result = input;
                            var matchFound = false;
                            var matchCounter = 0;
                            TreeHelpers.TraverseListPreorder(result, (x) => x.children, (x, parent, level, index) => {
                                if (level === targetLevelNumber) {
                                    switch (filter.Type) {
                                        case MemberFilterType.Contains:
                                            matchFound = x.text.toLowerCase().indexOf(filter.Value.toLowerCase()) !== -1;
                                            break;
                                        case MemberFilterType.BeginsWith:
                                            matchFound = x.text.toLowerCase().startsWith(filter.Value.toLowerCase());
                                            break;
                                        case MemberFilterType.EndsWith:
                                            matchFound = x.text.toLowerCase().endsWith(filter.Value.toLowerCase());
                                            break;
                                    }
                                    if (!matchFound) {
                                        if (parent) {
                                            parent.children.splice(index, 1);
                                        }
                                        else {
                                            result.splice(index, 1);
                                        }
                                    }
                                    else {
                                        matchCounter++;
                                    }
                                }
                                return true;
                            });
                            if (!matchCounter)
                                return [];
                            TreeHelpers.TraverseListPreorder(result, (x) => x.children, (x, parent, level, index) => {
                                if (level < targetLevelNumber && !x.children.length) {
                                    if (parent) {
                                        parent.children.splice(index, 1);
                                        return false;
                                    }
                                    else {
                                        result.splice(index, 1);
                                        return false;
                                    }
                                }
                                return true;
                            });
                            return result;
                        }
                        CreateIds(input) {
                            const result = input;
                            TreeHelpers.TraverseListPreorder(result, (x) => x.children, (x, parent, level, index) => {
                                var parts = [];
                                var parentPart = "";
                                if (parent) {
                                    parentPart = parent.id;
                                    parts.push(parentPart);
                                }
                                parts.push(`[${x.text}]`);
                                x["id"] = parts.join(".");
                                return true;
                            });
                            return result;
                        }
                        AddParentUniqueNames_Levels_ChildCount_AndCalculateTotalElementsCount(input, storeGlobal) {
                            const result = input;
                            TreeHelpers.TraverseListPreorder(result, (x) => x.children, (x, parent, level, index) => {
                                var parentUniqueName = null;
                                if (parent) {
                                    parentUniqueName = parent.id;
                                }
                                x.data = {
                                    parentUniqueName: parentUniqueName,
                                    level: level,
                                    childrenTotalCount: x.children.length
                                };
                                if (storeGlobal) {
                                    this._childrenTotalCountLookup[x.id] = { ChildrenCount: x.children.length };
                                    this._totalElementsCount++;
                                    const copy = JSON.parse(JSON.stringify(x));
                                    copy.children.length = 0;
                                    this.AllMembersLookup[x.id] = copy;
                                }
                                return true;
                            }, new ForwardTreeTraversalIteratorFactory());
                            return result;
                        }
                        static CreateFakeTimeHierarchy(numberOfYears) {
                            const result = [];
                            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                            for (let y = 0; y < numberOfYears; y++) {
                                const yearItem = { text: (2000 + y).toString(), children: [] };
                                result.push(yearItem);
                                for (let q = 0; q < 4; q++) {
                                    const quaterItem = { text: `Q${(q + 1).toString()}`, children: [] };
                                    yearItem.children.push(quaterItem);
                                    for (let m = q * 3; m < q * 3 + 3; m++) {
                                        const monthItem = { text: months[m], children: [] };
                                        quaterItem.children.push(monthItem);
                                        for (let d = 0; d < 30; d++) {
                                            const dayItem = { text: (d + 1).toString(), children: [] };
                                            monthItem.children.push(dayItem);
                                        }
                                    }
                                }
                            }
                            return result;
                        }
                        HasMoreMembers(count, loadedLastLevelNodes) {
                            return loadedLastLevelNodes.length === count + 1;
                        }
                        GetFullData() {
                            return JSON.parse(JSON.stringify(this._testTree));
                        }
                        TestPathTracking() {
                            TreeHelpers.TraverseListPreorder(this.GetCopyOfWorkingTree(), (x) => x.children, (x, parent, level, index, path) => {
                                console.log(x.id, "(", path.map(x => x.id), ")");
                                return true;
                            }, new ForwardTreeTraversalIteratorFactory(), true);
                        }
                    }
                    Service.MockService = MockService;
                })(Service = MockServiceModule.Service || (MockServiceModule.Service = {}));
            })(MockServiceModule = FilterControlModule.MockServiceModule || (FilterControlModule.MockServiceModule = {}));
        })(FilterControlModule = Controls.FilterControlModule || (Controls.FilterControlModule = {}));
    })(Controls = Comarch.Controls || (Comarch.Controls = {}));
})(Comarch || (Comarch = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNb2NrU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLE9BQU8sQ0EyWmhCO0FBM1pELFdBQVUsT0FBTztJQUFDLElBQUEsUUFBUSxDQTJaekI7SUEzWmlCLFdBQUEsUUFBUTtRQUFDLElBQUEsbUJBQW1CLENBMlo3QztRQTNaMEIsV0FBQSxtQkFBbUI7WUFBQyxJQUFBLGlCQUFpQixDQTJaL0Q7WUEzWjhDLFdBQUEsaUJBQWlCO2dCQUFDLElBQUEsT0FBTyxDQTJadkU7Z0JBM1pnRSxXQUFBLE9BQU87b0JBR3BFLElBQU8sY0FBYyxHQUFHLG9CQUFBLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztvQkFFakQsSUFBTyxnQkFBZ0IsR0FBRyxvQkFBQSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7b0JBR2xELElBQU8sZ0JBQWdCLEdBQUcsb0JBQUEsTUFBTSxDQUFDLGdCQUFnQixDQUFDO29CQUNsRCxJQUFPLGNBQWMsR0FBRyxvQkFBQSxNQUFNLENBQUMsY0FBYyxDQUFDO29CQUM5QyxJQUFPLFdBQVcsR0FBRyxvQkFBQSxNQUFNLENBQUMsV0FBVyxDQUFDO29CQU94QyxJQUFPLG9DQUFvQyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxvQ0FBb0MsQ0FBQztvQkFFOUcsSUFBTyxhQUFhLEdBQUcsbUJBQW1CLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDekYsSUFBTyxlQUFlLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztvQkFLcEUsSUFBTyxtQ0FBbUMsR0FBRyxRQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUM7b0JBQ2pHLElBQU8sV0FBVyxHQUFHLFFBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7b0JBRWpEO3dCQUNJLE1BQU0sQ0FBQyxpQkFBeUIsSUFBMkIsT0FBTyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzFJO29CQUZZLHVDQUErQixrQ0FFM0MsQ0FBQTtvQkFFRDt3QkFXSSxZQUFvQixTQUF3QixFQUFVLGNBQTJCOzRCQUE3RCxjQUFTLEdBQVQsU0FBUyxDQUFlOzRCQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFhOzRCQVZ6RSx3QkFBbUIsR0FBQyxDQUFDLENBQUM7NEJBQ3RCLHNCQUFpQixHQUNyQixDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUNySSw4QkFBeUIsR0FBNkIsRUFBRSxDQUFDOzRCQUNqRSxxQkFBZ0IsR0FBc0IsRUFBRSxDQUFDOzRCQU9yQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUMxQixJQUFJLENBQUMscUVBQXFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUM1RixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0NBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dDQUNqQyxJQUFJLENBQUMscUVBQXFFLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs2QkFDdkc7d0JBRUwsQ0FBQzt3QkFaRCxJQUFJLFlBQVk7NEJBQ1osT0FBTyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQzt3QkFDdkMsQ0FBQzt3QkFBQSxDQUFDO3dCQVlNLDRCQUE0QixDQUFDLFVBQWtCOzRCQUNuRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM3RSxDQUFDO3dCQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBd0I7NEJBQ3RDLElBQUksaUJBQWlCLEdBQWdCLElBQUksQ0FBQzs0QkFDMUMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dDQUNyQixpQkFBaUIsR0FBRztvQ0FDaEIsYUFBYSxFQUFFLEVBQUU7b0NBQ2pCLGNBQWMsRUFBRSxFQUFFO29DQUNsQixjQUFjLEVBQUUsS0FBSztpQ0FDeEIsQ0FBQztnQ0FDRixXQUFXLENBQUMsZ0JBQWdCLENBQWMsSUFBSSxDQUFDLGNBQWMsRUFDekQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUF5QixFQUNsQyxDQUFDLE9BQU8sRUFBRSxFQUFFO29DQUNSLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTt3Q0FDMUIsaUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3Q0FDL0MsT0FBTyxLQUFLLENBQUM7cUNBQ2hCO3lDQUFNO3dDQUNILGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDO3FDQUN6RDtvQ0FDRCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDO29DQUMzRixPQUFPLElBQUksQ0FBQztnQ0FDaEIsQ0FBQyxDQUFDLENBQUM7Z0NBQ1AsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQzs2QkFDdEQ7NEJBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFDdkQsZUFBZSxFQUNmLElBQUksQ0FBQyxpQkFBaUIsRUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQ3JCLElBQUksQ0FBQyxtQkFBbUIsRUFDeEIsaUJBQWlCLENBQUMsQ0FBQzs0QkFDdkIsT0FBTyxJQUFJLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQzdELENBQUM7d0JBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUF1Qjs0QkFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUNwSixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO3dCQUNsQyxDQUFDO3dCQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBMkI7NEJBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDbkosT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzt3QkFDbEMsQ0FBQzt3QkFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQXdCOzRCQUN0QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7NEJBQ2xCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDOzRCQUN6QyxXQUFXLENBQUMsb0JBQW9CLENBQWMsSUFBSSxFQUM5QyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQXlCLEVBQ2xDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0NBQ0YsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0NBQ3pCLE1BQU0sR0FBRyxDQUFDLENBQUM7b0NBQ1gsT0FBTyxLQUFLLENBQUM7aUNBQ2hCO2dDQUNELE9BQU8sSUFBSSxDQUFDOzRCQUNoQixDQUFDLENBQUMsQ0FBQzs0QkFDUCxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDN0csTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUNoRSxJQUFJLFlBQVksRUFBRTtnQ0FDZCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7NkJBQ2hCOzRCQUVELE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQzs0QkFDM0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzt3QkFFbEMsQ0FBQzt3QkFFRCxLQUFLLENBQUMsK0JBQStCLENBQUMsT0FBNEM7NEJBQzlFLElBQUksTUFBTSxHQUFHLElBQUksb0NBQW9DLEVBQUUsQ0FBQzs0QkFDeEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7NEJBQ3ZDLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNoSCxXQUFXLENBQUMsb0JBQW9CLENBQWMsSUFBSSxFQUM5QyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQXlCLEVBQ2xDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0NBQ3hCLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0NBQy9DLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQ0FDL0U7Z0NBQ0QsT0FBTyxJQUFJLENBQUM7NEJBQ2hCLENBQUMsRUFDRCxJQUFJLG1DQUFtQyxFQUFFLENBQzVDLENBQUM7NEJBRUYsT0FBTyxNQUFNLENBQUM7d0JBQ2xCLENBQUM7d0JBRUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQWtDLEVBQUUsWUFBaUM7NEJBQzFGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDOzRCQUN6QyxJQUFJLGdCQUFnQixHQUFzQixFQUFFLENBQUM7NEJBQzdDLElBQUksdUJBQXVCLEdBQWtCLEVBQUUsQ0FBQzs0QkFDaEQsV0FBVyxDQUFDLG9CQUFvQixDQUFjLElBQUksRUFDOUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUF5QixFQUNsQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtnQ0FDdkMsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7b0NBQ25HLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0NBQ3pCLE9BQU8sQ0FBQyxRQUFRLEdBQUksSUFBWSxDQUFDO3FDQUNwQztvQ0FDRCxNQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0NBQ3RHLElBQUksZUFBZSxLQUFLLGFBQWEsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxlQUFlLENBQUMsT0FBTyxFQUFFO3dDQUMxRix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7cUNBQ3pDO3lDQUFNLElBQUksZUFBZSxLQUFLLGFBQWEsQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxlQUFlLENBQUMsU0FBUyxFQUFFO3dDQUNyRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7cUNBQ3pDO2lDQUVKO2dDQUNELElBQUksTUFBTSxFQUFFO29DQUNSLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7aUNBQ3hDO2dDQUNELE9BQU8sSUFBSSxDQUFDOzRCQUNoQixDQUFDLEVBQ0QsSUFBSSxtQ0FBbUMsRUFBRSxFQUN6QyxJQUFJLENBQ1AsQ0FBQzs0QkFDRixPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEgsQ0FBQzt3QkFFTyxvQkFBb0I7NEJBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzlDLENBQUM7d0JBRU8sYUFBYSxDQUFDLElBQW1COzRCQUNyQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUM1QyxDQUFDO3dCQUVPLGNBQWMsQ0FBQyxLQUFvQjs0QkFDdkMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQ0FDakIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtvQ0FDdEIsSUFBSSxDQUFDLFFBQVEsR0FBSSxJQUFZLENBQUM7b0NBQzlCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztpQ0FDckI7NEJBRUwsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsT0FBTyxLQUFLLENBQUM7d0JBQ2pCLENBQUM7d0JBRU8sc0JBQXNCLENBQUMsS0FBb0IsRUFBRSxVQUFrQixFQUFFLGdCQUF3Qjs0QkFDN0YsTUFBTSxNQUFNLEdBQWlCLEVBQUUsQ0FBQzs0QkFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0NBQ3JGLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3pCOzRCQUNELE9BQU8sTUFBTSxDQUFDO3dCQUNsQixDQUFDO3dCQUdPLGNBQWMsQ0FBQyxpQkFBeUIsRUFBRSxLQUFhLEVBQUUsS0FBYSxFQUFFLE1BQW9CLEVBQUUsWUFBbUIsS0FBSzs0QkFDMUgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7NEJBQ3ZDLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUMvRCxJQUFJLGdCQUFnQixHQUFzQixFQUFFLENBQUM7NEJBQzdDLElBQUksdUJBQXVCLEdBQWtCLEVBQUUsQ0FBQzs0QkFDaEQsV0FBVyxDQUFDLG9CQUFvQixDQUFjLElBQUksRUFDOUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUF5QixFQUNsQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO2dDQUN4QixJQUFJLFNBQVMsRUFBRTtvQ0FDWCxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLEVBQUU7d0NBQzNDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQ0FDbkM7aUNBQ0o7cUNBQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLGlCQUFpQixFQUFFO29DQUNyRCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dDQUNuQixDQUFDLENBQUMsUUFBUSxHQUFJLElBQVksQ0FBQztxQ0FDOUI7b0NBQ0QsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lDQUNuQztnQ0FDRCxJQUFJLE1BQU0sRUFBRTtvQ0FDUixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO2lDQUN4QztnQ0FDRCxPQUFPLElBQUksQ0FBQzs0QkFDaEIsQ0FBQyxFQUNELElBQUksbUNBQW1DLEVBQUUsQ0FDNUMsQ0FBQzs0QkFFRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUNwRixDQUFDO3dCQUVPLFVBQVUsQ0FBQyxnQkFBbUMsRUFBRSx1QkFBc0MsRUFBRSxLQUFhLEVBQUUsS0FBYTs0QkFDeEgsSUFBSSxtQkFBbUIsR0FBZ0MsRUFBRSxDQUFDOzRCQUMxRCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7NEJBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUNwRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDeEQsSUFBSSxjQUFjLEVBQUU7Z0NBQ2hCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs2QkFDZDs0QkFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dDQUNiLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7b0NBQ3hFLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztnQ0FDM0MsQ0FBQyxDQUFDLENBQUM7NEJBQ1AsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsS0FBSyxJQUFJLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRTtnQ0FDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFO29DQUMzQixPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2lDQUNoQzs2QkFDSjs0QkFDRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7d0JBQzNFLENBQUM7d0JBRU8sWUFBWSxDQUFDLGdCQUFtQzs0QkFDcEQsS0FBSyxJQUFJLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRTtnQ0FDOUIsSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7b0NBQ3RDLE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUN6QyxJQUFJLFVBQVUsSUFBSSxPQUFPLFVBQVUsQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO3dDQUN4RCxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7cUNBQ2xDO2lDQUNKOzZCQUNKO3dCQUNMLENBQUM7d0JBRU8sa0JBQWtCLENBQUMsY0FBNkIsRUFBRSxnQkFBbUMsRUFBRSxjQUF1Qjs0QkFDbEgsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDakQsS0FBSyxJQUFJLFNBQVMsSUFBSSxnQkFBZ0IsRUFBRTtnQ0FDcEMsT0FBTyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDOzZCQUNqRDs0QkFDRCxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxDQUFDO3dCQUMvRyxDQUFDO3dCQUVPLGlCQUFpQixDQUFDLEtBQW9CLEVBQUUsaUJBQXlCLEVBQUUsTUFBb0I7NEJBQzNGLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztnQ0FBRSxPQUFPLEtBQUssQ0FBQzs0QkFDM0MsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDOzRCQUNuQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7NEJBQ3ZCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQzs0QkFDckIsV0FBVyxDQUFDLG9CQUFvQixDQUFjLE1BQU0sRUFDaEQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUF5QixFQUNsQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO2dDQUN4QixJQUFJLEtBQUssS0FBSyxpQkFBaUIsRUFBRTtvQ0FDN0IsUUFBUSxNQUFNLENBQUMsSUFBSSxFQUFFO3dDQUNyQixLQUFLLGdCQUFnQixDQUFDLFFBQVE7NENBQzFCLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NENBQzdFLE1BQU07d0NBQ1YsS0FBSyxnQkFBZ0IsQ0FBQyxVQUFVOzRDQUM1QixVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDOzRDQUN6RSxNQUFNO3dDQUNWLEtBQUssZ0JBQWdCLENBQUMsUUFBUTs0Q0FDMUIsVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs0Q0FDdkUsTUFBTTtxQ0FDVDtvQ0FDRCxJQUFJLENBQUMsVUFBVSxFQUFFO3dDQUNiLElBQUksTUFBTSxFQUFFOzRDQUNSLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzt5Q0FDcEM7NkNBQU07NENBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7eUNBQzNCO3FDQUNKO3lDQUFNO3dDQUNILFlBQVksRUFBRSxDQUFDO3FDQUNsQjtpQ0FDSjtnQ0FDRCxPQUFPLElBQUksQ0FBQzs0QkFDaEIsQ0FBQyxDQUNKLENBQUM7NEJBQ0YsSUFBSSxDQUFDLFlBQVk7Z0NBQUUsT0FBTyxFQUFFLENBQUM7NEJBQzdCLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBYyxNQUFNLEVBQ2hELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBeUIsRUFDbEMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtnQ0FDeEIsSUFBSSxLQUFLLEdBQUcsaUJBQWlCLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtvQ0FDakQsSUFBSSxNQUFNLEVBQUU7d0NBQ1IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dDQUNqQyxPQUFPLEtBQUssQ0FBQztxQ0FDaEI7eUNBQU07d0NBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0NBQ3hCLE9BQU8sS0FBSyxDQUFDO3FDQUNoQjtpQ0FDSjtnQ0FFRCxPQUFPLElBQUksQ0FBQzs0QkFDaEIsQ0FBQyxDQUNKLENBQUM7NEJBRUYsT0FBTyxNQUFNLENBQUM7d0JBQ2xCLENBQUM7d0JBRU8sU0FBUyxDQUFDLEtBQW9COzRCQUNsQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUM7NEJBQ3JCLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBYyxNQUFNLEVBQ2hELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBeUIsRUFDbEMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtnQ0FDeEIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dDQUNmLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztnQ0FDcEIsSUFBSSxNQUFNLEVBQUU7b0NBQ1IsVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0NBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUNBQzFCO2dDQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztnQ0FDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0NBQzFCLE9BQU8sSUFBSSxDQUFDOzRCQUNoQixDQUFDLENBQUMsQ0FBQzs0QkFFUCxPQUFPLE1BQU0sQ0FBQzt3QkFDbEIsQ0FBQzt3QkFFTyxxRUFBcUUsQ0FBQyxLQUFvQixFQUFFLFdBQW9COzRCQUNwSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUM7NEJBQ3JCLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBYyxNQUFNLEVBQ2hELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBeUIsRUFDbEMsQ0FBQyxDQUFjLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtnQ0FDckMsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Z0NBQzVCLElBQUksTUFBTSxFQUFFO29DQUNSLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7aUNBQ2hDO2dDQUNELENBQUMsQ0FBQyxJQUFJLEdBQUc7b0NBQ0wsZ0JBQWdCLEVBQUUsZ0JBQWdCO29DQUNsQyxLQUFLLEVBQUUsS0FBSztvQ0FDWixrQkFBa0IsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU07aUNBQ3hDLENBQUM7Z0NBQ0YsSUFBSSxXQUFXLEVBQUU7b0NBQ2IsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO29DQUM1RSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQ0FDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQ0FDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7aUNBQ3RDO2dDQUNELE9BQU8sSUFBSSxDQUFDOzRCQUNoQixDQUFDLEVBQ0QsSUFBSSxtQ0FBbUMsRUFBRSxDQUM1QyxDQUFDOzRCQUNGLE9BQU8sTUFBTSxDQUFDO3dCQUNsQixDQUFDO3dCQUVELE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFxQjs0QkFDaEQsTUFBTSxNQUFNLEdBQWtCLEVBQUUsQ0FBQzs0QkFDakMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDOzRCQUUxSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUNwQyxNQUFNLFFBQVEsR0FBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dDQUM1RSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29DQUN4QixNQUFNLFVBQVUsR0FBZ0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQ0FDakYsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0NBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0NBQ3BDLE1BQU0sU0FBUyxHQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDO3dDQUNqRSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3Q0FDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTs0Q0FDekIsTUFBTSxPQUFPLEdBQWdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQzs0Q0FDeEUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7eUNBQ3BDO3FDQUNKO2lDQUNKOzZCQUNKOzRCQUNELE9BQU8sTUFBTSxDQUFDO3dCQUNsQixDQUFDO3dCQUVPLGNBQWMsQ0FBQyxLQUFhLEVBQUUsb0JBQW1DOzRCQUNyRSxPQUFPLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNyRCxDQUFDO3dCQUVELFdBQVc7NEJBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RELENBQUM7d0JBRUQsZ0JBQWdCOzRCQUNaLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBYyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFDckUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUF5QixFQUNsQyxDQUFDLENBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQ0FDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUNqRCxPQUFPLElBQUksQ0FBQzs0QkFDaEIsQ0FBQyxFQUNELElBQUksbUNBQW1DLEVBQUUsRUFDekMsSUFBSSxDQUNQLENBQUM7d0JBRU4sQ0FBQztxQkFDSjtvQkExWFksbUJBQVcsY0EwWHZCLENBQUE7Z0JBQ0wsQ0FBQyxFQTNaZ0UsT0FBTyxHQUFQLHlCQUFPLEtBQVAseUJBQU8sUUEyWnZFO1lBQUQsQ0FBQyxFQTNaOEMsaUJBQWlCLEdBQWpCLHFDQUFpQixLQUFqQixxQ0FBaUIsUUEyWi9EO1FBQUQsQ0FBQyxFQTNaMEIsbUJBQW1CLEdBQW5CLDRCQUFtQixLQUFuQiw0QkFBbUIsUUEyWjdDO0lBQUQsQ0FBQyxFQTNaaUIsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUEyWnpCO0FBQUQsQ0FBQyxFQTNaUyxPQUFPLEtBQVAsT0FBTyxRQTJaaEIiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ29tYXJjaC5Db250cm9scy5GaWx0ZXJDb250cm9sTW9kdWxlLk1vY2tTZXJ2aWNlTW9kdWxlLlNlcnZpY2Uge1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlID0gQ29tbW9uLklNZW1iZXJOb2RlO1xyXG4gICAgaW1wb3J0IElNZW1iZXJOb2RlTG9va3VwID0gQ29tbW9uLklNZW1iZXJOb2RlTG9va3VwO1xyXG4gICAgaW1wb3J0IFRlc3ROb2RlSGVscGVyID0gQ29tbW9uLk1lbWJlck5vZGVzSGVscGVyO1xyXG4gICAgaW1wb3J0IE1lbWJlckZpbHRlciA9IENvbW1vbi5NZW1iZXJGaWx0ZXI7XHJcbiAgICBpbXBvcnQgTWVtYmVyRmlsdGVyVHlwZSA9IENvbW1vbi5NZW1iZXJGaWx0ZXJUeXBlO1xyXG4gICAgaW1wb3J0IE1ldGFkYXRhUmVxdWVzdCA9IENvbW1vbi5NZXRhZGF0YVJlcXVlc3Q7XHJcbiAgICBpbXBvcnQgSUZpbHRlckluZm8gPSBDb21tb24uSUZpbHRlckluZm87XHJcbiAgICBpbXBvcnQgTWV0YWRhdGFSZXNwb25zZSA9IENvbW1vbi5NZXRhZGF0YVJlc3BvbnNlO1xyXG4gICAgaW1wb3J0IEZpbHRlck1ldGFkYXRhID0gQ29tbW9uLkZpbHRlck1ldGFkYXRhO1xyXG4gICAgaW1wb3J0IEZpbHRlckxldmVsID0gQ29tbW9uLkZpbHRlckxldmVsO1xyXG4gICAgaW1wb3J0IE1lbWJlcnNSZXF1ZXN0ID0gQ29tbW9uLk1lbWJlcnNSZXF1ZXN0O1xyXG4gICAgaW1wb3J0IE1lbWJlcnNSZXNwb25zZSA9IENvbW1vbi5NZW1iZXJzUmVzcG9uc2U7XHJcbiAgICBpbXBvcnQgTGVhZk1lbWJlcnNSZXF1ZXN0ID0gQ29tbW9uLkxlYWZNZW1iZXJzUmVxdWVzdDtcclxuICAgIGltcG9ydCBDaGlsZHJlblJlcXVlc3QgPSBDb21tb24uQ2hpbGRyZW5SZXF1ZXN0O1xyXG4gICAgaW1wb3J0IElGaWx0ZXJDb250cm9sU2VydmljZSA9IENvbW1vbi5JRmlsdGVyQ29udHJvbFNlcnZpY2U7XHJcbiAgICBpbXBvcnQgRmlsdHJlZEVsZW1lbnRzQ2hpbGRyZW5Db3VudFJlcXVlc3QgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5GaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVxdWVzdDtcclxuICAgIGltcG9ydCBGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVzcG9uc2UgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5GaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVzcG9uc2U7XHJcbiAgICBpbXBvcnQgR2V0TWVtYmVyc0J5U3RhdHVzUmVxdWVzdCA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkdldE1lbWJlcnNCeVN0YXR1c1JlcXVlc3Q7XHJcbiAgICBpbXBvcnQgU2VsZWN0aW9uTW9kZSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuRmlsdGVyU3RhdGVNYW5hZ2VyTW9kdWxlLkNvbW1vbi5TZWxlY3Rpb25Nb2RlO1xyXG4gICAgaW1wb3J0IEZpbHRlckl0ZW1TdGF0ZSA9IEZpbHRlckNvbnRyb2xNb2R1bGUuQ29tbW9uLkZpbHRlckl0ZW1TdGF0ZTtcclxuICAgIGltcG9ydCBJQ2hpbGRyZW5Db3VudEluZm9Mb29rdXAgPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JQ2hpbGRyZW5Db3VudEluZm9Mb29rdXA7XHJcbiAgICBpbXBvcnQgSUNsZWFuZWRTdGF0ZUluZm8gPSBGaWx0ZXJDb250cm9sTW9kdWxlLkNvbW1vbi5JQ2xlYW5lZFN0YXRlSW5mbztcclxuICAgIGltcG9ydCBJRmlsdGVyU3RhdGVNYW5hZ2VyID0gRmlsdGVyQ29udHJvbE1vZHVsZS5GaWx0ZXJTdGF0ZU1hbmFnZXJNb2R1bGUuSUZpbHRlclN0YXRlTWFuYWdlcjtcclxuICAgIGltcG9ydCBJRmlsdGVyQ29udHJvbFNlcnZpY2VGYWN0b3J5ID0gRmlsdGVyQ29udHJvbE1vZHVsZS5Db21tb24uSUZpbHRlckNvbnRyb2xTZXJ2aWNlRmFjdG9yeTtcclxuICAgIGltcG9ydCBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSA9IFV0aWxzLlRyZWVVdGlscy5Gb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeTtcclxuICAgIGltcG9ydCBUcmVlSGVscGVycyA9IFV0aWxzLlRyZWVVdGlscy5UcmVlSGVscGVycztcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsdGVyQ29udHJvbFNlcnZpY2VNb2NrRmFjdG9yeSBpbXBsZW1lbnRzIElGaWx0ZXJDb250cm9sU2VydmljZUZhY3Rvcnkge1xyXG4gICAgICAgIENyZWF0ZShfY29ubmVjdGlvblN0cmluZzogc3RyaW5nKTogSUZpbHRlckNvbnRyb2xTZXJ2aWNlIHsgcmV0dXJuIG5ldyBNb2NrU2VydmljZSh3aW5kb3dbXCJfZmFrZVRyZWVcIl0sIHdpbmRvd1tcIl9mYWtlRGVmYXVsdE1lbWJlclwiXSk7IH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgTW9ja1NlcnZpY2UgaW1wbGVtZW50cyBJRmlsdGVyQ29udHJvbFNlcnZpY2Uge1xyXG4gICAgICAgIHByaXZhdGUgX3RvdGFsRWxlbWVudHNDb3VudD0wO1xyXG4gICAgICAgIHByaXZhdGUgX3Rlc3RTb3J0ZWRMZXZlbHM6IEZpbHRlckxldmVsW109XHJcbiAgICAgICAgICAgIFtuZXcgRmlsdGVyTGV2ZWwoXCJZZWFyXCIsIFwiWWVhclwiKSwgbmV3IEZpbHRlckxldmVsKFwiUXVhdGVyXCIsIFwiUXVhdGVyXCIpLCBuZXcgRmlsdGVyTGV2ZWwoXCJNb250aFwiLCBcIk1vbnRoXCIpLCBuZXcgRmlsdGVyTGV2ZWwoXCJEYXlcIiwgXCJEYXlcIildO1xyXG4gICAgICAgIHByaXZhdGUgX2NoaWxkcmVuVG90YWxDb3VudExvb2t1cDogSUNoaWxkcmVuQ291bnRJbmZvTG9va3VwID0ge307XHJcbiAgICAgICAgQWxsTWVtYmVyc0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXAgPSB7fTtcclxuXHJcbiAgICAgICAgZ2V0IENsZWFuZWRTdGF0ZSgpOiBJQ2xlYW5lZFN0YXRlSW5mbyB7XHJcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3dbXCJfZmFrZUNsZWFuZWRTdGF0ZVwiXTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF90ZXN0VHJlZTogSU1lbWJlck5vZGVbXSwgcHJpdmF0ZSBfZGVmYXVsdE1lbWJlcjogSU1lbWJlck5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5DcmVhdGVJZHMoX3Rlc3RUcmVlKTtcclxuICAgICAgICAgICAgdGhpcy5BZGRQYXJlbnRVbmlxdWVOYW1lc19MZXZlbHNfQ2hpbGRDb3VudF9BbmRDYWxjdWxhdGVUb3RhbEVsZW1lbnRzQ291bnQoX3Rlc3RUcmVlLCB0cnVlKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlZmF1bHRNZW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQ3JlYXRlSWRzKFtfZGVmYXVsdE1lbWJlcl0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5BZGRQYXJlbnRVbmlxdWVOYW1lc19MZXZlbHNfQ2hpbGRDb3VudF9BbmRDYWxjdWxhdGVUb3RhbEVsZW1lbnRzQ291bnQoW19kZWZhdWx0TWVtYmVyXSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRMZXZlbE51bWJlckZyb21VbmlxdWVOYW1lKHVuaXF1ZU5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGVzdFNvcnRlZExldmVscy5tYXAoeCA9PiB4LlVuaXF1ZU5hbWUpLmluZGV4T2YodW5pcXVlTmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXRNZXRhZGF0YShyZXF1ZXN0OiBNZXRhZGF0YVJlcXVlc3QpOiBQcm9taXNlPE1ldGFkYXRhUmVzcG9uc2U+IHtcclxuICAgICAgICAgICAgdmFyIGRlZmF1bHRNZW1iZXJJbmZvOiBJRmlsdGVySW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZWZhdWx0TWVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0TWVtYmVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBQYXJlbnRzTG9va3VwOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBMYXN0TGV2ZWxOb2RlczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgSGFzTW9yZU1lbWJlcnM6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VQcmVvcmRlcjxJTWVtYmVyTm9kZT4odGhpcy5fZGVmYXVsdE1lbWJlcixcclxuICAgICAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgICAgIChjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRNZW1iZXJJbmZvLkxhc3RMZXZlbE5vZGVzLnB1c2goY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0TWVtYmVySW5mby5QYXJlbnRzTG9va3VwW2N1cnJlbnQuaWRdID0gY3VycmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRhdGEuY2hpbGRyZW5Ub3RhbENvdW50ID0gdGhpcy5fY2hpbGRyZW5Ub3RhbENvdW50TG9va3VwW2N1cnJlbnQuaWRdLkNoaWxkcmVuQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5DbGVhclBhcmVudHMoZGVmYXVsdE1lbWJlckluZm8uUGFyZW50c0xvb2t1cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBuZXcgRmlsdGVyTWV0YWRhdGEocmVxdWVzdC5GaWVsZFVuaXF1ZU5hbWUsXHJcbiAgICAgICAgICAgICAgICBcIkNhbGVuZGFyIFRpbWVcIixcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Rlc3RTb3J0ZWRMZXZlbHMsXHJcbiAgICAgICAgICAgICAgICB0aGlzLl90ZXN0VHJlZS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICB0aGlzLl90b3RhbEVsZW1lbnRzQ291bnQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0TWVtYmVySW5mbyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWV0YWRhdGFSZXNwb25zZShtZXRhZGF0YSwgdGhpcy5DbGVhbmVkU3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgR2V0TWVtYmVycyhyZXF1ZXN0OiBNZW1iZXJzUmVxdWVzdCk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuR2V0TWVtYmVyc0NvcmUodGhpcy5HZXRMZXZlbE51bWJlckZyb21VbmlxdWVOYW1lKHJlcXVlc3QuRmllbGRVbmlxdWVOYW1lKSwgcmVxdWVzdC5TdGFydCwgcmVxdWVzdC5Db3VudCwgcmVxdWVzdC5GaWx0ZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgRmlsdGVySW5mbzogcmVzdWx0IH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXRMZWFmTWVtYmVycyhyZXF1ZXN0OiBMZWFmTWVtYmVyc1JlcXVlc3QpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLkdldE1lbWJlcnNDb3JlKHRoaXMuR2V0TGV2ZWxOdW1iZXJGcm9tVW5pcXVlTmFtZShyZXF1ZXN0LkZpZWxkVW5pcXVlTmFtZSksIHJlcXVlc3QuU3RhcnQsIHJlcXVlc3QuQ291bnQsIHJlcXVlc3QuRmlsdGVyLCB0cnVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgRmlsdGVySW5mbzogcmVzdWx0IH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXRDaGlsZHJlbihyZXF1ZXN0OiBDaGlsZHJlblJlcXVlc3QpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICAgICAgY29uc3QgdGVtcCA9IHRoaXMuR2V0Q29weU9mV29ya2luZ1RyZWUoKTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KHRlbXAsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoeC5pZCA9PT0gcmVxdWVzdC5QYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0geDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLlNlbGVjdFNwZWN5ZmljRWxlbWVudHModGhpcy5NYWtlTGF6eUxvYWRlZChyZXN1bHQuY2hpbGRyZW4pLCByZXF1ZXN0LlN0YXJ0LCByZXF1ZXN0LkNvdW50ICsgMSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc01vcmVOb2RlcyA9IHRoaXMuSGFzTW9yZU1lbWJlcnMocmVxdWVzdC5Db3VudCwgcmVzdWx0KTtcclxuICAgICAgICAgICAgaWYgKGhhc01vcmVOb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnBvcCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLkNsZWFyTm90TmVlZGVkRGF0YShyZXN1bHQsIHt9LCBoYXNNb3JlTm9kZXMpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBGaWx0ZXJJbmZvOiByZXN1bHQgfTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBHZXRGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50KHJlcXVlc3Q6IEZpbHRyZWRFbGVtZW50c0NoaWxkcmVuQ291bnRSZXF1ZXN0KTogUHJvbWlzZTxGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVzcG9uc2U+IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBGaWx0cmVkRWxlbWVudHNDaGlsZHJlbkNvdW50UmVzcG9uc2UoKTtcclxuICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLkdldENvcHlPZldvcmtpbmdUcmVlKCk7XHJcbiAgICAgICAgICAgIHRlbXAgPSB0aGlzLlNlYXJjaE1lbWJlcnNDb3JlKHRlbXAsIHRoaXMuR2V0TGV2ZWxOdW1iZXJGcm9tVW5pcXVlTmFtZShyZXF1ZXN0LkZpZWxkVW5pcXVlTmFtZSksIHJlcXVlc3QuRmlsdGVyKTtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KHRlbXAsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKHgsIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcXVlc3QuTm9kZXNVbmlxdWVOYW1lcy5pbmRleE9mKHguaWQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQ2hpbGRyZW5Db3VudEluZm9Mb29rdXBbeC5pZF0gPSB7IENoaWxkcmVuQ291bnQ6IHguY2hpbGRyZW4ubGVuZ3RoIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5ldyBGb3J3YXJkVHJlZVRyYXZlcnNhbEl0ZXJhdG9yRmFjdG9yeSgpLFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIEdldE1lbWJlcnNCeVN0YXR1cyhyZXF1ZXN0OiBHZXRNZW1iZXJzQnlTdGF0dXNSZXF1ZXN0LCBzdGF0ZU1hbmFnZXI6IElGaWx0ZXJTdGF0ZU1hbmFnZXIpOiBQcm9taXNlPE1lbWJlcnNSZXNwb25zZT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gdGhpcy5HZXRDb3B5T2ZXb3JraW5nVHJlZSgpO1xyXG4gICAgICAgICAgICB2YXIgYWxsUGFyZW50c0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgdmFyIHRhcmdldExldmVsRWxlbWVudHNMaXN0OiBJTWVtYmVyTm9kZVtdID0gW107XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPih0ZW1wLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgIChjdXJyZW50LCBwYXJlbnQsIGxldmVsLCBpbmRleCwgcGFyZW50cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmRhdGEgJiYgY3VycmVudC5kYXRhLmxldmVsID09PSB0aGlzLkdldExldmVsTnVtYmVyRnJvbVVuaXF1ZU5hbWUocmVxdWVzdC5GaWVsZFVuaXF1ZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5jaGlsZHJlbiA9ICh0cnVlIGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uU3RhdHVzID0gc3RhdGVNYW5hZ2VyLkdldFNlbGVjdGlvblN0YXR1cyhwYXJlbnRzLm1hcCh4ID0+IHguaWQpLnJldmVyc2UoKSwgY3VycmVudC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25TdGF0dXMgPT09IFNlbGVjdGlvbk1vZGUuU2VsZWN0ZWQgJiYgcmVxdWVzdC5TdGF0dXMgPT09IEZpbHRlckl0ZW1TdGF0ZS5DaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZXZlbEVsZW1lbnRzTGlzdC5wdXNoKGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGlvblN0YXR1cyA9PT0gU2VsZWN0aW9uTW9kZS5EZXNlbGVjdGVkICYmIHJlcXVlc3QuU3RhdHVzID09PSBGaWx0ZXJJdGVtU3RhdGUuVW5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZXZlbEVsZW1lbnRzTGlzdC5wdXNoKGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFBhcmVudHNMb29rdXBbcGFyZW50LmlkXSA9IHBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCksXHJcbiAgICAgICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IEZpbHRlckluZm86IHRoaXMuR2V0UGFja2FnZShhbGxQYXJlbnRzTG9va3VwLCB0YXJnZXRMZXZlbEVsZW1lbnRzTGlzdCwgcmVxdWVzdC5TdGFydCwgcmVxdWVzdC5Db3VudCkgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0Q29weU9mV29ya2luZ1RyZWUoKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLkdldENvcHlPZlRyZWUodGhpcy5fdGVzdFRyZWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBHZXRDb3B5T2ZUcmVlKHRyZWU6IElNZW1iZXJOb2RlW10pOiBJTWVtYmVyTm9kZVtdIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodHJlZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBNYWtlTGF6eUxvYWRlZChub2RlczogSU1lbWJlck5vZGVbXSkge1xyXG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbiA9ICh0cnVlIGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5vZGUuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBTZWxlY3RTcGVjeWZpY0VsZW1lbnRzKG5vZGVzOiBJTWVtYmVyTm9kZVtdLCBzdGFydEluZGV4OiBudW1iZXIsIG51bWJlck9mRWxlbWVudHM6IG51bWJlcikge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6SU1lbWJlck5vZGVbXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IG5vZGVzLmxlbmd0aCAmJiByZXN1bHQubGVuZ3RoIDw9IG51bWJlck9mRWxlbWVudHMgLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGVzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0TWVtYmVyc0NvcmUodGFyZ2V0TGV2ZWxOdW1iZXI6IG51bWJlciwgc3RhcnQ6IG51bWJlciwgY291bnQ6IG51bWJlciwgZmlsdGVyOiBNZW1iZXJGaWx0ZXIsIG9ubHlMZWFmczogYm9vbGVhbj1mYWxzZSk6IElGaWx0ZXJJbmZvIHtcclxuICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLkdldENvcHlPZldvcmtpbmdUcmVlKCk7XHJcbiAgICAgICAgICAgIHRlbXAgPSB0aGlzLlNlYXJjaE1lbWJlcnNDb3JlKHRlbXAsIHRhcmdldExldmVsTnVtYmVyLCBmaWx0ZXIpO1xyXG4gICAgICAgICAgICB2YXIgYWxsUGFyZW50c0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXAgPSB7fTtcclxuICAgICAgICAgICAgdmFyIHRhcmdldExldmVsRWxlbWVudHNMaXN0OiBJTWVtYmVyTm9kZVtdID0gW107XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPih0ZW1wLFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgICh4LCBwYXJlbnQsIGxldmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvbmx5TGVhZnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHguZGF0YSAmJiB4LmRhdGEuY2hpbGRyZW5Ub3RhbENvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZXZlbEVsZW1lbnRzTGlzdC5wdXNoKHgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh4LmRhdGEgJiYgeC5kYXRhLmxldmVsID09PSB0YXJnZXRMZXZlbE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeC5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguY2hpbGRyZW4gPSAodHJ1ZSBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExldmVsRWxlbWVudHNMaXN0LnB1c2goeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsUGFyZW50c0xvb2t1cFtwYXJlbnQuaWRdID0gcGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuZXcgRm9yd2FyZFRyZWVUcmF2ZXJzYWxJdGVyYXRvckZhY3RvcnkoKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuR2V0UGFja2FnZShhbGxQYXJlbnRzTG9va3VwLCB0YXJnZXRMZXZlbEVsZW1lbnRzTGlzdCwgc3RhcnQsIGNvdW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgR2V0UGFja2FnZShhbGxQYXJlbnRzTG9va3VwOiBJTWVtYmVyTm9kZUxvb2t1cCwgdGFyZ2V0TGV2ZWxFbGVtZW50c0xpc3Q6IElNZW1iZXJOb2RlW10sIHN0YXJ0OiBudW1iZXIsIGNvdW50OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdmFyIHRhcmdldFBhcmVudHNMb29rdXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbjsgfSA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLkNsZWFyUGFyZW50cyhhbGxQYXJlbnRzTG9va3VwKTtcclxuICAgICAgICAgICAgY29uc3QgdGVtcCA9IHRoaXMuU2VsZWN0U3BlY3lmaWNFbGVtZW50cyh0YXJnZXRMZXZlbEVsZW1lbnRzTGlzdCwgc3RhcnQsIGNvdW50ICsgMSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc01vcmVNZW1iZXJzID0gdGhpcy5IYXNNb3JlTWVtYmVycyhjb3VudCwgdGVtcCk7XHJcbiAgICAgICAgICAgIGlmIChoYXNNb3JlTWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgdGVtcC5wb3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wLmZvckVhY2goeCA9PiB7XHJcbiAgICAgICAgICAgICAgICBUZXN0Tm9kZUhlbHBlci5HZXRBbGxQYXJlbnRzTmFtZXMoYWxsUGFyZW50c0xvb2t1cCwgeCkuZm9yRWFjaChwYXJlbnROYW1lID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXJlbnRzTG9va3VwW3BhcmVudE5hbWVdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGFsbFBhcmVudHNMb29rdXApIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0UGFyZW50c0xvb2t1cFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFsbFBhcmVudHNMb29rdXBba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5DbGVhck5vdE5lZWRlZERhdGEodGVtcCwgYWxsUGFyZW50c0xvb2t1cCwgaGFzTW9yZU1lbWJlcnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDbGVhclBhcmVudHMoYWxsUGFyZW50c0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXApIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGFsbFBhcmVudHNMb29rdXApIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbGxQYXJlbnRzTG9va3VwLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJOb2RlID0gYWxsUGFyZW50c0xvb2t1cFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZW1iZXJOb2RlICYmIHR5cGVvZiBtZW1iZXJOb2RlLmNoaWxkcmVuICE9PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJOb2RlLmNoaWxkcmVuLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIENsZWFyTm90TmVlZGVkRGF0YShsYXN0TGV2ZWxOb2RlczogSU1lbWJlck5vZGVbXSwgYWxsUGFyZW50c0xvb2t1cDogSU1lbWJlck5vZGVMb29rdXAsIGhhc01vcmVNZW1iZXJzOiBib29sZWFuKTogSUZpbHRlckluZm8ge1xyXG4gICAgICAgICAgICBsYXN0TGV2ZWxOb2Rlcy5mb3JFYWNoKHggPT4gZGVsZXRlIHguZGF0YS5sZXZlbCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmVudEtleSBpbiBhbGxQYXJlbnRzTG9va3VwKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgYWxsUGFyZW50c0xvb2t1cFtwYXJlbnRLZXldLmRhdGEubGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHsgTGFzdExldmVsTm9kZXM6IGxhc3RMZXZlbE5vZGVzLCBQYXJlbnRzTG9va3VwOiBhbGxQYXJlbnRzTG9va3VwLCBIYXNNb3JlTWVtYmVyczogaGFzTW9yZU1lbWJlcnMgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgU2VhcmNoTWVtYmVyc0NvcmUoaW5wdXQ6IElNZW1iZXJOb2RlW10sIHRhcmdldExldmVsTnVtYmVyOiBudW1iZXIsIGZpbHRlcjogTWVtYmVyRmlsdGVyKTogSU1lbWJlck5vZGVbXSB7XHJcbiAgICAgICAgICAgIGlmICghZmlsdGVyIHx8ICFmaWx0ZXIuVmFsdWUpIHJldHVybiBpbnB1dDtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGlucHV0O1xyXG4gICAgICAgICAgICB2YXIgbWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgbWF0Y2hDb3VudGVyID0gMDtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KHJlc3VsdCxcclxuICAgICAgICAgICAgICAgICh4KSA9PiB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAoeCwgcGFyZW50LCBsZXZlbCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGV2ZWwgPT09IHRhcmdldExldmVsTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZmlsdGVyLlR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBNZW1iZXJGaWx0ZXJUeXBlLkNvbnRhaW5zOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hGb3VuZCA9IHgudGV4dC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyLlZhbHVlLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE1lbWJlckZpbHRlclR5cGUuQmVnaW5zV2l0aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoRm91bmQgPSB4LnRleHQudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGZpbHRlci5WYWx1ZS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE1lbWJlckZpbHRlclR5cGUuRW5kc1dpdGg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaEZvdW5kID0geC50ZXh0LnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgoZmlsdGVyLlZhbHVlLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaEZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hDb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoIW1hdGNoQ291bnRlcikgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICBUcmVlSGVscGVycy5UcmF2ZXJzZUxpc3RQcmVvcmRlcjxJTWVtYmVyTm9kZT4ocmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgKHgpID0+IHguY2hpbGRyZW4gYXMgSU1lbWJlck5vZGVbXSxcclxuICAgICAgICAgICAgICAgICh4LCBwYXJlbnQsIGxldmVsLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXZlbCA8IHRhcmdldExldmVsTnVtYmVyICYmICF4LmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBDcmVhdGVJZHMoaW5wdXQ6IElNZW1iZXJOb2RlW10pIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gaW5wdXQ7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPihyZXN1bHQsXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKHgsIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFBhcnQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50UGFydCA9IHBhcmVudC5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydHMucHVzaChwYXJlbnRQYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydHMucHVzaChgWyR7eC50ZXh0fV1gKTtcclxuICAgICAgICAgICAgICAgICAgICB4W1wiaWRcIl0gPSBwYXJ0cy5qb2luKFwiLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgQWRkUGFyZW50VW5pcXVlTmFtZXNfTGV2ZWxzX0NoaWxkQ291bnRfQW5kQ2FsY3VsYXRlVG90YWxFbGVtZW50c0NvdW50KGlucHV0OiBJTWVtYmVyTm9kZVtdLCBzdG9yZUdsb2JhbDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBpbnB1dDtcclxuICAgICAgICAgICAgVHJlZUhlbHBlcnMuVHJhdmVyc2VMaXN0UHJlb3JkZXI8SU1lbWJlck5vZGU+KHJlc3VsdCxcclxuICAgICAgICAgICAgICAgICh4KSA9PiB4LmNoaWxkcmVuIGFzIElNZW1iZXJOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAoeDogSU1lbWJlck5vZGUsIHBhcmVudCwgbGV2ZWwsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudFVuaXF1ZU5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50VW5pcXVlTmFtZSA9IHBhcmVudC5pZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgeC5kYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRVbmlxdWVOYW1lOiBwYXJlbnRVbmlxdWVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogbGV2ZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuVG90YWxDb3VudDogeC5jaGlsZHJlbi5sZW5ndGhcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdG9yZUdsb2JhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGlsZHJlblRvdGFsQ291bnRMb29rdXBbeC5pZF0gPSB7IENoaWxkcmVuQ291bnQ6IHguY2hpbGRyZW4ubGVuZ3RoIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvdGFsRWxlbWVudHNDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh4KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHkuY2hpbGRyZW4ubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5BbGxNZW1iZXJzTG9va3VwW3guaWRdID0gY29weTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBDcmVhdGVGYWtlVGltZUhpZXJhcmNoeShudW1iZXJPZlllYXJzOiBudW1iZXIpOiBJTWVtYmVyTm9kZVtdIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBJTWVtYmVyTm9kZVtdID0gW107XHJcbiAgICAgICAgICAgIGNvbnN0IG1vbnRocyA9IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBudW1iZXJPZlllYXJzOyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHllYXJJdGVtOiBJTWVtYmVyTm9kZSA9IHsgdGV4dDogKDIwMDAgKyB5KS50b1N0cmluZygpLCBjaGlsZHJlbjogW10gfTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHllYXJJdGVtKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHEgPSAwOyBxIDwgNDsgcSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcXVhdGVySXRlbTogSU1lbWJlck5vZGUgPSB7IHRleHQ6IGBRJHsocSArIDEpLnRvU3RyaW5nKCl9YCwgY2hpbGRyZW46IFtdIH07XHJcbiAgICAgICAgICAgICAgICAgICAgeWVhckl0ZW0uY2hpbGRyZW4ucHVzaChxdWF0ZXJJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtID0gcSAqIDM7IG0gPCBxICogMyArIDM7IG0rKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb250aEl0ZW06IElNZW1iZXJOb2RlID0geyB0ZXh0OiBtb250aHNbbV0sIGNoaWxkcmVuOiBbXSB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWF0ZXJJdGVtLmNoaWxkcmVuLnB1c2gobW9udGhJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCAzMDsgZCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlJdGVtOiBJTWVtYmVyTm9kZSA9IHsgdGV4dDogKGQgKyAxKS50b1N0cmluZygpLCBjaGlsZHJlbjogW10gfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoSXRlbS5jaGlsZHJlbi5wdXNoKGRheUl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEhhc01vcmVNZW1iZXJzKGNvdW50OiBudW1iZXIsIGxvYWRlZExhc3RMZXZlbE5vZGVzOiBJTWVtYmVyTm9kZVtdKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2FkZWRMYXN0TGV2ZWxOb2Rlcy5sZW5ndGggPT09IGNvdW50ICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEdldEZ1bGxEYXRhKCk6IE9iamVjdFtdIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5fdGVzdFRyZWUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFRlc3RQYXRoVHJhY2tpbmcoKSB7XHJcbiAgICAgICAgICAgIFRyZWVIZWxwZXJzLlRyYXZlcnNlTGlzdFByZW9yZGVyPElNZW1iZXJOb2RlPih0aGlzLkdldENvcHlPZldvcmtpbmdUcmVlKCksXHJcbiAgICAgICAgICAgICAgICAoeCkgPT4geC5jaGlsZHJlbiBhcyBJTWVtYmVyTm9kZVtdLFxyXG4gICAgICAgICAgICAgICAgKHg6IElNZW1iZXJOb2RlLCBwYXJlbnQsIGxldmVsLCBpbmRleCwgcGF0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHguaWQsIFwiKFwiLCBwYXRoLm1hcCh4ID0+IHguaWQpLCBcIilcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbmV3IEZvcndhcmRUcmVlVHJhdmVyc2FsSXRlcmF0b3JGYWN0b3J5KCksXHJcbiAgICAgICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==