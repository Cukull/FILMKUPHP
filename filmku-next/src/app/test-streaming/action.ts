'use server';

import axios from 'axios';

export interface SeasonInfo {
  season_number: number;
  name: string;
  episode_count: number;
}

export interface StreamServer {
  id: string;
  name: string;
  label: string;
  url: string;
  badge?: string;
}

export interface StreamDetails {
  tmdbId: number;
  title: string;
  originalTitle?: string;
  releaseDate?: string;
  mediaType: 'movie' | 'tv';
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  seasons?: SeasonInfo[];
  currentSeason: number;
  currentEpisode: number;
  servers: StreamServer[];
}

// Fungsi bantu pembuatan daftar multi-server (VidSrc, VidLink, MultiEmbed, dsb.)
function buildStreamServers(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season: number = 1,
  episode: number = 1,
  country: string = '',
  originalLanguage: string = ''
): StreamServer[] {
  const isChineseDrama =
    mediaType === 'tv' &&
    (['CN', 'TW', 'HK', 'CHN'].includes(country.toUpperCase()) ||
      ['zh', 'cn'].includes(originalLanguage.toLowerCase()));

  if (mediaType === 'tv') {
    if (isChineseDrama) {
      return [
        {
          id: 'vidsrc-dub',
          name: 'VidSrc (Dub Indo / Sulih Suara)',
          label: 'Server 1 • Dub Indo / Sulih Suara',
          url: `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&ds_lang=id&audio=id&autoplay=1`,
          badge: 'Dub Indo / Sulih Suara',
        },
        {
          id: 'vidlink-dub',
          name: 'VidLink (Dubbing ID)',
          label: 'Server 2 • Sulih Suara ID (WeTV/Viu)',
          url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e50914&lang=id&audio=id&autoplay=false`,
          badge: 'Dub Indo',
        },
        {
          id: 'vidsrc-sub',
          name: 'VidSrc (Sub Indo)',
          label: 'Server 3 • Sub Indo (Utama)',
          url: `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&ds_lang=id&autoplay=1`,
          badge: 'Sub Indo',
        },
        {
          id: 'vidlink-sub',
          name: 'VidLink (Sub Indo Fast HD)',
          label: 'Server 4 • Sub Indo Fast HD',
          url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e50914&autoplay=false`,
          badge: 'Sub Indo',
        },
        {
          id: 'multiembed',
          name: 'MultiEmbed',
          label: 'Server 5 • MultiEmbed.mov',
          url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
          badge: 'Alternatif',
        },
        {
          id: 'vidsrccc',
          name: 'VidSrc CC',
          label: 'Server 6 • VidSrc.cc',
          url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
          badge: 'Backup',
        },
      ];
    }

    return [
      {
        id: 'vidsrc',
        name: 'VidSrc (Utama)',
        label: 'Server 1 • VidSrc.ru',
        url: `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&ds_lang=id&autoplay=1`,
        badge: 'Utama',
      },
      {
        id: 'vidlink',
        name: 'VidLink (Fast HD)',
        label: 'Server 2 • VidLink.pro',
        url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e50914&autoplay=false`,
        badge: 'Cepat & HD',
      },
      {
        id: 'multiembed',
        name: 'MultiEmbed',
        label: 'Server 3 • MultiEmbed.mov',
        url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
        badge: 'Alternatif 1',
      },
      {
        id: 'vidsrccc',
        name: 'VidSrc CC',
        label: 'Server 4 • VidSrc.cc',
        url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
        badge: 'Alternatif 2',
      },
      {
        id: '2embed',
        name: '2Embed',
        label: 'Server 5 • 2Embed.cc',
        url: `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
        badge: 'Backup 1',
      },
      {
        id: 'smashy',
        name: 'Smashy Stream',
        label: 'Server 6 • Smashy.stream',
        url: `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`,
        badge: 'Backup 2',
      },
    ];
  } else {
    return [
      {
        id: 'vidsrc',
        name: 'VidSrc (Utama)',
        label: 'Server 1 • VidSrc.ru',
        url: `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}&ds_lang=id&autoplay=1`,
        badge: 'Utama',
      },
      {
        id: 'vidlink',
        name: 'VidLink (Fast HD)',
        label: 'Server 2 • VidLink.pro',
        url: `https://vidlink.pro/movie/${tmdbId}?primaryColor=e50914&autoplay=false`,
        badge: 'Cepat & HD',
      },
      {
        id: 'multiembed',
        name: 'MultiEmbed',
        label: 'Server 3 • MultiEmbed.mov',
        url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        badge: 'Alternatif 1',
      },
      {
        id: 'vidsrccc',
        name: 'VidSrc CC',
        label: 'Server 4 • VidSrc.cc',
        url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
        badge: 'Alternatif 2',
      },
      {
        id: '2embed',
        name: '2Embed',
        label: 'Server 5 • 2Embed.cc',
        url: `https://www.2embed.cc/embed/${tmdbId}`,
        badge: 'Backup 1',
      },
      {
        id: 'smashy',
        name: 'Smashy Stream',
        label: 'Server 6 • Smashy.stream',
        url: `https://player.smashy.stream/movie/${tmdbId}`,
        badge: 'Backup 2',
      },
    ];
  }
}

