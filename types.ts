
export enum Color {
    Red = 'Red',
    Blue = 'Blue',
    Green = 'Green',
    Yellow = 'Yellow',
    Purple = 'Purple',
}

export interface Pixel {
    x: number;
    y: number;
    color: Color;
    id: number;
}

export interface Ball {
    color: Color;
    count: number;
    id: string; // Unique ID for React key
}

export interface Slot {
    ball: Ball | null;
    id: number;
}

export enum GameState {
    Playing = 'Playing',
    Won = 'Won',
    Lost = 'Lost',
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

export interface Effect {
    id: number;
    pixel: Pixel;
}
