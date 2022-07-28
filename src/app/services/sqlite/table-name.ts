export interface TableDefinition {
    name: TableName;
    /** attributeName => constraint */
    attributes: {
        [attributeName: string]: string;
    };
}

export enum TableName {
    CLOCKING_RECORD = 'clocking_record',
}

