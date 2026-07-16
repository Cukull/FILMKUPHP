'use server';

import { prisma } from "@/lib/prisma";

export async function getMoviesByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  
  return prisma.movie.findMany({
    where: {
      id: { in: ids }
    },
    include: {
      category: true
    }
  });
}
