import { supabase } from '@/integrations/supabase/client';
import { calculateHafalanProgress, calculateTilawahProgress } from './progressCalculations';
import { ProgressEntry } from '@/types/progress';
import { getJuzBySurah, quranSurahs } from './quranData';

export interface StudentRankingData {
  id: string;
  name: string;
  class: string;
  teacher: string;
  teacherId: string;
  grade: string;
  // Tilawati specific
  level?: number | undefined;
  page?: number;
  // Hafalan specific
  juz: number | null;
  surah: string | null;
  verse: number;
  // Common
  progress: number;
}

export interface RankingFilters {
  teacher: string;
  grade: string;
}

export const fetchTilawatiRankingData = async (filters: RankingFilters): Promise<StudentRankingData[]> => {
  try {
    // Build the query based on filters
    let query = supabase
      .from('students')
      .select(`
        id,
        name,
        group_name,
        teacher
      `);

    // Apply filters
    if (filters.teacher) {
      query = query.eq('teacher', filters.teacher);
    }
    if (filters.grade && filters.grade !== 'all') {
      if (filters.grade.includes(',')) {
        const gradeArr = filters.grade.split(',').map(g => g.trim()).filter(Boolean);
        query = query.in('group_name', gradeArr);
      } else {
        query = query.eq('group_name', filters.grade);
      }
    }

    const { data: students, error } = await query;

    if (error) {
      console.error('Error fetching students for Tahsin ranking:', error);
      return [];
    }

    if (!students || students.length === 0) {
      return [];
    }

    // Fetch progress data for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        try {
          // Fetch progress entries for tilawah (tahsin)
          const { data: tilawahEntries } = await supabase
            .from('progress_entries')
            .select('*')
            .eq('student_id', student.id)
            .eq('type', 'tilawah')
            .order('date', { ascending: false });

          const calculatedProgress = calculateTilawahProgress(tilawahEntries || []);

          // If student has Quran progress (surah is a valid surah name), treat as Quran
          const surahIsQuran = calculatedProgress.surah && isNaN(Number(calculatedProgress.surah));
          if (surahIsQuran) {
            return {
              id: student.id,
              name: student.name,
              class: student.group_name || 'Unknown',
              teacher: student.teacher || 'Unknown',
              teacherId: student.teacher,
              grade: student.group_name || 'Unknown',
              level: undefined,
              page: undefined,
              surah: calculatedProgress.surah,
              verse: calculatedProgress.ayat || 0,
              progress: calculatedProgress.percentage,
              standing: 'quran',
              juz: null,
            };
          } else if (calculatedProgress.jilid || (!isNaN(Number(calculatedProgress.surah)))) {
            // Otherwise, treat as Tilawati (either jilid or surah is a number)
            const levelNumber = getTilawatiLevelNumber(calculatedProgress.jilid || calculatedProgress.surah);
            const currentPage = calculatedProgress.total_pages || calculatedProgress.ayat || 0;
            
            return {
              id: student.id,
              name: student.name,
              class: student.group_name || 'Unknown',
              teacher: student.teacher || 'Unknown',
              teacherId: student.teacher,
              grade: student.group_name || 'Unknown',
              level: levelNumber,
              page: currentPage,
              surah: null,
              verse: 0,
              progress: calculatedProgress.percentage,
              standing: 'tilawati',
              juz: null,
            };
          } else {
            // No progress
            return null;
          }
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error);
          return null;
        }
      })
    );

    // Filter out students with no progress
    const validStudents = studentsWithProgress.filter(student => student !== null);

    // Sort: All Quran students first (regardless of surah/ayat), then Tilawati students by level/page
    const sortedStudents = validStudents.sort((a, b) => {
      // Quran students first (regardless of surah/ayat)
      if (a.standing === 'quran' && b.standing !== 'quran') return -1;
      if (a.standing !== 'quran' && b.standing === 'quran') return 1;
      // Among Quran students, rank by surah number DESC (An-Nas=114 highest), then ayat DESC
      if (a.standing === 'quran' && b.standing === 'quran') {
        const surahRankA = getSurahRank(a.surah);
        const surahRankB = getSurahRank(b.surah);
        if (surahRankA !== surahRankB) return surahRankB - surahRankA;
        return (b.verse || 0) - (a.verse || 0);
      }
      // Among Tilawati students only, by level DESC, then page DESC only if level is the same
      if (a.standing === 'tilawati' && b.standing === 'tilawati') {
        const levelA = a.level || 0;
        const levelB = b.level || 0;
        if (levelA !== levelB) return levelB - levelA;
        // Only compare page if level is the same
        return (b.page || 0) - (a.page || 0);
      }
      // Otherwise, keep original order
      return 0;
    });

    return sortedStudents;

  } catch (error) {
    console.error('Error in fetchTilawatiRankingData:', error);
    return [];
  }
};

