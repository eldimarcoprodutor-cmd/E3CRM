
import React from 'react';

const salesData = [
  { name: 'Contato', Vendas: 120 },
  { name: 'Qualificação', Vendas: 98 },
  { name: 'Proposta', Vendas: 65 },
  { name: 'Fechado', Vendas: 42 },
];

const MetricCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode }> = ({ title, value, change, isPositive, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${isPositive ? 'bg-status-success/20 dark:bg-status-success/20' : 'bg-status-error/20 dark:bg-status-error/20'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-text-main dark:text-white">{value}</p>
            <p className={`text-xs ${isPositive ? 'text-status-success' : 'text-status-error'}`}>{change}</p>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Dashboard de Performance</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
                title="Tempo médio de resposta" 
                value="2m 15s" 
                change="-12% vs. ontem" 
                isPositive={true} 
                icon={<svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            />
            <MetricCard 
                title="Conversas Atendidas" 
                value="342" 
                change="+5% vs. ontem" 
                isPositive={true} 
                icon={<svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z"></path></svg>}
            />
            <MetricCard 
                title="Taxa de Resolução" 
                value="89%" 
                change="+1.5% vs. ontem" 
                isPositive={true} 
                icon={<svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            />
            <MetricCard 
                title="Broadcast Engagement" 
                value="45%" 
                change="-3% vs. ontem" 
                isPositive={false} 
                icon={<svg className="w-6 h-6 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
            />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Funil de Vendas</h2>
            <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-text-secondary">
                Gráfico temporariamente desativado para correção.
            </div>
        </div>
    </div>
  );
};