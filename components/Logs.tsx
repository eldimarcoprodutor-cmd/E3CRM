import React, { useState, useMemo } from 'react';
import type { LogEntry, User } from '../types.ts';

// Mock data for logs
const initialLogs: LogEntry[] = [
    { id: 'log1', userId: '1', action: 'Broadcast Enviado', details: 'Enviado para a TAG "cliente-vip"', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'log2', userId: '2', action: 'Contato Atualizado', details: 'Carlos Pereira movido para "Fechado"', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'log3', userId: '3', action: 'Mensagem Enviada', details: 'Respondido para João Almeida', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log4', userId: '1', action: 'Membro Removido', details: 'Usuário "Pedro" foi removido da equipe', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log5', userId: '2', action: 'Contato Adicionado', details: 'Novo contato "Inova Digital" criado', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log6', userId: '3', action: 'Contato Atualizado', details: 'Mariana Costa movido para "Proposta"', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
];

const actionColors: Record<LogEntry['action'], string> = {
    'Contato Adicionado': 'bg-status-success/20 text-green-800 dark:bg-status-success/20 dark:text-green-200',
    'Contato Atualizado': 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light',
    'Mensagem Enviada': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Broadcast Enviado': 'bg-status-warning/20 text-yellow-800 dark:bg-status-warning/20 dark:text-yellow-200',
    'Membro Removido': 'bg-status-error/20 text-red-800 dark:bg-status-error/20 dark:text-red-200',
};

interface LogsProps {
    users: User[];
}

const Logs: React.FC<LogsProps> = ({ users }) => {
    const [logs] = useState<LogEntry[]>(initialLogs);
    const [userFilter, setUserFilter] = useState<string>('');
    const [actionFilter, setActionFilter] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const uniqueActions = useMemo(() => [...new Set(logs.map(log => log.action))], [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const userMatch = !userFilter || log.userId === userFilter;
            const actionMatch = !actionFilter || log.action === actionFilter;

            const logDate = new Date(log.timestamp);
            let dateMatch = true;
            if (startDate) {
                const start = new Date(startDate + 'T00:00:00');
                if (logDate < start) {
                    dateMatch = false;
                }
            }
            if (endDate) {
                const end = new Date(endDate + 'T23:59:59');
                if (logDate > end) {
                    dateMatch = false;
                }
            }
            
            return userMatch && actionMatch && dateMatch;
        });
    }, [logs, userFilter, actionFilter, startDate, endDate]);
    
    const clearFilters = () => {
        setUserFilter('');
        setActionFilter('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Logs de Atividade</h1>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="user-filter" className="text-sm font-medium text-text-secondary dark:text-gray-300">Usuário</label>
                        <select id="user-filter" value={userFilter} onChange={e => setUserFilter(e.target.value)} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg text-sm">
                            <option value="">Todos os usuários</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                     <div className="lg:col-span-1">
                        <label htmlFor="action-filter" className="text-sm font-medium text-text-secondary dark:text-gray-300">Ação</label>
                        <select id="action-filter" value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg text-sm">
                            <option value="">Todas as ações</option>
                             {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                     <div className="lg:col-span-1">
                        <label htmlFor="start-date-filter" className="text-sm font-medium text-text-secondary dark:text-gray-300">Data Inicial</label>
                        <input
                            id="start-date-filter"
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg text-sm"
                        />
                    </div>
                     <div className="lg:col-span-1">
                        <label htmlFor="end-date-filter" className="text-sm font-medium text-text-secondary dark:text-gray-300">Data Final</label>
                         <input
                            id="end-date-filter"
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg text-sm"
                        />
                    </div>
                    <button onClick={clearFilters} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 w-full lg:w-auto">
                        Limpar Filtros
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Usuário</th>
                                <th scope="col" className="px-6 py-3">Ação</th>
                                <th scope="col" className="px-6 py-3">Detalhes</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => {
                                const user = userMap.get(log.userId);
                                return (
                                    <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap dark:text-white">
                                            {user ? (
                                                <div className="flex items-center gap-3">
                                                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                                                    <span>{user.name}</span>
                                                </div>
                                            ) : (
                                                <span>Usuário Desconhecido</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${actionColors[log.action]}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{log.details}</td>
                                        <td className="px-6 py-4">
                                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 {filteredLogs.length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                        Nenhum log encontrado para os filtros selecionados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logs;
