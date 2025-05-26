import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, BookOpen, User, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import AddProgressDialog from '@/components/AddProgressDialog';
import EditStudentDialog from '@/components/EditStudentDialog';
import DeleteStudentDialog from '@/components/DeleteStudentDialog';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressData } from '@/types/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Student {
  id: string;
  name: string;
  group_name: string;
  teacher: string;
  photo: string | null;
}

interface StudentOverviewCardProps {
  student: Student;
  progressData: ProgressData;
  onProgressAdded: () => void;
  onStudentUpdated: () => void;
  onStudentDeleted: () => void;
}

const StudentOverviewCard: React.FC<StudentOverviewCardProps> = ({
  student,
  progressData,
  onProgressAdded,
  onStudentUpdated,
  onStudentDeleted
}) => {
  const { profile } = useAuth();
  const isTeacher = profile?.role === 'teacher';

  // Ensure we have valid progress values
  const hafalanPercentage = progressData?.hafalan_progress?.percentage || 0;
  const hafalanLastSurah = progressData?.hafalan_progress?.last_surah || 'Not started';
  const tilawahPercentage = progressData?.tilawah_progress?.percentage || 0;
  const tilawahJilid = progressData?.tilawah_progress?.jilid || 'Not started';

  return (
    <Card className="mb-8">
      <CardContent className="p-4 sm:p-6">
        {/* Main Container */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
          {/* Avatar Section */}
          <div className="flex items-center justify-center mb-4 lg:mb-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <AvatarImage src={student.photo || ''} alt={student.name} />
              <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-muted">
              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          </div>
          
          {/* Content Section */}
          <div className="flex-1">
            {/* Student Info with Action Buttons */}
            <div className="text-center lg:text-left mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col items-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {student.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-islamic-200 text-islamic-700">
                      {student.group_name}
                    </Badge>
                    <Badge variant="secondary" className="bg-accent/10 text-accent-foreground/80">
                      <User className="h-3 w-3 mr-1" />
                      {student.teacher}
                    </Badge>
              </div>
              </div>
                {isTeacher && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => document.getElementById('edit-student-trigger')?.click()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onSelect={() => document.getElementById('delete-student-trigger')?.click()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Hidden dialog triggers */}
            <div className="hidden">
              <EditStudentDialog student={student} onStudentUpdated={onStudentUpdated} />
              <DeleteStudentDialog 
                studentId={student.id} 
                studentName={student.name} 
                onStudentDeleted={onStudentDeleted} 
              />
            </div>

            {/* Progress Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Progress Overview</h3>
                {isTeacher && (
                  <AddProgressDialog studentId={student.id} onProgressAdded={onProgressAdded} />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Hafalan Progress */}
                <div className="bg-islamic-100/10 dark:bg-islamic-950/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                    <Award className="h-6 w-6 text-islamic-600 dark:text-islamic-400 mr-2" />
                    <h3 className="font-semibold text-islamic-900 dark:text-islamic-100">Hafalan Progress</h3>
                </div>
                  <div className="space-y-3">
                <Progress 
                      value={hafalanPercentage} 
                      className="h-2.5"
                />
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-foreground">
                        {hafalanPercentage}% completed
                </p>
                      <p className="text-sm text-muted-foreground">
                        {hafalanLastSurah}
                </p>
              </div>
                  </div>
                </div>

                {/* Tilawati Progress */}
                <div className="bg-green-100/10 dark:bg-green-950/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Tilawati Progress</h3>
                  </div>
                  <div className="space-y-3">
                <Progress 
                      value={tilawahPercentage} 
                      className="h-2.5"
                />
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-foreground">
                        {tilawahPercentage}% completed
                </p>
                      <p className="text-sm text-muted-foreground">
                        {tilawahJilid}
                </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentOverviewCard;
