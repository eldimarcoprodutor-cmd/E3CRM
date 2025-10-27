import React, { useState, useRef, useEffect, useMemo } from 'react';

interface BroadcastHistoryItem {
    id: number;
    target: string;
    message: string;
    sentAt: string;
    stats: {
        sent: number;
        delivered: number;
        read: number;
    };
}

const initialHistory: BroadcastHistoryItem[] = [
    { id: 1, target: 'TAG: cliente-vip', message: '✨ Oferta exclusiva para você, VIP! Use o cupom VIP20 para 20% OFF.', sentAt: 'Ontem, 15:30', stats: { sent: 50, delivered: 48, read: 35 } },
    { id: 2, target: 'Todos os Contatos', message: '📣 Nosso horário de atendimento mudará na próxima semana. Confira!', sentAt: '2d atrás', stats: { sent: 1250, delivered: 1220, read: 850 } },
];

// Mock data for tags and contacts
const availableTags: string[] = ['cliente-vip', 'lead-frio', 'e-commerce', 'B2B', 'newsletter', 'parceria'];
interface Contact {
  id: number;
  name: string;
  tags: string[];
}
const allContacts: Contact[] = [
  { id: 1, name: 'Carlos Pereira', tags: ['cliente-vip', 'e-commerce'] },
  { id: 2, name: 'Mariana Costa', tags: ['e-commerce', 'newsletter'] },
  { id: 3, name: 'Tech Solutions', tags: ['B2B', 'parceria'] },
  { id: 4, name: 'Inova Digital', tags: ['cliente-vip', 'B2B'] },
  { id: 5, name: 'João Almeida', tags: ['lead-frio'] },
  { id: 6, name: 'Global Corp', tags: ['B2B'] },
  { id: 7, name: 'Ana Silva (Lead)', tags: ['newsletter', 'lead-frio'] },
];


export const Broadcast: React.FC = () => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<BroadcastHistoryItem[]>(initialHistory);
    const [isTagDropdownOpen, setTagDropdownOpen] = useState(false);
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setTagDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleTagSelect = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };
    
    const handleTagRemove = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const filteredContacts = useMemo(() => {
        if (selectedTags.length === 0) return [];
        return allContacts.filter(contact => 
            selectedTags.some(selectedTag => contact.tags.includes(selectedTag))
        );
    }, [selectedTags]);

    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTags.length === 0 || !message) {
            alert('Por favor, selecione ao menos uma tag e escreva uma mensagem.');
            return;
        }
        const newBroadcast: BroadcastHistoryItem = {
            id: history.length + 1,
            target: `TAGs: ${selectedTags.join(', ')}`,
            message,
            sentAt: 'Agora',
            stats: { sent: filteredContacts.length, delivered: 0, read: 0 } // Simulating
        };
        setHistory([newBroadcast, ...history]);
        setSelectedTags([]);
        setMessage('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Broadcast de Mensagens</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Broadcast Form */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Criar Novo Broadcast</h2>
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div>
                            <label htmlFor="target" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Público-Alvo (Tags)</label>
                            <div className="relative" ref={dropdownRef}>
                                <div className="w-full flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg cursor-pointer" onClick={() => setTagDropdownOpen(!isTagDropdownOpen)}>
                                    {selectedTags.length > 0 ? selectedTags.map(tag => (
                                        <span key={tag} className="flex items-center px-2 py-1 text-xs bg-primary-light dark:bg-primary/20 text-primary-dark dark:text-primary-light rounded-full">
                                            {tag}
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleTagRemove(tag); }} className="ml-2 text-primary hover:text-primary-dark">
                                                &#x2715;
                                            </button>
                                        </span>
                                    )) : <span className="text-gray-400">Selecione as tags...</span>}
                                </div>
                                {isTagDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-border-neutral dark:border-gray-600 rounded-lg shadow-lg">
                                        {availableTags.filter(t => !selectedTags.includes(t)).map(tag => (
                                            <div key={tag} onClick={() => handleTagSelect(tag)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedTags.length > 0 && (
                            <button type="button" onClick={() => setPreviewModalOpen(true)} className="w-full text-sm text-primary dark:text-primary/90 hover:underline">
                                Visualizar {filteredContacts.length} contato(s) selecionado(s)
                            </button>
                        )}

                        <div>
                            <label htmlFor="broadcast-message" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Mensagem</label>
                            <textarea
                                id="broadcast-message"
                                rows={8}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Escreva sua mensagem... Use {{nome}} para personalizar."
                                className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Enviar Broadcast
                        </button>
                    </form>
                </div>

                {/* Broadcast History */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Histórico de Envios</h2>
                    <div className="space-y-4">
                        {history.map(item => (
                            <div key={item.id} className="p-4 border rounded-lg border-border-neutral dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-text-main dark:text-white">Para: <span className="font-normal bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1 rounded">{item.target}</span></p>
                                        <p className="mt-2 text-sm text-text-secondary dark:text-gray-300">{item.message}</p>
                                    </div>
                                    <span className="text-xs text-text-secondary dark:text-gray-400 flex-shrink-0 ml-4">{item.sentAt}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary dark:text-gray-400 border-t border-border-neutral dark:border-gray-700 pt-2">
                                    <span><span className="font-bold">{item.stats.sent}</span> Enviados</span>
                                    <span><span className="font-bold">{item.stats.delivered}</span> Entregues</span>
                                    <span><span className="font-bold">{item.stats.read}</span> Lidos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Contatos Selecionados ({filteredContacts.length})</h3>
                            <button onClick={() => setPreviewModalOpen(false)} className="text-text-secondary hover:text-text-main dark:hover:text-white">&times;</button>
                        </div>
                        <div className="overflow-y-auto">
                            <ul className="space-y-2">
                                {filteredContacts.map(contact => (
                                    <li key={contact.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        {contact.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};