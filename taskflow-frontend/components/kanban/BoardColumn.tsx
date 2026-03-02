import { BoardList, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface BoardColumnProps {
  list: BoardList;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export function BoardColumn({ list, onTaskClick, onAddTask }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  return (
    <Card className="w-80 flex-shrink-0 flex flex-col max-h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <span>{list.name}</span>
            <span className="text-gray-500 font-normal">({list.tasks.length})</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        <SortableContext
          items={list.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="min-h-[100px]">
            {list.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}