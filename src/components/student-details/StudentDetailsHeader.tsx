import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

const StudentDetailsHeader: React.FC<StudentDetailsHeaderProps> = ({
  student,
  userRole,
  profile,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
      {/* Left Section - Back Button and Title */}
      <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Details</h1>
      </div>
    </div>
  );
};

export default StudentDetailsHeader;
