
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, Pixel, Ball, Slot, GameState } from './types';
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
    // FIX: Initialize pixelCounts with all colors from the Color enum to satisfy the Record<Color, number> type.
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
                // If the remaining amount is less than double the minimum,
                // just create one last ball with the remaining count. This ensures all balls are >= minCount.
                if (remaining < minCount * 2) {
                    if (remaining > 0) {
                       newBasketBalls.push({ color, count: remaining, id: `${color}-${remaining}-${Math.random()}` });
                    }
                    break; // Exit loop
                } else {
                    // Determine a random count for the new ball.
                    // The max is set to `remaining - minCount` to ensure the leftover part is at least `minCount`.
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
        // Create mutable copies of the current state to calculate the next state
        let nextPixels = [...pixels];
        let nextSlots = JSON.parse(JSON.stringify(slots)); // Deep copy to handle nested ball object
        let nextPixelCounts = { ...pixelCounts };
        let changesMade = false;

        // Iterate over a snapshot of the slots to determine actions
        slots.forEach((slot, index) => {
            // Check if this slot is active and can make a move
            if (slot.ball && slot.ball.count > 0 && nextPixelCounts[slot.ball.color] > 0) {
                const colorToRemove = slot.ball.color;
                
                // Find a pixel of the corresponding color in the *currently available* pixels for this tick
                const pixelToRemoveIndex = nextPixels.findIndex(p => p.color === colorToRemove);

                if (pixelToRemoveIndex !== -1) {
                    changesMade = true;
                    
                    // Remove the pixel from our mutable copy for the next state
                    nextPixels.splice(pixelToRemoveIndex, 1);
                    
                    // Decrement the total count for that color
                    nextPixelCounts[colorToRemove]--;

                    // Decrement the ball's count in the corresponding slot for the next state
                    const newCount = nextSlots[index].ball.count - 1;
                    if (newCount > 0) {
                        nextSlots[index].ball.count = newCount;
                    } else {
                        // If the ball is used up, clear the slot
                        nextSlots[index].ball = null;
                    }
                }
            }
        });

        // If any pixels were removed, update the state all at once
        if (changesMade) {
            setPixels(nextPixels);
            setSlots(nextSlots);
            setPixelCounts(nextPixelCounts);
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
            gameLoop(); // Start the loop immediately
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
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans antialiased">
            <div className="w-full max-w-4xl flex flex-col items-center gap-6">
                <h1 className="text-4xl font-bold tracking-wider text-cyan-300">Pixel Ball Clear</h1>
                
                <GameCanvas pixels={pixels} />

                <div className="w-full flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-semibold text-gray-300">Selection Slots</h2>
                    <SelectionSlots slots={slots} />
                </div>
                
                <div className="w-full flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-semibold text-gray-300">Ball Basket</h2>
                    <BallBasket balls={basketBalls} onBallClick={handleBasketBallClick} />
                </div>
            </div>
            <EndScreen gameState={gameState} onRestart={resetGame} />
        </div>
    );
};

export default App;
