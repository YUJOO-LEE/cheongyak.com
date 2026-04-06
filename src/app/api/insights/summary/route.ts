import { NextResponse } from 'next/server';
import { marketInsights } from '@/mocks/fixtures';

export async function GET() {
  return NextResponse.json(marketInsights);
}
