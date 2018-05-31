namespace Comarch.Controls.FilterControlModule {
    import IResourcesMap = FilterControlModule.Common.IResourcesMap;

    export interface IOptions {
        $TargetContainer: JQuery;
        Template: string;
        Resources: IResourcesMap;
        DataPackageSize: number;
        MaxTotalElementsCount: number;
        CurrentWindow: number;
    }

    export class Options implements IOptions {
        $TargetContainer: JQuery;
        Template: string;
        Resources: IResourcesMap;
        DataPackageSize: number=1000;
        MaxTotalElementsCount: number=10000;
        CurrentWindow: number;

        Merge(options: IOptions): Options {
            $.extend(true, this, options);
            return this;
        }
    }


}