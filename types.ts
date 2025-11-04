export interface User {
  id: string;
  name: string;
  avatar_url: string;
  role: 'Gerente' | 'Atendente';
  email: string;
  password?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender: string; // user id or contact's id
  text: string;
  avatar_url: string;
  timestamp: string;
  type: 'text' | 'internal';
}

export interface AiChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface AgentAiMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isActionResponse?: boolean;
}

export interface Chat {
  id: string;
  contact_id: string;
  contact_name: string;
  avatar_url: string;
  last_message: string;
  timestamp: string;
  unread_count: number;
  messages: Message[];
  handled_by: 'bot' | string; // bot or user id
}

export interface Note {
  id: string;
  text: string;
  author_id: string;
  timestamp: string;
  type: 'note' | 'email';
  subject?: string;
}

export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  tags: string[];
  pipeline_stage: 'Contato' | 'Qualificação' | 'Proposta' | 'Fechado' | 'Perdido';
  last_interaction: string;
  owner_id: string;
  value: number;
  temperature: 'Quente' | 'Morno' | 'Frio';
  next_action_date: string; // ISO format YYYY-MM-DD
  lead_source: string;
  notes: Note[];
}

export interface QuickReply {
  id: number;
  shortcut: string;
  message: string;
}

export interface KnowledgeBaseItem {
  id: number;
  question: string;
  answer: string;
}

export interface ChatbotConfig {
    tone: string;
    knowledgeBase: KnowledgeBaseItem[];
    isFirstInteraction?: boolean;
}

export interface LogEntry {
  id: string;
  userId: string; // ID of the user who performed the action
  action: 'Contato Adicionado' | 'Contato Atualizado' | 'Mensagem Enviada' | 'Broadcast Enviado' | 'Membro Removido';
  details: string; // e.g., "Carlos Pereira movido para Proposta"
  timestamp: string; // ISO string
}

export type Theme = 'light' | 'dark' | 'system';

export interface Channel {
  id: string;
  name: string;
  number: string;
  status: 'Conectado' | 'Desconectado' | 'Conectando';
}

export interface AiChatbotResponse {
    text: string;
    updatedContacts?: CrmContact[];
}

export type Sentiment = 'Positivo' | 'Neutro' | 'Negativo' | 'Analisando...';