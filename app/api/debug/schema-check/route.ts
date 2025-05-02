import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/service-role';
import { TABLES, ENUMS } from '@/utils/constants/database';

export const dynamic = 'force-dynamic';

// SQL to get table information with more comprehensive metadata
const TABLE_INFO_SQL = `
  SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    udt_name
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
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
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
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
  FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
`;

// SQL to get indexes
const INDEX_INFO_SQL = `
  SELECT
    i.relname AS index_name,
    t.relname AS table_name,
    a.attname AS column_name,
    ix.indisunique AS is_unique,
    ix.indisprimary AS is_primary
  FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
  WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ORDER BY
    t.relname, i.relname;
`;

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  maxLength?: number | null;
  precision?: number | null;
  scale?: number | null;
  udtName?: string | null;
}

interface TableInfo {
  columns: TableColumn[];
  hasPrimaryKey: boolean;
  primaryKeyColumns: string[];
}

interface ForeignKeyRelation {
  column: string;
  referencesTable: string;
  referencesColumn: string;
  onUpdate: string;
  onDelete: string;
}

interface IndexInfo {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
}

interface SchemaCheckResult {
  missingTables: string[];
  detectedTables: string[];
  checkedTables: string[];
  success: boolean;
  missingEnums?: string[];
  detail?: {
    tables: Record<string, TableInfo>;
    enums: Record<string, string[]>;
    foreignKeys: Record<string, ForeignKeyRelation[]>;
    indexes: Record<string, IndexInfo[]>;
    generatedConstants?: string;
    warnings?: SchemaWarning[];
  };
}

interface SchemaWarning {
  type:
    | 'missing_column'
    | 'type_mismatch'
    | 'missing_index'
    | 'missing_foreign_key'
    | 'enum_value_mismatch';
  table?: string;
  column?: string;
  message: string;
  expected?: string;
  actual?: string;
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const detail = url.searchParams.get('detail') === 'true';
    const validateEnums = url.searchParams.get('validateEnums') === 'true';

    // List of core tables and enums from our constants
    const coreTablesFromConstants = Object.values(TABLES);
    const coreEnumsFromConstants = validateEnums ? [] : []; // We'll implement enum validation in a future update

    // Fetch detected tables and their columns
    const { data: tableData, error: tableError } = await supabase.rpc('execute_sql', {
      query: TABLE_INFO_SQL,
    });

    // Get enum types and values
    const { data: enumData, error: enumError } = await supabase.rpc('execute_sql', {
      query: ENUM_INFO_SQL,
    });

    // Get foreign key relationships
    const { data: foreignKeyData, error: foreignKeyError } = await supabase.rpc('execute_sql', {
      query: FOREIGN_KEY_SQL,
    });

    // Get index information
    const { data: indexData, error: indexError } = await supabase.rpc('execute_sql', {
      query: INDEX_INFO_SQL,
    });

    if (tableError || enumError || foreignKeyError || indexError) {
      // Log the specific error
      console.error(
        'Database schema query error:',
        tableError || enumError || foreignKeyError || indexError
      );
      throw new Error(
        `Database schema query failed: ${
          tableError?.message ||
          enumError?.message ||
          foreignKeyError?.message ||
          indexError?.message
        }`
      );
    }

    // Process table data into structured format
    const tables: Record<string, TableInfo> = {};
    const detectedTableNames: string[] = [];
    const warnings: SchemaWarning[] = [];

    if (tableData && Array.isArray(tableData)) {
      // First pass: collect all tables and their columns
      tableData.forEach((row: any) => {
        const tableName = row.table_name as string;
        if (!detectedTableNames.includes(tableName)) {
          detectedTableNames.push(tableName);
        }

        if (!tables[tableName]) {
          tables[tableName] = {
            columns: [],
            hasPrimaryKey: false,
            primaryKeyColumns: [],
          };
        }

        tables[tableName].columns.push({
          name: row.column_name as string,
          type: row.data_type as string,
          nullable: (row.is_nullable as string) === 'YES',
          default: row.column_default as string | null,
          maxLength: row.character_maximum_length as number | null,
          precision: row.numeric_precision as number | null,
          scale: row.numeric_scale as number | null,
          udtName: row.udt_name as string | null,
        });
      });
    }

    // Process enum data
    const enums: Record<string, string[]> = {};
    const detectedEnumNames: string[] = [];

