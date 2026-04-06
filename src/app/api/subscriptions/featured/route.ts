import { NextResponse } from 'next/server';
import { subscriptions } from '@/mocks/fixtures';

export async function GET() {
  return NextResponse.json(subscriptions[0]);
}
