'use client';

import { useEffect, useState } from 'react';
import { useOrganizations } from '@/lib/hooks/useOrganizations';
import { projectsApi } from '@/lib/api/projects';
import { Project } from '@/types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { FolderKanban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProjectsPage() {
  const { currentOrganization } = useOrganizations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [currentOrganization]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.list();
      console.log('Projects API response:', data); // Debug
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProjects(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        // Handle paginated response
        setProjects(Array.isArray(data.results) ? data.results : []);
      } else {
        console.error('Invalid projects response:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Defensive: ensure projects is always an array
  const projectsList = Array.isArray(projects) ? projects : [];
  const activeProjects = projectsList.filter((p) => p.status === 'active');
  const archivedProjects = projectsList.filter((p) => p.status === 'archived');

  if (!currentOrganization) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600">Please select an organization first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and tasks in {currentOrganization.name}
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={loadProjects} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : projectsList.length === 0 ? (
        <div className="text-center py-12">
          <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first project.
          </p>
          <CreateProjectDialog onProjectCreated={loadProjects} />
        </div>
      ) : (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeProjects.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No active projects</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => {
                      /* TODO: Edit dialog */
                    }}
                    onDelete={async () => {
                      if (confirm('Are you sure you want to delete this project?')) {
                        await projectsApi.delete(project.id);
                        loadProjects();
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived">
            {archivedProjects.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No archived projects</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}