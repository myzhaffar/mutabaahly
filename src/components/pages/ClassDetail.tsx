'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import ParentLayout from '@/components/layouts/ParentLayout';
import { useAuth } from '@/contexts/useAuth';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import { supabase } from '@/integrations/supabase/client';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FIXED_TEACHERS } from '@/utils/rankingDataService';
// Removed unused ProgressEntry import

interface ClassStudent {
  id: string;
  name: string;
  grade: string | null;
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

const ClassDetail: React.FC = () => {
  const params = useParams();
  const className = decodeURIComponent(params?.className as string);
  const { profile } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  // Removed allStudents state
  const [subClasses, setSubClasses] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [massEditOpen, setMassEditOpen] = useState(false);
  const [massEditData, setMassEditData] = useState<Record<string, { name: string; grade: string; group_name: string; teacher: string }>>({});
  const prevMassEditOpen = useRef(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [teacherFilterOpen, setTeacherFilterOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);


  const handleMassEditChange = (studentId: string, field: string, value: string) => {
    setMassEditData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(massEditData).map(([studentId, data]) => ({
        id: studentId,
        ...data
      }));

      const { error } = await supabase
        .from('students')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        toast({
          title: 'Failed to update students',
          description: error.message,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Close modal, clear selection, and refresh students list
      setMassEditOpen(false);
      setSelectedStudentIds([]);
      toast({
        title: 'Students updated',
        description: 'All selected students have been updated.',
        variant: 'default',
      });
      // Refresh students list
      // If you use SWR, call mutate here. Otherwise, re-fetch students:
      // await fetchStudents();
      // For now, trigger a soft reload by updating state
      setLoading(true);
      // Optionally, you can re-run the fetchStudents logic here
      // setTimeout(() => setLoading(false), 500); // Remove this if you re-fetch
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMassDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .in('id', selectedStudentIds);
      if (error) {
        toast({
          title: 'Failed to delete students',
          description: error.message,
          variant: 'destructive',
        });
        setDeleting(false);
        return;
      }
      setDeleteDialogOpen(false);
      setSelectedStudentIds([]);
      toast({
        title: 'Students deleted',
        description: 'Selected students have been deleted.',
        variant: 'default',
      });
      setLoading(true);
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      let studentsQuery = supabase.from('students').select('*');
      // If className is a number, treat as grade; else as group_name
      if (!isNaN(Number(className))) {
        studentsQuery = studentsQuery.eq('grade', className);
      } else {
        studentsQuery = studentsQuery.eq('group_name', className);
      }
      const { data: studentsData, error: studentsError } = await studentsQuery;
      if (studentsError || !studentsData) {
        toast({
          title: "Error",
          description: "Failed to fetch students for this class. Please try again.",
          variant: "destructive",
        });
        setStudents([]);
        setLoading(false);
        return;
      }
      // For grade view, also extract all sub-classes
      if (!isNaN(Number(className))) {
        const uniqueClasses = Array.from(new Set(studentsData.map(s => s.group_name).filter(Boolean)));
        setSubClasses(uniqueClasses);
      } else {
        setSubClasses([]);
      }
      // For each student, fetch their progress entries and calculate progress
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student) => {
          try {
            // Fetch progress entries from the database
            const { data: progressEntries, error: progressError } = await supabase
              .from('progress_entries')
              .select('*')
              .eq('student_id', student.id)
              .order('date', { ascending: false });

            if (progressError) {
              console.error(`Error fetching progress for student ${student.id}:`, progressError);
            }

            // Calculate progress based on actual entries
            const hafalanEntries = progressEntries?.filter(entry => entry.type === 'hafalan') || [];
            const tilawahEntries = progressEntries?.filter(entry => entry.type === 'tilawah') || [];

            // Calculate progress percentages
            const hafalanProgress = calculateHafalanProgress(hafalanEntries);
            const tilawahProgress = calculateTilawahProgress(tilawahEntries);

            return {
              id: student.id,
              name: student.name,
              grade: student.grade || null,
              group_name: student.group_name || '',
              teacher: student.teacher || '',
              photo: student.photo,
              hafalan_progress: hafalanProgress.percentage > 0 ? {
                percentage: hafalanProgress.percentage,
                last_surah: hafalanProgress.last_surah
              } : null,
              tilawah_progress: tilawahProgress.percentage > 0 ? {
                percentage: tilawahProgress.percentage,
                jilid: tilawahProgress.jilid
              } : null,
            };
          } catch (error) {
            console.error(`Failed to process progress for student ${student.id} (${student.name}):`, error);
            return {
              id: student.id,
              name: student.name,
              grade: student.grade || null,
              group_name: student.group_name || '',
              teacher: student.teacher || '',
              photo: student.photo,
              hafalan_progress: null,
              tilawah_progress: null,
            };
          }
        })
      );
      setStudents(studentsWithProgress);
      setLoading(false);
    };
    fetchStudents();
  }, [className, toast]);

  const handleViewDetails = (studentId: string) => {
    router.push(`/student/${studentId}`);
  };

  // Use fixed teacher list for filter
  const hasAnyActiveTeacherFilter = false; // No teacher filter implemented
  const clearTeacherFilters = () => setSelectedTeachers([]);

  // Selection handler for mass actions
  const handleToggleStudent = (id: string, checked: boolean) => {
    setSelectedStudentIds(prev =>
      checked ? [...prev, id] : prev.filter(sid => sid !== id)
    );
  };

  // Tabs logic
  const showTabs = !isNaN(Number(className));
  const tabList = ['all', ...subClasses];
  const tabLabels: Record<string, string> = { all: 'All Classes' };
  subClasses.forEach(cls => { tabLabels[cls] = cls; });
  // Filter students for active tab
  const studentsToShow = showTabs && activeTab !== 'all'
    ? students.filter(s => s.group_name === activeTab)
    : students;

  // Compute filtered students for selection (move here after studentsToShow is defined)
  const filteredStudents = studentsToShow.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) &&
    true // No teacher filter implemented
  );
  const filteredIds = filteredStudents.map(s => s.id);
  const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedStudentIds.includes(id));
  const someSelected = filteredIds.some(id => selectedStudentIds.includes(id)) && !allSelected;

  // Set indeterminate state
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    } else {
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  // Initialize mass edit data when modal opens
  useEffect(() => {
    if (massEditOpen && !prevMassEditOpen.current) {
      const initialData: Record<string, { name: string; grade: string; group_name: string; teacher: string }> = {};
      filteredStudents
        .filter(s => selectedStudentIds.includes(s.id))
        .forEach(student => {
          initialData[student.id] = {
            name: student.name || '',
            grade: student.grade || '',
            group_name: student.group_name || '',
            teacher: student.teacher || ''
          };
        });
      setMassEditData(initialData);
    }
    prevMassEditOpen.current = massEditOpen;
  }, [massEditOpen, selectedStudentIds, filteredStudents]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: className }
  ];

  const MainContent = (
    <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 mb-1 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-0 m-0 bg-transparent border-none outline-none flex items-center mr-2"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              {className}
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-semibold leading-none text-white bg-emerald-500 rounded-full">
                {studentsToShow.length}
              </span>
            </h1>
          </div>
        </div>
        {/* Tabs for grade view */}
        {showTabs && (
          <div className="flex gap-3 mb-4 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-4">
            {tabList.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-center min-w-max px-4 py-2 rounded-full font-semibold transition-all duration-150 text-sm mx-0
                  ${activeTab === tab
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  ${idx === tabList.length - 1 ? 'mr-2' : ''}
                `}
              >
                {tabLabels[tab] || tab}
              </button>
            ))}
          </div>
        )}
        {/* Collapsible Teacher Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="px-6 pt-6 pb-2">
            <input
              placeholder="Search students in this class..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base py-2 px-4 shadow-sm"
            />
            {/* Selected teacher filter badges */}
            {selectedTeachers.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-green-50 text-green-700 text-xs sm:text-sm rounded-full border border-green-200">
                  Teachers: {selectedTeachers.join(', ')}
                </span>
                <button
                  type="button"
                  onClick={clearTeacherFilters}
                  className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 mx-6" />
          <button
            className="w-full flex items-center gap-3 px-6 py-4 focus:outline-none"
            onClick={() => setTeacherFilterOpen(open => !open)}
            aria-expanded={teacherFilterOpen}
          >
            <div className="p-2 bg-blue-50 rounded-lg">
              {/* Optionally add a filter icon here */}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Teacher Filters</h3>
              <p className="text-xs sm:text-sm text-gray-500">Select one or more teachers to filter students</p>
              {hasAnyActiveTeacherFilter && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <button
                    type="button"
                    onClick={clearTeacherFilters}
                    className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            <span className="ml-auto text-xs text-gray-500">{teacherFilterOpen ? 'Hide' : 'Show'}</span>
          </button>
          {teacherFilterOpen && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Ustz. (female) teachers */}
                <div>
                  <div className="font-semibold text-emerald-700 text-xs mb-1">Ustz.</div>
                  {FIXED_TEACHERS.filter(t => t.name.startsWith('Ustz.')).map(teacher => (
                    <label key={teacher.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.name)}
                        onChange={() => {
                          setSelectedTeachers(prev =>
                            prev.includes(teacher.name)
                              ? prev.filter(t => t !== teacher.name)
                              : [...prev, teacher.name]
                          );
                        }}
                        className="rounded-full border-emerald-400"
                      />
                      <span className="text-sm text-gray-700">{teacher.name}</span>
                    </label>
                  ))}
                </div>
                {/* Ust. (male) teachers */}
                <div>
                  <div className="font-semibold text-teal-700 text-xs mb-1">Ust.</div>
                  {FIXED_TEACHERS.filter(t => t.name.startsWith('Ust.')).map(teacher => (
                    <label key={teacher.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.name)}
                        onChange={() => {
                          setSelectedTeachers(prev =>
                            prev.includes(teacher.name)
                              ? prev.filter(t => t !== teacher.name)
                              : [...prev, teacher.name]
                          );
                        }}
                        className="rounded-full border-emerald-400"
                      />
                      <span className="text-sm text-gray-700">{teacher.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {profile?.role !== 'parent' && (
          <>
            {/* Bulk Edit Toggle Button */}
            <div className="flex items-center justify-between mb-2">
              <button
                className="px-4 py-2 rounded-md font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 transition text-[14px]"
                onClick={() => {
                  setShowBulkEdit(v => {
                    if (v) setSelectedStudentIds([]); // If turning off, clear selection
                    return !v;
                  });
                }}
              >
                {showBulkEdit ? 'Cancel Bulk Edit' : 'Bulk Edit'}
              </button>
            </div>
            {/* Bulk Actions Bar */}
            {showBulkEdit && selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-2 my-2">
                <span className="text-sm text-gray-700 font-medium">{selectedStudentIds.length} selected</span>
                <button
                  className="px-3 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 shadow-sm transition text-[14px]"
                  style={{ fontSize: 14 }}
                  onClick={() => setMassEditOpen(true)}
                >
                  Edit Selected
                </button>
                <button
                  className="px-3 py-1 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm transition text-[14px]"
                  style={{ fontSize: 14 }}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Selected
                </button>
              </div>
            )}
            {/* Select All Checkbox */}
            {showBulkEdit && (
              <div className="flex items-center gap-4 mb-2">
                <label className="inline-flex items-center cursor-pointer relative">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="peer appearance-none w-6 h-6 border-2 border-gray-400 rounded-full bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-colors duration-200 focus:ring-2 focus:ring-emerald-400"
                    aria-label={allSelected ? 'Deselect all students' : 'Select all students'}
                  />
                  <span className="pointer-events-none absolute w-6 h-6 rounded-full border-2 border-gray-400 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 top-0 left-0 flex items-center justify-center">
                    {allSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                </label>
              </div>
            )}
          </>
        )}
        {/* Mass Edit Modal */}
        <Dialog open={massEditOpen} onOpenChange={setMassEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Selected Students</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Edit the details for each selected student below.</p>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
              {filteredStudents.filter(s => selectedStudentIds.includes(s.id)).map(student => (
                <div key={student.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.photo || '/avatars/placeholder.png'} alt={student.name} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-800">{student.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                              <input
                          className="border rounded px-2 py-1 w-full"
                          value={massEditData[student.id]?.name || ''}
                          placeholder="Name"
                          onChange={(e) => handleMassEditChange(student.id, 'name', e.target.value)}
                        />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
                                              <input
                          className="border rounded px-2 py-1 w-full"
                          value={massEditData[student.id]?.grade || ''}
                          placeholder="Grade"
                          onChange={(e) => handleMassEditChange(student.id, 'grade', e.target.value)}
                        />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                                              <input
                          className="border rounded px-2 py-1 w-full"
                          value={massEditData[student.id]?.group_name || ''}
                          placeholder="Class"
                          onChange={(e) => handleMassEditChange(student.id, 'group_name', e.target.value)}
                        />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
                                              <input
                          className="border rounded px-2 py-1 w-full"
                          value={massEditData[student.id]?.teacher || ''}
                          placeholder="Teacher"
                          onChange={(e) => handleMassEditChange(student.id, 'teacher', e.target.value)}
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancel</button>
              </DialogClose>
              <button className="px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition" onClick={handleSaveAll} disabled={saving}>
                {saving ? 'Saving...' : 'Save All'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Mass Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Selected Students</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete the following students? This action cannot be undone.</p>
            </DialogHeader>
            <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
              {filteredStudents.filter(s => selectedStudentIds.includes(s.id)).map(student => (
                <div key={student.id} className="flex items-center gap-3 p-2 border rounded bg-gray-50">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={student.photo || '/avatars/placeholder.png'} alt={student.name} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-800">{student.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{student.grade} {student.group_name}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" disabled={deleting}>Cancel</button>
              </DialogClose>
              <button className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition" onClick={handleMassDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete All'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading students...</div>
        ) : (
          <StudentsGrid
            students={filteredStudents.map(student => ({
              ...student,
              grade: student.grade || ''
            }))}
            filteredStudents={filteredStudents.map(student => ({
              ...student,
              grade: student.grade || ''
            }))}
            onViewDetails={handleViewDetails}
            userRole={profile?.role || 'parent'}
            selectedStudentIds={profile?.role !== 'parent' && showBulkEdit ? selectedStudentIds : undefined}
            onToggleStudent={profile?.role !== 'parent' && showBulkEdit ? handleToggleStudent : undefined}
          />
        )}
      </div>
    </div>
  );

  if (profile?.role === 'parent') {
    return <ParentLayout breadcrumbs={breadcrumbs}>{MainContent}</ParentLayout>;
  }
  return <TeacherLayout breadcrumbs={breadcrumbs}>{MainContent}</TeacherLayout>;
};

export default ClassDetail; 