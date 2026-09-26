import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';

function HeaderField({ label, field, value, locked, type = 'text' }) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef();

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  function save() {
    setEditing(false);
    if (localValue !== value) {
      socket.emit('update-header', { field, value: localValue });
      dispatch({ type: 'UPDATE_HEADER', field, value: localValue });
    }
  }

  if (locked) return (
    <div className="flex-1 min-w-[150px]">
      <label className="text-label uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <p className="text-body-sm font-medium truncate">{value || '·'}</p>
    </div>
  );

  if (editing) return (
    <div className="flex-1 min-w-[150px]">
      <label className="text-label uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <input ref={inputRef} value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={save} onKeyDown={e => e.key === 'Enter' && save()}
        type={type}
        className="input-field w-full text-sm py-1" autoFocus />
    </div>
  );

  return (
    <div className="flex-1 min-w-[150px] cursor-pointer group" onClick={() => setEditing(true)}>
      <label className="text-label uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <p className="text-body-sm font-medium truncate transition-colors" style={{ color: 'var(--color-text)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent-dark)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text)'}>
        {value || <span className="italic" style={{ color: 'var(--color-border)' }}>Cliquez pour saisir</span>}
      </p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

export default function CanvasHeader() {
  const { state } = useStore();
  const locked = state.archived;
  const dateStart = state.space?.session_date;
  const dateEnd = state.space?.session_date_end;

  // Format date display
  let dateDisplay = '';
  if (dateStart && dateEnd) {
    dateDisplay = `du ${formatDate(dateStart)} au ${formatDate(dateEnd)}`;
  } else if (dateStart) {
    dateDisplay = formatDate(dateStart);
  }

  return (
    <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-[1600px] mx-auto flex flex-wrap gap-4">
        <HeaderField label="Client" field="client_name" value={state.space?.client_name} locked={locked} />
        <HeaderField label="Sponsor" field="sponsor" value={state.space?.sponsor} locked={locked} />
        <HeaderField label="Facilitateur" field="facilitator" value={state.space?.facilitator} locked={locked} />
        <HeaderField label="Date début" field="session_date" value={state.space?.session_date} locked={locked} type="date" />
        <HeaderField label="Date fin" field="session_date_end" value={state.space?.session_date_end} locked={locked} type="date" />
      </div>
    </div>
  );
}
