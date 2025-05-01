import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/database';

export const dynamic = 'force-dynamic';

// SQL to get table information
const TABLE_INFO_SQL = `
  SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
  ORDER BY 
    table_name, ordinal_position;
`;

// SQL to get enum types
const ENUM_INFO_SQL = `
  SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
  FROM 
    pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
  WHERE 
    n.nspname = 'public'
  ORDER BY 
    enum_name, e.enumsortorder;
`;

// SQL to get foreign key relationships
const FOREIGN_KEY_SQL = `
  SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
  FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
`;

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
}

interface TableInfo {
  columns: TableColumn[];
}

interface ForeignKeyRelation {
  column: string;
  referencesTable: string;
  referencesColumn: string;
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const url = new URL(request.url);
    const detail = url.searchParams.get('detail') === 'true';
    
    // List of core tables from our constants
    const coreTablesFromConstants = Object.values(TABLES);

    // Fetch detected tables and their columns
    const { data: tableData, error: tableError } = await supabase.rpc(
      'execute_sql', 
      { query: TABLE_INFO_SQL }
    );

    // Get enum types and values
    const { data: enumData, error: enumError } = await supabase.rpc(
      'execute_sql', 
      { query: ENUM_INFO_SQL }
    );
    
    // Get foreign key relationships
    const { data: foreignKeyData, error: foreignKeyError } = await supabase.rpc(
      'execute_sql', 
      { query: FOREIGN_KEY_SQL }
    );

    if (tableError || enumError || foreignKeyError) {
      throw new Error(`Database schema query failed: ${tableError?.message || enumError?.message || foreignKeyError?.message}`);
    }

    // Process table data into structured format
    const tables: Record<string, TableInfo> = {};
    const detectedTableNames: string[] = [];
    
    if (tableData && Array.isArray(tableData)) {
      tableData.forEach((row: any) => {
        const tableName = row.table_name as string;
        if (!detectedTableNames.includes(tableName)) {
          detectedTableNames.push(tableName);
        }
        
        if (!tables[tableName]) {
          tables[tableName] = {
            columns: []
          };
        }
        
        tables[tableName].columns.push({
          name: row.column_name as string,
          type: row.data_type as string,
          nullable: (row.is_nullable as string) === 'YES',
          default: row.column_default as string | null
        });
      });
    }
    
    // Process enum data
    const enums: Record<string, string[]> = {};
    
    if (enumData && Array.isArray(enumData)) {
      enumData.forEach((row: any) => {
        const enumName = row.enum_name as string;
        const enumValue = row.enum_value as string;
        
        if (!enums[enumName]) {
          enums[enumName] = [];
        }
        
        enums[enumName].push(enumValue);
      });
    }
    
    // Process foreign key data
    const foreignKeys: Record<string, ForeignKeyRelation[]> = {};
    
    if (foreignKeyData && Array.isArray(foreignKeyData)) {
      foreignKeyData.forEach((row: any) => {
        const tableName = row.table_name as string;
        
        if (!foreignKeys[tableName]) {
          foreignKeys[tableName] = [];
        }
        
        foreignKeys[tableName].push({
          column: row.column_name as string,
          referencesTable: row.foreign_table_name as string,
          referencesColumn: row.foreign_column_name as string
        });
      });
    }

    // Find missing tables
    const missingTables = coreTablesFromConstants.filter(
      (table) => !detectedTableNames.includes(table as string)
    );

    // Generate constants file content if requested
    let generatedConstants = null;
    if (detail) {
      generatedConstants = generateConstantsFile(tables, enums, foreignKeys);
    }

    return NextResponse.json({
      missingTables,
      detectedTables: detectedTableNames,
      checkedTables: coreTablesFromConstants,
      success: missingTables.length === 0,
      detail: detail ? {
        tables,
        enums,
        foreignKeys,
        generatedConstants
      } : undefined
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check database schema',
        errorDetails: error instanceof Error ? error.message : String(error),
        success: false
      },
      { status: 200 }
    );
  }
}

// Function to generate constants file content based on database schema
function generateConstantsFile(
  tables: Record<string, TableInfo>,
  enums: Record<string, string[]>,
  foreignKeys: Record<string, ForeignKeyRelation[]>
) {
  const tableNames = Object.keys(tables);
  const enumNames = Object.keys(enums);
  
  // Start building the file content
  let content = `// This file was automatically generated from the database schema
// Generated at: ${new Date().toISOString()}

// Database Tables - Constant names for all database tables
export const DB_TABLES = {
${tableNames.map(table => `  ${table.toUpperCase()}: '${table}'`).join(',\n')}
} as const;

// Database Fields - Field names by table
export const DB_FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
${tableNames.map(table => {
    const columns = tables[table].columns;
    return `  ${table.toUpperCase()}: {
${columns.map((col: TableColumn) => `    ${col.name.toUpperCase()}: '${col.name}'`).join(',\n')}
  }`;
  }).join(',\n')}
} as const;

// Database Enums - Enum values from database
export const DB_ENUMS = {
${enumNames.map(enumName => {
    const values = enums[enumName];
    return `  ${enumName.toUpperCase()}: {
${values.map(val => `    ${val.toUpperCase()}: '${val}'`).join(',\n')}
  }`;
  }).join(',\n')}
} as const;

// Foreign Key Relationships
export const DB_RELATIONSHIPS = {
${Object.keys(foreignKeys).map(table => {
    const relations = foreignKeys[table];
    return `  ${table.toUpperCase()}: [
${relations.map(rel => `    { column: '${rel.column}', referencesTable: '${rel.referencesTable}', referencesColumn: '${rel.referencesColumn}' }`).join(',\n')}
  ]`;
  }).join(',\n')}
} as const;

// Type helpers
export type TableNames = (typeof DB_TABLES)[keyof typeof DB_TABLES];
export type TableFields<T extends keyof typeof DB_FIELDS> = (typeof DB_FIELDS)[T][keyof (typeof DB_FIELDS)[T]];

// Re-export with common aliases
export const TABLES = DB_TABLES;
export const FIELDS = DB_FIELDS;
export const ENUMS = DB_ENUMS;
export const RELATIONSHIPS = DB_RELATIONSHIPS;
`;

  return content;
} 