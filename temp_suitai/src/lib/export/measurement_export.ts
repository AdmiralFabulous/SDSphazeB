/**
 * Measurement Export Service
 *
 * Provides functionality to export measurement data in multiple formats:
 * - Optitex: Tab-separated values for fashion CAD software
 * - CSV: Comma-separated values for spreadsheet applications
 * - JSON: Structured format for API integration
 */

import { MeasurementData, OptitexExportOptions, ExportFormat } from './types';

/**
 * Standard measurement categories for organizing exports
 */
export const MEASUREMENT_CATEGORIES = {
  HEAD_NECK: 'Head & Neck',
  TORSO_CHEST: 'Torso & Chest',
  ARMS_HANDS: 'Arms & Hands',
  LEGS_FEET: 'Legs & Feet',
} as const;

/**
 * Standard measurements in the system with their display names and units
 */
export const STANDARD_MEASUREMENTS = {
  // Head & Neck
  head_circumference: { label: 'Head Circumference', unit: 'cm', category: 'HEAD_NECK' },
  neck_circumference: { label: 'Neck Circumference', unit: 'cm', category: 'HEAD_NECK' },
  head_length: { label: 'Head Length', unit: 'cm', category: 'HEAD_NECK' },
  head_width: { label: 'Head Width', unit: 'cm', category: 'HEAD_NECK' },

  // Torso & Chest
  shoulder_circumference: { label: 'Shoulder Circumference', unit: 'cm', category: 'TORSO_CHEST' },
  chest_circumference: { label: 'Chest Circumference', unit: 'cm', category: 'TORSO_CHEST' },
  waist_circumference: { label: 'Waist Circumference', unit: 'cm', category: 'TORSO_CHEST' },
  hip_circumference: { label: 'Hip Circumference', unit: 'cm', category: 'TORSO_CHEST' },
  shoulder_width: { label: 'Shoulder Width', unit: 'cm', category: 'TORSO_CHEST' },
  torso_length: { label: 'Torso Length', unit: 'cm', category: 'TORSO_CHEST' },

  // Arms & Hands
  left_arm_circumference: { label: 'Left Arm Circumference', unit: 'cm', category: 'ARMS_HANDS' },
  right_arm_circumference: { label: 'Right Arm Circumference', unit: 'cm', category: 'ARMS_HANDS' },
  left_wrist_circumference: { label: 'Left Wrist Circumference', unit: 'cm', category: 'ARMS_HANDS' },
  right_wrist_circumference: { label: 'Right Wrist Circumference', unit: 'cm', category: 'ARMS_HANDS' },
  arm_length: { label: 'Arm Length', unit: 'cm', category: 'ARMS_HANDS' },

  // Legs & Feet
  left_thigh_circumference: { label: 'Left Thigh Circumference', unit: 'cm', category: 'LEGS_FEET' },
  right_thigh_circumference: { label: 'Right Thigh Circumference', unit: 'cm', category: 'LEGS_FEET' },
  left_calf_circumference: { label: 'Left Calf Circumference', unit: 'cm', category: 'LEGS_FEET' },
  right_calf_circumference: { label: 'Right Calf Circumference', unit: 'cm', category: 'LEGS_FEET' },
  left_ankle_circumference: { label: 'Left Ankle Circumference', unit: 'cm', category: 'LEGS_FEET' },
  right_ankle_circumference: { label: 'Right Ankle Circumference', unit: 'cm', category: 'LEGS_FEET' },
  leg_length: { label: 'Leg Length', unit: 'cm', category: 'LEGS_FEET' },
} as const;

/**
 * Generate Optitex format (TSV - Tab-Separated Values)
 *
 * Format:
 * OPTITEX MEASUREMENT EXPORT
 * Generated: ISO-8601 timestamp
 *
 * MEASUREMENT	VALUE	UNIT
 * --------------------------------------------------
 * # Category
 * Measurement Name	Value	Unit
 */
