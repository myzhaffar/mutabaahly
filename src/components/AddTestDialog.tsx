"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { saveTest } from '@/utils/testQueries';
import type { StudentForTest, TilawatiTest, TilawatiJilid, TestStatus } from '@/types/tilawati';

interface AddTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTestAddedOrUpdated: (test: TilawatiTest) => void;
  students: StudentForTest[];
  currentTest?: TilawatiTest | null;
}

const JILID_OPTIONS: TilawatiJilid[] = [
  "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6"
];

const STATUS_OPTIONS: TestStatus[] = [
  'scheduled', 'passed', 'failed'
];

const AddTestDialog: React.FC<AddTestDialogProps> = ({
  isOpen,
  onClose,
  onTestAddedOrUpdated,
  students,
  currentTest,
}) => {
  const { profile } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [className, setClassName] = useState('');
  const [tilawatiLevel, setTilawatiLevel] = useState<TilawatiJilid | ''>('');
  const [testDate, setTestDate] = useState('');
  const [munaqisy, setMunaqisy] = useState(profile?.full_name || '');
  const [status, setStatus] = useState<TestStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTest) {
      setStudentId(currentTest.student_id);
      setClassName(currentTest.class_name || '');
      setTilawatiLevel(currentTest.tilawati_level);
      setTestDate(currentTest.date ? new Date(currentTest.date).toISOString().substring(0, 10) : '');
      setMunaqisy(currentTest.munaqisy);
      setStatus(currentTest.status);
      setNotes(currentTest.notes || '');
    } else {
      // Reset form for new entry
      setStudentId('');
      setClassName('');
      setTilawatiLevel('');
      setTestDate('');
      setMunaqisy(profile?.full_name || '');
      setStatus('scheduled');
      setNotes('');
    }
  }, [currentTest, isOpen, profile?.full_name]);

  useEffect(() => {
    if (studentId && !currentTest) {
      const selectedStudent = students.find(s => s.id === studentId);
      if (selectedStudent?.class_name) {
        setClassName(selectedStudent.class_name);
      }
      if (selectedStudent?.current_tilawati_jilid) {
        setTilawatiLevel(selectedStudent.current_tilawati_jilid);
      }
    }
  }, [studentId, students, currentTest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!studentId || !tilawatiLevel || !testDate || !munaqisy || !className) {
      setError("All required fields must be filled.");
      setIsLoading(false);
      return;
    }

    try {
      const testData = {
        student_id: studentId,
        class_name: className,
        tilawati_level: tilawatiLevel as TilawatiJilid,
        date: testDate,
        munaqisy,
        status,
        notes: notes || '',
      };

      const result = await saveTest(testData, currentTest?.id);
      onTestAddedOrUpdated(result);
      onClose();
    } catch (error) {
      console.error("Error saving test:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === studentId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] bg-white flex flex-col h-[calc(100vh-32px)] sm:h-auto max-h-[calc(100vh-32px)] p-0" aria-describedby="add-test-description">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle>{currentTest ? 'Edit Tilawati Test' : 'Schedule Tilawati Test'}</DialogTitle>
          <DialogDescription id="add-test-description">
            {currentTest ? 'Edit test details below.' : 'Fill in the Tilawati test details for the student.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId} disabled={!!currentTest}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.class_name ? `(${s.class_name})` : ''} - {s.current_tilawati_jilid} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {studentId && (
                <div className="text-sm mt-1">
                    <p className="text-green-600">
                      ✅ Student has completed their current level and is ready for testing
                  </p>
                  {selectedStudent && (
                    <p className="text-muted-foreground mt-1">
                      Teacher: {selectedStudent.teacher}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Class Name"
              />
            </div>

            <div>
              <Label htmlFor="tilawatiLevel">Tilawati Level</Label>
              <Select 
                value={tilawatiLevel} 
                onValueChange={(value: TilawatiJilid) => setTilawatiLevel(value)}
              >
                <SelectTrigger id="tilawatiLevel">
                  <SelectValue placeholder="Select Tilawati Level" />
                </SelectTrigger>
                <SelectContent>
                  {JILID_OPTIONS.map(jilid => (
                    <SelectItem key={jilid} value={jilid}>{jilid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testDate">Test Date</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
                <div>
                <Label htmlFor="munaqisy">Examiner</Label>
                <Input
                  id="munaqisy"
                  value={munaqisy}
                  onChange={(e) => setMunaqisy(e.target.value)}
                  placeholder="Examiner Name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value: TestStatus) => setStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes if needed..."
                className="h-20"
              />
            </div>
          </div>

          {error && (
              <div className="text-sm font-medium text-red-500 mt-2 mb-4">
              {error}
            </div>
          )}
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 border-t mt-auto flex-shrink-0">
            <div className="flex justify-end gap-4 w-full">
            <DialogClose asChild>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
              <GradientButton type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : currentTest ? 'Save Changes' : 'Add Test'}
              </GradientButton>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestDialog;
