import { NextResponse } from 'next/server';
import { filterOptions } from '@/mocks/fixtures';

export async function GET() {
  return NextResponse.json(filterOptions.builders);
}
