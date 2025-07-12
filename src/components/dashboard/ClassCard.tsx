'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

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
  className: string;
  classStudents: Student[];
}

// Utility to generate a color from class name
function getAccentColor(className: string) {
  const colors = [
    'bg-gradient-to-br from-emerald-100 to-emerald-50',
    'bg-gradient-to-br from-blue-100 to-blue-50',
    'bg-gradient-to-br from-yellow-100 to-yellow-50',
    'bg-gradient-to-br from-pink-100 to-pink-50',
    'bg-gradient-to-br from-purple-100 to-purple-50',
    'bg-gradient-to-br from-orange-100 to-orange-50',
  ];
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const ClassCard: React.FC<ClassCardProps> = ({ className, classStudents }) => {
  const router = useRouter();
  const accent = getAccentColor(className);
  return (
    <div
      className={`relative rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 ${accent}`}
      tabIndex={0}
      aria-label={`View class ${className}`}
    >
      <div className="p-6 min-h-[170px] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900">{className}</span>
          </div>
          <div className="text-xs text-gray-400 mb-4">{classStudents.length} students</div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="w-full py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            onClick={() => router.push(`/class/${encodeURIComponent(className)}`)}
          >
            View Students in Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard; 