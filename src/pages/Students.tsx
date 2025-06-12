import React from 'react';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();

  return (
    <TeacherLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <Construction className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold mb-4">Under Development</h1>
          <p className="text-gray-600 mb-8">
            Student management page is currently under development. We're working hard to bring you a comprehensive student management system soon.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-green-400 to-teal-500 text-white hover:opacity-90"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Students;
