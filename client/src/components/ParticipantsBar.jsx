import { useStore } from '../store.jsx';

/* US-405: Indicateurs de présence premium */
export default function ParticipantsBar() {
  const { state } = useStore();
  const maxVisible = 5;
  const visible = state.participants.slice(0, maxVisible);
  const overflow = state.participants.length - maxVisible;

  return (
    <div className="border-b px-4 py-1.5 no-print" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-[1600px] mx-auto flex items-center gap-3">
        <span className="text-label" style={{ color: 'var(--color-text-muted)' }}>
          {state.participants.length} en ligne
        </span>
        <div className="flex -space-x-2">
          {visible.map((p, i) => (
            <div key={p.pseudo}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-caption font-medium border-2 transition-all duration-200 animate-scale-in"
              style={{
                backgroundColor: p.color,
                borderColor: 'var(--color-surface)',
                zIndex: maxVisible - i,
              }}
              title={p.pseudo}
              aria-label={`${p.pseudo} est connecté`}>
              {p.pseudo[0]?.toUpperCase()}
            </div>
          ))}
          {overflow > 0 && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-label font-medium border-2"
              style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', borderColor: 'var(--color-surface)' }}>
              +{overflow}
            </div>
          )}
        </div>
        {state.isFacilitator && (
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span className="text-label font-semibold" style={{ color: 'var(--color-accent)' }}>Facilitateur</span>
          </div>
        )}
      </div>
    </div>
  );
}
