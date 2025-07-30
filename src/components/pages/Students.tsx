'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';

import ParentLayout from '@/components/layouts/ParentLayout';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import TilawatiTable from '@/components/TilawatiTable';
import TahfidzTable from '@/components/TahfidzTable';
import { fetchGrades } from '@/utils/rankingDataService';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, ChevronLeft, Filter, Loader2 } from 'lucide-react';

const Students = () => {
  const { profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tilawati' | 'tahfidz'>('tilawati');
  
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Student Rankings' }
  ];

  // Remove MainContent variable and inline its JSX in the return
  if (profile?.role === 'parent') {
    return (
      <ParentLayout breadcrumbs={breadcrumbs}>
    <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
      <div className="w-full flex flex-col gap-6">
        {/* Header, left-aligned */}
        <div className="flex items-center gap-3 sm:gap-4 mt-2 w-full">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Rankings</h1>
        </div>
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 w-full">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full">
         <div className="flex flex-row gap-2 mb-0">
           <button
             type="button"
             onClick={() => setActiveTab('tilawati')}
             className={`flex items-center gap-2 px-6 py-2 text-lg font-semibold focus:outline-none transition-all duration-200
               rounded-t-xl rounded-b-md
               ${activeTab === 'tilawati'
                 ? 'bg-blue-50 text-blue-700 shadow-sm border-b-0 z-10'
                 : 'bg-transparent text-gray-400 hover:text-blue-600'}`}
             style={{
               borderBottomLeftRadius: activeTab === 'tilawati' ? 0 : '0.75rem',
               borderBottomRightRadius: activeTab === 'tilawati' ? 0 : '0.75rem',
               marginBottom: activeTab === 'tilawati' ? '-1px' : 0,
               borderBottom: activeTab === 'tilawati' ? '2px solid #3b82f6' : 'none',
             }}
             aria-current={activeTab === 'tilawati' ? 'page' : undefined}
           >
             <BookOpen className="h-5 w-5" /> Tahsin
           </button>
           <button
             type="button"
             onClick={() => setActiveTab('tahfidz')}
             className={`flex items-center gap-2 px-6 py-2 text-lg font-semibold focus:outline-none transition-all duration-200
               rounded-t-xl rounded-b-md
               ${activeTab === 'tahfidz'
                 ? 'bg-green-50 text-green-700 shadow-sm border-b-0 z-10'
                 : 'bg-transparent text-gray-400 hover:text-green-600'}`}
             style={{
               borderBottomLeftRadius: activeTab === 'tahfidz' ? 0 : '0.75rem',
               borderBottomRightRadius: activeTab === 'tahfidz' ? 0 : '0.75rem',
               marginBottom: activeTab === 'tahfidz' ? '-1px' : 0,
               borderBottom: activeTab === 'tahfidz' ? '2px solid #22c55e' : 'none',
             }}
             aria-current={activeTab === 'tahfidz' ? 'page' : undefined}
           >
             <Award className="h-5 w-5" /> Tahfidz
           </button>
         </div>
          {/* Tab Content */}
          <div className="p-0 min-w-0 w-full mt-0">
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
              <TahfidzTable
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
      </ParentLayout>
    );
  }
  return (
    <TeacherLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
        <div className="w-full flex flex-col gap-6">
          {/* Header, left-aligned */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2 w-full">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Student Rankings</h1>
          </div>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 w-full">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full">
           <div className="flex flex-row gap-2 mb-0">
             <button
               type="button"
               onClick={() => setActiveTab('tilawati')}
               className={`flex items-center gap-2 px-6 py-2 text-lg font-semibold focus:outline-none transition-all duration-200
                 rounded-t-xl rounded-b-md
                 ${activeTab === 'tilawati'
                   ? 'bg-blue-50 text-blue-700 shadow-sm border-b-0 z-10'
                   : 'bg-transparent text-gray-400 hover:text-blue-600'}`}
               style={{
                 borderBottomLeftRadius: activeTab === 'tilawati' ? 0 : '0.75rem',
                 borderBottomRightRadius: activeTab === 'tilawati' ? 0 : '0.75rem',
                 marginBottom: activeTab === 'tilawati' ? '-1px' : 0,
                 borderBottom: activeTab === 'tilawati' ? '2px solid #3b82f6' : 'none',
               }}
               aria-current={activeTab === 'tilawati' ? 'page' : undefined}
             >
               <BookOpen className="h-5 w-5" /> Tahsin
             </button>
             <button
               type="button"
               onClick={() => setActiveTab('tahfidz')}
               className={`flex items-center gap-2 px-6 py-2 text-lg font-semibold focus:outline-none transition-all duration-200
                 rounded-t-xl rounded-b-md
                 ${activeTab === 'tahfidz'
                   ? 'bg-green-50 text-green-700 shadow-sm border-b-0 z-10'
                   : 'bg-transparent text-gray-400 hover:text-green-600'}`}
               style={{
                 borderBottomLeftRadius: activeTab === 'tahfidz' ? 0 : '0.75rem',
                 borderBottomRightRadius: activeTab === 'tahfidz' ? 0 : '0.75rem',
                 marginBottom: activeTab === 'tahfidz' ? '-1px' : 0,
                 borderBottom: activeTab === 'tahfidz' ? '2px solid #22c55e' : 'none',
               }}
               aria-current={activeTab === 'tahfidz' ? 'page' : undefined}
             >
               <Award className="h-5 w-5" /> Tahfidz
             </button>
           </div>
            {/* Tab Content */}
            <div className="p-0 min-w-0 w-full mt-0">
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
                <TahfidzTable
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
    </TeacherLayout>
  );
};

export default Students;
