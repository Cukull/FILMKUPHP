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
  revalidatePath('/genre');
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
  revalidatePath('/genre');
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
  revalidatePath('/genre');
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

export async function updateUserRole(userId: string, role: 'ADMIN' | 'USER') {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  revalidatePath('/admin/users');
  return { success: true };
}


// ---------------------------------------------------------------------------
// SHOWTIME ACTIONS
// ---------------------------------------------------------------------------

export async function createShowtime(data: {
  movieId: string;
  startTime: string; // ISO string
  studio: string;
  price?: number;
}) {
  await requireAdmin();
  const showtime = await prisma.showtime.create({
    data: {
      movieId: data.movieId,
      startTime: new Date(data.startTime),
      studio: data.studio,
      price: data.price ?? 50000,
    },
  });
  revalidatePath(`/film/${data.movieId}`);
  revalidatePath('/admin/film');
  return { success: true, showtime };
}

export async function deleteShowtime(id: string, movieId: string) {
  await requireAdmin();
  // Delete seats first
  await prisma.seat.deleteMany({ where: { showtimeId: id } });
  await prisma.showtime.delete({ where: { id } });
    revalidatePath(`/film/${movieId}`);
  revalidatePath('/admin/film');
  return { success: true };
}

// ─────────────────────────────────────────────
// DASHBOARD SECTION (KATEGORI) CRUD
// ─────────────────────────────────────────────
export async function createDashboardSection(data: { name: string; icon: string; order: number }) {
  await requireAdmin();
  const section = await prisma.dashboardSection.create({
    data: {
      name: data.name,
      icon: data.icon,
      order: data.order,
    },
  });
  revalidatePath('/admin/sections');
  revalidatePath('/'); // Revalidate homepage
  return { success: true, section };
}

export async function updateDashboardSection(id: string, data: { name?: string; icon?: string; order?: number }) {
  await requireAdmin();
  const oldSection = await prisma.dashboardSection.findUnique({ where: { id } });
  if (!oldSection) throw new Error("Kategori tidak ditemukan");

  const section = await prisma.dashboardSection.update({
    where: { id },
    data,
  });

  // Sync section names in movies if name changed
  if (data.name && oldSection.name !== data.name) {
    const movies = await prisma.movie.findMany();
    for (const m of movies) {
      if (m.sections && m.sections.includes(oldSection.name)) {
        // Use regex to replace the exact name (surrounded by commas or string boundaries)
        const regex = new RegExp(`(^|,)\\s*${oldSection.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(,|$)`, 'g');
        let newSections = m.sections.replace(regex, (match, p1, p2) => {
           if (p1 === ',' && p2 === ',') return ', ';
           if (p1 === '^' && p2 === '$') return '';
           return p1 === ',' ? ', ' : '';
        }).replace(/,\s*$/, '').replace(/^,\s*/, '').trim();

        // Just a simpler fallback: split, modify, join
        const parts = m.sections.split(',').map(s => s.trim());
        const updatedParts = parts.map(s => s === oldSection.name ? data.name! : s);
        const finalSections = updatedParts.join(', ');

        await prisma.movie.update({
          where: { id: m.id },
          data: { sections: finalSections }
        });
      }
    }
  }

  revalidatePath('/admin/sections');
  revalidatePath('/admin/film');
  revalidatePath('/'); // Revalidate homepage
  return { success: true, section };
}

export async function deleteDashboardSection(id: string) {
  await requireAdmin();
  const oldSection = await prisma.dashboardSection.findUnique({ where: { id } });
  
  if (oldSection) {
    // Remove the section from all movies
    const movies = await prisma.movie.findMany();
    for (const m of movies) {
      if (m.sections && m.sections.includes(oldSection.name)) {
        const parts = m.sections.split(',').map(s => s.trim());
        const updatedParts = parts.filter(s => s !== oldSection.name);
        const finalSections = updatedParts.join(', ');

        await prisma.movie.update({
          where: { id: m.id },
          data: { sections: finalSections }
        });
      }
    }
  }

  await prisma.dashboardSection.delete({ where: { id } });
  revalidatePath('/admin/sections');
  revalidatePath('/admin/film');
  revalidatePath('/'); // Revalidate homepage
  return { success: true };
}

export async function updateDashboardSectionOrders(updates: { id: string; order: number }[]) {
  await requireAdmin();

  // Use a transaction to perform bulk updates reliably
  await prisma.$transaction(
    updates.map((update) =>
      prisma.dashboardSection.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    )
  );

  revalidatePath('/admin/sections');
  revalidatePath('/'); // Revalidate homepage
  return { success: true };
}
