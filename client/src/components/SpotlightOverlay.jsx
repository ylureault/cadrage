import { useStore } from '../store.jsx';
import socket from '../socket.js';

export default function SpotlightOverlay() {
  const { state } = useStore();
  const card = state.cards.find(c => c.id === state.spotlight);
  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in"
      onClick={() => state.isFacilitator && socket.emit('spotlight', { cardId: null })}>
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 card-shadow" onClick={e => e.stopPropagation()}>
        <div className="text-xs text-insuffle-gold font-semibold uppercase mb-2">
          Le facilitateur attire votre attention sur cette carte
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: card.author_color }}>{card.author[0]}</div>
          <span className="font-medium">{card.author}</span>
        </div>
        <p className="text-lg whitespace-pre-wrap">{card.content}</p>
        {state.isFacilitator && (
          <button onClick={() => socket.emit('spotlight', { cardId: null })}
            className="mt-4 btn-ghost text-sm">Retirer le spotlight</button>
        )}
      </div>
    </div>
  );
}
