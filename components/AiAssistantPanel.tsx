import React, { useState, useRef, useEffect } from 'react';
import type { AgentAiMessage, User, Chat, CrmContact } from '../types.ts';

interface AiAssistantPanelProps {
    currentUser: User;
    currentChat: Chat;
    crmContacts: CrmContact[];
    onContactsUpdate: (updater: (contacts: CrmContact[]) => CrmContact[]) => void;
}

const LoadingBubble: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
    </div>
);

const AiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.456-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);


export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ currentUser, currentChat, crmContacts, onContactsUpdate }) => {
    const [messages, setMessages] = useState<AgentAiMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const addMessage = (sender: 'user' | 'bot', text: string, isActionResponse = false) => {
        setMessages(prev => [...prev, { id: `agent-ai-${Date.now()}`, sender, text, isActionResponse }]);
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            const userMessage = input;
            setInput('');
            addMessage('user', userMessage);
            setIsLoading(true);

            try {
                const { askAiChatbot } = await import('../services/geminiService.ts');
                const response = await askAiChatbot(userMessage, crmContacts, currentUser);
                addMessage('bot', response.text);
                if (response.updatedContacts) {
                    onContactsUpdate(() => response.updatedContacts!);
                }
            } catch (error) {
                console.error("AI Assistant Error:", error);
                addMessage('bot', 'Desculpe, ocorreu um erro. Tente novamente.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleQuickAction = async (action: 'summary' | 'next_action') => {
        setIsLoading(true);
        const chatHistory = currentChat.messages.map(m => `${m.sender === currentUser.id ? 'Atendente' : 'Cliente'}: ${m.text}`).join('\n');
        
        try {
            const { generateChatSummary, suggestNextAction } = await import('../services/geminiService.ts');
            let responseText = '';
            if (action === 'summary') {
                responseText = await generateChatSummary(chatHistory);
            } else {
                responseText = await suggestNextAction(chatHistory);
            }
            addMessage('bot', responseText, true);
        } catch (error) {
            console.error(`Error with quick action ${action}:`, error);
            addMessage('bot', 'Não foi possível completar a ação.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="w-1/3 min-w-[300px] max-w-[400px] border-l dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
            {/* Header */}
            <header className="p-4 border-b dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
                <AiIcon className="w-6 h-6 text-primary"/>
                <h3 className="text-lg font-bold">Assistente IA</h3>
            </header>
            
            {/* Quick Actions */}
            <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                 <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2">Ações Rápidas</p>
                 <div className="flex gap-2">
                    <button onClick={() => handleQuickAction('summary')} disabled={isLoading} className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">Resumir Conversa</button>
                    <button onClick={() => handleQuickAction('next_action')} disabled={isLoading} className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">Sugerir Ação</button>
                 </div>
            </div>

            {/* Message Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.length === 0 && !isLoading && (
                     <div className="text-center text-sm text-text-secondary dark:text-gray-400 p-4">
                         Faça uma pergunta sobre este contato ou use as ações rápidas.
                     </div>
                 )}

                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && (
                             <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <AiIcon className="w-4 h-4 text-white" />
                            </div>
                        )}
                         <div className={`max-w-xs p-2.5 rounded-xl ${
                            msg.sender === 'user' 
                                ? 'bg-primary-light dark:bg-primary/20 text-text-main dark:text-white rounded-br-none' 
                                : `bg-gray-100 dark:bg-gray-700 text-text-main dark:text-gray-200 rounded-bl-none ${msg.isActionResponse ? 'border border-dashed border-primary dark:border-primary/50' : ''}`
                        }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-start gap-2.5 justify-start">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <AiIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700">
                           <LoadingBubble />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Footer */}
            <footer className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                 <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte ao assistente..."
                        className="w-full p-2 pl-4 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 ring-primary text-sm"
                        disabled={isLoading}
                        aria-label="Mensagem para o assistente"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="text-white bg-primary p-2 rounded-full hover:bg-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </form>
            </footer>
        </aside>
    );
};