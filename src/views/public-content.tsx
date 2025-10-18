/**
 * Public content access page with lead capture
 */

import { Layout } from './layout';
import type { ContentAsset, User } from '../types';

interface PublicContentPageProps {
  asset: ContentAsset;
  owner: User;
  hasAccess: boolean;
  error?: string;
}

export function PublicContentPage({
  asset,
  owner,
  hasAccess,
  error,
}: PublicContentPageProps) {
  return (
    <Layout title={asset.title}>
      <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
          {!hasAccess ? (
            <div class="bg-white rounded-lg shadow-md p-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                {asset.title}
              </h1>
              {asset.description && (
                <p class="text-gray-600 mb-6">{asset.description}</p>
              )}

              <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p class="text-sm text-blue-800">
                  This exclusive content is provided by {owner.email}. Enter your
                  email below to access it for free.
                </p>
              </div>

              {error && (
                <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form method="POST" class="space-y-4">
                <div>
                  <label
                    for="email"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    for="phone"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <button
                  type="submit"
                  class="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Access Content
                </button>

                <p class="text-xs text-gray-500 text-center">
                  By accessing this content, you agree to receive occasional updates
                  from {owner.email}.
                </p>
              </form>
            </div>
          ) : (
            <div class="bg-white rounded-lg shadow-md p-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                {asset.title}
              </h1>

              <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
                ✓ Access granted! Your download will begin shortly.
              </div>

              <div class="text-center">
                <a
                  href={`/api/content/${asset.id}/download`}
                  class="inline-block bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700"
                  download
                >
                  Download {asset.content_type.toUpperCase()}
                </a>
              </div>

              <div class="mt-6 text-sm text-gray-600 text-center">
                <p>Provided by {owner.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
