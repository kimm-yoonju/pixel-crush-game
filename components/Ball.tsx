
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
        medium: 'w-16 h-16 text-xl',
        large: 'w-24 h-24 text-3xl'
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
