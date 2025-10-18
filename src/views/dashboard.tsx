/**
 * Dashboard component
 */

import { Layout } from './layout';
import type { ContentAsset, User } from '../types';

interface DashboardProps {
  user: User;
  assets: ContentAsset[];
  stats: {
    totalAssets: number;
    totalViews: number;
    totalSubscribers: number;
  };
}

export function Dashboard({ user, assets, stats }: DashboardProps) {
  return (
    <Layout title="Dashboard" user={user}>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-2">Welcome back, {user.email}</p>
        </div>

        {/* Stats */}
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-sm font-medium text-gray-600">Total Assets</div>
            <div class="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalAssets}
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-sm font-medium text-gray-600">Total Views</div>
            <div class="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalViews}
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-sm font-medium text-gray-600">Total Subscribers</div>
            <div class="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalSubscribers}
            </div>
          </div>
        </div>

        {/* Content Assets */}
        <div class="bg-white rounded-lg shadow-md">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900">Your Content Assets</h2>
            <a
              href="/content/new"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Create New Asset
            </a>
          </div>

          {assets.length === 0 ? (
            <div class="px-6 py-12 text-center">
              <p class="text-gray-600 mb-4">
                You haven't created any content assets yet.
              </p>
              <a
                href="/content/new"
                class="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 inline-block"
              >
                Create Your First Asset
              </a>
            </div>
          ) : (
            <div class="divide-y divide-gray-200">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  class="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900">
                        {asset.title}
                      </h3>
                      {asset.description && (
                        <p class="text-gray-600 text-sm mt-1">
                          {asset.description}
                        </p>
                      )}
                      <div class="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Type: {asset.content_type}</span>
                        <span>Views: {asset.view_count}</span>
                        <span>Subscribers: {asset.subscriber_count}</span>
                      </div>
                    </div>
                    <div class="flex gap-2 ml-4">
                      <a
                        href={`/content/${asset.id}`}
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                      <a
                        href={`/v/${asset.id}`}
                        target="_blank"
                        class="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Public Link
                      </a>
                      <button
                        hx-delete={`/api/content/${asset.id}`}
                        hx-confirm="Are you sure you want to delete this asset?"
                        hx-target="closest div"
                        hx-swap="outerHTML"
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
