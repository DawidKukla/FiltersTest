using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Web;
using System.Web.Compilation;
using Newtonsoft.Json;

namespace FiltersJsTreeTest
{
    public class ResourcesHelper
    {
        public static string GetAllLocalResourcesAsJson(string resourceBaseVirtualPath)
        {
            return JsonConvert.SerializeObject(GetAllLocalResources(resourceBaseVirtualPath));
        }

        public static Dictionary<string,string> GetAllLocalResources(string resourceBaseVirtualPath)
        {
            return GetAllResourcesCore(resourceBaseVirtualPath);
        }

        public static string GetAllGlobalResourcesAsJson(ResourceManager resourceManage)
        {
            return JsonConvert.SerializeObject(GetAllGlobalResources(resourceManage));
        }

        public static Dictionary<string,string> GetAllGlobalResources(ResourceManager resourceManager)
        {
            var resourcesDictionary = new Dictionary<string, string>();
            RegisterResources(resourcesDictionary,resourceManager);
            return resourcesDictionary;
        }

        private static Dictionary<string, string> GetAllResourcesCore(string resourceBaseVirtualPath)
        {
            var resourcesDictionary = new Dictionary<string, string>();
            var assembly = typeof(VirtualPathUtility).Assembly;
            var virtualPathType = assembly.GetType("System.Web.VirtualPath");
            if (virtualPathType == null) throw new ArgumentNullException(nameof(virtualPathType));
            var createVirtualPathMethodInfo = virtualPathType.GetMethod("Create", new Type[] { typeof(string) });
            if (createVirtualPathMethodInfo == null) throw new ArgumentNullException(nameof(createVirtualPathMethodInfo));
            var virtualPath = createVirtualPathMethodInfo.Invoke(null, new object[] { resourceBaseVirtualPath });
            var getLocalResourceProviderMethodInfo = typeof(ResourceExpressionBuilder).GetMethods(BindingFlags.NonPublic | BindingFlags.Static)
                .Where(x => x.Name.Contains("GetLocalResourceProvider"))
                .FirstOrDefault(x => x.GetParameters().Any(p => p.Name == "virtualPath"));
            if (getLocalResourceProviderMethodInfo == null) throw new ArgumentNullException(nameof(getLocalResourceProviderMethodInfo));
            var resourceProvider = getLocalResourceProviderMethodInfo.Invoke(null, new[] { virtualPath });
            if (resourceProvider == null) throw new ArgumentNullException(nameof(resourceProvider));
            var resourceProviderBaseType = assembly.GetType("System.Web.Compilation.BaseResXResourceProvider");
            var ensureResourceManagerMethodInfo = resourceProviderBaseType.GetMethod("EnsureResourceManager", BindingFlags.Instance | BindingFlags.NonPublic);
            if (ensureResourceManagerMethodInfo == null) throw new ArgumentNullException(nameof(ensureResourceManagerMethodInfo));
            ensureResourceManagerMethodInfo.Invoke(resourceProvider, null);
            var resourceManagerField = resourceProviderBaseType.GetField("_resourceManager", BindingFlags.NonPublic | BindingFlags.Instance);
            if (resourceManagerField == null) throw new ArgumentNullException(nameof(resourceManagerField));
            var resourceManager = resourceManagerField.GetValue(resourceProvider) as ResourceManager;
            if (resourceManager == null) throw new ArgumentNullException(nameof(resourceManager));

            RegisterResources(resourcesDictionary, resourceManager);

            return resourcesDictionary;
        }

        private static void RegisterResources(Dictionary<string, string> resourcesDictionary, ResourceManager resourceManager)
        {
            foreach (DictionaryEntry entry in resourceManager.GetResourceSet(CultureInfo.InvariantCulture, true, true))
            {
                var name = entry.Key.ToString();
                resourcesDictionary[name] = resourceManager.GetObject(name, CultureInfo.CurrentUICulture)?.ToString();
            }
        }
    }
}