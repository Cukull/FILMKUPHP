/**
 * curatedSections.ts
 * ──────────────────
 * Hard-coded curated film data for editorial sections on the homepage.
 * Each film includes a TMDB ID so poster URLs can be resolved via TMDB API.
 *
 * These sections are EDITORIAL — they showcase hand-picked films grouped
 * by year or theme, independent of the films in the FILMKU database.
 */

export interface CuratedFilm {
  title: string;
  year: number;
  tmdbId: number;         // TMDB movie ID for fetching poster
  imdbRating: number;     // IMDb rating (out of 10)
}

export interface YearlySection {
  year: number;
  films: CuratedFilm[];
}

export interface ThemedSection {
  name: string;
  icon: string;           // Lucide icon name
  description: string;    // Short tagline
  emoji: string;          // Emoji prefix for display
  films: CuratedFilm[];
}

// ════════════════════════════════════════════════
//  FILM TERBAIK PER TAHUN (2010–2024)
// ════════════════════════════════════════════════

export const YEARLY_BEST_FILMS: YearlySection[] = [
  {
    year: 2024,
    films: [
      { title: 'Dune: Part Two', year: 2024, tmdbId: 693134, imdbRating: 8.5 },
      { title: 'The Substance', year: 2024, tmdbId: 933260, imdbRating: 7.3 },
      { title: 'Anora', year: 2024, tmdbId: 1064028, imdbRating: 7.5 },
      { title: 'Civil War', year: 2024, tmdbId: 929590, imdbRating: 6.8 },
      { title: 'Nosferatu', year: 2024, tmdbId: 426063, imdbRating: 7.1 },
      { title: 'Inside Out 2', year: 2024, tmdbId: 1022789, imdbRating: 7.6 },
    ],
  },
  {
    year: 2023,
    films: [
      { title: 'Oppenheimer', year: 2023, tmdbId: 872585, imdbRating: 8.3 },
      { title: 'Spider-Man: Across the Spider-Verse', year: 2023, tmdbId: 569094, imdbRating: 8.6 },
      { title: 'Anatomy of a Fall', year: 2023, tmdbId: 915935, imdbRating: 7.6 },
      { title: 'Killers of the Flower Moon', year: 2023, tmdbId: 466420, imdbRating: 7.6 },
      { title: 'Past Lives', year: 2023, tmdbId: 666277, imdbRating: 7.8 },
      { title: 'The Holdovers', year: 2023, tmdbId: 840430, imdbRating: 7.9 },
    ],
  },
  {
    year: 2022,
    films: [
      { title: 'Everything Everywhere All at Once', year: 2022, tmdbId: 545611, imdbRating: 7.8 },
      { title: 'Top Gun: Maverick', year: 2022, tmdbId: 361743, imdbRating: 8.2 },
      { title: 'The Banshees of Inisherin', year: 2022, tmdbId: 674324, imdbRating: 7.7 },
      { title: 'Aftersun', year: 2022, tmdbId: 965150, imdbRating: 7.7 },
      { title: 'Decision to Leave', year: 2022, tmdbId: 780609, imdbRating: 7.3 },
      { title: 'The Batman', year: 2022, tmdbId: 414906, imdbRating: 7.8 },
    ],
  },
  {
    year: 2021,
    films: [
      { title: 'Dune', year: 2021, tmdbId: 438631, imdbRating: 8.0 },
      { title: 'The Power of the Dog', year: 2021, tmdbId: 597208, imdbRating: 6.8 },
      { title: 'Drive My Car', year: 2021, tmdbId: 876351, imdbRating: 7.6 },
      { title: 'Licorice Pizza', year: 2021, tmdbId: 718032, imdbRating: 7.2 },
      { title: 'The Worst Person in the World', year: 2021, tmdbId: 776114, imdbRating: 7.7 },
      { title: 'Spider-Man: No Way Home', year: 2021, tmdbId: 634649, imdbRating: 8.2 },
    ],
  },
  {
    year: 2020,
    films: [
      { title: 'Nomadland', year: 2020, tmdbId: 581734, imdbRating: 7.3 },
      { title: 'Minari', year: 2020, tmdbId: 615643, imdbRating: 7.5 },
      { title: 'Sound of Metal', year: 2020, tmdbId: 524650, imdbRating: 7.7 },
      { title: 'Another Round', year: 2020, tmdbId: 611219, imdbRating: 7.7 },
      { title: 'Soul', year: 2020, tmdbId: 508442, imdbRating: 8.0 },
      { title: 'The Trial of the Chicago 7', year: 2020, tmdbId: 497582, imdbRating: 7.8 },
    ],
  },
  {
    year: 2019,
    films: [
      { title: 'Parasite', year: 2019, tmdbId: 496243, imdbRating: 8.5 },
      { title: '1917', year: 2019, tmdbId: 530915, imdbRating: 8.2 },
      { title: 'Joker', year: 2019, tmdbId: 475557, imdbRating: 8.4 },
      { title: 'Marriage Story', year: 2019, tmdbId: 492188, imdbRating: 7.9 },
      { title: 'Portrait of a Lady on Fire', year: 2019, tmdbId: 531428, imdbRating: 8.1 },
      { title: 'Knives Out', year: 2019, tmdbId: 546554, imdbRating: 7.9 },
    ],
  },
  {
    year: 2018,
    films: [
      { title: 'Roma', year: 2018, tmdbId: 505954, imdbRating: 7.7 },
      { title: 'Spider-Man: Into the Spider-Verse', year: 2018, tmdbId: 324857, imdbRating: 8.4 },
      { title: 'Burning', year: 2018, tmdbId: 497592, imdbRating: 7.5 },
      { title: 'Hereditary', year: 2018, tmdbId: 493922, imdbRating: 7.3 },
      { title: 'The Favourite', year: 2018, tmdbId: 375262, imdbRating: 7.5 },
      { title: 'A Quiet Place', year: 2018, tmdbId: 447332, imdbRating: 7.5 },
    ],
  },
  {
    year: 2017,
    films: [
      { title: 'Get Out', year: 2017, tmdbId: 419430, imdbRating: 7.7 },
      { title: 'Blade Runner 2049', year: 2017, tmdbId: 335984, imdbRating: 8.0 },
      { title: 'Lady Bird', year: 2017, tmdbId: 391713, imdbRating: 7.4 },
      { title: 'Dunkirk', year: 2017, tmdbId: 374720, imdbRating: 7.8 },
      { title: 'Call Me by Your Name', year: 2017, tmdbId: 398818, imdbRating: 7.8 },
      { title: 'Coco', year: 2017, tmdbId: 354912, imdbRating: 8.4 },
    ],
  },
  {
    year: 2016,
    films: [
      { title: 'Moonlight', year: 2016, tmdbId: 376867, imdbRating: 7.4 },
      { title: 'La La Land', year: 2016, tmdbId: 313369, imdbRating: 8.0 },
      { title: 'Arrival', year: 2016, tmdbId: 329865, imdbRating: 7.9 },
      { title: 'Manchester by the Sea', year: 2016, tmdbId: 334541, imdbRating: 7.8 },
      { title: 'The Handmaiden', year: 2016, tmdbId: 290098, imdbRating: 8.1 },
      { title: 'Your Name', year: 2016, tmdbId: 372058, imdbRating: 8.4 },
    ],
  },
  {
    year: 2015,
    films: [
      { title: 'Mad Max: Fury Road', year: 2015, tmdbId: 76341, imdbRating: 8.1 },
      { title: 'The Revenant', year: 2015, tmdbId: 281957, imdbRating: 8.0 },
      { title: 'Room', year: 2015, tmdbId: 264644, imdbRating: 8.1 },
      { title: 'Spotlight', year: 2015, tmdbId: 314365, imdbRating: 8.1 },
      { title: 'Ex Machina', year: 2015, tmdbId: 264660, imdbRating: 7.7 },
      { title: 'Inside Out', year: 2015, tmdbId: 150540, imdbRating: 8.1 },
    ],
  },
  {
    year: 2014,
    films: [
      { title: 'Interstellar', year: 2014, tmdbId: 157336, imdbRating: 8.7 },
      { title: 'Gone Girl', year: 2014, tmdbId: 210577, imdbRating: 8.1 },
      { title: 'Nightcrawler', year: 2014, tmdbId: 242582, imdbRating: 7.9 },
      { title: 'Whiplash', year: 2014, tmdbId: 244786, imdbRating: 8.5 },
      { title: 'Boyhood', year: 2014, tmdbId: 85350, imdbRating: 7.9 },
      { title: 'The Grand Budapest Hotel', year: 2014, tmdbId: 120467, imdbRating: 8.1 },
    ],
  },
  {
    year: 2013,
    films: [
      { title: 'Gravity', year: 2013, tmdbId: 49047, imdbRating: 7.7 },
      { title: '12 Years a Slave', year: 2013, tmdbId: 76203, imdbRating: 8.1 },
      { title: 'Her', year: 2013, tmdbId: 152601, imdbRating: 8.0 },
      { title: 'The Wolf of Wall Street', year: 2013, tmdbId: 106646, imdbRating: 8.2 },
      { title: 'Prisoners', year: 2013, tmdbId: 146233, imdbRating: 8.1 },
      { title: 'Dallas Buyers Club', year: 2013, tmdbId: 152532, imdbRating: 8.0 },
    ],
  },
  {
    year: 2012,
    films: [
      { title: 'The Dark Knight Rises', year: 2012, tmdbId: 49026, imdbRating: 8.4 },
      { title: 'Django Unchained', year: 2012, tmdbId: 68718, imdbRating: 8.4 },
      { title: 'Moonrise Kingdom', year: 2012, tmdbId: 83666, imdbRating: 7.8 },
      { title: 'Life of Pi', year: 2012, tmdbId: 87827, imdbRating: 7.9 },
      { title: 'Amour', year: 2012, tmdbId: 94761, imdbRating: 7.8 },
      { title: 'The Avengers', year: 2012, tmdbId: 24428, imdbRating: 8.0 },
    ],
  },
  {
    year: 2011,
    films: [
      { title: 'Drive', year: 2011, tmdbId: 64635, imdbRating: 7.8 },
      { title: 'The Artist', year: 2011, tmdbId: 57410, imdbRating: 7.9 },
      { title: 'A Separation', year: 2011, tmdbId: 60243, imdbRating: 8.3 },
      { title: 'The Tree of Life', year: 2011, tmdbId: 8967, imdbRating: 6.8 },
      { title: 'Shame', year: 2011, tmdbId: 71689, imdbRating: 7.2 },
      { title: 'Warrior', year: 2011, tmdbId: 59440, imdbRating: 8.2 },
    ],
  },
  {
    year: 2010,
    films: [
      { title: 'Inception', year: 2010, tmdbId: 27205, imdbRating: 8.8 },
      { title: 'The Social Network', year: 2010, tmdbId: 37799, imdbRating: 7.8 },
      { title: 'Black Swan', year: 2010, tmdbId: 44214, imdbRating: 8.0 },
      { title: 'Shutter Island', year: 2010, tmdbId: 11324, imdbRating: 8.2 },
      { title: 'Toy Story 3', year: 2010, tmdbId: 10193, imdbRating: 8.3 },
      { title: 'The King\'s Speech', year: 2010, tmdbId: 45269, imdbRating: 8.0 },
    ],
  },
];

