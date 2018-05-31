namespace Comarch.Controls.FilterControlModule.MockServiceModule.Service {
    import IMemberNode = Common.IMemberNode;
    import IMemberNodeLookup = Common.IMemberNodeLookup;
    import TestNodeHelper = Common.MemberNodesHelper;
    import MemberFilter = Common.MemberFilter;
    import MemberFilterType = Common.MemberFilterType;
    import MetadataRequest = Common.MetadataRequest;
    import IFilterInfo = Common.IFilterInfo;
    import MetadataResponse = Common.MetadataResponse;
    import FilterMetadata = Common.FilterMetadata;
    import FilterLevel = Common.FilterLevel;
    import MembersRequest = Common.MembersRequest;
    import MembersResponse = Common.MembersResponse;
    import LeafMembersRequest = Common.LeafMembersRequest;
    import ChildrenRequest = Common.ChildrenRequest;
    import IFilterControlService = Common.IFilterControlService;
    import FiltredElementsChildrenCountRequest = FilterControlModule.Common.FiltredElementsChildrenCountRequest;
    import FiltredElementsChildrenCountResponse = FilterControlModule.Common.FiltredElementsChildrenCountResponse;
    import GetMembersByStatusRequest = FilterControlModule.Common.GetMembersByStatusRequest;
    import SelectionMode = FilterControlModule.FilterStateManagerModule.Common.SelectionMode;
    import FilterItemState = FilterControlModule.Common.FilterItemState;
    import IChildrenCountInfoLookup = FilterControlModule.Common.IChildrenCountInfoLookup;
    import ICleanedStateInfo = FilterControlModule.Common.ICleanedStateInfo;
    import IFilterStateManager = FilterControlModule.FilterStateManagerModule.IFilterStateManager;
    import IFilterControlServiceFactory = FilterControlModule.Common.IFilterControlServiceFactory;
    import ForwardTreeTraversalIteratorFactory = Utils.TreeUtils.ForwardTreeTraversalIteratorFactory;
    import TreeHelpers = Utils.TreeUtils.TreeHelpers;

    export class FilterControlServiceMockFactory implements IFilterControlServiceFactory {
        Create(_connectionString: string): IFilterControlService { return new MockService(window["_fakeTree"], window["_fakeDefaultMember"]); }
    }

    export class MockService implements IFilterControlService {
        private _totalElementsCount=0;
        private _testSortedLevels: FilterLevel[]=
            [new FilterLevel("Year", "Year"), new FilterLevel("Quater", "Quater"), new FilterLevel("Month", "Month"), new FilterLevel("Day", "Day")];
        private _childrenTotalCountLookup: IChildrenCountInfoLookup = {};
        AllMembersLookup: IMemberNodeLookup = {};

        get CleanedState(): ICleanedStateInfo {
            return window["_fakeCleanedState"];
        };

        constructor(private _testTree: IMemberNode[], private _defaultMember: IMemberNode) {
            this.CreateIds(_testTree);
            this.AddParentUniqueNames_Levels_ChildCount_AndCalculateTotalElementsCount(_testTree, true);
            if (this._defaultMember) {
                this.CreateIds([_defaultMember]);
                this.AddParentUniqueNames_Levels_ChildCount_AndCalculateTotalElementsCount([_defaultMember], false);
            }

        }

        private GetLevelNumberFromUniqueName(uniqueName: string) {
            return this._testSortedLevels.map(x => x.UniqueName).indexOf(uniqueName);
        }

        async GetMetadata(request: MetadataRequest): Promise<MetadataResponse> {
            var defaultMemberInfo: IFilterInfo = null;
            if (this._defaultMember) {
                defaultMemberInfo = {
                    ParentsLookup: {},
                    LastLevelNodes: [],
                    HasMoreMembers: false
                };
                TreeHelpers.TraversePreorder<IMemberNode>(this._defaultMember,
                    (x) => x.children as IMemberNode[],
                    (current) => {
                        if (!current.children.length) {
                            defaultMemberInfo.LastLevelNodes.push(current);
                            return false;
                        } else {
                            defaultMemberInfo.ParentsLookup[current.id] = current;
                        }
                        current.data.childrenTotalCount = this._childrenTotalCountLookup[current.id].ChildrenCount;
                        return true;
                    });
                this.ClearParents(defaultMemberInfo.ParentsLookup);
            }
            const metadata = new FilterMetadata(request.FieldUniqueName,
                "Calendar Time",
                this._testSortedLevels,
                this._testTree.length,
                this._totalElementsCount,
                defaultMemberInfo);
            return new MetadataResponse(metadata, this.CleanedState);
        }

        async GetMembers(request: MembersRequest): Promise<MembersResponse> {
            const result = this.GetMembersCore(this.GetLevelNumberFromUniqueName(request.FieldUniqueName), request.Start, request.Count, request.Filter, false);
            return { FilterInfo: result };
        }

        async GetLeafMembers(request: LeafMembersRequest): Promise<MembersResponse> {
            const result = this.GetMembersCore(this.GetLevelNumberFromUniqueName(request.FieldUniqueName), request.Start, request.Count, request.Filter, true);
            return { FilterInfo: result };
        }

        async GetChildren(request: ChildrenRequest): Promise<MembersResponse> {
            var result = null;
            const temp = this.GetCopyOfWorkingTree();
            TreeHelpers.TraverseListPreorder<IMemberNode>(temp,
                (x) => x.children as IMemberNode[],
                (x) => {
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

        async GetFiltredElementsChildrenCount(request: FiltredElementsChildrenCountRequest): Promise<FiltredElementsChildrenCountResponse> {
            var result = new FiltredElementsChildrenCountResponse();
            let temp = this.GetCopyOfWorkingTree();
            temp = this.SearchMembersCore(temp, this.GetLevelNumberFromUniqueName(request.FieldUniqueName), request.Filter);
            TreeHelpers.TraverseListPreorder<IMemberNode>(temp,
                (x) => x.children as IMemberNode[],
                (x, parent, level, index) => {
                    if (request.NodesUniqueNames.indexOf(x.id) !== -1) {
                        result.ChildrenCountInfoLookup[x.id] = { ChildrenCount: x.children.length };
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory(),
            );

            return result;
        }

        async GetMembersByStatus(request: GetMembersByStatusRequest, stateManager: IFilterStateManager): Promise<MembersResponse> {
            const temp = this.GetCopyOfWorkingTree();
            var allParentsLookup: IMemberNodeLookup = {};
            var targetLevelElementsList: IMemberNode[] = [];
            TreeHelpers.TraverseListPreorder<IMemberNode>(temp,
                (x) => x.children as IMemberNode[],
                (current, parent, level, index, parents) => {
                    if (current.data && current.data.level === this.GetLevelNumberFromUniqueName(request.FieldUniqueName)) {
                        if (current.children.length) {
                            current.children = (true as any);
                        }
                        const selectionStatus = stateManager.GetSelectionStatus(parents.map(x => x.id).reverse(), current.id);
                        if (selectionStatus === SelectionMode.Selected && request.Status === FilterItemState.Checked) {
                            targetLevelElementsList.push(current);
                        } else if (selectionStatus === SelectionMode.Deselected && request.Status === FilterItemState.Unchecked) {
                            targetLevelElementsList.push(current);
                        }

                    }
                    if (parent) {
                        allParentsLookup[parent.id] = parent;
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory(),
                true
            );
            return { FilterInfo: this.GetPackage(allParentsLookup, targetLevelElementsList, request.Start, request.Count) };
        }

        private GetCopyOfWorkingTree(): IMemberNode[] {
            return this.GetCopyOfTree(this._testTree);
        }

        private GetCopyOfTree(tree: IMemberNode[]): IMemberNode[] {
            return JSON.parse(JSON.stringify(tree));
        }

        private MakeLazyLoaded(nodes: IMemberNode[]) {
            nodes.forEach(node => {
                if (node.children.length) {
                    node.children = (true as any);
                    delete node.state;
                }

            });
            return nodes;
        }

        private SelectSpecyficElements(nodes: IMemberNode[], startIndex: number, numberOfElements: number) {
            const result:IMemberNode[] = [];
            for (let i = startIndex; i < nodes.length && result.length <= numberOfElements - 1; i++) {
                result.push(nodes[i]);
            }
            return result;
        }


        private GetMembersCore(targetLevelNumber: number, start: number, count: number, filter: MemberFilter, onlyLeafs: boolean=false): IFilterInfo {
            let temp = this.GetCopyOfWorkingTree();
            temp = this.SearchMembersCore(temp, targetLevelNumber, filter);
            var allParentsLookup: IMemberNodeLookup = {};
            var targetLevelElementsList: IMemberNode[] = [];
            TreeHelpers.TraverseListPreorder<IMemberNode>(temp,
                (x) => x.children as IMemberNode[],
                (x, parent, level, index) => {
                    if (onlyLeafs) {
                        if (x.data && x.data.childrenTotalCount === 0) {
                            targetLevelElementsList.push(x);
                        }
                    } else if (x.data && x.data.level === targetLevelNumber) {
                        if (x.children.length) {
                            x.children = (true as any);
                        }
                        targetLevelElementsList.push(x);
                    }
                    if (parent) {
                        allParentsLookup[parent.id] = parent;
                    }
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory()
            );

            return this.GetPackage(allParentsLookup, targetLevelElementsList, start, count);
        }

        private GetPackage(allParentsLookup: IMemberNodeLookup, targetLevelElementsList: IMemberNode[], start: number, count: number) {
            var targetParentsLookup: { [key: string]: boolean; } = {};
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

        private ClearParents(allParentsLookup: IMemberNodeLookup) {
            for (let key in allParentsLookup) {
                if (allParentsLookup.hasOwnProperty(key)) {
                    const memberNode = allParentsLookup[key];
                    if (memberNode && typeof memberNode.children !== "boolean") {
                        memberNode.children.length = 0;
                    }
                }
            }
        }

        private ClearNotNeededData(lastLevelNodes: IMemberNode[], allParentsLookup: IMemberNodeLookup, hasMoreMembers: boolean): IFilterInfo {
            lastLevelNodes.forEach(x => delete x.data.level);
            for (let parentKey in allParentsLookup) {
                delete allParentsLookup[parentKey].data.level;
            }
            return { LastLevelNodes: lastLevelNodes, ParentsLookup: allParentsLookup, HasMoreMembers: hasMoreMembers };
        }

        private SearchMembersCore(input: IMemberNode[], targetLevelNumber: number, filter: MemberFilter): IMemberNode[] {
            if (!filter || !filter.Value) return input;
            var result = input;
            var matchFound = false;
            var matchCounter = 0;
            TreeHelpers.TraverseListPreorder<IMemberNode>(result,
                (x) => x.children as IMemberNode[],
                (x, parent, level, index) => {
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
                            } else {
                                result.splice(index, 1);
                            }
                        } else {
                            matchCounter++;
                        }
                    }
                    return true;
                },
            );
            if (!matchCounter) return [];
            TreeHelpers.TraverseListPreorder<IMemberNode>(result,
                (x) => x.children as IMemberNode[],
                (x, parent, level, index) => {
                    if (level < targetLevelNumber && !x.children.length) {
                        if (parent) {
                            parent.children.splice(index, 1);
                            return false;
                        } else {
                            result.splice(index, 1);
                            return false;
                        }
                    }

                    return true;
                },
            );

            return result;
        }

        private CreateIds(input: IMemberNode[]) {
            const result = input;
            TreeHelpers.TraverseListPreorder<IMemberNode>(result,
                (x) => x.children as IMemberNode[],
                (x, parent, level, index) => {
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

        private AddParentUniqueNames_Levels_ChildCount_AndCalculateTotalElementsCount(input: IMemberNode[], storeGlobal: boolean) {
            const result = input;
            TreeHelpers.TraverseListPreorder<IMemberNode>(result,
                (x) => x.children as IMemberNode[],
                (x: IMemberNode, parent, level, index) => {
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
                },
                new ForwardTreeTraversalIteratorFactory()
            );
            return result;
        }

        static CreateFakeTimeHierarchy(numberOfYears: number): IMemberNode[] {
            const result: IMemberNode[] = [];
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            for (let y = 0; y < numberOfYears; y++) {
                const yearItem: IMemberNode = { text: (2000 + y).toString(), children: [] };
                result.push(yearItem);
                for (let q = 0; q < 4; q++) {
                    const quaterItem: IMemberNode = { text: `Q${(q + 1).toString()}`, children: [] };
                    yearItem.children.push(quaterItem);
                    for (let m = q * 3; m < q * 3 + 3; m++) {
                        const monthItem: IMemberNode = { text: months[m], children: [] };
                        quaterItem.children.push(monthItem);
                        for (let d = 0; d < 30; d++) {
                            const dayItem: IMemberNode = { text: (d + 1).toString(), children: [] };
                            monthItem.children.push(dayItem);
                        }
                    }
                }
            }
            return result;
        }

        private HasMoreMembers(count: number, loadedLastLevelNodes: IMemberNode[]): boolean {
            return loadedLastLevelNodes.length === count + 1;
        }

        GetFullData(): Object[] {
            return JSON.parse(JSON.stringify(this._testTree));
        }

        TestPathTracking() {
            TreeHelpers.TraverseListPreorder<IMemberNode>(this.GetCopyOfWorkingTree(),
                (x) => x.children as IMemberNode[],
                (x: IMemberNode, parent, level, index, path) => {
                    console.log(x.id, "(", path.map(x => x.id), ")");
                    return true;
                },
                new ForwardTreeTraversalIteratorFactory(),
                true
            );

        }
    }
}