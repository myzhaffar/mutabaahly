
import React from 'react';
import { BookOpen, User, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestStats {
  total: number;
  passed: number;
  scheduled: number;
  failed: number;
}

interface TestStatsCardsProps {
  stats: TestStats;
}

const TestStatsCards: React.FC<TestStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium">Total Tes</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg lg:text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium">Lulus</CardTitle>
          <User className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg lg:text-2xl font-bold text-green-600">{stats.passed}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium">Terjadwal</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg lg:text-2xl font-bold text-blue-600">{stats.scheduled}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs lg:text-sm font-medium">Belum Lulus</CardTitle>
          <Calendar className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg lg:text-2xl font-bold text-red-600">{stats.failed}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestStatsCards;
