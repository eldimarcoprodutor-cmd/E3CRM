import React, { useState, useEffect } from 'react';
import type { QuickReply } from '../types.ts';

// Modal for adding/editing quick replies
const QuickReplyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (reply: Omit<QuickReply, 'id'> & { id?: number }) => void;
    replyToEdit: QuickReply | null;
}> = ({ isOpen, onClose, onSave, replyToEdit }) => {
    const [shortcut, setShortcut] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (replyToEdit) {
            setShortcut(replyToEdit.shortcut);
            setMessage(replyToEdit.message);
        } else {
            setShortcut('');
            setMessage('');
        }
    }, [replyToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (shortcut.trim() && message.trim()) {
            onSave({
                id: replyToEdit?.id,
                shortcut: shortcut.startsWith('/') ? shortcut : `/${shortcut}`,
                message
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4 text-text-main dark:text-white">
                    {replyToEdit ? 'Editar Resposta Rápida' : 'Adicionar Resposta Rápida'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="shortcut" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Atalho</label>
                        <input
                            id="shortcut"
                            type="text"
                            value={shortcut}
                            onChange={e => setShortcut(e.target.value)}
                            placeholder="Ex: /saudacao"
                            required
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Mensagem</label>
                        <textarea
                            id="message"
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Ex: Olá! Como posso ajudar?"
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

interface SettingsProps {
    quickReplies: QuickReply[];
    setQuickReplies: (qr: QuickReply[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ quickReplies, setQuickReplies }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReply, setEditingReply] = useState<QuickReply | null>(null);

    const handleOpenModal = (reply: QuickReply | null) => {
        setEditingReply(reply);
        setIsModalOpen(true);
    };

    const handleSaveReply = async (reply: Omit<QuickReply, 'id'> & { id?: number }) => {
        const { supabase } = await import('../services/supabase.ts');
        if (reply.id) { // Editing
            const { data, error } = await supabase
                .from('quick_replies')
                .update({ shortcut: reply.shortcut, message: reply.message })
                .eq('id', reply.id)
                .select()
                .single();
            if (data && !error) {
                setQuickReplies(quickReplies.map(qr => qr.id === reply.id ? data : qr));
            }
        } else { // Adding
            const { data, error } = await supabase
                .from('quick_replies')
                .insert([{ shortcut: reply.shortcut, message: reply.message }])
                .select()
                .single();
            if (data && !error) {
                setQuickReplies([data, ...quickReplies]);
            }
        }
        setIsModalOpen(false);
    };

    const handleDeleteReply = async (replyId: number) => {
        if (window.confirm("Tem certeza que deseja remover esta resposta rápida?")) {
            const { supabase } = await import('../services/supabase.ts');
            const { error } = await supabase.from('quick_replies').delete().eq('id', replyId);
            if (!error) {
                setQuickReplies(quickReplies.filter(qr => qr.id !== replyId));
            }
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Configurações Gerais</h1>

            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quick Replies */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-text-main dark:text-white">Respostas Rápidas</h2>
                        <button onClick={() => handleOpenModal(null)} className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">Adicionar</button>
                    </div>
                     <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {quickReplies.map(qr => (
                            <div key={qr.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-mono text-xs font-semibold text-primary">{qr.shortcut}</p>
                                        <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">{qr.message}</p>
                                    </div>
                                     <div className="flex gap-3 text-xs flex-shrink-0 ml-4">
                                        <button onClick={() => handleOpenModal(qr)} className="font-medium text-primary dark:text-primary hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteReply(qr.id)} className="font-medium text-status-error dark:text-status-error hover:underline">Remover</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Notificações</h2>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary dark:text-gray-300">Notificações no desktop</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 dark:peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            <QuickReplyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveReply}
                replyToEdit={editingReply}
            />
        </div>
    );
};

export default Settings;