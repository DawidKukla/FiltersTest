module Comarch.Controls.FilterControlModule.FilterStateManagerModule.Common {
    export interface IFilterItem {
        Type: FilterType;
        UniqueName: string;
        Children: IFilterItem[];
    }

    export enum FilterType {
        Included,
        Excluded
    }
    
    export enum SelectionMode {
        Selected = "Selected" as any,
        Deselected = "Deselected" as any,
        Undetermined = "Undetermined" as any
    }
    
    
}