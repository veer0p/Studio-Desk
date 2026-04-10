// MCP Server as a Supabase Edge Function
// Provides database schema and table info as MCP tools

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://kong:8000'
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

// MCP server protocol handlers
async function handleInitialize() {
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: { listChanged: true },
      resources: { listChanged: true },
    },
    serverInfo: {
      name: 'supabase-mcp',
      version: '1.0.0',
    },
  }
}

async function handleListTools() {
  return {
    tools: [
      {
        name: 'get_tables',
        description: 'Get all database tables in the public schema with their columns and types',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'query_table',
        description: 'Query a specific table to get rows of data',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: { type: 'string', description: 'Name of the table to query' },
            limit: { type: 'number', description: 'Maximum number of rows to return', default: 20 },
            filters: { type: 'object', description: 'Key-value pairs to filter by' },
          },
          required: ['table_name'],
        },
      },
      {
        name: 'insert_row',
        description: 'Insert a new row into a table',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: { type: 'string', description: 'Name of the table' },
            row: { type: 'object', description: 'Row data as key-value pairs' },
          },
          required: ['table_name', 'row'],
        },
      },
      {
        name: 'update_rows',
        description: 'Update rows in a table matching filters',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: { type: 'string', description: 'Name of the table' },
            data: { type: 'object', description: 'Data to update' },
            filters: { type: 'object', description: 'Key-value pairs to match' },
          },
          required: ['table_name', 'data', 'filters'],
        },
      },
      {
        name: 'delete_rows',
        description: 'Delete rows from a table matching filters',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: { type: 'string', description: 'Name of the table' },
            filters: { type: 'object', description: 'Key-value pairs to match' },
          },
          required: ['table_name', 'filters'],
        },
      },
    ],
  }
}

async function handleCallTool(name, args) {
  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }

  switch (name) {
    case 'get_tables': {
      const resp = await fetch(SUPABASE_URL + '/rest/v1/', { headers: { apikey: ANON_KEY } })
      const schema = await resp.json()
      
      const tables = {}
      const definitions = schema.definitions || {}
      for (const [tableName, def] of Object.entries(definitions)) {
        tables[tableName] = {
          columns: def.properties || {},
          required: def.required || [],
          pkCols: def.pkColumns || [],
        }
      }
      
      return {
        content: [{ type: 'text', text: JSON.stringify(tables, null, 2) }],
      }
    }
    
    case 'query_table': {
      const { table_name, limit = 20, filters = {} } = args
      let url = `${SUPABASE_URL}/rest/v1/${table_name}?limit=${limit}`
      
      for (const [key, value] of Object.entries(filters)) {
        url += `&${key}.eq=${value}`
      }
      
      const resp = await fetch(url, { headers })
      const data = await resp.json()
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }
    
    case 'insert_row': {
      const { table_name, row } = args
      const resp = await fetch(SUPABASE_URL + '/rest/v1/' + table_name, {
        method: 'POST',
        headers,
        body: JSON.stringify(row),
      })
      const data = await resp.json()
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }
    
    case 'update_rows': {
      const { table_name, data, filters } = args
      let url = SUPABASE_URL + '/rest/v1/' + table_name + '?'
      for (const [key, value] of Object.entries(filters)) {
        url += `${key}.eq=${value}&`
      }
      
      const resp = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      })
      const result = await resp.json()
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
    
    case 'delete_rows': {
      const { table_name, filters } = args
      let url = SUPABASE_URL + '/rest/v1/' + table_name + '?'
      for (const [key, value] of Object.entries(filters)) {
        url += `${key}.eq=${value}&`
      }
      
      await fetch(url, { method: 'DELETE', headers })
      return { content: [{ type: 'text', text: `Deleted rows from ${table_name}` }] }
    }
    
    default:
      return { error: `Unknown tool: ${name}`, content: [] }
  }
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    })
  }

  try {
    const body = await req.json()
    const { method, params, id } = body

    let result
    switch (method) {
      case 'initialize':
        result = await handleInitialize()
        break
      case 'tools/list':
        result = await handleListTools()
        break
      case 'tools/call':
        result = await handleCallTool(params.name, params.arguments || {})
        break
      default:
        result = { error: `Method not found: ${method}` }
    }

    return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('MCP Error:', err)
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: err.message },
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
