import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
// Fix: Import `KnowledgeBaseItem` to resolve a type error.
import type { CrmContact, User, AiChatbotResponse, KnowledgeBaseItem } from '../types.ts';

// The API key is assumed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A single, persistent chat instance for the internal AI assistant
let aiChat: Chat | null = null;

const getContactDetailsFunction: FunctionDeclaration = {
    name: 'getContactDetails',
    description: 'Obtém informações detalhadas sobre um contato específico pelo nome.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'O nome do contato a ser procurado.' },
        },
        required: ['name'],
    },
};

const findLeadsByTemperatureFunction: FunctionDeclaration = {
    name: 'findLeadsByTemperature',
    description: 'Encontra contatos (leads) com base na sua temperatura de negociação (Quente, Morno, Frio).',
    parameters: {
        type: Type.OBJECT,
        properties: {
            temperature: { type: Type.STRING, description: 'A temperatura do lead. Valores válidos: Quente, Morno, Frio.' },
        },
        required: ['temperature'],
    },
};

/**
 * Initializes or returns the existing AI chat session with function calling tools.
 */
const getAiChat = () => {
    if (!aiChat) {
        aiChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'Você é um assistente de IA especialista em CRM e atendimento ao cliente, integrado a um sistema chamado E3CRM. Sua função é ajudar os usuários (gerentes e atendentes) a serem mais produtivos. Forneça respostas concisas, práticas e úteis sobre vendas, marketing, suporte, e como usar um CRM de forma eficaz. Aja como um coach de produtividade e um especialista em software. Quando uma função é executada com sucesso, confirme a ação para o usuário de forma amigável (ex: "Busca realizada com sucesso!").',
                tools: [{
                    functionDeclarations: [getContactDetailsFunction, findLeadsByTemperatureFunction]
                }],
            },
        });
    }
    return aiChat;
};

/**
 * Executes a function call from the Gemini model.
 * @param functionCall The function call object.
 * @param contacts The list of CRM contacts.
 * @param currentUser The currently logged-in user.
 * @returns The result of the function execution.
 */
const executeFunctionCall = (functionCall: GenerateContentResponse['functionCalls'][0], contacts: CrmContact[], currentUser: User): { result: any, updatedContact?: CrmContact } => {
    const { name, args } = functionCall;

    switch (name) {
        case 'getContactDetails': {
            const contact = contacts.find(c => c.name.toLowerCase() === (args.name as string).toLowerCase());
            if (contact) {
                return { result: { contact } };
            }
            return { result: { error: 'Contato não encontrado.' } };
        }
        case 'findLeadsByTemperature': {
            const temperature = args.temperature as CrmContact['temperature'];
            const validTemperatures: CrmContact['temperature'][] = ['Quente', 'Morno', 'Frio'];
            if (!validTemperatures.includes(temperature)) {
                return { result: { error: 'Temperatura inválida. Use Quente, Morno, Frio.' } };
            }
            const leads = contacts.filter(c => c.temperature === temperature).map(c => c.name);
            return { result: { leads } };
        }
        default:
            return { result: { error: `Função "${name}" desconhecida.` } };
    }
};

/**
 * Asks a question to the Gemini chatbot, handles function calls, and gets a response.
 * @param message The user's message.
 * @param contacts The current list of CRM contacts.
 * @param currentUser The current user.
 * @returns The chatbot's response object.
 */
export const askAiChatbot = async (message: string, contacts: CrmContact[], currentUser: User): Promise<AiChatbotResponse> => {
    try {
        const chat = getAiChat();
        let response = await chat.sendMessage(message);

        let contactThatWasUpdated: CrmContact | undefined = undefined;
        let currentContacts = [...contacts]; // Make a copy to update during the loop

        while (response.functionCalls && response.functionCalls.length > 0) {
            const functionCalls = response.functionCalls;
            // Fix: Correctly format function responses for the Chat API.
            const functionResponseParts = [];

            for (const fc of functionCalls) {
                const { result, updatedContact } = executeFunctionCall(fc, currentContacts, currentUser);
                if (updatedContact) {
                    contactThatWasUpdated = updatedContact; // Capture the updated contact
                    // Update the list for the next function call in the same turn
                    currentContacts = currentContacts.map(c => c.id === updatedContact.id ? updatedContact : c);
                }
                functionResponseParts.push({
                    functionResponse: {
                        name: fc.name,
                        response: result,
                    },
                });
            }

            // Send the function responses back to the model
            // Fix: The chat.sendMessage method expects an array of Parts directly for function responses, not an object with a 'parts' property.
            response = await chat.sendMessage(functionResponseParts);
        }

        return { text: response.text, updatedContact: contactThatWasUpdated };

    } catch (error) {
        console.error("Error asking AI Chatbot:", error);
        aiChat = null; // Reset chat session on error
        return { text: "Desculpe, ocorreu um erro ao me comunicar com a IA. A sessão foi reiniciada. Por favor, tente novamente." };
    }
};

