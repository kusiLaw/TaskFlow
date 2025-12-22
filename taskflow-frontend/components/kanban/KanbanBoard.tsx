'use client';

import { useState, useEffect, useCallback } from 'react';
import { Board, Task } from '@/types';
import { BoardColumn } from './BoardColumn';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskDialog } from './CreateTaskDialog';
import { projectsApi } from '@/lib/api/projects';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  projectId: string;
  filters?: any;
}

// Helper to deduplicate tasks by id
function deduplicateTasks(tasks: Task[]): Task[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });
}

export function KanbanBoard({ projectId, filters }: KanbanBoardProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadBoard = useCallback(async () => {
    try {
      const boards = await projectsApi.getBoards(projectId);
      if (boards.length > 0) {
        const boardData = boards[0];

        // Deduplicate tasks in each list when loading
        boardData.lists = boardData.lists.map((list) => ({
          ...list,
          tasks: deduplicateTasks(list.tasks),
        }));

        setBoard(boardData);
      }
    } catch (error) {
      console.error('Failed to load board:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadBoard();
  }, [projectId, filters]);

  // WebSocket connection
  const wsUrl =
    typeof window !== 'undefined' && projectId
      ? `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/projects/${projectId}/`
      : null;

  const { isConnected } = useWebSocket(wsUrl, {
    onMessage: (message) => {
      switch (message.type) {
        case 'task_update':
          handleTaskWebSocketUpdate(message);
          break;
        case 'user_presence':
          handleUserPresence(message);
          break;
      }
    },
  });

  const handleTaskWebSocketUpdate = (message: any) => {
    const { action, task } = message;

    // Instead of manually updating state (which causes duplicates),
    // just reload the board for create/delete actions
    if (action === 'created' || action === 'deleted') {
      loadBoard();
      return;
    }

    // For move/update, update in place to avoid flicker
    if (!board) return;

    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard;

      const newBoard = {
        ...prevBoard,
        lists: prevBoard.lists.map((list) => ({ ...list, tasks: [...list.tasks] })),
      };

      if (action === 'updated') {
        newBoard.lists.forEach((list) => {
          const taskIndex = list.tasks.findIndex((t) => t.id === task.id);
          if (taskIndex !== -1) {
            list.tasks[taskIndex] = task;
          }
        });
      } else if (action === 'moved') {
        // Remove from all lists first
        newBoard.lists.forEach((list) => {
          list.tasks = list.tasks.filter((t) => t.id !== task.id);
        });
        // Add to correct list
        const targetList = newBoard.lists.find((l) => l.id === task.board_list);
        if (targetList) {
          targetList.tasks.push(task);
          targetList.tasks.sort((a, b) => a.position - b.position);
        }

        // Deduplicate after move
        newBoard.lists.forEach((list) => {
          list.tasks = deduplicateTasks(list.tasks);
        });
      }

      return newBoard;
    });
  };

  const handleUserPresence = (message: any) => {
    const { action, user_id } = message;
    if (action === 'joined') {
      setOnlineUsers((prev) => new Set(prev).add(user_id));
    } else if (action === 'left') {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(user_id);
        return next;
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleAddTask = (listId: string) => {
    setSelectedListId(listId);
    setCreateTaskDialogOpen(true);
  };

  const handleTaskCreated = () => {
    // Reload board fresh from server - avoids duplicate from WebSocket + state update
    loadBoard();
  };

  const handleTaskUpdated = () => {
    loadBoard();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board?.lists
      .flatMap((list) => list.tasks)
      .find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeTaskId = active.id as string;
    const overContainerId = over.id as string;

    const sourceList = board.lists.find((list) =>
      list.tasks.some((task) => task.id === activeTaskId)
    );
    const destList = board.lists.find(
      (list) =>
        list.id === overContainerId ||
        list.tasks.some((task) => task.id === overContainerId)
    );

    if (!sourceList || !destList || sourceList.id === destList.id) return;

    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard;

      const newBoard = {
        ...prevBoard,
        lists: prevBoard.lists.map((list) => ({ ...list, tasks: [...list.tasks] })),
      };

      const newSourceList = newBoard.lists.find((l) => l.id === sourceList.id)!;
      const newDestList = newBoard.lists.find((l) => l.id === destList.id)!;

      const taskIndex = newSourceList.tasks.findIndex((t) => t.id === activeTaskId);
      if (taskIndex === -1) return prevBoard;

      const [movedTask] = newSourceList.tasks.splice(taskIndex, 1);
      const destTaskIndex = newDestList.tasks.findIndex((t) => t.id === overContainerId);

      if (destTaskIndex >= 0) {
        newDestList.tasks.splice(destTaskIndex, 0, movedTask);
      } else {
        newDestList.tasks.push(movedTask);
      }

      // Deduplicate after drag over
      newBoard.lists.forEach((list) => {
        list.tasks = deduplicateTasks(list.tasks);
      });

      return newBoard;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !board) return;

    const activeTaskId = active.id as string;
    const destList = board.lists.find((list) =>
      list.tasks.some((task) => task.id === activeTaskId)
    );

    if (!destList) return;

    const taskIndex = destList.tasks.findIndex((task) => task.id === activeTaskId);

    try {
      await projectsApi.moveTask(activeTaskId, destList.id, taskIndex);
      // WebSocket will handle the update, no need to reload
    } catch (error) {
      console.error('Failed to move task:', error);
      // Reload to revert on error
      await loadBoard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No board found for this project.</p>
      </div>
    );
  }

  return (
    <>
      {/* Connection Status */}
      <div className="mb-4 flex items-center space-x-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-400'
          }`}
        />
        <span className="text-sm text-gray-500">
          {isConnected ? 'Live' : 'Offline'}
        </span>
        {onlineUsers.size > 0 && (
          <span className="text-sm text-gray-500">
            · {onlineUsers.size} online
          </span>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
          {board.lists.map((list) => (
            <BoardColumn
              key={list.id}
              list={list}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask(list.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-80 rotate-2 opacity-90">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={taskModalOpen}
          onOpenChange={setTaskModalOpen}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        projectId={projectId}
        listId={selectedListId}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
}