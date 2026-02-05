import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../button';
import { cn } from '../../lib/utils';
import { Step1Describe } from './step-1-describe';
import { Step2Conversation } from './step-2-conversation';
import { Step3Review, generateMockPlan } from './step-3-review';
import { Step4Confirm } from './step-4-confirm';

interface Message {
  id: string;
  role: 'user' | 'pm';
  content: string;
  timestamp: Date;
}

interface WizardState {
  currentStep: number;
  projectDescription: string;
  conversation: Message[];
  projectPlan: any;
}

interface CreationWizardProps {
  onExit: () => void;
  onComplete: (projectId: string) => void;
}

const STEPS = [
  { number: 1, title: 'Describe' },
  { number: 2, title: 'Discuss' },
  { number: 3, title: 'Review' },
  { number: 4, title: 'Confirm' },
];

export function CreationWizard({ onExit, onComplete }: CreationWizardProps) {
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('project-creation-draft');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid saved state, use default
        }
      }
    }
    return {
      currentStep: 1,
      projectDescription: '',
      conversation: [],
      projectPlan: null,
    };
  });

  const [showExitDialog, setShowExitDialog] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && wizardState.currentStep < 4) {
      localStorage.setItem(
        'project-creation-draft',
        JSON.stringify(wizardState),
      );
    }
  }, [wizardState]);

  const handleExit = () => {
    if (
      wizardState.currentStep < 4 &&
      (wizardState.projectDescription || wizardState.conversation.length > 0)
    ) {
      setShowExitDialog(true);
    } else {
      onExit();
    }
  };

  const confirmExit = () => {
    // Clear draft
    if (typeof window !== 'undefined') {
      localStorage.removeItem('project-creation-draft');
    }
    onExit();
  };

  const handleStep1Continue = (description: string) => {
    setWizardState((prev) => ({
      ...prev,
      projectDescription: description,
      currentStep: 2,
    }));
  };

  const handleStep2Complete = (messages: Message[]) => {
    const plan = generateMockPlan(wizardState.projectDescription);
    setWizardState((prev) => ({
      ...prev,
      conversation: messages,
      projectPlan: plan,
      currentStep: 3,
    }));
  };

  const handleStep3Approve = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: 4,
    }));
    // Clear draft once project is being created
    if (typeof window !== 'undefined') {
      localStorage.removeItem('project-creation-draft');
    }
  };

  const handleStep3Edit = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: 2,
    }));
  };

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    wizardState.currentStep > step.number
                      ? 'bg-primary text-primary-foreground'
                      : wizardState.currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {step.number}
                </div>
                <span
                  className={cn(
                    'ml-2 hidden text-sm font-medium sm:inline',
                    wizardState.currentStep === step.number
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className="mx-2 h-px w-8 bg-border sm:w-12" />
                )}
              </div>
            ))}
          </div>

          {/* Exit Button */}
          <Button onClick={handleExit} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {wizardState.currentStep === 1 && (
          <Step1Describe
            initialValue={wizardState.projectDescription}
            onContinue={handleStep1Continue}
          />
        )}

        {wizardState.currentStep === 2 && (
          <Step2Conversation
            projectDescription={wizardState.projectDescription}
            initialMessages={wizardState.conversation}
            onComplete={handleStep2Complete}
            onBack={handleBack}
          />
        )}

        {wizardState.currentStep === 3 && wizardState.projectPlan && (
          <Step3Review
            projectPlan={wizardState.projectPlan}
            onApprove={handleStep3Approve}
            onEdit={handleStep3Edit}
            onBack={handleBack}
          />
        )}

        {wizardState.currentStep === 4 && (
          <Step4Confirm onViewDashboard={onExit} onOpenProject={onComplete} />
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-yellow-500/10 p-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Exit Project Creation?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your progress will be saved as a draft. You can continue later
                  from where you left off.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setShowExitDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={confirmExit}>Exit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
