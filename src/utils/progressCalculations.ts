import { ProgressEntry } from '@/types/progress';
import { getSurahByName } from './quranData';

// Constants for total verses and pages
const PAGES_PER_TILAWATI_LEVEL = 44; // Each Tilawati level has 44 pages

export const calculateHafalanProgress = (entries: ProgressEntry[]) => {
  if (!entries || entries.length === 0) {
    return { percentage: 0, last_surah: null, total_verses: 0 };
  }

  // Sort entries by date to get the most recent
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get the current surah from the latest entry
  const currentSurah = sortedEntries[0].surah_or_jilid;
  const surahData = currentSurah ? getSurahByName(currentSurah) : null;

  if (!surahData) {
    return { percentage: 0, last_surah: currentSurah, total_verses: 0 };
  }

  // Find the latest surah change date
  let latestSurahStartDate = new Date(sortedEntries[0].date);
  for (let i = 1; i < sortedEntries.length; i++) {
    if (sortedEntries[i].surah_or_jilid !== currentSurah) {
      latestSurahStartDate = new Date(sortedEntries[0].date);
      break;
    }
  }

  // Get all entries for the current surah after the latest surah change
  const currentSurahEntries = entries.filter(entry => 
    entry.surah_or_jilid === currentSurah && 
    new Date(entry.date) >= latestSurahStartDate
  );
  
  // Track which verses have been memorized
  const memorizedVerses = new Set<number>();

  // Process all entries for the current surah
  for (const entry of currentSurahEntries) {
    if (entry.ayat_or_page) {
        const ayatRange = entry.ayat_or_page;

        if (ayatRange.includes('-')) {
        // Handle verse range (e.g., "1-5")
          const [start, end] = ayatRange.split('-').map(num => parseInt(num.trim()));
          if (!isNaN(start) && !isNaN(end) && end >= start) {
          // Add all verses in the range to the set
          for (let verse = start; verse <= end; verse++) {
            if (verse <= surahData.verses) { // Only add if within surah's verse count
              memorizedVerses.add(verse);
            }
          }
          }
        } else {
        // Handle single verse
        const verse = parseInt(ayatRange);
        if (!isNaN(verse) && verse <= surahData.verses) {
          memorizedVerses.add(verse);
      }
    }
    }
  }

  // Calculate percentage based on unique verses memorized out of total verses in the surah
  const uniqueVersesMemorized = memorizedVerses.size;
  const percentage = Math.min(Math.round((uniqueVersesMemorized / surahData.verses) * 100), 100);

  return {
    percentage,
    last_surah: currentSurah,
    total_verses: uniqueVersesMemorized,
    start_date: latestSurahStartDate.toISOString().split('T')[0] // Add start date for reference
  };
};

export const calculateTilawahProgress = (entries: ProgressEntry[]) => {
  if (!entries || entries.length === 0) {
    return { percentage: 0, jilid: null, total_pages: 0 };
  }

  // Sort entries by date to get the most recent
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get the most recent entry to determine current page and jilid
  const latestEntry = sortedEntries[0];
  let currentPage = 0;
  let currentJilid = null;

  if (latestEntry) {
    currentJilid = latestEntry.surah_or_jilid;

    // Parse the page number from the latest entry
    if (latestEntry.ayat_or_page) {
      const pageRange = latestEntry.ayat_or_page;

      if (pageRange && pageRange.includes('-')) {
        // If it's a range, take the higher number
        const [, end] = pageRange.split('-').map(num => parseInt(num.trim()));
        if (!isNaN(end)) {
          currentPage = end;
        }
      } else if (pageRange) {
        // If it's a single number
        const pageNum = parseInt(pageRange.trim());
        if (!isNaN(pageNum)) {
          currentPage = pageNum;
        }
      }
    }
  }

  // Calculate percentage based on current page out of 44 pages
  const percentage = Math.min(Math.round((currentPage / PAGES_PER_TILAWATI_LEVEL) * 100), 100);

  return {
    percentage,
    jilid: currentJilid,
    total_pages: currentPage
  };
};
