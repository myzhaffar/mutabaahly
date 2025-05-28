
import React from 'react';
import TeacherLayout from '@/components/layouts/TeacherLayout';

const Students: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Daftar Siswa</h1>
        <p className="text-gray-600">
          Halaman manajemen siswa sedang dalam pengembangan.
        </p>
      </div>
    </TeacherLayout>
  );
};

export default Students;
