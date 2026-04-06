import { NextRequest, NextResponse } from 'next/server';
import { subscriptions } from '@/mocks/fixtures';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') || '1');
  const perPage = 20;
  const status = searchParams.get('status');
  const region = searchParams.get('region');

  let filtered = [...subscriptions];
  if (status) filtered = filtered.filter((s) => s.status === status);
  if (region) filtered = filtered.filter((s) => s.location.sido === region);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * perPage, page * perPage);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  });
}
