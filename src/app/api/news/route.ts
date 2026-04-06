import { NextRequest, NextResponse } from 'next/server';
import { newsArticles } from '@/mocks/fixtures';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') || '1');
  const category = searchParams.get('category');
  const limit = Number(searchParams.get('limit') || '15');
  const exclude = searchParams.get('exclude');

  let filtered = [...newsArticles];
  if (category && category !== 'all') {
    filtered = filtered.filter((n) => n.category === category);
  }
  if (exclude) {
    filtered = filtered.filter((n) => n.id !== exclude);
  }

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
