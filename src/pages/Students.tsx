import React, { useState, useEffect } from 'react';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, Search, Filter, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import TilawatiTable from '@/components/TilawatiTable';
import HafalanTable from '@/components/HafalanTable';
import { fetchTeachers, fetchGrades } from '@/utils/rankingDataService';

const Students = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tilawati' | 'hafalan'>('tilawati');
  
  // Filter states
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Data states
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch filter data on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      try {
        const [teachersData, gradesData] = await Promise.all([
          fetchTeachers(),
          fetchGrades()
        ]);
        
        setTeachers([
          { id: 'all', name: 'All Teachers' },
          ...teachersData
        ]);
        
        setGrades([
          { id: 'all', name: 'All Grades' },
          ...gradesData
        ]);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        // Fallback to empty arrays
        setTeachers([{ id: 'all', name: 'All Teachers' }]);
        setGrades([{ id: 'all', name: 'All Grades' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacher(value);
    handleFilterChange();
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    handleFilterChange();
  };

  const clearFilters = () => {
    setSelectedTeacher('all');
    setSelectedGrade('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = selectedTeacher !== 'all' || selectedGrade !== 'all';

  return (
    <TeacherLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Rankings</h1>
              <p className="text-gray-600">Monitor and compare student progress in Tilawati and Hafalan</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <p className="text-sm text-gray-500">Refine your search results</p>
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading filters...</span>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teacher Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Teacher
                  </label>
                  <Select value={selectedTeacher} onValueChange={handleTeacherChange}>
                    <SelectTrigger className="w-full h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Grade
                  </label>
                  <Select value={selectedGrade} onValueChange={handleGradeChange}>
                    <SelectTrigger className="w-full h-11 border-gray-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {selectedTeacher !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                        Teacher: {teachers.find(t => t.id === selectedTeacher)?.name}
                        <button
                          onClick={() => setSelectedTeacher('all')}
                          className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedGrade !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                        Grade: {grades.find(g => g.id === selectedGrade)?.name}
                        <button
                          onClick={() => setSelectedGrade('all')}
                          className="ml-1 hover:bg-green-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tilawati')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'tilawati'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tilawati Rank
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hafalan')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'hafalan'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Award className="h-4 w-4" />
                Hafalan Rank
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tilawati' ? (
              <TilawatiTable
                filters={{
                  teacher: selectedTeacher,
                  grade: selectedGrade
                }}
                pagination={{
                  currentPage,
                  itemsPerPage,
                  onPageChange: handlePageChange
                }}
              />
            ) : (
              <HafalanTable
                filters={{
                  teacher: selectedTeacher,
                  grade: selectedGrade
                }}
                pagination={{
                  currentPage,
                  itemsPerPage,
                  onPageChange: handlePageChange
                }}
              />
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Students;
