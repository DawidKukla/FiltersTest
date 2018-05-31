/*using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Comarch.BI.Domain.JSON;

namespace FiltersJsTreeTest.FilterControl
{
    public class TestRequest
    {
        public string Value { get; set; }
    }

    public class TestResponse
    {
        public string Value { get; set; }
    }

    public enum MemberFilterType
    {
        BeginsWith,
        EndsWith,
        Contains
    }

    public class MemberFilter
    {
        public string Value { get; set; }
        public MemberFilterType Type { get; set; }

        public static Comarch.BI.TabularData.MemberFilter ToAEFilter(MemberFilter target)
        {
            if (target == null) return null;
            return new Comarch.BI.TabularData.MemberFilter(target.Value,(Comarch.BI.TabularData.MemberFilterType)target.Type);
        }
    }

    public class FilterLevel
    {
        public string UniqueName { get; }
        public string Caption { get; }

        public FilterLevel(string uniqueName, string caption)
        {
            if (uniqueName == null) throw new ArgumentNullException(nameof(uniqueName));
            if (caption == null) throw new ArgumentNullException(nameof(caption));
            UniqueName = uniqueName;
            Caption = caption;
        }
    }

    public class FilterMetadata
    {
        public string UniqueName { get; set; }
        public string Caption { get; set; }
        public List<FilterLevel> SortedLevels { get; set; }
        public int RootMembersTotalCount { get; set; }
        public int AllLevelsMembersTotalCount { get; set; }
        public FilterInfo DefaultMember { get; set; }
    }

    public abstract class FilterRequestBase
    {
        public string ConnectionString { get; set; }
        public string FieldUniqueName { get; set; }
    }

    public class MetadataRequest : FilterRequestBase
    {
        public List<string> ExistingLeafs { get; set; }
    }

    public class MetadataResponse
    {
        public FilterMetadata Metadata { get; set; }
        public CleanedStateInfo CleanedStateInfo { get; set; }
    }
        
    public abstract class MembersRequestBase : FilterRequestBase
    {
        public int Start { get; set; }
        public int Count { get; set; }
        }

    public abstract class FiltredMembersRequestBase : MembersRequestBase
    {   
        public MemberFilter Filter { get; set; }
    }

    public class MembersRequest : FiltredMembersRequestBase
    {
    }

    public class LeafMembersRequest : FiltredMembersRequestBase
    {
    }

    public class ChildrenRequest : FilterRequestBase
    {
        public string Parent { get; set; }
        public int Start { get; set; }
        public int Count { get; set; }
    }

    [SuppressMessage("ReSharper", "UnusedMember.Global")]
    public class MemberNodeData
    {
        public int level { get; set; }
        public bool isShowMoreMember { get; set; }
        public int nextLoadStartIndex { get; set; }
        public string parentUniqueName { get; set; }
        public int childrenTotalCount { get; set; }
    }

    public class MemberNode : JsTreeNode<MemberNodeData, int, List<MemberNode>>
    {
    }

    public class FilterInfo
    {
        public Dictionary<string, MemberNode> ParentsLookup { get; set; }
        public List<MemberNode> LastLevelNodes { get; set; }
        public bool HasMoreMembers { get; set; }
    }

    public class CleanedStateInfo
    {
        public Dictionary<string, MemberNode> ExistingMembersHierarchyLookup { get; set; }=new Dictionary<string, MemberNode>();
    }
        
    public class MembersResponse
    {
        public FilterInfo FilterInfo { get; set; }
    }

    public enum FilterType {
        Included,
        Excluded
    }

    public class FilterItem {
        public string UniqueName { get; set; } 
        public FilterType Type { get; set; } 
        public List<FilterItem> Children { get; set; } 
        
    }
    public enum FilterItemState
    {
        Checked, Unchecked
    }

    public class GetMembersByStatusRequest : MembersRequestBase
    {
        public FilterItem Filter { get; set; }
        public FilterItemState Status { get; set; }
       
    }
    
}*/