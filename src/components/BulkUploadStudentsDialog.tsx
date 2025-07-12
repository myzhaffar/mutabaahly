import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { FIXED_TEACHERS } from '@/utils/rankingDataService';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface BulkUploadStudentsDialogProps {
  onStudentsAdded: () => void;
}

interface StudentData {
  name: string;
  group_name: string;
  teacher: string;
  grade?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const BulkUploadStudentsDialog: React.FC<BulkUploadStudentsDialogProps> = ({ onStudentsAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StudentData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; success: number; failed: number }>({
    current: 0,
    total: 0,
    success: 0,
    failed: 0
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Return null if user is not a teacher
  if (profile?.role !== 'teacher') {
    return null;
  }

  const validateStudentData = (data: StudentData[], startRow: number = 1): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    data.forEach((student, index) => {
      const rowNumber = startRow + index;
      
      // Validate name
      if (!student.name || student.name.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Student name is required'
        });
      } else if (student.name.trim().length < 2) {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Student name must be at least 2 characters long'
        });
      }
      
      // Validate group_name
      if (!student.group_name || student.group_name.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'group_name',
          message: 'Group/Class is required'
        });
      }
      
      // Validate teacher
      if (!student.teacher || student.teacher.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'teacher',
          message: 'Teacher is required'
        });
      } else {
        // Check if teacher exists in FIXED_TEACHERS
        const teacherExists = FIXED_TEACHERS.some(t => t.name === student.teacher.trim());
        if (!teacherExists) {
          errors.push({
            row: rowNumber,
            field: 'teacher',
            message: `Teacher "${student.teacher}" not found in the system`
          });
        }
      }
    });
    
    return errors;
  };

  const processFile = async (file: File) => {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let data: StudentData[] = [];

      if (fileExtension === 'csv') {
        // Process CSV file
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
        });

        if (result.errors.length > 0) {
          throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
        }

        data = result.data as StudentData[];
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        // Process Excel file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error('Excel file must have at least a header row and one data row');
        }

        // Convert to StudentData format
        const headers = (jsonData[0] as string[]).map(h => h?.toString().toLowerCase().replace(/\s+/g, '_'));
        data = (jsonData.slice(1) as string[][]).map(row => {
          const student: Record<string, string> = {};
          headers.forEach((header, index) => {
            if (row[index] !== undefined && row[index] !== null) {
              student[header] = row[index].toString().trim();
            }
          });
          return {
            name: student.name || '',
            group_name: student.group_name || '',
            teacher: student.teacher || '',
            grade: student.grade
          } as StudentData;
        });
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
      }

      // Validate the data
      const errors = validateStudentData(data, 2); // Start from row 2 (after header)
      setValidationErrors(errors);
      setPreviewData(data);

      if (errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: `Found ${errors.length} validation errors. Please fix them before uploading.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "File Processed",
          description: `Successfully processed ${data.length} students. Ready to upload.`,
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData([]);
      setValidationErrors([]);
      setUploadProgress({ current: 0, total: 0, success: 0, failed: 0 });
      processFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || previewData.length === 0 || validationErrors.length > 0) {
      return;
    }

    setLoading(true);
    setUploadProgress({ current: 0, total: previewData.length, success: 0, failed: 0 });

    try {
      const validStudents = previewData.map(student => ({
        name: student.name.trim(),
        group_name: student.group_name.trim(),
        teacher: student.teacher.trim(),
        grade: student.grade?.trim() || null
      }));

      // Insert students in batches
      const batchSize = 10;
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < validStudents.length; i += batchSize) {
        const batch = validStudents.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('students')
          .insert(batch);

        if (error) {
          console.error('Error inserting batch:', error);
          failedCount += batch.length;
        } else {
          successCount += batch.length;
        }

        setUploadProgress(prev => ({
          ...prev,
          current: i + batch.length,
          success: successCount,
          failed: failedCount
        }));
      }

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully added ${successCount} students${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
        });
        setOpen(false);
        onStudentsAdded();
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to add any students. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading students:', error);
      toast({
        title: "Error",
        description: "Failed to upload students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Only one header row, followed by student data (no grade column)
    const templateData = [
      { name: 'Ahmad Ali', group_name: 'Class A', teacher: 'Pak Muzhaffar' },
      { name: 'Fatima Zahra', group_name: 'Class B', teacher: 'Bu Titin' },
      { name: 'Muhammad Hassan', group_name: 'Class A', teacher: 'Pak Heri' },
      { name: 'Aisha Rahman', group_name: 'Class C', teacher: 'Bu Liana' },
      { name: 'Yusuf Ibrahim', group_name: 'Class B', teacher: 'Bu Witri' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData, { header: ["name", "group_name", "teacher"] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');
    
    XLSX.writeFile(workbook, 'students_template.xlsx');
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setUploadProgress({ current: 0, total: 0, success: 0, failed: 0 });
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to add multiple students at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="file-input">Upload File</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!selectedFile ? (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    CSV, XLSX, or XLS files only
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-green-500" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFile}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Validation Errors ({validationErrors.length})</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    Row {error.row}: {error.field} - {error.message}
                  </div>
                ))}
                {validationErrors.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... and {validationErrors.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && validationErrors.length === 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Preview ({previewData.length} students)</span>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 border-b pb-1">
                  <div>Name</div>
                  <div>Group</div>
                  <div>Teacher</div>
                </div>
                {previewData.slice(0, 5).map((student, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 text-xs border-b py-1">
                    <div>{student.name}</div>
                    <div>{student.group_name}</div>
                    <div>{student.teacher}</div>
                  </div>
                ))}
                {previewData.length > 5 && (
                  <div className="text-xs text-gray-500 pt-1">
                    ... and {previewData.length - 5} more students
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{uploadProgress.current}/{uploadProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Success: {uploadProgress.success}</span>
                <span>Failed: {uploadProgress.failed}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <GradientButton
              type="button"
              onClick={handleUpload}
              disabled={loading || !selectedFile || previewData.length === 0 || validationErrors.length > 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Students'
              )}
            </GradientButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadStudentsDialog; 