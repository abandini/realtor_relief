/**
 * Authentication tests
 */

import { describe, it, expect } from 'vitest';
import { generateToken } from '../src/lib/auth';

describe('Authentication', () => {
  describe('generateToken', () => {
    it('should generate a valid token', async () => {
      const token = await generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', async () => {
      const token1 = await generateToken();
      const token2 = await generateToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with correct length', async () => {
      const token = await generateToken();
      // Each byte becomes 2 hex chars, so 32 bytes = 64 chars
      expect(token.length).toBe(64);
    });
  });
});
