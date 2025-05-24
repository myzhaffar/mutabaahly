
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import StudentCard from '@/components/StudentCard';

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

interface StudentsGridProps {
  students: Student[];
  filteredStudents: Student[];
  onViewDetails: (studentId: string) => void;
  userRole: string;
}

const StudentsGrid: React.FC<StudentsGridProps> = ({ 
  students, 
  filteredStudents, 
  onViewDetails, 
  userRole 
}) => {
  if (filteredStudents.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {students.length === 0 ? 'No Students Found' : 'No Students Match Your Filters'}
          </h3>
          <p className="text-gray-600">
            {students.length === 0
              ? (userRole === 'teacher' 
                  ? 'Start by adding students to your class.' 
                  : 'No students assigned to your account.')
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredStudents.map((student) => (
        <StudentCard
          key={student.id}
          student={{
            id: student.id,
            name: student.name,
            grade: student.grade || 'N/A',
            class: student.group_name,
            studyGroup: student.teacher,
            memorization: {
              progress: student.hafalan_progress?.percentage || 0,
              status: (student.hafalan_progress?.percentage || 0) === 100 ? 'completed' : 
                      (student.hafalan_progress?.percentage || 0) > 0 ? 'inProgress' : 'notStarted',
              currentSurah: student.hafalan_progress?.last_surah || 'Not started'
            },
            tilawati: {
              progress: student.tilawah_progress?.percentage || 0,
              status: (student.tilawah_progress?.percentage || 0) === 100 ? 'completed' : 
                      (student.tilawah_progress?.percentage || 0) > 0 ? 'inProgress' : 'notStarted',
              currentLevel: student.tilawah_progress?.jilid || 'Not started'
            }
          }}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default StudentsGrid;
