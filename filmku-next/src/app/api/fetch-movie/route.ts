import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const tmdbKey = process.env.TMDB_API_KEY;
  const omdbKey = process.env.OMDB_API_KEY;

  if (!tmdbKey || !omdbKey) {
    return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
  }

  try {
    const tmdbSearchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        title
      )}&api_key=${tmdbKey}&language=id-ID`
    );
    const tmdbSearchData = await tmdbSearchRes.json();
    const tmdbMovie = tmdbSearchData.results?.[0];

    let cast = [];
    let crew = [];
    let posterUrl = '';

    if (tmdbMovie) {
      posterUrl = tmdbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${tmdbMovie.poster_path}`
        : '';

      const tmdbCreditsRes = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbMovie.id}/credits?api_key=${tmdbKey}`
      );
      const tmdbCreditsData = await tmdbCreditsRes.json();

      cast = (tmdbCreditsData.cast || []).slice(0, 10).map((c: any) => ({
        name: c.name,
        role: c.character,
        imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : ''
      }));

      crew = (tmdbCreditsData.crew || [])
        .filter((c: any) => c.job === 'Director' || c.job === 'Producer' || c.department === 'Directing')
        .slice(0, 5)
        .map((c: any) => ({
          name: c.name,
          role: c.job,
          imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : ''
        }));
    }

    const omdbRes = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbKey}`
    );
    const omdbData = await omdbRes.json();

    let durationMin = null;
    let rating = null;
    let rottenTomatoes = '';
    let metacritic = '';
    let synopsis = '';

    if (omdbData.Response === 'True') {
      const runtimeStr = omdbData.Runtime;
      if (runtimeStr && runtimeStr !== 'N/A') {
        const match = runtimeStr.match(/(\d+)/);
        if (match) durationMin = parseInt(match[1], 10);
      }

      if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
        rating = parseFloat(omdbData.imdbRating);
      }

      const rtScore = omdbData.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
      if (rtScore) rottenTomatoes = rtScore.Value;

      if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
        metacritic = `${omdbData.Metascore}/100`;
      }

      if (omdbData.Plot && omdbData.Plot !== 'N/A') {
        synopsis = omdbData.Plot;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        posterUrl,
        cast: JSON.stringify(cast),
        director: JSON.stringify(crew),
        durationMin,
        rating,
        rottenTomatoes,
        metacritic,
        synopsis: synopsis || tmdbMovie?.overview || '',
      }
    });

  } catch (error) {
    console.error('Error fetching movie data:', error);
    return NextResponse.json({ error: 'Failed to fetch movie data' }, { status: 500 });
  }
}
