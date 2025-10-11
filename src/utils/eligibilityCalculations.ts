import { supabase } from '@/lib/supabase';
import type { TilawatiEligibility, TilawatiJilid } from '@/types/tilawati';

const PAGES_PER_TILAWATI_LEVEL = 44;

export const calculateTilawatiEligibility = async (
  studentId: string,
  currentLevel: TilawatiJilid | null
): Promise<TilawatiEligibility> => {
  try {
    // First, check if student has any Tilawati progress to determine their level
    const { data: allProgressEntries } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('type', 'tilawah')
      .like('surah_or_jilid', 'Level%')
      .order('date', { ascending: false });

    // Determine the actual level from progress entries
    let actualLevel = currentLevel;
    if (!actualLevel && allProgressEntries && allProgressEntries.length > 0) {
      actualLevel = allProgressEntries[0].surah_or_jilid as TilawatiJilid;
    }

    // Check if student is Tilawati (has Level progress or assigned Level)
    const isTilawatiStudent = actualLevel?.startsWith('Level') || 
                             (allProgressEntries && allProgressEntries.length > 0);
    
    if (!isTilawatiStudent) {
      return {
        isEligible: false,
        progress: 0,
        pagesCompleted: 0,
        currentLevel: currentLevel || 'Unknown',
        reason: 'Student is not a Tilawati student',
        status: 'already-passed',
        hasPendingTest: false,
        hasPassedTest: false,
        lastFailedDate: null,
        isTilawatiStudent: false
      };
    }

    // Get progress entries for actual level
    const { data: progressEntries } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('type', 'tilawah')
      .eq('surah_or_jilid', actualLevel || '')
      .order('date', { ascending: false });

    // Calculate pages completed
    let pagesCompleted = 0;
    if (progressEntries && progressEntries.length > 0) {
      const latestEntry = progressEntries[0];
      if (latestEntry.ayat_or_page) {
        const pageRange = latestEntry.ayat_or_page;
        if (pageRange.includes('-')) {
          const [, end] = pageRange.split('-').map((num: string) => parseInt(num.trim()));
          if (!isNaN(end)) pagesCompleted = end;
        } else {
          const pageNum = parseInt(pageRange.trim());
          if (!isNaN(pageNum)) pagesCompleted = pageNum;
        }
      }
    }

    // Clamp to max pages
    pagesCompleted = Math.min(pagesCompleted, PAGES_PER_TILAWATI_LEVEL);
    const progress = Math.round((pagesCompleted / PAGES_PER_TILAWATI_LEVEL) * 100);

    // Check for pending tests
    const { data: pendingTests } = await supabase
      .from('tilawati_level_tests')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'scheduled')
      .eq('tilawati_level', actualLevel || '');

    const hasPendingTest = (pendingTests?.length || 0) > 0;

    // Check for passed tests
    const { data: passedTests } = await supabase
      .from('tilawati_level_tests')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'passed')
      .eq('tilawati_level', actualLevel || '');

    const hasPassedTest = (passedTests?.length || 0) > 0;

    // Check for recent failures
    const { data: failedTests } = await supabase
      .from('tilawati_level_tests')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'failed')
      .eq('tilawati_level', actualLevel || '')
      .order('date', { ascending: false });

    const lastFailedDate = failedTests && failedTests.length > 0 
      ? new Date(failedTests[0].date) 
      : null;

    const daysSinceFailure = lastFailedDate 
      ? Math.floor((Date.now() - lastFailedDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const hasRecentFailure = lastFailedDate && daysSinceFailure && daysSinceFailure < 7;

    // Determine eligibility and status
    let isEligible = false;
    let status: TilawatiEligibility['status'] = 'ready';
    let reason = '';

    if (hasPassedTest) {
      status = 'already-passed';
      reason = 'Student has already passed this level';
    } else if (hasPendingTest) {
      status = 'pending-test';
      reason = 'Student has a scheduled test for this level';
    } else if (hasRecentFailure) {
      status = 'recently-failed';
      reason = `Student failed this level ${daysSinceFailure} days ago. Wait 7 days before retesting.`;
    } else if (pagesCompleted === PAGES_PER_TILAWATI_LEVEL) {
      status = 'ready';
      isEligible = true;
      reason = 'Student has completed the level and is ready for testing';
    } else {
      status = 'ready';
      reason = `Student has completed ${pagesCompleted}/${PAGES_PER_TILAWATI_LEVEL} pages. Need 100% completion.`;
    }

    return {
      isEligible,
      progress,
      pagesCompleted,
      currentLevel: actualLevel || 'Unknown',
      reason,
      status,
      hasPendingTest,
      hasPassedTest,
      lastFailedDate,
      isTilawatiStudent: true
    };

      } catch (error) {
      console.error('Error calculating eligibility:', error);
      return {
        isEligible: false,
        progress: 0,
        pagesCompleted: 0,
        currentLevel: currentLevel || 'Unknown',
        reason: 'Error calculating eligibility',
        status: 'already-passed',
        hasPendingTest: false,
        hasPassedTest: false,
        lastFailedDate: null,
        isTilawatiStudent: false
      };
    }
};

export const getStudentDisplayText = (student: { name: string; class_name: string; eligibility: TilawatiEligibility }) => {
  const { eligibility } = student;
  
  if (!eligibility.isTilawatiStudent) {
    return null; // Don't show Quranic students
  }
  
  if (eligibility.hasPassedTest) {
    return `${student.name} (${student.class_name}) - ${eligibility.currentLevel} - Already Passed`;
  }
  
  if (eligibility.hasPendingTest) {
    return `${student.name} (${student.class_name}) - ${eligibility.currentLevel} - Test Scheduled`;
  }
  
  if (eligibility.status === 'recently-failed') {
    const daysSince = eligibility.lastFailedDate 
      ? Math.floor((Date.now() - eligibility.lastFailedDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    return `${student.name} (${student.class_name}) - ${eligibility.currentLevel} - Recently Failed (${daysSince} days ago)`;
  }
  
  if (eligibility.pagesCompleted === PAGES_PER_TILAWATI_LEVEL) {
    return `${student.name} (${student.class_name}) - ${eligibility.currentLevel} - Ready for Test ✅`;
  }
  
  // Students not meeting criteria are not shown in dropdown
  return null;
}; 