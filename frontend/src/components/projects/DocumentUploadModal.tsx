import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onUploadSuccess?: () => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  projectId,
  onUploadSuccess
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 10MB limit');
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file type
      const allowedTypes = ['.txt', '.pdf'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Please upload TXT or PDF files. DOC/DOCX support coming soon!');
        e.target.value = ''; // Reset input
        return;
      }

      setFile(selectedFile);
      setExtractedTasks([]);
      setSelectedTasks([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    // Validate file size again
    if (file.size === 0) {
      toast.error('Selected file is empty. Please choose a valid file.');
      return;
    }

    try {
      setUploading(true);

      // Upload document and extract tasks using ML
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `/projects/${projectId}/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // ML service has extracted tasks!
      const tasks = response.data.tasks || [];
      setExtractedTasks(tasks);
      setProcessingId(response.data.id);

      // Auto-select all tasks
      setSelectedTasks(tasks.map((_: any, idx: number) => idx));

      toast.success(`Document processed! ${tasks.length} tasks extracted using AI.`);

    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload document';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTasks = async () => {
    if (selectedTasks.length === 0) {
      toast.error('Please select at least one task');
      return;
    }

    try {
      setUploading(true);

      // Get selected suggestion IDs
      const suggestionIds = selectedTasks.map(idx => extractedTasks[idx].id);

      // Create tasks from selected suggestions
      await api.post(
        `/projects/${projectId}/documents/${processingId}/create-tasks`,
        { suggestionIds }
      );

      toast.success(`${selectedTasks.length} tasks created successfully!`);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      onClose();

    } catch (error: any) {
      console.error('Error creating tasks:', error);
      toast.error(error.response?.data?.error || 'Failed to create tasks');
    } finally {
      setUploading(false);
    }
  };

  const toggleTask = (index: number) => {
    if (selectedTasks.includes(index)) {
      setSelectedTasks(selectedTasks.filter(i => i !== index));
    } else {
      setSelectedTasks([...selectedTasks, index]);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'HIGH': 'text-red-600',
      'MEDIUM': 'text-yellow-600',
      'LOW': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-purple-100 flex-shrink-0 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Upload Requirements Document</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                AI will automatically extract tasks from your document
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-hidden flex flex-col">
          {/* Upload Section */}
          {extractedTasks.length === 0 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary font-medium hover:underline">
                      Choose a file
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".txt,.pdf"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Supported formats: TXT, PDF (Max 10MB)
                </p>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.size > 0
                          ? file.size >= 1024 * 1024
                            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                            : `${(file.size / 1024).toFixed(2)} KB`
                          : '0 KB'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setFile(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">AI-Powered Task Extraction</h4>
                    <p className="text-sm text-blue-800">
                      Our ML service will analyze your document and automatically extract tasks,
                      priorities, due dates, and estimated hours using Natural Language Processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Tasks */}
          {extractedTasks.length > 0 && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Extracted Tasks ({extractedTasks.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedTasks.length === extractedTasks.length) {
                      setSelectedTasks([]);
                    } else {
                      setSelectedTasks(extractedTasks.map((_, idx) => idx));
                    }
                  }}
                >
                  {selectedTasks.length === extractedTasks.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '55vh' }}>
                {extractedTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${selectedTasks.includes(index) ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTasks.includes(index)}
                        onCheckedChange={() => toggleTask(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            Method: <span className="font-medium">{task.extractionMethod || 'ML'}</span>
                          </span>
                          {task.confidenceScore && (
                            <span className="text-gray-500">
                              Confidence: <span className="font-medium text-green-600">
                                {(task.confidenceScore * 100).toFixed(0)}%
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>

        <CardFooter className="border-t p-6 bg-gray-50 flex-shrink-0 mt-auto">
          <div className="flex gap-3 w-full">
            {extractedTasks.length === 0 ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract Tasks with AI
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCreateTasks}
                  disabled={selectedTasks.length === 0 || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Tasks...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create {selectedTasks.length} Task{selectedTasks.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
