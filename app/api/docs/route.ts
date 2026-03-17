import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

/**
 * GET /api/docs
 * Serves the OpenAPI 3.0 JSON specification.
 */
export async function GET() {
  const spec = getApiDocs();
  return NextResponse.json(spec);
}
