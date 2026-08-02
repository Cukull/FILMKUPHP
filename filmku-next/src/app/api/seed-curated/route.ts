import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { YEARLY_BEST_FILMS, THEMED_SECTIONS } from '@/data/curatedSections';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

/**
 * GET /api/seed-curated
 * 
 * One-time seed endpoint that:
 * 1. Creates DashboardSections for all curated yearly + themed sections
 * 2. Fetches full movie details from TMDB for each curated film
 * 3. Creates movies in the database (skips if already exists by title)
 * 4. Assigns section tags to each movie
 * 
 * This endpoint is idempotent — safe to run multiple times.
 */
export async function GET() {
  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB_API_KEY not configured' }, { status: 500 });
  }

  const log: string[] = [];
  let sectionsCreated = 0;
  let filmsCreated = 0;
  let filmsSkipped = 0;
  let filmsUpdated = 0;

  try {
    // ══════════════════════════════════════════════
    //  STEP 1: Create DashboardSections
    // ══════════════════════════════════════════════

    // Get current max order
    const existingSections = await prisma.dashboardSection.findMany();
    const existingNames = new Set(existingSections.map(s => s.name));
    let nextOrder = Math.max(0, ...existingSections.map(s => s.order)) + 1;

    // Yearly sections
    const yearlySections = YEARLY_BEST_FILMS.map(y => ({
      name: `Film Terbaik ${y.year}`,
      icon: 'Trophy',
    }));

    // Themed sections
    const themedSectionDefs = THEMED_SECTIONS.map(s => ({
      name: s.name,
      icon: s.icon,
    }));

    const allSectionDefs = [...yearlySections, ...themedSectionDefs];

    for (const secDef of allSectionDefs) {
      if (!existingNames.has(secDef.name)) {
        await prisma.dashboardSection.create({
          data: {
            name: secDef.name,
            icon: secDef.icon,
            order: nextOrder++,
          },
        });
        sectionsCreated++;
        log.push(`✅ Section created: ${secDef.name}`);
      } else {
        log.push(`⏭️ Section exists: ${secDef.name}`);
      }
    }

    // ══════════════════════════════════════════════
    //  STEP 2: Build film → sections mapping
    // ══════════════════════════════════════════════

    // Map tmdbId → set of section names
    const filmSectionsMap = new Map<number, Set<string>>();

    for (const yearData of YEARLY_BEST_FILMS) {
      const sectionName = `Film Terbaik ${yearData.year}`;
      for (const film of yearData.films) {
        if (!filmSectionsMap.has(film.tmdbId)) {
          filmSectionsMap.set(film.tmdbId, new Set());
        }
        filmSectionsMap.get(film.tmdbId)!.add(sectionName);
      }
    }

    for (const theme of THEMED_SECTIONS) {
      for (const film of theme.films) {
        if (!filmSectionsMap.has(film.tmdbId)) {
          filmSectionsMap.set(film.tmdbId, new Set());
        }
        filmSectionsMap.get(film.tmdbId)!.add(theme.name);
      }
    }

    // Collect unique films
    const allFilmsMap = new Map<number, { title: string; year: number; tmdbId: number; imdbRating: number }>();
    for (const y of YEARLY_BEST_FILMS) {
      for (const f of y.films) {
        if (!allFilmsMap.has(f.tmdbId)) allFilmsMap.set(f.tmdbId, f);
      }
    }
    for (const t of THEMED_SECTIONS) {
      for (const f of t.films) {
        if (!allFilmsMap.has(f.tmdbId)) allFilmsMap.set(f.tmdbId, f);
      }
    }

    const uniqueFilms = Array.from(allFilmsMap.values());
    log.push(`\n📊 Total unique films to process: ${uniqueFilms.length}`);

    // ══════════════════════════════════════════════
    //  STEP 3: Fetch from TMDB & create/update movies
    // ══════════════════════════════════════════════

    // Get all existing movies for duplicate check
    const existingMovies = await prisma.movie.findMany({ select: { id: true, title: true, sections: true } });
    const existingByTitle = new Map(existingMovies.map(m => [m.title.toLowerCase().trim(), m]));

    const BATCH_SIZE = 5;
    for (let i = 0; i < uniqueFilms.length; i += BATCH_SIZE) {
      const batch = uniqueFilms.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (film) => {
        const sectionNames = filmSectionsMap.get(film.tmdbId);
        const sectionStr = sectionNames ? Array.from(sectionNames).join(', ') : '';

        // Check if movie already exists
        const existing = existingByTitle.get(film.title.toLowerCase().trim());
        
        if (existing) {
          // Update sections — merge existing sections with new ones
          const currentSections = existing.sections 
            ? existing.sections.split(',').map((s: string) => s.trim()).filter(Boolean) 
            : [];
          const newSections = sectionNames ? Array.from(sectionNames) : [];
          const mergedSections = Array.from(new Set([...currentSections, ...newSections]));
          const mergedStr = mergedSections.join(', ');

          if (mergedStr !== (existing.sections || '')) {
            await prisma.movie.update({
              where: { id: existing.id },
              data: { sections: mergedStr },
            });
            filmsUpdated++;
            log.push(`🔄 Updated sections: ${film.title}`);
          } else {
            filmsSkipped++;
            log.push(`⏭️ Film exists (unchanged): ${film.title}`);
          }
          return;
        }

        // Fetch from TMDB
        try {
          const detailRes = await fetch(
            `https://api.themoviedb.org/3/movie/${film.tmdbId}?api_key=${TMDB_API_KEY}&language=id-ID&append_to_response=credits,videos`,
          );
          
          if (!detailRes.ok) {
            log.push(`❌ TMDB fetch failed for: ${film.title} (${detailRes.status})`);
            // Create with minimal data
            await prisma.movie.create({
              data: {
                title: film.title,
                rating: film.imdbRating,
                status: 'NOW_PLAYING',
                sections: sectionStr,
              },
            });
            filmsCreated++;
            return;
          }

          const tmdb = await detailRes.json();

          // Extract poster URL
          const posterUrl = tmdb.poster_path 
            ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${tmdb.poster_path}` 
            : '';

          // Extract synopsis (prefer Indonesian, fallback to English)
          let synopsis = tmdb.overview || '';
          if (!synopsis && tmdb.original_language !== 'id') {
            // Fetch English fallback
            try {
              const enRes = await fetch(
                `https://api.themoviedb.org/3/movie/${film.tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
              );
              if (enRes.ok) {
                const enData = await enRes.json();
                synopsis = enData.overview || '';
              }
            } catch { /* ignore */ }
          }

          // Extract genres
          const genres = (tmdb.genres || []).map((g: any) => g.name).join(', ');

          // Extract runtime
          const durationMin = tmdb.runtime || null;

          // Extract trailer
          let trailerUrl = '';
          const videos = tmdb.videos?.results || [];
          const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
            || videos.find((v: any) => v.site === 'YouTube');
          if (trailer) {
            trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
          }

          // Extract cast & director
          const credits = tmdb.credits || {};
          const castList = (credits.cast || []).slice(0, 10).map((c: any) => ({
            tmdbId: c.id,
            name: c.name,
            role: c.character || '',
            imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : '',
          }));
          const directors = (credits.crew || [])
            .filter((c: any) => c.job === 'Director')
            .map((c: any) => c.name);

          const castStr = JSON.stringify(castList);
          const directorStr = directors.join(', ');

          await prisma.movie.create({
            data: {
              title: film.title,
              synopsis: synopsis || null,
              posterUrl: posterUrl || null,
              trailerUrl: trailerUrl || null,
              durationMin: durationMin,
              rating: film.imdbRating,
              status: 'NOW_PLAYING',
              genre: genres || null,
              sections: sectionStr,
              cast: castStr || null,
              director: directorStr || null,
            },
          });
          filmsCreated++;
          log.push(`✅ Created: ${film.title} (${film.year})`);
        } catch (err: any) {
          log.push(`❌ Error creating ${film.title}: ${err.message}`);
          // Create with minimal data
          try {
            await prisma.movie.create({
              data: {
                title: film.title,
                rating: film.imdbRating,
                status: 'NOW_PLAYING',
                sections: sectionStr,
              },
            });
            filmsCreated++;
          } catch { /* duplicate, skip */ }
        }
      }));

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < uniqueFilms.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // ══════════════════════════════════════════════
    //  DONE
    // ══════════════════════════════════════════════

    const summary = {
      success: true,
      sectionsCreated,
      filmsCreated,
      filmsUpdated,
      filmsSkipped,
      totalUnique: uniqueFilms.length,
      log,
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      log,
    }, { status: 500 });
  }
}