export function generateOptitex(data: MeasurementData, options?: OptitexExportOptions): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  // Header
  lines.push('OPTITEX MEASUREMENT EXPORT');
  lines.push(`Generated: ${timestamp}`);

  if (data.sessionId) {
    lines.push(`Session ID: ${data.sessionId}`);
  }
  if (data.universalMeasurementId) {
    lines.push(`Universal Measurement ID: ${data.universalMeasurementId}`);
  }

  lines.push('');
  lines.push('MEASUREMENT\tVALUE\tUNIT');
  lines.push('--------------------------------------------------');

  // Group measurements by category
  const measurementsByCategory = groupMeasurementsByCategory(data.measurements);

  for (const [categoryKey, categoryName] of Object.entries(MEASUREMENT_CATEGORIES)) {
    const measurements = measurementsByCategory[categoryKey] || [];

    if (measurements.length > 0) {
      lines.push('');
      lines.push(`# ${categoryName}`);

      for (const [key, value] of measurements) {
        const measurement = STANDARD_MEASUREMENTS[key as keyof typeof STANDARD_MEASUREMENTS];
        if (measurement) {
          lines.push(`${measurement.label}\t${value.toFixed(2)}\t${measurement.unit}`);
        }
      }
    }
  }

  lines.push('');
  lines.push('--------------------------------------------------');
  lines.push(`Total Measurements: ${Object.keys(data.measurements).length}`);

  return lines.join('\n');
}

/**
 * Generate CSV format
 */
export function generateCSV(data: MeasurementData): string {
  const lines: string[] = [];

  // Header with metadata
  lines.push(`Session ID,${data.sessionId || ''}`);
  lines.push(`Universal Measurement ID,${data.universalMeasurementId || ''}`);
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push('');

  // Column headers
  lines.push('Measurement Name,Category,Value,Unit');

  // Data rows
  const measurementsByCategory = groupMeasurementsByCategory(data.measurements);

  for (const [categoryKey, categoryName] of Object.entries(MEASUREMENT_CATEGORIES)) {
    const measurements = measurementsByCategory[categoryKey] || [];

    for (const [key, value] of measurements) {
      const measurement = STANDARD_MEASUREMENTS[key as keyof typeof STANDARD_MEASUREMENTS];
      if (measurement) {
        const escapedLabel = escapeCSV(measurement.label);
        lines.push(`"${escapedLabel}",${categoryName},${value.toFixed(2)},${measurement.unit}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate JSON format
 */
export function generateJSON(data: MeasurementData): string {
  const exportData = {
    metadata: {
      sessionId: data.sessionId,
      universalMeasurementId: data.universalMeasurementId,
      generated: new Date().toISOString(),
      confidence: data.confidence,
    },
    measurements: groupMeasurementsByCategory(data.measurements),
    totals: {
      count: Object.keys(data.measurements).length,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export measurements in the specified format
 */
export function exportMeasurements(
  data: MeasurementData,
  format: ExportFormat = 'optitex',
  options?: OptitexExportOptions
): string {
  switch (format) {
    case 'optitex':
      return generateOptitex(data, options);
    case 'csv':
      return generateCSV(data);
    case 'json':
      return generateJSON(data);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  format: ExportFormat,
  universalMeasurementId?: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const id = universalMeasurementId?.replace('UMI_', '') || 'unknown';

  const extensions = {
    optitex: 'txt',
    csv: 'csv',
    json: 'json',
  };

  return `measurements_${format}_${id}_${timestamp}.${extensions[format]}`;
}

/**
 * Download export file
 */
export function downloadExport(
  data: MeasurementData,
  format: ExportFormat = 'optitex',
  options?: OptitexExportOptions
): void {
  const content = exportMeasurements(data, format, options);
  const filename = generateExportFilename(format, data.universalMeasurementId);

  // Determine MIME type
  const mimeTypes = {
    optitex: 'text/plain; charset=utf-8',
    csv: 'text/csv; charset=utf-8',
    json: 'application/json; charset=utf-8',
  };

  const blob = new Blob([content], { type: mimeTypes[format] });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper: Group measurements by category
 */
function groupMeasurementsByCategory(
  measurements: Record<string, number>
): Record<string, Array<[string, number]>> {
  const grouped: Record<string, Array<[string, number]>> = {
    HEAD_NECK: [],
    TORSO_CHEST: [],
    ARMS_HANDS: [],
    LEGS_FEET: [],
  };

  for (const [key, value] of Object.entries(measurements)) {
    const measurement = STANDARD_MEASUREMENTS[key as keyof typeof STANDARD_MEASUREMENTS];
    if (measurement) {
      const categoryKey = measurement.category as keyof typeof grouped;
      grouped[categoryKey].push([key, value]);
    }
  }

  return grouped;
}

/**
 * Helper: Escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
