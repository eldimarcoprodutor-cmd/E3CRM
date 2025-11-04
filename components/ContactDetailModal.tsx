

import React, { useState, useEffect } from 'react';
import type { CrmContact, User } from '../types.ts';

interface ContactDetailModalProps {
    contact: CrmContact;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedContact: CrmContact) => void;
    currentUser: User;
    userMap: Map<string, User>;
    onDelete?: (contactId: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, isOpen, onClose, onSave, currentUser, userMap, onDelete }) => {
    const [formData, setFormData] = useState<CrmContact>(contact);

    useEffect(() => {
        setFormData(contact);
    }, [contact, isOpen]);

    if (!isOpen) return null;

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
    };

    const handleSaveDetails = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex-shrink-0 flex items-start justify-between p-4 border-b dark:border-gray-700">
                     <div className="flex items-center gap-4">
                        <img src={contact.avatar_url} alt={contact.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <h3 className="text-lg font-semibold text-text-main dark:text-white">{contact.name}</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400">{contact.email}</p>
                        </div>
                     </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Nome</label>
                                <input name="name" value={formData.name} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                            </div>
                                <div>
                                <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Email</label>
                                <input name="email" value={formData.email} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                            </div>
                                <div>
                                <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Telefone</label>
                                <input name="phone" value={formData.phone} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Valor (R$)</label>
                                <input name="value" type="number" value={formData.value} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="flex-shrink-0 flex justify-between items-center p-4 border-t dark:border-gray-700 mt-auto">
                    <div className="flex items-center gap-2">
                        {onDelete && currentUser.role === 'Gerente' && (
                            <button
                                onClick={() => {
                                    if (onDelete && window.confirm("Tem certeza que deseja remover este contato e todas as suas informações?")) {
                                        onDelete(contact.id);
                                        onClose(); // Close modal after initiating delete
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-status-error hover:bg-red-700 rounded-lg shadow-sm"
                            >
                                Remover Contato
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-text-main dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                        <button onClick={handleSaveDetails} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">Salvar Detalhes</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};