import { NextResponse } from 'next/server';
import { newsArticles } from '@/mocks/fixtures';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const article = newsArticles.find((n) => n.id === id);

  if (!article) {
    return NextResponse.json(
      { status: 404, code: 'ARTICLE_NOT_FOUND', message: '해당 기사를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  return NextResponse.json(article);
}
