import React, { useState, useRef, useEffect } from 'react';
import type { Chat, Message, User, QuickReply, Sentiment } from '../types.ts';
import { ChatMessageComponent } from './ChatMessageComponent.tsx';
import { ChatInputFooter } from './ChatInputFooter.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { SentimentIndicator } from './SentimentIndicator.tsx';

interface ChatInterfaceProps {
    chat: Chat;
    currentUser: User;
    onSendMessage: (chatId: string, messageText: string) => void;
    users: User[];
    quickReplies: QuickReply[];
    onTakeOverChat: (chatId: string) => void;
}

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
    const [sentiment, setSentiment] = useState<Sentiment>('Analisando...');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, [chat.messages]);
    
    useEffect(() => {
        const chatHistoryString = chat.messages
            .filter(m => m.type === 'text' && m.sender !== currentUser.id)
            .map(m => `Cliente: ${m.text}`).join('\n');

        if (!chatHistoryString) return;

        const performSentimentAnalysis = async () => {
            setSentiment('Analisando...');
            const { analyzeSentiment } = await import('../services/geminiService.ts');
            const result = await analyzeSentiment(chatHistoryString);
            setSentiment(result);
        };
        const timer = setTimeout(performSentimentAnalysis, 1000);
        return () => clearTimeout(timer);
    }, [chat.messages, currentUser.id]);

    const handleSend = (text: string) => {
        if (text.trim()) {
            onSendMessage(chat.id, text);
        }
    };
    
    const isBotHandled = chat.handled_by === 'bot';

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Chat Header */}
            <header className="flex-shrink-0 flex items-center p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800">
                <img src={chat.avatar_url} alt={chat.contact_name} className="w-10 h-10 rounded-full" />
                <div className="ml-4">
                    <p className="font-semibold text-text-main dark:text-gray-100">{chat.contact_name}</p>
                    <p className="text-xs text-status-success">Online</p>
                </div>
                 <div className="ml-auto">
                    <SentimentIndicator sentiment={sentiment} />
                </div>
            </header>
            
            {isBotHandled && <AiHandoffBanner onTakeOver={() => onTakeOverChat(chat.id)} />}

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative">
                <div className="wa-chat-bg-pattern"></div>
                {chat.messages.map((msg) => (
                    <ChatMessageComponent 
                        key={msg.id} 
                        message={msg} 
                        currentUser={currentUser} 
                    />
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Message Input */}
             <footer className="flex-shrink-0 bg-[#f0f2f5] dark:bg-[#202c33] p-3">
                <ChatInputFooter
                    onSend={handleSend}
                    currentUser={currentUser}
                    quickReplies={quickReplies}
                    users={users}
                />
            </footer>
        </div>
    );
};