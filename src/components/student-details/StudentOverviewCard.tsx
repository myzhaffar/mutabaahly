
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, BookOpen } from 'lucide-react';
import AddProgressDialog from '@/components/AddProgressDialog';

interface Student {
  id: string;
  name: string;
  grade: string;
  group_name: string;
  teacher: string;
  photo: string | null;
}

interface ProgressData {
  hafalan_progress: { percentage: number; last_surah: string | null } | null;
  tilawah_progress: { percentage: number; jilid: string | null } | null;
}

interface StudentOverviewCardProps {
  student: Student;
  progressData: ProgressData;
  onProgressAdded: () => void;
}

const StudentOverviewCard: React.FC<StudentOverviewCardProps> = ({
  student,
  progressData,
  onProgressAdded
}) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={student.photo || ''} alt={student.name} />
            <AvatarFallback className="text-lg font-semibold">
              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Grade</p>
                <p className="font-medium">{student.grade || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="font-medium">{student.group_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teacher</p>
                <p className="font-medium">{student.teacher}</p>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-islamic-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Award className="h-5 w-5 text-islamic-600 mr-2" />
                  <h3 className="font-semibold text-islamic-900">Hafalan Progress</h3>
                </div>
                <Progress 
                  value={progressData.hafalan_progress?.percentage || 0} 
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  {progressData.hafalan_progress?.percentage || 0}% completed
                </p>
                <p className="text-xs text-gray-500">
                  Current: {progressData.hafalan_progress?.last_surah || 'Not started'}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-900">Tilawati Progress</h3>
                </div>
                <Progress 
                  value={progressData.tilawah_progress?.percentage || 0} 
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  {progressData.tilawah_progress?.percentage || 0}% completed
                </p>
                <p className="text-xs text-gray-500">
                  Current: {progressData.tilawah_progress?.jilid || 'Not started'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <AddProgressDialog studentId={student.id} onProgressAdded={onProgressAdded} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentOverviewCard;
