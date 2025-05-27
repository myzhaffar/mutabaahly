import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ParentLayout from '@/components/layouts/ParentLayout';
import type { TilawatiTest, TestStatus } from '@/types/tilawati';

const STATUS_OPTIONS: TestStatus[] = [
  'scheduled', 'passed', 'failed', 'pending_retake', 'cancelled'
];

const ParentTestView: React.FC = () => {
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const { data: tests, isLoading } = useQuery({
    queryKey: ['parent-tilawati-tests', statusFilter, dateFilter],
    queryFn: async () => {
      if (!profile?.id) return [];

      let query = supabase
        .from('tilawati_level_tests')
        .select(`
          *,
          students (
            name,
            class_name,
            parent_id
          )
        `)
        .eq('students.parent_id', profile.id)
        .order('test_date', { ascending: true });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (dateFilter) {
        query = query.gte('test_date', dateFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }

      // Filter out any tests where students is null (in case of data inconsistency)
      return (data || [])
        .filter(test => test.students)
        .map(test => ({
          ...test,
          students: test.students || { name: 'Unknown', class_name: 'Unknown' }
        })) as TilawatiTest[];
    },
    enabled: !!profile?.id,
  });

  return (
    <ParentLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jadwal Tes Kenaikan Level</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value: TestStatus | 'all') => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[200px]">
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
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[200px]"
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
                <TableHead>Jilid Saat Ini</TableHead>
                <TableHead>Target Jilid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Penguji</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Tidak ada data tes yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                tests?.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{format(new Date(test.test_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{test.students?.name}</TableCell>
                    <TableCell>{test.students?.class_name}</TableCell>
                    <TableCell>{test.current_jilid}</TableCell>
                    <TableCell>{test.target_jilid}</TableCell>
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
                    <TableCell>{test.score || '-'}</TableCell>
                    <TableCell>{test.examiner_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {test.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ParentLayout>
  );
};

export default ParentTestView; 