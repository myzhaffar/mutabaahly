'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import StudentDetailsHeader from '@/components/student-details/StudentDetailsHeader';
import StudentOverviewCard from '@/components/student-details/StudentOverviewCard';
import DailyProgressTabs from '@/components/student-details/DailyProgressTabs';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useAuth } from '@/contexts/useAuth';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import ParentLayout from '@/components/layouts/ParentLayout';

const StudentDetails = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { profile } = useAuth();
  
  const {
    student,
    progressData,
    hafalanEntries,
    tilawahEntries,
    loading,
    refetchData
  } = useStudentDetails(id);

  const handleStudentDeleted = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
            <Button onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: student.group_name, href: `/class/${encodeURIComponent(student.group_name)}` },
    { label: student.name }
  ];

  const MainContent = (
    <>
      <StudentDetailsHeader
        student={{
          ...student,
          grade: student.grade || 'Unknown'
        }}
        userRole={profile?.role || 'parent'}
        profile={profile || undefined}
      />
      <StudentOverviewCard
        student={student}
        progressData={progressData}
        onProgressAdded={refetchData}
        onStudentUpdated={refetchData}
        onStudentDeleted={handleStudentDeleted}
      />
      <DailyProgressTabs
        hafalanEntries={hafalanEntries}
        tilawahEntries={tilawahEntries}
        onProgressUpdated={refetchData}
        studentId={student.id}
      />
    </>
  );
  if (profile?.role === 'parent') {
    return <ParentLayout breadcrumbs={breadcrumbs}>{MainContent}</ParentLayout>;
  }
  return <TeacherLayout breadcrumbs={breadcrumbs}>{MainContent}</TeacherLayout>;
};

export default StudentDetails;
