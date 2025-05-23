
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Award, User } from 'lucide-react';

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
        return 'bg-green-500 text-white';
      case 'inProgress':
        return 'bg-blue-500 text-white';
      case 'notStarted':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'inProgress':
        return 'In Progress';
      case 'notStarted':
        return 'Not Started';
      default:
        return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-islamic-50 to-blue-50">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-3 border-white shadow-lg">
            <AvatarImage src="/placeholder.svg" alt={student.name} />
            <AvatarFallback className="bg-islamic-500 text-white text-lg font-semibold">
              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 mb-1">
              {student.name}
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs bg-white/80 text-gray-700">
                Grade {student.grade}
              </Badge>
              <Badge variant="outline" className="text-xs border-islamic-200 text-islamic-700">
                {student.class}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        {/* Teacher Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="font-medium">Teacher:</span>
            <span>{student.studyGroup}</span>
          </div>
        </div>

        {/* Al-Quran Memorization Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-islamic-600" />
              <span className="text-sm font-semibold text-gray-800">
                Al-Quran Memorization
              </span>
            </div>
            <Badge className={`text-xs ${getStatusColor(student.memorization.status)}`}>
              {getStatusText(student.memorization.status)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-bold text-gray-800">
                {student.memorization.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(student.memorization.progress)}`}
                style={{ width: `${student.memorization.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current: {student.memorization.currentSurah}
            </p>
          </div>
        </div>
        
        {/* Tilawati Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">
                Tilawati Reading
              </span>
            </div>
            <Badge className={`text-xs ${getStatusColor(student.tilawati.status)}`}>
              {getStatusText(student.tilawati.status)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-bold text-gray-800">
                {student.tilawati.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(student.tilawati.progress)}`}
                style={{ width: `${student.tilawati.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Level: {student.tilawati.currentLevel}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => onViewDetails(student.id)}
          className="w-full mt-6 bg-gradient-to-r from-islamic-500 to-islamic-600 hover:from-islamic-600 hover:to-islamic-700 text-white shadow-lg rounded-lg font-medium transition-all duration-300"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
