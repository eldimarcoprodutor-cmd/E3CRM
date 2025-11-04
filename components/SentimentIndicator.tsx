import React from 'react';
import type { Sentiment } from '../types.ts';
import { SentimentPositiveIcon } from './icons/SentimentPositiveIcon.tsx';
import { SentimentNeutralIcon } from './icons/SentimentNeutralIcon.tsx';
import { SentimentNegativeIcon } from './icons/SentimentNegativeIcon.tsx';

interface SentimentIndicatorProps {
    sentiment: Sentiment;
}

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const SentimentIndicator: React.FC<SentimentIndicatorProps> = ({ sentiment }) => {
    const sentimentConfig = {
        'Positivo': {
            icon: <SentimentPositiveIcon className="w-4 h-4 text-green-600 dark:text-green-400" />,
            text: 'Positivo',
            className: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
        },
        'Neutro': {
            icon: <SentimentNeutralIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
            text: 'Neutro',
            className: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
        },
        'Negativo': {
            icon: <SentimentNegativeIcon className="w-4 h-4 text-red-600 dark:text-red-400" />,
            text: 'Negativo',
            className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
        },
        'Analisando...': {
            icon: <LoadingSpinner className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
            text: 'Analisando...',
            className: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400',
        },
    };

    const config = sentimentConfig[sentiment];

    return (
        <div 
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
            title="Sentimento do cliente (Analisado por IA)"
        >
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
};
