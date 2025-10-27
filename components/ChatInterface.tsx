

import React, { useState, useRef, useEffect } from 'react';
import type { Chat, Message, User, QuickReply } from '../types';
import { ChatMessageComponent } from './ChatMessageComponent';
import { ChatInputFooter } from './ChatInputFooter';
import { generateReplySuggestion } from '../services/geminiService';
import { BotIcon } from './icons/BotIcon';

interface ChatInterfaceProps {
    chat: Chat;
    currentUser: User;
    onSendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
    users: User[];
    quickReplies: QuickReply[];
    onTakeOverChat: (chatId: string) => void;
}

const AiSuggestions: React.FC<{ chatHistory: string; onSuggestionClick: (text: string) => void; }> = ({ chatHistory, onSuggestionClick }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(!chatHistory) return;
        const fetchSuggestions = async () => {
            setIsLoading(true);
            const result = await generateReplySuggestion(chatHistory);
            setSuggestions(result);
            setIsLoading(false);
        };
        const timer = setTimeout(fetchSuggestions, 500);
        return () => clearTimeout(timer);
    }, [chatHistory]);

    return (
        <div className="px-4 pt-2 pb-1 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2">Sugestões da IA:</p>
            {isLoading ? <p className="text-xs text-gray-400">Gerando...</p> : (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => onSuggestionClick(s)} className="px-3 py-1 text-xs bg-primary-light dark:bg-primary/20 text-primary-dark dark:text-primary-light rounded-full hover:bg-primary-light/80 dark:hover:bg-primary/30">
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const AiHandoffBanner: React.FC<{ onTakeOver: () => void }> = ({ onTakeOver }) => (
    <div className="p-3 bg-primary-light dark:bg-primary/20 text-center border-b dark:border-gray-700">
        <div className="flex items-center justify-center gap-3">
            <BotIcon className="w-6 h-6 text-primary" />
            <p className="text-sm text-primary-dark dark:text-primary-light">Esta conversa está sendo atendida pelo <strong>Assistente IA</strong>.</p>
            <button
                onClick={onTakeOver}
                className="ml-4 px-4 py-1.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark"
            >
                Assumir Conversa
            </button>
        </div>
    </div>
);


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, currentUser, onSendMessage, users, quickReplies, onTakeOverChat }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages]);
    
    const chatHistoryString = chat.messages
    .filter(m => m.type === 'text')
    .map(m => `${m.sender === currentUser.id ? 'Atendente' : 'Cliente'}: ${m.text}`).join('\n');

    const handleSend = (type: 'text' | 'internal', text: string) => {
        if (text.trim()) {
            onSendMessage(chat.id, {
                sender: currentUser.id,
                text: text,
                avatar_url: currentUser.avatar_url,
                type: type,
                chat_id: chat.id,
            });
            setNewMessage('');
        }
    };
    
    const isBotHandled = chat.handled_by === 'bot';

    return (
        <div className="flex flex-col h-full bg-background-main dark:bg-gray-900">
            {/* Chat Header */}
            <header className="flex items-center p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
                <img src={chat.avatar_url} alt={chat.contact_name} className="w-10 h-10 rounded-full" />
                <div className="ml-4">
                    <p className="font-bold text-text-main dark:text-white">{chat.contact_name}</p>
                    <p className="text-xs text-status-success">Online</p>
                </div>
            </header>
            
            {isBotHandled && <AiHandoffBanner onTakeOver={() => onTakeOverChat(chat.id)} />}

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4">
                {chat.messages.map((msg) => (
                    <ChatMessageComponent 
                        key={msg.id} 
                        message={msg} 
                        currentUser={currentUser} 
                        contactAvatar={chat.avatar_url}
                        users={users}
                    />
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* AI Suggestions & Message Input */}
            { !isBotHandled && (
                <>
                    <AiSuggestions chatHistory={chatHistoryString} onSuggestionClick={(text) => setNewMessage(text)} />
                    <ChatInputFooter
                        value={newMessage}
                        onChange={setNewMessage}
                        onSend={handleSend}
                        currentUser={currentUser}
                        quickReplies={quickReplies}
                        users={users}
                    />
                </>
            )}
        </div>
    );
};