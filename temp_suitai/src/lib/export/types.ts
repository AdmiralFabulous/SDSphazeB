/**
 * Types for measurement export functionality
 */

export type ExportFormat = 'optitex' | 'csv' | 'json';

/**
 * Measurement data structure for exports
 */
export interface MeasurementData {
  sessionId?: string;
  universalMeasurementId?: string;
  measurements: Record<string, number>;
  confidence?: number;
  timestamp?: string;
}

/**
 * Options for Optitex export
 */
export interface OptitexExportOptions {
  includeMetadata?: boolean;
  includeCategory?: boolean;
  precision?: number; // decimal places, default 2
}

/**
 * Export result with format-specific data
 */
export interface ExportResult {
  format: ExportFormat;
  content: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Measurement metadata
 */
export interface MeasurementMetadata {
  label: string;
  unit: string;
  category: string;
  description?: string;
}
