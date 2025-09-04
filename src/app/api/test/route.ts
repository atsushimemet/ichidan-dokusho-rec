import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'API Test Endpoint Active',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'GET'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    return NextResponse.json({
      status: 'API Test Endpoint Active',
      timestamp: new Date().toISOString(),
      url: request.url,
      method: 'POST',
      bodyLength: body.length
    });
  } catch (error) {
    return NextResponse.json({
      status: 'API Test Endpoint Active',
      timestamp: new Date().toISOString(),
      error: 'Error processing request',
      method: 'POST'
    });
  }
}