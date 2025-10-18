/**
 * Content asset detail page
 */

import { Layout } from './layout';
import type { ContentAsset, User, Subscriber } from '../types';

interface ContentDetailPageProps {
  user: User;
  asset: ContentAsset;
  subscribers: Subscriber[];
}

export function ContentDetailPage({
  user,
  asset,
  subscribers,
}: ContentDetailPageProps) {
  const publicUrl = `/v/${asset.id}`;
  const fullUrl = `https://agents-exclusive-access.workers.dev${publicUrl}`;

  return (
    <Layout title={asset.title} user={user}>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <a
            href="/dashboard"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          {/* Main Content Info */}
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {asset.title}
              </h1>
              {asset.description && (
                <p class="text-gray-600 mb-4">{asset.description}</p>
              )}

              <div class="flex gap-4 text-sm text-gray-600 mb-6">
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  {asset.content_type}
                </span>
                <span>Created: {new Date(asset.created_at).toLocaleDateString()}</span>
              </div>

              <div class="border-t pt-4">
                <h3 class="font-semibold text-gray-900 mb-2">Share This Content</h3>
                <div class="flex gap-2">
                  <input
                    type="text"
                    value={fullUrl}
                    readonly
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(fullUrl);
                        alert('Link copied!');
                      }
                    }}
                    class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Subscribers List */}
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">
                Subscribers ({subscribers.length})
              </h2>

              {subscribers.length === 0 ? (
                <p class="text-gray-600">
                  No subscribers yet. Share your content link to start collecting
                  leads!
                </p>
              ) : (
                <div class="space-y-3">
                  {subscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      class="border border-gray-200 rounded-md p-3"
                    >
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="font-medium text-gray-900">
                            {subscriber.name || 'Anonymous'}
                          </div>
                          <div class="text-sm text-gray-600">
                            {subscriber.email}
                          </div>
                          {subscriber.phone && (
                            <div class="text-sm text-gray-600">
                              {subscriber.phone}
                            </div>
                          )}
                        </div>
                        <div class="text-xs text-gray-500">
                          {new Date(subscriber.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div class="space-y-4">
                <div>
                  <div class="text-sm text-gray-600">Total Views</div>
                  <div class="text-2xl font-bold text-gray-900">
                    {asset.view_count}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">Subscribers</div>
                  <div class="text-2xl font-bold text-gray-900">
                    {asset.subscriber_count}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">Conversion Rate</div>
                  <div class="text-2xl font-bold text-gray-900">
                    {asset.view_count > 0
                      ? Math.round((asset.subscriber_count / asset.view_count) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 class="font-semibold text-blue-900 mb-2">Tips</h3>
              <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Share on social media</li>
                <li>Add to email signature</li>
                <li>Include in MLS listings</li>
                <li>Post in local Facebook groups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
