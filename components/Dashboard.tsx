
import React, { useState } from 'react';
import type { CrmContact, User } from '../types.ts';
import { SchedulingIcon } from './icons/SchedulingIcon.tsx';

interface DashboardProps {
    contacts: CrmContact[];
    users: User[];
    onUpdateContact: (contact: CrmContact) => void;
}

const MetricCard: React.FC<{ title: string; value: string; change?: string; isPositive?: boolean; icon: React.ReactNode }> = ({ title, value, change, isPositive, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${isPositive === undefined ? 'bg-primary/20' : isPositive ? 'bg-status-success/20' : 'bg-status-error/20'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-text-main dark:text-white">{value}</p>
            {change && <p className={`text-xs ${isPositive ? 'text-status-success' : 'text-status-error'}`}>{change}</p>}
        </div>
    </div>
);


const BarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">Sem dados para exibir.</div>;
    }
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="w-full space-y-2">
            {data.map((d, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="w-24 text-right text-sm text-text-secondary dark:text-gray-400">{d.label}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                        <div
                            className={`${d.color} h-6 rounded-full flex items-center justify-end pr-2 text-white font-bold text-sm`}
                            style={{ width: `${(d.value / maxValue) * 100}%` }}
                        >
                           {d.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TaskItem: React.FC<{ task: CrmContact; onComplete: (task: CrmContact) => void }> = ({ task, onComplete }) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const actionDate = new Date(task.next_action_date + 'T00:00:00');
    const isOverdue = actionDate < today;

    const handleComplete = () => {
        setIsCompleting(true);
        // Delay actual update to allow animation to play
        setTimeout(() => {
            onComplete(task);
        }, 500);
    };

    return (
        <div className={`p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between transition-all duration-500 ease-in-out ${isCompleting ? 'opacity-0 transform translate-x-4' : 'opacity-100'}`}>
            <div className="flex items-start gap-3 overflow-hidden">
                <div className="pt-1">
                    <button 
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isCompleting 
                                ? 'bg-status-success border-status-success text-white' 
                                : 'border-gray-300 dark:border-gray-500 hover:border-primary dark:hover:border-primary text-transparent hover:text-primary/20'
                        }`}
                        aria-label="Concluir tarefa"
                        title="Marcar como concluído"
                    >
                         <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </button>
                </div>
                <div>
                    <p className={`font-semibold text-text-main dark:text-white text-sm transition-all duration-300 ${isCompleting ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                        {task.name}
                    </p>
                    <div className={`flex items-center gap-2 mt-1 text-xs ${isOverdue && !isCompleting ? 'text-status-error font-semibold' : 'text-text-secondary dark:text-gray-400'}`}>
                        <SchedulingIcon className="w-3.5 h-3.5" />
                        <span>{actionDate.toLocaleDateString('pt-BR', {timeZone: 'UTC'})} {isOverdue && "(Atrasado)"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ contacts, users, onUpdateContact }) => {
    // Calculate KPIs
    const newLeads = contacts.filter(c => c.pipeline_stage === 'Contato').length;
    const pipelineValue = contacts.filter(c => !['Fechado', 'Perdido'].includes(c.pipeline_stage)).reduce((sum, c) => sum + c.value, 0);
    const closedCount = contacts.filter(c => c.pipeline_stage === 'Fechado').length;
    const lostCount = contacts.filter(c => c.pipeline_stage === 'Perdido').length;
    const conversionRate = (closedCount + lostCount) > 0 ? (closedCount / (closedCount + lostCount) * 100) : 0;

    // Funnel Data
    const funnelData = [
        { label: 'Contato', value: contacts.filter(c => c.pipeline_stage === 'Contato').length, color: 'bg-primary' },
        { label: 'Qualificação', value: contacts.filter(c => c.pipeline_stage === 'Qualificação').length, color: 'bg-indigo-500' },
        { label: 'Proposta', value: contacts.filter(c => c.pipeline_stage === 'Proposta').length, color: 'bg-status-warning' },
        { label: 'Fechado', value: contacts.filter(c => c.pipeline_stage === 'Fechado').length, color: 'bg-status-success' },
    ];

    // Tasks for Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingTasks = contacts
        .filter(c => {
            const actionDate = new Date(c.next_action_date + 'T00:00:00');
            return actionDate <= today && c.pipeline_stage !== 'Fechado' && c.pipeline_stage !== 'Perdido';
        })
        .sort((a, b) => new Date(a.next_action_date).getTime() - new Date(b.next_action_date).getTime());

    const handleTaskCompletion = (task: CrmContact) => {
        // "Completing" a task today moves the action date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDateStr = tomorrow.toISOString().split('T')[0];
        
        onUpdateContact({
            ...task,
            next_action_date: nextDateStr
        });
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
             <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Dashboard de Performance</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard 
                    title="Novos Leads" 
                    value={newLeads.toString()} 
                    icon={<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                />
                 <MetricCard 
                    title="Valor em Pipeline" 
                    value={`R$ ${pipelineValue.toLocaleString('pt-BR')}`}
                    icon={<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                />
                 <MetricCard 
                    title="Taxa de Conversão" 
                    value={`${conversionRate.toFixed(0)}%`}
                    isPositive={conversionRate >= 50}
                    icon={<svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                 <MetricCard 
                    title="Conversas Atendidas" 
                    value="342" 
                    isPositive={true}
                    change="+5% vs. ontem" 
                    icon={<svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z"></path></svg>}
                />
            </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Funil de Vendas</h2>
            <BarChart data={funnelData} />
        </div>
        
         <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Minhas Tarefas Hoje</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {upcomingTasks.length > 0 ? (
                    upcomingTasks.map(task => (
                        <TaskItem key={task.id} task={task} onComplete={handleTaskCompletion} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-sm text-text-secondary dark:text-gray-400">Tudo limpo! Nenhuma tarefa pendente para hoje.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
