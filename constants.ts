
import { Color } from './types';

export const GRID_SIZE = 20;
export const PIXEL_SIZE = 20;
export const CANVAS_SIZE = GRID_SIZE * PIXEL_SIZE;
export const NUM_SLOTS = 3;
export const TOTAL_PIXELS = GRID_SIZE * GRID_SIZE;

export const COLORS: Record<Color, string> = {
  [Color.Red]: '#ef4444',
  [Color.Blue]: '#3b82f6',
  [Color.Green]: '#22c55e',
  [Color.Yellow]: '#eab308',
  [Color.Purple]: '#a855f7',
};

export const COLOR_NAMES = Object.values(Color);

export const GAME_SPEED = 333; // Milliseconds per pixel removal (1000ms / 333ms ~= 3 pixels per second)
