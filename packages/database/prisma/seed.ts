import { PrismaClient, ProjectStatus, Visibility, TaskStatus, Priority, AgentType, SenderType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Demo User
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@devteam.ai' },
    update: {},
    create: {
      email: 'demo@devteam.ai',
      name: 'Demo User',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // 2. Create Sample Project
  const sampleProject = await prisma.project.upsert({
    where: { id: 'demo-project-001' },
    update: {},
    create: {
      id: 'demo-project-001',
      name: 'DevTeam AI Demo',
      description: 'A sample project to explore DevTeam AI features. This project demonstrates how AI agents collaborate to build software.',
      userId: demoUser.id,
      status: ProjectStatus.active,
      visibility: Visibility.private,
      techStack: {
        frontend: ['Next.js', 'React', 'Tailwind CSS'],
        backend: ['Fastify', 'Prisma', 'PostgreSQL'],
        infrastructure: ['Docker', 'GitHub Actions'],
      },
    },
  });

  console.log('✅ Sample project created:', sampleProject.name);

  // 3. Create Project Settings
  await prisma.projectSettings.upsert({
    where: { projectId: sampleProject.id },
    update: {},
    create: {
      projectId: sampleProject.id,
      config: {
        codeStyle: 'prettier',
        testFramework: 'vitest',
        agentPreferences: {
          autoAssign: true,
          requireReview: true,
        },
      },
    },
  });

  // 4. Create Sample Tasks
  const tasks = [
    {
      id: 'task-001',
      title: 'Set up project structure',
      description: 'Initialize the monorepo with pnpm workspaces, configure TypeScript, and set up the basic folder structure.',
      status: TaskStatus.completed,
      priority: Priority.high,
      assignedAgent: AgentType.pm,
      order: 1,
    },
    {
      id: 'task-002',
      title: 'Implement user authentication',
      description: 'Set up NextAuth.js with email/password and OAuth providers. Include login, signup, and password reset flows.',
      status: TaskStatus.completed,
      priority: Priority.high,
      assignedAgent: AgentType.backend,
      order: 2,
    },
    {
      id: 'task-003',
      title: 'Create dashboard UI',
      description: 'Design and implement the main dashboard with project list, recent activity, and quick actions.',
      status: TaskStatus.in_progress,
      priority: Priority.medium,
      assignedAgent: AgentType.frontend,
      order: 3,
    },
    {
      id: 'task-004',
      title: 'Set up API endpoints',
      description: 'Create RESTful API endpoints for projects, tasks, and messages using Fastify.',
      status: TaskStatus.pending,
      priority: Priority.medium,
      assignedAgent: AgentType.backend,
      order: 4,
    },
    {
      id: 'task-005',
      title: 'Add unit tests',
      description: 'Write comprehensive unit tests for all API endpoints and utility functions.',
      status: TaskStatus.pending,
      priority: Priority.low,
      assignedAgent: AgentType.testing,
      order: 5,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...task,
        projectId: sampleProject.id,
        completedAt: task.status === TaskStatus.completed ? new Date() : null,
      },
    });
  }

  console.log('✅ Sample tasks created:', tasks.length);

  // 5. Create Sample Messages (only user messages due to FK constraint on senderId)
  const userMessage = {
    id: 'msg-001',
    senderType: SenderType.user,
    senderId: demoUser.id,
    messageType: 'text',
    content: 'Hey team! Let\'s build an amazing AI-powered code editor. What should we start with?',
  };

  await prisma.message.upsert({
    where: { id: userMessage.id },
    update: {},
    create: {
      ...userMessage,
      projectId: sampleProject.id,
    },
  });

  console.log('✅ Sample messages created: 1');

  // 6. Create Sample Files
  const files = [
    {
      id: 'file-001',
      path: '/README.md',
      name: 'README.md',
      extension: 'md',
      content: '# DevTeam AI Demo\n\nThis is a sample project demonstrating AI-powered collaborative development.\n\n## Getting Started\n\n```bash\npnpm install\npnpm dev\n```',
      mimeType: 'text/markdown',
      lastModifiedBy: demoUser.id,
    },
    {
      id: 'file-002',
      path: '/src/index.ts',
      name: 'index.ts',
      extension: 'ts',
      content: '// Main entry point\nconsole.log("Hello from DevTeam AI!");',
      mimeType: 'text/typescript',
      lastModifiedBy: demoUser.id,
    },
  ];

  for (const file of files) {
    await prisma.file.upsert({
      where: { id: file.id },
      update: {},
      create: {
        ...file,
        projectId: sampleProject.id,
        size: file.content.length,
      },
    });
  }

  console.log('✅ Sample files created:', files.length);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo login credentials:');
  console.log('   Email: demo@devteam.ai');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
