import { useEffect, useState } from 'react';
import { Check, Loader2, Shield } from 'lucide-react';

const BOOT_SESSION_KEY = 'crime-intel-boot-complete';
const BOOT_STEPS = [
  'Initializing Secure Environment...',
  'Connecting Neo4j Knowledge Graph...',
  'Loading Crime Intelligence Database...',
  'Starting ML Forecast Engine...',
  'Establishing Threat Intelligence Feed...',
  'Syncing Executive Briefing...',
  'Verifying Evidence Sources...',
  'System Ready',
];

export function BootScreen() {
  const [visible, setVisible] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(BOOT_SESSION_KEY) === '1') return;

    setVisible(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepDuration = reducedMotion ? 90 : 330;
    const closeDelay = reducedMotion ? 150 : 420;
    const interval = window.setInterval(() => {
      setCompleted((current) => Math.min(current + 1, BOOT_STEPS.length));
    }, stepDuration);
    const closeTimer = window.setTimeout(() => {
      sessionStorage.setItem(BOOT_SESSION_KEY, '1');
      setClosing(true);
      window.setTimeout(() => setVisible(false), closeDelay);
    }, BOOT_STEPS.length * stepDuration + closeDelay);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(closeTimer);
    };
  }, []);

  if (!visible) return null;

  const progress = Math.round((completed / BOOT_STEPS.length) * 100);

  return (
    <div className={`boot-screen ${closing ? 'boot-screen-closing' : ''}`} role="status" aria-live="polite">
      <div className="boot-grid" />
      <div className="boot-glow boot-glow-left" />
      <div className="boot-glow boot-glow-right" />
      <div className="boot-content">
        <div className="boot-logo-wrap">
          <div className="boot-logo-ring" />
          <Shield className="boot-logo" aria-hidden="true" />
        </div>
        <p className="boot-kicker">SECURE INTELLIGENCE NETWORK</p>
        <h1 className="boot-title">CRIME INTEL</h1>
        <p className="boot-subtitle">National Crime Intelligence Platform</p>
        <div className="boot-sequence">
          {BOOT_STEPS.map((step, index) => {
            const isDone = index < completed;
            const isCurrent = index === completed && completed < BOOT_STEPS.length;
            return (
              <div className={`boot-step ${isDone ? 'boot-step-done' : ''} ${isCurrent ? 'boot-step-current' : ''}`} key={step}>
                <span className="boot-step-icon">{isDone ? <Check aria-hidden="true" /> : isCurrent ? <Loader2 className="boot-spinner" aria-hidden="true" /> : <span />}</span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
        <div className="boot-progress-meta"><span>SYSTEM INITIALIZATION</span><strong>{progress}%</strong></div>
        <div className="boot-progress-track"><div className="boot-progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  );
}
