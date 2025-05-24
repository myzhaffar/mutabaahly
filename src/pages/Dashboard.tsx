import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import StudentCard from '@/components/StudentCard';
import AddStudentDialog from '@/components/AddStudentDialog';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgHafalanProgress: 0,
    avgTilawahProgress: 0,
    completedStudents: 0
  });

  useEffect(() => {
    if (user && profile) {
      fetchStudents();
    }
  }, [user, profile]);

  const fetchStudents = async () => {
    try {
      // Fetch students with their progress
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          grade,
          group_name,
          teacher,
          photo,
          hafalan_progress (
            percentage,
            last_surah
          ),
          tilawah_progress (
            percentage,
            jilid
          )
        `);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return;
      }

      const formattedStudents = studentsData?.map(student => ({
        ...student,
        hafalan_progress: student.hafalan_progress?.[0] || null,
        tilawah_progress: student.tilawah_progress?.[0] || null
      })) || [];

      setStudents(formattedStudents);
      
      // Calculate stats
      const totalStudents = formattedStudents.length;
      const avgHafalan = formattedStudents.reduce((sum, s) => sum + (s.hafalan_progress?.percentage || 0), 0) / totalStudents;
      const avgTilawah = formattedStudents.reduce((sum, s) => sum + (s.tilawah_progress?.percentage || 0), 0) / totalStudents;
      const completed = formattedStudents.filter(s => 
        (s.hafalan_progress?.percentage || 0) === 100 && 
        (s.tilawah_progress?.percentage || 0) === 100
      ).length;

      setStats({
        totalStudents,
        avgHafalanProgress: Math.round(avgHafalan),
        avgTilawahProgress: Math.round(avgTilawah),
        completedStudents: completed
      });

    } catch (error) {
      console.error('Error in fetchStudents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  const handleStudentAdded = () => {
    fetchStudents();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name}
            </h1>
            <p className="text-gray-600">
              {profile?.role === 'teacher' ? 'Teacher Dashboard' : 'Parent Dashboard'}
            </p>
          </div>
          {profile?.role === 'teacher' && (
            <AddStudentDialog onStudentAdded={handleStudentAdded} />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Tilawah</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgTilawahProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-islamic-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-islamic-100 mr-4">
                  <Award className="h-6 w-6 text-islamic-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Hafalan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgHafalanProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-gold-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gold-100 mr-4">
                  <TrendingUp className="h-6 w-6 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Students Overview</h2>
          
          {students.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-600">
                  {profile?.role === 'teacher' 
                    ? 'Start by adding students to your class.' 
                    : 'No students assigned to your account.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={{
                    id: student.id,
                    name: student.name,
                    grade: student.grade || 'N/A',
                    class: student.group_name,
                    studyGroup: student.teacher,
                    memorization: {
                      progress: student.hafalan_progress?.percentage || 0,
                      status: (student.hafalan_progress?.percentage || 0) === 100 ? 'completed' : 
                              (student.hafalan_progress?.percentage || 0) > 0 ? 'inProgress' : 'notStarted',
                      currentSurah: student.hafalan_progress?.last_surah || 'Not started'
                    },
                    tilawati: {
                      progress: student.tilawah_progress?.percentage || 0,
                      status: (student.tilawah_progress?.percentage || 0) === 100 ? 'completed' : 
                              (student.tilawah_progress?.percentage || 0) > 0 ? 'inProgress' : 'notStarted',
                      currentLevel: student.tilawah_progress?.jilid || 'Not started'
                    }
                  }}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
