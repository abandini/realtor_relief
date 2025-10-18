/**
 * Create new content asset page
 */

import { Layout } from './layout';
import type { User } from '../types';

interface ContentNewPageProps {
  user: User;
  error?: string;
}

export function ContentNewPage({ user, error }: ContentNewPageProps) {
  return (
    <Layout title="Create New Content" user={user}>
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create New Content Asset</h1>
          <p class="text-gray-600 mt-2">
            Use AI to generate professional market reports and guides
          </p>
        </div>

        {error && (
          <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form
          method="POST"
          action="/api/content"
          class="bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g., Cleveland Market Report Q4 2025"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="A brief description of this content..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="content_type"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Content Type
            </label>
            <select
              id="content_type"
              name="content_type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="report">Market Report</option>
              <option value="guide">Neighborhood Guide</option>
              <option value="pdf">General PDF</option>
            </select>
          </div>

          <div>
            <label
              for="prompt"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              AI Generation Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={6}
              required
              placeholder="Example: Create a comprehensive market report for Cleveland, Ohio covering recent sales trends, average prices, days on market, and market predictions for the next quarter. Include statistics and insights for buyers and sellers."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-sm text-gray-500 mt-2">
              Tip: Be specific about location, data points, and target audience for
              best results
            </p>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              class="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate Content
            </button>
            <a
              href="/dashboard"
              class="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </a>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 class="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>AI generates professional content based on your prompt</li>
              <li>Content is automatically formatted and converted to PDF</li>
              <li>You get a shareable link with built-in lead capture</li>
              <li>Collect emails automatically when people access your content</li>
            </ol>
          </div>
        </form>
      </div>
    </Layout>
  );
}