export const fetchHafalanRankingData = async (filters: RankingFilters): Promise<StudentRankingData[]> => {
  try {
    // Build the query based on filters
    let query = supabase
      .from('students')
      .select(`
        id,
        name,
        group_name,
        teacher
      `);

    // Apply filters
    if (filters.teacher) {
      if (filters.teacher.includes(',')) {
        const teacherArr = filters.teacher.split(',').map(t => t.trim()).filter(Boolean);
        query = query.in('teacher', teacherArr);
      } else {
        query = query.eq('teacher', filters.teacher);
      }
    }
    if (filters.grade && filters.grade !== 'all') {
      if (filters.grade.includes(',')) {
        const gradeArr = filters.grade.split(',').map(g => g.trim()).filter(Boolean);
        query = query.in('group_name', gradeArr);
      } else {
        query = query.eq('group_name', filters.grade);
      }
    }

    const { data: students, error } = await query;

    if (error) {
      console.error('Error fetching students for Hafalan ranking:', error);
      return [];
    }

    if (!students || students.length === 0) {
      return [];
    }

    // Fetch progress data for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        try {
          // Fetch progress entries first
          const { data: hafalanEntries, error: entriesError } = await supabase
            .from('progress_entries')
            .select('*')
            .eq('student_id', student.id)
            .eq('type', 'hafalan')
            .order('date', { ascending: false });

          if (entriesError) {
            console.error(`Error fetching hafalan entries for student ${student.id}:`, entriesError);
            return null;
          }

          // Calculate progress from entries
          const calculatedProgress = calculateHafalanProgress(hafalanEntries || []);

          // Get current surah and verse information
          const currentSurah = calculatedProgress.last_surah;
          const currentVerse = getCurrentVerse(hafalanEntries || []);
          
          // Calculate juz based on surah
          let currentJuz = null;
          if (currentSurah) {
            const surah = quranSurahs.find(s => s.name === currentSurah);
            if (surah) {
              currentJuz = getJuzBySurah(surah.number);
            }
          }

          return {
            id: student.id,
            name: student.name,
            class: student.group_name || 'Unknown',
            teacher: student.teacher || 'Unknown',
            teacherId: student.teacher,
            grade: student.group_name || 'Unknown',
            juz: currentJuz,
            surah: currentSurah,
            verse: currentVerse,
            progress: calculatedProgress.percentage
          };
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and sort by custom ranking logic
    const sortedStudents = studentsWithProgress
      .filter((student): student is StudentRankingData =>
        student !== null &&
        typeof student.verse === 'number' &&
        student.verse > 0
      )
      .sort((a, b) => {
      // First, rank by Juz (lower Juz = higher rank, so Juz 1 > Juz 30)
      if (a.juz !== null && b.juz !== null && a.juz !== b.juz) {
        return a.juz - b.juz; // Lower juz number = higher rank
      }
      
      // If one has Juz and other doesn't, the one with Juz ranks higher
      if (a.juz !== null && b.juz === null) return -1; // a is higher
      if (a.juz === null && b.juz !== null) return 1;  // b is higher
      
      // If both have same Juz or both have null Juz, rank by Surah
      const surahRankA = getSurahRank(a.surah);
      const surahRankB = getSurahRank(b.surah);
      
      if (surahRankA !== surahRankB) {
        return surahRankA - surahRankB; // Lower surah number = higher rank
      }
      
      // If same Surah, rank by verse (higher verse = higher rank)
      return b.verse - a.verse;
    });

    return sortedStudents;

  } catch (error) {
    console.error('Error in fetchHafalanRankingData:', error);
    return [];
  }
};