// Fungsi utama lengkap untuk Film / Drama Korea / Drama China / TV Series + Multi-Server
export async function getStreamingDetails(
  searchQuery: string,
  preferredType?: 'movie' | 'tv',
  season: number = 1,
  episode: number = 1
): Promise<StreamDetails | null> {
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
    let cleanTitle = searchQuery.replace(/\s*\(\d{4}\)\s*/g, '').replace(/\s+\d{4}$/, '').trim();

    // JIKA format judul adalah "Judul Indonesia (Judul Asli)" -> Ekstrak "Judul Asli" untuk pencarian TMDB
    // Contoh: "Toko Pembunuh (A Shop for Killers)" -> akan mengekstrak "A Shop for Killers"
    const parenMatch = cleanTitle.match(/\(([^)]+)\)\s*$/);
    if (parenMatch && parenMatch[1].trim().length > 1 && !/^\d+$/.test(parenMatch[1])) {
      cleanTitle = parenMatch[1].trim();
    }

    console.log(`[getStreamingDetails] Mencari: "${cleanTitle}" | Preferred: ${preferredType || 'AUTO'} | Season: ${season} Ep: ${episode}`);

    // 2. Gunakan endpoint multi search atau specific type search
    let results: any[] = [];
    if (preferredType === 'tv') {
      const tvUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
      const res = await axios.get(tvUrl);
      results = (res.data?.results || []).map((r: any) => ({ ...r, media_type: 'tv' }));
    } else if (preferredType === 'movie') {
      let movieUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
      if (year) movieUrl += `&year=${year}`;
      const res = await axios.get(movieUrl);
      results = (res.data?.results || []).map((r: any) => ({ ...r, media_type: 'movie' }));
    } else {
      // Auto-detect via Multi-Search (Film + TV Series / Drama)
      const multiUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
      const res = await axios.get(multiUrl);
      results = (res.data?.results || []).filter(
        (r: any) => r.media_type === 'movie' || r.media_type === 'tv'
      );
    }

    // Fallback jika kosong dan ada filter year, coba tanpa filter
    if (results.length === 0 && year && preferredType === 'movie') {
      const fallbackUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbApiKey}&language=id-ID`;
      const res = await axios.get(fallbackUrl);
      results = (res.data?.results || []).map((r: any) => ({ ...r, media_type: 'movie' }));
    }

    if (results.length === 0) {
      console.log(`[getStreamingDetails] Judul "${cleanTitle}" tidak ditemukan di TMDB.`);
      return null;
    }

    // Prioritaskan hasil yang cocok tahunnya jika ada
    let bestMatch = results[0];
    if (year) {
      const yearMatched = results.find((item: any) => {
        const dateStr = item.release_date || item.first_air_date || '';
        return dateStr.startsWith(year!);
      });
      if (yearMatched) bestMatch = yearMatched;
    }

    const tmdbId = bestMatch.id;
    const mediaType: 'movie' | 'tv' = bestMatch.media_type === 'tv' ? 'tv' : 'movie';
    const title = bestMatch.title || bestMatch.name || cleanTitle;
    const originalTitle = bestMatch.original_title || bestMatch.original_name || '';
    const releaseDate = bestMatch.release_date || bestMatch.first_air_date || '';
    const overview = bestMatch.overview || '';
    const posterPath = bestMatch.poster_path ? `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}` : undefined;
    const backdropPath = bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/original${bestMatch.backdrop_path}` : undefined;
    const country = bestMatch.origin_country?.[0] || '';
    const originalLanguage = bestMatch.original_language || '';

    let seasons: SeasonInfo[] = [];

    // Jika TV Series / Drama Korea / Drama China, ambil detail season dari TMDB
    if (mediaType === 'tv') {
      try {
        const tvDetailUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${tmdbApiKey}&language=id-ID`;
        const tvRes = await axios.get(tvDetailUrl);
        const rawSeasons = tvRes.data?.seasons || [];
        seasons = rawSeasons
          .filter((s: any) => s.season_number > 0)
          .map((s: any) => ({
            season_number: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            episode_count: s.episode_count || 1,
          }));
        
        // Jika belum ada di list, buat default 1 season 16 episode (standar Drama Korea)
        if (seasons.length === 0) {
          seasons = [{ season_number: 1, name: 'Season 1', episode_count: 16 }];
        }
      } catch (err) {
        console.error('Gagal mengambil detail season TV:', err);
        seasons = [{ season_number: 1, name: 'Season 1', episode_count: 16 }];
      }
    }

    const servers = buildStreamServers(tmdbId, mediaType, season, episode, country, originalLanguage);

    return {
      tmdbId,
      title,
      originalTitle,
      releaseDate,
      mediaType,
      overview,
      posterPath,
      backdropPath,
      seasons: seasons.length > 0 ? seasons : undefined,
      currentSeason: season,
      currentEpisode: episode,
      servers,
    };
  } catch (error) {
    console.error('[getStreamingDetails] Error:', error);
    return null;
  }
}

// Backward compatibility untuk getMovieStreamUrl lama
export async function getMovieStreamUrl(searchQuery: string): Promise<string | null> {
  const details = await getStreamingDetails(searchQuery, 'movie');
  if (details && details.servers.length > 0) {
    return details.servers[0].url;
  }
  return null;
}
