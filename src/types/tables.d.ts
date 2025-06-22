declare module '*/tables.json' {
  type TableStatus = 'available' | 'reserved' | 'serving' | 'billing' | 'done';

  interface Table {
    id: string;
    seats: number;
    status: TableStatus;
  }

  interface Zone {
    id: number;
    name: string;
    tables: Table[];
  }

  interface TablesData {
    zones: Zone[];
  }

  const value: TablesData;
  export default value;
} 