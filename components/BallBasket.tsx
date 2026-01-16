
import React from 'react';
import { Ball, Color } from '../types';
import { COLOR_NAMES } from '../constants';
import BallComponent from './Ball';

interface BallBasketProps {
    balls: Ball[];
    onBallClick: (ball: Ball) => void;
}

const BallBasket: React.FC<BallBasketProps> = ({ balls, onBallClick }) => {
    const ballsByColor: Record<Color, Ball[]> = {} as any;
    COLOR_NAMES.forEach(c => ballsByColor[c] = []);
    balls.forEach(b => {
        if (ballsByColor[b.color]) {
            ballsByColor[b.color].push(b);
        }
    });

    return (
        <div className="w-full max-w-3xl p-4 bg-gray-800/50 rounded-lg">
            {balls.length === 0 ? (
                <p className="text-center text-gray-400">No more balls available.</p>
            ) : (
                <div className="flex justify-around text-center">
                    {COLOR_NAMES.map(color => {
                        // Sort balls so the smallest count is last, which will appear at the bottom in flex-col-reverse
                        const colorBalls = ballsByColor[color].sort((a, b) => b.count - a.count);
                        const ballToDisplay = colorBalls.length > 0 ? colorBalls[colorBalls.length - 1] : null;

                        return (
                            <div key={color} className="w-1/5 flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-2 text-gray-400 h-8">{color}</h3>
                                <div className="relative w-20 h-48 flex flex-col-reverse items-center pt-2 overflow-hidden">
                                    {/* Render upcoming balls stacked underneath */}
                                    {colorBalls.slice(0, -1).map((ball, index) => (
                                        <div 
                                            key={ball.id} 
                                            className="absolute bottom-0 transition-transform duration-300 ease-out"
                                            style={{ 
                                                transform: `translateY(${(colorBalls.length - 2 - index) * -16}px) scale(${1 - (colorBalls.length - 1 - index) * 0.05})`,
                                                opacity: 1 - (colorBalls.length - 1 - index) * 0.2,
                                                zIndex: 10 - index,
                                            }}
                                        >
                                            <BallComponent
                                                color={ball.color}
                                                count={ball.count}
                                                size="medium"
                                            />
                                        </div>
                                    ))}
                                    {/* Render the clickable ball on top */}
                                    {ballToDisplay && (
                                        <div 
                                            key={ballToDisplay.id}
                                            className="absolute bottom-0 transition-transform duration-300 ease-out"
                                            style={{ zIndex: 20 }}
                                        >
                                            <BallComponent
                                                color={ballToDisplay.color}
                                                count={ballToDisplay.count}
                                                onClick={() => onBallClick(ballToDisplay)}
                                                size="medium"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BallBasket;
