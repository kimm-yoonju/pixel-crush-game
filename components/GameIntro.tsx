
import React from 'react';

interface GameIntroProps {
    onStart: () => void;
}

const GameIntro: React.FC<GameIntroProps> = ({ onStart }) => {
    return (
        <div
            className="h-screen text-white flex flex-col items-center justify-center p-4 font-sans antialiased"
            style={{
                backgroundImage: `url('https://i.imgur.com/K1LdX5A.jpeg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative text-center animate-fade-in-down">
                <h1 className="text-5xl sm:text-7xl font-extrabold tracking-wider text-cyan-300 mb-8">
                    Pixel Crush
                </h1>
                <button
                    onClick={onStart}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-12 text-xl sm:text-2xl rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                    Game Start
                </button>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default GameIntro;
