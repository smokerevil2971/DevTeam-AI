'use client';

import { useRouter } from 'next/navigation';
import { CreationWizard } from '@devteam/ui/components/project-creation/creation-wizard';

export default function NewProjectPage() {
  const router = useRouter();

  const handleExit = () => {
    router.push('/dashboard');
  };

  const handleComplete = (projectId: string) => {
    // In a real implementation, this would navigate to the project workspace
    console.log('Project created:', projectId);
    // For now, just redirect to dashboard
    router.push('/dashboard');
  };

  return <CreationWizard onExit={handleExit} onComplete={handleComplete} />;
}
