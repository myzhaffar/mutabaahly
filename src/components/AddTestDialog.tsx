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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { StudentForTest, TilawatiTest, TilawatiJilid, TestStatus } from '@/types/tilawati';

interface AddTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTestAddedOrUpdated: (test: TilawatiTest) => void;
  students: StudentForTest[];
  currentTest?: TilawatiTest | null;
}

const JILID_OPTIONS: TilawatiJilid[] = [
  "Jilid 1", "Jilid 2", "Jilid 3", "Jilid 4", "Jilid 5", "Jilid 6",
  "Ghorib", "Tajwid", "Al-Quran", "Evaluasi"
];

const STATUS_OPTIONS: TestStatus[] = [
  'scheduled', 'passed', 'failed', 'pending_retake', 'cancelled'
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
      setError("Semua field wajib harus diisi.");
      setIsLoading(false);
      return;
    }

    // Create the test data object that matches the database schema
    const testData = {
      student_id: studentId,
      class_name: className,
      tilawati_level: tilawatiLevel,
      date: testDate,
      munaqisy,
      status,
      notes: notes || null,
    };

    console.log('Submitting test data:', testData);

    try {
      let result;
      if (currentTest?.id) {
        // Update existing test
        const { data, error: updateError } = await supabase
          .from('tilawati_level_tests')
          .update(testData)
          .eq('id', currentTest.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        result = data;
      } else {
        // Create new test
        const { data, error: insertError } = await supabase
          .from('tilawati_level_tests')
          .insert(testData)
          .select('*')
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        result = data;
      }
      
      console.log('Database result:', result);
      
      if (result) {
        // Transform the result to match our TilawatiTest interface
        const transformedResult: TilawatiTest = {
          id: result.id,
          date: result.date,
          student_id: result.student_id,
          class_name: result.class_name,
          tilawati_level: result.tilawati_level as TilawatiJilid,
          status: result.status as TestStatus,
          munaqisy: result.munaqisy,
          notes: result.notes,
          created_at: result.created_at || new Date().toISOString(),
          updated_at: result.updated_at || new Date().toISOString(),
        };
        
        onTestAddedOrUpdated(transformedResult);
        onClose();
      }
    } catch (error) {
      console.error("Error saving test:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] bg-white">
        <DialogHeader>
          <DialogTitle>{currentTest ? 'Edit Test Kenaikan Level' : 'Jadwalkan Tes Kenaikan Level'}</DialogTitle>
          <DialogDescription>
            {currentTest ? 'Ubah detail tes di bawah ini.' : 'Isi detail tes kenaikan level Tilawati untuk siswa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="student">Siswa</Label>
              <Select value={studentId} onValueChange={setStudentId} disabled={!!currentTest}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Pilih Siswa" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.class_name ? `(${s.class_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="className">Nama Kelas</Label>
              <Input
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Nama Kelas"
              />
            </div>

            <div>
              <Label htmlFor="tilawatiLevel">Level Tilawati</Label>
              <Select 
                value={tilawatiLevel} 
                onValueChange={(value: TilawatiJilid) => setTilawatiLevel(value)}
              >
                <SelectTrigger id="tilawatiLevel">
                  <SelectValue placeholder="Pilih Level Tilawati" />
                </SelectTrigger>
                <SelectContent>
                  {JILID_OPTIONS.map(jilid => (
                    <SelectItem key={jilid} value={jilid}>{jilid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testDate">Tanggal Tes</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="munaqisy">Nama Munaqisy</Label>
                <Input
                  id="munaqisy"
                  value={munaqisy}
                  onChange={(e) => setMunaqisy(e.target.value)}
                  placeholder="Nama Munaqisy"
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
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan..."
                className="h-20"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : currentTest ? 'Simpan Perubahan' : 'Jadwalkan Tes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTestDialog;
