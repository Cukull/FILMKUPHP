const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

const FUSEKI_URL = 'http://localhost:3030/filmku/query';

async function fetchFromFuseki(query) {
  try {
    const response = await fetch(FUSEKI_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ query })
    });
    const json = await response.json();
    return json.results.bindings;
  } catch (err) {
    console.error('Failed to fetch from Fuseki. Make sure Jena Fuseki is running.', err);
    return [];
  }
}

async function seed() {
  console.log('🌱 Memulai proses ETL dari Fuseki ke Supabase...');

  // 1. Fetch Categories
  const categoriesQuery = `
    PREFIX f: <http://www.semanticweb.org/filmku/ontologies/2026/filmku_ontology#>
    SELECT DISTINCT ?kategoriSection WHERE {
        ?film a f:Film ;
              f:kategoriSection ?kategoriSection .
    }
  `;
  const categoriesRaw = await fetchFromFuseki(categoriesQuery);
  const categoryMap = {};

  if (categoriesRaw.length > 0) {
    console.log(`Menemukan ${categoriesRaw.length} Kategori.`);
    for (const row of categoriesRaw) {
      if (row.kategoriSection) {
        const catName = row.kategoriSection.value;
        const cat = await prisma.category.upsert({
          where: { name: catName },
          update: {},
          create: { name: catName }
        });
        categoryMap[catName] = cat.id;
      }
    }
  }

  // 2. Fetch Movies
  const moviesQuery = `
    PREFIX f: <http://www.semanticweb.org/filmku/ontologies/2026/filmku_ontology#>
    SELECT ?judul ?poster ?genre ?sinopsis ?trailer ?durasi ?kategoriSection ?rating WHERE {
        ?film a f:Film ;
              f:judul ?judul .
        OPTIONAL { ?film f:poster_url ?poster . }
        OPTIONAL { ?film f:poster_film ?poster . }
        OPTIONAL { ?film f:sinopsis ?sinopsis . }
        OPTIONAL { ?film f:genre ?genre . }
        OPTIONAL { ?film f:trailer_film ?trailer . }
        OPTIONAL { ?film f:durasi ?durasi . }
        OPTIONAL { ?film f:rating_film ?rating . }
        OPTIONAL { ?film f:kategoriSection ?kategoriSection . }
    }
  `;
  const moviesRaw = await fetchFromFuseki(moviesQuery);
  
  if (moviesRaw.length > 0) {
    console.log(`Menemukan ${moviesRaw.length} Film. Sedang memindahkan...`);
    for (const row of moviesRaw) {
      if (!row.judul) continue;
      
      const title = row.judul.value;
      const posterUrl = row.poster ? row.poster.value : null;
      const synopsis = row.sinopsis ? row.sinopsis.value : null;
      const trailerUrl = row.trailer ? row.trailer.value : null;
      let durationMin = null;
      if (row.durasi) {
        const durMatch = row.durasi.value.match(/(\d+)/);
        if (durMatch) durationMin = parseInt(durMatch[1]);
      }
      const ratingStr = row.rating ? parseFloat(row.rating.value) : null;
      const rating = isNaN(ratingStr) ? null : ratingStr;
      
      let categoryId = null;
      if (row.kategoriSection && categoryMap[row.kategoriSection.value]) {
        categoryId = categoryMap[row.kategoriSection.value];
      }

      await prisma.movie.create({
        data: {
          title,
          posterUrl,
          synopsis,
          trailerUrl,
          durationMin,
          rating,
          categoryId,
          status: 'NOW_PLAYING' // Default
        }
      });
    }
    console.log('✅ Berhasil memindahkan data Film!');
  } else {
    console.log('⚠️ Data film kosong di Fuseki atau server tidak berjalan.');
  }

  console.log('Selesai!');
}

seed().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});
