import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ParentLayout from '@/components/layouts/ParentLayout';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, Search, Filter, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import TilawatiTable from '@/components/TilawatiTable';
import HafalanTable from '@/components/HafalanTable';
import { fetchGrades, FIXED_TEACHERS } from '@/utils/rankingDataService';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

const Students = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tilawati' | 'hafalan'>('tilawati');
  
  // Filter states
  // Removed teacher filter
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['all']);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Data states
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Helper to determine if any filter is active
  const hasAnyActiveFilter = selectedGrades.length > 0 && !selectedGrades.includes('all');

  // Fetch filter data on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      try {
        const gradesData = await fetchGrades();
        setGrades([
          { id: 'all', name: 'All Grades' },
          ...gradesData
        ]);
      } catch (error) {
        console.error('Error fetching filter data:', error);
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

  // Removed teacher filter logic

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades((prev) => {
      let updated;
      if (grade === 'all') {
        updated = ['all'];
      } else {
        updated = prev.includes(grade)
          ? prev.filter(g => g !== grade && g !== 'all')
          : [...prev.filter(g => g !== 'all'), grade];
      }
      handleFilterChange();
      return updated.length === 0 ? ['all'] : updated;
    });
  };

  const clearFilters = () => {
    // Removed teacher filter logic
    setSelectedGrades(['all']);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = selectedGrades.length > 0 && !selectedGrades.includes('all');

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Student Rankings' }
  ];

  const MainContent = (
    <div className="w-full flex justify-center py-0 px-0 sm:py-4 sm:px-4">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header, left-aligned */}
        <div className="flex items-center gap-3 sm:gap-4 mt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Rankings</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-0 sm:p-4">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 hover:bg-gray-50 focus:outline-none"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <div className="p-2 bg-gray-100 rounded-lg">
              <Filter className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Filters</h3>
              <p className="text-xs sm:text-sm text-gray-500">Refine your search results</p>
              {/* Show selected filter badges under description, even when collapsed */}
              {hasAnyActiveFilter && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {/* Removed teacher filter badge */}
                  {selectedGrades.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-green-50 text-green-700 text-xs sm:text-sm rounded-full border border-green-200">
                      Grades: {selectedGrades.map(id => grades.find(g => g.id === id)?.name || id).join(', ')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            <span className="ml-auto text-xs text-gray-500">{filtersOpen ? 'Hide' : 'Show'}</span>
          </button>
          {filtersOpen && (
            loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading filters...</span>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  {/* Removed teacher filter UI */}
                  {/* Grade Multi-Select Filter (Checkboxes) */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Grade
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {grades.map((grade) => (
                        <div key={grade.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`grade-${grade.id}`}
                            checked={selectedGrades.includes(grade.id)}
                            onCheckedChange={() => handleGradeToggle(grade.id)}
                            className="rounded-full"
                          />
                          <label htmlFor={`grade-${grade.id}`} className="text-sm text-gray-600 cursor-pointer">
                            {grade.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 sm:p-4">
          <div className="flex flex-col xs:flex-row border-b border-gray-200 overflow-x-auto min-w-0">
            <button
              onClick={() => setActiveTab('tilawati')}
              className={`flex-1 px-2 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'tilawati'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <BookOpen className="h-4 w-4" />
                Tilawati Standing
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hafalan')}
              className={`flex-1 px-2 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'hafalan'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Award className="h-4 w-4" />
                Tahfidz Standing
              </div>
            </button>
          </div>
          {/* Tab Content */}
          <div className="p-2 sm:p-6 min-w-0">
            {activeTab === 'tilawati' ? (
              <TilawatiTable
                filters={{
                  grades: selectedGrades
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
                  grades: selectedGrades
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
    </div>
  );

  if (profile?.role === 'parent') {
    return <ParentLayout breadcrumbs={breadcrumbs}>{MainContent}</ParentLayout>;
  }
  return <TeacherLayout breadcrumbs={breadcrumbs}>{MainContent}</TeacherLayout>;
};

export default Students;
