/**
 * tmdbPoster.ts
 * ─────────────
 * Server-side utility to batch-fetch poster URLs from TMDB API.
 * Used by curated section components to resolve TMDB IDs → poster image URLs.
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

interface PosterResult {
  tmdbId: number;
  posterUrl: string;
}

/**
 * Fetch poster URL for a single TMDB movie ID.
 * Returns empty string if not found or API fails.
 */
async function fetchSinglePoster(tmdbId: number): Promise<PosterResult> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    if (!res.ok) return { tmdbId, posterUrl: '' };
    const data = await res.json();
    return {
      tmdbId,
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : '',
    };
  } catch {
    return { tmdbId, posterUrl: '' };
  }
}

/**
 * Batch-fetch poster URLs for multiple TMDB IDs.
 * Returns a Map of tmdbId → posterUrl.
 *
 * Fetches are done in parallel with concurrency limit to avoid rate limits.
 */
export async function fetchPosterMap(tmdbIds: number[]): Promise<Map<number, string>> {
  const unique = [...new Set(tmdbIds)];
  const BATCH_SIZE = 10;
  const results = new Map<number, string>();

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(fetchSinglePoster));
    for (const r of batchResults) {
      results.set(r.tmdbId, r.posterUrl);
    }
  }

  return results;
}
