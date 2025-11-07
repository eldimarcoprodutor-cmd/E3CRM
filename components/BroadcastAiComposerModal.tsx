import React, { useState, useEffect } from 'react';
import { ChatbotAiIcon } from './icons/ChatbotAiIcon.tsx';

interface BroadcastAiComposerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (message: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

export const BroadcastAiComposerModal: React.FC<BroadcastAiComposerModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [objective, setObjective] = useState('Promover um produto');
    const [keyInfo, setKeyInfo] = useState('');
    const [tone, setTone] = useState('Amigável');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!keyInfo.trim()) {
            alert('Por favor, forneça as informações principais.');
            return;
        }
        setIsLoading(true);
        setGeneratedMessage('');
        try {
            const { generateBroadcastMessage } = await import('../services/geminiService.ts');
            const result = await generateBroadcastMessage(objective, keyInfo, tone);
            setGeneratedMessage(result);
        } catch (error) {
            console.error(error);
            setGeneratedMessage('Ocorreu um erro ao gerar a mensagem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseMessage = () => {
        onGenerate(generatedMessage);
        onClose();
    };
    
    useEffect(() => {
        if (isOpen) {
            setObjective('Promover um produto');
            setKeyInfo('');
            setTone('Amigável');
            setGeneratedMessage('');
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white flex items-center gap-2">
                        <ChatbotAiIcon className="w-6 h-6 text-primary" />
                        Gerador de Broadcast com IA
                    </h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Objetivo</label>
                            <select value={objective} onChange={e => setObjective(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <option>Promover um produto</option>
                                <option>Anunciar um evento</option>
                                <option>Enviar um lembrete</option>
                                <option>Nutrir leads</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Tom de Voz</label>
                            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <option>Amigável</option>
                                <option>Profissional</option>
                                <option>Urgente</option>
                                <option>Descontraído</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Informações Principais / Oferta</label>
                        <textarea
                            rows={3}
                            value={keyInfo}
                            onChange={e => setKeyInfo(e.target.value)}
                            placeholder="Ex: 50% de desconto no plano Pro até sexta-feira."
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        />
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/70">
                        {isLoading ? 'Gerando...' : 'Gerar Mensagem'}
                    </button>

                    {(isLoading || generatedMessage) && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="text-sm font-semibold text-text-secondary dark:text-gray-300 mb-2">Sugestão da IA:</h4>
                            {isLoading ? <LoadingSpinner /> : (
                                <p className="text-sm text-text-main dark:text-gray-200 whitespace-pre-wrap">{generatedMessage}</p>
                            )}
                        </div>
                    )}
                </div>

                {generatedMessage && !isLoading && (
                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t dark:border-gray-700">
                        <button onClick={handleGenerate} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg">Gerar Novamente</button>
                        <button onClick={handleUseMessage} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">Usar esta Mensagem</button>
                    </div>
                )}
            </div>
        </div>
    );
};