    if (enumData && Array.isArray(enumData)) {
      enumData.forEach((row: any) => {
        const enumName = row.enum_name as string;
        const enumValue = row.enum_value as string;

        if (!detectedEnumNames.includes(enumName)) {
          detectedEnumNames.push(enumName);
        }

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
          referencesColumn: row.foreign_column_name as string,
          onUpdate: row.update_rule as string,
          onDelete: row.delete_rule as string,
        });
      });
    }

    // Process index data
    const indexes: Record<string, IndexInfo[]> = {};

    if (indexData && Array.isArray(indexData)) {
      // Group by index name to collect all columns
      const indexMap = new Map<
        string,
        {
          tableName: string;
          columns: string[];
          isUnique: boolean;
          isPrimary: boolean;
        }
      >();

      indexData.forEach((row: any) => {
        const indexName = row.index_name as string;
        const tableName = row.table_name as string;
        const columnName = row.column_name as string;
        const isUnique = row.is_unique as boolean;
        const isPrimary = row.is_primary as boolean;

        const key = `${tableName}:${indexName}`;

        if (!indexMap.has(key)) {
          indexMap.set(key, {
            tableName,
            columns: [],
            isUnique,
            isPrimary,
          });
        }

        const index = indexMap.get(key)!;
        index.columns.push(columnName);

        // Update table with primary key info
        if (isPrimary && tables[tableName]) {
          tables[tableName].hasPrimaryKey = true;
          tables[tableName].primaryKeyColumns.push(columnName);
        }
      });

      // Convert map to record
      for (const [key, value] of indexMap.entries()) {
        const tableName = value.tableName;

        if (!indexes[tableName]) {
          indexes[tableName] = [];
        }

        indexes[tableName].push({
          name: key.split(':')[1],
          columns: value.columns,
          isUnique: value.isUnique,
          isPrimary: value.isPrimary,
        });
      }
    }

    // Find missing tables
    const missingTables = coreTablesFromConstants.filter(
      (table) => !detectedTableNames.includes(table as string)
    );

    // Find missing enums if validation is requested
    const missingEnums = validateEnums
      ? coreEnumsFromConstants.filter((enumName) => !detectedEnumNames.includes(enumName))
      : [];

    // Check for tables without primary keys
    for (const tableName of detectedTableNames) {
      const tableInfo = tables[tableName];
      if (!tableInfo.hasPrimaryKey) {
        warnings.push({
          type: 'missing_index',
          table: tableName,
          message: `Table ${tableName} does not have a primary key`,
        });
      }
    }

    // Generate constants file content if requested
    let generatedConstants: string | undefined = undefined;
    if (detail) {
      generatedConstants = generateConstantsFile(tables, enums, foreignKeys, indexes);
    }

    const result: SchemaCheckResult = {
      missingTables,
      detectedTables: detectedTableNames,
      checkedTables: coreTablesFromConstants as string[],
      success: missingTables.length === 0 && (!validateEnums || missingEnums.length === 0),
      ...(validateEnums && { missingEnums }),
      detail: detail
        ? {
            tables,
            enums,
            foreignKeys,
            indexes,
            warnings,
            generatedConstants,
          }
        : undefined,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json(
      {
        error: 'Failed to check database schema',
        errorDetails: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 }
    );
  }
}

// Function to generate constants file content based on database schema
function generateConstantsFile(
  tables: Record<string, TableInfo>,
  enums: Record<string, string[]>,
  foreignKeys: Record<string, ForeignKeyRelation[]>,
  indexes: Record<string, IndexInfo[]>
) {
  const tableNames = Object.keys(tables);
  const enumNames = Object.keys(enums);

  // Start building the file content
  let content = `// This file was automatically generated from the database schema
// Generated at: ${new Date().toISOString()}

// Database Tables - Constant names for all database tables
export const TABLES = {
${tableNames.map((table) => `  ${table.toUpperCase()}: '${table}'`).join(',\n')}
} as const;

// Legacy export (avoid using in new code)
export const DB_TABLES = TABLES;

// Database Fields - Field names by table
export const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
${tableNames
  .map((table) => {
    const columns = tables[table].columns;
    return `  ${table.toUpperCase()}: {
${columns.map((col: TableColumn) => `    ${col.name.toUpperCase()}: '${col.name}'`).join(',\n')}
  }`;
  })
  .join(',\n')}
} as const;

// Legacy export (avoid using in new code)
export const DB_FIELDS = FIELDS;

// Database Enums - Enum values from database
export const ENUMS = {
${enumNames
  .map((enumName) => {
    const values = enums[enumName];
    return `  ${enumName.toUpperCase()}: {
${values.map((value) => `    ${value.toUpperCase()}: '${value}'`).join(',\n')}
  }`;
  })
  .join(',\n')}
} as const;

// Legacy export (avoid using in new code)
export const DB_ENUMS = ENUMS;

// Database Functions - Names of database functions
export const FUNCTIONS = {
  EXECUTE_SQL: 'execute_sql'
} as const;

// Legacy export (avoid using in new code)
export const DB_FUNCTIONS = FUNCTIONS;

// RLS Policies - Names of row-level security policies
export const POLICIES = {
  // Define your policy names here
} as const;

// Legacy export (avoid using in new code)
export const DB_POLICIES = POLICIES;

// TypeScript Types
${enumNames
  .map((enumName) => {
    const values = enums[enumName];
    const typeName =
      enumName.charAt(0).toUpperCase() +
      enumName.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return `export type ${typeName} = ${values.map((value) => `'${value}'`).join(' | ')};`;
  })
  .join('\n')}

// Type for table names
export type TableName = keyof typeof TABLES;

// Type for field names by table
export type TableField<T extends keyof typeof FIELDS> = keyof typeof FIELDS[T];

// Legacy types (avoid using in new code)
export type TableNames = (typeof TABLES)[keyof typeof TABLES];
export type TableFields<T extends keyof typeof FIELDS> = (typeof FIELDS)[T][keyof (typeof FIELDS)[T]];
`;

  return content;
}
