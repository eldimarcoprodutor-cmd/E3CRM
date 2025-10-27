import React, { useState, useEffect } from 'react';
import type { Chat, Message, User, QuickReply, CrmContact } from '../types';
import { ChatInterface } from './ChatInterface';
import { CrmIcon } from './icons/CrmIcon';

interface ActiveChatViewProps {
    chat: Chat;
    crmContact?: CrmContact;
    currentUser: User;
    onSendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
    users: User[];
    quickReplies: QuickReply[];
    onTakeOverChat: (chatId: string) => void;
    setCrmContacts: React.Dispatch<React.SetStateAction<CrmContact[]>>;
}

// Modal for viewing/editing contact details
const ContactDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    contact: CrmContact | null;
    onSave: (updatedContact: CrmContact) => void;
}> = ({ isOpen, onClose, contact, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<CrmContact | null>(contact);

    useEffect(() => {
        setFormData(contact);
        setIsEditing(false); // Reset edit mode when contact changes
    }, [contact]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(t => t.trim());
        setFormData(prev => prev ? { ...prev, tags } : null);
    };

    const handleSave = () => {
        if (formData) {
            onSave(formData);
        }
        setIsEditing(false);
        onClose();
    };
    
    const handleClose = () => {
      setIsEditing(false);
      onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">{isEditing ? 'Editando Contato' : 'Detalhes do Contato'}</h3>
                    <button onClick={handleClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Nome</label>
                        {isEditing ? (
                            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mt-1" />
                        ) : (
                            <p className="p-2 text-text-main dark:text-white">{formData.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Email</label>
                        {isEditing ? (
                            <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mt-1" />
                        ) : (
                            <p className="p-2 text-text-main dark:text-white">{formData.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Telefone</label>
                        {isEditing ? (
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mt-1" />
                        ) : (
                            <p className="p-2 text-text-main dark:text-white">{formData.phone}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Tags</label>
                        {isEditing ? (
                            <input value={formData.tags.join(', ')} onChange={handleTagsChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mt-1" />
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-2 p-2">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full text-text-secondary dark:text-gray-300">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-4 border-t dark:border-gray-700">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar Edição</button>
                            <button onClick={handleSave} className="px-4 py-2 text-white bg-primary rounded-lg">Salvar Alterações</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Fechar</button>
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-white bg-primary rounded-lg">Editar</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const stageColors: { [key: string]: string } = {
    'Contato': 'bg-primary',
    'Qualificação': 'bg-indigo-500',
    'Proposta': 'bg-status-warning',
    'Fechado': 'bg-status-success',
    'Perdido': 'bg-status-error',
};

const CrmDetails: React.FC<{ contact: CrmContact }> = ({ contact }) => {
    const owner = contact.owner_id ? `Atribuído a ID ${contact.owner_id}` : 'Não atribuído';
    return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-semibold text-text-main dark:text-gray-200">Informações de Contato</p>
                <p className="text-sm text-text-secondary dark:text-gray-400">Email: {contact.email}</p>
                <p className="text-sm text-text-secondary dark:text-gray-400">Telefone: {contact.phone}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-semibold text-text-main dark:text-gray-200">Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {contact.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-text-secondary dark:text-gray-300 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
             <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-semibold text-text-main dark:text-gray-200">Funil CRM</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className={`w-3 h-3 rounded-full ${stageColors[contact.pipeline_stage]}`}></span>
                   <span className="text-sm font-medium">{contact.pipeline_stage}</span>
                </div>
                 <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">{owner}</p>
            </div>
        </div>
    );
};

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({ chat, crmContact, currentUser, onSendMessage, users, quickReplies, onTakeOverChat, setCrmContacts }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleSaveContact = (updatedContact: CrmContact) => {
        setCrmContacts(currentContacts =>
            currentContacts.map(c => (c.id === updatedContact.id ? updatedContact : c))
        );
    };

    return (
        <div className="flex h-full bg-background-main dark:bg-gray-900">
            <div className="flex-grow flex flex-col">
                <ChatInterface
                    chat={chat}
                    currentUser={currentUser}
                    onSendMessage={onSendMessage}
                    users={users}
                    quickReplies={quickReplies}
                    onTakeOverChat={onTakeOverChat}
                />
            </div>
            <aside className="w-1/3 min-w-[300px] max-w-[400px] border-l dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <CrmIcon className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-bold">Detalhes do CRM</h3>
                    </div>
                     {crmContact && (
                        <button 
                            onClick={() => setIsEditModalOpen(true)} 
                            className="p-1 text-text-secondary rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary" 
                            title="Editar Contato"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
                {crmContact ? <CrmDetails contact={crmContact} /> : 
                    <div className="text-center text-text-secondary dark:text-gray-400 mt-8">
                        <p>Contato não encontrado no CRM.</p>
                        <button className="mt-2 text-sm text-primary hover:underline">Adicionar ao CRM</button>
                    </div>
                }
            </aside>
            {crmContact && (
                 <ContactDetailsModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    contact={crmContact}
                    onSave={handleSaveContact}
                />
            )}
        </div>
    );
};