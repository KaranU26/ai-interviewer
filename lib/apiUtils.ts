import { NextResponse } from 'next/server';

interface ErrorResponse {
  error: string;
  details?: string;
}

export function createErrorResponse(
  message: string,
  status: number,
  details?: string
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = { error: message };
  if (details) {
    errorResponse.details = details;
  }
  return NextResponse.json(errorResponse, { status });
}
