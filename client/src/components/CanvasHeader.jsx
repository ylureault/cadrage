import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';

function HeaderField({ label, field, value, locked }) {
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
      <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
      <p className="text-sm font-medium truncate">{value || '—'}</p>
    </div>
  );

  if (editing) return (
    <div className="flex-1 min-w-[150px]">
      <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
      <input ref={inputRef} value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={save} onKeyDown={e => e.key === 'Enter' && save()}
        className="input-field w-full text-sm py-1" autoFocus />
    </div>
  );

  return (
    <div className="flex-1 min-w-[150px] cursor-pointer group" onClick={() => setEditing(true)}>
      <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
      <p className="text-sm font-medium truncate group-hover:text-insuffle-blue transition-colors">
        {value || <span className="text-gray-300 italic">Cliquez pour saisir</span>}
      </p>
    </div>
  );
}

export default function CanvasHeader() {
  const { state } = useStore();
  const locked = state.archived;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-[1600px] mx-auto flex flex-wrap gap-4">
        <HeaderField label="Client" field="client_name" value={state.space?.client_name} locked={locked} />
        <HeaderField label="Sponsor" field="sponsor" value={state.space?.sponsor} locked={locked} />
        <HeaderField label="Facilitateur" field="facilitator" value={state.space?.facilitator} locked={locked} />
        <HeaderField label="Date" field="session_date" value={state.space?.session_date} locked={locked} />
      </div>
    </div>
  );
}
