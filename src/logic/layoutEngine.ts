import { StoneParameters, Stone, Layout } from '../types';

export class LayoutEngine {
  private seededRandom: () => number;

  constructor(seed: number = 12345) {
    // Simple seeded random number generator for consistent results
    let currentSeed = seed;
    this.seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  generateLayout(params: StoneParameters): Layout {
    const stones: Stone[] = [];
    let currentY = 0;
    let stoneId = 0;

    while (currentY < params.wallHeight) {
      const row = this.generateRow(
        params,
        currentY,
        stoneId,
        stones.length === 0 // isFirstRow
      );
      
      stones.push(...row.stones);
      currentY = row.nextY;
      stoneId = row.nextId;

      // Safety check to prevent infinite loops
      if (stones.length > 10000) {
        console.warn('Maximum stone count reached');
        break;
      }
    }

    // Trim stones that exceed wall boundaries
    const trimmedStones = stones.filter(stone => 
      stone.x < params.wallWidth && stone.y < params.wallHeight
    );

    // Calculate total area
    const totalArea = trimmedStones.reduce((sum, stone) => 
      sum + (stone.width * stone.height), 0
    );

    return {
      stones: trimmedStones,
      totalArea,
      stoneCount: trimmedStones.length
    };
  }

  private generateRow(
    params: StoneParameters,
    startY: number,
    startId: number,
    isFirstRow: boolean
  ): { stones: Stone[]; nextY: number; nextId: number } {
    const stones: Stone[] = [];
    let currentX = 0;
    let stoneId = startId;

    // Calculate row height
    const baseHeight = this.lerp(
      params.stoneMinHeight,
      params.stoneMaxHeight,
      this.seededRandom()
    );
    
    const rowHeight = this.applyRandomness(baseHeight, params.randomness);

    // Apply pattern offset for running bond
    let offsetX = 0;
    if (params.patternType === 'running' && !isFirstRow) {
      offsetX = -this.lerp(50, 200, this.seededRandom());
    }

    currentX = offsetX;

    while (currentX < params.wallWidth) {
      const baseWidth = this.lerp(
        params.stoneMinWidth,
        params.stoneMaxWidth,
        this.seededRandom()
      );

      let stoneWidth = this.applyRandomness(baseWidth, params.randomness);
      let stoneHeight = rowHeight;

      // Ensure stone doesn't exceed wall boundaries
      if (currentX + stoneWidth > params.wallWidth) {
        stoneWidth = params.wallWidth - currentX;
      }

      if (stoneWidth > 20) { // Minimum stone width
        const stone: Stone = {
          id: `stone-${stoneId++}`,
          x: currentX,
          y: startY,
          width: stoneWidth,
          height: stoneHeight,
          depth: 100 // Standard depth for 3D visualization
        };

        stones.push(stone);
      }

      currentX += stoneWidth + params.jointWidth;
    }

    return {
      stones,
      nextY: startY + rowHeight + params.jointHeight,
      nextId: stoneId
    };
  }

  private lerp(min: number, max: number, t: number): number {
    return min + (max - min) * t;
  }

  private applyRandomness(value: number, randomness: number): number {
    const variation = value * randomness * (this.seededRandom() - 0.5) * 2;
    return Math.max(20, value + variation);
  }
}