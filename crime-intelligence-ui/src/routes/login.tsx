import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, Terminal, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function LoginComponent() {
  const navigate = useNavigate();
  const { signInWithGoogle, session, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the user is already authenticated, redirect to home
  useEffect(() => {
    if (!authLoading && session) {
      navigate({ to: "/home" });
    }
  }, [authLoading, session, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      // The OAuth flow redirects the browser — no further action needed here.
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "AUTH_FAILURE: Security handshake dropped by security perimeter framework.";
      setError(message);
      setIsLoading(false);
    }
  };

  // Show nothing while checking for an existing session to avoid a flash of login
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-[#111] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col items-center justify-center p-4 relative font-sans select-none overflow-hidden text-[#111111]">
      <div className="noise-overlay" />
      
      {/* Background ambient effect */}
      <div className="absolute inset-0 pointer-events-none z-0 ambient-gradient opacity-50" />

      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500 relative z-10">
        {/* Brand/Security Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-[#f4f4f4] border border-black/[0.08] shadow-sm flex items-center justify-center p-2 z-10 relative overflow-hidden">
              <img
                src="/Crime_Intel_Logo.png"
                alt="CrimeIntel Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            {/* Glowing pulse behind logo */}
            <div className="absolute inset-0 bg-[#FF9933] rounded-2xl blur-xl opacity-20 radar-ping" />
          </div>
          
          <h1 className="text-xl font-bold tracking-tight leading-tight">CrimeIntel</h1>
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#888] uppercase mt-1">
            Intelligence Platform
          </p>
        </div>

        {/* Clean Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl p-8 shadow-sm relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Error Message Feedback */}
            {error && (
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 flex items-start space-x-3 text-red-800 text-[11px] animate-in shake duration-300">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Auth Description */}
            <div className="text-center space-y-2 mb-2">
              <p className="text-sm font-semibold text-[#111]">
                Authorized Access Only
              </p>
              <p className="text-[12px] text-[#666]">
                Authenticate with your agency credentials to access the intelligence network.
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-white border border-black/[0.1] hover:bg-black/[0.02] hover:border-black/[0.15] active:scale-[0.98] disabled:opacity-50 text-[#111] font-medium text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#666]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  {/* Google "G" icon */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Hint / Warning System */}
        <div className="mt-8 text-center px-4">
          <div className="text-[10px] text-[#888] font-mono tracking-wide max-w-sm mx-auto uppercase">
            Restricted System // All activity is monitored
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});
