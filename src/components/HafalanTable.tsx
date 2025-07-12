import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Award, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchHafalanRankingData, StudentRankingData, RankingFilters } from '@/utils/rankingDataService';

interface Filters {
  teachers?: string[];
  grades: string[];
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface HafalanTableProps {
  filters: Filters;
  pagination: Pagination;
}

const HafalanTable: React.FC<HafalanTableProps> = ({ filters, pagination }) => {
  const [allStudents, setAllStudents] = useState<StudentRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const rankingFilters: RankingFilters = {
          teacher: filters.teachers?.[0] || '',
          grade: filters.grades[0] || ''
        };
        
        const data = await fetchHafalanRankingData(rankingFilters);
        setAllStudents(data);
      } catch (err) {
        console.error('Error fetching Hafalan ranking data:', err);
        setError('Failed to load ranking data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.teachers, filters.grades]);

  // Apply filters
  const filteredStudents = allStudents.filter(student => {
    const teachers = filters.teachers || [];
    const matchesTeacher = teachers.length === 0 || teachers.includes(student.teacherId);
    const matchesGrade = filters.grades.length === 0 || filters.grades.includes('all') || filters.grades.includes(student.grade);
    return matchesTeacher && matchesGrade;
  });

  // The data is already sorted by Juz (30 to 1) then by verse from the service
  // Just assign ranks based on the filtered position
  const rankedStudents = filteredStudents.map((student, index) => ({
    ...student,
    rank: index + 1 // Assign rank based on position in sorted array
  }));

  // Apply pagination
  const totalItems = rankedStudents.length;
  const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const currentStudents = rankedStudents.slice(startIndex, endIndex);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-white text-xl font-bold shadow-md">
          🥇
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-white text-xl font-bold shadow-md">
          🥈
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-300 text-white text-xl font-bold shadow-md">
          🥉
        </span>
      );
    } else {
      return (
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-base font-semibold border border-gray-200">
          {rank}
        </span>
      );
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      pagination.onPageChange(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading ranking data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <Award className="h-6 w-6 text-green-600" />
            Al-Quran Memorization Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Juz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Surah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Verse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRankBadge(student.rank)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="border-gray-200 text-gray-700">
                          {student.class}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.teacher}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {student.juz === 30 ? 'Juz 30' : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.surah || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.verse || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(student.progress)}`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${getProgressColor(student.progress)}`}>
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HafalanTable; 