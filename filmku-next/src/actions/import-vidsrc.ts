'use server';

import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { inferMovieSections } from '@/utils/sectionMatcher';

export interface ImportCandidate {
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterUrl: string;
  backdropUrl?: string;
  rating: number;
  mediaType: 'movie' | 'tv';
  releaseYear: string;
  genres: string;
  trailerUrl?: string;
  country?: string;
  originalLanguage?: string;
  alreadyInDb: boolean;
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action, Adventure',
  10765: 'Science Fiction, Fantasy',
  10768: 'War',
};

function normalizeGenreNames(genreStr?: string | null): string {
  if (!genreStr) return 'Drama';
  const rawList = genreStr.split(',').map((g) => g.trim()).filter(Boolean);
  const normalizedSet = new Set<string>();

  for (const raw of rawList) {
    const lower = raw.toLowerCase();
    if (lower === 'animation' || lower === 'animasi' || lower === 'anime' || lower === 'kartun') {
      normalizedSet.add('Animation');
    } else if (lower === 'action' || lower === 'aksi' || lower === 'aksi & petualangan') {
      normalizedSet.add('Action');
    } else if (lower === 'adventure' || lower === 'petualangan' || lower === 'aksi & petualangan') {
      normalizedSet.add('Adventure');
    } else if (lower === 'comedy' || lower === 'komedi') {
      normalizedSet.add('Comedy');
    } else if (lower === 'crime' || lower === 'kriminal') {
      normalizedSet.add('Crime');
    } else if (lower === 'documentary' || lower === 'dokumenter') {
      normalizedSet.add('Documentary');
    } else if (lower === 'drama' || lower === 'drakor' || lower === 'drachin') {
      normalizedSet.add('Drama');
    } else if (lower === 'family' || lower === 'keluarga') {
      normalizedSet.add('Family');
    } else if (lower === 'fantasy' || lower === 'fantasi' || lower === 'sci-fi & fantasi') {
      normalizedSet.add('Fantasy');
    } else if (lower === 'horror' || lower === 'horor') {
      normalizedSet.add('Horror');
    } else if (lower === 'mystery' || lower === 'misteri') {
      normalizedSet.add('Mystery');
    } else if (lower === 'romance' || lower === 'romantis' || lower === 'percintaan') {
      normalizedSet.add('Romance');
    } else if (lower === 'science fiction' || lower === 'sci-fi' || lower === 'fiksi ilmiah' || lower === 'sci-fi & fantasi') {
      normalizedSet.add('Science Fiction');
    } else if (lower === 'thriller' || lower === 'menegangkan') {
      normalizedSet.add('Thriller');
    } else if (lower === 'war' || lower === 'perang' || lower === 'perang & politik') {
      normalizedSet.add('War');
    } else if (lower === 'western' || lower === 'koboi') {
      normalizedSet.add('Western');
    } else {
      normalizedSet.add(raw.charAt(0).toUpperCase() + raw.slice(1));
    }
  }

  if (normalizedSet.size === 0) return 'Drama';
  return Array.from(normalizedSet).join(', ');
}

function formatGenres(genreIds?: number[]): string {
  if (!genreIds || genreIds.length === 0) return 'Drama';
  const names: string[] = [];
  for (const id of genreIds) {
    const mapped = TMDB_GENRE_MAP[id];
    if (mapped) {
      mapped.split(',').forEach((g) => {
        const trimmed = g.trim();
        if (trimmed && !names.includes(trimmed)) names.push(trimmed);
      });
    }
  }
  return names.length > 0 ? names.slice(0, 4).join(', ') : 'Drama';
}

function parseDbTitle(raw: string): { cleanTitle: string; year?: string } {
  const trimmed = raw.toLowerCase().trim();
  const match = trimmed.match(/^(.*?)\s*\((\d{4})\)$/) || trimmed.match(/^(.*?)\s+(\d{4})$/);
  if (match) {
    return { cleanTitle: match[1].trim(), year: match[2] };
  }
  return { cleanTitle: trimmed };
}

