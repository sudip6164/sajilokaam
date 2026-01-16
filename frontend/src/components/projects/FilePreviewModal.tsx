import { useState, useEffect } from 'react';
import { X, Download, FileText, Image, File, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { filesApi } from '@/lib/api';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  file: {
    id: number;
    name: string;
    fileUrl?: string;
  };
}

export function FilePreviewModal({ isOpen, onClose, projectId, file }: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'text' | 'other'>('other');
  const [textContent, setTextContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    } else {
      // Cleanup
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setTextContent('');
      setError(null);
    }
  }, [isOpen, file]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadPreview = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);

    try {
      const blob = await filesApi.download(projectId, file.id);
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Determine preview type
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
        setPreviewType('image');
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else if (fileExtension === 'pdf') {
        setPreviewType('pdf');
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else if (['txt', 'md', 'json', 'xml', 'csv', 'js', 'ts', 'jsx', 'tsx', 'css', 'html'].includes(fileExtension)) {
        setPreviewType('text');
        const text = await blob.text();
        setTextContent(text);
      } else {
        setPreviewType('other');
        setError('Preview not available for this file type. Please download to view.');
      }
    } catch (err: any) {
      setError('Failed to load file preview');
      console.error('Error loading preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await filesApi.download(projectId, file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading file:', err);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-card">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="flex-shrink-0"
              title="Close (ESC)"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {previewType === 'image' && <Image className="h-5 w-5 flex-shrink-0" />}
            {previewType === 'pdf' && <FileText className="h-5 w-5 flex-shrink-0" />}
            {previewType === 'text' && <FileText className="h-5 w-5 flex-shrink-0" />}
            {previewType === 'other' && <File className="h-5 w-5 flex-shrink-0" />}
            <h2 className="text-lg font-semibold truncate">{file.name}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} title="Close (ESC)">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleDownload}>Download File</Button>
              </div>
            </div>
          ) : previewType === 'image' && previewUrl ? (
            <div className="flex items-center justify-center h-full">
              <img src={previewUrl} alt={file.name} className="max-w-full max-h-full object-contain" />
            </div>
          ) : previewType === 'pdf' && previewUrl ? (
            <div className="w-full h-full">
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[600px] border rounded"
                title={file.name}
              />
            </div>
          ) : previewType === 'text' ? (
            <div className="w-full h-full">
              <pre className="bg-muted p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {textContent}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">Preview not available</p>
                <Button onClick={handleDownload}>Download File</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
