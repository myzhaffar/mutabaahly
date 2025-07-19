import { ProgressEntry } from '@/types/progress';
import { getSurahByName } from './quranData';

// Constants for total verses and pages
const PAGES_PER_TILAWATI_LEVEL = 44; // Each Tilawati level has 44 pages

export const calculateHafalanProgress = (entries: ProgressEntry[]) => {
  if (!entries || entries.length === 0) {
    return { percentage: 0, last_surah: null, total_verses: 0 };
  }

  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get the latest date
  const latestDate = sortedEntries[0].date;
  // Get all entries for the latest date
  const latestDateEntries = entries.filter(e => e.date === latestDate);

  // Get the current surah from the latest entry
  const currentSurah = sortedEntries[0].surah_or_jilid;
  const surahData = currentSurah ? getSurahByName(currentSurah) : null;

  if (!surahData) {
    return { percentage: 0, last_surah: currentSurah, total_verses: 0 };
  }

  // Find the highest ayat memorized on the latest date
  let highestAyat = 0;
  for (const entry of latestDateEntries) {
    if (entry.ayat_or_page) {
      const ayatRange = entry.ayat_or_page;
      if (ayatRange.includes('-')) {
        const parts = ayatRange.split('-').map(num => parseInt(num.trim()));
        if (parts.length === 2 && !isNaN(parts[1])) {
          if (parts[1] > highestAyat) highestAyat = parts[1];
        }
      } else {
        const ayatNum = parseInt(ayatRange.trim());
        if (!isNaN(ayatNum) && ayatNum > highestAyat) highestAyat = ayatNum;
      }
    }
  }

  // Clamp to surah's total verses
  if (highestAyat > surahData.verses) highestAyat = surahData.verses;

  const percentage = Math.min(Math.round((highestAyat / surahData.verses) * 100), 100);

  return {
    percentage,
    last_surah: currentSurah,
    total_verses: highestAyat,
    latest_date: latestDate
  };
};

export const calculateTilawahProgress = (entries: ProgressEntry[]) => {
  if (!entries || entries.length === 0) {
    return { percentage: 0, jilid: null, total_pages: 0, surah: null, ayat: null };
  }

  // Sort entries by date to get the most recent
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Find the latest Quran surah entry (if any)
  const quranEntry = sortedEntries.find(e =>
    e.surah_or_jilid && !/^level\s*\d+$/i.test(e.surah_or_jilid.trim())
  );
  // Find the latest Tilawati entry (if any)
  const tilawatiEntry = sortedEntries.find(e =>
    e.surah_or_jilid && /^level\s*\d+$/i.test(e.surah_or_jilid.trim())
  );

  // If there is a Quran surah entry, calculate based on ayat/verse
  if (quranEntry) {
    const surahName = quranEntry.surah_or_jilid;
    const surahData = surahName ? getSurahByName(surahName) : null;
    let ayat = 0;
    if (quranEntry.ayat_or_page) {
      const ayatRange = quranEntry.ayat_or_page;
      if (ayatRange.includes('-')) {
        const [, end] = ayatRange.split('-').map(num => parseInt(num.trim()));
        if (!isNaN(end)) ayat = end;
      } else {
        const ayatNum = parseInt(quranEntry.ayat_or_page.trim());
        if (!isNaN(ayatNum)) ayat = ayatNum;
      }
    }
    const percentage = surahData && ayat > 0 ? Math.min(Math.round((ayat / surahData.verses) * 100), 100) : 0;
    return {
      percentage,
      jilid: null,
      total_pages: 0,
      surah: surahName,
      ayat: ayat || null
    };
  }

  // If there is a Tilawati entry, calculate based on pages
  if (tilawatiEntry) {
    const jilid = tilawatiEntry.surah_or_jilid;
    let currentPage = 0;
    if (tilawatiEntry.ayat_or_page) {
      const pageRange = tilawatiEntry.ayat_or_page;
      if (pageRange && pageRange.includes('-')) {
        const [, end] = pageRange.split('-').map(num => parseInt(num.trim()));
        if (!isNaN(end)) currentPage = end;
      } else if (pageRange) {
        const pageNum = parseInt(pageRange.trim());
        if (!isNaN(pageNum)) currentPage = pageNum;
      }
    }
    const percentage = Math.min(Math.round((currentPage / PAGES_PER_TILAWATI_LEVEL) * 100), 100);
    return {
      percentage,
      jilid,
      total_pages: currentPage,
      surah: null,
      ayat: null
    };
  }

  // Default fallback
  return { percentage: 0, jilid: null, total_pages: 0, surah: null, ayat: null };
};
