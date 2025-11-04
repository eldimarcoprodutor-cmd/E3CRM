import React, { useState, useEffect } from 'react';
import type { KnowledgeBaseItem, ChatbotConfig } from '../types.ts';

// Define a modal component for adding/editing knowledge base items
const KnowledgeItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<KnowledgeBaseItem, 'id'> & { id?: number }) => void;
    itemToEdit: KnowledgeBaseItem | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        if (itemToEdit) {
            setQuestion(itemToEdit.question);
            setAnswer(itemToEdit.answer);
        } else {
            setQuestion('');
            setAnswer('');
        }
    }, [itemToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && answer.trim()) {
            onSave({
                id: itemToEdit?.id,
                question,
                answer
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4 text-text-main dark:text-white">
                    {itemToEdit ? 'Editar Item' : 'Adicionar Item à Base de Conhecimento'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Pergunta do Cliente</label>
                        <input
                            id="question"
                            type="text"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Ex: Quais são os planos disponíveis?"
                            required
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="answer" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Resposta do Chatbot</label>
                        <textarea
                            id="answer"
                            rows={4}
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Ex: Temos os planos Básico, Profissional e Enterprise..."
                            required
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface ChatbotProps {
    knowledgeBase: KnowledgeBaseItem[];
    setKnowledgeBase: (kb: KnowledgeBaseItem[]) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ knowledgeBase, setKnowledgeBase }) => {
    const [tone, setTone] = useState('Amigável e prestativo');
    const [testInput, setTestInput] = useState('');
    const [testResponse, setTestResponse] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testInput) return;
        setIsTesting(true);
        setTestResponse('');
        const config: ChatbotConfig = { tone, knowledgeBase };
        try {
            const { generateChatbotResponse } = await import('../services/geminiService.ts');
            const result = await generateChatbotResponse(testInput, config);
            setTestResponse(result.response + (result.requiresHandoff ? ' (HANDOFF REQUERIDO)' : ''));
        } catch (error) {
            setTestResponse('Ocorreu um erro ao testar o bot.');
        } finally {
            setIsTesting(false);
        }
    };
    
    const handleOpenModal = (item: KnowledgeBaseItem | null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleSaveItem = async (item: Omit<KnowledgeBaseItem, 'id'> & { id?: number }) => {
        const { supabase } = await import('../services/supabase.ts');
        if (item.id) { // Editing existing item
            const { data, error } = await supabase
                .from('knowledge_base')
                .update({ question: item.question, answer: item.answer })
                .eq('id', item.id)
                .select()
                .single();

            if (data && !error) {
                setKnowledgeBase(knowledgeBase.map(kb => kb.id === item.id ? data : kb));
            }
        } else { // Adding new item
            const { data, error } = await supabase
                .from('knowledge_base')
                .insert([{ question: item.question, answer: item.answer }])
                .select()
                .single();
                
            if (data && !error) {
                setKnowledgeBase([...knowledgeBase, data]);
            }
        }
    };
    
    const handleDeleteItem = async (itemId: number) => {
        if(window.confirm("Tem certeza que deseja remover este item?")) {
            const { supabase } = await import('../services/supabase.ts');
            const { error } = await supabase.from('knowledge_base').delete().eq('id', itemId);
            if (!error) {
                setKnowledgeBase(knowledgeBase.filter(item => item.id !== itemId));
            }
        }
    }


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Configurações do Chatbot IA</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Tom de Voz</h2>
                        <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">Defina como o bot deve se comunicar com os clientes.</p>
                        <input
                            type="text"
                            value={tone}
                            onChange={e => setTone(e.target.value)}
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-text-main dark:text-white">Base de Conhecimento</h2>
                            <button onClick={() => handleOpenModal(null)} className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">Adicionar Item</button>
                        </div>
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                            {knowledgeBase.length > 0 ? knowledgeBase.map(item => (
                                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">P: {item.question}</p>
                                    <p className="text-sm text-text-secondary dark:text-gray-400">R: {item.answer}</p>
                                    <div className="flex justify-end gap-3 mt-2 text-xs">
                                        <button onClick={() => handleOpenModal(item)} className="font-medium text-primary dark:text-primary hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="font-medium text-status-error dark:text-status-error hover:underline">Remover</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-text-secondary dark:text-gray-400 py-4">Nenhum item na base de conhecimento.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Test Area */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Testar Chatbot</h2>
                    <form onSubmit={handleTest} className="space-y-4">
                        <textarea
                            rows={3}
                            value={testInput}
                            onChange={e => setTestInput(e.target.value)}
                            placeholder="Digite uma pergunta do cliente..."
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            disabled={isTesting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/70"
                        >
                            {isTesting ? 'Pensando...' : 'Enviar Teste'}
                        </button>
                    </form>
                    {testResponse && (
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Resposta do Bot:</p>
                            <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{testResponse}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <KnowledgeItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                itemToEdit={editingItem}
            />
        </div>
    );
};

export default Chatbot;