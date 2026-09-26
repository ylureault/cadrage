import { Square, Timer } from 'lucide-react';
import socket from '../socket.js';

// Le timer partagé : une pastille flottante sous la barre, visible de toute la salle
export default function TimerDisplay({ timer, isFacilitator }) {
  if (!timer || timer.remaining == null) return null;
  const remaining = Math.max(timer.remaining, 0);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining <= 60;
  const pct = timer.duration ? remaining / timer.duration : 0;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-[68px] z-40 no-print animate-slide-in" role="timer" aria-label={`${mins} minutes ${secs} secondes restantes`}>
      <div className="flex items-center gap-3 h-11 pl-2 pr-2 rounded-full" style={{ backgroundColor: urgent ? '#DC2626' : '#141E37', color: '#fff', boxShadow: 'var(--shadow-3)' }}>
        <span className="relative w-8 h-8">
          <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="4" />
            <circle cx="18" cy="18" r="15" fill="none" stroke={urgent ? '#fff' : '#F2C245'} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${pct * 94.2} 94.2`} style={{ transition: 'stroke-dasharray 1s linear' }} />
          </svg>
          <Timer size={13} className="absolute inset-0 m-auto" />
        </span>
        <span className={`font-display font-bold text-[20px] tabular-nums ${urgent ? 'animate-pulse' : ''}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        {remaining <= 0 && <span className="text-[13px] font-semibold">Temps écoulé</span>}
        {isFacilitator && (
          <button onClick={() => socket.emit('stop-timer')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15" title="Arrêter le timer" aria-label="Arrêter le timer">
            <Square size={13} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
