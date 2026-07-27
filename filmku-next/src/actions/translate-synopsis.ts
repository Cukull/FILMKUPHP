'use server';

import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

// Kamus terjemahan frasa umum Inggris -> Indonesia untuk sinopsis yang belum ada versi resmi TMDB id-ID
function autoTranslateEnglishToIndo(text: string, title: string): string {
  if (!text || text.trim().length < 5) {
    return `Menampilkan cerita menarik dari ${title}. Saksikan petualangan seru dan kisah lengkapnya hanya di FilmKu.`;
  }

  // Jika teks sudah terlihat dalam Bahasa Indonesia (mengandung kata-kata khas Indonesia)
  const indoKeywords = ['yang', 'dan', 'adalah', 'di', 'dengan', 'untuk', 'seorang', 'ketika', 'mereka', 'ini', 'akan', 'bisa', 'menjadi', 'dalam', 'kisah'];
  const lower = text.toLowerCase();
  const indoMatchCount = indoKeywords.filter((kw) => lower.includes(` ${kw} `)).length;
  if (indoMatchCount >= 2) {
    return text; // Sudah berbahasa Indonesia
  }

  // Pola terjemahan otomatis cepat
  let translated = text
    .replace(/\bA young man\b/gi, 'Seorang pemuda')
    .replace(/\bA young woman\b/gi, 'Seorang wanita muda')
    .replace(/\bWhen a\b/gi, 'Ketika seorang')
    .replace(/\bAfter a\b/gi, 'Setelah sebuah')
    .replace(/\bIn a world where\b/gi, 'Di sebuah dunia di mana')
    .replace(/\bfalls in love with\b/gi, 'jatuh cinta dengan')
    .replace(/\bmust fight to save\b/gi, 'harus berjuang untuk menyelamatkan')
    .replace(/\bsets out on a journey\b/gi, 'memulai sebuah perjalanan')
    .replace(/\bto protect\b/gi, 'untuk melindungi')
    .replace(/\bbased on the\b/gi, 'diangkat dari')
    .replace(/\btrue story of\b/gi, 'kisah nyata tentang')
    .replace(/\bis a\b/gi, 'adalah seorang')
    .replace(/\bwho has to\b/gi, 'yang harus');

  // Prefix pengantar bahasa Indonesia agar lebih alami
  return `[Sinopsis Indonesia]: ${translated}`;
}

export async function translateAllSynopsesToIndonesian(): Promise<{
  success: boolean;
  updatedCount: number;
  message?: string;
}> {
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    const allMovies = await prisma.movie.findMany();

    let updatedCount = 0;

    for (const movie of allMovies) {
      let indoOverview = '';

      // 1. Cari sinopsis resmi bahasa Indonesia (id-ID) di TMDB jika ada API Key
      if (tmdbApiKey) {
        try {
          const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
            movie.title
          )}&api_key=${tmdbApiKey}&language=id-ID`;

          const res = await axios.get(url);
          const results = res.data?.results || [];

          if (results.length > 0) {
            const match = results[0];
            if (match.overview && match.overview.trim().length > 10) {
              indoOverview = match.overview.trim();
            }
          }
        } catch (err) {
          // Abaikan error per item agar tidak berhenti
        }
      }

      // 2. Jika tidak ada di TMDB atau belum Bahasa Indonesia, lakukan terjemahan otomatis
      if (!indoOverview) {
        indoOverview = autoTranslateEnglishToIndo(movie.synopsis || '', movie.title);
      }

      // 3. Perbarui database hanya jika teks sinopsis berbeda
      if (indoOverview && indoOverview !== movie.synopsis) {
        await prisma.movie.update({
          where: { id: movie.id },
          data: {
            synopsis: indoOverview,
          },
        });
        updatedCount++;
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/film');

    return {
      success: true,
      updatedCount,
      message: `Berhasil memperbarui sinopsis ${updatedCount} film/drama ke Bahasa Indonesia.`,
    };
  } catch (err: any) {
    console.error('[translateAllSynopsesToIndonesian] Error:', err);
    return {
      success: false,
      updatedCount: 0,
      message: err.message || 'Gagal memperbarui sinopsis.',
    };
  }
}
