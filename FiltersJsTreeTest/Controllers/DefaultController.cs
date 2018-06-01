using System.Web.Mvc;

namespace FiltersJsTreeTest.Controllers
{
    public class DefaultController : Controller
    {
        // GET: Default
        public ActionResult Performance()
        {
            return View();
        }

        public ActionResult TestTree()
        {
            return View();
        }

        public ActionResult Manual()
        {
            return View();
        }
    }
}