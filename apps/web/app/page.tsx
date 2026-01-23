import Link from 'next/link';
import { Button } from '@devteam/ui/components/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-12">
        <div className="flex items-center gap-2 font-bold text-xl">
          DevTeam AI
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900 dark:text-white mb-6">
          DevTeam AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10">
          Collaborative AI Code Editor for supercharged development teams.
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8">
              Start Building
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="h-12 px-8">
              Log in
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
