
    export enum enValueType {
        staticValue = 0,
        queryValue = 1,
    }
    export class logChannel {
        mnemonic: string = "";
        classWitsml: string = "";
        unit: string = "";
        mnemAlias: string = "";
        nullValue: string = "";
        minIndex: string = "";
        maxIndex: string = "";
        minIndexUOM: string = "";
        maxIndexUOM: string = "";
        columnIndex: string = "";
        curveDescription: string = "";
        sensorOffset: string = "";
        traceState: string = "";
        typeLogData: string = "";
        startIndex: string = "";
        endIndex: string = "";
        witsmlMnemonic: string = "";
        valueType: enValueType.staticValue = enValueType.staticValue;
        valueQuery: string = "";
        fieldName: string = "";
        sourceColIndex: number = 0;
        curveID: number = 0;
        sourceColNo: number = 0;
        VuMaxUnitID: string = "";
        UnitID: string = "";
        ColumnOrder: number = 0;
        DoNotInterpolate: number = 0;
        WriteBack: boolean = false;
        PiMnemonic: string = "";
        AxisDataCount: number = 0;
        isStoredProc: boolean = false;
        StoredProcParams: string = "";
        processChannel: boolean = false;
        parentMnemonic: string = "";
    }


