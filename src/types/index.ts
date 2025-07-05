export interface StoneParameters {
  wallWidth: number;
  wallHeight: number;
  stoneMinWidth: number;
  stoneMaxWidth: number;
  stoneMinHeight: number;
  stoneMaxHeight: number;
  jointWidth: number;
  jointHeight: number;
  randomness: number;
  layoutDirection: 'horizontal' | 'vertical';
  patternType: 'running' | 'stack' | 'random';
}

export interface Stone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
}

export interface Layout {
  stones: Stone[];
  totalArea: number;
  stoneCount: number;
}

export interface OobPreset {
  name: string;
  parameters: StoneParameters;
}