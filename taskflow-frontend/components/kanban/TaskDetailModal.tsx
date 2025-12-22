'use client';

import { useState, useEffect } from 'react';
import { Task, Comment, Attachment } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageSquare, Paperclip, Trash2, X } from 'lucide-react';
import { projectsApi } from '@/lib/api/projects';
import { getInitials, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { AttachmentUploader } from './AttachmentUploader';
import { AttachmentList } from './AttachmentList';
import { DatePicker } from '@/components/ui/date-picker';

interface TaskDetailModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(task.due_date ? new Date(task.due_date) : undefined);
  
  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      loadComments();
      loadAttachments();
    }
  }, [open, task]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await projectsApi.getComments(task.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadAttachments = async () => {
    setAttachmentsLoading(true);
    try {
      const data = await projectsApi.getAttachments(task.id);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await projectsApi.updateTask(task.id, {
        title,
        description,
        priority: priority as any,
        due_date: dueDate ? dueDate.toISOString() : null,
      });
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await projectsApi.createComment({
        task: task.id,
        content: newComment,
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await projectsApi.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await projectsApi.deleteAttachment(attachmentId);
      await loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await projectsApi.deleteTask(task.id);
        onTaskUpdated();
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="line-clamp-1">{task.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Task Details Form */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  {/* // */}
                <div className="grid gap-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <DatePicker
                    date={dueDate}
                    onDateChange={setDueDate}
                    placeholder="Set due date"
                  />
                  {task.is_overdue && (
                    <p className="text-sm text-red-600">This task is overdue!</p>
                  )}
                </div>


                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Badge
                    variant="outline"
                    className={`w-fit capitalize ${getPriorityColor(priority)}`}
                  >
                    {priority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(task.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.created_by.avatar} />
                  <AvatarFallback className="text-xs">
                    {getInitials(task.created_by.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span>Created by {task.created_by.full_name}</span>
              </div>
            </div>

            {/* Assignees */}
            {task.assignees.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="mb-2 block">Assignees</Label>
                  <div className="flex flex-wrap gap-2">
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(assignee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Tabs for Comments and Attachments */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attachments ({attachments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4 mt-4 ">
                {commentsLoading ? (
                  <p className="text-sm text-gray-500">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{comment.user.full_name}</span>
                            {comment.user.id === user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {user && getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button type="submit" size="sm" disabled={!newComment.trim()}>
                      Post
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4 mt-4">
                <AttachmentUploader
                  taskId={task.id}
                  onUploadComplete={loadAttachments}
                />

                {attachmentsLoading ? (
                  <p className="text-sm text-gray-500">Loading attachments...</p>
                ) : (
                  <AttachmentList
                    attachments={attachments}
                    onDelete={handleDeleteAttachment}
                    canDelete={true}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}