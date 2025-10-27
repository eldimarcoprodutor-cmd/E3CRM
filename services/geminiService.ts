import { GoogleGenAI } from "@google/genai";

// The API key is assumed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

interface KnowledgeBaseItem {
  question: string;
  answer: string;
}

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