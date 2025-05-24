
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import StudentDetailsHeader from '@/components/student-details/StudentDetailsHeader';
import StudentOverviewCard from '@/components/student-details/StudentOverviewCard';
import DailyProgressTabs from '@/components/student-details/DailyProgressTabs';
import { useStudentDetails } from '@/hooks/useStudentDetails';

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-500"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <StudentDetailsHeader
          student={student}
          onStudentUpdated={refetchData}
          onStudentDeleted={handleStudentDeleted}
        />

        <StudentOverviewCard
          student={student}
          progressData={progressData}
          onProgressAdded={refetchData}
        />

        <DailyProgressTabs
          hafalanEntries={hafalanEntries}
          tilawahEntries={tilawahEntries}
          onProgressUpdated={refetchData}
        />
      </div>
    </div>
  );
};

export default StudentDetails;
