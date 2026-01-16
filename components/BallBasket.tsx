
import React from 'react';
import { Ball } from '../types';
import BallComponent from './Ball';

interface BallBasketProps {
    balls: Ball[];
    onBallClick: (ball: Ball) => void;
}

const BallBasket: React.FC<BallBasketProps> = ({ balls, onBallClick }) => {
    return (
        <div className="w-full p-2 bg-gray-800/50 rounded-lg">
            <div className="flex flex-wrap content-start justify-center gap-3 p-2 h-32 sm:h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {balls.length > 0 ? (
                    balls.map(ball => (
                        <div key={ball.id} className="flex-shrink-0">
                            <BallComponent
                                color={ball.color}
                                count={ball.count}
                                onClick={() => onBallClick(ball)}
                                size="medium"
                            />
                        </div>
                    ))
                ) : (
                    <div className="w-full text-center text-gray-500 italic py-4">
                        Basket is empty
                    </div>
                )}
            </div>
            <style>{`
                .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: #4b5563 #1f2937;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 8px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #1f2937;
                    border-radius: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: #4b5563;
                    border-radius: 4px;
                    border: 2px solid #1f2937;
                }
            `}</style>
        </div>
    );
};

export default BallBasket;
