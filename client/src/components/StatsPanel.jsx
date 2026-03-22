import { useMemo } from 'react';
import { useStore } from '../store.jsx';
import { X } from 'lucide-react';

export default function StatsPanel() {
  const { state, dispatch } = useStore();

  const stats = useMemo(() => {
    const participants = new Set(state.cards.map(c => c.author));
    return [...participants].map(pseudo => {
      const cards = state.cards.filter(c => c.author === pseudo);
      const comments = state.comments.filter(c => c.author === pseudo);
      const axesPositioned = state.axes.filter(a => a.pseudo === pseudo && a.position != null);
      const color = cards[0]?.author_color || '#888';
      return { pseudo, color, cards: cards.length, comments: comments.length, axes: axesPositioned.length };
    }).sort((a, b) => b.cards - a.cards);
  }, [state.cards, state.comments, state.axes]);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] max-w-[90vw] bg-white card-shadow z-40 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold">Statistiques de contribution</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_STATS' })} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Participant</th>
              <th className="text-center py-2">Cartes</th>
              <th className="text-center py-2">Commentaires</th>
              <th className="text-center py-2">Axes</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.pseudo} className="border-b border-gray-100">
                <td className="py-2 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-medium">{s.pseudo}</span>
                </td>
                <td className="text-center">{s.cards}</td>
                <td className="text-center">{s.comments}</td>
                <td className="text-center">{s.axes}/8</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.length === 0 && <p className="text-gray-400 text-center py-8">Aucune contribution pour le moment</p>}
      </div>
    </div>
  );
}
