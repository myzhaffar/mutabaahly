
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EditStudentDialog from '@/components/EditStudentDialog';
import DeleteStudentDialog from '@/components/DeleteStudentDialog';

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
  onStudentUpdated: () => void;
  onStudentDeleted: () => void;
}

const StudentDetailsHeader: React.FC<StudentDetailsHeaderProps> = ({
  student,
  onStudentUpdated,
  onStudentDeleted
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
      </div>
      <div className="flex space-x-2">
        <EditStudentDialog student={student} onStudentUpdated={onStudentUpdated} />
        <DeleteStudentDialog 
          studentId={student.id} 
          studentName={student.name} 
          onStudentDeleted={onStudentDeleted} 
        />
      </div>
    </div>
  );
};

export default StudentDetailsHeader;
