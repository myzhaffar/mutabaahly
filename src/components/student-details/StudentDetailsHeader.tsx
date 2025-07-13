'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  grade: string;
  group_name: string;
  teacher: string;
  photo: string | null;
}

interface StudentDetailsHeaderProps {
  student: Student;
  userRole: string;
  profile?: { role: string };
}

const StudentDetailsHeader: React.FC<StudentDetailsHeaderProps> = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 pt-2">
      {/* Left Section - Back Button and Title */}
      <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Details</h1>
      </div>
    </div>
  );
};

export default StudentDetailsHeader;
