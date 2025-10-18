/**
 * PDF generation tests
 */

import { describe, it, expect } from 'vitest';
import { generatePDF, formatContentForPDF } from '../src/utils/pdf';

describe('PDF Generation', () => {
  describe('formatContentForPDF', () => {
    it('should format content with metadata', () => {
      const content = 'This is test content';
      const metadata = {
        title: 'Test Report',
        generatedBy: 'test@example.com',
        date: '2025-10-17',
      };

      const formatted = formatContentForPDF(content, metadata);

      expect(formatted).toContain(metadata.title);
      expect(formatted).toContain(metadata.generatedBy);
      expect(formatted).toContain(metadata.date);
      expect(formatted).toContain(content);
      expect(formatted).toContain('Agent\'s Exclusive Access');
    });
  });

  describe('generatePDF', () => {
    it('should generate a PDF buffer', async () => {
      const content = 'Test content';
      const title = 'Test Title';

      const pdfBuffer = await generatePDF(content, title);

      expect(pdfBuffer).toBeInstanceOf(Uint8Array);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should include PDF header', async () => {
      const pdfBuffer = await generatePDF('test', 'title');
      const text = new TextDecoder().decode(pdfBuffer);

      expect(text).toContain('%PDF');
      expect(text).toContain('%%EOF');
    });
  });
});
