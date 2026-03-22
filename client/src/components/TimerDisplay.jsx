import socket from '../socket.js';

/* US-379: Timer display */
export default function TimerDisplay({ timer, isFacilitator }) {
  const mins = Math.floor(timer.remaining / 60);
  const secs = timer.remaining % 60;
  const isUrgent = timer.remaining <= 60;

  return (
    <div className="text-center py-2 px-4 font-display font-bold text-lg transition-colors no-print"
      role="timer"
      aria-label={`${mins} minutes ${secs} secondes restantes`}
      style={{
        backgroundColor: isUrgent ? 'var(--color-error)' : 'var(--color-accent)',
        color: isUrgent ? 'white' : 'var(--color-primary)',
        ...(isUrgent ? { animation: 'pulse 1s ease-in-out infinite' } : {}),
      }}>
      <span className="tabular-nums">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {timer.remaining <= 0 && <span className="ml-2">Temps écoulé !</span>}
      {isFacilitator && (
        <button onClick={() => socket.emit('stop-timer')}
          className="ml-4 text-sm font-normal underline opacity-70 hover:opacity-100">
          Arrêter
        </button>
      )}
    </div>
  );
}
