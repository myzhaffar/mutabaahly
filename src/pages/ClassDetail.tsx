import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';

interface Student {
  id: string;
  name: string;
  grade: string;
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
  const { className } = useParams<{ className: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('all');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('group_name', className);
      if (studentsError || !studentsData) {
        setStudents([]);
        setLoading(false);
        return;
      }
      // For each student, fetch their progress entries and calculate progress
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const { data: hafalanEntries } = await supabase
              .from('progress_entries')
              .select('*')
              .eq('student_id', student.id)
              .eq('type', 'hafalan');
            const { data: tilawahEntries } = await supabase
              .from('progress_entries')
              .select('*')
              .eq('student_id', student.id)
              .eq('type', 'tilawah');
            const hafalanProgress = calculateHafalanProgress(hafalanEntries || []);
            const tilawahProgress = calculateTilawahProgress(tilawahEntries || []);
            return {
              ...student,
              hafalan_progress: hafalanProgress.percentage > 0 ? hafalanProgress : null,
              tilawah_progress: tilawahProgress.percentage > 0 ? tilawahProgress : null
            };
          } catch (error) {
            return {
              ...student,
              hafalan_progress: null,
              tilawah_progress: null
            };
          }
        })
      );
      setStudents(studentsWithProgress);
      setLoading(false);
    };
    fetchStudents();
  }, [className]);

  const handleViewDetails = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  // Get unique teacher names from students in this class
  const teacherOptions = Array.from(new Set(students.map(s => s.teacher))).sort();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedTeacher === 'all' || student.teacher === selectedTeacher)
  );

  return (
    <TeacherLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class: {className}</h1>
            <p className="text-gray-600">Students: {filteredStudents.length}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search students in this class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teacherOptions.map(teacher => (
                <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading students...</div>
        ) : (
          <StudentsGrid
            students={students}
            filteredStudents={filteredStudents}
            onViewDetails={handleViewDetails}
            userRole="teacher"
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default ClassDetail; 