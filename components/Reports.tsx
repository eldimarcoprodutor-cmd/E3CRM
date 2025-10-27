import React, { useState, useEffect, useCallback } from 'react';
import type { User, Chat } from '../types.ts';

interface AgentPerformance {
    id: string;
    name: string;
    avatarUrl: string;
    chats: number;
    avgResponse: string;
    resolutionRate: string;
}

interface DailyStat {
    date: string;
    messages: number;
    newLeads: number;
}

interface ReportData {
    totalConversations: number;
    totalNewLeads: number;
    conversionRate: number;
    customerSatisfaction: number;
    dailyStats: DailyStat[];
    agentPerformance: AgentPerformance[];
}

// Helper function to generate mock data for a given date range
const generateMockReportData = (startDate: Date, endDate: Date, users: User[]): ReportData => {
    const dailyStats: DailyStat[] = [];
    let totalMessages = 0;
    let totalNewLeads = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const messages = Math.floor(Math.random() * 200) + 50;
        const newLeads = Math.floor(messages * (Math.random() * 0.1 + 0.05)); // 5-15% of messages are new leads
        dailyStats.push({
            date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            messages,
            newLeads
        });
        totalMessages += messages;
        totalNewLeads += newLeads;
    }

    const agentPerformance: AgentPerformance[] = users.map(user => ({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatar_url,
        chats: Math.floor(Math.random() * 100) + 20,
        avgResponse: `${Math.floor(Math.random() * 3)}m ${Math.floor(Math.random() * 60)}s`,
        resolutionRate: `${Math.floor(Math.random() * 15) + 80}%`,
    }));

    return {
        totalConversations: totalMessages,
        totalNewLeads,
        conversionRate: totalMessages > 0 ? parseFloat(((totalNewLeads / totalMessages) * 100).toFixed(1)) : 0,
        customerSatisfaction: parseFloat((Math.random() + 8.8).toFixed(1)),
        dailyStats,
        agentPerformance,
    };
};

const KpiCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <p className="text-sm text-text-secondary dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-text-main dark:text-white mt-1">{value}</p>
        <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">{description}</p>
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">Sem dados para exibir.</div>;
    }
    const maxValue = Math.max(...data.map(d => d.value), 100); // Ensure a minimum height for the chart
    const chartHeight = 250;
    const barWidth = 30;
    const gap = 15;

    return (
        <div className="w-full overflow-x-auto">
            <svg width={data.length * (barWidth + gap)} height={chartHeight + 30} className="font-sans">
                {data.map((d, i) => {
                    const barHeight = (d.value / maxValue) * chartHeight;
                    const x = i * (barWidth + gap);
                    const y = chartHeight - barHeight;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="currentColor"
                                className="text-primary"
                                rx="4"
                                ry="4"
                            />
                            <text
                                x={x + barWidth / 2}
                                y={y - 5}
                                textAnchor="middle"
                                className="text-xs font-semibold fill-current text-text-main dark:text-gray-200"
                            >
                                {d.value}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight + 15}
                                textAnchor="middle"
                                className="text-xs fill-current text-text-secondary dark:text-gray-400"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

interface ReportsProps {
    users: User[];
    chats: Chat[];
}

export const Reports: React.FC<ReportsProps> = ({ users }) => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    
    const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const handleFilter = useCallback(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            alert("A data inicial não pode ser maior que a data final.");
            return;
        }
        const data = generateMockReportData(start, end, users);
        setReportData(data);
    }, [startDate, endDate, users]);
    
    useEffect(() => {
        handleFilter();
    }, [handleFilter]); // Run once on mount

    const handleExportCsv = () => {
        if (!reportData) return;
        
        const headers = ['Atendente', 'Conversas Atendidas', 'Tempo Médio de Resposta', 'Taxa de Resolução'];
        const csvRows = [
            headers.join(','),
            ...reportData.agentPerformance.map(agent =>
                [
                    `"${agent.name}"`,
                    agent.chats,
                    `"${agent.avgResponse}"`,
                    `"${agent.resolutionRate}"`
                ].join(',')
            )
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'performance_atendentes.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    if (!reportData) {
        return <div>Carregando relatórios...</div>;
    }

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Relatórios e Analytics</h1>
                <div className="flex items-center gap-4">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 bg-white dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    <span className="text-text-secondary">até</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 bg-white dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    <button onClick={handleFilter} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">Filtrar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total de Conversas" value={reportData.totalConversations.toLocaleString('pt-BR')} description="+15% vs. período anterior" />
                <KpiCard title="Novos Leads" value={reportData.totalNewLeads.toLocaleString('pt-BR')} description="+8% vs. período anterior" />
                <KpiCard title="Taxa de Conversão" value={`${reportData.conversionRate}%`} description="-0.5% vs. período anterior" />
                <KpiCard title="Satisfação do Cliente" value={`${reportData.customerSatisfaction}/10`} description="+0.3 vs. período anterior" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Volume de Mensagens por Dia</h2>
                <div className="p-4">
                     <BarChart data={reportData.dailyStats.map(d => ({ label: d.date, value: d.messages }))} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-text-main dark:text-white">Performance por Atendente</h2>
                    <button onClick={handleExportCsv} className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-light/50 dark:hover:bg-primary/10">Exportar CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Atendente</th>
                                <th scope="col" className="px-6 py-3">Conversas Atendidas</th>
                                <th scope="col" className="px-6 py-3">Tempo Médio de Resposta</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Taxa de Resolução</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.agentPerformance.map(agent => (
                                <tr key={agent.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full" />
                                            <span>{agent.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{agent.chats}</td>
                                    <td className="px-6 py-4">{agent.avgResponse}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-status-success dark:text-status-success">{agent.resolutionRate}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};