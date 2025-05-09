import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/service-role';
import { TABLES } from '@/utils/constants/tables';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = typeof TABLES & {
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

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
  warnings?: SchemaWarning[];
}

interface SchemaWarning {
  type:
    | 'missing_column'
    | 'type_mismatch'
    | 'missing_index'
    | 'missing_foreign_key'
    | 'enum_value_mismatch'
    | null;
  table?: string;
  column?: string;
  message: string;
  expected?: string;
  actual?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated and is admin
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profiles table schema
    const { data: profilesSchema, error: profilesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', Tables.PROFILES);

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Get a sample profile for reference
    const { data: sampleProfile, error: sampleError } = await supabase
      .from(Tables.PROFILES)
      .select('*')
      .limit(1)
      .single();

    // Check if travel_personality and travel_squad columns exist in the profiles table
    const hasTravelPersonality = profilesSchema.some(col => col.column_name === 'travel_personality');
    const hasTravelSquad = profilesSchema.some(col => col.column_name === 'travel_squad');

    return NextResponse.json({
      schema: {
        profilesColumns: profilesSchema,
        hasTravelPersonality,
        hasTravelSquad,
      },
      sampleData: sampleProfile || null,
      sampleError: sampleError?.message || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
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

// Database Functions - Names of database functions
export const FUNCTIONS = {
  EXECUTE_SQL: 'execute_sql'
} as const;

// RLS Policies - Names of row-level security policies
export const POLICIES = {
  // Define your policy names here
} as const;

// TypeScript Types
${enumNames
  .map((enumName) => {
    const values = enums[enumName];
    const typeName =
      enumName.charAt(0).toUpperCase() +
      enumName.slice(1).replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

    return `export type ${typeName} = ${values.map((v) => `'${v}'`).join(' | ')};`;
  })
  .join('\n')}
`;

  return content;
}
