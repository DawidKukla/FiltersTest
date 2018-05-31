using System.Web.Optimization;

namespace FiltersJsTreeTest
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {   
            ScriptBundle masterBundle = new ScriptBundle("~/bundles/master");
            masterBundle.Include();
            
            bundles.Add(masterBundle);
        }
    }
}