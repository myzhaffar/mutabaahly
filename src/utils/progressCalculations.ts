
import { quranSurahs, TOTAL_QURAN_VERSES, TOTAL_TILAWATI_PAGES, getSurahByName } from './quranData';

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

export const calculateHafalanProgress = (entries: ProgressEntry[]) => {
  if (!entries || entries.length === 0) {
    return { percentage: 0, last_surah: null, total_verses: 0 };
  }

  let totalMemorizedVerses = 0;
  let lastSurah = null;
  let lastDate = '';

  // Sort entries by date to get the most recent
  const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate total verses memorized
  entries.forEach(entry => {
    if (entry.surah_or_jilid && entry.ayat_or_page) {
      const surah = getSurahByName(entry.surah_or_jilid);
      if (surah) {
        // Parse ayat range (e.g., "1-10" or "5")
        const ayatRange = entry.ayat_or_page;
        let versesInEntry = 0;

        if (ayatRange.includes('-')) {
          const [start, end] = ayatRange.split('-').map(num => parseInt(num.trim()));
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            versesInEntry = end - start + 1;
          }
        } else {
          const singleVerse = parseInt(ayatRange);
          if (!isNaN(singleVerse)) {
            versesInEntry = 1;
          }
        }

        totalMemorizedVerses += versesInEntry;
      }
    }
  });

  // Get the most recent surah
  if (sortedEntries.length > 0 && sortedEntries[0].surah_or_jilid) {
    lastSurah = sortedEntries[0].surah_or_jilid;
  }

  const percentage = Math.min(Math.round((totalMemorizedVerses / TOTAL_QURAN_VERSES) * 100), 100);

  return {
    percentage,
    last_surah: lastSurah,
    total_verses: totalMemorizedVerses
  };
};

export const calculateTilawahProgress = (entries: ProgressEntry[]) => {
  if (!entries || entries.length === 0) {
    return { percentage: 0, jilid: null, total_pages: 0 };
  }

  let totalPages = 0;
  let currentJilid = null;

  // Sort entries by date to get the most recent
  const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate total pages completed
  entries.forEach(entry => {
    if (entry.ayat_or_page) {
      // Parse page number or range (e.g., "15" or "10-15")
      const pageRange = entry.ayat_or_page;
      let pagesInEntry = 0;

      if (pageRange.includes('-')) {
        const [start, end] = pageRange.split('-').map(num => parseInt(num.trim()));
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          pagesInEntry = end - start + 1;
        }
      } else {
        const singlePage = parseInt(pageRange);
        if (!isNaN(singlePage)) {
          pagesInEntry = 1;
        }
      }

      totalPages += pagesInEntry;
    }
  });

  // Get the most recent jilid
  if (sortedEntries.length > 0 && sortedEntries[0].surah_or_jilid) {
    currentJilid = sortedEntries[0].surah_or_jilid;
  }

  const percentage = Math.min(Math.round((totalPages / TOTAL_TILAWATI_PAGES) * 100), 100);

  return {
    percentage,
    jilid: currentJilid,
    total_pages: totalPages
  };
};