// Helper functions
const getTilawatiLevelNumber = (jilid: string | null): number | undefined => {
  if (!jilid) return undefined;
  
  // Extract level number from jilid (e.g., "Jilid 1" -> 1, "Level 2" -> 2, "2" -> 2)
  const match = jilid.match(/(?:Jilid|Level)\s*(\d+)/i) || jilid.match(/(\d+)/);
  return match ? parseInt(match[1]) : undefined;
};

// Get general Surah rank (Surah number)
const getSurahRank = (surahName: string | null): number => {
  if (!surahName) return 0;
  
  const surahNumbers: Record<string, number> = {
    'Al-Fatiha': 1,
    'Al-Baqarah': 2,
    'Al-Imran': 3,
    'An-Nisa': 4,
    'Al-Ma\'idah': 5,
    'Al-An\'am': 6,
    'Al-A\'raf': 7,
    'Al-Anfal': 8,
    'At-Tawbah': 9,
    'Yunus': 10,
    'Hud': 11,
    'Yusuf': 12,
    'Ar-Ra\'d': 13,
    'Ibrahim': 14,
    'Al-Hijr': 15,
    'An-Nahl': 16,
    'Al-Isra': 17,
    'Al-Kahf': 18,
    'Maryam': 19,
    'Ta-Ha': 20,
    'Al-Anbiya': 21,
    'Al-Hajj': 22,
    'Al-Mu\'minun': 23,
    'An-Nur': 24,
    'Al-Furqan': 25,
    'Ash-Shu\'ara': 26,
    'An-Naml': 27,
    'Al-Qasas': 28,
    'Al-Ankabut': 29,
    'Ar-Rum': 30,
    'Luqman': 31,
    'As-Sajdah': 32,
    'Al-Ahzab': 33,
    'Saba': 34,
    'Fatir': 35,
    'Ya-Sin': 36,
    'As-Saffat': 37,
    'Sad': 38,
    'Az-Zumar': 39,
    'Ghafir': 40,
    'Fussilat': 41,
    'Ash-Shura': 42,
    'Az-Zukhruf': 43,
    'Ad-Dukhan': 44,
    'Al-Jathiyah': 45,
    'Al-Ahqaf': 46,
    'Muhammad': 47,
    'Al-Fath': 48,
    'Al-Hujurat': 49,
    'Qaf': 50,
    'Adh-Dhariyat': 51,
    'At-Tur': 52,
    'An-Najm': 53,
    'Al-Qamar': 54,
    'Ar-Rahman': 55,
    'Al-Waqi\'ah': 56,
    'Al-Hadid': 57,
    'Al-Mujadilah': 58,
    'Al-Hashr': 59,
    'Al-Mumtahanah': 60,
    'As-Saff': 61,
    'Al-Jumu\'ah': 62,
    'Al-Munafiqun': 63,
    'At-Taghabun': 64,
    'At-Talaq': 65,
    'At-Tahrim': 66,
    'Al-Mulk': 67,
    'Al-Qalam': 68,
    'Al-Haqqah': 69,
    'Al-Ma\'arij': 70,
    'Nuh': 71,
    'Al-Jinn': 72,
    'Al-Muzzammil': 73,
    'Al-Muddathir': 74,
    'Al-Qiyamah': 75,
    'Al-Insan': 76,
    'Al-Mursalat': 77,
    'An-Naba': 78,
    'An-Nazi\'at': 79,
    'Abasa': 80,
    'At-Takwir': 81,
    'Al-Infitar': 82,
    'Al-Mutaffifin': 83,
    'Al-Inshiqaq': 84,
    'Al-Buruj': 85,
    'At-Tariq': 86,
    'Al-A\'la': 87,
    'Al-Ghashiyah': 88,
    'Al-Fajr': 89,
    'Al-Balad': 90,
    'Ash-Shams': 91,
    'Al-Layl': 92,
    'Ad-Duha': 93,
    'Ash-Sharh': 94,
    'At-Tin': 95,
    'Al-Alaq': 96,
    'Al-Qadr': 97,
    'Al-Bayyinah': 98,
    'Az-Zalzalah': 99,
    'Al-Adiyat': 100,
    'Al-Qari\'ah': 101,
    'At-Takathur': 102,
    'Al-Asr': 103,
    'Al-Humazah': 104,
    'Al-Fil': 105,
    'Quraish': 106,
    'Al-Ma\'un': 107,
    'Al-Kawthar': 108,
    'Al-Kafirun': 109,
    'An-Nasr': 110,
    'Al-Masad': 111,
    'Al-Ikhlas': 112,
    'Al-Falaq': 113,
    'An-Nas': 114
  };
  
  return surahNumbers[surahName] || 0;
};

