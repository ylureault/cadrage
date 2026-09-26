import { VIEW_LABELS } from './presence.js';

export function Avatar({ p, size = 28, ring = true, title }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none ${ring ? 'presence-ring' : ''}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42), backgroundColor: p.color || '#6B6E7B', '--ring': p.color }}
      title={title || p.pseudo} aria-label={p.pseudo}>
      {(p.pseudo || '?').trim()[0]?.toUpperCase()}
    </span>
  );
}

// Pile d'avatars avec le détail de qui est où
export function AvatarStack({ people, max = 4, size = 28, me }) {
  const shown = people.slice(0, max);
  const more = people.length - shown.length;
  return (
    <div className="group relative flex items-center">
      <div className="flex -space-x-2">
        {shown.map(p => <Avatar key={p.pseudo} p={p} size={size} title={`${p.pseudo}${p.pseudo === me ? ' (vous)' : ''} · ${VIEW_LABELS[p.view] || ''}`} />)}
        {more > 0 && (
          <span className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold presence-ring"
            style={{ width: size, height: size, backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>+{more}</span>
        )}
      </div>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute right-0 top-full mt-2 z-50 w-64 rounded-card p-2 elevation-3"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
        <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>En direct · {people.length}</p>
        {people.map(p => (
          <div key={p.pseudo} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
            <Avatar p={p} size={22} ring={false} />
            <span className="text-body-sm font-medium flex-1 truncate">{p.pseudo}{p.pseudo === me ? <span style={{ color: 'var(--color-text-muted)' }}> (vous)</span> : null}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              {p.field ? 'écrit…' : VIEW_LABELS[p.view] || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TypingDots() {
  return <span className="typing-dots" aria-hidden><span /><span /><span /></span>;
}

// Petits visages sur une ligne : « Claire est ici » / « Claire écrit »
export function HereBadge({ people, compact = false }) {
  if (!people.length) return null;
  const writing = people.find(p => p.field);
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full pl-0.5 pr-2 py-0.5 animate-fade-in"
      style={{ backgroundColor: `${(writing || people[0]).color}1f`, color: (writing || people[0]).color }}>
      <span className="flex -space-x-1.5">{people.slice(0, 3).map(p => <Avatar key={p.pseudo} p={p} size={18} ring={false} />)}</span>
      {!compact && (writing ? <>{writing.pseudo} écrit <TypingDots /></> : people.length === 1 ? `${people[0].pseudo} est ici` : `${people.length} ici`)}
    </span>
  );
}
