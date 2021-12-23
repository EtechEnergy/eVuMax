export class comboData {
    text: string = "";
    id: string = "";
    objObject: any= "";

    constructor(paramText?: string, paramId?: string, paramObject?: any) {
        this.text = paramText || "";
        this.id = paramId || "";
        this.objObject = paramObject || "";

    }
}
