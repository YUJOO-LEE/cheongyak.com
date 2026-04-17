import { NextRequest, NextResponse } from 'next/server';
import { subscriptions } from '@/mocks/fixtures';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').toLowerCase();

  const matchedSubscriptions = subscriptions.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.location.sido.includes(q) ||
      s.location.gugun.includes(q) ||
      s.builder.toLowerCase().includes(q),
  );

  return NextResponse.json({
    subscriptions: matchedSubscriptions.slice(0, 5),
  });
}
