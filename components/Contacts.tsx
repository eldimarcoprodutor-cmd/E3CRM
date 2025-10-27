import React, { useState, useEffect } from 'react';
import type { CrmContact, User } from '../types.ts';

interface ContactsProps {
    contacts: CrmContact[];
    setContacts: React.Dispatch<React.SetStateAction<CrmContact[]>>;
    currentUser: User;
    onDeleteContact: (contactId: string) => void;
}

// Modal for adding a new contact
const AddContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (contact: CrmContact) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [tags, setTags] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newContact: CrmContact = {
            id: `contact-${Date.now()}`,
            name,
            email,
            phone,
            avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            pipeline_stage: 'Contato',
            last_interaction: new Date().toISOString().split('T')[0],
            owner_id: '1', // Default to manager
            value: 0,
            temperature: 'Frio',
            next_action_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            lead_source: 'Manual',
            notes: [],
        };
        onAdd(newContact);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-text-main dark:text-white">Adicionar Novo Contato</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <input type="text" placeholder="Tags (separadas por vírgula)" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg">Adicionar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for viewing/editing contact details
const ContactDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    contact: CrmContact | null;
    onSave: (updatedContact: CrmContact) => void;
    currentUser: User;
    onDelete: (contactId: string) => void;
}> = ({ isOpen, onClose, contact, onSave, currentUser, onDelete }) => {
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
    
    const handleDeleteClick = () => {
        if (formData) {
            onDelete(formData.id);
            onClose();
        }
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

                <div className="flex justify-between items-center pt-4 mt-4 border-t dark:border-gray-700">
                     <div>
                        {currentUser.role === 'Gerente' && !isEditing && (
                            <button onClick={handleDeleteClick} className="px-4 py-2 text-sm font-medium text-status-error bg-status-error/10 rounded-lg hover:bg-status-error/20">
                                Remover Contato
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                                <button onClick={handleSave} className="px-4 py-2 text-white bg-primary rounded-lg">Salvar</button>
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
        </div>
    );
};

export const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts, currentUser, onDeleteContact }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddContact = (newContact: CrmContact) => {
        setContacts(currentContacts => [newContact, ...currentContacts]);
    };

    const handleSaveContact = (updatedContact: CrmContact) => {
        setContacts(currentContacts =>
            currentContacts.map(c => (c.id === updatedContact.id ? updatedContact : c))
        );
    };

    const handleOpenDetails = (contact: CrmContact) => {
        setSelectedContact(contact);
    };

    const handleCloseDetails = () => {
        setSelectedContact(null);
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Gerenciador de Contatos</h1>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        placeholder="Pesquisar contatos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 bg-white dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm w-64" 
                    />
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                        Adicionar Contato
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Nome</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Telefone</th>
                                <th scope="col" className="px-6 py-3">Tags</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.map(contact => (
                                <tr key={contact.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={contact.avatar_url} alt={contact.name} className="w-10 h-10 rounded-full" />
                                            <span>{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{contact.email}</td>
                                    <td className="px-6 py-4">{contact.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-text-secondary dark:text-gray-300 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleOpenDetails(contact)} className="font-medium text-primary dark:text-primary hover:underline">Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddContactModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddContact}
            />

            <ContactDetailsModal
                isOpen={!!selectedContact}
                onClose={handleCloseDetails}
                contact={selectedContact}
                onSave={handleSaveContact}
                currentUser={currentUser}
                onDelete={onDeleteContact}
            />
        </div>
    );
};