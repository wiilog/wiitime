import {TableDefinition, TableName} from '@app/services/sqlite/table-name';

export const TABLES_DEFINITION: Array<TableDefinition> = [
    {
        name: TableName.clocking,
        attributes: {
            id: 'INTEGER PRIMARY KEY',
            badge_number: 'TEXT NOT NULL',
            clocking_date: 'TEXT NOT NULL', // date with format "YYYY-MM-DD HH:MM"
            is_synchronised: 'BOOLEAN NOT NULL CHECK (is_synchronised IN (0,1))'
        }
    },
];
