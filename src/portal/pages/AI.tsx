import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUp,
  Bookmark,
  Bot,
  Check,
  ChevronDown,
  CircleStop,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Languages,
  Loader2,
  Lock,
  LockKeyhole,
  Menu,
  Mic,
  MicOff,
  PanelLeft,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  UserRound,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { api, streamAi, type AiSource, type ChatLanguage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NayaVoiceMode } from '@/components/ai/NayaVoiceMode';

type ChatMessageUI = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: AiSource[];
};

type ConversationSummary = { id: string; title: string; updatedAt: string };

type ModelMode = 'Naya Care' | 'Clinical Reason' | 'Relationship Guide';

const suggestionsByLang = {
  en: [
    { text: 'I feel anxious about intimacy. Where do I start?', icon: Stethoscope },
    { text: 'How do I know if I need a doctor or a counsellor?', icon: UserRound },
    { text: 'Help me find the right specialist for low desire.', icon: Sparkles },
    { text: 'What happens in a first confidential consultation?', icon: Clock },
  ],
  ta: [
    { text: 'உடலுறவு குறித்த பதற்றம் எனக்கு உள்ளது. எங்கு தொடங்குவது?', icon: Stethoscope },
    { text: 'எனக்கு மருத்துவர் தேவையா அல்லது ஆலோசகரா?', icon: UserRound },
    { text: 'குறைந்த பாலியல் விருப்பத்திற்கு சரியான நிபுணரை அறிய உதவுங்கள்.', icon: Sparkles },
    { text: 'முதல் ஆலோசனையில் என்ன நடக்கும்?', icon: Clock },
  ],
  tanglish: [
    { text: 'Intimacy pathi anxiety irukku. Enga start pannalaam?', icon: Stethoscope },
    { text: 'Doctor-a paakanuma illa counsellor-a?', icon: UserRound },
    { text: 'Low desire-ku endha specialist-a paakanum?', icon: Sparkles },
    { text: 'First consultation-la enna nadakkum?', icon: Clock },
  ],
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-3 font-sans text-sm sm:text-[15px] leading-relaxed text-slate-800">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const isBullet = /^[-•*]\s/.test(line);
        return (
          <p key={i} className={cn(isBullet && 'flex items-start gap-2.5 pl-2')}>
            {isBullet && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]" />}
            <span>
              {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j} className="font-bold text-[#0B3B82]">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={j}>{part.replace(/^[-•*]\s/, '')}</span>
                ),
              )}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1" aria-label="Naya is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-[#16A34A]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

export default function AI() {
  const { user } = useAuth();
  const { push } = useToast();

  // Core state
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [selectedModel, setSelectedModel] = useState<ModelMode>('Naya Care');
  const [activeTab, setActiveTab] = useState<'chat' | 'task'>('chat');

  // Sidebar & Search State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Extras
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await api<{ conversations: ConversationSummary[] }>('/ai/conversations');
      setHistory(data.conversations || []);
    } catch {
      /* non-critical */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function resetToNewChat() {
    setMobileSidebarOpen(false);
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setInput('');
    setClearModalOpen(false);
    inputRef.current?.focus();
  }

  const handleSendVoiceQuery = async (queryText: string, signal: AbortSignal): Promise<string> => {
    let answer = '';
    let replySources: AiSource[] | undefined;
    const newConvId = await streamAi(
      { message: queryText, conversationId, language, consent: true, voice: true },
      (token) => { answer += token; },
      signal,
      (sources) => { replySources = sources; },
    );
    if (signal.aborted || !answer.trim()) return '';
    const createdAt = new Date().toISOString();
    setMessages((previous) => [
      ...previous,
      { id: uid(), role: 'user', content: queryText, createdAt },
      { id: uid(), role: 'assistant', content: answer, createdAt, sources: replySources },
    ]);
    if (newConvId) setConversationId(newConvId);
    void loadHistory();
    return answer;
  };

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    if (message.length > 2000) {
      push({
        title: 'Message too long',
        description: 'Naya can read up to 2,000 characters at a time.',
        tone: 'error',
      });
      return;
    }

    const userMessage: ChatMessageUI = {
      id: uid(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    const assistantId = uid();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
    ]);
    setInput('');
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const id = await streamAi(
        { message, conversationId, language, consent: true },
        (token) => {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === assistantId ? { ...item, content: item.content + token } : item,
            ),
          );
        },
        controller.signal,
        (sources) =>
          setMessages((prev) =>
            prev.map((item) => (item.id === assistantId ? { ...item, sources } : item)),
          ),
      );
      if (id) {
        setConversationId(id);
      }
      void loadHistory();
    } catch (err) {
      if (controller.signal.aborted) return;
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content:
                  'I could not reach the clinical wellness service just now. Please try again in a moment. If this is an emergency, contact emergency medical services (112 in India) directly.',
              }
            : item,
        ),
      );
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }

  async function loadConversation(id: string) {
    try {
      const data = await api<{
        conversation: { id: string; language: string };
        messages: { id: string; role: string; content: string; createdAt: string }[];
      }>(`/ai/conversations/${id}`);
      setConversationId(data.conversation.id);
      const savedLang = data.conversation.language;
      setLanguage(savedLang === 'ta' || savedLang === 'tanglish' ? savedLang : 'en');
      setMessages(
        data.messages.map((m) => ({
          id: m.id,
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          createdAt: m.createdAt,
        })),
      );
    } catch {
      push({ title: 'Could not load conversation', tone: 'error' });
    }
  }

  async function deleteConversation(id: string) {
    try {
      await api(`/ai/conversations/${id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (conversationId === id) resetToNewChat();
      push({ title: 'Conversation deleted', tone: 'success' });
    } catch {
      push({ title: 'Could not delete conversation', tone: 'error' });
    }
  }

  function copyToClipboard(id: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredHistory = history.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasMessages = messages.length > 0;

  useEffect(() => {
    document.documentElement.classList.add('ai-chat-page-active');
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const root = document.documentElement;
      if (window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches) {
        root.style.setProperty('--naya-mobile-height', `${viewport?.height ?? window.innerHeight}px`);
        root.style.setProperty('--naya-mobile-top', `${viewport?.offsetTop ?? 0}px`);
      } else {
        root.style.removeProperty('--naya-mobile-height');
        root.style.removeProperty('--naya-mobile-top');
      }
    };
    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      document.documentElement.classList.remove('ai-chat-page-active');
      document.documentElement.style.removeProperty('--naya-mobile-height');
      document.documentElement.style.removeProperty('--naya-mobile-top');
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return (
    <>
      <Seo
        title="Naya AI — Private Clinical Wellness Companion — Nayacura"
        description="Confidential sexual health and relationship guidance in English, Tamil, and Tanglish."
      />

      <div id="ai-workspace" className="fixed inset-0 z-20 flex h-full w-full overflow-hidden bg-slate-50 font-sans text-slate-800">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside
          id="naya-chat-sidebar"
          className={cn(
            'absolute inset-y-0 left-0 z-50 w-[min(280px,85%)] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-xl lg:shadow-none lg:static lg:w-[280px]',
            mobileSidebarOpen ? 'flex' : 'hidden',
            sidebarOpen ? 'lg:flex' : 'lg:hidden',
          )}
        >
          <div className="flex h-full min-h-0 w-full flex-col justify-between overflow-hidden">
            
            {/* Sidebar Top: Logo + Controls */}
            <div>
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
                <Link to="/" className="flex items-center gap-2 group">
                  <img
                    src="/logo.png"
                    alt="Nayacura"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="rounded-md bg-emerald-100 text-[#15803D] border border-emerald-200 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    AI
                  </span>
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSearchActive(!searchActive)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Search chats"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (mobileSidebarOpen) setMobileSidebarOpen(false);
                      else setSidebarOpen(false);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sidebar "+ New chat" Button */}
              <div className="p-3">
                <button
                  type="button"
                  onClick={resetToNewChat}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-4 py-3 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-101"
                >
                  <Plus className="h-4 w-4" />
                  <span>New chat</span>
                </button>
              </div>

              {/* Quick Links List */}
              <div className="px-3 py-1 space-y-1 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setLibraryModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#15803D] transition-colors"
                >
                  <Bookmark className="h-4 w-4 text-[#16A34A]" />
                  <span>Library & Insights</span>
                </button>
                <Link
                  to="/consult-sexologist"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#15803D] transition-colors"
                >
                  <Stethoscope className="h-4 w-4 text-[#0B3B82]" />
                  <span>Find Specialists</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSafetyModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#15803D] transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                  <span>Clinical Safety</span>
                </button>
              </div>

              {/* Search input (if toggled) */}
              {searchActive && (
                <div className="px-3 pt-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search recent conversations..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#16A34A] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-[140px]">
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Recent Chats</span>
                <Filter className="h-3 w-3" />
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-[#16A34A]" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="px-2 py-6 text-center">
                  <p className="text-xs font-medium text-slate-500">No stored conversations</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Your conversations appear here when saved to your account.
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const isActive = conversationId === item.id;
                  return (
                    <div key={item.id} className="group relative flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileSidebarOpen(false);
                          void loadConversation(item.id);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors pr-8 truncate font-medium',
                          isActive
                            ? 'bg-[#E8F8EE] text-[#15803D] font-bold'
                            : 'text-slate-700 hover:bg-slate-50',
                        )}
                      >
                        <span className="truncate">{item.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item.id);
                        }}
                        className="absolute right-1.5 p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom: User Profile */}
            <div className="border-t border-slate-100 p-3 bg-slate-50/50">
              <div className="flex items-center justify-between rounded-2xl p-2 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0B3B82] to-[#16A34A] text-xs font-bold text-white shadow-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#0B3B82]">
                      {user?.name || 'Private Guest'}
                    </p>
                    <p className="truncate text-[10px] font-semibold text-[#16A34A]">
                      {user ? 'Nayacura Member' : '100% Anonymous'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSafetyModalOpen(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Settings & Privacy"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close chat sidebar"
            className="absolute inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ================= MAIN CHAT WORKSPACE ================= */}
        <div className="relative z-0 flex min-w-0 flex-1 flex-col h-full min-h-0 overflow-hidden bg-gradient-to-b from-emerald-50/20 via-white to-slate-50">
          
          {/* Top Navbar */}
          <header className="ai-mobile-header flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-8 shrink-0 shadow-2xs">
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Open chat sidebar"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors lg:block"
                  title="Expand sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Nayacura
              </Link>
            </div>

            <div className="ai-header-controls flex flex-wrap items-center gap-2.5">
              
              {/* Model Mode Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:border-emerald-300 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{selectedModel}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-30">
                    {(['Naya Care', 'Clinical Reason', 'Relationship Guide'] as ModelMode[]).map(
                      (mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setSelectedModel(mode);
                            setModelDropdownOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors',
                            selectedModel === mode
                              ? 'bg-emerald-50 text-[#15803D] font-bold'
                              : 'text-slate-700 hover:bg-slate-50',
                          )}
                        >
                          <span>{mode}</span>
                          {selectedModel === mode && <Check className="h-3.5 w-3.5 text-[#16A34A]" />}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <div className="ai-language-switcher flex items-center rounded-full border border-slate-200 bg-slate-100 p-0.5 text-xs" aria-label="Chat language">
                {(['en', 'ta', 'tanglish'] as ChatLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    aria-pressed={language === lang}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold transition-all',
                      language === lang
                        ? 'bg-white text-[#15803D] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900',
                    )}
                  >
                    {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'Tanglish'}
                  </button>
                ))}
              </div>

              {/* Consultation Link */}
              <Link
                to="/consult-sexologist"
                className="inline-flex items-center gap-1.5 rounded-full !bg-[#16A34A] hover:!bg-[#15803D] px-4 py-1.5 text-xs font-bold !text-white shadow-sm hover:shadow-md transition-colors"
                style={{ backgroundColor: '#16A34A', color: '#ffffff' }}
              >
                <span className="text-white">Book a doctor</span>
                <span className="text-xs text-white">↗</span>
              </Link>
            </div>
          </header>

          {/* ================= CHAT STREAM OR ZERO-STATE ================= */}
          <div
            ref={scrollRef}
            className="ai-message-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain overflow-x-hidden px-4 py-6 sm:px-8 flex flex-col"
          >
            {!hasMessages ? (
              /* ================= ZERO STATE: NAYACURA CLEAN HERO ================= */
              <div className="flex min-h-full my-auto flex-col items-center justify-center max-w-3xl mx-auto py-8 text-center animate-fade-in">
                
                {/* Greeting Title */}
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0B3B82] mb-3">
                  {language === 'ta' ? (
                    <>
                      உங்கள் தனிப்பட்ட இடம், <span className="text-[#16A34A]">உங்கள் உரையாடல்</span>
                    </>
                  ) : language === 'tanglish' ? (
                    <>
                      Unga Space, <span className="text-[#16A34A]">Unga Conversation</span>
                    </>
                  ) : (
                    <>
                      Your Space, <span className="text-[#16A34A]">Your Conversation</span>
                    </>
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto mb-8">
                  {language === 'ta'
                    ? '100% ரகசிய பாலியல் நல்வாழ்வு AI உதவியாளர். எதையும் தயக்கமின்றி தமிழில் கேளுங்கள்.'
                    : language === 'tanglish'
                      ? '100% confidential sexual wellness companion. Unga queries-a Tanglish-la tharaalama kelunga.'
                      : '100% confidential clinical intimate health companion. Ask freely in English, தமிழ், or Tanglish.'}
                </p>

                {/* Main Prompt Capsule */}
                <div className="w-full max-w-2xl rounded-full border-2 border-emerald-400 bg-white p-2 sm:p-2.5 shadow-xl hover:border-emerald-500 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15 transition-all mb-5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send();
                    }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setLibraryModalOpen(true)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#0B3B82] transition-colors"
                      title="Attach or explore library"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    <input
                      ref={inputRef as any}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        language === 'tanglish'
                          ? 'Ask Naya something private...'
                          : language === 'ta'
                            ? 'நயாவிடம் தனிப்பட்டதாகக் கேளுங்கள்...'
                            : 'Ask Naya any intimate health doubt...'
                      }
                      aria-label="Your message to Naya"
                      className="min-w-0 flex-1 bg-transparent px-2 text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />

                    {/* Voice Mode Button */}
                    <button
                      type="button"
                      onClick={() => setVoiceModeOpen(true)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-emerald-600 hover:bg-emerald-50 transition-all group"
                      title="Open Naya Voice Mode"
                    >
                      <Mic className="h-5 w-5 transition-transform group-hover:scale-110" />
                    </button>

                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-md transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-[#16A34A]"
                    >
                      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
                    </button>
                  </form>
                </div>

                {/* Mode Switcher Tabs (Chat | Specialist Guide) */}
                <div className="flex items-center gap-2 mb-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                      activeTab === 'chat'
                        ? 'bg-[#0B3B82] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    💬 Clinical Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('task')}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                      activeTab === 'task'
                        ? 'bg-[#0B3B82] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    🩺 Specialist Guide
                  </button>
                </div>

                {/* Suggestion Prompts List (2-Column Clean White Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-left">
                  {suggestionsByLang[language].map(({ text, icon: Icon }) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => void send(text)}
                      className="flex items-center gap-3.5 p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-[#16A34A] shadow-xs hover:shadow-md transition-all duration-200 group text-left"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition-all shadow-2xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#0B3B82] transition-colors leading-snug">
                        {text}
                      </span>
                    </button>
                  ))}
                </div>

              </div>
            ) : (
              /* ================= ACTIVE CONVERSATION STREAM ================= */
              <div className="max-w-3xl mx-auto space-y-7 py-6 pb-28">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div key={message.id} className="w-full">
                      {isUser ? (
                        <div className="flex w-full justify-end">
                          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#0B3B82] text-white px-5 py-3.5 text-sm sm:text-[15px] font-medium shadow-sm">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full items-start gap-4">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] shadow-xs mt-0.5">
                            <Sparkles className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
                            {!message.content ? (
                              <TypingDots />
                            ) : (
                              <RichText text={message.content} />
                            )}

                            {/* Citations / Sources */}
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-4 border-t border-slate-100 pt-3">
                                <p className="text-[11px] font-extrabold text-[#15803D] uppercase tracking-wider">
                                  Related Clinical References
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {message.sources.map(({ title, url }, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-semibold text-[#15803D] hover:bg-emerald-100 transition-colors"
                                    >
                                      <span>{title}</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Message Action Toolbar */}
                            {message.content && (
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(message.id, message.content)}
                                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                  title="Copy response"
                                >
                                  {copiedId === message.id ? (
                                    <Check className="h-4 w-4 text-[#16A34A]" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-[#16A34A] transition-colors"
                                  title="Good response"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-rose-500 transition-colors"
                                  title="Poor response"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {sending && messages[messages.length - 1]?.content && (
                  <div className="flex items-center gap-2 pl-14 text-xs font-semibold text-slate-500">
                    <TypingDots />
                    <span>Naya is reflecting on your question…</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= DOCKED BOTTOM INPUT BAR (Active Chat Mode) ================= */}
          {hasMessages && (
            <div className="ai-composer shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8 z-30 shadow-lg">
              <div className="max-w-3xl mx-auto space-y-2">
                <div className="rounded-full border-2 border-emerald-400 bg-white px-4 py-2 shadow-md transition-all focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send();
                    }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setLibraryModalOpen(true)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#0B3B82] transition-colors"
                      title="Attach or explore library"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void send();
                        }
                      }}
                      placeholder="Ask Naya a follow up question..."
                      className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 font-sans text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setVoiceModeOpen(true)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-emerald-600 hover:bg-emerald-50 transition-all group"
                      title="Open Naya Voice Mode"
                    >
                      <Mic className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>

                    {sending ? (
                      <button
                        type="button"
                        onClick={() => abortRef.current?.abort()}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                        title="Stop generating"
                      >
                        <CircleStop className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                        title="Send message"
                      >
                        <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= CLINICAL SAFETY MODAL ================= */}
      <Modal
        open={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        title="Clinical Safety & Boundaries"
        description="Nayacura is committed to medical rigor, confidentiality, and clear clinical boundaries."
      >
        <div className="space-y-4 text-xs font-sans text-slate-600">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <p className="font-bold text-[#15803D] flex items-center gap-1.5 text-sm">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" /> What Naya Can Do
            </p>
            <ul className="space-y-1 list-disc pl-4 text-slate-700 leading-relaxed font-medium">
              <li>Explain sexual health terminology, reproductive wellness, and emotional intimacy.</li>
              <li>Help guide you toward the right specialist category (Sexologist, Gynecologist, Counsellor).</li>
              <li>Assist in English, Tamil, and Tanglish.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
            <p className="font-bold text-rose-700 flex items-center gap-1.5 text-sm">
              <ShieldAlert className="h-4 w-4 text-rose-600" /> What Naya Cannot Do
            </p>
            <ul className="space-y-1 list-disc pl-4 text-slate-700 leading-relaxed font-medium">
              <li>Cannot diagnose any clinical illness or psychological disorder.</li>
              <li>Cannot prescribe pharmaceuticals or alter dosages.</li>
              <li>Cannot replace direct consultations with a verified Nayacura doctor.</li>
              <li>Not for emergency situations or acute crises.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setSafetyModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= LIBRARY MODAL ================= */}
      <Modal
        open={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        title="Nayacura Wellness Library"
        description="Explore verified clinical topics and guides."
      >
        <div className="space-y-3 text-xs">
          {[
            { title: 'Intimacy and Anxiety', desc: 'Understanding performance concerns and emotional safety.' },
            { title: 'Choosing Between Doctor vs Counsellor', desc: 'When medical therapy is needed vs relational therapy.' },
            { title: 'Consultation Privacy Protocol', desc: 'How Nayacura protects your consultation records and video rooms.' },
          ].map((topic, i) => (
            <div
              key={i}
              onClick={() => {
                setLibraryModalOpen(false);
                void send(`Tell me about ${topic.title}`);
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all shadow-2xs"
            >
              <p className="font-bold text-[#0B3B82] group-hover:text-[#16A34A] transition-colors text-sm">
                {topic.title}
              </p>
              <p className="mt-1 font-medium text-slate-600">{topic.desc}</p>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setLibraryModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= CLEAR CHAT MODAL ================= */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear this conversation?"
        description="This will clear the current messages on your screen."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={() => setClearModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={resetToNewChat}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Clear Messages
          </Button>
        </div>
      </Modal>

      {/* ================= DELETE STORED CHAT MODAL ================= */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete conversation permanently?"
        description="This permanently removes this conversation from your private account history."
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteTarget && void deleteConversation(deleteTarget)}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>

      {/* ================= VOICE MODE ================= */}
      <NayaVoiceMode
        isOpen={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
        language={language}
        onSendQuery={handleSendVoiceQuery}
      />
    </>
  );
}
