'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity } from '@/types';
import { projectsApi } from '@/lib/api/projects';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, formatDate } from '@/lib/utils';
import { Activity as ActivityIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityFeedProps {
  projectId: string;
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivities = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      setError('');
      const data = await projectsApi.getActivities(projectId);
      console.log('Activities raw response:', data);
      console.log('Is array:', Array.isArray(data));

      const activityList = Array.isArray(data)
        ? data
        : (data as any)?.results ?? [];

      console.log('Activity list length:', activityList.length);
      setActivities(activityList);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
      setError(err?.response?.data?.detail || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      task_created: '✅',
      task_updated: '✏️',
      task_deleted: '🗑️',
      task_moved: '↔️',
      comment_added: '💬',
      attachment_added: '📎',
      assignee_added: '👤',
      due_date_set: '📅',
      label_added: '🏷️',
    };
    return icons[action] || '📌';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Recent Activity</h3>
          {!loading && (
            <span className="text-xs text-gray-400">
              ({activities.length})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadActivities}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <Button variant="ghost" size="sm" onClick={loadActivities}>
            Try again
          </Button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ActivityIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs mt-1">
            Create or move tasks to see activity here
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-2">
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={activity.user?.avatar} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {getInitials(
                        activity.user?.full_name || activity.user?.email || '?'
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">
                      {activity.user?.full_name || activity.user?.email}
                    </span>{' '}
                    <span className="text-gray-600">{activity.description}</span>
                    {activity.task_title && (
                      <span className="font-medium text-blue-600">
                        {' '}
                        &ldquo;{activity.task_title}&rdquo;
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
                <span className="flex-shrink-0 text-sm">
                  {getActionIcon(activity.action)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}