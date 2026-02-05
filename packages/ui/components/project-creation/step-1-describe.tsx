import { useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '../button';

interface Step1DescribeProps {
  initialValue?: string;
  onContinue: (description: string) => void;
}

const EXAMPLE_PROMPTS = [
  'A task management app with real-time collaboration, like Trello but with AI-powered task suggestions',
  'An e-commerce platform for handmade crafts with integrated payment processing and seller analytics',
  'A fitness tracking app that uses AI to create personalized workout plans based on user goals',
  'A social media platform for book lovers to share reviews, recommendations, and reading lists',
];

const TIPS = [
  'Be specific about the main features you want',
  'Mention any specific technologies you prefer (optional)',
  'Describe who will use your app and why',
  'Include any unique selling points',
];

export function Step1Describe({
  initialValue = '',
  onContinue,
}: Step1DescribeProps) {
  const [description, setDescription] = useState(initialValue);

  const handleExampleClick = (example: string) => {
    setDescription(example);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">Describe Your Project Idea</h2>
        <p className="mt-2 text-muted-foreground">
          Tell us what you want to build. The more detail, the better!
        </p>
      </div>

      {/* Main Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Project Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project idea in detail..."
          className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {description.length} character{description.length !== 1 ? 's' : ''}
          </span>
          <span>Minimum 50 characters recommended</span>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-medium">Example Ideas</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(prompt)}
              className="rounded-md border border-dashed border-muted-foreground/25 bg-muted/50 p-3 text-left text-sm transition-colors hover:border-primary hover:bg-muted"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-medium">Tips for a great description</h3>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {TIPS.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 text-xs">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => onContinue(description)}
          disabled={description.trim().length < 10}
          size="lg"
        >
          Continue to PM Conversation
        </Button>
      </div>
    </div>
  );
}
