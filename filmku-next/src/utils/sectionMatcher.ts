export function inferMovieSections(options: {
  title?: string;
  genres?: string[];
  synopsis?: string;
  country?: string;
  originalLanguage?: string;
  mediaType?: 'movie' | 'tv' | string;
  rating?: number;
  status?: string;
  existingSections?: string[];
}): string[] {
  const {
    genres = [],
    country = '',
    originalLanguage = '',
    mediaType = '',
    status = '',
    existingSections = [],
  } = options;

  // Pertahankan section yang sudah dipilih admin (kecuali placeholder bahasa Inggris lama)
  const matched = new Set<string>(
    existingSections.filter(s => s && !s.includes('NEW_RELEASE') && !s.includes('POPULAR'))
  );

  // 1. Selalu sertakan 'Film Terbaru' sebagai default agar minimal 1 section terisi
  matched.add('Film Terbaru');

  const countryUpper = country.toUpperCase().trim();
  const langLower = originalLanguage.toLowerCase().trim();
  const genreLower = genres.map(g => g.toLowerCase().trim());

  const hasExactGenre = (...keywords: string[]) =>
    genreLower.some(g => keywords.some(k => g === k.toLowerCase() || g.includes(k.toLowerCase())));

  // 2. Tontonan Bareng Keluarga — HANYA jika genre resmi Animation/Animasi atau Family/Keluarga
  if (hasExactGenre('animation', 'animasi', 'family', 'keluarga')) {
    matched.add('Tontonan Bareng Keluarga');
  }

  // 3. Bikin Baper & Mewek — HANYA jika genre resmi Romance/Romantis atau Melodrama
  if (hasExactGenre('romance', 'romantis', 'melodrama')) {
    matched.add('Bikin Baper & Mewek');
  }

  // 4. Drama China — Jika kode negara CN/TW/HK/CHN, bahasa zh/cn, atau kategori/genre Drama China
  if (
    countryUpper === 'CN' ||
    countryUpper === 'TW' ||
    countryUpper === 'HK' ||
    countryUpper === 'CHN' ||
    langLower === 'zh' ||
    langLower === 'cn' ||
    hasExactGenre('drama china', 'drachin', 'chinese drama')
  ) {
    matched.add('Drama China');
  }

  // 5. Drama Korea — Jika kode negara KR/KOR, bahasa ko, atau kategori/genre Drama Korea
  if (
    countryUpper === 'KR' ||
    countryUpper === 'KOR' ||
    langLower === 'ko' ||
    hasExactGenre('drama korea', 'drakor', 'korean drama')
  ) {
    matched.add('Drama Korea');
  }

  // 6. TV Series — Jika tipe media adalah 'tv' atau serial / tv series
  if (
    mediaType === 'tv' ||
    hasExactGenre('tv series', 'series', 'serial', 'tv show', 'drama korea', 'drama china')
  ) {
    matched.add('TV Series');
  }

  // 7. Karya Anak Bangsa — HANYA jika kode negara resmi ID (Indonesia), IDN, atau bahasa id
  if (countryUpper === 'ID' || countryUpper === 'IDN' || langLower === 'id') {
    matched.add('Karya Anak Bangsa');
  }

  // 7. Misteri & Bikin Merinding — HANYA jika genre resmi Horror, Mystery, atau Thriller
  if (hasExactGenre('horror', 'horor', 'mystery', 'misteri', 'thriller')) {
    matched.add('Misteri & Bikin Merinding');
  }

  // 8. Aksi Penuh Adrenalin — HANYA jika genre resmi Action, Aksi, Crime, Kriminal, atau War
  if (hasExactGenre('action', 'aksi', 'crime', 'kriminal', 'war', 'perang')) {
    matched.add('Aksi Penuh Adrenalin');
  }

  // 9. Dunia Fantasi & Perang — HANYA jika genre resmi Fantasy, Sci-Fi, Science Fiction, atau Adventure
  if (hasExactGenre('fantasy', 'fantasi', 'sci-fi', 'fiksi ilmiah', 'science fiction', 'adventure', 'petualangan')) {
    matched.add('Dunia Fantasi & Perang');
  }

  // 10. Segera Tayang di Bioskop — HANYA jika status resmi UPCOMING
  if (status === 'UPCOMING') {
    matched.add('Segera Tayang di Bioskop');
  }

  // Catatan: Section editorial seperti 'Sorotan Layar Utama', 'Top Bulan Ini', 
  // 'Lagi Viral & Banyak Dicari', dan 'Peraih Penghargaan Bergengsi' 
  // TIDAK ditambahkan secara acak oleh sistem dan hanya mengandalkan pilihan kurasi Admin.

  return Array.from(matched);
}
