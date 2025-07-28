'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Student {
  id: string;
  name: string;
  grade: string;
  group_name: string;
  teacher: string;
  photo: string | null;
  hafalan_progress: {
    percentage: number;
    last_surah: string | null;
  } | null;
  tilawah_progress: {
    percentage: number;
    jilid: string | null;
  } | null;
}

interface ClassCardProps {
  grade: string;
  students: Student[];
  classes: string[];
}

// Utility to generate a color from grade
function getGradeColor(grade: string) {
  const gradeColors = {
    '1': 'from-green-500 to-emerald-500',
    '2': 'from-blue-500 to-cyan-500', 
    '3': 'from-purple-500 to-indigo-500',
    '4': 'from-orange-500 to-red-500',
    '5': 'from-pink-500 to-rose-500',
    '6': 'from-teal-500 to-green-500',
    '7': 'from-indigo-500 to-purple-500',
    '8': 'from-yellow-500 to-orange-500',
    '9': 'from-red-500 to-pink-500',
    '10': 'from-emerald-500 to-teal-500',
  };
  
  const gradeNumber = grade.replace(/\D/g, '');
  return gradeColors[gradeNumber as keyof typeof gradeColors] || 'from-gray-500 to-gray-600';
}

// Get top 3 performers based on combined progress
function getTopPerformers(students: Student[]) {
  return students
    .map(student => {
      const hafalanProgress = student.hafalan_progress?.percentage || 0;
      const tilawahProgress = student.tilawah_progress?.percentage || 0;
      const combinedProgress = (hafalanProgress + tilawahProgress) / 2;
      
      return {
        ...student,
        combinedProgress
      };
    })
    .sort((a, b) => b.combinedProgress - a.combinedProgress)
    .slice(0, 3);
}

// Format grade display to ensure consistency
function formatGrade(grade: string): string {
  // If grade is just a number (like "6"), return it as is
  if (/^\d+$/.test(grade)) {
    return grade;
  }
  
  // If grade already includes the word "Grade" (like "Grade 6"), extract just the number
  if (grade.toLowerCase().includes('grade')) {
    return grade.replace(/[^\d]/g, '');
  }
  
  // Otherwise, return the grade as is
  return grade;
}

const ClassCard: React.FC<ClassCardProps> = ({ grade, students, classes }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const topPerformers = getTopPerformers(students);
  const formattedGrade = formatGrade(grade);
  const gradeColor = getGradeColor(formattedGrade);
  
  return (
    <div
      className="group relative rounded-2xl shadow-lg hover:shadow-xl hover:shadow-amber-50/50 transition-all duration-300 overflow-hidden h-full flex flex-col"
      tabIndex={0}
      aria-label={`View grade ${formattedGrade}`}
    >
      {/* Head Section: Grade Name */}
      <div className="px-6 py-5 bg-gradient-to-r from-green-100 to-orange-100 text-emerald-700"
           style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
        <h3 className="text-2xl font-bold mb-1">Grade {formattedGrade}</h3>
        <div className="w-12 h-1 bg-white/60 rounded-full" />
      </div>

      {/* Body Section: Rest of the content */}
      <div className="relative z-10 p-6 bg-white flex flex-col h-full" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
        {/* Student Count */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" className="text-gray-400 fill-current">
              <path d="m22.004,4.498c.001-.865-.525-1.61-1.34-1.898L14.199.319c-1.388-.491-2.916-.492-4.303-.006L3.353,2.603c-.818.286-1.346,1.03-1.346,1.896,0,.867.529,1.611,1.347,1.896l2.646.923v1.682c0,3.309,2.691,6,6,6s6-2.691,6-6v-1.682l2-.698v4.379c0,.552.448,1,1,1s1-.448,1-1v-6.477c0-.009.004-.016.004-.025Zm-6.004,4.502c0,2.206-1.794,4-4,4s-4-1.794-4-4v-.984l1.861.649c.689.24,1.414.361,2.138.361s1.448-.121,2.137-.361l1.864-.65v.984Zm-2.522-2.223c-.953.333-2.004.333-2.957,0l-6.507-2.287,6.544-2.29h0c.478-.167.979-.251,1.482-.251.506,0,1.012.085,1.494.255l6.465,2.298-6.521,2.274Zm6.478,15.926c.164.527-.131,1.088-.658,1.252-.099.031-.199.045-.297.045-.426,0-.821-.275-.955-.704-.787-2.53-3.272-4.297-6.045-4.297s-5.258,1.767-6.045,4.297c-.164.528-.728.821-1.252.658-.527-.164-.822-.725-.658-1.252,1.044-3.358,4.315-5.703,7.955-5.703s6.911,2.345,7.955,5.703Z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">{students.length} {t('cards.classCard.students')}</span>
          </div>
        </div>

        {/* Top 3 Performers */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="text-gray-400 fill-current">
              <path d="m22.21.939c-.365-.588-.997-.939-1.689-.939h-3.009c-1.534,0-2.909.854-3.587,2.23l-1.861,3.773c-.021,0-.042-.003-.063-.003-.014,0-.027.002-.041.002l-1.861-3.772c-.679-1.376-2.053-2.23-3.587-2.23h-3.009c-.692,0-1.324.351-1.69.939-.365.588-.4,1.31-.094,1.931l3.232,6.553c-1.217,1.535-1.95,3.471-1.95,5.578,0,4.962,4.038,9,9,9s9-4.038,9-9c0-2.099-.728-4.027-1.937-5.56l3.241-6.57c.307-.621.271-1.343-.094-1.931Zm-15.699,1.061c.767,0,1.454.427,1.793,1.115l1.555,3.153c-1.264.31-2.424.884-3.416,1.666L3.502,2h3.009Zm5.489,20c-3.86,0-7-3.14-7-7,0-3.66,2.825-6.668,6.409-6.97.001,0,.002,0,.004,0,.194-.016.39-.03.588-.03,3.86,0,7,3.14,7,7s-3.14,7-7,7Zm5.57-14.055c-.99-.784-2.148-1.359-3.41-1.672l1.558-3.158c.339-.688,1.026-1.115,1.793-1.115l3-.015-2.94,5.96Zm-1.413,6.465c0,.361-.251.665-.539.825l-1.49.828.661,1.803c.128.349.012.741-.285.965h0c-.304.229-.723.226-1.023-.007l-1.482-1.146-1.482,1.146c-.301.232-.72.235-1.023.007h0c-.297-.224-.413-.615-.285-.965l.661-1.803-1.49-.828c-.288-.16-.539-.464-.539-.825,0-.306.266-.644.696-.644h2.14l.567-2.175c.09-.345.399-.585.755-.591.355.007.665.246.755.591l.567,2.175h2.14c.43,0,.696.337.696.644Z"/>
            </svg>
            <div className="flex -space-x-3">
              {topPerformers.map((student) => (
                <div
                  key={student.id}
                  className="relative"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                    {student.photo ? (
                      <Image
                        src={student.photo}
                        alt={student.name}
                        width={40}
                        height={40}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Tags */}
        <div className="mb-6 min-h-[48px]">
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <span 
                key={cls} 
                className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 ${gradeColor.replace('from-', 'from-').replace('to-', 'to-')} bg-opacity-10 text-gray-700 bg-white/80 backdrop-blur-sm`}
              >
                {cls}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Button
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-white"
            onClick={() => router.push(`/class/${encodeURIComponent(formattedGrade)}`)}
          >
            {t('cards.classCard.viewStudents')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard; 