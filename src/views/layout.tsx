/**
 * Base layout component with Tailwind CSS
 */

import type { JSX } from 'preact';

interface LayoutProps {
  title: string;
  children: JSX.Element | JSX.Element[];
  user?: { email: string } | null;
}

export function Layout({ title, children, user }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - Agent's Exclusive Access</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <nav class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
              <div class="flex items-center">
                <a href="/" class="text-xl font-bold text-blue-600">
                  Agent's Exclusive Access
                </a>
              </div>
              <div class="flex items-center space-x-4">
                {user ? (
                  <>
                    <span class="text-sm text-gray-700">{user.email}</span>
                    <a
                      href="/dashboard"
                      class="text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                      Dashboard
                    </a>
                    <form method="POST" action="/auth/logout" class="inline">
                      <button
                        type="submit"
                        class="text-sm font-medium text-gray-700 hover:text-blue-600"
                      >
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <a
                    href="/login"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Login
                  </a>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer class="bg-white border-t border-gray-200 mt-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p class="text-center text-sm text-gray-500">
              &copy; 2025 Agent's Exclusive Access. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
