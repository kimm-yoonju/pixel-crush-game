
import React, { useRef, useEffect } from 'react';
import { Pixel } from '../types';
import { CANVAS_SIZE, PIXEL_SIZE, COLORS } from '../constants';

interface GameCanvasProps {
    pixels: Pixel[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ pixels }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#1f2937'; // bg-gray-800
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw pixels
        pixels.forEach(pixel => {
            ctx.fillStyle = COLORS[pixel.color];
            const centerX = pixel.x * PIXEL_SIZE + PIXEL_SIZE / 2;
            const centerY = pixel.y * PIXEL_SIZE + PIXEL_SIZE / 2;
            const radius = PIXEL_SIZE / 2 - 1; // leave a small gap
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();
        });

    }, [pixels]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-lg shadow-2xl border-2 border-gray-700"
        />
    );
};

export default GameCanvas;
