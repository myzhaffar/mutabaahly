import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

interface ClassCardProps {
  className: string;
  classStudents: Student[];
}

const ClassCard: React.FC<ClassCardProps> = ({ className, classStudents }) => {
  const navigate = useNavigate();
  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl transition-transform hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between py-6 px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 shadow text-white text-xl font-bold">
            {className.split(' ').map(w => w[0]).join('').toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold text-gray-900 mb-1">{className}</CardTitle>
            <span className="text-base text-gray-600 font-medium">{classStudents.length} Students</span>
          </div>
        </div>
        <Button
          variant="default"
          className="px-6 py-2 rounded-full text-base font-semibold shadow-md bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:opacity-90"
          onClick={() => navigate(`/class/${encodeURIComponent(className)}`)}
        >
          View Class
        </Button>
      </CardHeader>
    </Card>
  );
};

export default ClassCard; 