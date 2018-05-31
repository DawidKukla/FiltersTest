/*using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using Comarch.BI.TabularData;

namespace FiltersJsTreeTest.FilterControl
{
    
    public class FilterControlController : ApiController
    {
        [HttpPost]
        public Task<TestResponse> Echo(TestRequest request)
        {
            return Task.FromResult(new TestResponse(){Value = request.Value});
        }
        [HttpPost]
        public Task<MetadataResponse> GetMetadata(MetadataRequest request) {
            return Task.FromResult(CreateGetMetadataResponse(request));
        }

        [HttpPost]
        public Task<MembersResponse> GetMembers(MembersRequest request) {
            return Task.FromResult(CreateMembersResponse(request));
        }

        [HttpPost]
        public Task<MembersResponse> GetLeafMembers(LeafMembersRequest request) {
            return Task.FromResult(CreateLeafMembersResponse(request));
        }

        [HttpPost]
        public Task<MembersResponse> GetChildren(ChildrenRequest request) {
            return Task.FromResult(CreateChildrenResponse(request));
        }

        [HttpPost]
        public Task<MembersResponse> GetMembersByStatus(GetMembersByStatusRequest request) {
            return Task.FromResult(CreateGetMembersByStatus(request));
        }

        private bool HasMoreMembers(int count, List<MemberNode> lastLevelNodes) {
            return lastLevelNodes.Count == GetExtendedPackageCount(count);
        }

        private MembersResponse CreateChildrenResponse(ChildrenRequest request)
        {
            return CreateMembersResponseCore(request.ConnectionString,request.FieldUniqueName,request.Count, new ChildMemberProvider(request.FieldUniqueName,request.Parent,request.Start,GetExtendedPackageCount(request.Count)));
        }

        private MembersResponse CreateGetMembersByStatus(GetMembersByStatusRequest request)
        {
            return CreateMembersResponseCore(request.ConnectionString,request.FieldUniqueName,request.Count, new MemberByStatusProvider(request.FieldUniqueName,request.Start,GetExtendedPackageCount(request.Count),request.Filter,request.Status));
        }
        
        private MembersResponse CreateLeafMembersResponse(LeafMembersRequest request)
        {
            return CreateMembersResponseCore(request.ConnectionString,request.FieldUniqueName,request.Count, new LeafMemberProvider(request.FieldUniqueName,request.Start,GetExtendedPackageCount(request.Count)));
        }

        private MembersResponse CreateMembersResponse(MembersRequest request)
        {
            return CreateMembersResponseCore(request.ConnectionString,request.FieldUniqueName,request.Count, new MemberProvider(request.FieldUniqueName,request.Start,GetExtendedPackageCount(request.Count),MemberFilter.ToAEFilter(request.Filter)));
        }

        private MembersResponse CreateMembersResponseCore(string connectionString,string fieldUniqueName,int count,IMemberProvider memberProvider)
        {
            var result = new MembersResponse {FilterInfo = new FilterInfo()};
            var serverDataSource = GetServerDataSource(connectionString);
            var members = memberProvider.GetMembers(serverDataSource);
            var lastLevelNodes = ConvertToFilterNode(members);
            var hasMoreMembers = HasMoreMembers(count, lastLevelNodes);
            if (hasMoreMembers)
            {
                lastLevelNodes.RemoveAt(lastLevelNodes.Count - 1);
            }
            result.FilterInfo.LastLevelNodes = lastLevelNodes;
            result.FilterInfo.ParentsLookup = GetAllParents(members);
            result.FilterInfo.HasMoreMembers = hasMoreMembers;
            return result;
        }

        private static int GetExtendedPackageCount(int count)
        {
            return count+1;
        }

        private Dictionary<string,MemberNode> GetAllParents(List<IDataMember> members)
        {
            var result=new Dictionary<string,MemberNode>();
            members.ForEach(currentMemeber =>
            {
                while (true)
                {
                    var parent = currentMemeber.Parent;
                    if(parent==null || parent.IsAllMember) break;
                    result[parent.UniqueName] = ConvertMemberToNode(parent,false);
                    currentMemeber = parent;
                }
            });
            return result;
        }

        private List<MemberNode> ConvertToFilterNode(List<IDataMember> members)
        {
            return members.Select(x=>ConvertMemberToNode(x,true)).ToList();
        }

        private static MemberNode ConvertMemberToNode(IDataMember member,bool makeLazy)
        {
            var memberNode = new MemberNode()
            {
                Id = member.UniqueName, //TODO ENCODE
                Text = member.Caption,
                Lazy = makeLazy && member.ChildrenCount > 0,
                Data = new MemberNodeData()
                {
                    childrenTotalCount = member.ChildrenCount,
                    parentUniqueName = (member.Parent!=null && !member.Parent.IsAllMember)?member.Parent.UniqueName:null
                }
            };
            return memberNode;
        }

        private MetadataResponse CreateGetMetadataResponse(MetadataRequest request)
        {
            var result=new MetadataResponse();
            IServerDataSource serverDataSource = GetServerDataSource(request.ConnectionString);
            var fieldCollection = serverDataSource.GetFields();
            var field = fieldCollection.Find(request.FieldUniqueName);
            if (field == null) throw new ArgumentNullException(nameof(field));
            result.Metadata = new FilterMetadata
            {
                UniqueName = field.Group != null ? field.Group.Name : field.Name,
                Caption = field.Group != null ? field.Group.Caption : field.Caption
            };
            var sortedLevels = GetSortedLevels(field);
            result.Metadata.SortedLevels = sortedLevels;
            FillMembersCount(serverDataSource,fieldCollection, sortedLevels,result.Metadata);
            result.Metadata.DefaultMember = GetDafaultMember(field.DefaultMember,field, serverDataSource);
            result.CleanedStateInfo = GetCleanedStateInfo(serverDataSource, field, request.ExistingLeafs);
            return result;
        }

        private FilterInfo GetDafaultMember(string defaultMemberUniqueName,Field field, IServerDataSource serverDataSource)
        {
            if (string.IsNullOrEmpty(defaultMemberUniqueName)) return null;
            var members = serverDataSource.GetMembers(field, new[] {defaultMemberUniqueName});
            var result = new FilterInfo
            {
                HasMoreMembers = false,
                LastLevelNodes = ConvertToFilterNode(members),
                ParentsLookup = GetAllParents(members)
            };
            return result;
        }

        private CleanedStateInfo GetCleanedStateInfo(IServerDataSource serverDataSource, Field field, List<string> existingLeafs)
        {
            var result= new CleanedStateInfo();
            if (field.Group != null && existingLeafs.Any())
            {
                var dataMembers = serverDataSource.GetMembers(field.Group, existingLeafs.ToArray());
                var allParentsParents = GetAllParents(dataMembers);
                foreach (var pair in allParentsParents)
                {
                    result.ExistingMembersHierarchyLookup[pair.Key] = pair.Value;
                }
                dataMembers.ForEach(m =>
                {
                    result.ExistingMembersHierarchyLookup[m.UniqueName] = ConvertMemberToNode(m,true);

                });
            }
            return result;
        }
        private void FillMembersCount(IServerDataSource serverDataSource, FieldCollection fieldCollection, List<FilterLevel> sortedLevels, FilterMetadata result)
        {
            var totalCount = 0;
            Parallel.ForEach(sortedLevels, (currentLevel,state, index) =>
            {
                var membersCount = serverDataSource.GetMembersCount(fieldCollection.Find(currentLevel.UniqueName));
                if (index == 0)
                {
                    result.RootMembersTotalCount = membersCount;
                }
                Interlocked.Add(ref totalCount, membersCount);
            });
            result.AllLevelsMembersTotalCount = totalCount;
        }

        private List<FilterLevel> GetSortedLevels(Field field)
        {
            if (field.Group != null)
            {
                var result = new List<FilterLevel>();
                foreach (var level in field.Group)
                {
                   result.Add(new FilterLevel(level.Name,level.Caption));
                }
                return result;
            }
            return new List<FilterLevel> {new FilterLevel(field.Name,field.Caption)};
        }

        private IServerDataSource GetServerDataSource(string connectionString)
        {
            //TODO Filters AE
            return DataSourceProvider.GetOLAPDataSource(connectionString,1000);
        }
        

        
    }

    public interface IMemberProvider
    {
        List<IDataMember> GetMembers(IServerDataSource serverDataSource);
    }

    public abstract class MembersProviderBase
    {
        protected MembersProviderBase(string fieldUniqueName,int start, int count)
        {
            Start = start;
            Count = count;
            FieldUniqueName = fieldUniqueName;
        }
        public int Start { get; }
        public int Count { get; }
        public string FieldUniqueName { get;  }

        protected Field GetFieldCore(IServerDataSource serverDataSource,string fieldUniqueName)
        {
            var fieldCollection = serverDataSource.GetFields();
            var field = fieldCollection.Find(fieldUniqueName);
            if (field == null) throw new ArgumentNullException(nameof(field));
            return field;
        }
    }

    class LeafMemberProvider : MembersProviderBase, IMemberProvider
    {
        public LeafMemberProvider(string fieldUniqueName,int start, int count) : base(fieldUniqueName,start, count)
        {
           
        }

        public List<IDataMember> GetMembers(IServerDataSource serverDataSource)
        {
            var field = GetFieldCore(serverDataSource, FieldUniqueName);
            if (field.Group == null)
            {
                return new MemberProvider(FieldUniqueName,Start, Count, null).GetMembers(serverDataSource);
            }
           return serverDataSource.GetLeafMembers(field.Group, Start, Count);
        }
    }

    class ChildMemberProvider : MembersProviderBase, IMemberProvider
    {
        public string Parent { get; set; }
        public ChildMemberProvider(string fieldUniqueName,string parent,int start, int count) : base(fieldUniqueName,start, count)
        {
            Parent = parent;
        }

        public List<IDataMember> GetMembers(IServerDataSource serverDataSource)
        {
            var field = GetFieldCore(serverDataSource, FieldUniqueName); //TODO Get group After BCZ change the api
            return serverDataSource.GetChildren(Parent, Start, Count);
        }
    }

    public class MemberProvider : MembersProviderBase, IMemberProvider
    {
        public Comarch.BI.TabularData.MemberFilter Filter { get; set; }
        
        public MemberProvider( string fieldUniqueName,int start, int count, Comarch.BI.TabularData.MemberFilter filter):base(fieldUniqueName,start,count)
        {
            Filter = filter;
        }

        public List<IDataMember> GetMembers(IServerDataSource serverDataSource)
        {
            return serverDataSource.GetMembers(GetFieldCore(serverDataSource,FieldUniqueName),Start, Count, Filter);
        }
    }

    public class MemberByStatusProvider : MembersProviderBase, IMemberProvider
    {
        public FilterItem Filter { get; set; }
        public FilterItemState Status { get; set; }
        
        public MemberByStatusProvider( string fieldUniqueName,int start, int count, FilterItem filter, FilterItemState status):base(fieldUniqueName,start,count)
        {
            Filter = filter;
            Status = status;
        }

        public List<IDataMember> GetMembers(IServerDataSource serverDataSource)
        {
          return serverDataSource.GetMembers(GetFieldCore(serverDataSource, FieldUniqueName), Start, Count, Convert(Filter), Convert(Status));
        }

        public Comarch.BI.TabularData.FilterItem Convert(FilterItem filterItem)
        {
            Comarch.BI.TabularData.FilterItem[] children = new Comarch.BI.TabularData.FilterItem[filterItem.Children.Count];
            for (int i = 0; i < filterItem.Children.Count; i++)
            {
                children[i] = Convert(filterItem.Children[i]);
            }
            var converted = new Comarch.BI.TabularData.FilterItem(filterItem.UniqueName,
                filterItem.Type == FilterType.Included ? Comarch.BI.TabularData.FilterType.Included : Comarch.BI.TabularData.FilterType.Excluded, children);
            return converted;
        }

        public Comarch.BI.TabularData.FilterItemState Convert(FilterItemState status)
        {
            return status == FilterItemState.Checked ? Comarch.BI.TabularData.FilterItemState.Checked : Comarch.BI.TabularData.FilterItemState.Unchecked;
        }
    }
}*/