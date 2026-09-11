import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell } from "../components/AppShell";
import { api } from "../lib/api";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Search as SearchIcon,
  Database
} from "lucide-react";

// --- Types ---
type Role = "user" | "ai";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  isError?: boolean;
  retrieval?: RetrievalMetadata;
}

interface RetrievedSource {
  title: string;
  url: string;
  publicationDate?: string | null;
  sourceName?: string | null;
}

interface RetrievalMetadata {
  required: boolean;
  succeeded: boolean;
  retrievedAt: string;
  confidence: string;
  sources: RetrievedSource[];
  notice?: string | null;
}

const SUGGESTED_PROMPTS = [
  "Summarize the current threat levels across high-risk states.",
  "What states have the highest rates of crimes against women?",
  "Correlate the chargesheet rate with the overall crime rate in Kerala.",
  "Give me a tactical briefing on cyber intrusions in Maharashtra.",
];

// --- Reusable Components ---

function TypingIndicator() {
  return (
    <div className="flex w-full justify-start animate-in fade-in duration-300 mb-8">
      <div className="flex space-x-4 max-w-[85%] md:max-w-[80%]">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center mt-1">
          <Bot className="h-5 w-5 text-[#7c3aed]" />
        </div>
        <div className="bg-white border border-black/[0.06] p-5 rounded-xl shadow-sm text-[#444] text-sm w-full md:w-[400px]">
          <div className="flex items-center gap-2 mb-3 border-b border-black/[0.04] pb-3">
            <Loader2 className="h-4 w-4 animate-spin text-[#7c3aed]" />
            <span className="font-bold tracking-widest uppercase text-xs text-[#7c3aed]">Analyzing Intelligence</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <SearchIcon className="h-3 w-3" />
              <span>Retrieving classified records...</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <ShieldCheck className="h-3 w-3" />
              <span>Correlating intelligence...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple text formatter to handle basic markdown-like structures
const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc marker:text-[#888] pl-5 space-y-1 mb-4">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Empty line
    if (!trimmed) {
      flushList();
      // elements.push(<div key={index} className="h-2"></div>);
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      currentList.push(
        <li key={index} className="text-[#333] leading-relaxed">
          {trimmed.substring(2)}
        </li>
      );
      return;
    }
    
    // Flush list if we hit a non-list item
    flushList();

    // Bold Headers (### Header or **Header**)
    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={index} className="text-sm font-bold text-[#111] mt-6 mb-3">{trimmed.replace('### ', '')}</h4>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={index} className="text-base font-bold text-[#111] mt-8 mb-4 border-b border-black/[0.06] pb-2">{trimmed.replace('## ', '')}</h3>);
      return;
    }
    
    // All caps structural headers (e.g. KEY FINDINGS)
    if (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && !trimmed.includes('HTTP')) {
      elements.push(<h4 key={index} className="text-xs font-bold text-[#666] tracking-widest mt-8 mb-3 uppercase">{trimmed}</h4>);
      return;
    }

    // Paragraph
    // handle bold text basic replacement
    const parts = trimmed.split(/(\*\*.*?\*\*)/g);
    elements.push(
      <p key={index} className="mb-4 text-[#333] leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-[#111]">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });

  flushList();
  return <>{elements}</>;
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end animate-in fade-in slide-in-from-bottom-2 duration-300 mb-8">
        <div className="flex items-center space-x-3 max-w-[85%] md:max-w-[60%] flex-row-reverse space-x-reverse">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#111] flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="bg-white border border-black/[0.06] p-4 text-[#111] text-[15px] font-medium shadow-sm rounded-2xl rounded-tr-sm">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // AI Briefing Style
  return (
    <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 mb-12">
      <div className="flex space-x-4 w-full md:max-w-[85%]">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center mt-1">
          <Bot className="h-5 w-5 text-[#7c3aed]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-black/[0.06] shadow-sm rounded-xl overflow-hidden">
            
            {/* Briefing Header */}
            <div className="bg-[#f8f9fa] border-b border-black/[0.04] px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7c3aed]" />
                <span className="text-[11px] font-bold tracking-widest text-[#555] uppercase">Intelligence Assessment</span>
              </div>
              {message.retrieval?.confidence && (
                <span className="text-[10px] font-mono tracking-wider bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20 px-2 py-0.5 rounded-full uppercase">
                  Confidence: {message.retrieval.confidence}
                </span>
              )}
            </div>
            
            {/* Briefing Content */}
            <div className="p-6">
              {message.isError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{message.content}</span>
                </div>
              )}
              
              {!message.isError && (
                <div className="text-[15px]">
                  {renderFormattedContent(message.content)}
                </div>
              )}
            </div>

            {/* Sources Section */}
            {!message.isError && message.retrieval?.succeeded && message.retrieval.sources && message.retrieval.sources.length > 0 && (
              <div className="bg-[#f8f9fa] border-t border-black/[0.04] p-6">
                <h4 className="text-[11px] font-bold text-[#666] tracking-widest uppercase mb-4 flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  Sources Consulted
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {message.retrieval.sources.map((source, idx) => (
                    <a
                      key={`${source.url}-${idx}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group bg-white border border-black/[0.06] hover:border-black/[0.15] hover:shadow-sm transition-all rounded-lg p-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-[#111] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {source.title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#888] flex-shrink-0 mt-0.5" />
                      </div>
                      
                      <div className="flex items-center gap-3 text-[11px] text-[#666] font-mono mt-auto pt-1">
                        {source.sourceName && (
                          <span className="uppercase tracking-wide">{source.sourceName}</span>
                        )}
                        {source.publicationDate && (
                          <span className="flex items-center gap-1 border-l border-black/[0.1] pl-3">
                            <Calendar className="h-3 w-3" />
                            {new Date(source.publicationDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
                
                {message.retrieval.notice && (
                  <p className="mt-4 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    {message.retrieval.notice}
                  </p>
                )}
                <div className="mt-4 text-[10px] text-[#888] font-mono uppercase flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Retrieved at {new Date(message.retrieval.retrievedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Route Component ---

function CIOComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "ai",
      content:
        "Operator verified.\n\nI am the Sarvam AI Intelligence Officer. How can I assist with your investigation today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutation for sending messages to Flask -> Sarvam API
  const chatMutation = useMutation({
    mutationFn: (message: string) => api.chatWithOfficer({ message }),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: data.reply,
          retrieval: data.retrieval,
        },
      ]);
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content:
            error.message ||
            "SYSTEM ERROR: Connection to intelligence network failed. Please verify API availability and try again.",
          isError: true,
        },
      ]);
    },
  });

  const handleSend = (text: string = input) => {
    if (!text.trim() || chatMutation.isPending) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput(""); // Clear input

    // Trigger API
    chatMutation.mutate(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppShell title="Intelligence Officer" subtitle="Sarvam-powered Generative AI Assistant">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto">
        {/* Main Chat Interface */}
        <div className="flex-1 bg-white border border-black/[0.06] rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#f8f9fa] border-b border-black/[0.06] p-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="p-2 bg-[#7c3aed]/10 rounded-lg border border-[#7c3aed]/20">
                  <Sparkles className="h-5 w-5 text-[#7c3aed]" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#16a34a] border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111]">Sarvam AI Core</h2>
                <p className="text-xs text-[#666] font-mono uppercase tracking-wider mt-0.5">Intelligence Module Active</p>
              </div>
            </div>

            <button
              onClick={() => setMessages([messages[0]])}
              className="px-3 py-1.5 text-[#666] hover:text-[#111] hover:bg-black/[0.04] border border-transparent hover:border-black/[0.06] rounded-lg transition-all flex items-center"
              title="Reset Conversation"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="text-xs font-semibold">Clear Buffer</span>
            </button>
          </div>

          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {messages.length === 1 && (
              <div className="flex flex-col items-center justify-center mb-8 mt-4 space-y-4">
                <p className="text-xs font-semibold text-[#888] uppercase tracking-widest text-center">
                  Suggested Intelligence Queries
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-sm bg-white hover:bg-[#f8f9fa] text-[#444] hover:text-[#111] border border-black/[0.06] hover:border-black/[0.15] shadow-sm hover:shadow rounded-lg px-4 py-2 transition-all text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {chatMutation.isPending && (
              <TypingIndicator />
            )}

            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#f8f9fa] border-t border-black/[0.06]">
            <div className="relative flex items-center shadow-sm rounded-xl bg-white border border-black/[0.08] focus-within:border-[#111] focus-within:ring-2 focus-within:ring-[#111]/20 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Query the intelligence network..."
                disabled={chatMutation.isPending}
                className="w-full bg-transparent py-4 pl-4 pr-14 text-sm text-[#111] outline-none placeholder:text-[#888] disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
                className="absolute right-2 p-2 bg-[#111] hover:bg-[#333] disabled:bg-[#ddd] disabled:text-[#aaa] text-white rounded-lg transition-colors shadow-sm"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Error Retry Option */}
            {chatMutation.isError && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => handleSend(messages[messages.length - 1].content)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  Retry Failed Connection
                </button>
              </div>
            )}
            
            <div className="text-center mt-3">
              <span className="text-[10px] text-[#888] uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                <Database className="h-3 w-3" />
                Powered by Sarvam AI • Classified Intelligence Database
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/cio")({
  component: CIOComponent,
});

