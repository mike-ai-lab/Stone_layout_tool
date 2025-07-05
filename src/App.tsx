import React, { useState, useEffect, useCallback } from 'react';
import ControlsPanel from './components/ControlsPanel';
import ViewerCanvas from './components/ViewerCanvas';
import { LayoutEngine } from './logic/layoutEngine';
import { StoneParameters, Layout } from './types';
import './styles/App.css';

const defaultParameters: StoneParameters = {
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
};

export default function App() {
  const [parameters, setParameters] = useState<StoneParameters>(defaultParameters);
  const [layout, setLayout] = useState<Layout>({ stones: [], totalArea: 0, stoneCount: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLayout = useCallback(async (params: StoneParameters) => {
    setIsGenerating(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const engine = new LayoutEngine();
      const newLayout = engine.generateLayout(params);
      setLayout(newLayout);
      setIsGenerating(false);
    }, 100);
  }, []);

  useEffect(() => {
    generateLayout(parameters);
  }, [parameters, generateLayout]);

  const handleExport = () => {
    const exportData = {
      parameters,
      layout: {
        stoneCount: layout.stoneCount,
        totalArea: layout.totalArea,
        stones: layout.stones.map(stone => ({
          x: stone.x,
          y: stone.y,
          width: stone.width,
          height: stone.height
        }))
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stone-layout-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🪨 Stone Layout Configurator</h1>
        <p>Professional 3D stone cladding pattern generator</p>
      </header>
      
      <main className="app-main">
        <ControlsPanel
          parameters={parameters}
          onParametersChange={setParameters}
          onExport={handleExport}
        />
        
        <div className="viewer-section">
          {isGenerating && (
            <div className="generation-overlay">
              <div className="generation-spinner"></div>
              <p>Generating layout pattern...</p>
            </div>
          )}
          <ViewerCanvas
            layout={layout}
            wallWidth={parameters.wallWidth}
            wallHeight={parameters.wallHeight}
          />
        </div>
      </main>
    </div>
  );
}