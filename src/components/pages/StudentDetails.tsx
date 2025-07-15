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
    loadingStudent,
    loadingProgress,
    refetchData
  } = useStudentDetails(id);

  const handleStudentDeleted = () => {
    router.push('/dashboard');
  };

  let breadcrumbs: { label: string; href?: string }[] = [];
  if (student) {
    breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: student.group_name, href: `/class/${encodeURIComponent(student.group_name)}` },
      { label: student.name }
    ];
  }

  const [activeTab, setActiveTab] = React.useState('hafalan');

  const MainContent = (
    <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
      {loadingStudent ? (
        <>
          {/* Skeleton for Header */}
          <div className="w-full max-w-4xl mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
              <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
                <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                <div className="h-8 w-40 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>
          {/* Skeleton for Overview Card */}
          <div className="w-full max-w-4xl mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col lg:flex-row lg:items-start lg:space-x-6 animate-pulse">
              <div className="flex flex-col items-center justify-center mb-4 lg:mb-0 w-full lg:w-auto relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-muted mb-4" />
                <div className="h-6 w-32 rounded bg-muted mb-2" />
                <div className="h-4 w-24 rounded bg-muted" />
      </div>
              <div className="flex-1 space-y-4 mt-6 lg:mt-0">
                <div className="h-6 w-40 rounded bg-muted mb-2" />
                <div className="h-4 w-32 rounded bg-muted mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="h-24 rounded-xl bg-muted" />
                  <div className="h-24 rounded-xl bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !student ? (
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
            <Button onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>
      ) : (
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
        setActiveTab={setActiveTab}
      />
          {loadingProgress ? (
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="h-6 w-48 rounded bg-muted mb-6" />
                <div className="flex gap-4 mb-6">
                  <div className="h-8 w-24 rounded bg-muted" />
                  <div className="h-8 w-24 rounded bg-muted" />
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-full rounded bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
      <DailyProgressTabs
        hafalanEntries={hafalanEntries}
        tilawahEntries={tilawahEntries}
        onProgressUpdated={refetchData}
        studentId={student.id}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
          )}
    </>
      )}
    </div>
  );

  if (profile?.role === 'parent') {
    return <ParentLayout breadcrumbs={breadcrumbs}>{MainContent}</ParentLayout>;
  }
  return <TeacherLayout breadcrumbs={breadcrumbs}>{MainContent}</TeacherLayout>;
};

export default StudentDetails;
