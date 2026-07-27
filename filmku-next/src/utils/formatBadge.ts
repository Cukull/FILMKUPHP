export interface FormatBadge {
  label: string;
  className: string;
}

export function getFormatBadge(options: {
  genre?: string | null;
  sections?: string | null;
  title?: string | null;
  country?: string | null;
  originalLanguage?: string | null;
  mediaType?: string | null;
}): FormatBadge {
  const genreStr = (options.genre || '').toLowerCase();
  const sectionsStr = (options.sections || '').toLowerCase();
  const titleStr = (options.title || '').toLowerCase();
  const countryUpper = (options.country || '').toUpperCase();
  const langLower = (options.originalLanguage || '').toLowerCase();
  const mediaType = (options.mediaType || '').toLowerCase();

  // 1. Cek Drama Korea (Drakor)
  if (
    sectionsStr.includes('drama korea') ||
    sectionsStr.includes('drakor') ||
    genreStr.includes('drama korea') ||
    genreStr.includes('drakor') ||
    countryUpper === 'KR' ||
    countryUpper === 'KOR' ||
    langLower === 'ko'
  ) {
    return {
      label: 'Drakor',
      className: 'movie-status-badge badge-drakor',
    };
  }

  // 2. Cek Drama China (Drachin)
  if (
    sectionsStr.includes('drama china') ||
    sectionsStr.includes('drachin') ||
    genreStr.includes('drama china') ||
    genreStr.includes('drachin') ||
    genreStr.includes('chinese') ||
    countryUpper === 'CN' ||
    countryUpper === 'TW' ||
    countryUpper === 'HK' ||
    countryUpper === 'CHN' ||
    langLower === 'zh' ||
    langLower === 'cn'
  ) {
    return {
      label: 'Drachin',
      className: 'movie-status-badge badge-drachin',
    };
  }

  // 3. Cek TV Series (Tv Series)
  if (
    sectionsStr.includes('tv series') ||
    sectionsStr.includes('tv show') ||
    sectionsStr.includes('series') ||
    genreStr.includes('tv series') ||
    genreStr.includes('series') ||
    genreStr.includes('serial') ||
    mediaType === 'tv'
  ) {
    return {
      label: 'Tv Series',
      className: 'movie-status-badge badge-series',
    };
  }

  // 4. Default Film
  return {
    label: 'Film',
    className: 'movie-status-badge badge-film',
  };
}
