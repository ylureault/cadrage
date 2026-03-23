import { useMemo } from 'react';
import { useStore } from '../store.jsx';
import { X, BarChart3 } from 'lucide-react';

export default function StatsPanel() {
  const { state, dispatch } = useStore();

  const stats = useMemo(() => {
    const participants = new Set(state.cards.map(c => c.author));
    return [...participants].map(pseudo => {
      const cards = state.cards.filter(c => c.author === pseudo);
      const comments = state.comments.filter(c => c.author === pseudo);
      const axesPositioned = state.axes.filter(a => a.pseudo === pseudo && a.position != null);
      const color = cards[0]?.author_color || 'var(--color-text-muted)';
      return { pseudo, color, cards: cards.length, comments: comments.length, axes: axesPositioned.length };
    }).sort((a, b) => b.cards - a.cards);
  }, [state.cards, state.comments, state.axes]);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] max-w-[90vw] z-40 flex flex-col animate-slide-in elevation-3"
      style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-body">Statistiques de contribution</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_STATS' })}
          className="p-1 rounded-btn transition-colors" style={{ color: 'var(--color-text-muted)' }}
          aria-label="Fermer"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {stats.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 size={32} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
            <p className="text-body-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Pas encore de contributions</p>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              Ajoutez des cartes pour voir les statistiques de participation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.map(s => {
              const maxCards = Math.max(...stats.map(x => x.cards), 1);
              return (
                <div key={s.pseudo} className="rounded-card p-3" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                      style={{ backgroundColor: s.color }}>
                      {s.pseudo[0]?.toUpperCase()}
                    </div>
                    <span className="text-body-sm font-semibold flex-1">{s.pseudo}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-2" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(s.cards / maxCards) * 100}%`, backgroundColor: s.color }} />
                  </div>
                  <div className="flex gap-4 text-caption" style={{ color: 'var(--color-text-muted)' }}>
                    <span><strong style={{ color: 'var(--color-text)' }}>{s.cards}</strong> carte{s.cards > 1 ? 's' : ''}</span>
                    <span><strong style={{ color: 'var(--color-text)' }}>{s.comments}</strong> commentaire{s.comments > 1 ? 's' : ''}</span>
                    <span><strong style={{ color: 'var(--color-text)' }}>{s.axes}</strong>/8 axes</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