// ════════════════════════════════════════════════
//  KOLEKSI TEMATIK
// ════════════════════════════════════════════════

export const THEMED_SECTIONS: ThemedSection[] = [
  {
    name: 'Film Zombie Terbaik Sepanjang Masa',
    icon: 'Skull',
    emoji: '🧟',
    description: 'Ketika dunia kiamat, siapa yang bertahan?',
    films: [
      { title: 'Train to Busan', year: 2016, tmdbId: 396535, imdbRating: 7.6 },
      { title: '28 Days Later', year: 2002, tmdbId: 170, imdbRating: 7.5 },
      { title: 'Shaun of the Dead', year: 2004, tmdbId: 747, imdbRating: 7.9 },
      { title: 'World War Z', year: 2013, tmdbId: 72190, imdbRating: 7.0 },
      { title: '#Alive', year: 2020, tmdbId: 726209, imdbRating: 6.3 },
      { title: 'Zombieland', year: 2009, tmdbId: 19908, imdbRating: 7.6 },
      { title: 'Dawn of the Dead', year: 2004, tmdbId: 924, imdbRating: 7.3 },
      { title: 'I Am Legend', year: 2007, tmdbId: 6479, imdbRating: 7.2 },
    ],
  },
  {
    name: 'Film Dinosaurus & Dunia Purba',
    icon: 'Bug',
    emoji: '🦕',
    description: 'Kembali ke zaman prasejarah yang menakjubkan',
    films: [
      { title: 'Jurassic Park', year: 1993, tmdbId: 329, imdbRating: 8.2 },
      { title: 'Jurassic World', year: 2015, tmdbId: 135397, imdbRating: 6.9 },
      { title: 'The Lost World: Jurassic Park', year: 1997, tmdbId: 330, imdbRating: 6.5 },
      { title: 'King Kong', year: 2005, tmdbId: 254, imdbRating: 7.2 },
      { title: '65', year: 2023, tmdbId: 700391, imdbRating: 5.4 },
      { title: 'Jurassic World: Dominion', year: 2022, tmdbId: 507086, imdbRating: 5.7 },
      { title: 'Jurassic Park III', year: 2001, tmdbId: 331, imdbRating: 5.9 },
      { title: 'The Good Dinosaur', year: 2015, tmdbId: 105864, imdbRating: 6.7 },
    ],
  },
  {
    name: 'Film tentang Kesendirian & Refleksi',
    icon: 'Moon',
    emoji: '🧘',
    description: 'Menemukan diri sendiri dalam keheningan',
    films: [
      { title: 'Into the Wild', year: 2007, tmdbId: 5915, imdbRating: 8.1 },
      { title: 'Her', year: 2013, tmdbId: 152601, imdbRating: 8.0 },
      { title: 'Lost in Translation', year: 2003, tmdbId: 153, imdbRating: 7.7 },
      { title: 'Cast Away', year: 2000, tmdbId: 8358, imdbRating: 7.8 },
      { title: 'Moon', year: 2009, tmdbId: 17431, imdbRating: 7.9 },
      { title: 'The Lighthouse', year: 2019, tmdbId: 503919, imdbRating: 7.4 },
      { title: 'Wild', year: 2014, tmdbId: 266856, imdbRating: 7.1 },
      { title: 'Nomadland', year: 2020, tmdbId: 581734, imdbRating: 7.3 },
    ],
  },
  {
    name: 'Comfort Movie — Hangat di Hati',
    icon: 'Coffee',
    emoji: '☕',
    description: 'Film yang selalu bikin mood jadi lebih baik',
    films: [
      { title: 'The Secret Life of Walter Mitty', year: 2013, tmdbId: 116745, imdbRating: 7.3 },
      { title: 'Julie & Julia', year: 2009, tmdbId: 20895, imdbRating: 7.0 },
      { title: 'Paddington 2', year: 2017, tmdbId: 346648, imdbRating: 7.8 },
      { title: 'The Grand Budapest Hotel', year: 2014, tmdbId: 120467, imdbRating: 8.1 },
      { title: 'About Time', year: 2013, tmdbId: 122906, imdbRating: 7.8 },
      { title: 'Chef', year: 2014, tmdbId: 193893, imdbRating: 7.3 },
      { title: 'Little Women', year: 2019, tmdbId: 530385, imdbRating: 7.8 },
      { title: 'Amélie', year: 2001, tmdbId: 194, imdbRating: 8.3 },
    ],
  },
  {
    name: 'Plot Twist yang Bikin Melongo',
    icon: 'Zap',
    emoji: '🎭',
    description: 'Ending yang tidak pernah kamu duga!',
    films: [
      { title: 'The Sixth Sense', year: 1999, tmdbId: 745, imdbRating: 8.1 },
      { title: 'Fight Club', year: 1999, tmdbId: 550, imdbRating: 8.8 },
      { title: 'Shutter Island', year: 2010, tmdbId: 11324, imdbRating: 8.2 },
      { title: 'Gone Girl', year: 2014, tmdbId: 210577, imdbRating: 8.1 },
      { title: 'Oldboy', year: 2003, tmdbId: 670, imdbRating: 8.4 },
      { title: 'The Prestige', year: 2006, tmdbId: 1124, imdbRating: 8.5 },
      { title: 'Get Out', year: 2017, tmdbId: 419430, imdbRating: 7.7 },
      { title: 'Predestination', year: 2014, tmdbId: 206487, imdbRating: 7.4 },
    ],
  },
  {
    name: 'Film Buat Hari Hujan',
    icon: 'CloudRain',
    emoji: '🌧️',
    description: 'Sempurna ditemani secangkir kopi di hari mendung',
    films: [
      { title: 'Eternal Sunshine of the Spotless Mind', year: 2004, tmdbId: 38, imdbRating: 8.3 },
      { title: 'The Notebook', year: 2004, tmdbId: 11036, imdbRating: 7.8 },
      { title: 'In the Mood for Love', year: 2000, tmdbId: 843, imdbRating: 8.1 },
      { title: 'Blue Valentine', year: 2010, tmdbId: 37686, imdbRating: 7.3 },
      { title: 'A Walk to Remember', year: 2002, tmdbId: 10543, imdbRating: 7.3 },
      { title: 'Before Sunrise', year: 1995, tmdbId: 80, imdbRating: 8.1 },
      { title: 'Atonement', year: 2007, tmdbId: 4347, imdbRating: 7.8 },
      { title: 'Call Me by Your Name', year: 2017, tmdbId: 398818, imdbRating: 7.8 },
    ],
  },
  {
    name: 'Film yang Bikin Mikir Keras',
    icon: 'Brain',
    emoji: '🧠',
    description: 'Butuh konsentrasi tinggi & diskusi setelah nonton',
    films: [
      { title: 'Inception', year: 2010, tmdbId: 27205, imdbRating: 8.8 },
      { title: 'Interstellar', year: 2014, tmdbId: 157336, imdbRating: 8.7 },
      { title: 'Tenet', year: 2020, tmdbId: 577922, imdbRating: 7.3 },
      { title: 'Arrival', year: 2016, tmdbId: 329865, imdbRating: 7.9 },
      { title: 'Memento', year: 2000, tmdbId: 77, imdbRating: 8.4 },
      { title: 'Primer', year: 2004, tmdbId: 14337, imdbRating: 6.7 },
      { title: 'Coherence', year: 2013, tmdbId: 220289, imdbRating: 7.2 },
      { title: 'The Matrix', year: 1999, tmdbId: 603, imdbRating: 8.7 },
    ],
  },
  {
    name: 'Petualangan Luar Angkasa Epic',
    icon: 'Rocket',
    emoji: '🚀',
    description: 'Jelajahi alam semesta yang tak terbatas',
    films: [
      { title: 'Interstellar', year: 2014, tmdbId: 157336, imdbRating: 8.7 },
      { title: 'The Martian', year: 2015, tmdbId: 286217, imdbRating: 8.0 },
      { title: 'Gravity', year: 2013, tmdbId: 49047, imdbRating: 7.7 },
      { title: '2001: A Space Odyssey', year: 1968, tmdbId: 62, imdbRating: 8.3 },
      { title: 'Ad Astra', year: 2019, tmdbId: 419704, imdbRating: 6.6 },
      { title: 'Alien', year: 1979, tmdbId: 348, imdbRating: 8.5 },
      { title: 'Moon', year: 2009, tmdbId: 17431, imdbRating: 7.9 },
      { title: 'Passengers', year: 2016, tmdbId: 274870, imdbRating: 7.0 },
    ],
  },
  {
    name: 'Film dengan Soundtrack Legendaris',
    icon: 'Music',
    emoji: '🎵',
    description: 'Musik yang masih terngiang sampai sekarang',
    films: [
      { title: 'Whiplash', year: 2014, tmdbId: 244786, imdbRating: 8.5 },
      { title: 'La La Land', year: 2016, tmdbId: 313369, imdbRating: 8.0 },
      { title: 'Baby Driver', year: 2017, tmdbId: 339403, imdbRating: 7.6 },
      { title: 'Bohemian Rhapsody', year: 2018, tmdbId: 424694, imdbRating: 7.9 },
      { title: 'A Star Is Born', year: 2018, tmdbId: 332562, imdbRating: 7.6 },
      { title: 'Guardians of the Galaxy', year: 2014, tmdbId: 118340, imdbRating: 8.0 },
      { title: 'Drive', year: 2011, tmdbId: 64635, imdbRating: 7.8 },
      { title: 'Sing Street', year: 2016, tmdbId: 369557, imdbRating: 7.7 },
    ],
  },
  {
    name: 'Cerita Ringan Weekend Vibes',
    icon: 'Popcorn',
    emoji: '🍿',
    description: 'Santai, seru, dan bikin happy!',
    films: [
      { title: 'The Intern', year: 2015, tmdbId: 256591, imdbRating: 7.1 },
      { title: 'Crazy Rich Asians', year: 2018, tmdbId: 455207, imdbRating: 6.9 },
      { title: 'Mamma Mia!', year: 2008, tmdbId: 11631, imdbRating: 6.4 },
      { title: 'The Proposal', year: 2009, tmdbId: 18239, imdbRating: 6.7 },
      { title: 'Pitch Perfect', year: 2012, tmdbId: 114150, imdbRating: 7.1 },
      { title: 'Legally Blonde', year: 2001, tmdbId: 8835, imdbRating: 6.4 },
      { title: '10 Things I Hate About You', year: 1999, tmdbId: 4951, imdbRating: 7.3 },
      { title: 'Mean Girls', year: 2004, tmdbId: 10625, imdbRating: 7.1 },
    ],
  },
  {
    name: 'Film Survival & Bertahan Hidup',
    icon: 'Mountain',
    emoji: '🏔️',
    description: 'Perjuangan melawan alam dan batas manusia',
    films: [
      { title: 'The Revenant', year: 2015, tmdbId: 281957, imdbRating: 8.0 },
      { title: '127 Hours', year: 2010, tmdbId: 44115, imdbRating: 7.5 },
      { title: 'Cast Away', year: 2000, tmdbId: 8358, imdbRating: 7.8 },
      { title: 'Life of Pi', year: 2012, tmdbId: 87827, imdbRating: 7.9 },
      { title: 'The Grey', year: 2012, tmdbId: 75174, imdbRating: 6.8 },
      { title: 'All Is Lost', year: 2013, tmdbId: 198184, imdbRating: 6.9 },
      { title: 'Alive', year: 1993, tmdbId: 5765, imdbRating: 7.1 },
      { title: 'Into the Wild', year: 2007, tmdbId: 5915, imdbRating: 8.1 },
    ],
  },
  {
    name: 'Berdasarkan Kisah Nyata',
    icon: 'BookOpen',
    emoji: '📖',
    description: 'Kisah nyata yang lebih dramatis dari fiksi',
    films: [
      { title: "Schindler's List", year: 1993, tmdbId: 424, imdbRating: 9.0 },
      { title: 'The Pursuit of Happyness', year: 2006, tmdbId: 1402, imdbRating: 8.0 },
      { title: '12 Years a Slave', year: 2013, tmdbId: 76203, imdbRating: 8.1 },
      { title: 'Spotlight', year: 2015, tmdbId: 314365, imdbRating: 8.1 },
      { title: 'The Social Network', year: 2010, tmdbId: 37799, imdbRating: 7.8 },
      { title: 'Catch Me If You Can', year: 2002, tmdbId: 640, imdbRating: 8.1 },
      { title: 'A Beautiful Mind', year: 2001, tmdbId: 453, imdbRating: 8.2 },
      { title: 'The Imitation Game', year: 2014, tmdbId: 205596, imdbRating: 8.0 },
    ],
  },
  {
    name: 'Adaptasi Game & Anime Terbaik',
    icon: 'Gamepad2',
    emoji: '🎮',
    description: 'Dari layar game ke layar lebar — yang berhasil!',
    films: [
      { title: 'The Super Mario Bros. Movie', year: 2023, tmdbId: 502356, imdbRating: 7.0 },
      { title: 'Sonic the Hedgehog', year: 2020, tmdbId: 454626, imdbRating: 6.5 },
      { title: 'Detective Pikachu', year: 2019, tmdbId: 447404, imdbRating: 6.5 },
      { title: 'Werewolves Within', year: 2021, tmdbId: 721654, imdbRating: 6.1 },
      { title: 'Mortal Kombat', year: 2021, tmdbId: 460465, imdbRating: 6.1 },
      { title: 'Uncharted', year: 2022, tmdbId: 335787, imdbRating: 6.3 },
      { title: 'Sonic the Hedgehog 2', year: 2022, tmdbId: 675353, imdbRating: 6.5 },
      { title: 'Free Guy', year: 2021, tmdbId: 550988, imdbRating: 7.1 },
    ],
  },
  {
    name: 'Visual & Sinematografi Memukau',
    icon: 'Eye',
    emoji: '🌌',
    description: 'Setiap frame layak dijadikan wallpaper',
    films: [
      { title: 'Blade Runner 2049', year: 2017, tmdbId: 335984, imdbRating: 8.0 },
      { title: 'The Revenant', year: 2015, tmdbId: 281957, imdbRating: 8.0 },
      { title: '1917', year: 2019, tmdbId: 530915, imdbRating: 8.2 },
      { title: 'Life of Pi', year: 2012, tmdbId: 87827, imdbRating: 7.9 },
      { title: 'Mad Max: Fury Road', year: 2015, tmdbId: 76341, imdbRating: 8.1 },
      { title: 'Hero', year: 2002, tmdbId: 63, imdbRating: 7.9 },
      { title: 'Dune', year: 2021, tmdbId: 438631, imdbRating: 8.0 },
      { title: 'The Grand Budapest Hotel', year: 2014, tmdbId: 120467, imdbRating: 8.1 },
    ],
  },
];
