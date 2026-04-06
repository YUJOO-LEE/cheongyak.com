import { NextResponse } from 'next/server';
import { subscriptions, subscriptionDetail } from '@/mocks/fixtures';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id === subscriptionDetail.id) {
    return NextResponse.json(subscriptionDetail);
  }

  const sub = subscriptions.find((s) => s.id === id);
  if (!sub) {
    return NextResponse.json(
      { status: 404, code: 'LISTING_NOT_FOUND', message: '해당 청약 정보를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ ...subscriptionDetail, ...sub });
}
