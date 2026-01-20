import React, { useState } from 'react';
import './MeasurementsDisplay.css';

/**
 * Measurement data structure with value and unit
 */
interface Measurement {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  description: string;
}

/**
 * Grouped measurements by category
 */
interface MeasurementGroup {
  category: string;
  label: string;
  measurements: Measurement[];
}

/**
 * 28 Standard anthropometric measurements grouped by body region
 * Based on ISO 20685-1 and SMPL landmark definitions
 */
const MEASUREMENTS_DATA: MeasurementGroup[] = [
  {
    category: 'head',
    label: 'Head & Neck',
    measurements: [
      { id: 'head_circumference', name: 'Head Circumference', category: 'head', value: 0, unit: 'cm', description: 'Around the fullest part of the head' },
      { id: 'neck_circumference', name: 'Neck Circumference', category: 'head', value: 0, unit: 'cm', description: 'Around the base of the neck' },
      { id: 'head_length', name: 'Head Length', category: 'head', value: 0, unit: 'cm', description: 'From chin to top of head' },
      { id: 'head_width', name: 'Head Width', category: 'head', value: 0, unit: 'cm', description: 'Maximum width across temples' },
    ]
  },
  {
    category: 'torso',
    label: 'Torso & Chest',
    measurements: [
      { id: 'shoulder_circumference', name: 'Shoulder Circumference', category: 'torso', value: 0, unit: 'cm', description: 'Around shoulders and chest' },
      { id: 'chest_circumference', name: 'Chest Circumference', category: 'torso', value: 0, unit: 'cm', description: 'Around the fullest part of the chest' },
      { id: 'waist_circumference', name: 'Waist Circumference', category: 'torso', value: 0, unit: 'cm', description: 'Around the narrowest part of the waist' },
      { id: 'hip_circumference', name: 'Hip Circumference', category: 'torso', value: 0, unit: 'cm', description: 'Around the fullest part of the hip/buttocks' },
      { id: 'shoulder_width', name: 'Shoulder Width', category: 'torso', value: 0, unit: 'cm', description: 'Distance between shoulder points' },
      { id: 'torso_length', name: 'Torso Length', category: 'torso', value: 0, unit: 'cm', description: 'From shoulder to hip' },
    ]
  },
  {
    category: 'arms',
    label: 'Arms & Hands',
    measurements: [
      { id: 'left_arm_circumference', name: 'Left Arm Circumference', category: 'arms', value: 0, unit: 'cm', description: 'Around the left arm at elbow level' },
      { id: 'right_arm_circumference', name: 'Right Arm Circumference', category: 'arms', value: 0, unit: 'cm', description: 'Around the right arm at elbow level' },
      { id: 'left_wrist_circumference', name: 'Left Wrist Circumference', category: 'arms', value: 0, unit: 'cm', description: 'Around the left wrist' },
      { id: 'right_wrist_circumference', name: 'Right Wrist Circumference', category: 'arms', value: 0, unit: 'cm', description: 'Around the right wrist' },
      { id: 'arm_length', name: 'Arm Length', category: 'arms', value: 0, unit: 'cm', description: 'From shoulder to fingertip' },
    ]
  },
  {
    category: 'legs',
    label: 'Legs & Feet',
    measurements: [
      { id: 'left_thigh_circumference', name: 'Left Thigh Circumference', category: 'legs', value: 0, unit: 'cm', description: 'Around the left thigh at mid-point' },
      { id: 'right_thigh_circumference', name: 'Right Thigh Circumference', category: 'legs', value: 0, unit: 'cm', description: 'Around the right thigh at mid-point' },
      { id: 'left_calf_circumference', name: 'Left Calf Circumference', category: 'legs', value: 0, unit: 'cm', description: 'Around the left calf at fullest point' },
      { id: 'right_calf_circumference', name: 'Right Calf Circumference', category: 'legs', value: 0, unit: 'cm', description: 'Around the right calf at fullest point' },
      { id: 'left_ankle_circumference', name: 'Left Ankle Circumference', category: 'legs', value: 0, unit: 'cm', description: 'Around the left ankle' },
      { id: 'right_ankle_circumference', name: 'Right Ankle Circumference', category: 'legs', value: 0, unit: 'cm', description: 'Around the right ankle' },
      { id: 'leg_length', name: 'Leg Length', category: 'legs', value: 0, unit: 'cm', description: 'From hip to ankle' },
    ]
  }
];

/**
 * Copy status for UI feedback
 */
interface CopyStatus {
  [key: string]: boolean;
}

/**
 * MeasurementsDisplay Component
 *
 * Displays 28 measurements grouped by category with:
 * - Individual copy-to-clipboard functionality
 * - Optitex export format support
 * - Professional measurement layout
 */
