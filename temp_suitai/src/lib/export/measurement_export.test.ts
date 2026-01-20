/**
 * Tests for Measurement Export Service
 */

import {
  generateOptitex,
  generateCSV,
  generateJSON,
  exportMeasurements,
  generateExportFilename,
  STANDARD_MEASUREMENTS,
} from './measurement_export';
import type { MeasurementData } from './types';

describe('Measurement Export Service', () => {
  const mockMeasurementData: MeasurementData = {
    sessionId: 'test-session-123',
    universalMeasurementId: 'UMI_2026_01_20_abc123_xyz789',
    measurements: {
      head_circumference: 57.5,
      neck_circumference: 38.2,
      head_length: 23.1,
      head_width: 15.8,
      shoulder_circumference: 112.5,
      chest_circumference: 98.6,
      waist_circumference: 82.3,
      hip_circumference: 95.4,
      shoulder_width: 41.2,
      torso_length: 58.9,
      left_arm_circumference: 28.5,
      right_arm_circumference: 28.7,
      left_wrist_circumference: 18.1,
      right_wrist_circumference: 18.3,
      arm_length: 72.4,
      left_thigh_circumference: 54.2,
      right_thigh_circumference: 54.5,
      left_calf_circumference: 38.6,
      right_calf_circumference: 38.8,
      left_ankle_circumference: 23.4,
      right_ankle_circumference: 23.6,
      leg_length: 98.2,
    },
    confidence: 0.95,
  };

  describe('Optitex Format Generation', () => {
    it('should generate valid Optitex format', () => {
      const result = generateOptitex(mockMeasurementData);

      expect(result).toContain('OPTITEX MEASUREMENT EXPORT');
      expect(result).toContain('Generated:');
      expect(result).toContain('Session ID:');
      expect(result).toContain('Universal Measurement ID:');
      expect(result).toContain('MEASUREMENT\tVALUE\tUNIT');
    });

    it('should include all measurement categories', () => {
      const result = generateOptitex(mockMeasurementData);

      expect(result).toContain('# Head & Neck');
      expect(result).toContain('# Torso & Chest');
      expect(result).toContain('# Arms & Hands');
      expect(result).toContain('# Legs & Feet');
    });

    it('should format values with 2 decimal places', () => {
      const result = generateOptitex(mockMeasurementData);

      expect(result).toContain('57.50\tcm');
      expect(result).toContain('38.20\tcm');
      expect(result).toContain('112.50\tcm');
    });

    it('should include measurement total count', () => {
      const result = generateOptitex(mockMeasurementData);

      expect(result).toContain(`Total Measurements: ${Object.keys(mockMeasurementData.measurements).length}`);
    });

    it('should use tab separators', () => {
      const result = generateOptitex(mockMeasurementData);
      const lines = result.split('\n');
      const dataLines = lines.filter(line => line.includes('\t'));

      expect(dataLines.length).toBeGreaterThan(0);
      dataLines.forEach(line => {
        const parts = line.split('\t');
        // Should have at least 2 parts (measurement and value, or measurement value unit)
        expect(parts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should handle missing optional fields', () => {
      const minimalData: MeasurementData = {
        measurements: {
          head_circumference: 57.5,
        },
      };

      const result = generateOptitex(minimalData);

      expect(result).toContain('OPTITEX MEASUREMENT EXPORT');
      expect(result).toContain('Head Circumference');
      expect(result).not.toContain('Session ID');
    });
  });

  describe('CSV Format Generation', () => {
    it('should generate valid CSV format', () => {
      const result = generateCSV(mockMeasurementData);

      expect(result).toContain('Session ID,');
      expect(result).toContain('Universal Measurement ID,');
      expect(result).toContain('Generated,');
    });

    it('should include CSV headers', () => {
      const result = generateCSV(mockMeasurementData);

      expect(result).toContain('Measurement Name,Category,Value,Unit');
    });

    it('should have correct CSV structure', () => {
      const result = generateCSV(mockMeasurementData);
      const lines = result.split('\n');

      // First 3 lines are metadata
      expect(lines[0]).toContain('Session ID');
      expect(lines[1]).toContain('Universal Measurement ID');
      expect(lines[2]).toContain('Generated');

      // Then empty line, then headers
      expect(lines[4]).toContain('Measurement Name,Category,Value,Unit');

      // Data lines should have 4 fields
      const dataLines = lines.slice(5).filter(line => line.trim());
      dataLines.forEach(line => {
        const fields = parseCSVLine(line);
        expect(fields.length).toBe(4);
      });
    });

    it('should escape CSV special characters', () => {
      const dataWithSpecialChars: MeasurementData = {
        ...mockMeasurementData,
        sessionId: 'test,session,with,commas',
      };

      const result = generateCSV(dataWithSpecialChars);

      expect(result).toContain('"test,session,with,commas"');
    });

    it('should format values with 2 decimal places', () => {
      const result = generateCSV(mockMeasurementData);

      expect(result).toContain(',57.50,');
      expect(result).toContain(',38.20,');
    });
  });

  describe('JSON Format Generation', () => {
    it('should generate valid JSON', () => {
      const result = generateJSON(mockMeasurementData);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('measurements');
      expect(parsed).toHaveProperty('totals');
    });

    it('should include metadata', () => {
      const result = generateJSON(mockMeasurementData);
      const parsed = JSON.parse(result);

      expect(parsed.metadata).toEqual({
        sessionId: mockMeasurementData.sessionId,
        universalMeasurementId: mockMeasurementData.universalMeasurementId,
        generated: expect.any(String),
        confidence: mockMeasurementData.confidence,
      });
    });

    it('should group measurements by category', () => {
      const result = generateJSON(mockMeasurementData);
      const parsed = JSON.parse(result);

      expect(parsed.measurements).toHaveProperty('HEAD_NECK');
      expect(parsed.measurements).toHaveProperty('TORSO_CHEST');
      expect(parsed.measurements).toHaveProperty('ARMS_HANDS');
      expect(parsed.measurements).toHaveProperty('LEGS_FEET');
    });

    it('should include measurement count in totals', () => {
      const result = generateJSON(mockMeasurementData);
      const parsed = JSON.parse(result);

      expect(parsed.totals.count).toBe(Object.keys(mockMeasurementData.measurements).length);
    });

    it('should have proper indentation', () => {
      const result = generateJSON(mockMeasurementData);

      // Check for 2-space indentation
      expect(result).toMatch(/^  "/m);
    });
  });

  describe('Export Function Router', () => {
    it('should export to Optitex by default', () => {
      const result = exportMeasurements(mockMeasurementData);

      expect(result).toContain('OPTITEX MEASUREMENT EXPORT');
    });

    it('should export to specified format', () => {
      const optitexResult = exportMeasurements(mockMeasurementData, 'optitex');
      const csvResult = exportMeasurements(mockMeasurementData, 'csv');
      const jsonResult = exportMeasurements(mockMeasurementData, 'json');

      expect(optitexResult).toContain('OPTITEX');
      expect(csvResult).toContain('Measurement Name');
      expect(() => JSON.parse(jsonResult)).not.toThrow();
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        exportMeasurements(mockMeasurementData, 'invalid' as any);
      }).toThrow('Unsupported export format');
    });
  });

  describe('Filename Generation', () => {
    it('should generate valid Optitex filename', () => {
      const filename = generateExportFilename('optitex', mockMeasurementData.universalMeasurementId);

      expect(filename).toMatch(/^measurements_optitex_/);
      expect(filename).toEndWith('.txt');
      expect(filename).toContain('UMI_2026');
    });

    it('should generate valid CSV filename', () => {
      const filename = generateExportFilename('csv', mockMeasurementData.universalMeasurementId);

      expect(filename).toMatch(/^measurements_csv_/);
      expect(filename).toEndWith('.csv');
    });

    it('should generate valid JSON filename', () => {
      const filename = generateExportFilename('json', mockMeasurementData.universalMeasurementId);

      expect(filename).toMatch(/^measurements_json_/);
      expect(filename).toEndWith('.json');
    });

    it('should use unknown ID when not provided', () => {
      const filename = generateExportFilename('optitex');

      expect(filename).toContain('unknown');
    });

    it('should include timestamp', () => {
      const filename = generateExportFilename('optitex', mockMeasurementData.universalMeasurementId);

      // Should contain ISO date pattern (YYYY-MM-DD)
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('Standard Measurements Metadata', () => {
    it('should have all required measurement properties', () => {
      Object.entries(STANDARD_MEASUREMENTS).forEach(([key, measurement]) => {
        expect(measurement).toHaveProperty('label');
        expect(measurement).toHaveProperty('unit');
        expect(measurement).toHaveProperty('category');
        expect(typeof measurement.label).toBe('string');
        expect(typeof measurement.unit).toBe('string');
        expect(typeof measurement.category).toBe('string');
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['HEAD_NECK', 'TORSO_CHEST', 'ARMS_HANDS', 'LEGS_FEET'];

      Object.values(STANDARD_MEASUREMENTS).forEach(measurement => {
        expect(validCategories).toContain(measurement.category);
      });
    });

    it('should use consistent units', () => {
      Object.values(STANDARD_MEASUREMENTS).forEach(measurement => {
        // All measurements should be in cm for this dataset
        expect(['cm']).toContain(measurement.unit);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty measurements', () => {
      const emptyData: MeasurementData = {
        sessionId: 'test',
        measurements: {},
      };

      const optitex = generateOptitex(emptyData);
      const csv = generateCSV(emptyData);
      const json = generateJSON(emptyData);

      expect(optitex).toContain('OPTITEX');
      expect(csv).toContain('Measurement Name');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should handle measurements with 0 value', () => {
      const zeroData: MeasurementData = {
        measurements: {
          head_circumference: 0,
        },
      };

      const result = generateOptitex(zeroData);

      expect(result).toContain('0.00\tcm');
    });

    it('should handle very large measurement values', () => {
      const largeData: MeasurementData = {
        measurements: {
          head_circumference: 9999.99,
        },
      };

      const result = generateOptitex(largeData);

      expect(result).toContain('9999.99\tcm');
    });

    it('should handle very small measurement values', () => {
      const smallData: MeasurementData = {
        measurements: {
          head_circumference: 0.01,
        },
      };

      const result = generateOptitex(smallData);

      expect(result).toContain('0.01\tcm');
    });
  });
});

/**
 * Helper function to parse CSV lines
 */
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}
