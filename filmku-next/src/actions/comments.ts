'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getMovieComments(movieId: string) {
  try {
    const comments = await prisma.movieComment.findMany({
      where: { movieId, parentId: null },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, email: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return comments;
  } catch (error) {
    console.error('Error fetching movie comments:', error);
    return [];
  }
}

export async function postMovieComment(movieId: string, content: string, rating: number = 10, parentId?: string) {
  const user = await getAuthUser();
  if (!user) {
    return { error: 'Anda harus masuk/login terlebih dahulu untuk memberikan komentar.' };
  }

  if (!content || !content.trim()) {
    return { error: 'Komentar tidak boleh kosong.' };
  }

  try {
    const newComment = await prisma.movieComment.create({
      data: {
        movieId,
        userId: user.id,
        content: content.trim(),
        rating: Math.min(10, Math.max(1, rating)),
        likes: Math.floor(Math.random() * 5), // Initial realistic engagement seed
        parentId: parentId || null,
      }
    });

    revalidatePath(`/film/${movieId}`);
    return { success: true, comment: newComment };
  } catch (error) {
    console.error('Error posting movie comment:', error);
    return { error: 'Gagal mengirim komentar. Coba beberapa saat lagi.' };
  }
}
