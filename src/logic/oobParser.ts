import { StoneParameters, OobPreset } from '../types';

export function parseOob(content: string, filename: string): OobPreset {
  const lines = content.split('\n').filter(line => line.trim());
  const params: Partial<StoneParameters> = {};

  // Default values
  const defaults: StoneParameters = {
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

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('@@')) continue;

    const [rawKey, ...values] = trimmed.split(';');
    const key = rawKey.replace('@@', '').trim().toLowerCase();
    
    if (values.length === 0) continue;

    const numericValues = values
      .join(';')
      .split(/[;#\s]/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    // Map OOB parameters to our structure
    switch (key) {
      case 'width':
      case 'wall_width':
        params.wallWidth = numericValues[0] || defaults.wallWidth;
        break;
      case 'height':
      case 'wall_height':
        params.wallHeight = numericValues[0] || defaults.wallHeight;
        break;
      case 'stone_min_width':
      case 'min_width':
        params.stoneMinWidth = numericValues[0] || defaults.stoneMinWidth;
        break;
      case 'stone_max_width':
      case 'max_width':
        params.stoneMaxWidth = numericValues[0] || defaults.stoneMaxWidth;
        break;
      case 'stone_min_height':
      case 'min_height':
        params.stoneMinHeight = numericValues[0] || defaults.stoneMinHeight;
        break;
      case 'stone_max_height':
      case 'max_height':
        params.stoneMaxHeight = numericValues[0] || defaults.stoneMaxHeight;
        break;
      case 'joint_width':
      case 'mortar_width':
        params.jointWidth = numericValues[0] || defaults.jointWidth;
        break;
      case 'joint_height':
      case 'mortar_height':
        params.jointHeight = numericValues[0] || defaults.jointHeight;
        break;
      case 'randomness':
      case 'variation':
        params.randomness = Math.min(1, Math.max(0, (numericValues[0] || 0) / 100));
        break;
    }
  }

  const name = filename.replace('.oob', '').replace(/[_-]/g, ' ');
  
  return {
    name,
    parameters: { ...defaults, ...params }
  };
}

export async function loadPresetFiles(): Promise<OobPreset[]> {
  const presetFiles = [
    'Stone Wall 35 cm thick.oob',
    'Brick Standard.oob',
    'Natural Stone Random.oob'
  ];

  const presets: OobPreset[] = [];

  for (const filename of presetFiles) {
    try {
      const response = await fetch(`/assets/presets/${filename}`);
      if (response.ok) {
        const content = await response.text();
        const preset = parseOob(content, filename);
        presets.push(preset);
      }
    } catch (error) {
      console.warn(`Failed to load preset ${filename}:`, error);
    }
  }

  // Add default presets if no files loaded
  if (presets.length === 0) {
    presets.push({
      name: 'Standard Brick',
      parameters: {
        wallWidth: 5000,
        wallHeight: 3000,
        stoneMinWidth: 200,
        stoneMaxWidth: 250,
        stoneMinHeight: 65,
        stoneMaxHeight: 65,
        jointWidth: 10,
        jointHeight: 10,
        randomness: 0.1,
        layoutDirection: 'horizontal',
        patternType: 'running'
      }
    });

    presets.push({
      name: 'Natural Stone',
      parameters: {
        wallWidth: 5000,
        wallHeight: 3000,
        stoneMinWidth: 150,
        stoneMaxWidth: 800,
        stoneMinHeight: 100,
        stoneMaxHeight: 400,
        jointWidth: 15,
        jointHeight: 15,
        randomness: 0.8,
        layoutDirection: 'horizontal',
        patternType: 'random'
      }
    });
  }

  return presets;
}