
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, Pixel, Ball, Slot, GameState, Effect } from './types';
import { GRID_SIZE, TOTAL_PIXELS, COLOR_NAMES, NUM_SLOTS, GAME_SPEED } from './constants';
import GameCanvas from './components/GameCanvas';
import SelectionSlots from './components/SelectionSlots';
import BallBasket from './components/BallBasket';
import EndScreen from './components/EndScreen';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Playing);
    const [pixels, setPixels] = useState<Pixel[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [basketBalls, setBasketBalls] = useState<Ball[]>([]);
    const [effects, setEffects] = useState<Effect[]>([]);
    const [pixelCounts, setPixelCounts] = useState<Record<Color, number>>({
        [Color.Red]: 0,
        [Color.Blue]: 0,
        [Color.Green]: 0,
        [Color.Yellow]: 0,
        [Color.Purple]: 0,
    });

    const timerRef = useRef<number | null>(null);

    const resetGame = useCallback(() => {
        setGameState(GameState.Playing);

        // 1. Create a shuffled list of colors
        const colorsArray: Color[] = [];
        const pixelsPerColor = TOTAL_PIXELS / COLOR_NAMES.length;
        COLOR_NAMES.forEach(color => {
            for (let i = 0; i < pixelsPerColor; i++) {
                colorsArray.push(color);
            }
        });
        for (let i = colorsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colorsArray[i], colorsArray[j]] = [colorsArray[j], colorsArray[i]];
        }
        
        // 2. Create pixels and count them
        const newPixels: Pixel[] = [];
        const newPixelCounts: Record<Color, number> = {
            [Color.Red]: 0,
            [Color.Blue]: 0,
            [Color.Green]: 0,
            [Color.Yellow]: 0,
            [Color.Purple]: 0,
        };

        for (let i = 0; i < TOTAL_PIXELS; i++) {
            const color = colorsArray[i];
            newPixels.push({
                x: i % GRID_SIZE,
                y: Math.floor(i / GRID_SIZE),
                color,
                id: i,
            });
            newPixelCounts[color]++;
        }
        setPixels(newPixels);
        setPixelCounts(newPixelCounts);

        // 3. Create balls for the basket based on pixel counts with random counts >= 20
        const newBasketBalls: Ball[] = [];
        const minCount = 20;
        COLOR_NAMES.forEach(color => {
            let remaining = newPixelCounts[color];
            
            while (remaining > 0) {
                if (remaining < minCount * 2) {
                    if (remaining > 0) {
                       newBasketBalls.push({ color, count: remaining, id: `${color}-${remaining}-${Math.random()}` });
                    }
                    break;
                } else {
                    const maxCount = remaining - minCount;
                    const randomCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
                    
                    newBasketBalls.push({ color, count: randomCount, id: `${color}-${randomCount}-${Math.random()}` });
                    remaining -= randomCount;
                }
            }
        });

        setBasketBalls(newBasketBalls.sort((a,b) => b.count - a.count));

        // 4. Initialize empty slots
        setSlots(Array.from({ length: NUM_SLOTS }, (_, i) => ({ id: i, ball: null })));
    }, []);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    const gameTick = useCallback(() => {
        // By processing only one pixel per tick, we create a staggered effect.
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            
            if (slot.ball && slot.ball.count > 0 && pixelCounts[slot.ball.color] > 0) {
                const colorToRemove = slot.ball.color;
                const pixelToRemoveIndex = pixels.findIndex(p => p.color === colorToRemove);

                if (pixelToRemoveIndex !== -1) {
                    const pixelToRemove = pixels[pixelToRemoveIndex];
                    
                    // 1. Update pixels
                    const nextPixels = [...pixels];
                    nextPixels.splice(pixelToRemoveIndex, 1);
                    setPixels(nextPixels);

                    // 2. Update slots
                    const nextSlots = JSON.parse(JSON.stringify(slots));
                    const newCount = nextSlots[i].ball.count - 1;
                    if (newCount > 0) {
                        nextSlots[i].ball.count = newCount;
                    } else {
                        nextSlots[i].ball = null;
                    }
                    setSlots(nextSlots);
                    
                    // 3. Update pixel counts
                    setPixelCounts(prevCounts => ({
                        ...prevCounts,
                        [colorToRemove]: prevCounts[colorToRemove] - 1,
                    }));

                    // 4. Trigger visual effect for the removed pixel
                    setEffects([{ id: Math.random(), pixel: pixelToRemove }]);
                    
                    // 5. Exit after processing one pixel to wait for the next tick
                    return;
                }
            }
        }
    }, [pixels, slots, pixelCounts]);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const canMakeMove = slots.some(s => s.ball && s.ball.count > 0 && (pixelCounts[s.ball.color] ?? 0) > 0);

        const gameLoop = () => {
            gameTick();
            timerRef.current = window.setTimeout(gameLoop, GAME_SPEED);
        };

        if (gameState === GameState.Playing && canMakeMove) {
            gameLoop();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [gameState, gameTick, slots, pixelCounts]);

    useEffect(() => {
        if (gameState !== GameState.Playing) return;

        if (pixels.length === 0) {
            setGameState(GameState.Won);
            return;
        }

        const areSlotsFull = slots.every(s => s.ball !== null);
        const canAnySlotMove = slots.some(s => s.ball && s.ball.count > 0 && pixelCounts[s.ball.color] > 0);

        if (areSlotsFull && !canAnySlotMove && pixels.length > 0) {
            setGameState(GameState.Lost);
        }
    }, [pixels, slots, pixelCounts, gameState]);

    const handleBasketBallClick = useCallback((clickedBall: Ball) => {
        if (gameState !== GameState.Playing) return;
        const emptySlotIndex = slots.findIndex(s => s.ball === null);
        if (emptySlotIndex !== -1) {
            setSlots(prevSlots => prevSlots.map((slot, index) =>
                index === emptySlotIndex ? { ...slot, ball: clickedBall } : slot
            ));
            setBasketBalls(prevBalls => prevBalls.filter(b => b.id !== clickedBall.id));
        }
    }, [slots, gameState]);

    return (
        <div className="h-screen text-white flex flex-col items-center p-2 sm:p-4 font-sans antialiased">
            <div className="w-full max-w-md flex flex-col items-center h-full">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-cyan-300 flex-shrink-0 py-2">Pixel Ball Clear</h1>
                
                <div className="w-full flex-grow flex items-center justify-center min-h-0 my-2">
                    <GameCanvas pixels={pixels} effects={effects} />
                </div>
                
                <div className="w-full flex flex-col items-center gap-2 sm:gap-4 flex-shrink-0">
                    <SelectionSlots slots={slots} />
                    <BallBasket balls={basketBalls} onBallClick={handleBasketBallClick} />
                </div>
            </div>
            <EndScreen gameState={gameState} onRestart={resetGame} />
        </div>
    );
};

export default App;
