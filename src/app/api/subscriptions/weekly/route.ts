import { NextResponse } from 'next/server';
import { subscriptions } from '@/mocks/fixtures';

export async function GET() {
  const weekly = subscriptions.filter((s) => s.status !== 'closed');
  return NextResponse.json(weekly);
}
