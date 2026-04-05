import socket from '../socket.js';

export default function TimerDisplay({ timer, isFacilitator }) {
  if (!timer || timer.remaining == null) return null;
  const remaining = Math.max(timer.remaining, 0);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 60;

  return (
    <div className="text-center py-2 px-4 font-display font-bold text-lg transition-colors no-print"
      role="timer"
      aria-label={`${mins} minutes ${secs} secondes restantes`}
      style={{
        backgroundColor: isUrgent ? '#ef4444' : '#ffde59',
        color: isUrgent ? 'white' : '#0c1629',
        ...(isUrgent ? { animation: 'pulse 1s ease-in-out infinite' } : {}),
      }}>
      <span className="tabular-nums">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {remaining <= 0 && <span className="ml-2">Temps écoulé !</span>}
      {isFacilitator && (
        <button onClick={() => socket.emit('stop-timer')}
          className="ml-4 text-sm font-normal underline opacity-70 hover:opacity-100 cursor-pointer"
          title="Arrêter le chronomètre">
          Arrêter
        </button>
      )}
    </div>
  );
}
