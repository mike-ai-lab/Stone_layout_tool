import React, { useState, useEffect } from 'react';
import { StoneParameters, OobPreset } from '../types';
import { loadPresetFiles } from '../logic/oobParser';

interface ControlsPanelProps {
  parameters: StoneParameters;
  onParametersChange: (params: StoneParameters) => void;
  onExport: () => void;
}

export default function ControlsPanel({ 
  parameters, 
  onParametersChange, 
  onExport 
}: ControlsPanelProps) {
  const [presets, setPresets] = useState<OobPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    loadPresetFiles().then(setPresets);
  }, []);

  const handleParameterChange = (key: keyof StoneParameters, value: any) => {
    onParametersChange({
      ...parameters,
      [key]: value
    });
  };

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      onParametersChange(preset.parameters);
    }
  };

  const resetParameters = () => {
    setSelectedPreset('');
    onParametersChange({
      wallWidth: 5000,
      wallHeight: 3000,
      stoneMinWidth: 200,
      stoneMaxWidth: 600,
      stoneMinHeight: 100,
      stoneMaxHeight: 300,
      jointWidth: 10,
      jointHeight: 10,
      randomness: 0.3,
      layoutDirection: 'horizontal',
      patternType: 'running'
    });
  };

  return (
    <div className="controls-panel">
      <div className="panel-header">
        <h2>Stone Layout Controls</h2>
        <div className="header-actions">
          <button onClick={resetParameters} className="btn-secondary">
            Reset
          </button>
          <button onClick={onExport} className="btn-primary">
            Export
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* Presets Section */}
        <div className="control-section">
          <h3>Presets</h3>
          <select 
            value={selectedPreset} 
            onChange={(e) => handlePresetChange(e.target.value)}
            className="preset-select"
          >
            <option value="">Select a preset...</option>
            {presets.map(preset => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wall Dimensions */}
        <div className="control-section">
          <h3>Wall Dimensions</h3>
          <div className="control-group">
            <label>
              Width (mm)
              <input
                type="number"
                value={parameters.wallWidth}
                onChange={(e) => handleParameterChange('wallWidth', Number(e.target.value))}
                min="100"
                max="50000"
                step="100"
              />
            </label>
            <label>
              Height (mm)
              <input
                type="number"
                value={parameters.wallHeight}
                onChange={(e) => handleParameterChange('wallHeight', Number(e.target.value))}
                min="100"
                max="20000"
                step="100"
              />
            </label>
          </div>
        </div>

        {/* Stone Dimensions */}
        <div className="control-section">
          <h3>Stone Dimensions</h3>
          <div className="control-group">
            <label>
              Min Width (mm)
              <input
                type="number"
                value={parameters.stoneMinWidth}
                onChange={(e) => handleParameterChange('stoneMinWidth', Number(e.target.value))}
                min="50"
                max="2000"
                step="10"
              />
            </label>
            <label>
              Max Width (mm)
              <input
                type="number"
                value={parameters.stoneMaxWidth}
                onChange={(e) => handleParameterChange('stoneMaxWidth', Number(e.target.value))}
                min="50"
                max="2000"
                step="10"
              />
            </label>
            <label>
              Min Height (mm)
              <input
                type="number"
                value={parameters.stoneMinHeight}
                onChange={(e) => handleParameterChange('stoneMinHeight', Number(e.target.value))}
                min="20"
                max="1000"
                step="5"
              />
            </label>
            <label>
              Max Height (mm)
              <input
                type="number"
                value={parameters.stoneMaxHeight}
                onChange={(e) => handleParameterChange('stoneMaxHeight', Number(e.target.value))}
                min="20"
                max="1000"
                step="5"
              />
            </label>
          </div>
        </div>

        {/* Joint Settings */}
        <div className="control-section">
          <h3>Joint Settings</h3>
          <div className="control-group">
            <label>
              Joint Width (mm)
              <input
                type="number"
                value={parameters.jointWidth}
                onChange={(e) => handleParameterChange('jointWidth', Number(e.target.value))}
                min="0"
                max="50"
                step="1"
              />
            </label>
            <label>
              Joint Height (mm)
              <input
                type="number"
                value={parameters.jointHeight}
                onChange={(e) => handleParameterChange('jointHeight', Number(e.target.value))}
                min="0"
                max="50"
                step="1"
              />
            </label>
          </div>
        </div>

        {/* Pattern Settings */}
        <div className="control-section">
          <h3>Pattern Settings</h3>
          <div className="control-group">
            <label>
              Randomness
              <input
                type="range"
                value={parameters.randomness * 100}
                onChange={(e) => handleParameterChange('randomness', Number(e.target.value) / 100)}
                min="0"
                max="100"
                step="1"
              />
              <span className="range-value">{Math.round(parameters.randomness * 100)}%</span>
            </label>
            <label>
              Pattern Type
              <select
                value={parameters.patternType}
                onChange={(e) => handleParameterChange('patternType', e.target.value)}
              >
                <option value="running">Running Bond</option>
                <option value="stack">Stack Bond</option>
                <option value="random">Random</option>
              </select>
            </label>
            <label>
              Layout Direction
              <select
                value={parameters.layoutDirection}
                onChange={(e) => handleParameterChange('layoutDirection', e.target.value)}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}