import React, { useState, useEffect } from 'react';
import type { Channel } from '../types.ts';
import { WhatsAppIcon } from './icons/WhatsAppIcon.tsx';

const QRCodeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
}> = ({ isOpen, onClose, onConnect }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        // Fix: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout.
        let qrTimer: ReturnType<typeof setTimeout>;
        let connectTimer: ReturnType<typeof setTimeout>;

        if (isOpen) {
            setIsLoading(true);
            setQrCodeUrl('');

            // Simulate fetching QR code from an API
            qrTimer = setTimeout(() => {
                setQrCodeUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png');
                setIsLoading(false);

                // After showing the QR code, simulate a successful connection after some time
                connectTimer = setTimeout(() => {
                    onConnect();
                }, 8000); // 8 seconds to "scan"

            }, 2000); // 2 seconds to "generate"
        }

        return () => {
            clearTimeout(qrTimer);
            clearTimeout(connectTimer);
        };
    }, [isOpen, onConnect]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">Conectar Novo Canal WhatsApp</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="my-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                             <p className="mt-4 text-text-secondary dark:text-gray-400">Gerando QR Code...</p>
                        </div>
                    ) : (
                        <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto border dark:border-gray-600 p-2 rounded-lg" />
                    )}
                </div>

                <div>
                    <p className="text-sm text-text-secondary dark:text-gray-300">
                        1. Abra o WhatsApp no seu celular.
                    </p>
                    <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">
                        2. Vá para <strong>Configurações</strong> &gt; <strong>Aparelhos conectados</strong> e toque em <strong>Conectar um aparelho</strong>.
                    </p>
                    <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">
                        3. Aponte seu celular para esta tela para capturar o código.
                    </p>
                </div>
            </div>
        </div>
    );
};


interface CanaisProps {
    channels: Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}

export const Canais: React.FC<CanaisProps> = ({ channels, setChannels }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConnect = () => {
        const newChannel: Channel = {
            id: `channel-${Date.now()}`,
            name: 'Comercial',
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