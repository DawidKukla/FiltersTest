module AjaxHelperModule {
    
    interface IAjaxArgs {
        data?: any;
        url: string;
        dataType?: string;
    }
     export class AjaxHelper {
         static PostData<T>(args:IAjaxArgs) : Promise<T> {
             return AjaxHelper.SendCore<T>(args,false);
         }
         static GetData<T>(args:IAjaxArgs) : Promise<T> {
             return AjaxHelper.SendCore<T>(args,true);
         }

         private static SendCore<T>(args: IAjaxArgs,isGet:boolean) {
             var ajaxSettings: JQueryAjaxSettings = {
                 url: "/" + args.url,
                 type:isGet?"GET": "POST",
                 contentType: "application/json;charset=utf-8",
                 data: JSON.stringify(args.data),
                 dataType: "json",
             };
             return new Promise<T>((resolve, rejects) => {
                 $.ajax(ajaxSettings).done((result) => resolve(result)).fail(error => rejects(error));
             });
         }
     }
}