// Fungsi cerdas akurat untuk membedakan judul yang sama (seperti 5 judul "Bleach" atau "Supergirl")
// agar hanya film yang benar-benar sama yang bertanda "Sudah di Database"
function isMovieAlreadyInDb(
  candidate: {
    title: string;
    originalTitle?: string;
    releaseYear?: string;
    posterUrl?: string;
    overview?: string;
  },
  existingMovies: { title: string; posterUrl?: string | null; synopsis?: string | null }[]
): boolean {
  const cTitle = (candidate.title || '').toLowerCase().trim();
  const cOrig = (candidate.originalTitle || '').toLowerCase().trim();
  const cYear = candidate.releaseYear || '';

  return existingMovies.some((dbM) => {
    const rawDbTitle = (dbM.title || '').toLowerCase().trim();
    const { cleanTitle: dbTitle, year: dbYear } = parseDbTitle(rawDbTitle);

    // 1. Cek poster TMDB: jika kedua poster ada, bandingkan nama file gambarnya (misal "2EewmxX.jpg")
    if (candidate.posterUrl && dbM.posterUrl && dbM.posterUrl.trim() !== '') {
      const getFilename = (url: string) => url.split('/').pop()?.split('?')[0] || url;
      const cFile = getFilename(candidate.posterUrl);
      const dbFile = getFilename(dbM.posterUrl);
      // Jika file gambar posternya persis sama -> pasti film/series yang sama!
      if (cFile && dbFile && cFile.length > 5 && cFile === dbFile) {
        return true;
      }
      // Jika judul utama sama persis TAPI file poster TMDB berbeda -> pasti dua film/series berbeda (contoh: Bleach 2004 vs Bleach 2018)!
      if (
        cFile &&
        dbFile &&
        cFile !== dbFile &&
        (dbTitle === cTitle || (cOrig && dbTitle === cOrig))
      ) {
        return false;
      }
    }

    // 2. Cek judul utama
    const titleMatches = dbTitle === cTitle || (cOrig && dbTitle === cOrig);
    if (!titleMatches) return false;

    // 3. Jika judul sama dan ada tahun, pastikan tahun rilis cocok
    if (dbYear && cYear && dbYear !== cYear) {
      return false; // Judul sama tapi tahun beda -> film berbeda!
    }

    // 4. Jika judul utama sama persis dan tidak ada bukti poster/tahun bahwa itu film berbeda, anggap sudah ada
    return true;
  });
}


const KNOWN_INDO_TITLES_BY_ID: Record<number, string> = {
  237020: 'Ruang Kuliah (Lecture Room)',
  303084: 'Terlalu Dalam (Deep In)',
  93120: 'Visi Phoenix (Phoenix Vision)',
  5811: '3000 Pertanyaan Kucing Biru',
  289139: 'Terlalu Dalam',
  216390: "Perjalanan Keabadian (A Mortal's Journey to Immortality)",
  155513: 'Halo, Sabtu (Hello, Saturday)',
  46261: 'Kedatangan Kangxi (Kangxi Coming)',
  139659: 'Ratu Air Mata (Queen of Tears)',
  93405: 'Permainan Cumi (Squid Game)',
  99966: 'Semua Kita Mati (All of Us Are Dead)',
  114410: 'Manusia Gergaji (Chainsaw Man)',
  209867: 'Frieren: Setelah Akhir Perjalanan',
  237330: 'Solo Leveling',
  240411: 'Dan Da Dan',
  95557: 'Tak Terkalahkan (Invincible)',
  204082: 'Lari Bersama Sun-jae (Lovely Runner)',
  222289: 'Nikahi Suamiku (Marry My Husband)',
  119051: 'Wednesday',
  212852: 'Kau Adalah Hasratku (You Are Desire)',
  235332: 'Lautan Bunga (The Sea of Flowers)',
  105971: 'Kemuliaan (The Glory)',
};

