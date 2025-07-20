// Quran data with surah names and verse counts
export const quranSurahs = [
  { number: 1, name: "Al-Fatihah", verses: 7 },
  { number: 2, name: "Al-Baqarah", verses: 286 },
  { number: 3, name: "Ali 'Imran", verses: 200 },
  { number: 4, name: "An-Nisa", verses: 176 },
  { number: 5, name: "Al-Ma'idah", verses: 120 },
  { number: 6, name: "Al-An'am", verses: 165 },
  { number: 7, name: "Al-A'raf", verses: 206 },
  { number: 8, name: "Al-Anfal", verses: 75 },
  { number: 9, name: "At-Tawbah", verses: 129 },
  { number: 10, name: "Yunus", verses: 109 },
  { number: 11, name: "Hud", verses: 123 },
  { number: 12, name: "Yusuf", verses: 111 },
  { number: 13, name: "Ar-Ra'd", verses: 43 },
  { number: 14, name: "Ibrahim", verses: 52 },
  { number: 15, name: "Al-Hijr", verses: 99 },
  { number: 16, name: "An-Nahl", verses: 128 },
  { number: 17, name: "Al-Isra", verses: 111 },
  { number: 18, name: "Al-Kahf", verses: 110 },
  { number: 19, name: "Maryam", verses: 98 },
  { number: 20, name: "Taha", verses: 135 },
  { number: 21, name: "Al-Anbya", verses: 112 },
  { number: 22, name: "Al-Hajj", verses: 78 },
  { number: 23, name: "Al-Mu'minun", verses: 118 },
  { number: 24, name: "An-Nur", verses: 64 },
  { number: 25, name: "Al-Furqan", verses: 77 },
  { number: 26, name: "Ash-Shu'ara", verses: 227 },
  { number: 27, name: "An-Naml", verses: 93 },
  { number: 28, name: "Al-Qasas", verses: 88 },
  { number: 29, name: "Al-'Ankabut", verses: 69 },
  { number: 30, name: "Ar-Rum", verses: 60 },
  { number: 31, name: "Luqman", verses: 34 },
  { number: 32, name: "As-Sajdah", verses: 30 },
  { number: 33, name: "Al-Ahzab", verses: 73 },
  { number: 34, name: "Saba", verses: 54 },
  { number: 35, name: "Fatir", verses: 45 },
  { number: 36, name: "Ya-Sin", verses: 83 },
  { number: 37, name: "As-Saffat", verses: 182 },
  { number: 38, name: "Sad", verses: 88 },
  { number: 39, name: "Az-Zumar", verses: 75 },
  { number: 40, name: "Ghafir", verses: 85 },
  { number: 41, name: "Fussilat", verses: 54 },
  { number: 42, name: "Ash-Shuraa", verses: 53 },
  { number: 43, name: "Az-Zukhruf", verses: 89 },
  { number: 44, name: "Ad-Dukhan", verses: 59 },
  { number: 45, name: "Al-Jathiyah", verses: 37 },
  { number: 46, name: "Al-Ahqaf", verses: 35 },
  { number: 47, name: "Muhammad", verses: 38 },
  { number: 48, name: "Al-Fath", verses: 29 },
  { number: 49, name: "Al-Hujurat", verses: 18 },
  { number: 50, name: "Qaf", verses: 45 },
  { number: 51, name: "Adh-Dhariyat", verses: 60 },
  { number: 52, name: "At-Tur", verses: 49 },
  { number: 53, name: "An-Najm", verses: 62 },
  { number: 54, name: "Al-Qamar", verses: 55 },
  { number: 55, name: "Ar-Rahman", verses: 78 },
  { number: 56, name: "Al-Waqi'ah", verses: 96 },
  { number: 57, name: "Al-Hadid", verses: 29 },
  { number: 58, name: "Al-Mujadila", verses: 22 },
  { number: 59, name: "Al-Hashr", verses: 24 },
  { number: 60, name: "Al-Mumtahanah", verses: 13 },
  { number: 61, name: "As-Saff", verses: 14 },
  { number: 62, name: "Al-Jumu'ah", verses: 11 },
  { number: 63, name: "Al-Munafiqun", verses: 11 },
  { number: 64, name: "At-Taghabun", verses: 18 },
  { number: 65, name: "At-Talaq", verses: 12 },
  { number: 66, name: "At-Tahrim", verses: 12 },
  { number: 67, name: "Al-Mulk", verses: 30 },
  { number: 68, name: "Al-Qalam", verses: 52 },
  { number: 69, name: "Al-Haqqah", verses: 52 },
  { number: 70, name: "Al-Ma'arij", verses: 44 },
  { number: 71, name: "Nuh", verses: 28 },
  { number: 72, name: "Al-Jinn", verses: 28 },
  { number: 73, name: "Al-Muzzammil", verses: 20 },
  { number: 74, name: "Al-Muddaththir", verses: 56 },
  { number: 75, name: "Al-Qiyamah", verses: 40 },
  { number: 76, name: "Al-Insan", verses: 31 },
  { number: 77, name: "Al-Mursalat", verses: 50 },
  { number: 78, name: "An-Naba", verses: 40 },
  { number: 79, name: "An-Nazi'at", verses: 46 },
  { number: 80, name: "Abasa", verses: 42 },
  { number: 81, name: "At-Takwir", verses: 29 },
  { number: 82, name: "Al-Infitar", verses: 19 },
  { number: 83, name: "Al-Mutaffifin", verses: 36 },
  { number: 84, name: "Al-Inshiqaq", verses: 25 },
  { number: 85, name: "Al-Buruj", verses: 22 },
  { number: 86, name: "At-Tariq", verses: 17 },
  { number: 87, name: "Al-A'la", verses: 19 },
  { number: 88, name: "Al-Ghashiyah", verses: 26 },
  { number: 89, name: "Al-Fajr", verses: 30 },
  { number: 90, name: "Al-Balad", verses: 20 },
  { number: 91, name: "Ash-Shams", verses: 15 },
  { number: 92, name: "Al-Layl", verses: 21 },
  { number: 93, name: "Ad-Duhaa", verses: 11 },
  { number: 94, name: "Ash-Sharh", verses: 8 },
  { number: 95, name: "At-Tin", verses: 8 },
  { number: 96, name: "Al-'Alaq", verses: 19 },
  { number: 97, name: "Al-Qadr", verses: 5 },
  { number: 98, name: "Al-Bayyinah", verses: 8 },
  { number: 99, name: "Az-Zalzalah", verses: 8 },
  { number: 100, name: "Al-'Adiyat", verses: 11 },
  { number: 101, name: "Al-Qari'ah", verses: 11 },
  { number: 102, name: "At-Takathur", verses: 8 },
  { number: 103, name: "Al-'Asr", verses: 3 },
  { number: 104, name: "Al-Humazah", verses: 9 },
  { number: 105, name: "Al-Fil", verses: 5 },
  { number: 106, name: "Quraysh", verses: 4 },
  { number: 107, name: "Al-Ma'un", verses: 7 },
  { number: 108, name: "Al-Kawthar", verses: 3 },
  { number: 109, name: "Al-Kafirun", verses: 6 },
  { number: 110, name: "An-Nasr", verses: 3 },
  { number: 111, name: "Al-Masad", verses: 5 },
  { number: 112, name: "Al-Ikhlas", verses: 4 },
  { number: 113, name: "Al-Falaq", verses: 5 },
  { number: 114, name: "An-Nas", verses: 6 }
];

