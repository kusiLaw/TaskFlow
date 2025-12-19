'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, X, File, Image as ImageIcon, FileText } from 'lucide-react';
import { projectsApi } from '@/lib/api/projects';
import { Attachment } from '@/types';
import { Progress } from '@/components/ui/progress';

interface AttachmentUploaderProps {
  taskId: string;
  onUploadComplete: () => void;
}

export function AttachmentUploader({ taskId, onUploadComplete }: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress (since we can't track S3 upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await projectsApi.uploadAttachment(taskId, file);

      clearInterval(progressInterval);
      setProgress(100);

      // Reset after a short delay
      setTimeout(() => {
        setProgress(0);
        onUploadComplete();
      }, 500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Paperclip className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : 'Attach File'}
      </Button>

      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500">{progress}%</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}