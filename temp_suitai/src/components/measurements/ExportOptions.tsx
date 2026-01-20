/**
 * Export Options Component
 *
 * Demonstrates how to use the measurement export functionality
 * Provides UI for exporting measurements in multiple formats
 */

'use client';

import React, { useState } from 'react';
import {
  downloadExport,
  generateExportFilename,
  STANDARD_MEASUREMENTS,
} from '@/lib/export';
import type { MeasurementData, ExportFormat } from '@/lib/export/types';

interface ExportOptionsProps {
  measurementData: MeasurementData;
  sessionId: string;
}

export function ExportOptions({ measurementData, sessionId }: ExportOptionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);

  const handleDownload = async (format: ExportFormat) => {
    try {
      setIsLoading(true);
      setError(null);

      // Client-side download
      downloadExport(measurementData, format);
      setDownloadCount(prev => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerExport = async (format: ExportFormat) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/sessions/${sessionId}/export?format=${format}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const filename = generateExportFilename(format, measurementData.universalMeasurementId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadCount(prev => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDescriptions = {
    optitex: 'Tab-separated values for Optitex fashion CAD software',
    csv: 'Comma-separated values for spreadsheet applications',
    json: 'JSON format for API integration',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Export Measurements</h3>
        <p className="text-sm text-gray-600 mb-4">
          Download your measurements in multiple formats
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['optitex', 'csv', 'json'] as const).map((format) => (
          <button
            key={format}
            onClick={() => handleDownload(format)}
            disabled={isLoading}
            className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
          >
            <div className="font-semibold capitalize mb-1">{format}</div>
            <div className="text-sm text-gray-600 mb-3">{formatDescriptions[format]}</div>
            <button
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Downloading...' : `Download ${format.toUpperCase()}`}
            </button>
          </button>
        ))}
      </div>

      {downloadCount > 0 && (
        <div className="p-3 bg-green-100 border border-green-400 rounded text-green-800 text-sm">
          ✓ Successfully downloaded {downloadCount} file{downloadCount !== 1 ? 's' : ''}
        </div>
      )}

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Measurement Summary</h4>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-700 mb-2">
            Total Measurements: <strong>{Object.keys(measurementData.measurements).length}</strong>
          </p>
          {measurementData.confidence && (
            <p className="text-sm text-gray-700 mb-2">
              Confidence: <strong>{(measurementData.confidence * 100).toFixed(1)}%</strong>
            </p>
          )}
          {measurementData.universalMeasurementId && (
            <p className="text-sm text-gray-700 text-mono font-mono break-all">
              ID: {measurementData.universalMeasurementId}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Available Measurements</h4>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(STANDARD_MEASUREMENTS).map(([key, measurement]) => (
              <div key={key} className="text-xs">
                <span className="font-semibold text-gray-900">{measurement.label}</span>
                <span className="text-gray-600"> ({measurement.unit})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Alternative: Dropdown Export Menu
 */
export function ExportDropdown({ measurementData, sessionId }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsLoading(true);
      await fetch(`/api/sessions/${sessionId}/export?format=${format}`, {
        method: 'POST',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
          {(['optitex', 'csv', 'json'] as const).map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 capitalize"
            >
              Export as {format}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Display exported preview
 */
export function ExportPreview({ measurementData }: { measurementData: MeasurementData }) {
  const [format, setFormat] = useState<ExportFormat>('optitex');
  const { exportMeasurements } = require('@/lib/export');

  const preview = exportMeasurements(measurementData, format).slice(0, 500);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold mb-2">Format Preview</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
          className="px-3 py-2 border rounded"
        >
          <option value="optitex">Optitex (TSV)</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>

      <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-auto max-h-64 whitespace-pre-wrap">
        {preview}
        {preview.length === 500 && '\n...'}
      </div>
    </div>
  );
}
