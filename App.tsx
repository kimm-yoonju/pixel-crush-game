
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, Pixel, Ball, Slot, GameState, Effect } from './types';
import { GRID_SIZE, TOTAL_PIXELS, COLOR_NAMES, NUM_SLOTS, GAME_SPEED } from './constants';
import GameCanvas from './components/GameCanvas';
import SelectionSlots from './components/SelectionSlots';
import BallBasket from './components/BallBasket';
import EndScreen from './components/EndScreen';
import GameIntro from './components/GameIntro';
import PauseScreen from './components/PauseScreen';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Intro);
    const [stage, setStage] = useState(1);
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
        // This function sets up the board for the current stage.
        // It's called when a new stage starts or when restarting.
        
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

        // 3. Create balls for the basket
        const newBasketBalls: Ball[] = [];
        COLOR_NAMES.forEach(color => {
            const totalForColor = newPixelCounts[color];
            const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
            const c1 = randomInt(50, 80);
            const remaining = totalForColor - c1;
            const minC2 = Math.max(50, remaining - 80);
            const maxC2 = Math.min(80, remaining - 50);
            const c2 = randomInt(minC2, maxC2);
            const c3 = remaining - c2;
            const counts = [c1, c2, c3];
            counts.forEach(count => {
                if (count > 0) {
                    newBasketBalls.push({ color, count, id: `${color}-${count}-${Math.random()}` });
                }
            });
        });

        for (let i = newBasketBalls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newBasketBalls[i], newBasketBalls[j]] = [newBasketBalls[j], newBasketBalls[i]];
        }
        setBasketBalls(newBasketBalls);

        // 4. Initialize empty slots
        setSlots(Array.from({ length: NUM_SLOTS }, (_, i) => ({ id: i, ball: null })));
    }, []);

    // Effect to setup the first stage when the game starts playing
    useEffect(() => {
        if (gameState === GameState.Playing) {
            resetGame();
        }
    }, [gameState, stage, resetGame]);

    const gameTick = useCallback(() => {
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            
            if (slot.ball && slot.ball.count > 0 && pixelCounts[slot.ball.color] > 0) {
                const colorToRemove = slot.ball.color;
                const pixelToRemoveIndex = pixels.findIndex(p => p.color === colorToRemove);

                if (pixelToRemoveIndex !== -1) {
                    const pixelToRemove = pixels[pixelToRemoveIndex];
                    const nextPixels = [...pixels];
                    nextPixels.splice(pixelToRemoveIndex, 1);
                    setPixels(nextPixels);

                    const nextSlots = JSON.parse(JSON.stringify(slots));
                    const newCount = nextSlots[i].ball.count - 1;
                    if (newCount > 0) {
                        nextSlots[i].ball.count = newCount;
                    } else {
                        nextSlots[i].ball = null;
                    }
                    setSlots(nextSlots);
                    
                    setPixelCounts(prevCounts => ({
                        ...prevCounts,
                        [colorToRemove]: prevCounts[colorToRemove] - 1,
                    }));
                    setEffects([{ id: Math.random(), pixel: pixelToRemove }]);
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
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [gameState, gameTick, slots, pixelCounts]);

    useEffect(() => {
        if (gameState !== GameState.Playing) return;
        if (pixels.length === 0) {
            setGameState(GameState.Won);
            return;
        }
        const canAnySlotMove = slots.some(s => s.ball && s.ball.count > 0 && pixelCounts[s.ball.color] > 0);
        if (!canAnySlotMove) {
            const areSlotsFull = slots.every(s => s.ball !== null);
            const isBasketEmpty = basketBalls.length === 0;
            if (areSlotsFull || isBasketEmpty) {
                setGameState(GameState.Lost);
            }
        }
    }, [pixels, slots, basketBalls, pixelCounts, gameState]);

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

    const handleStartGame = () => {
        setStage(1);
        setGameState(GameState.Playing);
    };

    const handleRestartStage = () => {
        setGameState(GameState.Playing);
        resetGame();
    };

    const handleNextStage = () => {
        setStage(prev => prev + 1);
        setGameState(GameState.Playing);
    };

    const handleStartOver = () => {
        setStage(1);
        setGameState(GameState.Playing);
    };

    const handlePauseToggle = () => {
        if (gameState === GameState.Playing) {
            setGameState(GameState.Paused);
        } else if (gameState === GameState.Paused) {
            setGameState(GameState.Playing);
        }
    };

    if (gameState === GameState.Intro) {
        return <GameIntro onStart={handleStartGame} />;
    }

    return (
        <div className="h-screen text-white flex flex-col items-center p-2 sm:p-4 font-sans antialiased">
            <div className="w-full max-w-md flex flex-col items-center h-full">
                <div className="w-full flex justify-between items-center flex-shrink-0 py-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-cyan-300">
                        Stage {stage}
                    </h1>
                    <button
                        onClick={handlePauseToggle}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        aria-label="Pause Game"
                    >
                        Pause
                    </button>
                </div>
                
                <div className="w-full flex-grow flex items-center justify-center min-h-0 my-2">
                    <GameCanvas pixels={pixels} effects={effects} />
                </div>
                
                <div className="w-full flex flex-col items-center gap-2 sm:gap-4 flex-shrink-0">
                    <SelectionSlots slots={slots} />
                    <BallBasket balls={basketBalls} onBallClick={handleBasketBallClick} />
                </div>
            </div>
            {gameState === GameState.Paused && <PauseScreen onResume={handlePauseToggle} />}
            <EndScreen 
                gameState={gameState} 
                stage={stage}
                onRestart={handleRestartStage}
                onNextStage={handleNextStage}
                onStartOver={handleStartOver}
            />
        </div>
    );
};

export default App;