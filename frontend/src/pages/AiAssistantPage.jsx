// AiAssistantPage.jsx - Dedicated Full-Screen Multilingual AI Workspace for CareTrail
// Inspired by Javis603/Discord-AIBot architecture

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Globe,
  Brain,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Paperclip,
  Trash2,
  Download,
  Settings,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { supportedLanguages, chatLocales } from '../locales/chatLocales';
import {
  AI_MODELS,
  getStoredSettings,
  saveStoredSettings,
  sendChatMessage,
  speakText,
  stopSpeaking
} from '../services/aiChatService';
import '../components/ChatbotWidget.css';

export const AiAssistantPage = () => {
  const [settings, setSettings] = useState(getStoredSettings);
  const currentLang = settings.language || 'en';
  const t = chatLocales[currentLang] || chatLocales.en;

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('jarvis_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
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
  const [customKey, setCustomKey] = useState(settings.apiKey || '');
  const [savedKeyNotification, setSavedKeyNotification] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('jarvis_chat_messages', JSON.stringify(messages));
  }, [messages]);

  const updateSettings = (partial) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleSaveApiKey = () => {
    updateSettings({ apiKey: customKey });
    setSavedKeyNotification(true);
    setTimeout(() => setSavedKeyNotification(false), 3000);
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

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
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
        console.error(err);
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
    const curAttachment = attachment;
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
        attachment: curAttachment
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
        content: `❌ Error: ${error.message}. Please retry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    stopSpeaking();
    setSpeakingId(null);
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: t.welcomeGreeting,
        thinkingProcess: '',
        citations: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    localStorage.removeItem('jarvis_chat_messages');
  };

  const handleExport = () => {
    const transcript = messages.map(m => `### ${m.role.toUpperCase()} [${m.timestamp}]\n${m.content}\n\n`).join('---\n');
    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `caretrail-ai-chat-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeModelObj = AI_MODELS.find(m => m.id === settings.model) || AI_MODELS[0];

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1240px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> CareTrail Jarvis 2.0 AI Core
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {t.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.25rem 0 0' }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} title={t.exportChat}>
            <Download size={15} /> {t.exportChat}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleClear} title={t.clearChat}>
            <Trash2 size={15} /> {t.clearChat}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Sidebar: Controls & Library */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Model & Language Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={16} /> Configuration Hub
            </h3>

            {/* Language Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                {t.settingsModal.languageSelect}
              </label>
              <select
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                value={currentLang}
                onChange={(e) => updateSettings({ language: e.target.value })}
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                {t.settingsModal.modelSelect}
              </label>
              <select
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
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

            {/* Feature Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} color="#0284c7" /> {t.webSearch}
                </span>
                <input
                  type="checkbox"
                  checked={settings.webSearch}
                  onChange={(e) => updateSettings({ webSearch: e.target.checked })}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Brain size={14} color="#8b5cf6" /> {t.deepThinking}
                </span>
                <input
                  type="checkbox"
                  checked={settings.deepThinking}
                  onChange={(e) => updateSettings({ deepThinking: e.target.checked })}
                />
              </label>
            </div>

            {/* Custom API Key Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                {t.settingsModal.apiKeyLabel}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="password"
                  placeholder="AIza... or sk-..."
                  style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSaveApiKey} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                  Save
                </button>
              </div>
              {savedKeyNotification && (
                <div style={{ color: '#16a34a', fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Key updated!
                </div>
              )}
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                {t.settingsModal.apiKeyHelp}
              </div>
            </div>
          </div>

          {/* Prompt Library */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#0f172a' }}>
              ⚡ Clinical Prompt Library
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {t.quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', justifyContent: 'flex-start', textAlign: 'left', lineHeight: 1.3 }}
                  onClick={() => handleSend(p)}
                  disabled={isLoading}
                >
                  <Sparkles size={12} color="#0284c7" style={{ flexShrink: 0 }} /> {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Chat Workspace */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '700px', padding: 0, overflow: 'hidden' }}>
          {/* Chat Workspace Header */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Active Model: {activeModelObj.name} • {t.statusOnline}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '9999px' }}>
                {supportedLanguages.find(l => l.code === currentLang)?.flag} {supportedLanguages.find(l => l.code === currentLang)?.name}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="jarvis-messages-container" style={{ flex: 1, padding: '20px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`jarvis-message-wrapper ${msg.role}`} style={{ maxWidth: '85%' }}>
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

                <div className="jarvis-message-bubble">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>

                  {msg.attachment && (
                    <div style={{ marginTop: 8, fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Paperclip size={12} /> {msg.attachment.name} ({(msg.attachment.size / 1024).toFixed(1)} KB)
                    </div>
                  )}

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

                <div className="jarvis-message-meta">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      className="jarvis-speech-btn"
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                    >
                      {speakingId === msg.id ? <VolumeX size={13} color="#ef4444" /> : <Volume2 size={13} />}
                      <span>{speakingId === msg.id ? t.stopSpeaking : t.speakResponse}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

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

          {/* Input Area */}
          <div className="jarvis-input-area" style={{ padding: '16px 20px' }}>
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
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={(e) => e.target.files?.[0] && setAttachment(e.target.files[0])}
              />
              <button
                type="button"
                className="jarvis-tool-btn"
                onClick={() => fileInputRef.current?.click()}
                title={t.attachFile}
              >
                <Paperclip size={18} />
              </button>

              <button
                type="button"
                className={`jarvis-tool-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleSpeech}
                title={isListening ? t.listening : t.voiceInput}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                className="jarvis-input-field"
                placeholder={isListening ? t.listening : t.inputPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                disabled={isLoading}
              />

              <button
                type="button"
                className="jarvis-send-btn"
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && !attachment)}
                title={t.send}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
