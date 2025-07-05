import React from 'react';
import ControlsPanel from './components/ControlsPanel';
import ViewerCanvas from './components/ViewerCanvas';

export default function App() {
  return (
    <div className="flex">
      <ControlsPanel />
      <ViewerCanvas />
    </div>
  );
}