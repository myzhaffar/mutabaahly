
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import AddTestDialog from '@/components/AddTestDialog';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TilawatiTest, TestStatus, TilawatiJilid, StudentForTest } from '@/types/tilawati';

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
}

const JILID_OPTIONS: TilawatiJilid[] = [
  "Jilid 1", "Jilid 2", "Jilid 3", "Jilid 4", "Jilid 5", "Jilid 6",
  "Ghorib", "Tajwid", "Al-Quran", "Evaluasi"
];

const STATUS_OPTIONS: TestStatus[] = [
  'scheduled', 'passed', 'failed', 'pending_retake', 'cancelled'
];

const TeacherTestManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TilawatiTest | null>(null);
  const [filters, setFilters] = useState<TestFilters>({});

  // Fetch students for the teacher
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['teacher-students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      console.log('Fetching students for teacher:', profile.id);
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          group_name,
          teacher
        `)
        .eq('teacher', profile.full_name);

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      console.log('Found students:', data);
      return (data || []).map(student => ({
        id: student.id,
        name: student.name,
        class_name: student.group_name || '',
      }));
    },
    enabled: !!profile?.id,
  });

  // Fetch tests with filters
  const { data: tests, isLoading, refetch } = useQuery({
    queryKey: ['tilawati-tests', filters],
    queryFn: async () => {
      let query = supabase
        .from('tilawati_level_tests')
        .select(`
          id,
          date,
          student_id,
          class_name,
          tilawati_level,
          status,
          munaqisy,
          notes
        `);

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.date) {
        query = query.eq('date', filters.date);
      }
      if (filters.jilidLevel && filters.jilidLevel !== 'all') {
        query = query.eq('tilawati_level', filters.jilidLevel);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }

      return data as TilawatiTest[];
    },
    enabled: !!profile?.id,
  });

  // Fetch students for the test dialog
  const { data: studentsForTest } = useQuery({
    queryKey: ['students-for-test'],
    queryFn: async () => {
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          group_name,
          teacher
        `)
        .order('name');

      if (error) throw error;

      return (students || []).map(student => ({
        id: student.id,
        name: student.name,
        class_name: student.group_name || '',
      })) as StudentForTest[];
    },
    enabled: !!profile?.id,
  });

  const handleTestUpdate = () => {
    refetch();
    toast({
      title: "Success",
      description: "Test data has been updated successfully.",
    });
  };

  const handleFilterChange = (key: keyof TestFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tes Kenaikan Level</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Jadwalkan Tes
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Cari nama siswa..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.jilidLevel || undefined}
            onValueChange={(value) => handleFilterChange('jilidLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter Jilid" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jilid</SelectItem>
              {JILID_OPTIONS.map((jilid) => (
                <SelectItem key={jilid} value={jilid}>{jilid}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters.date || ''}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            placeholder="Filter Tanggal"
          />
        </div>

        {/* Tests Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Level Tilawati</TableHead>
                <TableHead>Munaqisy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Tidak ada data tes yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                tests?.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{format(new Date(test.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{test.student_id}</TableCell>
                    <TableCell>{test.class_name || '-'}</TableCell>
                    <TableCell>{test.tilawati_level}</TableCell>
                    <TableCell>{test.munaqisy}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        test.status === 'passed' ? 'bg-green-100 text-green-800' :
                        test.status === 'failed' ? 'bg-red-100 text-red-800' :
                        test.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        test.status === 'pending_retake' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{test.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedTest(test);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Test Dialog */}
        {isAddDialogOpen && (
          <AddTestDialog
            isOpen={isAddDialogOpen}
            onClose={() => {
              setIsAddDialogOpen(false);
              setSelectedTest(null);
            }}
            onTestAddedOrUpdated={(test) => {
              refetch();
              setIsAddDialogOpen(false);
              setSelectedTest(null);
            }}
            currentTest={selectedTest}
            students={studentsForTest || []}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherTestManagement;
