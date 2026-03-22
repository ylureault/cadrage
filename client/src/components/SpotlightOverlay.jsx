import { useEffect } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';

/* US-378: Focus trap in modal, US-379: Spotlight overlay */
export default function SpotlightOverlay() {
  const { state } = useStore();
  const card = state.cards.find(c => c.id === state.spotlight);

  // US-378: Escape to close
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && state.isFacilitator) {
        socket.emit('spotlight', { cardId: null });
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.isFacilitator]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(12,22,41,0.6)' }}
      onClick={() => state.isFacilitator && socket.emit('spotlight', { cardId: null })}
      role="dialog" aria-modal="true" aria-label="Carte mise en avant">
      <div className="rounded-modal p-8 max-w-lg w-full mx-4 elevation-3 animate-scale-in"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={e => e.stopPropagation()}>
        <div className="text-label font-semibold uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
          Le facilitateur attire votre attention sur cette carte
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-caption font-medium"
            style={{ backgroundColor: card.author_color }}>{card.author[0]}</div>
          <span className="font-medium text-body">{card.author}</span>
        </div>
        <p className="text-lg whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text)' }}>{card.content}</p>
        {state.isFacilitator && (
          <button onClick={() => socket.emit('spotlight', { cardId: null })}
            className="mt-6 btn-ghost text-body-sm">Retirer le spotlight</button>
        )}
      </div>
    </div>
  );
}
