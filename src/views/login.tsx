/**
 * Login page component
 */

import { Layout } from './layout';

interface LoginPageProps {
  message?: string;
  error?: string;
}

export function LoginPage({ message, error }: LoginPageProps) {
  return (
    <Layout title="Login">
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              We'll send you a magic link to log in
            </p>
          </div>

          {message && (
            <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form class="mt-8 space-y-6" method="POST" action="/auth/login">
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="email" class="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Magic Link
              </button>
            </div>

            <div class="text-center text-sm text-gray-600">
              <p>
                Don't have an account? No problem! We'll create one for you when
                you log in.
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
