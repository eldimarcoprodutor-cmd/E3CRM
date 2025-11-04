import React, { useState, useMemo } from 'react';
import type { CrmContact, User } from '../types.ts';
import { EmailIcon } from './icons/EmailIcon.tsx';
import { ContactDetailModal } from './ContactDetailModal.tsx';


interface CrmBoardProps {
    contacts: CrmContact[];
    onUpdateContact: (contact: CrmContact) => void;
    onAddContact: (contact: Omit<CrmContact, 'id'>) => void;
    users: User[];
    currentUser: User;
    onNavigateToChat: (contact: CrmContact) => void;
    onSendEmail: (contact: CrmContact) => void;
}

const pipelineStages: CrmContact['pipeline_stage'][] = ['Contato', 'Qualificação', 'Proposta', 'Fechado', 'Perdido'];

const stageColors = {
    'Contato': 'bg-primary',
    'Qualificação': 'bg-indigo-500',
    'Proposta': 'bg-status-warning',
    'Fechado': 'bg-status-success',
    'Perdido': 'bg-status-error',
};

const temperatureColors = {
    'Quente': 'bg-status-error',
    'Morno': 'bg-status-warning',
    'Frio': 'bg-primary/70',
};

interface CardProps {
    contact: CrmContact;
    owner?: User;
    userMap: Map<string, User>;
    isBeingDragged: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, contactId: string) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onOpenDetails: (contact: CrmContact) => void;
    onNavigateToChat: (contact: CrmContact) => void;
    onSendEmail: (contact: CrmContact) => void;
}


const Card: React.FC<CardProps> = ({ contact, owner, userMap, isBeingDragged, onDragStart, onDragEnd, onOpenDetails, onNavigateToChat, onSendEmail }) => {
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const actionDate = new Date(contact.next_action_date + 'T00:00:00');

    const isOverdue = actionDate < today && contact.pipeline_stage !== 'Fechado' && contact.pipeline_stage !== 'Perdido';

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation(); // Prevent card from being dragged when clicking a button
        action();
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, contact.id)}
            onDragEnd={onDragEnd}
            onClick={() => onOpenDetails(contact)}
            className={`p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer active:cursor-grabbing border-l-4 border-transparent hover:border-primary ${isBeingDragged ? 'opacity-40' : ''}`}
            id={`card-${contact.id}`}
        >
            {/* Top Section: Name, Temp, Value */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-grow min-w-0">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${temperatureColors[contact.temperature]}`} title={`Temperatura: ${contact.temperature}`}></span>
                    <p className="font-semibold text-text-main dark:text-white truncate" title={contact.name}>{contact.name}</p>
                </div>
                <div className="flex items-center gap-1 text-status-success dark:text-status-success flex-shrink-0 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="font-bold text-lg">
                        R$ {contact.value.toLocaleString('pt-BR')}
                    </span>
                </div>
            </div>

            {/* Next Action */}
            <div className={`flex items-center gap-2 mb-3 text-sm ${isOverdue ? 'text-status-error dark:text-status-error font-semibold' : 'text-text-secondary dark:text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span title={isOverdue ? 'Ação atrasada!' : ''}>
                    Próxima Ação: {new Date(contact.next_action_date + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                </span>
            </div>

            {/* Tags Section */}
            <div className="flex flex-wrap gap-1 mb-3">
                {contact.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-text-secondary dark:bg-gray-700 dark:text-gray-200">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Bottom Section: Source, Actions, Owner */}
            <div className="mt-3 pt-3 border-t border-border-neutral dark:border-gray-700 flex justify-between items-center">
                 {/* Lead Source */}
                <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-gray-400" title={`Fonte: ${contact.lead_source}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    <span className="truncate max-w-[80px]">{contact.lead_source}</span>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center space-x-3 text-gray-400 dark:text-gray-500">
                    <button onClick={(e) => handleActionClick(e, () => onSendEmail(contact))} className="hover:text-blue-500 transition-colors" title="Enviar Email">
                        <EmailIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => handleActionClick(e, () => onNavigateToChat(contact))} className="hover:text-status-success transition-colors" title="Enviar Mensagem">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.225 4.485 4.625-1.217z" />
                        </svg>
                    </button>
                    <button onClick={(e) => handleActionClick(e, () => onOpenDetails(contact))} className="relative hover:text-primary transition-colors" title="Ver Detalhes">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </button>
                </div>
                
                {/* Owner Avatar */}
                {owner && (
                    <div title={`Responsável: ${owner.name}`} className="flex items-center">
                        <img src={owner.avatar_url} alt={owner.name} className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800"/>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ColumnProps {
    stage: CrmContact['pipeline_stage'];
    contacts: CrmContact[];
    users: User[];
    userMap: Map<string, User>;
    isDragOver: boolean;
    draggedItemId: string | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, contactId: string) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stage: CrmContact['pipeline_stage']) => void;
    onOpenDetails: (contact: CrmContact) => void;
    onNavigateToChat: (contact: CrmContact) => void;
    onSendEmail: (contact: CrmContact) => void;
}


