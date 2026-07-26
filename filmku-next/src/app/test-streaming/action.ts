'use server';

import axios from 'axios';

export async function getMovieStreamUrl(searchQuery: string) {
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY tidak ditemukan di .env');
      return null;
    }

    // 1. Ekstrak tahun jika ada format "(1995)" atau "1995"
    let year: string | null = null;
    const yearMatch = searchQuery.match(/\((\d{4})\)/) || searchQuery.match(/\s+(\d{4})$/);
    if (yearMatch) {
      year = yearMatch[1];
    }

    // Bersihkan judul dari tahun untuk kata kunci pencarian TMDB
    const cleanTitle = searchQuery.replace(/\s*\(\d{4}\)\s*/g, '').replace(/\s+\d{4}$/, '').trim();

    console.log(`Mencari ID TMDB untuk judul: "${cleanTitle}" ${year ? `(Tahun: ${year})` : ''}`);

    // 2. Langkah 1: Cari dengan filter tahun (&year=...) agar tepat sasaran (misal Toy Story 1995 tidak tertukar Toy Story 5)
    let searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
    if (year) {
      searchUrl += `&year=${year}`;
    }

    let res = await axios.get(searchUrl);
    let results = res.data?.results || [];

    // 3. Langkah 2 (Fallback): Jika tidak ditemukan dengan filter tahun yang ketat, cari tanpa filter tahun
    if (results.length === 0 && year) {
      console.log(`Tidak ditemukan dengan filter year=${year}, mencoba pencarian tanpa filter tahun...`);
      const fallbackUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
      res = await axios.get(fallbackUrl);
      results = res.data?.results || [];
    }

    if (results.length > 0) {
      // Prioritaskan hasil yang tahun release_date-nya cocok jika ada beberapa hasil
      let bestMatch = results[0];
      if (year) {
        const yearMatchedMovie = results.find((m: any) => 
          m.release_date && m.release_date.startsWith(year)
        );
        if (yearMatchedMovie) {
          bestMatch = yearMatchedMovie;
        }
      }

      const tmdbId = bestMatch.id;
      console.log(`Berhasil mendapatkan TMDB ID: ${tmdbId} untuk film "${bestMatch.title}" (${bestMatch.release_date})`);

      // Menggunakan server global vidsrc.me dengan TMDB ID yang tepat
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    }

    console.log('Film tidak ditemukan di database TMDB.');
    return null;
  } catch (error) {
    console.error('Error saat fetch TMDB:', error);
    return null;
  }
}
