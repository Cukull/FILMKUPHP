import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const movies = await prisma.movie.findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        posterUrl: true,
        rating: true,
        genre: true
      },
      take: 5
    });

    return NextResponse.json({ results: movies });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: [], error: "Gagal mencari film" }, { status: 500 });
  }
}