// Juz mapping - each juz contains the surah numbers that belong to it
export const juzMapping: Record<number, number[]> = {
  1: [1, 2], // Al-Fatihah, Al-Baqarah (1-141)
  2: [2], // Al-Baqarah (142-252)
  3: [2, 3], // Al-Baqarah (253-286), Ali 'Imran (1-92)
  4: [3, 4], // Ali 'Imran (93-200), An-Nisa (1-23)
  5: [4], // An-Nisa (24-147)
  6: [4, 5], // An-Nisa (148-176), Al-Ma'idah (1-81)
  7: [5, 6], // Al-Ma'idah (82-120), Al-An'am (1-110)
  8: [6, 7], // Al-An'am (111-165), Al-A'raf (1-87)
  9: [7, 8], // Al-A'raf (88-206), Al-Anfal (1-40)
  10: [8, 9], // Al-Anfal (41-75), At-Tawbah (1-92)
  11: [9, 10, 11], // At-Tawbah (93-129), Yunus (1-109), Hud (1-5)
  12: [11, 12], // Hud (6-123), Yusuf (1-52)
  13: [12, 13, 14], // Yusuf (53-111), Ar-Ra'd (1-43), Ibrahim (1-52)
  14: [15, 16], // Al-Hijr (1-99), An-Nahl (1-128)
  15: [17, 18], // Al-Isra (1-111), Al-Kahf (1-74)
  16: [18, 19, 20], // Al-Kahf (75-110), Maryam (1-98), Taha (1-135)
  17: [21, 22], // Al-Anbya (1-112), Al-Hajj (1-78)
  18: [23, 24, 25], // Al-Mu'minun (1-118), An-Nur (1-64), Al-Furqan (1-20)
  19: [25, 26, 27], // Al-Furqan (21-77), Ash-Shu'ara (1-227), An-Naml (1-55)
  20: [27, 28, 29], // An-Naml (56-93), Al-Qasas (1-88), Al-'Ankabut (1-45)
  21: [29, 30, 31, 32, 33], // Al-'Ankabut (46-69), Ar-Rum (1-60), Luqman (1-34), As-Sajdah (1-30), Al-Ahzab (1-30)
  22: [33, 34, 35, 36], // Al-Ahzab (31-73), Saba (1-54), Fatir (1-45), Ya-Sin (1-27)
  23: [36, 37, 38, 39], // Ya-Sin (28-83), As-Saffat (1-182), Sad (1-88), Az-Zumar (1-31)
  24: [39, 40, 41], // Az-Zumar (32-75), Ghafir (1-85), Fussilat (1-46)
  25: [41, 42, 43, 44, 45], // Fussilat (47-54), Ash-Shura (1-53), Az-Zukhruf (1-89), Ad-Dukhan (1-59), Al-Jathiyah (1-37)
  26: [46, 47, 48, 49, 50, 51], // Al-Ahqaf (1-35), Muhammad (1-38), Al-Fath (1-29), Al-Hujurat (1-18), Qaf (1-45), Adh-Dhariyat (1-30)
  27: [51, 52, 53, 54, 55, 56, 57], // Adh-Dhariyat (31-60), At-Tur (1-49), An-Najm (1-62), Al-Qamar (1-55), Ar-Rahman (1-78), Al-Waqi'ah (1-96), Al-Hadid (1-29)
  28: [58, 59, 60, 61, 62, 63, 64, 65, 66], // Al-Mujadilah (1-22), Al-Hashr (1-24), Al-Mumtahanah (1-13), As-Saff (1-14), Al-Jumu'ah (1-11), Al-Munafiqun (1-11), At-Taghabun (1-18), At-Talaq (1-12), At-Tahrim (1-12)
  29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], // Al-Mulk (1-30), Al-Qalam (1-52), Al-Haqqah (1-52), Al-Ma'arij (1-44), Nuh (1-28), Al-Jinn (1-28), Al-Muzzammil (1-20), Al-Muddathir (1-56), Al-Qiyamah (1-40), Al-Insan (1-31), Al-Mursalat (1-50)
  30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] // Juz 30 surahs (An-Naba to An-Nas)
};

