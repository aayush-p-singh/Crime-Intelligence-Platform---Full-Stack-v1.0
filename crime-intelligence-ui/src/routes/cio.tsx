import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AppShell } from '../components/AppShell';
import { api } from '../lib/api';
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// --- Types ---
type Role = 'user' | 'ai';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  isError?: boolean;
}

const SUGGESTED_PROMPTS = [
  "Summarize the current threat levels across high-risk states.",
  "What states have the highest rates of crimes against women?",
  "Correlate the chargesheet rate with the overall crime rate in Kerala.",
  "Give me a tactical briefing on cyber intrusions in Maharashtra."
];

// --- Reusable Components ---

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 bg-slate-800/50 border border-white/5 rounded-2xl rounded-tl-sm p-4 w-fit shadow-sm max-w-[80%]">
      <Bot className="h-5 w-5 text-purple-400 mr-2" />
      <div className="flex space-x-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex flex-col space-y-2 max-w-[85%] md:max-w-[75%]`}>
        <div className={`flex items-end space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
          
          {/* Avatar */}
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-purple-900/50 border border-purple-500/30'}`}>
            {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-purple-400" />}
          </div>

          {/* Bubble */}
          <div className={`
            p-4 text-sm leading-relaxed shadow-md
            ${isUser 
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
              : message.isError 
                ? 'bg-red-900/20 border border-red-500/30 text-red-200 rounded-2xl rounded-tl-sm'
                : 'bg-slate-800/80 backdrop-blur-sm border border-white/10 text-slate-200 rounded-2xl rounded-tl-sm'
            }
          `}>
            {message.isError && <AlertCircle className="h-4 w-4 inline mb-1 mr-2 text-red-400" />}
            <span className="whitespace-pre-wrap break-words font-sans">{message.content}</span>
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
      id: 'welcome-msg',
      role: 'ai',
      content: "Operator verified. I am the Sarvam AI Intelligence Officer. How can I assist with your investigation today?"
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutation for sending messages to Flask -> Sarvam API
  const chatMutation = useMutation({
    mutationFn: (message: string) => api.chatWithOfficer({ message }),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: data.reply
      }]);
    },
    onError: (error: any) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: error.message || "SYSTEM ERROR: Connection to Sarvam AI network failed. Please verify API availability.",
        isError: true
      }]);
    }
  });

  const handleSend = (text: string = input) => {
    if (!text.trim() || chatMutation.isPending) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput(''); // Clear input

    // Trigger API
    chatMutation.mutate(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppShell title="Intelligence Officer" subtitle="Sarvam-powered Generative AI Assistant">
      <div className="p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto">
        
        {/* Main Chat Interface */}
        <div className="flex-1 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-800/80 border-b border-white/10 p-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Sarvam AI Core</h2>
                <p className="text-xs text-slate-400">Intelligence & Analysis Module</p>
              </div>
            </div>
            
            <button 
              onClick={() => setMessages([messages[0]])}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center"
              title="Reset Conversation"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Clear Cache</span>
            </button>
          </div>

          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center mt-4">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-xs bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 border border-white/10 hover:border-purple-500/30 rounded-full px-4 py-2 transition-all"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            )}
            
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {chatMutation.isPending && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <TypingIndicator />
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800/50 border-t border-white/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Query the intelligence network..."
                disabled={chatMutation.isPending}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-500 disabled:opacity-50 transition-all shadow-inner"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || chatMutation.isPending}
                className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed shadow-md"
              >
                {chatMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Powered by Sarvam AI • Classified Intelligence Database
              </span>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute('/cio')({
  component: CIOComponent,
});