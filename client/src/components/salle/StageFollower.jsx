import { useState } from 'react';
import { useStore } from '../../store.jsx';
import { computeDay, hm } from '../../planning/utils.js';

// Sur le téléphone d'un participant : l'étape que la salle est en train de vivre
export function StageFollower() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const seq = state.stage ? state.blocks.find(b => b.id === state.stage.seqId) : null;
  if (!seq || state.showSalle) return null;
  const day = state.agendaDays.find(d => d.id === seq.day_id);
  const timed = day ? computeDay(day, state.blocks).seqs.find(s => s.id === seq.id) : null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[76px] md:bottom-6 z-40 w-[min(560px,calc(100vw-24px))] no-print animate-slide-up flex flex-col-reverse">
      <button onClick={() => setOpen(!open)} className="w-full text-left rounded-2xl px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: '#141E37', color: '#fff', boxShadow: 'var(--shadow-3)' }}>
        <span className="live-dot shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] shrink-0" style={{ color: '#F2C245' }}>En salle</span>
        <span className="font-semibold text-[14px] truncate flex-1">{seq.title}</span>
        {timed && <span className="text-[12px] text-white/60 tabular-nums shrink-0">jusqu'à {hm(timed.end)}</span>}
      </button>
      {open && seq.kind !== 'pause' && (
        <div className="mb-2 rounded-2xl p-4 animate-scale-in" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-3)' }}>
          {seq.intention && <p className="text-[15px] font-medium mb-1.5">{seq.intention}</p>}
          {seq.format && <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{seq.format}</p>}
          {day?.encadre?.items?.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-accent-dark)' }}>{day.encadre.titre}</p>
              {day.encadre.items.map((it, i) => <p key={i} className="text-[13px] mb-1"><b>{it.label}</b> {it.texte}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
