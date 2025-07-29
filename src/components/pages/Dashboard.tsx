'use client';

import React, { useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useRouter } from 'next/navigation';

import StatsCards from '@/components/dashboard/StatsCards';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import AddStudentDialog from '@/components/AddStudentDialog';
import BulkUploadStudentsDialog from '@/components/BulkUploadStudentsDialog';
import ClassCard from '@/components/dashboard/ClassCard';
import ParentLayout from '@/components/layouts/ParentLayout';
import { useStudentProgressSummary } from '@/hooks/useStudentProgressSummary';
import { useTranslation } from 'react-i18next';
import '@/i18n';

// Skeleton components
const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-100 animate-pulse h-32 rounded-xl"></div>
    ))}
  </div>
);

const StudentGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-2xl"></div>
    ))}
  </div>
);

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    summaryStats: stats,
    groupedByGrade,
    isLoading: dataLoading,
    studentProgressData
  } = useStudentProgressSummary({
    fetchAllStudents: profile?.role === 'teacher', // Only fetch all students for teachers
    parentId: profile?.role === 'parent' ? profile.id : undefined, // Pass parent ID for parents
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleStudentAdded = () => {
    // This will trigger a refetch of the data
    window.location.reload();
  };

  // Use useMemo for grade cards to prevent unnecessary re-renders
  const gradeCards = useMemo(() => {
    if (!groupedByGrade) return [];
    return Object.entries(groupedByGrade).map(([grade, info]) => (
    <ClassCard
      key={grade}
      grade={grade}
      students={info.students}
      classes={info.classes}
    />
  ));
  }, [groupedByGrade]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-islamic-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Teacher view
  if (profile?.role === 'teacher') {
    const breadcrumbs = [{ label: t('navigation.dashboard') }];
    return (
      <TeacherLayout breadcrumbs={breadcrumbs}>
        <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('dashboard.welcome').replace('{name}', profile?.full_name || 'User')}
                </h1>
                <p className="text-gray-600">{t('dashboard.teacherDashboard')}</p>
              </div>
              <div className="flex justify-center gap-2 sm:justify-end">
                <BulkUploadStudentsDialog onStudentsAdded={handleStudentAdded} />
                <AddStudentDialog onStudentAdded={handleStudentAdded} />
              </div>
            </div>
            {/* Stats Section */}
            {dataLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
            <div className="mb-6">
              {dataLoading ? <StudentGridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gradeCards}
                </div>
              )}
            </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Parent view
  const breadcrumbs = [{ label: t('navigation.dashboard') }];

  return (
    <ParentLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('dashboard.welcome').replace('{name}', profile?.full_name || 'User')}
              </h1>
              <p className="text-gray-600">{t('dashboard.parentDashboard')}</p>
            </div>
          </div>
          {/* Stats Section */}
          {dataLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
              <div className="text-sm text-gray-500">
                {stats.totalStudents} students
              </div>
            </div>
            {dataLoading ? (
              <StudentGridSkeleton />
            ) : (
              <>
                {studentProgressData && studentProgressData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gradeCards}
              </div>
                ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                    <p className="text-gray-600">No students have been added to the system yet.</p>
              </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default Dashboard;
 