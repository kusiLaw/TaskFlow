'use client';

import { Attachment } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, Trash2, File, Image as ImageIcon, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function AttachmentList({ attachments, onDelete, canDelete }: AttachmentListProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (contentType.includes('pdf') || contentType.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isImage = (contentType: string) => contentType.startsWith('image/');

  const handleDownload = (attachment: Attachment) => {
    window.open(attachment.file_url || attachment.file, '_blank');
  };

  if (attachments.length === 0) {
    return <p className="text-sm text-gray-500">No attachments yet</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {isImage(attachment.content_type) ? (
                <div
                  className="h-12 w-12 rounded border overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => setPreviewImage(attachment.file_url || attachment.file)}
                >
                  <img
                    src={attachment.file_url || attachment.file}
                    alt={attachment.filename}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded border flex items-center justify-center bg-gray-100 flex-shrink-0">
                  {getFileIcon(attachment.content_type)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{attachment.filename}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatFileSize(attachment.file_size)}</span>
                  <span>•</span>
                  <span>{attachment.uploaded_by.full_name}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(attachment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}