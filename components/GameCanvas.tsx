
import React, { useRef, useEffect } from 'react';
import { Pixel, Effect, Particle } from '../types';
import { COLORS, GRID_SIZE } from '../constants';

interface GameCanvasProps {
    pixels: Pixel[];
    effects: Effect[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ pixels, effects }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const pixelsRef = useRef<Pixel[]>(pixels);
    
    useEffect(() => {
        pixelsRef.current = pixels;
    }, [pixels]);

    useEffect(() => {
        if (effects.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const pixelSize = canvas.width / GRID_SIZE;

        const newParticles: Particle[] = [];
        effects.forEach(effect => {
            const pixel = effect.pixel;
            const centerX = pixel.x * pixelSize + pixelSize / 2;
            const centerY = pixel.y * pixelSize + pixelSize / 2;
            const numParticles = 8;

            for (let i = 0; i < numParticles; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const speed = Math.random() * 2 + 1;
                newParticles.push({
                    id: Math.random(),
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 30 + Math.random() * 20, // life in frames
                    color: COLORS[pixel.color],
                    size: Math.random() * 2 + 1,
                });
            }
        });

        particlesRef.current.push(...newParticles);
    }, [effects]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const size = parent.clientWidth;
                if (canvas.width !== size) {
                    canvas.width = size;
                    canvas.height = size;
                }
            }
        };

        const render = () => {
            resizeCanvas(); // Check for resize on each frame
            const pixelSize = canvas.width / GRID_SIZE;
            
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            pixelsRef.current.forEach(pixel => {
                ctx.fillStyle = COLORS[pixel.color];
                const centerX = pixel.x * pixelSize + pixelSize / 2;
                const centerY = pixel.y * pixelSize + pixelSize / 2;
                const radius = pixelSize / 2 - 1;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            particlesRef.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // gravity
                p.life -= 1;

                ctx.globalAlpha = Math.max(0, p.life / 50);
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            ctx.globalAlpha = 1.0;

            particlesRef.current = particlesRef.current.filter(p => p.life > 0);

            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl border-2 border-gray-700 w-full"
        />
    );
};

export default GameCanvas;
