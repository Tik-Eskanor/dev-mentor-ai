import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  User,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  FileCode,
  ArrowDown,
  Play,
  CheckCircle2,
  ChevronDown,
  Layers,
  Shield,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { ChatMessage, Language, MentorPersonaId } from '../types';
import { MENTOR_PERSONAS } from '../data/defaultData';
import { requestPairChat } from '../services/mentorApi';

interface MentorChatProps {
  code: string;
  language: Language;
  activePersona: MentorPersonaId;
  onPersonaChange: (persona: MentorPersonaId) => void;
  onApplyCodeToEditor: (code: string) => void;
  onRunCode?: (code: string, language: Language) => void;
}

const CHAT_STORAGE_KEY_PREFIX = 'devmentor_chat_history_';

export const MentorChat: React.FC<MentorChatProps> = ({
  code,
  language,
  activePersona,
  onPersonaChange,
  onApplyCodeToEditor,
  onRunCode,
}) => {
  const currentPersona = MENTOR_PERSONAS[activePersona] || MENTOR_PERSONAS.architect;

  // Local storage chat persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`${CHAT_STORAGE_KEY_PREFIX}${activePersona}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `${currentPersona.greeting}\n\nI am actively inspecting your **${language}** code. Ask me about architecture trade-offs, security hardening, algorithmic optimization, or design patterns.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedSnippetKey, setCopiedSnippetKey] = useState<string | null>(null);
  const [appliedSnippetKey, setAppliedSnippetKey] = useState<string | null>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${CHAT_STORAGE_KEY_PREFIX}${activePersona}`, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, activePersona]);

  // Handle scroll detection
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setIsUserScrolledUp(!isNearBottom);
  };

  // Scroll to bottom when new messages arrive if not scrolled up
  useEffect(() => {
    if (!isUserScrolledUp) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, isUserScrolledUp]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolledUp(false);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsChatLoading(true);
    setIsUserScrolledUp(false);

    try {
      const response = await requestPairChat({
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        code,
        language,
        persona: activePersona,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an issue processing your request. Please try again or rephrase your query.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRegenerateLast = async () => {
    if (isChatLoading) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[actualIdx];

    // Remove responses after that user message
    const trimmed = messages.slice(0, actualIdx + 1);
    setMessages(trimmed);
    setIsChatLoading(true);

    try {
      const response = await requestPairChat({
        messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
        code,
        language,
        persona: activePersona,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Regenerate error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear chat history with this mentor?')) {
      const resetMessages: ChatMessage[] = [
        {
          id: 'welcome',
          role: 'assistant',
          content: `${currentPersona.greeting}\n\nChat history reset. How can I assist you with your **${language}** project today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setMessages(resetMessages);
      try {
        localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}${activePersona}`);
      } catch {
        // ignore
      }
    }
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `### ${m.role === 'user' ? 'Developer' : currentPersona.name} (${m.timestamp})\n\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devmentor-${activePersona}-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetKey(key);
    setTimeout(() => setCopiedSnippetKey(null), 2000);
  };

  const handleApplyCode = (codeText: string, key: string) => {
    onApplyCodeToEditor(codeText);
    setAppliedSnippetKey(key);
    setTimeout(() => setAppliedSnippetKey(null), 2500);
  };

  // Dynamic suggested prompts per persona
  const getSuggestedPrompts = () => {
    switch (activePersona) {
      case 'architect':
        return [
          '📐 Assess SOLID principles in this code',
          '⚡ How to decouple side effects & dependencies?',
          '🧩 Suggest a clean modular domain architecture',
          '🔄 How would this scale under heavy concurrent load?',
        ];
      case 'security':
        return [
          '🛡️ Check for OWASP Top 10 vulnerabilities',
          '🔒 Zero-Trust: Are inputs properly sanitized?',
          '🧼 Audit memory leaks & unclosed handles',
          '🚨 Potential injection or boundary overflow risks?',
        ];
      case 'performance':
        return [
          '📊 Analyze Big-O Time and Space complexity',
          '⏱️ Optimize the hottest execution loop',
          '🧠 Reduce heap memory allocations & garbage collection',
          '⚡ How to leverage async non-blocking concurrency?',
        ];
      case 'tutor':
      default:
        return [
          '💡 Explain this logic step-by-step with analogies',
          '❓ Socratic Challenge: Quiz me on this function',
          '🌱 What are beginner pitfalls in this pattern?',
          '📝 Add comprehensive docstrings and comments',
        ];
    }
  };

  const codeLineCount = code.split('\n').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#161b22] overflow-hidden min-h-0 text-slate-100 font-sans">
      {/* Header & Persona Selector Bar */}
      <div className="p-3 bg-[#0d1117] border-b border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
        {/* Persona Selector Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition"
          >
            <span className="text-base flex-shrink-0">{currentPersona.avatar}</span>
            <div className="text-left min-w-0">
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <span className="truncate">{currentPersona.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-[10px] text-indigo-400 font-normal truncate">
                {currentPersona.title}
              </div>
            </div>
          </button>

          {/* Persona Menu Dropdown */}
          {showPersonaMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-64 p-1.5 rounded-xl bg-[#161b22] border border-slate-700 shadow-2xl z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Mentor Persona
              </div>
              {(Object.keys(MENTOR_PERSONAS) as MentorPersonaId[]).map((pId) => {
                const p = MENTOR_PERSONAS[pId];
                const isSelected = pId === activePersona;
                return (
                  <button
                    key={pId}
                    onClick={() => {
                      onPersonaChange(pId);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 transition ${
                      isSelected
                        ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{p.avatar}</span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action icons: Export, Clear, Context indicator */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">●</span>
            <span>{language}</span>
            <span>•</span>
            <span>{codeLineCount} lines</span>
          </div>

          <button
            onClick={handleExportChat}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition text-xs"
            title="Export chat transcript as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition text-xs"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 text-xs min-h-0 relative"
      >
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center py-1.5 px-3 rounded-lg bg-slate-900/60 text-slate-400 text-[11px] border border-slate-800/80"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm ${
                  isAssistant
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {isAssistant ? currentPersona.avatar : <User className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-md space-y-2 ${
                  isAssistant
                    ? 'bg-[#0d1117] text-slate-200 border border-slate-800'
                    : 'bg-indigo-600 text-white font-sans'
                }`}
              >
                {/* Message Header (for assistant) */}
                {isAssistant && (
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 text-[10px] text-slate-400">
                    <span className="font-semibold text-indigo-300">{currentPersona.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText(msg.content, `msg-${msg.id}`)}
                        className="hover:text-slate-200 flex items-center gap-0.5"
                        title="Copy message"
                      >
                        {copiedSnippetKey === `msg-${msg.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Content with Markdown */}
                <div className="text-xs leading-relaxed overflow-x-auto">
                  {isAssistant ? (
                    <div className="space-y-2">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');

                            if (!inline && (match || codeString.includes('\n'))) {
                              const snippetLang = match ? match[1] : language;
                              const snippetKey = `code-${msg.id}-${codeString.slice(0, 20)}`;

                              return (
                                <div className="my-2.5 rounded-xl border border-slate-800 bg-[#161b22] overflow-hidden">
                                  {/* Code Header Actions */}
                                  <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                    <span className="uppercase text-indigo-400 font-bold">
                                      {snippetLang}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleCopyText(codeString, snippetKey)}
                                        className="flex items-center gap-1 hover:text-slate-200 transition font-sans text-[11px]"
                                      >
                                        {copiedSnippetKey === snippetKey ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span className="text-emerald-300">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy</span>
                                          </>
                                        )}
                                      </button>

                                      <button
                                        onClick={() => handleApplyCode(codeString, snippetKey)}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-[10px] font-semibold transition"
                                      >
                                        {appliedSnippetKey === snippetKey ? (
                                          <>
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Applied</span>
                                          </>
                                        ) : (
                                          <>
                                            <FileCode className="w-3 h-3" />
                                            <span>Apply to Editor</span>
                                          </>
                                        )}
                                      </button>

                                      {onRunCode && (
                                        <button
                                          onClick={() =>
                                            onRunCode(codeString, (snippetLang as Language) || language)
                                          }
                                          className="p-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition"
                                          title="Run in sandbox"
                                        >
                                          <Play className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed scrollbar-thin">
                                    <code>{codeString}</code>
                                  </pre>
                                </div>
                              );
                            }

                            return (
                              <code
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          p({ children }) {
                            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                          },
                          ul({ children }) {
                            return <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>;
                          },
                          ol({ children }) {
                            return <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>;
                          },
                          li({ children }) {
                            return <li className="leading-relaxed">{children}</li>;
                          },
                          strong({ children }) {
                            return <strong className="font-bold text-indigo-300">{children}</strong>;
                          },
                          h3({ children }) {
                            return (
                              <h3 className="font-bold text-slate-100 text-xs sm:text-sm mt-2 mb-1">
                                {children}
                              </h3>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-xs break-words">
                      {msg.content}
                    </div>
                  )}
                </div>

                {!isAssistant && (
                  <div className="text-[10px] text-indigo-200/80 text-right">{msg.timestamp}</div>
                )}
              </div>
            </div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0d1117] border border-slate-800 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 flex-shrink-0" />
            <span>{currentPersona.name} is formulating architectural review...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {isUserScrolledUp && (
        <div className="flex justify-center -mt-8 mb-2 relative z-10">
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white shadow-lg text-xs font-semibold hover:bg-indigo-500 transition animate-bounce"
          >
            <ArrowDown className="w-3 h-3" />
            <span>New messages</span>
          </button>
        </div>
      )}

      {/* Socratic Prompt Suggestions Carousel */}
      <div className="px-3 py-2 bg-[#0d1117] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none flex-shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex-shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Prompts:
        </span>
        {getSuggestedPrompts().map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isChatLoading}
            className="px-2.5 py-1 min-h-[30px] rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-200 border border-slate-800 whitespace-nowrap transition flex-shrink-0 text-[11px] font-medium disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-[#0d1117] border-t border-slate-800 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${currentPersona.name} anything about your ${language} code... (Shift+Enter for newline)`}
            className="flex-1 px-3 py-2.5 min-h-[42px] max-h-32 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
          />

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {messages.length > 2 && (
              <button
                type="button"
                onClick={handleRegenerateLast}
                disabled={isChatLoading}
                className="p-2.5 min-h-[42px] min-w-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition flex items-center justify-center"
                title="Regenerate last answer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!inputMessage.trim() || isChatLoading}
              className="p-2.5 min-h-[42px] min-w-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition shadow-md shadow-indigo-600/20 flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
