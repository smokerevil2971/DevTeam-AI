'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: number | 'auto';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = 400,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Language colors
  const languageColors: Record<string, string> = {
    typescript: 'bg-blue-500',
    javascript: 'bg-yellow-500',
    tsx: 'bg-blue-400',
    jsx: 'bg-yellow-400',
    python: 'bg-green-500',
    html: 'bg-orange-500',
    css: 'bg-purple-500',
    json: 'bg-gray-500',
    bash: 'bg-gray-600',
    shell: 'bg-gray-600',
    markdown: 'bg-gray-400',
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-[#1e1e1e]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-[#2d2d2d] px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Language badge */}
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium text-white',
              languageColors[language] || 'bg-gray-500',
            )}
          >
            {language}
          </span>

          {/* Filename */}
          {filename && (
            <span className="text-sm text-gray-400">{filename}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse button */}
          {collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 text-gray-400 transition-colors hover:text-white"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 transition-colors hover:text-white"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      {!collapsed && (
        <div
          className="overflow-auto"
          style={{ maxHeight: maxHeight === 'auto' ? undefined : maxHeight }}
        >
          <pre className="p-4 text-sm">
            <code>
              {lines.map((line, index) => {
                const lineNum = index + 1;
                const isHighlighted = highlightLines.includes(lineNum);

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex',
                      isHighlighted && '-mx-4 bg-yellow-500/10 px-4',
                    )}
                  >
                    {/* Line number */}
                    {showLineNumbers && (
                      <span
                        className={cn(
                          'w-10 select-none pr-4 text-right',
                          isHighlighted ? 'text-yellow-500' : 'text-gray-500',
                        )}
                      >
                        {lineNum}
                      </span>
                    )}

                    {/* Line content with syntax highlighting */}
                    <span className="flex-1 text-gray-300">
                      {highlightSyntax(line, language)}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      )}

      {/* Collapsed preview */}
      {collapsed && (
        <div className="p-4 text-sm text-gray-500">
          <span className="font-mono">{lines.length} lines</span>
          <span className="mx-2">•</span>
          <span>Click to expand</span>
        </div>
      )}
    </div>
  );
}

// Simple syntax highlighting
function highlightSyntax(line: string, language: string): React.ReactNode {
  if (!line) return ' ';

  // Keywords for different languages
  const keywords: Record<string, string[]> = {
    typescript: [
      'const',
      'let',
      'var',
      'function',
      'return',
      'if',
      'else',
      'for',
      'while',
      'class',
      'interface',
      'type',
      'export',
      'import',
      'from',
      'async',
      'await',
      'new',
      'this',
      'extends',
      'implements',
    ],
    javascript: [
      'const',
      'let',
      'var',
      'function',
      'return',
      'if',
      'else',
      'for',
      'while',
      'class',
      'export',
      'import',
      'from',
      'async',
      'await',
      'new',
      'this',
      'extends',
    ],
    python: [
      'def',
      'class',
      'if',
      'else',
      'elif',
      'for',
      'while',
      'return',
      'import',
      'from',
      'as',
      'with',
      'try',
      'except',
      'finally',
      'raise',
      'pass',
      'lambda',
      'yield',
      'async',
      'await',
    ],
  };

  const langKeywords = keywords[language] || keywords['typescript'] || [];

  // Simple regex-based highlighting
  let result = line;

  // Comments
  if (result.includes('//')) {
    const commentIndex = result.indexOf('//');
    const before = result.slice(0, commentIndex);
    const comment = result.slice(commentIndex);
    return (
      <>
        {highlightSyntax(before, language)}
        <span className="text-gray-500">{comment}</span>
      </>
    );
  }

  // Strings
  result = result.replace(
    /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
    '<span class="text-green-400">$&</span>',
  );

  // Keywords
  langKeywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    result = result.replace(regex, '<span class="text-purple-400">$&</span>');
  });

  // Numbers
  result = result.replace(
    /\b(\d+)\b/g,
    '<span class="text-orange-400">$1</span>',
  );

  // Functions
  result = result.replace(
    /([a-zA-Z_]\w*)\(/g,
    '<span class="text-yellow-300">$1</span>(',
  );

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

// Inline code component
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 font-mono text-sm',
        className,
      )}
    >
      {children}
    </code>
  );
}
