import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { IntelSymbol } from "./IntelSymbol";

const BOOT_SESSION_KEY = "crime-intel-boot-complete";
const BOOT_STEPS = [
  "Verifying identity & clearance",
  "Connecting analytical repository",
  "Initializing geospatial topology",
  "Mounting statutory registers",
  "Synchronizing risk intelligence",
  "System ready",
];

export function BootScreen() {
  const [visible, setVisible] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(BOOT_SESSION_KEY) === "1") return;

    setVisible(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepDuration = reducedMotion ? 70 : 160;
    const closeDelay = reducedMotion ? 100 : 250;
    const interval = window.setInterval(() => {
      setCompleted((current) => Math.min(current + 1, BOOT_STEPS.length));
    }, stepDuration);
    const closeTimer = window.setTimeout(
      () => {
        sessionStorage.setItem(BOOT_SESSION_KEY, "1");
        setClosing(true);
        window.setTimeout(() => setVisible(false), closeDelay);
      },
      BOOT_STEPS.length * stepDuration + closeDelay,
    );

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(closeTimer);
    };
  }, []);

  if (!visible) return null;

  const progress = Math.round((completed / BOOT_STEPS.length) * 100);

  return (
    <div
      className={`boot-screen ${closing ? "boot-screen-closing" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="boot-content">
        <div className="boot-logo-wrap">
          <IntelSymbol size={22} strokeWidth={1.5} />
        </div>
        <p className="boot-kicker">GOVERNMENT INTELLIGENCE ARCHITECTURE</p>
        <h1 className="boot-title">CRIMEINTEL</h1>
        <p className="boot-subtitle">Enterprise Statutory Intelligence Platform</p>
        <div className="boot-sequence">
          {BOOT_STEPS.map((step, index) => {
            const isDone = index < completed;
            const isCurrent = index === completed && completed < BOOT_STEPS.length;
            return (
              <div
                className={`boot-step ${isDone ? "boot-step-done" : ""} ${isCurrent ? "boot-step-current" : ""}`}
                key={step}
              >
                <span className="boot-step-icon">
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-[#111]" strokeWidth={2} aria-hidden="true" />
                  ) : isCurrent ? (
                    <Loader2 className="boot-spinner" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <span />
                  )}
                </span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
        <div className="boot-progress-meta">
          <span>STATUS CHECK</span>
          <strong>{progress}%</strong>
        </div>
        <div className="boot-progress-track">
          <div className="boot-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
