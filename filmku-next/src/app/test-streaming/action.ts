'use server';

import axios from 'axios';

export async function getMovieStreamUrl(searchQuery: string) {
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY tidak ditemukan di .env');
      return null;
    }

    // Karena film yang diminta kadang memiliki format tahun misal "Toy Story 5 (2026)", 
    // kita bersihkan dulu judulnya untuk pencarian TMDB
    let cleanTitle = searchQuery.replace(/\s*\(\d{4}\)\s*/g, '').trim();

    console.log(`Mencari ID TMDB untuk judul: ${cleanTitle}`);

    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
    const res = await axios.get(searchUrl);
    
    if (res.data && res.data.results && res.data.results.length > 0) {
      // Ambil hasil pertama yang paling relevan
      const movie = res.data.results[0];
      const tmdbId = movie.id;
      
      console.log(`Berhasil mendapatkan TMDB ID: ${tmdbId} untuk film ${movie.title}`);
      
      // Menggunakan server global vidsrc.me yang kebal blokir localhost
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    }

    console.log('Film tidak ditemukan di database TMDB.');
    return null;
  } catch (error) {
    console.error('Error saat fetch TMDB:', error);
    return null;
  }
}
