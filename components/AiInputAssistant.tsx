import React, { useState, useRef, useEffect } from 'react';
import { generateHumanizedResponse, correctSpellingAndGrammar, expandText } from '../services/geminiService.ts';

interface AiInputAssistantProps {
  text: string;
  setText: (newText: string) => void;
}

const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 5.879l-1.414-1.414a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 18.121l-1.414-1.414a2 2 0 010-2.828l1.414-1.414a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828 0zM12 21v-9" />
    </svg>
);


const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const AiInputAssistant: React.FC<AiInputAssistantProps> = ({ text, setText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = async (action: () => Promise<string>) => {
        if (!text.trim()) {
            setError("Digite algo para usar a IA.");
            setTimeout(() => setError(null), 2000);
            return;
        }
        setIsLoading(true);
        setError(null);
        setIsOpen(false);
        try {
            const result = await action();
            setText(result);
        } catch (e) {
            setError("Erro da IA. Tente novamente.");
            setTimeout(() => setError(null), 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const tones = ['Amigável', 'Formal', 'Empático', 'Técnico'];
    const [showTones, setShowTones] = useState(false);

    return (
        <div ref={popoverRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="text-gray-500 hover:text-primary dark:hover:text-primary-light disabled:cursor-not-allowed"
                aria-label="Assistente de IA"
            >
                {isLoading ? <LoadingSpinner className="h-5 w-5" /> : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                )}
            </button>

            {isOpen && (
                <div onMouseLeave={() => setShowTones(false)} className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border dark:border-gray-600 z-30">
                    <div className="relative">
                         <button 
                            onMouseEnter={() => setShowTones(true)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex justify-between items-center"
                        >
                            Ajustar Tom
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        {showTones && (
                            <div className="absolute left-full top-0 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-xl border dark:border-gray-600">
                                {tones.map(tone => (
                                    <button key={tone} onClick={() => handleAction(() => generateHumanizedResponse(text, tone))} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => handleAction(() => correctSpellingAndGrammar(text))} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Corrigir Ortografia</button>
                    <button onClick={() => handleAction(() => expandText(text))} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Expandir Texto</button>
                </div>
            )}
            {error && <div className="absolute bottom-full right-0 mb-2 p-2 text-xs bg-red-100 text-red-700 rounded-md">{error}</div>}
        </div>
    );
};