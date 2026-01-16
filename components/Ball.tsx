
import React from 'react';
import { Color } from '../types';
import { COLORS } from '../constants';

interface BallProps {
    color: Color;
    count: number;
    onClick?: () => void;
    size?: 'medium' | 'large';
}

const BallComponent: React.FC<BallProps> = ({ color, count, onClick, size = 'medium' }) => {
    const colorHex = COLORS[color];
    const sizeClasses = {
        medium: 'w-12 h-12 text-sm sm:w-14 sm:h-14 sm:text-lg',
        large: 'w-16 h-16 text-xl sm:w-20 sm:h-20 sm:text-2xl'
    };
    const cursorClass = onClick ? 'cursor-pointer hover:scale-110' : '';

    return (
        <div
            onClick={onClick}
            className={`rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform duration-200 ${sizeClasses[size]} ${cursorClass}`}
            style={{ 
                backgroundColor: colorHex,
                boxShadow: `inset 0 0 10px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.5)`
            }}
        >
            {count}
        </div>
    );
};

export default BallComponent;
