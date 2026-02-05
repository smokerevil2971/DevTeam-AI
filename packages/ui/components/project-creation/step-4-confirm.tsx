import { useEffect, useState } from 'react';
import { CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '../button';

interface Step4ConfirmProps {
  projectName?: string;
  onViewDashboard: () => void;
  onOpenProject: (projectId: string) => void;
}

export function Step4Confirm({
  projectName = 'New Project',
  onViewDashboard,
  onOpenProject,
}: Step4ConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing project...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate project creation progress
    const steps = [
      { progress: 20, status: 'Creating project structure...', delay: 500 },
      {
        progress: 40,
        status: 'Setting up development environment...',
        delay: 1000,
      },
      { progress: 60, status: 'Initializing AI agents...', delay: 1000 },
      { progress: 80, status: 'Generating initial tasks...', delay: 800 },
      { progress: 100, status: 'Project ready!', delay: 500 },
    ];

    let currentStep = 0;

    const runNextStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setTimeout(() => {
          setProgress(step.progress);
          setStatus(step.status);

          if (step.progress === 100) {
            setIsComplete(true);
          } else {
            currentStep++;
            runNextStep();
          }
        }, step.delay);
      }
    };

    runNextStep();
  }, []);

  const mockProjectId = 'mock-project-' + Date.now();

  return (
    <div className="mx-auto max-w-2xl space-y-8 text-center">
      {!isComplete ? (
        <>
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold">Creating Your Project</h2>
            <p className="mt-2 text-muted-foreground">
              Setting up your development environment and AI team...
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            {/* Progress Circle Animation */}
            <div className="relative mx-auto h-32 w-32">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{progress}%</span>
              </div>
            </div>

            {/* Status Text */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <p className="text-sm font-medium">{status}</p>
            </div>

            {/* Progress Bar */}
            <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Success State */}
          <div className="space-y-4">
            {/* Success Icon with Animation */}
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-3xl font-bold">
                Project Created Successfully!
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                {projectName} is ready to go
              </p>
            </div>

            {/* Info Cards */}
            <div className="mx-auto grid max-w-lg gap-3 text-left">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <Rocket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">AI Team Assembled</p>
                    <p className="text-sm text-muted-foreground">
                      5 specialized agents are ready to work on your project
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-500/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Initial Tasks Created</p>
                    <p className="text-sm text-muted-foreground">
                      Your project has been broken down into actionable tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={onViewDashboard} variant="outline" size="lg">
                View Dashboard
              </Button>
              <Button onClick={() => onOpenProject(mockProjectId)} size="lg">
                Open Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
