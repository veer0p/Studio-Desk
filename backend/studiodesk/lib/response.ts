import { NextResponse } from 'next/server'

export const Response = {
  ok: <T>(data: T, status = 200) =>
    NextResponse.json(
      { data, error: null },
      {
        status,
        headers: { 'X-API-Version': '1' },
      }
    ),

  created: <T>(data: T) =>
    NextResponse.json(
      { data, error: null },
      {
        status: 201,
        headers: { 'X-API-Version': '1' },
      }
    ),

  noContent: () =>
    new NextResponse(null, {
      status: 204,
      headers: { 'X-API-Version': '1' },
    }),

  error: (message: string, code: string, status = 400) =>
    NextResponse.json(
      { data: null, error: message, code },
      {
        status,
        headers: { 'X-API-Version': '1' },
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
        headers: { 'X-API-Version': '1' },
      }
    ),
}
