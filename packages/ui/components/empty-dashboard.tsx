import { Button } from './button';
import { Card } from './card';

export interface EmptyDashboardProps {
  onCreateProject: () => void;
}

export function EmptyDashboard({ onCreateProject }: EmptyDashboardProps) {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="mx-4 w-full max-w-2xl">
        <div className="space-y-6 p-12 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Welcome to DevTeam AI</h2>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              Get started by creating your first project. Our AI agents will
              help you build it from scratch.
            </p>
          </div>

          {/* Quick Start Steps */}
          <div className="mx-auto grid max-w-lg gap-4 pt-4 text-left">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                1
              </div>
              <div>
                <h4 className="font-semibold">Describe Your Idea</h4>
                <p className="text-sm text-muted-foreground">
                  Tell us what you want to build in plain English
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                2
              </div>
              <div>
                <h4 className="font-semibold">Choose Your Stack</h4>
                <p className="text-sm text-muted-foreground">
                  Select your preferred technologies and frameworks
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                3
              </div>
              <div>
                <h4 className="font-semibold">Let AI Build</h4>
                <p className="text-sm text-muted-foreground">
                  Watch as our agent team creates your project
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6">
            <Button size="lg" onClick={onCreateProject} className="px-8">
              Create Your First Project
            </Button>
          </div>

          {/* Help Link */}
          <p className="pt-4 text-sm text-muted-foreground">
            Need help?{' '}
            <a href="/docs" className="text-primary hover:underline">
              Read the documentation
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
