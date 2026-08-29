import type { ReactNode } from "react";

import { AuthCarousel } from "./AuthCarousel";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: Readonly<AuthShellProps>) {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[49fr_51fr]">
      <div className="flex min-h-[svh] flex-col bg-auth-hero p-4 text-auth-hero-foreground lg:sticky lg:top-0 lg:h-dvh lg:min-h-0 lg:p-7">
        <div className="min-h-6 flex-1 lg:mt-8">
          <AuthCarousel />
        </div>
      </div>

      <div className="flex flex-col px-6 py-10 lg:h-dvh lg:overflow-y-auto lg:px-16 lg:py-12">
        <div className="mx-auto flex w-full max-w-145 flex-1 flex-col justify-center lg:justify-center">
          <h1 className="text-3xl font-semibold tracking-tight lg:text-[2.75rem]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-base text-muted-foreground lg:text-lg">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>
        </div>

        <footer className="mt-auto flex flex-col items-center gap-2 pt-10 text-center text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p>&copy; {new Date().getFullYear()} Zelkora. All rights reserved.</p>

          <p className="flex items-center gap-2">
            <a href="#" className="text-auth-link">
              {/* TODO: Create a seperate T&C page */}
              Term &amp; Condition
            </a>
            <span aria-hidden="true">&#9474;</span>
            <a href="#" className="text-auth-link">
              {/* TODO: Create a seperate privacy policy page */}
              Privacy &amp; Policy
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
