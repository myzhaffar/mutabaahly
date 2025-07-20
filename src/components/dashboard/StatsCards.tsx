import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalStudents: number;
    avgHafalanProgress: number;
    avgTilawahProgress: number;
    completedStudents: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center">
            {/* Removed icon for student count */}
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Tilawah</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgTilawahProgress}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-l-4 border-l-islamic-500">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-islamic-100 mr-4">
              <Award className="h-6 w-6 text-islamic-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Hafalan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgHafalanProgress}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-l-4 border-l-gold-500">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gold-100 mr-4">
              <TrendingUp className="h-6 w-6 text-gold-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedStudents}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