/**
 * Generates a humanized response based on a base message and a desired tone.
 * @param baseMessage The original message.
 * @param tone The desired tone (e.g., 'Amigável', 'Formal').
 * @returns The rewritten message from the AI.
 */
export const generateHumanizedResponse = async (baseMessage: string, tone: string): Promise<string> => {
    try {
        const prompt = `Reescreva a seguinte mensagem com um tom ${tone} e humanizado. A mensagem deve ser clara, concisa e apropriada para uma comunicação com o cliente via WhatsApp. Mantenha o sentido original. Mensagem original: "${baseMessage}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating humanized response:", error);
        throw new Error("Falha ao se comunicar com a API do Gemini.");
    }
};

interface ChatbotConfig {
    tone: string;
    knowledgeBase: KnowledgeBaseItem[];
    isFirstInteraction?: boolean;
}

interface ChatbotResponse {
    response: string;
    requiresHandoff: boolean;
}

/**
 * Generates a chatbot response based on user input and a knowledge base.
 * @param userInput The user's message.
 * @param config The chatbot configuration including tone and knowledge base.
 * @returns An object containing the chatbot's response and a handoff flag.
 */
export const generateChatbotResponse = async (userInput: string, config: ChatbotConfig): Promise<ChatbotResponse> => {
    try {
        const knowledgeBaseString = config.knowledgeBase.map(item => `P: ${item.question}\nR: ${item.answer}`).join('\n\n');

        const firstInteractionGreeting = config.isFirstInteraction
            ? "Esta é a primeira interação com o cliente. Comece com uma saudação calorosa e apresente-se como o assistente virtual da E3CRM antes de responder à pergunta."
            : "";

        const systemInstruction = `Você é um assistente virtual de atendimento ao cliente para a empresa E3CRM. 
Responda às perguntas dos clientes de forma ${config.tone}.
${firstInteractionGreeting}
Utilize a base de conhecimento a seguir para responder às perguntas. 
Se a resposta não estiver na base, responda com o prefixo "HANDOFF::" seguido de uma mensagem informando que irá transferir para um atendente humano. Por exemplo: "HANDOFF::Não encontrei essa informação, estou te transferindo para um de nossos especialistas."
Não invente informações. Seja breve e direto.

Base de Conhecimento:
---
${knowledgeBaseString}
---
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userInput,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        let responseText = response.text.trim();
        let requiresHandoff = false;

        if (responseText.startsWith('HANDOFF::')) {
            requiresHandoff = true;
            responseText = responseText.replace('HANDOFF::', '').trim();
        }

        return { response: responseText, requiresHandoff };
    } catch (error) {
        console.error("Error generating chatbot response:", error);
        return {
            response: "Desculpe, estou com problemas técnicos no momento. Vou transferir você para um atendente.",
            requiresHandoff: true,
        };
    }
};


/**
 * Generates a summary for a chat conversation.
 * @param chatHistory The conversation messages.
 * @returns A summary of the chat.
 */
export const generateChatSummary = async (chatHistory: string): Promise<string> => {
    try {
        const prompt = `Resuma a seguinte conversa de atendimento ao cliente em um único parágrafo conciso. Destaque o principal problema do cliente e a resolução (se houver).

Conversa:
---
${chatHistory}
---

Resumo:`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating chat summary:", error);
        throw new Error("Falha ao gerar resumo do chat.");
    }
};

/**
 * Suggests a next action based on the chat history.
 * @param chatHistory The conversation messages.
 * @returns A suggested next action.
 */
