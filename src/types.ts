/**
 * Type definitions for Agent's Exclusive Access Platform
 */

import type { D1Database, R2Bucket, KVNamespace, Ai } from '@cloudflare/workers-types';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  DB: D1Database;
  CONTENT_BUCKET: R2Bucket;
  SESSIONS: KVNamespace;
  RATE_LIMITING: KVNamespace;
  AI: Ai;
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  AUTH_SECRET: string;
  SENDGRID_API_KEY?: string;
}

/**
 * Database table types
 */
export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'inactive' | 'trial' | 'canceled';
  subscription_tier: 'basic' | 'pro' | 'enterprise';
  created_at: number;
  updated_at: number;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
}

export interface MagicLink {
  id: string;
  email: string;
  token: string;
  expires_at: number;
  used: boolean;
  created_at: number;
}

export interface ContentAsset {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content_type: 'pdf' | 'video' | 'guide' | 'report';
  r2_key: string;
  file_size: number | null;
  status: 'active' | 'archived' | 'deleted';
  view_count: number;
  subscriber_count: number;
  ai_prompt: string | null;
  created_at: number;
  updated_at: number;
}

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source_asset_id: string | null;
  created_at: number;
}

export interface AssetAccess {
  id: string;
  subscriber_id: string;
  asset_id: string;
  accessed_at: number;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: string | null;
  created_at: number;
}

/**
 * API Request/Response types
 */
export interface CreateContentRequest {
  title: string;
  description?: string;
  prompt: string;
  content_type: 'pdf' | 'video' | 'guide' | 'report';
}

export interface CreateContentResponse {
  success: boolean;
  asset?: ContentAsset;
  error?: string;
}

export interface LoginRequest {
  email: string;
}

export interface SubscriberCaptureRequest {
  email: string;
  name?: string;
  phone?: string;
}

/**
 * Lucia Auth types
 */
export interface DatabaseUserAttributes {
  email: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_tier: string;
}

/**
 * Hono Context Variables
 */
export interface HonoVariables {
  user: User;
  session: Session;
}
