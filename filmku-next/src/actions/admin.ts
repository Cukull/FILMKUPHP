'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

// Middleware / Check Admin
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

// ---------------------------------------------------------------------------
// MOVIE ACTIONS
// ---------------------------------------------------------------------------

export async function createMovie(data: {
  title: string;
  synopsis?: string;
  posterUrl?: string;
  trailerUrl?: string;
  durationMin?: number;
  rating?: number;
  status: 'NOW_PLAYING' | 'UPCOMING';
  categoryId?: string;
  rottenTomatoes?: string;
  metacritic?: string;
  cast?: string;
  director?: string;
  genre?: string;
  sections?: string;
}) {
  await requireAdmin();
  const movie = await prisma.movie.create({
    data: {
      title: data.title,
      synopsis: data.synopsis,
      posterUrl: data.posterUrl,
      trailerUrl: data.trailerUrl,
      durationMin: data.durationMin ? Number(data.durationMin) : null,
      rating: data.rating ? Number(data.rating) : null,
      status: data.status,
      categoryId: data.categoryId || null,
      rottenTomatoes: data.rottenTomatoes,
      metacritic: data.metacritic,
      cast: data.cast,
      director: data.director,
      genre: data.genre,
      sections: data.sections,
    },
  });
  revalidatePath('/admin/film');
  revalidatePath('/');
  return { success: true, movie };
}

export async function updateMovie(id: string, data: Partial<{
  title: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl: string;
  durationMin: number;
  rating: number;
  status: 'NOW_PLAYING' | 'UPCOMING';
  categoryId: string;
  rottenTomatoes: string;
  metacritic: string;
  cast: string;
  director: string;
  genre: string;
  sections: string;
}>) {
  await requireAdmin();
  const movie = await prisma.movie.update({
    where: { id },
    data: {
      ...data,
      durationMin: data.durationMin ? Number(data.durationMin) : undefined,
      rating: data.rating ? Number(data.rating) : undefined,
      categoryId: data.categoryId || null,
    },
  });
  revalidatePath('/admin/film');
  revalidatePath('/');
  revalidatePath(`/film/${id}`);
  return { success: true, movie };
}

export async function deleteMovie(id: string) {
  await requireAdmin();
  
  // Need to delete related showtimes first if any, but since Prisma doesn't have Cascade set up for showtimes on movie delete by default in our schema, we should do it manually or just delete the movie if no showtimes. Let's delete showtimes first if needed.
  await prisma.seat.deleteMany({ where: { showtime: { movieId: id } } });
  await prisma.showtime.deleteMany({ where: { movieId: id } });
  
  await prisma.movie.delete({ where: { id } });
  revalidatePath('/admin/film');
  revalidatePath('/');
  return { success: true };
}


// ---------------------------------------------------------------------------
// FnB ACTIONS
// ---------------------------------------------------------------------------

export async function createFnB(data: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
}) {
  await requireAdmin();
  const fnb = await prisma.fnBItem.create({
    data: {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      imageUrl: data.imageUrl,
      category: data.category,
      isAvailable: data.isAvailable,
    },
  });
  revalidatePath('/admin/fnb');
  revalidatePath('/cafe');
  return { success: true, fnb };
}

export async function updateFnB(id: string, data: Partial<{
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}>) {
  await requireAdmin();
  const fnb = await prisma.fnBItem.update({
    where: { id },
    data: {
      ...data,
      price: data.price ? Number(data.price) : undefined,
    },
  });
  revalidatePath('/admin/fnb');
  revalidatePath('/cafe');
  return { success: true, fnb };
}

export async function deleteFnB(id: string) {
  await requireAdmin();
  await prisma.fnBItem.delete({ where: { id } });
  revalidatePath('/admin/fnb');
  revalidatePath('/cafe');
  return { success: true };
}
