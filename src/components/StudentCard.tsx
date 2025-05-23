
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    grade: string;
    class: string;
    studyGroup: string;
    memorization: {
      progress: number;
      status: 'completed' | 'inProgress' | 'notStarted';
      currentSurah: string;
    };
    tilawati: {
      progress: number;
      status: 'completed' | 'inProgress' | 'notStarted';
      currentLevel: string;
    };
  };
  onViewDetails: (studentId: string) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onViewDetails }) => {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-islamic-500 text-white';
      case 'inProgress':
        return 'bg-gold-500 text-white';
      case 'notStarted':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('progress.completed');
      case 'inProgress':
        return t('progress.inProgress');
      case 'notStarted':
        return t('progress.notStarted');
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-islamic-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-sf-pro text-foreground">
              {student.name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {t('common.grade')} {student.grade}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {student.class}
              </Badge>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {student.studyGroup}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Memorization Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              {t('progress.memorization')}
            </span>
            <Badge className={getStatusColor(student.memorization.status)}>
              {getStatusText(student.memorization.status)}
            </Badge>
          </div>
          <Progress value={student.memorization.progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Current: {student.memorization.currentSurah}
          </p>
        </div>
        
        {/* Tilawati Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              {t('progress.tilawati')}
            </span>
            <Badge className={getStatusColor(student.tilawati.status)}>
              {getStatusText(student.tilawati.status)}
            </Badge>
          </div>
          <Progress value={student.tilawati.progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Level: {student.tilawati.currentLevel}
          </p>
        </div>
        
        <Button 
          onClick={() => onViewDetails(student.id)}
          className="w-full mt-4 bg-islamic-500 hover:bg-islamic-600 text-white"
        >
          {t('button.viewDetails')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
