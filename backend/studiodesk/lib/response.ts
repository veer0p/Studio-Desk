import { NextResponse } from 'next/server'

const DEFAULT_HEADERS = {
  'X-API-Version': '1',
  'Content-Type': 'application/json',
}

export const Response = {
  ok: <T>(data: T, status = 200) =>
    NextResponse.json(
      { data, error: null },
      {
        status,
        headers: DEFAULT_HEADERS,
      }
    ),

  created: <T>(data: T) =>
    NextResponse.json(
      { data, error: null },
      {
        status: 201,
        headers: DEFAULT_HEADERS,
      }
    ),

  noContent: () =>
    new NextResponse(null, {
      status: 204,
      headers: DEFAULT_HEADERS,
    }),

  error: (message: string, code?: string, status = 400) =>
    NextResponse.json(
      { data: null, error: message, code: code || 'ERROR' },
      {
        status,
        headers: DEFAULT_HEADERS,
      }
    ),

  paginated: <T>(data: T[], count: number, page: number, pageSize: number) =>
    NextResponse.json(
      {
        data,
        meta: {
          count,
          page,
          pageSize,
          totalPages: Math.ceil(count / pageSize),
        },
        error: null,
      },
      {
        status: 200,
        headers: DEFAULT_HEADERS,
      }
    ),
}
