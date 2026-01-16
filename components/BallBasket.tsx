
import React from 'react';
import { Ball, Color } from '../types';
import { COLOR_NAMES } from '../constants';
import BallComponent from './Ball';

interface BallBasketProps {
    balls: Ball[];
    onBallClick: (ball: Ball) => void;
}

const BallBasket: React.FC<BallBasketProps> = ({ balls, onBallClick }) => {
    // For each color, find the next ball to be picked (the one with the lowest count).
    const nextAvailableBalls = new Map<Color, Ball>();
    for (const ball of balls) {
        const existing = nextAvailableBalls.get(ball.color);
        if (!existing || ball.count < existing.count) {
            nextAvailableBalls.set(ball.color, ball);
        }
    }

    return (
        <div className="w-full p-2 bg-gray-800/50 rounded-lg">
            <div className="flex justify-around text-center">
                {COLOR_NAMES.map(color => {
                    const ballToDisplay = nextAvailableBalls.get(color);

                    return (
                        <div key={color} className="w-1/5 flex flex-col items-center">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center">
                              {ballToDisplay ? (
                                  <BallComponent
                                      color={ballToDisplay.color}
                                      count={ballToDisplay.count}
                                      onClick={() => onBallClick(ballToDisplay)}
                                      size="medium"
                                  />
                              ) : (
                                  // The empty space is maintained by the parent div's dimensions.
                                  null
                              )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BallBasket;
