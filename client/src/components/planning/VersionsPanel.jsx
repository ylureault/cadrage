import { useEffect, useRef, useState } from 'react';
import { Eye, History, RotateCcw, Save } from 'lucide-react';
import socket from '../../socket.js';
import { useStore } from '../../store.jsx';
import { usePlanning } from '../../planning/usePlanning.js';
import { printSheet } from '../../planning/sheet.js';

function when(iso) {
  const d = new Date(`${String(iso).replace(' ', 'T')}Z`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Figer la version envoyée au client, la revoir, la restaurer
export default function VersionsPanel() {
  const { state, dispatch } = useStore();
  const actions = usePlanning();
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const pending = useRef(null); // { id, mode }

  useEffect(() => {
    const onList = (l) => setList(l || []);
    const onVersion = (v) => {
      const p = pending.current;
      if (!p || p.id !== v.id) return;
      pending.current = null;
      if (p.mode === 'voir') printSheet({ variant: 'planning', space: state.space, meta: v.data.planning, days: v.data.agendaDays, blocks: v.data.blocks, win: p.win });
      if (p.mode === 'restaurer') {
        actions.replaceAll(v.data);
        dispatch({ type: 'ADD_NOTIFICATION', notification: { message: `Version « ${v.name} » restaurée. Annuler reste possible.`, type: 'success' } });
      }
    };
    socket.on('planning:versions', onList);
    socket.on('planning:version', onVersion);
    socket.emit('planning:versions');
    return () => { socket.off('planning:versions', onList); socket.off('planning:version', onVersion); };
  }, [actions, dispatch, state.space]);

  function save(e) {
    e.preventDefault();
    const label = name.trim() || `Envoyée au client le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
    socket.emit('planning:version-save', { name: label });
    setName('');
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: `Version « ${label} » figée`, type: 'success' } });
  }

  function open(id, mode) {
    if (mode === 'restaurer' && !confirm('Remplacer le planning actuel par cette version ? (Annuler reste possible)')) return;
    // La fenêtre s'ouvre pendant le clic, sinon le navigateur la bloque
    pending.current = { id, mode, win: mode === 'voir' ? window.open('', '_blank') : null };
    socket.emit('planning:version-get', { id });
  }

  return (
    <section className="rounded-card p-4 elevation-1 grid gap-2" style={{ backgroundColor: 'var(--color-surface)' }}>
      <h2 className="font-display font-bold text-body flex items-center gap-2"><History size={16} /> Versions</h2>
      <p className="text-caption -mt-1" style={{ color: 'var(--color-text-muted)' }}>Figez ce que vous envoyez au client. Vous saurez toujours ce qu'il a reçu.</p>
      {!actions.archived && (
        <form onSubmit={save} className="flex gap-1.5">
          <input className="input-field flex-1 text-caption" value={name} onChange={e => setName(e.target.value)} maxLength={120} placeholder="Envoyée au client le…" aria-label="Nom de la version" />
          <button type="submit" className="btn-outline !h-[38px] !px-2.5" aria-label="Figer cette version" title="Figer cette version"><Save size={15} /></button>
        </form>
      )}
      {list.length === 0 && <p className="text-caption italic" style={{ color: 'var(--color-text-muted)' }}>Aucune version figée.</p>}
      <ul className="grid gap-1">
        {list.map(v => (
          <li key={v.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]">
            <span className="flex-1 min-w-0">
              <span className="block text-body-sm font-medium truncate">{v.name}</span>
              <span className="block text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{when(v.created_at)}</span>
            </span>
            <button onClick={() => open(v.id, 'voir')} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--color-surface)]" title="Voir en PDF" aria-label="Voir en PDF"><Eye size={14} /></button>
            {!actions.archived && <button onClick={() => open(v.id, 'restaurer')} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--color-surface)]" title="Restaurer" aria-label="Restaurer"><RotateCcw size={14} /></button>}
          </li>
        ))}
      </ul>
    </section>
  );
}