function translateEnglishTitleToIndo(en?: string | null): string {
  if (!en || en.trim().length === 0) return 'Drama Asia Terpopuler';
  const trimmed = en.trim();

  const customMap: Record<string, string> = {
    'The Swarm': 'Kawanan (The Swarm)',
    'Manager Kim': 'Manajer Kim (Manager Kim)',
    'A Shop for Killers': 'Toko Pembunuh (A Shop for Killers)',
    'Spellbound': 'Romansa Menakutkan (Spellbound)',
    'Chilling Romance': 'Romansa Menakutkan (Chilling Romance)',
    'Queen of Tears': 'Ratu Air Mata (Queen of Tears)',
    'Squid Game': 'Permainan Cumi (Squid Game)',
    'Crash Landing on You': 'Mendarat di Hatimu (Crash Landing on You)',
    'The Glory': 'Kemuliaan (The Glory)',
    'Lovely Runner': 'Lari Bersama Sun-jae (Lovely Runner)',
    'Marry My Husband': 'Nikahi Suamiku (Marry My Husband)',
    'Moving': 'Bergerak (Moving)',
    'Itaewon Class': 'Kelas Itaewon (Itaewon Class)',
    'Sweet Home': 'Rumah Manis (Sweet Home)',
    'Weak Hero Class 1': 'Pahlawan Lemah (Weak Hero)',
    'All of Us Are Dead': 'Semua Kita Mati (All of Us Are Dead)',
    'Kingdom': 'Kerajaan (Kingdom)',
    'You Are Desire': 'Kau Adalah Hasratku (You Are Desire)',
    'The Sea of Flowers': 'Lautan Bunga (The Sea of Flowers)',
    'Candle in the Tomb': 'Lilin di Makam (Candle in the Tomb)',
    'Hello Saturday': 'Halo Sabtu (Hello Saturday)',
    'Hello, Saturday': 'Halo, Sabtu (Hello, Saturday)',
    "A Record of a Mortal's Journey to Immortality": 'Perjalanan Menuju Keabadian (A Mortal\'s Journey to Immortality)',
    'Kangxi Coming': 'Kedatangan Kangxi (Kangxi Coming)',
  };
  if (customMap[trimmed]) return customMap[trimmed];

  let t = trimmed
    .replace(/\bLove in the Air\b/gi, 'Cinta di Udara')
    .replace(/\bLove Between Fairy and Devil\b/gi, 'Cinta Peri dan Iblis')
    .replace(/\bThe Untamed\b/gi, 'Tak Terkendali (The Untamed)')
    .replace(/\bHidden Love\b/gi, 'Cinta Tersembunyi (Hidden Love)')
    .replace(/\bLegend of\b/gi, 'Legenda')
    .replace(/\bJourney to\b/gi, 'Perjalanan Menuju')
    .replace(/\bImmortal(ity)?\b/gi, 'Keabadian')
    .replace(/\bQueen of\b/gi, 'Ratu')
    .replace(/\bTears\b/gi, 'Air Mata')
    .replace(/\bHero\b/gi, 'Pahlawan')
    .replace(/\bSecret\b/gi, 'Rahasia')
    .replace(/\bStory\b/gi, 'Kisah')
    .replace(/\bKing\b/gi, 'Raja')
    .replace(/\bPrincess\b/gi, 'Putri');

  if (t !== trimmed && t.length > 3) {
    return `${t} (${trimmed})`;
  }
  return trimmed;
}

function resolveReadableIndoTitle(item: any, enItem?: any): string {
  if (item.id && KNOWN_INDO_TITLES_BY_ID[item.id]) {
    return KNOWN_INDO_TITLES_BY_ID[item.id];
  }
  const rawIdTitle = item.title || item.name || '';
  const hasNonLatin = /[\u4e00-\u9fff\uac00-\ud7af\u3040-\u30ff]/.test(rawIdTitle);
  if (!hasNonLatin && rawIdTitle.trim().length > 0) {
    return rawIdTitle;
  }

  const enTitle = enItem ? (enItem.title || enItem.name || '') : '';
  if (enTitle && !/[\u4e00-\u9fff\uac00-\ud7af\u3040-\u30ff]/.test(enTitle)) {
    return translateEnglishTitleToIndo(enTitle);
  }
  return translateEnglishTitleToIndo(item.original_title || item.original_name || rawIdTitle);
}

