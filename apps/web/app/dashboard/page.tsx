'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@devteam/ui/components/button';
import { ProjectCard } from '@devteam/ui/components/project-card';
import { EmptyDashboard } from '@devteam/ui/components/empty-dashboard';
import { ProjectFilters } from '@devteam/ui/components/project-filters';
import { mockProjects, type Project } from '../../../lib/mock-projects';

export default function DashboardPage() {
  const router = useRouter();
  const [projects] = useState<Project[]>(mockProjects);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>(
    'recent',
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'building' | 'ready' | 'error' | 'idle'
  >('all');

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.description.toLowerCase().includes(search.toLowerCase()) ||
          project.techStack.some((tech) =>
            tech.toLowerCase().includes(search.toLowerCase()),
          ),
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress - a.progress;
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return sorted;
  }, [projects, search, sortBy, statusFilter]);

  const handleCreateProject = () => {
    router.push('/dashboard/new-project');
  };

  const handleDeleteProject = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete project:', id);
  };

  // Show empty state if no projects
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <EmptyDashboard onCreateProject={handleCreateProject} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-8 px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and monitor your AI-powered projects
            </p>
          </div>
          <Button onClick={handleCreateProject} size="lg">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Project
          </Button>
        </div>

        {/* Filters */}
        <ProjectFilters
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No projects match your filters. Try adjusting your search or
              filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {projects.filter((p) => p.status === 'building').length}
              </p>
              <p className="text-sm text-muted-foreground">Building</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter((p) => p.status === 'ready').length}
              </p>
              <p className="text-sm text-muted-foreground">Ready</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(
                  projects.reduce((sum, p) => sum + p.progress, 0) /
                    projects.length,
                )}
                %
              </p>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
