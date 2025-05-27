"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have this
import TeacherLayout from '@/components/layouts/TeacherLayout'; // Import the layout
import AddTestDialog from '@/components/AddTestDialog'; // Import the dialog
import TestResultsTable from '@/components/TestResultsTable'; // Import the table
import { supabase } from '@/integrations/supabase/client'; // For fetching students
import { Button } from '@/components/ui/button'; // For the trigger button
import { PlusCircle } from 'lucide-react'; // Icon for the button
import { StudentForTest, TilawatiTest } from '@/types/tilawati'; // Import shared types
// import TeacherSidebarLayout from '@/components/layouts/TeacherSidebarLayout'; // If you have a specific layout

const TeacherTestManagementPage = () => {
  const { profile } = useAuth(); // Or however you get user role
  const [isAddTestDialogOpen, setIsAddTestDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TilawatiTest | null>(null);
  const [students, setStudents] = useState<StudentForTest[]>([]);
  const [tests, setTests] = useState<TilawatiTest[]>([]); // To store fetched tests
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTests, setIsLoadingTests] = useState(true); // Start with loading true for tests

  const fetchTests = useCallback(async () => {
    setIsLoadingTests(true);
    try {
      const { data, error } = await supabase
        .from('tilawati_level_tests')
        .select(`
          id,
          student_id,
          current_jilid,
          target_jilid,
          test_date,
          examiner_name,
          status,
          score,
          notes,
          students ( name ) 
        `)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setTests((data as TilawatiTest[]) || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setTests([]); // Set to empty array on error
      // TODO: Show error toast to user
    } finally {
      setIsLoadingTests(false);
    }
  }, []);

  useEffect(() => {
    const fetchStudentsForDialog = async () => {
      setIsLoadingStudents(true);
      try {
        const { data, error } = await supabase.from('students').select('id, name');
        if (error) throw error;
        setStudents((data as StudentForTest[]) || []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]); // Set to empty on error
      }
      setIsLoadingStudents(false);
    };

    if (profile?.role === 'teacher') {
      fetchStudentsForDialog();
      fetchTests(); // Fetch tests when component mounts and user is teacher
    }
  }, [profile?.role, fetchTests]);

  const handleOpenAddTestDialog = (test: TilawatiTest | null = null) => {
    setEditingTest(test);
    setIsAddTestDialogOpen(true);
  };

  const handleTestAddedOrUpdated = (test: TilawatiTest) => {
    setIsAddTestDialogOpen(false);
    setEditingTest(null);
    fetchTests(); // Re-fetch tests to show the new/updated one
    // TODO: Show success toast
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data tes ini?")) return;
    try {
      const { error } = await supabase.from('tilawati_level_tests').delete().eq('id', testId);
      if (error) throw error;
      fetchTests(); // Re-fetch tests after deletion
      // TODO: Show success toast for deletion
    } catch (error) {
      console.error("Error deleting test:", error);
      // TODO: Show error toast for deletion
    }
  };

  if (profile?.role !== 'teacher' && !isLoadingStudents) { // check isLoadingStudents to prevent premature redirect if profile is still loading
    // This check is mostly a fallback; TeacherLayout handles primary redirection
    return <p>Loading or unauthorized...</p>;
  }

  return (
    <TeacherLayout> { /* Wrap content with TeacherLayout */ }
      <div className="container mx-auto px-0 py-0"> {/* Adjusted padding if layout adds its own */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Tes Kenaikan Level</h1>
          <Button onClick={() => handleOpenAddTestDialog()} className="bg-islamic-500 hover:bg-islamic-600 text-white">
            <PlusCircle className="mr-2 h-5 w-5" />
            Jadwalkan Tes Baru
          </Button>
        </div>
        <p className="mb-4 text-gray-600">
          Halaman ini digunakan untuk mengelola jadwal tes kenaikan level Tilawati siswa, mencatat hasil tes, dan melihat riwayat tes.
        </p>
        
        {/* Placeholder for filters */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">Filter Tes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="studentNameFilter" className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
              <input type="text" id="studentNameFilter" className="w-full p-2 border rounded-lg focus:ring-islamic-500 focus:border-islamic-500" placeholder="Cari siswa..." />
            </div>
            <div>
              <label htmlFor="testStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status Tes</label>
              <select id="testStatusFilter" className="w-full p-2 border rounded-lg focus:ring-islamic-500 focus:border-islamic-500">
                <option value="">Semua Status</option>
                <option value="scheduled">Terjadwal</option>
                <option value="passed">Lulus</option>
                <option value="failed">Gagal</option>
                <option value="pending_retake">Ulang</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label htmlFor="testDateFilter" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tes</label>
              <input type="date" id="testDateFilter" className="w-full p-2 border rounded-lg focus:ring-islamic-500 focus:border-islamic-500" />
            </div>
          </div>
        </div>

        {/* TestResultsTable Integration */}
        <div className="bg-white rounded-xl shadow-lg">
          {isLoadingTests ? (
            <div className="p-6 text-center text-gray-500">Memuat data tes...</div>
          ) : (
            <TestResultsTable 
              tests={tests}
              onEditTest={handleOpenAddTestDialog}
              onDeleteTest={handleDeleteTest}
              // onViewTestDetails={handleViewTestDetails} // TODO: Implement details modal and handler
            />
          )}
        </div>
      </div>

      {isAddTestDialogOpen && (
        <AddTestDialog
          isOpen={isAddTestDialogOpen}
          onClose={() => {
            setIsAddTestDialogOpen(false);
            setEditingTest(null);
          }}
          onTestAddedOrUpdated={handleTestAddedOrUpdated}
          students={students}
          currentTest={editingTest}
        />
      )}
    </TeacherLayout>
  );
};

export default TeacherTestManagementPage; 