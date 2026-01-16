
import React from 'react';
import { Slot } from '../types';
import BallComponent from './Ball';

interface SelectionSlotsProps {
    slots: Slot[];
}

const SelectionSlots: React.FC<SelectionSlotsProps> = ({ slots }) => {
    return (
        <div className="flex gap-2 sm:gap-4 p-2 bg-gray-800/50 rounded-lg">
            {slots.map(slot => (
                <div key={slot.id} className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center relative">
                    {slot.ball ? (
                        <BallComponent 
                            color={slot.ball.color} 
                            count={slot.ball.count} 
                            size="large"
                        />
                    ) : (
                        <span className="text-gray-500 text-xs sm:text-sm">Empty</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SelectionSlots;
