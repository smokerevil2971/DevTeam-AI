'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import {
  Button,
  Card,
  Badge,
  Progress,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@devteam/ui';

// Agent components
import {
  AgentAvatar,
  AgentStatusCard,
  AGENT_TYPES,
  AgentType,
} from '@devteam/ui';

// Layout components
import { Header, Sidebar, PageHeader, EmptyProjects } from '@devteam/ui';

// Icons
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  Bot,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeId={activeNav}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        items={[
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <FolderKanban className="h-5 w-5" />,
            onClick: () => setActiveNav('dashboard'),
          },
          {
            id: 'projects',
            label: 'Projects',
            icon: <FolderKanban className="h-5 w-5" />,
            onClick: () => setActiveNav('projects'),
          },
          {
            id: 'chat',
            label: 'Chat',
            icon: <MessageSquare className="h-5 w-5" />,
            badge: 3,
            onClick: () => setActiveNav('chat'),
          },
          {
            id: 'agents',
            label: 'AI Agents',
            icon: <Bot className="h-5 w-5" />,
            onClick: () => setActiveNav('agents'),
          },
        ]}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          projectName="DevTeam AI"
          user={{
            name: session?.user?.name || 'Demo User',
            email: session?.user?.email || 'demo@devteam.ai',
          }}
          onLogout={() => signOut({ callbackUrl: '/login' })}
          onCommandPalette={() => console.log('Open command palette')}
          notificationCount={5}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Welcome header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back,{' '}
                {session?.user?.name?.split(' ')[0] || 'Developer'}! 👋
              </h1>
              <p className="mt-2 text-muted-foreground">
                Here's what's happening with your AI development team today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<FolderKanban className="h-5 w-5" />}
                label="Active Projects"
                value="3"
                trend="+1 this week"
                trendUp
                color="bg-blue-500"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Tasks Completed"
                value="24"
                trend="85% completion rate"
                trendUp
                color="bg-green-500"
              />
              <StatCard
                icon={<Bot className="h-5 w-5" />}
                label="AI Agents Active"
                value="6"
                trend="2 working now"
                color="bg-purple-500"
              />
              <StatCard
                icon={<MessageSquare className="h-5 w-5" />}
                label="Messages Today"
                value="47"
                trend="+12 from yesterday"
                trendUp
                color="bg-orange-500"
              />
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column - Projects and Tasks */}
              <div className="space-y-6 lg:col-span-2">
                {/* Recent Projects */}
                <Card className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Projects</h2>
                    <Button variant="outline" size="sm">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <ProjectRow
                      name="E-Commerce Platform"
                      description="Next.js storefront with Stripe payments"
                      progress={75}
                      agents={['frontend_dev', 'backend_dev']}
                      status="active"
                    />
                    <ProjectRow
                      name="Mobile App Backend"
                      description="REST API with authentication"
                      progress={45}
                      agents={['backend_dev', 'devops']}
                      status="active"
                    />
                    <ProjectRow
                      name="Landing Page Redesign"
                      description="Marketing site with animations"
                      progress={90}
                      agents={['designer', 'frontend_dev']}
                      status="review"
                    />
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <ActivityItem
                      agent="frontend_dev"
                      action="Completed component library setup"
                      time="2 minutes ago"
                      type="success"
                    />
                    <ActivityItem
                      agent="backend_dev"
                      action="Deployed API v2.0 to staging"
                      time="15 minutes ago"
                      type="success"
                    />
                    <ActivityItem
                      agent="qa_engineer"
                      action="Running automated test suite"
                      time="Just now"
                      type="working"
                    />
                    <ActivityItem
                      agent="designer"
                      action="Updated design tokens"
                      time="1 hour ago"
                      type="info"
                    />
                  </div>
                </Card>
              </div>

              {/* Right column - Agent Status */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                  <div className="grid gap-2">
                    <Button className="justify-start" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" /> Chat with
                      Agents
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <Zap className="mr-2 h-4 w-4" /> Run Automation
                    </Button>
                  </div>
                </Card>

                {/* Active Agents */}
                <Card className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Active Agents</h2>
                    <Badge variant="secondary">6 online</Badge>
                  </div>
                  <div className="space-y-3">
                    <AgentStatusRow
                      type="frontend_dev"
                      status="working"
                      task="Building dashboard components"
                    />
                    <AgentStatusRow
                      type="backend_dev"
                      status="working"
                      task="Optimizing database queries"
                    />
                    <AgentStatusRow
                      type="qa_engineer"
                      status="active"
                      task="Running test suite"
                    />
                    <AgentStatusRow type="designer" status="idle" />
                    <AgentStatusRow type="devops" status="idle" />
                    <AgentStatusRow
                      type="project_manager"
                      status="active"
                      task="Reviewing sprint progress"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${color} text-white`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
      {trend && (
        <div
          className={`mt-3 flex items-center gap-1 text-xs ${trendUp ? 'text-green-500' : 'text-muted-foreground'}`}
        >
          {trendUp && <TrendingUp className="h-3 w-3" />}
          {trend}
        </div>
      )}
    </Card>
  );
}

// Project Row Component
function ProjectRow({
  name,
  description,
  progress,
  agents,
  status,
}: {
  name: string;
  description: string;
  progress: number;
  agents: string[];
  status: 'active' | 'review' | 'completed';
}) {
  const statusColors = {
    active: 'bg-green-500/10 text-green-500',
    review: 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="cursor-pointer rounded-lg border bg-card/50 p-4 transition-colors hover:bg-muted/50">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge className={statusColors[status]}>{status}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {agents.map((agent) => (
            <AgentAvatar key={agent} type={agent as AgentType} size="sm" />
          ))}
        </div>
        <div className="ml-4 flex flex-1 items-center gap-3">
          <Progress value={progress} size="sm" className="flex-1" />
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  agent,
  action,
  time,
  type,
}: {
  agent: string;
  action: string;
  time: string;
  type: 'success' | 'working' | 'info';
}) {
  const typeColors = {
    success: 'text-green-500',
    working: 'text-yellow-500',
    info: 'text-muted-foreground',
  };

  return (
    <div className="flex items-start gap-3">
      <AgentAvatar
        type={agent as AgentType}
        size="sm"
        status={type === 'working' ? 'working' : 'active'}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${typeColors[type]}`}>{action}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {AGENT_TYPES[agent as AgentType]?.name}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {time}
          </span>
        </div>
      </div>
    </div>
  );
}

// Agent Status Row Component
function AgentStatusRow({
  type,
  status,
  task,
}: {
  type: AgentType;
  status: 'working' | 'active' | 'idle';
  task?: string;
}) {
  const statusStyles = {
    working: 'bg-yellow-500/10 text-yellow-500',
    active: 'bg-green-500/10 text-green-500',
    idle: 'bg-gray-500/10 text-gray-500',
  };

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <AgentAvatar type={type} size="sm" status={status} showTooltip={false} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{AGENT_TYPES[type]?.shortName}</p>
        {task ? (
          <p className="truncate text-xs text-muted-foreground">{task}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Available</p>
        )}
      </div>
      <Badge variant="secondary" className={`text-xs ${statusStyles[status]}`}>
        {status}
      </Badge>
    </div>
  );
}
