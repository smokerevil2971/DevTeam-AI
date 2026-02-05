import { useState, useEffect, useRef } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import { Button } from '../button';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'pm';
  content: string;
  timestamp: Date;
}

interface Step2ConversationProps {
  projectDescription: string;
  initialMessages?: Message[];
  onComplete: (messages: Message[]) => void;
  onBack: () => void;
}

// Mock PM questions based on project description
const generatePMQuestions = (description: string): string[] => {
  return [
    'Thanks for sharing your idea! To help create the best plan, I have a few questions.',
    "What's your target timeline for this project? Are you looking for an MVP in a few weeks or a more comprehensive solution?",
    'Who is your primary target audience? Understanding your users will help us design the right features.',
    'Do you have any existing brand guidelines, design preferences, or tech stack requirements?',
  ];
};

export function Step2Conversation({
  projectDescription,
  initialMessages = [],
  onComplete,
  onBack,
}: Step2ConversationProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pmQuestions = useRef(generatePMQuestions(projectDescription));

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      // Send first PM message after a short delay
      setTimeout(() => {
        addPMMessage(pmQuestions.current[0]);
        setCurrentQuestion(1);
      }, 500);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addPMMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'pm',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000); // Simulate typing delay
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput('');

    // If there are more questions, ask the next one
    if (currentQuestion < pmQuestions.current.length) {
      setTimeout(() => {
        addPMMessage(pmQuestions.current[currentQuestion]);
        setCurrentQuestion((prev) => prev + 1);
      }, 1500);
    } else {
      // Conversation complete
      setTimeout(() => {
        addPMMessage(
          'Perfect! I have all the information I need. Let me create a comprehensive project plan for you.',
        );
      }, 1500);
    }
  };

  const handleSkip = () => {
    // Skip remaining questions and complete
    const skipMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: "I'll provide more details later",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, skipMessage]);

    setTimeout(() => {
      addPMMessage(
        "No problem! I'll create a plan based on what you've shared. You can always refine it later.",
      );
    }, 1000);
  };

  const canContinue =
    currentQuestion >= pmQuestions.current.length && !isTyping;

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">Chat with Project Manager</h2>
        <p className="mt-2 text-muted-foreground">
          Answer a few questions to help create the perfect plan
        </p>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-muted/30 p-6"
        style={{ minHeight: '400px', maxHeight: '500px' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                message.role === 'pm'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground text-background',
              )}
            >
              {message.role === 'pm' ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Message */}
            <div
              className={cn(
                'max-w-[70%] rounded-lg px-4 py-2',
                message.role === 'pm'
                  ? 'border bg-background'
                  : 'bg-primary text-primary-foreground',
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-lg border bg-background px-4 py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-sm text-muted-foreground">
                PM is typing...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!canContinue && (
        <div className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your answer..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button onClick={handleSendMessage} disabled={!currentInput.trim()}>
            Send
          </Button>
          <Button onClick={handleSkip} variant="outline">
            Skip
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        {canContinue && (
          <Button onClick={() => onComplete(messages)} size="lg">
            Review Project Plan
          </Button>
        )}
      </div>
    </div>
  );
}
