import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: string;
  name: string;
  group_name: string;
  teacher: string;
}

const StudentManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students for the teacher
  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ['teacher-students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

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

      return data as Student[];
    },
    enabled: !!profile?.id,
  });

  const handleAddStudent = async () => {
    // TODO: Implement add student dialog
    toast({
      title: "Coming Soon",
      description: "Add student functionality will be implemented soon.",
    });
  };

  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TeacherLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student List</h1>
          <Button onClick={handleAddStudent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredStudents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Tidak ada siswa yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.group_name || '-'}</TableCell>
                    <TableCell>{student.teacher || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          // TODO: Implement edit student
                          toast({
                            title: "Coming Soon",
                            description: "Edit student functionality will be implemented soon.",
                          });
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
      </div>
    </TeacherLayout>
  );
};

export default StudentManagement;