const getCurrentVerse = (entries: ProgressEntry[]): number => {
  if (!entries || entries.length === 0) return 1;
  
  let highestVerse = 1;
  
  // Process all entries to find the highest verse
  for (const entry of entries) {
    if (entry.ayat_or_page) {
      const ayatText = entry.ayat_or_page.trim();
      
      // Handle verse ranges (e.g., "1-7", "5-10")
      if (ayatText.includes('-')) {
        const parts = ayatText.split('-');
        if (parts.length === 2) {
          const start = parseInt(parts[0].trim());
          const end = parseInt(parts[1].trim());
          if (!isNaN(start) && !isNaN(end)) {
            highestVerse = Math.max(highestVerse, end);
          }
        }
      } else {
        // Handle single verse (e.g., "5")
        const verse = parseInt(ayatText);
        if (!isNaN(verse)) {
          highestVerse = Math.max(highestVerse, verse);
        }
      }
    }
  }
  
  return highestVerse;
};

// Fetch teachers for filter dropdown
export const fetchTeachers = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const { data: teachers, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'teacher')
      .order('full_name');

    if (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }

    return teachers?.map(teacher => ({
      id: teacher.id,
      name: teacher.full_name
    })) || [];
  } catch (error) {
    console.error('Error in fetchTeachers:', error);
    return [];
  }
};

// Fetch grades for filter dropdown
export const fetchGrades = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const { data: grades, error } = await supabase
      .from('students')
      .select('group_name')
      .not('group_name', 'is', null);

    if (error) {
      console.error('Error fetching grades:', error);
      return [];
    }

    // Get unique grades
    const uniqueGrades = [...new Set(grades?.map(g => g.group_name).filter(Boolean))];
    
    return uniqueGrades.map(grade => ({
      id: grade,
      name: grade
    }));
  } catch (error) {
    console.error('Error in fetchGrades:', error);
    return [];
  }
};

// Fixed teacher list for dropdowns and filters
export const FIXED_TEACHERS = [
  { id: 'ade', name: 'Ustz. Ade' },
  { id: 'aliza', name: 'Ustz. Aliza' },
  { id: 'aulia', name: 'Ustz. Aulia' },
  { id: 'kholilah', name: 'Ustz. Kholilah' },
  { id: 'liana', name: 'Ustz. Liana' },
  { id: 'talia', name: 'Ustz. Talia' },
  { id: 'titin', name: 'Ustz. Titin' },
  { id: 'witri', name: 'Ustz. Witri' },
  { id: 'chasib', name: 'Ust. Chasib' },
  { id: 'hery', name: 'Ust. Hery' },
  { id: 'lalu', name: 'Ust. Lalu' },
  { id: 'rizky', name: 'Ust. Rizky' },
  { id: 'zaedun', name: 'Ust. Zaedun' },
]; 