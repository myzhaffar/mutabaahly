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
  selectedStudentIds?: string[];
  onToggleStudent?: (id: string, checked: boolean) => void;
}

const StudentsGrid: React.FC<StudentsGridProps> = ({ 
  students, 
  filteredStudents, 
  onViewDetails, 
  userRole,
  selectedStudentIds = [],
  onToggleStudent
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredStudents.map((student) => {
        const mappedStudent = {
          id: student.id,
          name: student.name,
          class: student.group_name,
          studyGroup: student.teacher,
          memorization: {
            progress: student.hafalan_progress?.percentage || 0,
            status: ((student.hafalan_progress?.percentage || 0) === 100 ? 'completed' : 
                    (student.hafalan_progress?.percentage || 0) > 0 ? 'inProgress' : 'notStarted') as 'completed' | 'inProgress' | 'notStarted',
            currentSurah: student.hafalan_progress?.last_surah || 'Not started'
          },
          tilawati: {
            progress: student.tilawah_progress?.percentage || 0,
            status: ((student.tilawah_progress?.percentage || 0) === 100 ? 'completed' : 
                    (student.tilawah_progress?.percentage || 0) > 0 ? 'inProgress' : 'notStarted') as 'completed' | 'inProgress' | 'notStarted',
            currentLevel: student.tilawah_progress?.jilid || 'Not started'
          }
        };

        return (
          <div key={student.id} className="flex items-start gap-3">
            {onToggleStudent && (
              <label className="inline-flex items-center cursor-pointer mt-4 relative">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={e => onToggleStudent(student.id, e.target.checked)}
                  className="peer appearance-none w-6 h-6 border-2 border-gray-400 rounded-full bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-colors duration-200 focus:ring-2 focus:ring-emerald-400"
                  aria-label={selectedStudentIds.includes(student.id) ? 'Deselect student' : 'Select student'}
                />
                <span className="pointer-events-none absolute w-6 h-6 rounded-full border-2 border-gray-400 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 top-0 left-0 flex items-center justify-center">
                  {selectedStudentIds.includes(student.id) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </label>
            )}
            <div className="flex-1">
          <StudentCard
            student={mappedStudent}
            onViewDetails={onViewDetails}
          />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentsGrid;
