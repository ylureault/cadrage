import socket from '../socket.js';

export default function TimerDisplay({ timer, isFacilitator }) {
  const mins = Math.floor(timer.remaining / 60);
  const secs = timer.remaining % 60;
  const isUrgent = timer.remaining <= 60;
  const pct = (timer.remaining / timer.duration) * 100;

  return (
    <div className={`text-center py-2 px-4 font-bold text-lg transition-colors ${
      isUrgent ? 'bg-red-500 text-white animate-pulse-slow' : 'bg-insuffle-gold text-insuffle-dark'
    }`}>
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