// Total verses in the Quran
export const TOTAL_QURAN_VERSES = 6236;

// Total pages in Tilawati curriculum
export const TOTAL_TILAWATI_PAGES = 44;

export const getSurahByName = (name: string) => {
  // Normalize the input name
  const normalizedInput = name
    .toLowerCase()
    .replace(/[''`-]/g, '') // Remove special characters
    .replace(/^(al|at|an|ar|ad|as|ash|az)[\s-]*/i, ''); // Remove Arabic article prefixes

  return quranSurahs.find(surah => {
    // Normalize the surah name
    const normalizedSurah = surah.name
      .toLowerCase()
      .replace(/[''`-]/g, '')
      .replace(/^(al|at|an|ar|ad|as|ash|az)[\s-]*/i, '');

    return normalizedSurah === normalizedInput ||
           normalizedSurah.includes(normalizedInput) ||
           normalizedInput.includes(normalizedSurah);
  });
};

export const getSurahByNumber = (number: number) => {
  return quranSurahs.find(surah => surah.number === number);
};

// Get juz by surah number
export const getJuzBySurah = (surahNumber: number): number => {
  for (const [juz, surahs] of Object.entries(juzMapping)) {
    if (surahs.includes(surahNumber)) {
      return parseInt(juz);
    }
  }
  return 0; // Default if not found
};

// Get surahs by juz number
export const getSurahsByJuz = (juzNumber: number) => {
  const surahNumbers = juzMapping[juzNumber] || [];
  return quranSurahs.filter(surah => surahNumbers.includes(surah.number));
};

// Get all juz options for dropdown
export const getJuzOptions = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`
  }));
};