export const suggestNextAction = async (chatHistory: string): Promise<string> => {
    try {
        const prompt = `Com base na conversa a seguir, sugira a próxima ação mais apropriada para o atendente. As ações podem ser: "agendar reunião", "enviar proposta", "enviar documentação", "adicionar tag: interesse-produto-X", "encerrar e resolver", ou "encaminhar para suporte técnico". Responda apenas com a ação sugerida.

Conversa:
---
${chatHistory}
---

Próxima Ação:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error suggesting next action:", error);
        throw new Error("Falha ao sugerir próxima ação.");
    }
};

/**
 * Generates reply suggestions based on the chat history.
 * @param chatHistory The conversation messages.
 * @returns An array of 3 reply suggestions.
 */
export const generateReplySuggestion = async (chatHistory: string): Promise<string[]> => {
    try {
        const prompt = `Com base na conversa de atendimento a seguir, gere 3 sugestões de respostas curtas e úteis para o atendente. As respostas devem ser apropriadas para o WhatsApp. Retorne as sugestões separadas pelo caractere "|".

Conversa:
---
${chatHistory}
---

Sugestões:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text.trim();
        return text.split('|').map(s => s.trim()).slice(0, 3);
    } catch (error) {
        console.error("Error generating reply suggestions:", error);
        return ["Desculpe, não consegui gerar sugestões.", "Tente novamente.", "Verifique a conexão."];
    }
};

/**
 * Corrects spelling and grammar for a given text.
 * @param text The text to correct.
 * @returns The corrected text.
 */
export const correctSpellingAndGrammar = async (text: string): Promise<string> => {
    try {
        const prompt = `Corrija a ortografia e a gramática do texto a seguir, mantendo o sentido original. Retorne apenas o texto corrigido. Texto: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error correcting spelling and grammar:", error);
        throw new Error("Falha ao corrigir o texto.");
    }
};

/**
 * Expands a short text into a more complete sentence.
 * @param text The short text to expand.
 * @returns The expanded text.
 */
export const expandText = async (text: string): Promise<string> => {
    try {
        const prompt = `Expanda o texto a seguir para uma frase mais completa e profissional, adequada para atendimento ao cliente. Retorne apenas o texto expandido. Texto: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error expanding text:", error);
        throw new Error("Falha ao expandir o texto.");
    }
};

/**
 * Analyzes the sentiment of the last customer message in a conversation.
 * @param chatHistory The conversation messages.
 * @returns The sentiment as 'Positivo', 'Neutro', or 'Negativo'.
 */
export const analyzeSentiment = async (chatHistory: string): Promise<'Positivo' | 'Neutro' | 'Negativo'> => {
    try {
        const prompt = `Analise o sentimento da última mensagem do cliente na conversa a seguir. Responda APENAS com uma das seguintes palavras: Positivo, Neutro, ou Negativo.

Conversa:
---
${chatHistory}
---

Sentimento:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text.trim();
        if (text === 'Positivo' || text === 'Neutro' || text === 'Negativo') {
            return text;
        }
        // Fallback for unexpected responses
        return 'Neutro'; 
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        // Return a neutral sentiment on error to avoid UI disruption
        return 'Neutro';
    }
};

/**
 * Generates a WhatsApp broadcast message using AI.
 * @param objective The goal of the message.
 * @param keyInfo The core information or offer.
 * @param tone The desired tone of the message.
 * @returns A generated broadcast message as a string.
 */
export const generateBroadcastMessage = async (objective: string, keyInfo: string, tone: string): Promise<string> => {
    try {
        const prompt = `
          Você é um especialista em marketing para WhatsApp. Sua tarefa é criar uma mensagem de broadcast curta, clara e persuasiva.
          A mensagem deve ser otimizada para engajamento no WhatsApp. Use emojis de forma inteligente e natural.
          Inclua a variável {{nome}} para personalização, que será substituída pelo nome do contato.

          **Objetivo:** ${objective}
          **Tom de Voz:** ${tone}
          **Informações Principais:** ${keyInfo}

          Crie a mensagem de broadcast agora. Retorne apenas o texto da mensagem.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating broadcast message:", error);
        throw new Error("Falha ao gerar mensagem de broadcast.");
    }
};