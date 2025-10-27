

import React, { useState, useMemo } from 'react';
import type { User, QuickReply, Message } from '../types.ts';
import { AiInputAssistant } from './AiInputAssistant.tsx';

interface ChatInputFooterProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (type: 'text' | 'internal', text: string) => void;
    currentUser: User;
    quickReplies: QuickReply[];
    users: User[];
}

export const ChatInputFooter: React.FC<ChatInputFooterProps> = ({ value, onChange, onSend, currentUser, quickReplies, users }) => {
    const [inputType, setInputType] = useState<'text' | 'internal'>('text');
    
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [quickReplyQuery, setQuickReplyQuery] = useState('');
    
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        onChange(text);

        // Handle Mentions - Allow spaces for multi-word names
        const mentionMatch = text.match(/@([\w\s]*)$/);
        if (inputType === 'internal' && mentionMatch) {
            setShowMentions(true);
            setMentionQuery(mentionMatch[1].toLowerCase());
            setShowQuickReplies(false);
        } else {
            setShowMentions(false);
        }

        // Handle Quick Replies
        const quickReplyMatch = text.match(/^\/([^\s]*)$/);
        if (inputType === 'text' && quickReplyMatch) {
            setShowQuickReplies(true);
            setQuickReplyQuery(quickReplyMatch[1].toLowerCase());
            setShowMentions(false);
        } else {
            setShowQuickReplies(false);
        }
    };
    
    const filteredUsers = useMemo(() => 
        users.filter(user => 
            user.id !== currentUser.id && user.name.toLowerCase().includes(mentionQuery)
        ), [users, currentUser.id, mentionQuery]);
        
    const filteredQuickReplies = useMemo(() =>
        quickReplies.filter(qr =>
            qr.shortcut.toLowerCase().startsWith(`/${quickReplyQuery}`)
        ), [quickReplies, quickReplyQuery]);

    const handleMentionSelect = (userName: string) => {
        const newText = value.replace(/@[\w\s]*$/, `@${userName} `);
        onChange(newText);
        setShowMentions(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(inputType, value);
    };
    
    const handleQuickReplyClick = (message: string) => {
      onChange(message);
      setShowQuickReplies(false);
    };

    const isInternal = inputType === 'internal';

    return (
        <div className={`relative p-4 border-t dark:border-gray-700 transition-colors duration-300 ${isInternal ? 'bg-status-warning/10 dark:bg-status-warning/20' : 'bg-white dark:bg-gray-800'}`}>
            {/* Mention Popover */}
            {showMentions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white dark:bg-gray-700 shadow-lg rounded-lg border dark:border-gray-600 max-h-48 overflow-y-auto z-20">
                    {filteredUsers.map(user => (
                        <div key={user.id} onClick={() => handleMentionSelect(user.name)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <img src={user.avatar_url} alt={user.name} className="w-6 h-6 rounded-full" />
                            <span className="text-sm">{user.name}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Quick Reply Popover */}
            {showQuickReplies && filteredQuickReplies.length > 0 && (
                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white dark:bg-gray-700 shadow-lg rounded-lg border dark:border-gray-600 max-h-48 overflow-y-auto z-20">
                    {filteredQuickReplies.map(qr => (
                        <div key={qr.id} onClick={() => handleQuickReplyClick(qr.message)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <p className="font-mono text-xs font-semibold text-primary">{qr.shortcut}</p>
                            <p className="text-sm">{qr.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center space-x-2 mb-3">
                <button onClick={() => setInputType('text')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${!isInternal ? 'bg-primary text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-text-secondary dark:text-gray-300'}`}>Mensagem</button>
                <button onClick={() => setInputType('internal')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${isInternal ? 'bg-status-warning text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-text-secondary dark:text-gray-300'}`}>Nota Interna</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={handleInputChange}
                        placeholder={isInternal ? 'Adicionar nota interna... Use @ para mencionar' : 'Digite "/" para respostas rápidas...'}
                        className={`w-full p-3 pl-5 pr-12 rounded-full focus:outline-none focus:ring-2 text-sm transition-colors ${isInternal ? 'bg-status-warning/20 dark:bg-status-warning/30 ring-status-warning text-text-main dark:text-gray-100' : 'bg-gray-100 dark:bg-gray-700 ring-primary'}`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <AiInputAssistant text={value} setText={onChange} />
                    </div>
                </div>
                <button type="submit" className={`text-white p-3 rounded-full transition-colors ${isInternal ? 'bg-status-warning hover:opacity-90' : 'bg-primary hover:bg-primary-dark'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
    );
};