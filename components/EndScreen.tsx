
import React from 'react';
import { GameState } from '../types';

interface EndScreenProps {
    gameState: GameState;
    stage: number;
    onRestart: () => void;
    onNextStage: () => void;
    onStartOver: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ gameState, stage, onRestart, onNextStage, onStartOver }) => {
    if (gameState === GameState.Playing) return null;

    let title = '';
    let subtitle = '';
    let titleClass = '';
    let buttonText = '';
    let buttonAction = () => {};

    if (gameState === GameState.Won) {
        if (stage >= 100) {
            title = 'Congratulations!';
            subtitle = 'You have cleared all 100 stages!';
            titleClass = 'text-yellow-400';
            buttonText = 'Play Again';
            buttonAction = onStartOver;
        } else {
            title = `Stage ${stage} Cleared!`;
            subtitle = 'Ready for the next challenge?';
            titleClass = 'text-green-400';
            buttonText = 'Next Stage';
            buttonAction = onNextStage;
        }
    } else if (gameState === GameState.Lost) {
        title = 'Game Over';
        subtitle = 'You are stuck. Better luck next time!';
        titleClass = 'text-red-400';
        buttonText = 'Restart Stage';
        buttonAction = onRestart;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl text-center animate-fade-in-down">
                <h2 className={`text-4xl sm:text-5xl font-extrabold mb-2 ${titleClass}`}>{title}</h2>
                <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">{subtitle}</p>
                <button
                    onClick={buttonAction}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 text-base sm:py-3 sm:px-8 sm:text-lg rounded-lg transition-transform transform hover:scale-105"
                >
                    {buttonText}
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
