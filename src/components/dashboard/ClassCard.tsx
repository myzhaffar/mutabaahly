'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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

const ClassCard: React.FC<ClassCardProps> = ({ grade, students, classes }) => {
  const router = useRouter();
  const topPerformers = getTopPerformers(students);
  const gradeColor = getGradeColor(grade);
  
  return (
    <div
      className="group relative rounded-2xl shadow-lg hover:shadow-xl hover:shadow-amber-50/50 transition-all duration-300 overflow-hidden"
      tabIndex={0}
      aria-label={`View grade ${grade}`}
    >
      {/* Head Section: Grade Name */}
      <div className="px-6 py-5 bg-gradient-to-r from-green-500 to-orange-400 text-white"
           style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
        <h3 className="text-2xl font-bold mb-1">Grade {grade}</h3>
        <div className="w-12 h-1 bg-white/60 rounded-full" />
      </div>

      {/* Body Section: Rest of the content */}
      <div className="relative z-10 p-6 bg-white" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
        {/* Student Count */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            {/* Removed student count icon */}
            <span className="text-sm font-medium text-gray-700">{students.length} students</span>
          </div>
        </div>

        {/* Top 3 Performers */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            {/* Removed user icon before avatars */}
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
        <div className="mb-6">
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
        <Button
          className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-white"
          onClick={() => router.push(`/class/${encodeURIComponent(grade)}`)}
        >
          View Students
        </Button>
      </div>
    </div>
  );
};

export default ClassCard; 