
import React from 'react';

interface PauseScreenProps {
    onResume: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-40 p-4">
            <div className="text-center animate-fade-in">
                <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-8 tracking-wider">
                    Paused
                </h2>
                <button
                    onClick={onResume}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-12 text-xl sm:text-2xl rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                    aria-label="Resume Game"
                >
                    Resume
                </button>
            </div>
            <style>{`
                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PauseScreen;
