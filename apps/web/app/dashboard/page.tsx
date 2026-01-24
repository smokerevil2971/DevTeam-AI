'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@devteam/ui';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">DevTeam AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome back, {session?.user?.name || 'Developer'}!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Manage your AI-powered development projects
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Active Projects" value="1" icon="📁" />
          <StatsCard title="Tasks" value="5" icon="✅" />
          <StatsCard title="AI Agents" value="8" icon="🤖" />
          <StatsCard title="Messages" value="12" icon="💬" />
        </div>

        {/* Recent Projects */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Your Projects</h3>
          <div className="space-y-4">
            <ProjectCard
              name="DevTeam AI Demo"
              description="A sample project to explore DevTeam AI features"
              status="active"
              techStack={['Next.js', 'React', 'Tailwind CSS']}
            />
          </div>
          <div className="mt-6">
            <Button>Create New Project</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{title}</p>
    </div>
  );
}

function ProjectCard({
  name,
  description,
  status,
  techStack,
}: {
  name: string;
  description: string;
  status: string;
  techStack: string[];
}) {
  return (
    <div className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-3 flex gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-secondary px-2 py-1 text-xs"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs capitalize text-green-500">
          {status}
        </span>
      </div>
    </div>
  );
}
