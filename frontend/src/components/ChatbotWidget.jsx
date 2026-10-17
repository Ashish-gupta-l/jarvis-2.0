// ChatbotWidget.jsx - Interactive Multilingual AI Chatbot Widget for CareTrail
// Inspired by Javis603/Discord-AIBot architecture

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  Brain,
  Paperclip,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  supportedLanguages,
  chatLocales
} from '../locales/chatLocales';
import {
  AI_MODELS,
  getStoredSettings,
  saveStoredSettings,
  sendChatMessage,
  speakText,
  stopSpeaking
} from '../services/aiChatService';
import './ChatbotWidget.css';

export const ChatbotWidget = () => {
  const navigate = useNavigate();

  // Settings & Configuration state
  const [settings, setSettings] = useState(getStoredSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active locale strings
  const currentLang = settings.language || 'en';
  const t = chatLocales[currentLang] || chatLocales.en;

  // Messages state
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('jarvis_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'initial',
        role: 'assistant',
        content: t.welcomeGreeting,
        thinkingProcess: '',
        citations: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Persist messages in localStorage
  useEffect(() => {
    localStorage.setItem('jarvis_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Sync settings changes
  const updateSettings = (partial) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap = {
        en: 'en-US',
        hi: 'hi-IN',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ja: 'ja-JP',
        zh: 'zh-CN'
      };
      recognition.lang = langMap[currentLang] || 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Could not start speech recognition:', err);
      }
    }
  };

  const handleToggleSpeak = (msgId, text) => {
    if (speakingId === msgId) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(msgId);
      speakText(text, currentLang);
    }
  };

  const toggleThinking = (id) => {
    setExpandedThinkingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Send message
  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend && !attachment) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      attachment: attachment ? { name: attachment.name, size: attachment.size } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentAttachment = attachment;
    setAttachment(null);
    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        message: textToSend,
        conversationHistory: messages,
        model: settings.model,
        language: currentLang,
        apiKey: settings.apiKey,
        webSearch: settings.webSearch,
        deepThinking: settings.deepThinking,
        attachment: currentAttachment
      });

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.text,
        thinkingProcess: result.thinkingProcess || '',
        citations: result.citations || null,
        modelUsed: result.modelUsed || settings.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `❌ An unexpected error occurred while processing your request: ${error.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setSpeakingId(null);
    const initial = [
      {
        id: 'initial',
        role: 'assistant',
        content: t.welcomeGreeting,
        thinkingProcess: '',
        citations: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    localStorage.removeItem('jarvis_chat_messages');
  };

  const handleExportChat = () => {
    const transcript = messages.map(m => `### ${m.role.toUpperCase()} [${m.timestamp}]\n${m.content}\n\n`).join('---\n');
    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jarvis-caretrail-chat-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const currentModelObj = AI_MODELS.find(m => m.id === settings.model) || AI_MODELS[0];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="jarvis-floating-trigger"
          onClick={() => setIsOpen(true)}
          title="Open Jarvis Multilingual AI Assistant"
        >
          <div className="jarvis-status-dot" />
          <div className="jarvis-trigger-badge">
            <Sparkles size={18} />
          </div>
          <span>Jarvis AI</span>
        </button>
      )}

      {/* Main Chat Popup Window */}
      {isOpen && (
        <div className="jarvis-chat-window">
          {/* Header */}
          <div className="jarvis-chat-header">
            <div className="jarvis-header-left">
              <div className="jarvis-avatar">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="jarvis-header-title">
                  {t.title}
                </div>
                <div className="jarvis-header-subtitle">
                  {t.statusOnline}
                </div>
              </div>
            </div>

            <div className="jarvis-header-actions">
              {/* Language Selector Dropdown */}
              <select
                className="jarvis-lang-dropdown"
                value={currentLang}
                onChange={(e) => updateSettings({ language: e.target.value })}
                title="Select Assistant Language"
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>

              {/* Expand to Full Page */}
              <button
                className="jarvis-icon-btn"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-assistant');
                }}
                title={t.expand}
              >
                <ExternalLink size={16} />
              </button>

              {/* Settings */}
              <button
                className="jarvis-icon-btn"
                onClick={() => setIsSettingsOpen(true)}
                title={t.settings}
              >
                <Settings size={16} />
              </button>

              {/* Minimize / Close */}
              <button
                className="jarvis-icon-btn"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                title={t.close}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Feature Toolbar */}
          <div className="jarvis-chat-toolbar">
            <div className="jarvis-model-indicator" title="Current Active AI Engine">
              <Sparkles size={12} />
              <span>{currentModelObj.name}</span>
            </div>

            <div className="jarvis-toggle-group">
              {/* Web Search Toggle */}
              <button
                type="button"
                className={`jarvis-toggle-chip ${settings.webSearch ? 'active' : ''}`}
                onClick={() => updateSettings({ webSearch: !settings.webSearch })}
                title="Toggle Web Search verification (Discord-AIBot feature)"
              >
                <Globe size={12} />
                <span>{t.webSearch}</span>
              </button>

              {/* Deep Thinking Toggle */}
              <button
                type="button"
                className={`jarvis-toggle-chip ${settings.deepThinking ? 'active' : ''}`}
                onClick={() => updateSettings({ deepThinking: !settings.deepThinking })}
                title="Toggle Deep Clinical Thinking process (Discord-AIBot feature)"
              >
                <Brain size={12} />
                <span>{t.deepThinking}</span>
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="jarvis-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`jarvis-message-wrapper ${msg.role}`}>
                {/* Thinking Process Accordion (if Deep Thinking was enabled) */}
                {msg.thinkingProcess && (
                  <div className="jarvis-thinking-box">
                    <div
                      className="jarvis-thinking-header"
                      onClick={() => toggleThinking(msg.id)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Brain size={13} /> {t.thinkingProcess}
                      </span>
                      {expandedThinkingIds.has(msg.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    {expandedThinkingIds.has(msg.id) && (
                      <div className="jarvis-thinking-content">
                        {msg.thinkingProcess}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className="jarvis-message-bubble">
                  {/* Clean text formatted with simple paragraph / bold breaks */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>

                  {/* Attachment metadata */}
                  {msg.attachment && (
                    <div style={{ marginTop: 8, fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Paperclip size={12} /> {msg.attachment.name} ({(msg.attachment.size / 1024).toFixed(1)} KB)
                    </div>
                  )}

                  {/* Citations if Web Search enabled */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="jarvis-citations-box">
                      {msg.citations.map((cite, i) => (
                        <a
                          key={i}
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="jarvis-citation-badge"
                        >
                          <Search size={10} /> {cite.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Meta & Read Aloud Audio button */}
                <div className="jarvis-message-meta">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      className="jarvis-speech-btn"
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                      title={speakingId === msg.id ? t.stopSpeaking : t.speakResponse}
                    >
                      {speakingId === msg.id ? <VolumeX size={13} color="#ef4444" /> : <Volume2 size={13} />}
                      <span>{speakingId === msg.id ? t.stopSpeaking : t.speakResponse}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="jarvis-message-wrapper assistant">
                <div className="jarvis-message-bubble" style={{ background: '#f1f5f9' }}>
                  <div className="jarvis-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prediction Chips (Inspired by buttonManager.js in Discord-AIBot) */}
          <div className="jarvis-quick-prompts">
            {t.quickPrompts.map((prompt, index) => (
              <button
                key={index}
                className="jarvis-quick-btn"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
              >
                <Sparkles size={11} color="#0284c7" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="jarvis-input-area">
            {/* Attachment preview if selected */}
            {attachment && (
              <div className="jarvis-attachment-preview">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Paperclip size={13} /> {attachment.name}
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  onClick={() => setAttachment(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="jarvis-input-row">
              {/* File Attachment Button */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="jarvis-tool-btn"
                onClick={() => fileInputRef.current?.click()}
                title={t.attachFile}
              >
                <Paperclip size={16} />
              </button>

              {/* Voice Input Microphone Button */}
              <button
                type="button"
                className={`jarvis-tool-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleSpeechRecognition}
                title={isListening ? t.listening : t.voiceInput}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                className="jarvis-input-field"
                placeholder={isListening ? t.listening : t.inputPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              {/* Send Button */}
              <button
                type="button"
                className="jarvis-send-btn"
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && !attachment)}
                title={t.send}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Settings Modal Overlay */}
          {isSettingsOpen && (
            <div className="jarvis-settings-modal">
              <div className="jarvis-settings-card">
                <div className="jarvis-settings-header">
                  <h3>{t.settingsModal.title}</h3>
                  <button
                    className="jarvis-icon-btn"
                    style={{ color: '#0f172a' }}
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="jarvis-settings-group">
                  <label>{t.settingsModal.modelSelect}</label>
                  <select
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                  >
                    {AI_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="jarvis-settings-group">
                  <label>{t.settingsModal.languageSelect}</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                  >
                    {supportedLanguages.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} ({l.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="jarvis-settings-group">
                  <label>{t.settingsModal.apiKeyLabel}</label>
                  <input
                    type="password"
                    placeholder="e.g. AIzaSy... or sk-..."
                    value={settings.apiKey}
                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  />
                  <div className="jarvis-settings-help">
                    {t.settingsModal.apiKeyHelp}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    {t.settingsModal.save}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearChat}
                    title={t.clearChat}
                  >
                    <Trash2 size={14} /> {t.clearChat}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportChat}
                    title={t.exportChat}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
