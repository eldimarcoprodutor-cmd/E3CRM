import React, { useState, useEffect, useCallback } from 'react';
import type { Channel } from '../types.ts';
import { WhatsAppIcon } from './icons/WhatsAppIcon.tsx';

const QRCodeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConnect: (channelName: string) => void;
}> = ({ isOpen, onClose, onConnect }) => {
    const [step, setStep] = useState<'name' | 'scanning' | 'success' | 'error'>('name');
    const [channelName, setChannelName] = useState('');
    const [error, setError] = useState('');

    const resetState = useCallback(() => {
        setStep('name');
        setChannelName('');
        setError('');
    }, []);
    
    useEffect(() => {
        if (!isOpen) {
            // Reset state after a short delay to allow for closing animation
            const timer = setTimeout(resetState, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, resetState]);


    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!channelName.trim()) {
            setError('Por favor, insira um nome para o canal.');
            return;
        }
        setError('');
        setStep('scanning');
    };
    
    const handleSimulatedConnection = () => {
        setStep('success');
        setTimeout(() => {
            onConnect(channelName);
            resetState();
        }, 1500);
    };
    
    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (step) {
            case 'name':
                return (
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="channelName" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Nome do Canal</label>
                            <input
                                id="channelName"
                                type="text"
                                value={channelName}
                                onChange={e => setChannelName(e.target.value)}
                                placeholder="Ex: Time de Vendas"
                                autoFocus
                                className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                             {error && <p className="text-xs text-status-error mt-1">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                             <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">Gerar QR Code</button>
                        </div>
                    </form>
                );
            case 'scanning':
                return (
                    <div className="text-center">
                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cGF0aCBkPSJNMCAwaDI1NnYyNTZIMHoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMzIgMzJoNjR2NjRIMzJ6bTMyIDMySDQ4djE2aDE2em04MCAxNmgxNnYxNmgtMTZ6bS0xNiAwaDE2djE2aC0xNnptMzIgMzJoMTZ2MTZoLTE2em0xNiAwaDE2djE2aC0xNnptLTY0LTY0aDE2djE2aC0xNnptMTYgMGgxNnYxNmgtMTZ6bTMxLTExaDF2MWgtMXptMyAzaDF2MWgtMXptLTYtNmgydjJoLTJ6bTMgM2gydjJoLTJ6bTMgM2gydjJoLTJ6bS05LTloMnYyaC0yem0zIDNoMnYyaC0yem0zIDNoMnYyaC0yem0tOS05aDJ2MmgtMnptMyAzaDJ2MmgtMnptMyAzaDJ2MmgtMnptNjQgNjRoMTZ2MTZoLTE2em0xNiAwaDE2djE2aC0xNnptLTMxLTExaDF2MWgtMXptMyAzaDF2MWgtMXptLTYtNmgydjJoLTJ6bTMgM2gydjJoLTJ6bTMgM2gydjJoLTJ6bS05LTloMnYyaC0yem0zIDNoMnYyaC0yem0zIDNoMnYyaC0yem0tOS05aDJ2MmgtMnptMyAzaDJ2MmgtMnptMyAzaDJ2MmgtMnptLTY0LTY0aDY0djY0aC02NHptMzIgMzJINDh2MTZoMTZ6bTAgMTZoMTZ2MTZoLTE2em0xNiAwaDE2djE2aC0xNnptLTMxLTExaDF2MWgtMXptMyAzaDF2MWgtMXptLTYtNmgydjJoLTJ6bTMgM2gydjJoLTJ6bTMgM2gydjJoLTJ6bS05LTloMnYyaC0yem0zIDNoMnYyaC0yem0zIDNoMnYyaC0yem0tOS05aDJ2MmgtMnptMyAzaDJ2MmgtMnptMyAzaDJ2MmgtMnptLTMyIDMySDQ4djE2aDE2eiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==" alt="QR Code de Demonstração" className="w-64 h-64 mx-auto border dark:border-gray-600 p-2 rounded-lg bg-white" />
                        <div className="mt-4 p-3 bg-primary-light/50 dark:bg-primary/10 rounded-lg">
                           <p className="font-semibold text-primary-dark dark:text-primary-light">Aguardando conexão...</p>
                           <p className="text-xs text-text-secondary dark:text-gray-400">Escaneie o código para conectar.</p>
                        </div>
                        <div className="mt-4">
                             <button onClick={handleSimulatedConnection} className="w-full px-4 py-2 text-sm font-medium text-white bg-status-success hover:bg-green-700 rounded-lg">
                                Conexão Estabelecida (Simular)
                             </button>
                        </div>
                    </div>
                );
            case 'success':
                 return (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-20 h-20 rounded-full bg-status-success flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                         <p className="mt-4 text-lg font-semibold text-text-main dark:text-white">Canal conectado com sucesso!</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                         <p className="text-status-error">{error}</p>
                         <button onClick={onClose} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">Tentar Novamente</button>
                    </div>
                 );
            default:
                return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">Conectar Novo Canal WhatsApp</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl" disabled={step === 'success'}>&times;</button>
                </div>
                {renderStepContent()}
                 {step === 'scanning' && (
                    <div className="mt-4 text-left">
                        <p className="text-sm text-text-secondary dark:text-gray-300">
                            1. Abra o WhatsApp no seu celular.
                        </p>
                        <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">
                            2. Vá para <strong>Configurações</strong> &gt; <strong>Aparelhos conectados</strong> e toque em <strong>Conectar um aparelho</strong>.
                        </p>
                        <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">
                            3. Aponte seu celular para esta tela para capturar o código.
                        </p>
                        <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-3">(QR Code de demonstração)</p>
                    </div>
                )}
            </div>
        </div>
    );
};


interface CanaisProps {
    channels: Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}

const Canais: React.FC<CanaisProps> = ({ channels, setChannels }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConnect = (name: string) => {
        const newChannel: Channel = {
            id: `channel-${Date.now()}`,
            name: name,
            number: `+55 11 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'Conectado',
        };
        setChannels(prev => [...prev, newChannel]);
        setIsModalOpen(false);
    };

    const handleDisconnect = (channelId: string) => {
        if (window.confirm("Tem certeza que deseja desconectar este canal?")) {
            setChannels(prev => prev.filter(c => c.id !== channelId));
        }
    };
    
    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Gerenciamento de Canais</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                    Adicionar Canal
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Canais Conectados</h2>
                {channels.length > 0 ? (
                    <div className="space-y-4">
                        {channels.map(channel => (
                            <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg border-border-neutral dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <WhatsAppIcon className="w-8 h-8 text-status-success" />
                                    <div>
                                        <p className="font-semibold text-text-main dark:text-white">{channel.name}</p>
                                        <p className="text-sm text-text-secondary dark:text-gray-400">{channel.number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-status-success/20 text-green-800 dark:bg-status-success/20 dark:text-green-200">
                                        {channel.status}
                                    </span>
                                    <button onClick={() => handleDisconnect(channel.id)} className="text-sm font-medium text-status-error hover:underline">
                                        Desconectar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-text-secondary dark:text-gray-400">
                        <p>Nenhum canal do WhatsApp conectado.</p>
                        <p>Clique em "Adicionar Canal" para começar.</p>
                    </div>
                )}
            </div>

            <QRCodeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConnect={handleConnect}
            />
        </div>
    );
};

export default Canais;