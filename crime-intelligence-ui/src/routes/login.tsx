import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Shield, Lock, User, Terminal, Loader2, AlertCircle } from 'lucide-react';

function LoginComponent() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate cryptographic handshake authentication latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // STRICT VALIDATION: Only allow specific demo credentials
      if (username === 'admin' && password === 'admin123') {
        navigate({ to: '/dashboard' });
      } else {
        throw new Error("ACCESS DENIED: Invalid Operator ID or Access Key. Incident logged.");
      }
    } catch (err: any) {
      setError(err.message || "AUTH_FAILURE: Security handshake dropped by security perimeter framework.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative font-sans select-none overflow-hidden">
      
      {/* Background Tech Decorative Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blue-500 to-transparent"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative z-10">
        
        {/* Brand/Security Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl shadow-lg shadow-blue-500/5 mb-4 animate-pulse">
            <Shield className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">
            Crime Intel
          </h1>
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mt-1">
            National Security Network Access
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          
          {/* Security Clearance Tag */}
          <div className="absolute -top-3 right-6 bg-blue-950 border border-blue-500/40 px-3 py-0.5 rounded-full flex items-center shadow">
            <Terminal className="h-3 w-3 text-blue-400 mr-1.5" />
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">SSL_SECURE</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Error Message Feedback */}
            {error && (
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-red-200 text-xs animate-in shake duration-300">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="font-mono leading-relaxed">{error}</span>
              </div>
            )}

            {/* Username Vector Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operator ID</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Enter credential signature..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 disabled:opacity-50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Vector Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Access Key Override</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 disabled:opacity-50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Sign In Trigger */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <span>Establish Connection</span>
              )}
            </button>

          </form>
        </div>

        {/* Footer Hint / Warning System */}
        <div className="mt-8 text-center px-4 space-y-2">
          <div className="text-[10px] text-slate-500 font-mono tracking-wide bg-white/5 inline-block px-3 py-1 rounded-md border border-white/5">
            DEMO ACCESS: <span className="text-blue-400">admin</span> / <span className="text-blue-400">admin123</span>
          </div>
          <div className="text-[10px] text-slate-600 leading-relaxed font-mono tracking-wide max-w-sm mx-auto">
            WARNING: Authorized Personnel Only. All diagnostic data intercepts, transaction inputs, and IP session footprints are logged globally.
          </div>
        </div>

      </div>
    </div>
  );
}

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});