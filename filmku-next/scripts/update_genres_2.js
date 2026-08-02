const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { title: "Deep Water (2026)", genre: "Thriller", section: "Misteri & Bikin Merinding" },
  { title: "Demon Slayer: Kimetsu no Yaiba Infinity Castle (2025)", genre: "Action & Adventure", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Dendam Seribu Bunga", genre: "Drama", section: "Karya Anak Bangsa" },
  { title: "Descendants of the Sun", genre: "Romance", section: "Drama Korea" },
  { title: "Descendants: Wicked Wonderland", genre: "Family", section: "Tontonan Bareng Keluarga" },
  { title: "Despicable Me 4", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "Detective Conan: Fallen Angel of the Highway", genre: "Mystery", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Devotion (2022)", genre: "War", section: "Berdasarkan Kisah Nyata" },
  { title: "Dilan 1997 (2026)", genre: "Romance", section: "Karya Anak Bangsa" },
  { title: "Disclosure Day", genre: "Thriller", section: "Misteri & Bikin Merinding" },
  { title: "Django", genre: "Western", section: "" }, // updated based on user request
  { title: "Doctor on the Edge", genre: "Drama", section: "Drama Korea" },
  { title: "Doctor Strange", genre: "Action", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Doctor Strange in the Multiverse of Madness", genre: "Action", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Dolly", genre: "Drama", section: "" },
  { title: "Doraemon the Movie: New Nobita and the Castle of the Undersea Devil (2026)", genre: "Animation", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Dracula", genre: "Horror", section: "Misteri & Bikin Merinding" },
  { title: "Dune: Part Two", genre: "Science Fiction", section: "Petualangan Luar Angkasa Epic" },
  { title: "Elite Force", genre: "Action", section: "" },
  { title: "Elize: Sombras de uma Mulher", genre: "Drama", section: "" },
  { title: "Evil Dead", genre: "Horror", section: "Misteri & Bikin Merinding" },
  { title: "Evil Dead Burn", genre: "Horror", section: "Misteri & Bikin Merinding" },
  { title: "Evil Dead Rise", genre: "Horror", section: "Misteri & Bikin Merinding" },
  { title: "F1", genre: "Drama", section: "Berdasarkan Kisah Nyata" },
  { title: "Fast X", genre: "Action", section: "Cerita Ringan Weekend Vibes" },
  { title: "Film SpongeBob: Pencarian SquarePants", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "Finding Nemo (2003)", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "Flow", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "Foufo (2026)", genre: "", section: "" },
  { title: "Free Solo (2018)", genre: "Documentary", section: "Berdasarkan Kisah Nyata" },
  { title: "FROM", genre: "Horror", section: "Misteri & Bikin Merinding" },
  { title: "Frozen", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "Ghost In The Cell", genre: "Science Fiction", section: "Film yang Bikin Mikir Keras" },
  { title: "Gladiator II", genre: "Action", section: "Visual & Sinematografi Memukau" },
  { title: "GOAT (2026)", genre: "Action", section: "" },
  { title: "Goblin", genre: "Fantasy", section: "Drama Korea" },
  { title: "Godzilla x Kong: The New Empire", genre: "Science Fiction", section: "Visual & Sinematografi Memukau" },
  { title: "Gone Girl", genre: "Thriller", section: "Plot Twist yang Bikin Melongo" },
  { title: "Good Boy", genre: "Action", section: "Drama Korea" },
  { title: "Green Book", genre: "Drama", section: "Berdasarkan Kisah Nyata" },
  { title: "Greenland 2: Migration", genre: "Action", section: "Film Survival & Bertahan Hidup" },
  { title: "Guardians of the Galaxy Vol. 2", genre: "Action", section: "Petualangan Luar Angkasa Epic" },
  { title: "Guardians of the Galaxy Vol. 3", genre: "Action", section: "Petualangan Luar Angkasa Epic" },
  { title: "Halo Sabtu (Hello Saturday)", genre: "Talk", section: "" },
  { title: "Hamnet", genre: "Drama", section: "Berdasarkan Kisah Nyata" },
  { title: "Harry Potter and the Chamber of Secrets", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Harry Potter and the Goblet of Fire", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Harry Potter and the Half-Blood Prince", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Harry Potter and the Order of the Phoenix", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Harry Potter and the Prisoner of Azkaban", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Harry Potter dan Batu Bertuah", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Harry Potter dan Relikui Kematian: Bagian 1", genre: "Fantasy", section: "Adaptasi Game & Anime Terbaik" },
  { title: "Her Private Hell", genre: "Drama", section: "" },
  { title: "Hokum", genre: "", section: "" },
  { title: "Hoppers (2026)", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "House of the Dragon", genre: "Action & Adventure", section: "Adaptasi Game & Anime Terbaik" },
  { title: "How to Train Your Dragon", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "Hungry", genre: "Drama", section: "" }, // updated based on user request
  { title: "Ice Age", genre: "Animation", section: "Tontonan Bareng Keluarga" },
  { title: "If Wishes Could Kill", genre: "Mystery", section: "Drama China" }
];

async function main() {
  let updatedCount = 0;
  for (const update of updates) {
    const res = await prisma.movie.updateMany({
      where: { title: update.title },
      data: { 
        genre: update.genre || null, 
        sections: update.section || null 
      }
    });
    updatedCount += res.count;
    console.log(`Updated ${res.count} movie(s) for title: "${update.title}"`);
  }
  console.log(`\nSuccessfully updated ${updatedCount} movies.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
