using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;


namespace FiltersJsTreeTest.Controllers
{
    public class StateRequest
    {
        public string StateString { get; set; }
        public string CleanedStateString { get; set; }
    }

    public class StateController : ApiController
    {
        [HttpGet]
        public string Load()
        {
            return File.ReadAllText(GetPath());
        }

        [HttpGet]
        public string LoadCleanedState()
        {
            return File.ReadAllText(GetCleanStatePath());
        }

        [HttpPost]
        public void Save(StateRequest request)
        {
            FileInfo fileInfo = new FileInfo(GetPath());
            fileInfo.IsReadOnly = false;
            File.WriteAllText(GetPath(),request.StateString);

            fileInfo = new FileInfo(GetCleanStatePath());
            fileInfo.IsReadOnly = false;
            File.WriteAllText(GetCleanStatePath(),request.CleanedStateString);
        }

        private static string GetPath()
        {
            return HttpContext.Current.Server.MapPath("~/FakeState.json");
        }

        private static string GetCleanStatePath()
        {
            return HttpContext.Current.Server.MapPath("~/FakeCleanedState.json");
        }
    }
}