const Column: React.FC<ColumnProps> = ({ stage, contacts, users, userMap, isDragOver, draggedItemId, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onOpenDetails, onNavigateToChat, onSendEmail }) => {
    const totalValue = useMemo(() => contacts.reduce((sum, contact) => sum + contact.value, 0), [contacts]);

    return (
        <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, stage)}
            className={`w-80 bg-background-main/80 dark:bg-gray-900/50 rounded-xl p-3 flex-shrink-0 transition-colors duration-300 ${isDragOver ? 'bg-primary-light dark:bg-primary/20' : ''}`}
        >
            <div className="flex flex-col mb-4 px-1">
                <div className="flex justify-between items-center">
                    <h3 className={`font-semibold text-text-main dark:text-gray-200 flex items-center gap-2`}>
                       <span className={`w-3 h-3 rounded-full ${stageColors[stage]}`}></span>
                       {stage}
                    </h3>
                    <span className="text-sm text-text-secondary dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">{contacts.length}</span>
                </div>
                <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mt-1 ml-5">
                    R$ {totalValue.toLocaleString('pt-BR')}
                </p>
            </div>
            <div className="h-full overflow-y-auto pb-4" style={{ minHeight: '200px' }}>
                {contacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      contact={contact} 
                      owner={userMap.get(contact.owner_id)} 
                      userMap={userMap} 
                      onDragStart={onDragStart} 
                      onDragEnd={onDragEnd} 
                      onOpenDetails={onOpenDetails} 
                      onNavigateToChat={onNavigateToChat} 
                      onSendEmail={onSendEmail}
                      isBeingDragged={draggedItemId === contact.id}
                    />
                ))}
            </div>
        </div>
    );
};

const AddOpportunityModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (contact: Omit<CrmContact, 'id'>) => void;
    users: User[];
}> = ({ isOpen, onClose, onAdd, users }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [value, setValue] = useState(0);
    const [stage, setStage] = useState<CrmContact['pipeline_stage']>('Contato');
    const [ownerId, setOwnerId] = useState(users[0]?.id || '');
    const [temperature, setTemperature] = useState<CrmContact['temperature']>('Morno');
    const [nextActionDate, setNextActionDate] = useState('');
    const [leadSource, setLeadSource] = useState('');


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newContact: Omit<CrmContact, 'id'> = {
            name, email, phone, value,
            pipeline_stage: stage,
            owner_id: ownerId,
            tags: [],
            avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`,
            last_interaction: new Date().toISOString().split('T')[0],
            temperature,
            next_action_date: nextActionDate,
            lead_source: leadSource,
        };
        onAdd(newContact);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">Adicionar Nova Oportunidade</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome do Contato" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    <input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    <input type="number" placeholder="Valor (R$)" value={value} onChange={e => setValue(Number(e.target.value))} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    <input type="text" placeholder="Fonte do Lead" value={leadSource} onChange={e => setLeadSource(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    <div className="grid grid-cols-2 gap-4">
                        <select value={stage} onChange={e => setStage(e.target.value as CrmContact['pipeline_stage'])} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg">
                            {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                         <select value={temperature} onChange={e => setTemperature(e.target.value as CrmContact['temperature'])} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg">
                            <option value="Frio">Frio</option>
                            <option value="Morno">Morno</option>
                            <option value="Quente">Quente</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-text-secondary dark:text-gray-400">Data da Próxima Ação</label>
                        <input type="date" value={nextActionDate} onChange={e => setNextActionDate(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    </div>
                    <select value={ownerId} onChange={e => setOwnerId(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg">
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">Adicionar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CrmBoard: React.FC<CrmBoardProps> = ({ contacts, onUpdateContact, onAddContact, users, currentUser, onNavigateToChat, onSendEmail }) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<CrmContact['pipeline_stage'] | null>(null);
    const [isAddOppModalOpen, setAddOppModalOpen] = useState(false);
    const [detailsModalTarget, setDetailsModalTarget] = useState<CrmContact | null>(null);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    // Filtering State
    const [ownerFilter, setOwnerFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [temperatureFilter, setTemperatureFilter] = useState('');
    const allTags = useMemo(() => [...new Set(contacts.flatMap(c => c.tags))], [contacts]);


    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const ownerMatch = !ownerFilter || contact.owner_id === ownerFilter;
            const tagMatch = !tagFilter || contact.tags.includes(tagFilter);
            const temperatureMatch = !temperatureFilter || contact.temperature === temperatureFilter;
            return ownerMatch && tagMatch && temperatureMatch;
        });
    }, [contacts, ownerFilter, tagFilter, temperatureFilter]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, contactId: string) => {
        setDraggedItemId(contactId);
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragEnd = () => {
        setDraggedItemId(null);
        setDragOverStage(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: CrmContact['pipeline_stage']) => {
        e.preventDefault();
        setDragOverStage(stage);
    };

    const handleDragLeave = () => setDragOverStage(null);
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStage: CrmContact['pipeline_stage']) => {
        e.preventDefault();
        setDragOverStage(null);
    
        if (currentUser.role === 'Atendente' && (newStage === 'Fechado' || newStage === 'Perdido')) {
            alert('Apenas gerentes podem mover contatos para "Fechado" ou "Perdido".');
            return;
        }
    
        if (draggedItemId) {
            const contactToMove = contacts.find(c => c.id === draggedItemId);
            if (!contactToMove || contactToMove.pipeline_stage === newStage) return;
    
            const updatedContact = {
                ...contactToMove,
                pipeline_stage: newStage,
                last_interaction: new Date().toISOString().split('T')[0],
            };

            onUpdateContact(updatedContact as CrmContact);
        }
    };

    const handleUpdateContact = (updatedContact: CrmContact) => {
        onUpdateContact(updatedContact);
        setDetailsModalTarget(null); // Close modal
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Funil CRM</h1>
                {currentUser.role === 'Gerente' && (
                    <button 
                        onClick={() => setAddOppModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Adicionar Oportunidade
                    </button>
                )}
            </div>
             {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm mb-6 flex flex-wrap items-center gap-4">
                 <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="p-2 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg text-sm">
                    <option value="">Todos Responsáveis</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="p-2 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg text-sm">
                    <option value="">Todas as Tags</option>
                    {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={temperatureFilter} onChange={e => setTemperatureFilter(e.target.value)} className="p-2 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg text-sm">
                    <option value="">Toda Temperatura</option>
                    <option value="Quente">Quente</option>
                    <option value="Morno">Morno</option>
                    <option value="Frio">Frio</option>
                </select>
                <button onClick={() => {setOwnerFilter(''); setTagFilter(''); setTemperatureFilter('');}} className="text-sm text-text-secondary dark:text-gray-400 hover:text-primary">Limpar Filtros</button>
            </div>

            <div className="flex space-x-6 overflow-x-auto pb-4">
                {pipelineStages.map(stage => {
                    const stageContacts = filteredContacts.filter(c => c.pipeline_stage === stage);
                    return (
                        <Column 
                            key={stage} 
                            stage={stage} 
                            contacts={stageContacts}
                            users={users}
                            userMap={userMap}
                            isDragOver={dragOverStage === stage && draggedItemId !== null}
                            draggedItemId={draggedItemId}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, stage)}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onOpenDetails={setDetailsModalTarget}
                            onNavigateToChat={onNavigateToChat}
                            onSendEmail={onSendEmail}
                        />
                    );
                })}
            </div>
            <AddOpportunityModal 
                isOpen={isAddOppModalOpen} 
                onClose={() => setAddOppModalOpen(false)} 
                onAdd={onAddContact}
                users={users}
            />
            {detailsModalTarget && (
                <ContactDetailModal
                    contact={detailsModalTarget}
                    isOpen={!!detailsModalTarget}
                    onClose={() => setDetailsModalTarget(null)}
                    onSave={handleUpdateContact}
                    currentUser={currentUser}
                    userMap={userMap}
                />
            )}
        </div>
    );
};

export default CrmBoard;