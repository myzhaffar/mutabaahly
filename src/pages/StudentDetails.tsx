import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import AddProgressDialog from '@/components/AddProgressDialog';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';

interface Student {
  id: string;
  name: string;
  grade: string;
  group_name: string;
  teacher: string;
  photo: string | null;
}

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

interface ProgressData {
  hafalan_progress: { percentage: number; last_surah: string | null } | null;
  tilawah_progress: { percentage: number; jilid: string | null } | null;
}

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [progressData, setProgressData] = useState<ProgressData>({
    hafalan_progress: null,
    tilawah_progress: null
  });
  const [hafalanEntries, setHafalanEntries] = useState<ProgressEntry[]>([]);
  const [tilawahEntries, setTilawahEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStudentData();
      fetchProgressEntries();
    }
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressEntries = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('student_id', id)
        .order('date', { ascending: false });

      if (error) throw error;

      const hafalan = entries?.filter(entry => entry.type === 'hafalan') || [];
      const tilawah = entries?.filter(entry => entry.type === 'tilawah') || [];

      setHafalanEntries(hafalan);
      setTilawahEntries(tilawah);

      // Calculate dynamic progress
      const hafalanProgress = calculateHafalanProgress(hafalan);
      const tilawahProgress = calculateTilawahProgress(tilawah);

      setProgressData({
        hafalan_progress: hafalanProgress.percentage > 0 ? hafalanProgress : null,
        tilawah_progress: tilawahProgress.percentage > 0 ? tilawahProgress : null
      });

      // Update progress in database
      if (hafalan.length > 0) {
        await supabase
          .from('hafalan_progress')
          .upsert({
            student_id: id,
            percentage: hafalanProgress.percentage,
            last_surah: hafalanProgress.last_surah,
            updated_at: new Date().toISOString()
          });
      }

      if (tilawah.length > 0) {
        await supabase
          .from('tilawah_progress')
          .upsert({
            student_id: id,
            percentage: tilawahProgress.percentage,
            jilid: tilawahProgress.jilid,
            updated_at: new Date().toISOString()
          });
      }

    } catch (error) {
      console.error('Error fetching progress entries:', error);
    }
  };

  const handleProgressAdded = () => {
    fetchStudentData();
    fetchProgressEntries();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-500"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
        </div>

        {/* Student Overview Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.photo || ''} alt={student.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-medium">{student.grade || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-medium">{student.group_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teacher</p>
                    <p className="font-medium">{student.teacher}</p>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-islamic-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Award className="h-5 w-5 text-islamic-600 mr-2" />
                      <h3 className="font-semibold text-islamic-900">Hafalan Progress</h3>
                    </div>
                    <Progress 
                      value={progressData.hafalan_progress?.percentage || 0} 
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      {progressData.hafalan_progress?.percentage || 0}% completed
                    </p>
                    <p className="text-xs text-gray-500">
                      Current: {progressData.hafalan_progress?.last_surah || 'Not started'}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-green-900">Tilawati Progress</h3>
                    </div>
                    <Progress 
                      value={progressData.tilawah_progress?.percentage || 0} 
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      {progressData.tilawah_progress?.percentage || 0}% completed
                    </p>
                    <p className="text-xs text-gray-500">
                      Current: {progressData.tilawah_progress?.jilid || 'Not started'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <AddProgressDialog studentId={student.id} onProgressAdded={handleProgressAdded} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Progress Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Progress Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hafalan" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hafalan">Hafalan/Memorizing</TabsTrigger>
                <TabsTrigger value="tilawah">Tilawati/Reciting</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hafalan" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Surah</TableHead>
                      <TableHead>Verse/Ayat</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hafalanEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No hafalan progress recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      hafalanEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.surah_or_jilid || '-'}</TableCell>
                          <TableCell>{entry.ayat_or_page || '-'}</TableCell>
                          <TableCell>{entry.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="tilawah" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Jilid/Level</TableHead>
                      <TableHead>Page/Verse</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tilawahEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No tilawati progress recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      tilawahEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.surah_or_jilid || '-'}</TableCell>
                          <TableCell>{entry.ayat_or_page || '-'}</TableCell>
                          <TableCell>{entry.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetails;
