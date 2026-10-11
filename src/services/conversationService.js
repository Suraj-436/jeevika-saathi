// src/services/conversationService.js
// Persistent conversation data layer — mirrors the PostgreSQL schema
// Stores in localStorage to simulate a real database

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const DB_KEY_CONVERSATIONS = 'db_conversations';
const DB_KEY_MESSAGES = 'db_conversation_messages';

// --- CONVERSATIONS ---

export const startConversation = async (beneficiaryId, language = 'en-IN') => {
  await delay(100);
  const all = JSON.parse(localStorage.getItem(DB_KEY_CONVERSATIONS) || '[]');

  const conversation = {
    id: generateId(),
    beneficiary_id: beneficiaryId,
    language,
    status: 'active',
    current_step: 'livelihood',
    started_at: new Date().toISOString(),
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  all.push(conversation);
  localStorage.setItem(DB_KEY_CONVERSATIONS, JSON.stringify(all));
  return conversation;
};

export const resumeConversation = async (beneficiaryId) => {
  await delay(100);
  const all = JSON.parse(localStorage.getItem(DB_KEY_CONVERSATIONS) || '[]');
  // Return the most recent active conversation for this beneficiary
  return all
    .filter(c => c.beneficiary_id === beneficiaryId && c.status === 'active')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
};

export const updateConversationStep = async (conversationId, step, status = 'active') => {
  await delay(50);
  const all = JSON.parse(localStorage.getItem(DB_KEY_CONVERSATIONS) || '[]');
  const idx = all.findIndex(c => c.id === conversationId);
  if (idx === -1) return null;

  all[idx] = {
    ...all[idx],
    current_step: step,
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : all[idx].completed_at,
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(DB_KEY_CONVERSATIONS, JSON.stringify(all));
  return all[idx];
};

// --- MESSAGES ---

export const addMessage = async (conversationId, speaker, text, language = 'en-IN') => {
  await delay(80);
  const all = JSON.parse(localStorage.getItem(DB_KEY_MESSAGES) || '[]');

  const message = {
    id: generateId(),
    conversation_id: conversationId,
    speaker, // 'assistant' | 'user'
    text,
    language,
    created_at: new Date().toISOString()
  };

  all.push(message);
  localStorage.setItem(DB_KEY_MESSAGES, JSON.stringify(all));
  return message;
};

export const getConversationMessages = async (conversationId) => {
  await delay(100);
  const all = JSON.parse(localStorage.getItem(DB_KEY_MESSAGES) || '[]');
  return all
    .filter(m => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

// --- UTILS ---

function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const getShortId = (id) => id ? id.substring(0, 4).toUpperCase() : '----';
