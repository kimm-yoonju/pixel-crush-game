
import React from 'react';
import { GameState } from '../types';

interface EndScreenProps {
    gameState: GameState;
    onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ gameState, onRestart }) => {
    if (gameState === GameState.Playing) return null;

    const messages = {
        [GameState.Won]: {
            title: 'Congratulations!',
            subtitle: 'You cleared all the pixels!',
            titleClass: 'text-green-400',
        },
        [GameState.Lost]: {
            title: 'Game Over',
            subtitle: 'You are stuck. Better luck next time!',
            titleClass: 'text-red-400',
        }
    };

    const message = messages[gameState];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center animate-fade-in-down">
                <h2 className={`text-5xl font-extrabold mb-2 ${message.titleClass}`}>{message.title}</h2>
                <p className="text-xl text-gray-300 mb-8">{message.subtitle}</p>
                <button
                    onClick={onRestart}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Restart Game
                </button>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default EndScreen;
