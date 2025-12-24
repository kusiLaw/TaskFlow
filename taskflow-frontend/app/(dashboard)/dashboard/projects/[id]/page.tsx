'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types';
import { projectsApi } from '@/lib/api/projects';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ActivityFeed } from '@/components/projects/ActivityFeed';
import { TaskFilters } from '@/components/kanban/TaskFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [activityOpen, setActivityOpen] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId) return;

    try {
      const data = await projectsApi.get(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      router.push('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-100">
      {/* Header */}
      <div className="border-b bg-white px-6 py-3 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-xs text-gray-500">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TaskFilters
              onFilterChange={setFilters}
              projectMembers={project.members || []}
            />

            <Sheet open={activityOpen} onOpenChange={setActivityOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[480px]">
                <SheetHeader>
                  <SheetTitle>Project Activity</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {/* Only render ActivityFeed when sheet is open */}
                  {activityOpen && (
                    <ActivityFeed projectId={projectId} />
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="container mx-auto flex-1 overflow-hidden p-4 ">
        <KanbanBoard projectId={projectId} filters={filters} />
      </div>
    </div>
  );
}