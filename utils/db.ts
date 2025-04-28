import { createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers"
import { ApiResponse, DbQueryParams } from "./types"

/**
 * Execute a database query using our standardized query params
 */
export async function executeQuery<T>(params: DbQueryParams): Promise<ApiResponse<T>> {
  try {
    const supabase = createClient()
    
    // Start building the query
    let query = supabase.from(params.table).select(params.select)
    
    // Apply filters if provided
    if (params.filters && params.filters.length > 0) {
      params.filters.forEach(filter => {
        const { field, value, operator = "eq" } = filter
        
        if (operator === "eq") {
          query = query.eq(field, value)
        } else if (operator === "neq") {
          query = query.neq(field, value)
        } else if (operator === "gt") {
          query = query.gt(field, value)
        } else if (operator === "gte") {
          query = query.gte(field, value)
        } else if (operator === "lt") {
          query = query.lt(field, value)
        } else if (operator === "lte") {
          query = query.lte(field, value)
        } else if (operator === "like") {
          query = query.like(field, `%${value}%`)
        } else if (operator === "ilike") {
          query = query.ilike(field, `%${value}%`)
        } else if (operator === "in") {
          query = query.in(field, value as any)
        }
      })
    }
    
    // Apply ordering if provided
    if (params.order) {
      query = query.order(params.order.field, { 
        ascending: params.order.ascending 
      })
    }
    
    // Apply pagination if provided
    if (params.limit) {
      query = query.limit(params.limit)
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }
    
    // Execute the query
    const { data, error, count } = await query
    
    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details
        },
        status: error.code === "PGRST116" ? 404 : 500
      }
    }
    
    return {
      data: data as T,
      meta: {
        count: count || data?.length || 0
      },
      status: 200
    }
  } catch (error: any) {
    return {
      error: {
        message: error.message || "Unknown error occurred",
        details: error.stack
      },
      status: 500
    }
  }
}

/**
 * Create a new record in the database
 */
export async function createRecord<T>(
  table: string, 
  data: Record<string, any>
): Promise<ApiResponse<T>> {
  try {
    const supabase = createClient()
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details
        },
        status: 500
      }
    }
    
    return {
      data: result as T,
      status: 201
    }
  } catch (error: any) {
    return {
      error: {
        message: error.message || "Unknown error occurred",
        details: error.stack
      },
      status: 500
    }
  }
}

/**
 * Update a record in the database
 */
export async function updateRecord<T>(
  table: string, 
  id: string, 
  data: Record<string, any>,
  idField: string = 'id'
): Promise<ApiResponse<T>> {
  try {
    const supabase = createClient()
    
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq(idField, id)
      .select()
      .single()
    
    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details
        },
        status: error.code === "PGRST116" ? 404 : 500
      }
    }
    
    return {
      data: result as T,
      status: 200
    }
  } catch (error: any) {
    return {
      error: {
        message: error.message || "Unknown error occurred",
        details: error.stack
      },
      status: 500
    }
  }
}

/**
 * Delete a record from the database
 */
export async function deleteRecord(
  table: string, 
  id: string,
  idField: string = 'id'
): Promise<ApiResponse<null>> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idField, id)
    
    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details
        },
        status: error.code === "PGRST116" ? 404 : 500
      }
    }
    
    return {
      data: null,
      status: 204
    }
  } catch (error: any) {
    return {
      error: {
        message: error.message || "Unknown error occurred",
        details: error.stack
      },
      status: 500
    }
  }
} 