import {TableDefinition, TableName} from '@app/services/sqlite/table-name';

export const TABLES_DEFINITION: Array<TableDefinition> = [
    {
        name: TableName.CLOCKING_RECORD,
        attributes: {
            id: 'INTEGER PRIMARY KEY',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            badge_number: 'TEXT NOT NULL',
            // date with format "YYYY-MM-DD HH:MM"
            // eslint-disable-next-line @typescript-eslint/naming-convention
            clocking_date: 'TEXT NOT NULL',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            is_synchronised: 'BOOLEAN NOT NULL CHECK (is_synchronised IN (0,1))'
        }
    },
];
