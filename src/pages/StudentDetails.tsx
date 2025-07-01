import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StudentDetailsHeader from '@/components/student-details/StudentDetailsHeader';
import StudentOverviewCard from '@/components/student-details/StudentOverviewCard';
import DailyProgressTabs from '@/components/student-details/DailyProgressTabs';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useAuth } from '@/contexts/AuthContext';
import TeacherLayout from '@/components/layouts/TeacherLayout';

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    navigate('/dashboard');
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
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
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

  return (
    <TeacherLayout breadcrumbs={breadcrumbs}>
        <StudentDetailsHeader
          student={student}
          userRole={profile?.role || 'parent'}
          profile={profile}
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
        />
    </TeacherLayout>
  );
};

export default StudentDetails;