// 1. Ambil daftar Trending / Populer dari TMDB (Drakor, Drachin, Film, atau Semua) - 40 item per halaman
export async function getTrendingToImport(
  category: 'all' | 'drakor' | 'drachin' | 'movie',
  page: number = 1
): Promise<ImportCandidate[]> {
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY tidak ditemukan di .env');
      return [];
    }

    // Ambil 2 halaman sekaligus agar mendapat 40 item
    const pageA = page * 2 - 1;
    const pageB = page * 2;

    const buildUrl = (p: number, lang: string = 'id-ID') => {
      if (category === 'drakor') {
        return `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&language=${lang}&with_original_language=ko&sort_by=popularity.desc&page=${p}`;
      } else if (category === 'drachin') {
        return `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&language=${lang}&with_original_language=zh&sort_by=popularity.desc&page=${p}`;
      } else if (category === 'movie') {
        return `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=${lang}&page=${p}`;
      }
      return `https://api.themoviedb.org/3/trending/all/week?api_key=${tmdbApiKey}&language=${lang}&page=${p}`;
    };

    const [resA, resB, resA_EN, resB_EN] = await Promise.all([
      axios.get(buildUrl(pageA, 'id-ID')),
      axios.get(buildUrl(pageB, 'id-ID')),
      axios.get(buildUrl(pageA, 'en-US')),
      axios.get(buildUrl(pageB, 'en-US')),
    ]);

    const rawResults = [
      ...(resA.data?.results || []),
      ...(resB.data?.results || []),
    ];

    const enMap = new Map<number, any>();
    [...(resA_EN.data?.results || []), ...(resB_EN.data?.results || [])].forEach((item: any) => {
      if (item.id) enMap.set(item.id, item);
    });

    // Cek film mana saja yang sudah ada di database Prisma kita (berdasarkan poster & judul)
    const existingMovies = await prisma.movie.findMany({
      select: { title: true, posterUrl: true, synopsis: true },
    });

    // Filter duplikat ID dari TMDB
    const seenIds = new Set();
    const results = rawResults.filter((item: any) => {
      if (!item.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return item.title || item.name;
    });

    const candidates: ImportCandidate[] = results.map((item: any) => {
      const title = resolveReadableIndoTitle(item, enMap.get(item.id));
      // originalTitle: preferensikan judul Inggris dari enMap (untuk pencarian TMDB saat streaming)
      // Fallback ke original_name/original_title jika tidak ada judul Inggris
      const enItem = enMap.get(item.id);
      const enTitle = enItem ? (enItem.title || enItem.name || '') : '';
      const rawOriginal = item.original_title || item.original_name || '';
      // Pakai en-US title jika tidak mengandung aksara non-Latin, agar streaming bisa cari TMDB
      const hasNonLatinEn = /[\u4e00-\u9fff\uac00-\ud7af\u3040-\u30ff]/.test(enTitle);
      const originalTitle = (!hasNonLatinEn && enTitle) ? enTitle : rawOriginal;
      const dateStr = item.release_date || item.first_air_date || '';
      const releaseYear = dateStr ? dateStr.split('-')[0] : '2025';
      const posterUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '';
      const backdropUrl = item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : undefined;
      const rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : 8.5;
      const mediaType =
        item.media_type === 'tv' || category === 'drakor' || category === 'drachin'
          ? 'tv'
          : 'movie';
      const genres = formatGenres(item.genre_ids);
      const country =
        category === 'drakor'
          ? 'KR'
          : category === 'drachin'
          ? 'CN'
          : item.origin_country?.[0] || '';
      const originalLanguage =
        category === 'drakor'
          ? 'ko'
          : category === 'drachin'
          ? 'zh'
          : item.original_language || '';

      return {
        tmdbId: item.id,
        title,
        originalTitle,
        overview:
          item.overview ||
          `Menampilkan cerita menarik dari ${title}. Saksikan streaming lengkap di FilmKu.`,
        posterUrl,
        backdropUrl,
        rating,
        mediaType,
        releaseYear,
        genres,
        country,
        originalLanguage,
        alreadyInDb: isMovieAlreadyInDb(
          { title, originalTitle, releaseYear, posterUrl, overview: item.overview },
          existingMovies
        ),
      };
    });

    return candidates;
  } catch (err) {
    console.error('[getTrendingToImport] Error:', err);
    return [];
  }
}