const MeasurementsDisplay: React.FC = () => {
  const [measurements, setMeasurements] = useState<MeasurementGroup[]>(MEASUREMENTS_DATA);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  /**
   * Handle copying individual measurement to clipboard
   */
  const handleCopyMeasurement = async (measurement: Measurement) => {
    const text = `${measurement.name}: ${measurement.value} ${measurement.unit}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus({ ...copyStatus, [measurement.id]: true });
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [measurement.id]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Handle editing measurement value
   */
  const handleEditMeasurement = (measurement: Measurement) => {
    setEditingId(measurement.id);
    setEditValue(measurement.value.toString());
  };

  /**
   * Save edited measurement value
   */
  const handleSaveMeasurement = (measurementId: string) => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue)) {
      setMeasurements(
        measurements.map(group => ({
          ...group,
          measurements: group.measurements.map(m =>
            m.id === measurementId ? { ...m, value: newValue } : m
          )
        }))
      );
    }
    setEditingId(null);
    setEditValue('');
  };

  /**
   * Generate Optitex format export
   * Optitex uses specific format: MEASUREMENT_NAME\tVALUE\tUNIT
   */
  const generateOptitexFormat = (): string => {
    const lines: string[] = ['OPTITEX MEASUREMENT EXPORT'];
    lines.push('Generated: ' + new Date().toISOString());
    lines.push('');
    lines.push('MEASUREMENT\tVALUE\tUNIT');
    lines.push('-'.repeat(50));

    measurements.forEach(group => {
      lines.push('');
      lines.push(`# ${group.label}`);
      group.measurements.forEach(m => {
        lines.push(`${m.name}\t${m.value}\t${m.unit}`);
      });
    });

    return lines.join('\n');
  };

  /**
   * Export to Optitex format
   */
  const handleExportOptitex = () => {
    const content = generateOptitexFormat();
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `measurements_optitex_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  /**
   * Export to CSV format
   */
  const handleExportCSV = () => {
    const lines: string[] = ['Measurement,Value,Unit,Category,Description'];

    measurements.forEach(group => {
      group.measurements.forEach(m => {
        const row = [
          `"${m.name}"`,
          m.value,
          m.unit,
          m.category,
          `"${m.description}"`
        ].join(',');
        lines.push(row);
      });
    });

    const content = lines.join('\n');
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `measurements_${Date.now()}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  /**
   * Export to JSON format
   */
  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalMeasurements: measurements.reduce((sum, g) => sum + g.measurements.length, 0),
      measurements: measurements.flatMap(group =>
        group.measurements.map(m => ({
          ...m,
          groupLabel: group.label
        }))
      )
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `measurements_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const totalMeasurements = measurements.reduce((sum, g) => sum + g.measurements.length, 0);
  const filledMeasurements = measurements.reduce(
    (sum, g) => sum + g.measurements.filter(m => m.value > 0).length,
    0
  );

  return (
    <div className="measurements-display">
      <div className="measurements-header">
        <div className="header-content">
          <h1>Body Measurements</h1>
          <p className="measurements-count">
            {filledMeasurements} of {totalMeasurements} measurements recorded
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleExportOptitex}>
            Export Optitex
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportJSON}>
            Export JSON
          </button>
        </div>
      </div>

      <div className="measurements-groups">
        {measurements.map((group) => (
          <div key={group.category} className="measurement-group">
            <h2 className="group-title">{group.label}</h2>
            <div className="group-measurements">
              {group.measurements.map((measurement) => (
                <div key={measurement.id} className="measurement-item">
                  <div className="measurement-info">
                    <div className="measurement-name">{measurement.name}</div>
                    <div className="measurement-description">{measurement.description}</div>
                  </div>

                  <div className="measurement-value-section">
                    {editingId === measurement.id ? (
                      <div className="measurement-edit">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="0"
                          className="measurement-input"
                          autoFocus
                        />
                        <span className="unit">{measurement.unit}</span>
                        <button
                          className="btn-save"
                          onClick={() => handleSaveMeasurement(measurement.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="measurement-display">
                        <div
                          className="measurement-value-display"
                          onClick={() => handleEditMeasurement(measurement)}
                        >
                          <span className="value">{measurement.value.toFixed(1)}</span>
                          <span className="unit">{measurement.unit}</span>
                        </div>
                        <button
                          className={`btn-copy ${copyStatus[measurement.id] ? 'copied' : ''}`}
                          onClick={() => handleCopyMeasurement(measurement)}
                          title="Copy to clipboard"
                        >
                          {copyStatus[measurement.id] ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="measurements-footer">
        <p className="footer-note">
          Click on any value to edit. Click "Copy" to copy individual measurements to clipboard.
          Use export buttons to generate formatted reports.
        </p>
      </div>
    </div>
  );
};

export default MeasurementsDisplay;
