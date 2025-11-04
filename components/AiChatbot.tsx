import React, { useState, useRef, useEffect } from 'react';
import type { AiChatMessage, User } from '../types.ts';
import { ChatbotAiIcon } from './icons/ChatbotAiIcon.tsx';

interface AiChatbotProps {
    messages: AiChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    currentUser: User;
}

const LoadingBubble: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
    </div>
);


const AiChatbot: React.FC<AiChatbotProps> = ({ messages, onSendMessage, isLoading, currentUser }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <header className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
                 <ChatbotAiIcon className="w-8 h-8 text-primary"/>
                 <div>
                    <h1 className="text-xl font-bold text-text-main dark:text-white">Assistente IA</h1>
                    <p className="text-sm text-text-secondary dark:text-gray-400">Interaja com seus dados de CRM de forma inteligente.</p>
                 </div>
            </header>

            {/* Message Area */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <ChatbotAiIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-xl p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-text-main dark:text-gray-200 rounded-bl-none">
                            <p className="text-sm whitespace-pre-wrap">Olá! Sou seu assistente de IA. Posso buscar informações de contatos, adicionar notas e encontrar leads para você. Como posso ajudar?
                            <br/><br/>
                            Tente perguntar:
                            <br/>- "Quem é Carlos Pereira?"
                            <br/>- "Adicione uma nota para Mariana Costa: ligar amanhã."
                            <br/>- "Quais são meus leads quentes?"
                            </p>
                        </div>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <ChatbotAiIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-xl p-3 rounded-2xl ${
                            msg.sender === 'user' 
                                ? 'bg-primary text-white rounded-br-none' 
                                : 'bg-gray-100 dark:bg-gray-700 text-text-main dark:text-gray-200 rounded-bl-none'
                        }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && (
                            <img src={currentUser.avatar_url} alt="Você" className="w-8 h-8 rounded-full flex-shrink-0" />
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <ChatbotAiIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-xl p-3 rounded-2xl bg-gray-100 dark:bg-gray-700">
                           <LoadingBubble />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="p-4 border-t dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte sobre seus contatos..."
                        className="w-full p-3 pl-5 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 ring-primary text-sm"
                        disabled={isLoading}
                        aria-label="Sua mensagem"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="text-white bg-primary p-3 rounded-full hover:bg-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar mensagem"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default AiChatbot;