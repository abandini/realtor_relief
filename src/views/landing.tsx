/**
 * Landing page component
 */

import { Layout } from './layout';

export function LandingPage() {
  return (
    <Layout title="Home">
      <div class="bg-gradient-to-b from-blue-50 to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div class="text-center">
            <h1 class="text-5xl font-extrabold text-gray-900 sm:text-6xl">
              Transform Your Market Expertise Into{' '}
              <span class="text-blue-600">Exclusive Leads</span>
            </h1>
            <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered platform for top-producing real estate agents to create,
              protect, and monetize hyper-local market content. Stop paying Zillow
              and Facebook. Start owning your leads.
            </p>
            <div class="mt-10 flex justify-center gap-4">
              <a
                href="/login"
                class="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 shadow-lg"
              >
                Get Started Free
              </a>
              <a
                href="#features"
                class="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50 border-2 border-blue-600"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="features" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Dominate Your Market
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-blue-600 text-4xl mb-4">🤖</div>
            <h3 class="text-xl font-bold mb-2">AI-Powered Content</h3>
            <p class="text-gray-600">
              Generate hyper-local market reports, neighborhood guides, and
              investment analyses in minutes using advanced AI.
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-blue-600 text-4xl mb-4">🔒</div>
            <h3 class="text-xl font-bold mb-2">Lead Capture Gates</h3>
            <p class="text-gray-600">
              Protect your valuable content behind smart lead-capture forms. Build
              your email list automatically.
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-blue-600 text-4xl mb-4">📊</div>
            <h3 class="text-xl font-bold mb-2">Analytics Dashboard</h3>
            <p class="text-gray-600">
              Track views, conversions, and subscriber growth. Know exactly what's
              working in your market.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-blue-600 text-white py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold mb-4">
            Ready to Stop Paying for Leads?
          </h2>
          <p class="text-xl mb-8">
            Join top-producing agents who are building their own lead generation
            assets.
          </p>
          <a
            href="/login"
            class="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 shadow-lg inline-block"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </Layout>
  );
}
