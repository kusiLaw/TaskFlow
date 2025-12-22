import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MessageSquare, Paperclip } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>

            {/* Priority Badge */}
            {task.priority !== 'medium' && (
              <Badge
                variant="outline"
                className={`text-xs capitalize ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </Badge>
            )}
            {task.is_overdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}

            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    style={{ backgroundColor: `${label.color}20`, borderColor: label.color, color: label.color }}
                    className="text-xs"
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description Preview */}
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              {/* Assignees */}
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <Avatar key={assignee.id} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={assignee.avatar} alt={assignee.full_name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(assignee.full_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{task.assignees.length - 3}</span>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center space-x-2 text-gray-500">
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                )}
                {task.comment_count > 0 && (
                  <div className="flex items-center space-x-1 text-xs">
                    <MessageSquare className="h-3 w-3" />
                    <span>{task.comment_count}</span>
                  </div>
                )}
                {task.attachment_count > 0 && (
                  <div className="flex items-center space-x-1 text-xs">
                    <Paperclip className="h-3 w-3" />
                    <span>{task.attachment_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}