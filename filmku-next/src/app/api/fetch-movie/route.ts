import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const tmdbKey = process.env.TMDB_API_KEY || 'b34956eaa87450c0f9dd7817a69dc555';
  const omdbKey = process.env.OMDB_API_KEY || '65bbf102';

  // Extract year like "(1995)" or "1995"
  let year: string | null = null;
  const yearMatch = title.match(/\((\d{4})\)/) || title.match(/\s+(\d{4})$/);
  if (yearMatch) {
    year = yearMatch[1];
  }
  // Strip year like "(2014)" or "2014" from title for cleaner TMDB/OMDB search
  let cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, '').replace(/\s+\d{4}$/, '').trim();

  // JIKA format judul adalah "Judul Indonesia (Judul Asli)" -> Ekstrak "Judul Asli" untuk pencarian TMDB
  const parenMatch = cleanTitle.match(/\(([^)]+)\)\s*$/);
  if (parenMatch && parenMatch[1].trim().length > 1 && !/^\d+$/.test(parenMatch[1])) {
    cleanTitle = parenMatch[1].trim();
  }

  try {
    // ─── TMDB: poster + cast + crew ────────────────────────────
    let tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbKey}&language=id-ID`;
    if (year) {
      tmdbUrl += `&year=${year}`;
    }
    const tmdbSearchRes = await fetch(tmdbUrl);
    const tmdbSearchData = await tmdbSearchRes.json();
    let tmdbMovie = tmdbSearchData.results?.[0];
    if (!tmdbMovie && year) {
      const fallbackRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&api_key=${tmdbKey}&language=id-ID`
      );
      const fallbackData = await fallbackRes.json();
      tmdbMovie = fallbackData.results?.[0];
    }

    let cast: any[] = [];
    let crew: any[] = [];
    let posterUrl = '';
    let trailerUrl = '';
    let tmdbRuntime: number | null = null;
    let genre = '';
    let tmdbOverview = '';
    let tmdbCountry = '';

    if (tmdbMovie) {
      posterUrl = tmdbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${tmdbMovie.poster_path}`
        : '';

      // Get credits
      const tmdbCreditsRes = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/credits?api_key=${tmdbKey}`
      );
      const tmdbCreditsData = await tmdbCreditsRes.json();

      cast = (tmdbCreditsData.cast || []).slice(0, 10).map((c: any) => ({
        tmdbId: c.id,
        name: c.name,
        role: c.character,
        imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : '',
      }));

      crew = (tmdbCreditsData.crew || [])
        .filter((c: any) => c.job === 'Director' || c.job === 'Producer' || c.department === 'Directing')
        .slice(0, 5)
        .map((c: any) => ({
          tmdbId: c.id,
          name: c.name,
          role: c.job,
          imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : '',
        }));

      // Get full movie details for runtime + genres from TMDB
      const tmdbDetailRes = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${tmdbKey}&language=id-ID`
      );
      const tmdbDetailData = await tmdbDetailRes.json();
      if (tmdbDetailData.runtime && tmdbDetailData.runtime > 0) {
        tmdbRuntime = tmdbDetailData.runtime;
      }
      if (tmdbDetailData.genres && tmdbDetailData.genres.length > 0) {
        genre = tmdbDetailData.genres.map((g: any) => g.name).join(', ');
      }
      if (tmdbDetailData.overview) {
        tmdbOverview = tmdbDetailData.overview;
      }
      if (tmdbDetailData.origin_country && tmdbDetailData.origin_country.length > 0) {
        tmdbCountry = tmdbDetailData.origin_country[0];
      }

      // Get official trailer from TMDB videos endpoint (no rickroll fallback)
      try {
        const tmdbVideosRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/videos?api_key=${tmdbKey}`
        );
        const tmdbVideosData = await tmdbVideosRes.json();
        const results = tmdbVideosData.results || [];
        const trailer = results.find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        ) || results.find((v: any) => v.site === 'YouTube');
        if (trailer && trailer.key) {
          trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
        }
      } catch (e) {
        console.warn('TMDB video fetch failed:', e);
      }
    }

    // ─── OMDB: rating + RT + metacritic + synopsis + runtime + genre ────
    // Try with clean title first, then with year if available
    const yearMatch = title.match(/\((\d{4})\)/);
    const omdbYear = yearMatch ? `&y=${yearMatch[1]}` : '';
    const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(cleanTitle)}${omdbYear}&apikey=${omdbKey}`;

    const omdbRes = await fetch(omdbUrl);
    const omdbData = await omdbRes.json();

    let durationMin: number | null = null;
    let rating: number | null = null;
    let rottenTomatoes = '';
    let metacritic = '';
    let synopsis = '';

    if (omdbData.Response === 'True') {
      // Runtime
      const runtimeStr = omdbData.Runtime;
      if (runtimeStr && runtimeStr !== 'N/A') {
        const match = runtimeStr.match(/(\d+)/);
        if (match) durationMin = parseInt(match[1], 10);
      }

      // Genre (Use OMDB to ensure English output)
      if (omdbData.Genre && omdbData.Genre !== 'N/A') {
        genre = omdbData.Genre;
      }

      // IMDb Rating
      if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
        rating = parseFloat(omdbData.imdbRating);
      }

      // Rotten Tomatoes
      const rtScore = omdbData.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
      if (rtScore) rottenTomatoes = rtScore.Value;

      // Metacritic
      if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
        metacritic = `${omdbData.Metascore}/100`;
      }

      // Synopsis
      if (omdbData.Plot && omdbData.Plot !== 'N/A') {
        synopsis = omdbData.Plot;
      }
    }

    // Fallback: use TMDB runtime if OMDB didn't return one
    if (!durationMin && tmdbRuntime) {
      durationMin = tmdbRuntime;
    }

    return NextResponse.json({
      success: true,
      data: {
        posterUrl,
        trailerUrl,
        cast: JSON.stringify(cast),
        director: JSON.stringify(crew),
        durationMin,
        rating,
        rottenTomatoes,
        metacritic,
        synopsis: tmdbOverview || tmdbMovie?.overview || synopsis || '',
        genre,
        country: tmdbCountry,
        omdbFound: omdbData.Response === 'True',
      },
    });
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return NextResponse.json({ error: 'Gagal mengambil data film. Coba lagi.' }, { status: 500 });
  }
}
