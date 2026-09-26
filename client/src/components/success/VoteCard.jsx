import { useStore } from '../../store.jsx';
import socket from '../../socket.js';

// Carte de vote pour un participant (aussi utilisée en bandeau flottant)
export function VoteCard({ kind, compact = false }) {
  const { state } = useStore();
  const max = kind === 'roti' ? 5 : 10;
  const mine = state.success.votes.find(v => v.kind === kind && v.pseudo === state.pseudo);
  const question = kind === 'roti'
    ? 'Le temps passé valait-il le coup ? (1 : pas du tout, 5 : largement)'
    : (state.success.scaleQuestion || state.planning?.scale_question || (state.planning?.question ? `Sur « ${state.planning.question} », où en est le groupe ?` : 'Où en est le groupe sur le sujet ?'));
  const label = kind === 'avant' ? 'Avant' : kind === 'apres' ? 'Après' : 'ROTI';
  return (
    <div className={compact ? '' : 'rounded-card p-4'} style={compact ? undefined : { border: '1.5px solid var(--color-accent)', backgroundColor: 'rgba(242,194,69,0.06)' }}>
      <p className="text-caption font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent-dark)' }}>Vote {label} ouvert</p>
      <p className="text-body-sm font-medium mb-2">{question}</p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" onClick={() => socket.emit('success:vote', { kind, value: n })}
            className="w-9 h-9 rounded-btn font-bold text-body-sm transition-all"
            style={{ backgroundColor: mine?.value === n ? '#141E37' : 'var(--color-surface)', color: mine?.value === n ? '#F2C245' : 'var(--color-text)', border: '1px solid var(--color-border)' }}
            aria-pressed={mine?.value === n}>{n}</button>
        ))}
      </div>
      {kind !== 'roti' && <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>1 : on part de loin · 10 : on y est</p>}
      {mine && <p className="text-caption mt-1.5" style={{ color: 'var(--color-success)' }}>Vote enregistré : {mine.value}. Vous pouvez le changer.</p>}
    </div>
  );
}
