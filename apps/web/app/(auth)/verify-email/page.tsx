'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@devteam/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@devteam/ui/components/card';
import { Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-white">D</span>
            </div>
            <span className="text-2xl font-bold">DevTeam AI</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Check your email
            </CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to{' '}
              {email ? (
                <span className="font-medium text-foreground">{email}</span>
              ) : (
                'your email address'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                Click the link in the email to verify your account and get
                started.
              </p>
              <p>If you don&apos;t see the email, check your spam folder.</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button variant="outline" className="w-full" asChild>
              <a
                href="https://gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Gmail
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email?{' '}
          <button className="text-primary hover:underline">
            Resend verification email
          </button>
        </p>
      </div>
    </div>
  );
}