// 2. Cari film/drama spesifik via kata kunci untuk di-import (mendukung paginasi 40 item)
export async function searchTmdbForImport(
  query: string,
  page: number = 1
): Promise<ImportCandidate[]> {
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey || !query.trim()) return [];

    const pageA = page * 2 - 1;
    const pageB = page * 2;

    const buildUrl = (p: number, lang: string = 'id-ID') =>
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        query
      )}&api_key=${tmdbApiKey}&language=${lang}&page=${p}`;

    const [resA, resB, resA_EN, resB_EN] = await Promise.all([
      axios.get(buildUrl(pageA, 'id-ID')),
      axios.get(buildUrl(pageB, 'id-ID')),
      axios.get(buildUrl(pageA, 'en-US')),
      axios.get(buildUrl(pageB, 'en-US')),
    ]);

    const rawResults = [
      ...(resA.data?.results || []),
      ...(resB.data?.results || []),
    ];

    const enMap = new Map<number, any>();
    [...(resA_EN.data?.results || []), ...(resB_EN.data?.results || [])].forEach((item: any) => {
      if (item.id) enMap.set(item.id, item);
    });

    const existingMovies = await prisma.movie.findMany({
      select: { title: true, posterUrl: true, synopsis: true },
    });

    const seenIds = new Set();
    const results = rawResults.filter((item: any) => {
      if (!item.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return (item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name);
    });

    const candidates: ImportCandidate[] = results.map((item: any) => {
      const title = resolveReadableIndoTitle(item, enMap.get(item.id));
      // originalTitle: preferensikan judul Inggris dari enMap (untuk pencarian TMDB saat streaming)
      // Fallback ke original_name/original_title jika tidak ada judul Inggris
      const enItem = enMap.get(item.id);
      const enTitle = enItem ? (enItem.title || enItem.name || '') : '';
      const rawOriginal = item.original_title || item.original_name || '';
      // Pakai en-US title jika tidak mengandung aksara non-Latin, agar streaming bisa cari TMDB
      const hasNonLatinEn = /[\u4e00-\u9fff\uac00-\ud7af\u3040-\u30ff]/.test(enTitle);
      const originalTitle = (!hasNonLatinEn && enTitle) ? enTitle : rawOriginal;
      const dateStr = item.release_date || item.first_air_date || '';
      const releaseYear = dateStr ? dateStr.split('-')[0] : '2025';
      const posterUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '';
      const backdropUrl = item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : undefined;
      const rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : 8.5;
      const mediaType: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie';
      const genres = formatGenres(item.genre_ids);
      const country = item.origin_country?.[0] || '';
      const originalLanguage = item.original_language || '';

      return {
        tmdbId: item.id,
        title,
        originalTitle,
        overview: item.overview || `Sinopsis belum tersedia untuk ${title}.`,
        posterUrl,
        backdropUrl,
        rating,
        mediaType,
        releaseYear,
        genres,
        country,
        originalLanguage,
        alreadyInDb: isMovieAlreadyInDb(
          { title, originalTitle, releaseYear, posterUrl, overview: item.overview },
          existingMovies
        ),
      };
    });

    return candidates;
  } catch (err) {
    console.error('[searchTmdbForImport] Error:', err);
    return [];
  }
}

// 3. Simpan otomatis (Auto-Import) judul terpilih dari TMDB & VidSrc ke database Prisma
export async function importMovieToDatabase(candidate: {
  title: string;
  originalTitle?: string;   // Judul asli (Inggris/Korea/China) — dipakai untuk pencarian TMDB streaming
  synopsis: string;
  posterUrl: string;
  rating: number;
  genre: string;
  mediaType: 'movie' | 'tv';
  releaseYear: string;
  durationMin?: number;
  tmdbId?: number;
  trailerUrl?: string;
  country?: string;
  originalLanguage?: string;
}): Promise<{ success: boolean; message?: string; movie?: any }> {
  try {
    // Cek apakah FILM KANDIDAT INI sudah ada di database
    const existingMovies = await prisma.movie.findMany({
      select: { title: true, posterUrl: true, synopsis: true },
    });
    if (
      isMovieAlreadyInDb(
        {
          title: candidate.title,
          releaseYear: candidate.releaseYear,
          posterUrl: candidate.posterUrl,
          overview: candidate.synopsis,
        },
        existingMovies
      )
    ) {
      return { success: false, message: `"${candidate.title}" sudah ada di database kamu.` };
    }

    let finalTitle = candidate.title;
    const sameTitleExists = existingMovies.some(
      (m) => m.title.toLowerCase().trim() === candidate.title.toLowerCase().trim()
    );
    if (sameTitleExists && candidate.releaseYear) {
      finalTitle = `${candidate.title} (${candidate.releaseYear})`;
    }

    let cleanGenres = normalizeGenreNames(candidate.genre);
    let trailerUrl = candidate.trailerUrl || '';
    let durationMin = candidate.durationMin || (candidate.mediaType === 'tv' ? 45 : 115);
    let country = candidate.country || '';
    let originalLanguage = candidate.originalLanguage || '';
    let synopsis = candidate.synopsis || `Saksikan kisah seru dari ${candidate.title}.`;
    let rating = candidate.rating || 8.5;

    // Jika ada tmdbId & API key, ambil data detail resmi (runtime, trailer, genre, origin country)
    if (candidate.tmdbId && process.env.TMDB_API_KEY) {
      try {
        const tmdbRes = await axios.get(
          `https://api.themoviedb.org/3/${candidate.mediaType}/${candidate.tmdbId}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              append_to_response: 'videos',
            },
          }
        );
        const detail = tmdbRes.data;
        if (detail) {
          // Durasi asli
          if (candidate.mediaType === 'movie' && detail.runtime && detail.runtime > 0) {
            durationMin = detail.runtime;
          } else if (
            candidate.mediaType === 'tv' &&
            detail.episode_run_time &&
            detail.episode_run_time.length > 0 &&
            detail.episode_run_time[0] > 0
          ) {
            durationMin = detail.episode_run_time[0];
          }

          // Genre standar Inggris dari TMDB
          if (detail.genres && Array.isArray(detail.genres) && detail.genres.length > 0) {
            const rawGenreNames = detail.genres.map((g: any) => g.name).join(', ');
            cleanGenres = normalizeGenreNames(rawGenreNames);
          }

          // Country & Language
          if (detail.origin_country && detail.origin_country.length > 0) {
            country = detail.origin_country[0];
          }
          if (detail.original_language) {
            originalLanguage = detail.original_language;
          }

          // Sinopsis jika yang awal kosong
          if (!synopsis || synopsis.includes('Sinopsis belum tersedia')) {
            synopsis = detail.overview || synopsis;
          }

          // Trailer resmi YouTube
          if (!trailerUrl && detail.videos?.results) {
            const results = detail.videos.results;
            const trailer =
              results.find(
                (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
              ) || results.find((v: any) => v.site === 'YouTube');
            if (trailer && trailer.key) {
              trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }
          }
        }
      } catch (e) {
        console.warn('[importMovieToDatabase] Gagal ambil detail TMDB:', e);
      }
    }

    const genresList = cleanGenres.split(',').map((g: string) => g.trim());
    const inferred = inferMovieSections({
      title: finalTitle,
      genres: genresList,
      synopsis: synopsis,
      country: country,
      originalLanguage: originalLanguage,
      mediaType: candidate.mediaType || 'movie',
      rating: rating,
    });
    const sections = inferred.join(', ');

    // Hitung persentase Rotten Tomatoes & Metacritic realistis dari rating
    const rtScore = Math.min(99, Math.max(65, Math.round(rating * 10 + 6))) + '%';
    const mcScore = Math.min(95, Math.max(60, Math.round(rating * 9 + 5))).toString();

    // Simpan judul asli untuk pencarian TMDB saat streaming
    // Prioritas: judul asli dari TMDB (original_name/original_title), atau ekstrak dari format "Indo (Asli)"
    let storedOriginalTitle = candidate.originalTitle || '';
    if (!storedOriginalTitle && finalTitle.includes('(')) {
      // Ekstrak judul dalam tanda kurung jika ada format "Judul Indo (Original Title)"
      const parenMatch = finalTitle.match(/\(([^)]+)\)$/);
      if (parenMatch) storedOriginalTitle = parenMatch[1];
    }
    if (!storedOriginalTitle) storedOriginalTitle = finalTitle;

    const newMovie = await prisma.movie.create({
      data: {
        title: finalTitle,
        originalTitle: storedOriginalTitle,
        synopsis: synopsis,
        posterUrl: candidate.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
        trailerUrl: trailerUrl,
        durationMin: durationMin,
        rating: rating,
        status: 'NOW_PLAYING',
        genre: cleanGenres || 'Drama',
        sections: sections || 'Top Bulan Ini, Film Terbaru',
        rottenTomatoes: rtScore,
        metacritic: mcScore,
      },
    });

    revalidatePath('/admin/film');
    revalidatePath('/');
    revalidatePath('/genre');

    return { success: true, movie: newMovie };
  } catch (err: any) {
    console.error('[importMovieToDatabase] Error:', err);
    return { success: false, message: err.message || 'Gagal menyimpan ke database' };
  }
}
