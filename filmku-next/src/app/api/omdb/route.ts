import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OMDB API Key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
    const data = await res.json();

    if (data.Response === 'False') {
      return NextResponse.json({ error: data.Error }, { status: 404 });
    }

    // Extract Rotten Tomatoes and Metacritic
    let rottenTomatoes = '';
    let metacritic = '';
    
    if (data.Ratings) {
      const rt = data.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
      if (rt) rottenTomatoes = rt.Value;
      
      const mc = data.Ratings.find((r: any) => r.Source === 'Metacritic');
      if (mc) metacritic = mc.Value;
    }

    // Convert runtime "120 min" to number
    let durationMin = null;
    if (data.Runtime && data.Runtime !== 'N/A') {
      const match = data.Runtime.match(/(\d+)/);
      if (match) durationMin = parseInt(match[1], 10);
    }

    const movieData = {
      title: data.Title,
      synopsis: data.Plot !== 'N/A' ? data.Plot : '',
      posterUrl: data.Poster !== 'N/A' ? data.Poster : '',
      rating: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
      durationMin,
      rottenTomatoes,
      metacritic,
      director: data.Director !== 'N/A' ? data.Director : '',
      cast: data.Actors !== 'N/A' ? data.Actors : '',
      genre: data.Genre !== 'N/A' ? data.Genre : '',
    };

    return NextResponse.json(movieData);
  } catch (error) {
    console.error('OMDB API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from OMDB' }, { status: 500 });
  }
}
