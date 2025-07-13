import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { BookOpen, Award, User } from 'lucide-react';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    class: string;
    studyGroup: string;
    photo?: string;
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'inProgress':
        return 'info';
      case 'notStarted':
        return 'neutral';
      default:
        return 'neutral';
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
    if (progress >= 80) return 'bg-islamic-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-accent-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-4 bg-gradient-to-r from-islamic-50 to-accent-50">
        <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <Avatar className="h-16 w-16 border-3 border-white shadow-lg mx-auto sm:mx-0">
            <AvatarImage 
              src={student.photo || '/avatars/placeholder.png'} 
              alt={student.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-islamic-500 text-white text-lg font-semibold">
              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex flex-col items-center sm:items-start">
            <CardTitle className="text-lg font-bold text-gray-900 mb-1 text-center sm:text-left">
              {student.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge variant="outline" size="sm" className="border-islamic-500 text-islamic-700">
                {student.class}
              </Badge>
              <Badge variant="secondary" size="sm" className="bg-accent/10 text-accent-foreground/80">
                <User className="h-3 w-3 mr-1" />
                {student.studyGroup}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Al-Quran Memorization Progress */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-islamic-600" />
              <span className="text-sm font-semibold text-gray-800">
                Tahfidz Al-Quran
              </span>
            </div>
            <Badge 
              variant={getStatusVariant(student.memorization.status)}
              size="sm"
              className="whitespace-nowrap self-start sm:self-auto"
            >
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-accent-600" />
              <span className="text-sm font-semibold text-gray-800">
                Tahsin/Tilawati
              </span>
            </div>
            <Badge 
              variant={getStatusVariant(student.tilawati.status)}
              size="sm"
              className="whitespace-nowrap self-start sm:self-auto"
            >
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
          className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-white shadow-lg rounded-full font-medium transition-all duration-300"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
