

import React, { useState, useMemo } from 'react';
import type { User, QuickReply } from '../types.ts';

interface ChatInputFooterProps {
    onSend: (text: string) => void;
    currentUser: User;
    quickReplies: QuickReply[];
    users: User[];
}

export const ChatInputFooter: React.FC<ChatInputFooterProps> = ({ onSend, currentUser, quickReplies, users }) => {
    const [value, onChange] = useState('');
    
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [quickReplyQuery, setQuickReplyQuery] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        onChange(text);

        const quickReplyMatch = text.match(/^\/([^\s]*)$/);
        if (quickReplyMatch) {
            setShowQuickReplies(true);
            setQuickReplyQuery(quickReplyMatch[1].toLowerCase());
        } else {
            setShowQuickReplies(false);
        }
    };
        
    const filteredQuickReplies = useMemo(() =>
        quickReplies.filter(qr =>
            qr.shortcut.toLowerCase().startsWith(`/${quickReplyQuery}`)
        ), [quickReplies, quickReplyQuery]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(value);
        onChange('');
    };
    
    const handleQuickReplyClick = (message: string) => {
      onChange(message);
      setShowQuickReplies(false);
    };


    return (
        <div className="relative">
            {showQuickReplies && filteredQuickReplies.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-white dark:bg-gray-700 shadow-lg rounded-lg border dark:border-gray-600 max-h-48 overflow-y-auto z-20">
                    {filteredQuickReplies.map(qr => (
                        <div key={qr.id} onClick={() => handleQuickReplyClick(qr.message)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <p className="font-mono text-xs font-semibold text-primary">{qr.shortcut}</p>
                            <p className="text-sm">{qr.message}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                {/* Emoji and Attachment Icons */}
                <button type="button" className="p-2 hover:text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                <button type="button" className="p-2 hover:text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                
                {/* Text Input Form */}
                <form onSubmit={handleFormSubmit} className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={handleInputChange}
                        placeholder={'Digite uma mensagem'}
                        className="w-full p-3 px-5 rounded-full bg-white dark:bg-[#2a3942] focus:outline-none text-sm text-gray-800 dark:text-gray-200"
                    />
                </form>

                {/* Send/Mic Button */}
                <button onClick={handleFormSubmit} type="button" className="p-2 text-white bg-primary rounded-full hover:bg-primary-dark">
                   {value.trim() ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                   ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   )}
                </button>
            </div>
        </div>
    );
};