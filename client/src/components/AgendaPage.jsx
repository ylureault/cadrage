import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import {
  Plus, Trash2, Clock, Coffee, GripVertical, ChevronDown, ChevronRight,
  Calendar, Play, Pause, X, AlertTriangle, Wand2, Table, LayoutList,
  Utensils, Timer, Lock, Unlock, ArrowRight, Settings2
} from 'lucide-react';

// Reuse block types from DeroulePage
const BLOCK_TYPES = {
  ouverture: { label: 'Ouverture', color: '#22c55e' },
  icebreaker: { label: 'Icebreaker', color: '#f59e0b' },
  production: { label: 'Production', color: '#3b82f6' },
  exploration: { label: 'Exploration', color: '#8b5cf6' },
  debriefing: { label: 'Débriefing', color: '#ec4899' },
  decision: { label: 'Décision', color: '#ef4444' },
  pause: { label: 'Pause', color: '#6b7280' },
  cloture: { label: 'Clôture', color: '#14b8a6' },
  transition: { label: 'Transition', color: '#a3a3a3' },
  energizer: { label: 'Energizer', color: '#f97316' },
};

const QUICK_PAUSES = [
  { title: 'Pause café', duration: 15, icon: Coffee },
  { title: 'Déjeuner', duration: 60, icon: Utensils },
  { title: 'Pause', duration: 10, icon: Pause },
];

function formatDuration(minutes) {
  if (!minutes) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function addMinutesToTime(time, mins) {
  const [h, m] = (time || '09:00').split(':').map(Number);
  const total = ((h || 0) * 60 + (m || 0) + (mins || 0)) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function timeToMinutes(time) {
  const [h, m] = (time || '09:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins) {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

// ===== Day Configuration (US-A002) =====
function DayConfig({ day, onUpdate, onDelete, canDelete }) {
  const [editing, setEditing] = useState(false);
  const availableMinutes = timeToMinutes(day.end_time) - timeToMinutes(day.start_time);

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-card animate-fade-in"
        style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <div>
          <label className="text-label block mb-0.5">Date</label>
          <input type="date" value={day.date || ''} onChange={e => onUpdate({ date: e.target.value })}
            className="input-field text-caption" />
        </div>
        <div>
          <label className="text-label block mb-0.5">Début</label>
          <input type="time" value={day.start_time} onChange={e => onUpdate({ start_time: e.target.value })}
            className="input-field text-caption" />
        </div>
        <div>
          <label className="text-label block mb-0.5">Fin</label>
          <input type="time" value={day.end_time} onChange={e => onUpdate({ end_time: e.target.value })}
            className="input-field text-caption" />
        </div>
        <button onClick={() => setEditing(false)} className="btn-ghost text-caption mt-4">OK</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mb-2">
      <h3 className="font-display font-bold text-body">
        Jour {day.day_number}
        {day.date && <span className="font-normal text-caption ml-2" style={{ color: 'var(--color-text-muted)' }}>
          {new Date(day.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>}
      </h3>
      <span className="text-caption px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: 'rgba(255,222,89,0.15)', color: 'var(--color-accent-dark)' }}>
        {day.start_time} — {day.end_time} ({formatDuration(availableMinutes)})
      </span>
      <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-black/5" title="Configurer">
        <Settings2 size={14} />
      </button>
      {canDelete && (
        <button onClick={onDelete} className="p-1 rounded hover:bg-black/5 text-red-400" title="Supprimer ce jour">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ===== Agenda Slot (US-A004, US-A005, US-A006, US-A007, US-A013) =====
function AgendaSlot({ slot, block, startTime, onDelete, onResize, onDragStart, onDragOver, onDrop, index }) {
  const isBlock = slot.slot_type === 'block' && block;
  const isPause = slot.slot_type === 'pause';
  const isBuffer = slot.slot_type === 'buffer';
  const endTime = addMinutesToTime(startTime, slot.duration_minutes);
  const bt = isBlock ? (BLOCK_TYPES[block.block_type] || BLOCK_TYPES.production) : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group relative flex items-stretch rounded-card transition-all duration-200 overflow-hidden
        ${isBuffer ? 'opacity-50' : 'elevation-1 hover:elevation-2'}`}
      style={{
        backgroundColor: isPause ? 'var(--color-surface-alt)' : isBuffer ? 'transparent' : 'var(--color-surface)',
        borderLeft: isBlock && bt ? `4px solid ${bt.color}` : isPause ? '4px solid var(--color-border)' : '4px dashed var(--color-border)',
        minHeight: Math.max(40, slot.duration_minutes * 1.2),
      }}>

      {/* Time column */}
      <div className="w-20 shrink-0 flex flex-col justify-center items-center py-2 text-caption"
        style={{ color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)' }}>
        <span className="font-semibold">{startTime}</span>
        <span className="text-[10px]">{endTime}</span>
      </div>

      {/* Drag handle */}
      <div className="w-6 flex items-center justify-center cursor-grab opacity-20 group-hover:opacity-50 shrink-0">
        <GripVertical size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-2 min-w-0">
        {isBlock ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-body-sm truncate">{block.title}</span>
              <span className="text-caption px-1.5 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: `${bt.color}15`, color: bt.color }}>
                {bt.label}
              </span>
            </div>
            <p className="text-caption truncate" style={{ color: 'var(--color-text-muted)' }}>{block.intention}</p>
          </>
        ) : isPause ? (
          <div className="flex items-center gap-2">
            {slot.title === 'Déjeuner' ? <Utensils size={14} /> : <Coffee size={14} />}
            <span className="text-body-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {slot.title || 'Pause'}
            </span>
          </div>
        ) : (
          <span className="text-caption italic" style={{ color: 'var(--color-text-muted)' }}>Buffer</span>
        )}
      </div>

      {/* Duration + actions */}
      <div className="flex items-center gap-2 pr-3 shrink-0">
        <span className="font-semibold text-body-sm">{formatDuration(slot.duration_minutes)}</span>
        <button onClick={onDelete}
          className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5"
          title="Retirer">
          <X size={14} />
        </button>
      </div>

      {/* Resize handle (US-A007) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-[var(--color-accent)] opacity-0 group-hover:opacity-40 transition-opacity"
        onMouseDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startDuration = slot.duration_minutes;
          function onMove(ev) {
            const delta = Math.round((ev.clientY - startY) / 2);
            const newDuration = Math.max(5, Math.min(480, startDuration + delta));
            onResize(newDuration);
          }
          function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }} />
    </div>
  );
}

// ===== Unscheduled Blocks Panel (US-A009) =====
function UnscheduledBlocks({ blocks, scheduledIds, onSchedule }) {
  const unscheduled = blocks.filter(b => !scheduledIds.includes(b.id));
  if (unscheduled.length === 0) return null;

  return (
    <div className="rounded-card p-4 mb-4 elevation-1" style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px dashed var(--color-warning)' }}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
        <span className="text-body-sm font-semibold">{unscheduled.length} bloc{unscheduled.length > 1 ? 's' : ''} non planifié{unscheduled.length > 1 ? 's' : ''}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {unscheduled.map(b => {
          const bt = BLOCK_TYPES[b.block_type] || BLOCK_TYPES.production;
          return (
            <button key={b.id} onClick={() => onSchedule(b)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-btn text-caption font-medium transition-all hover:elevation-1"
              style={{ backgroundColor: 'var(--color-surface)', borderLeft: `3px solid ${bt.color}` }}>
              <Plus size={12} /> {b.title} ({formatDuration(b.duration_minutes)})
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== Main AgendaPage =====
export default function AgendaPage() {
  const { state } = useStore();
  const archived = !!state.archived;
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'table'
  const [dragIndex, setDragIndex] = useState(null);

  const days = [...state.agendaDays].sort((a, b) => a.position - b.position);
  const blocks = [...state.blocks].sort((a, b) => a.position - b.position);
  const scheduledIds = state.agendaSlots.filter(s => s.block_id).map(s => s.block_id);

  // Create first day automatically if none exists
  function createDay() {
    if (archived) return;
    socket.emit('create-agenda-day', {
      date: state.space?.session_date || '',
      start_time: '09:00',
      end_time: '17:30'
    });
  }

  function updateDay(dayId, fields) {
    if (archived) return;
    socket.emit('update-agenda-day', { dayId, ...fields });
  }

  function deleteDay(dayId) {
    if (archived) return;
    if (confirm('Supprimer ce jour et tous ses créneaux ?')) {
      socket.emit('delete-agenda-day', { dayId });
    }
  }

  // US-A004: Schedule a block
  function scheduleBlock(dayId, block) {
    if (archived) return;
    const daySlots = state.agendaSlots.filter(s => s.day_id === dayId).sort((a, b) => a.position - b.position);
    const day = days.find(d => d.id === dayId);
    let startTime = day?.start_time || '09:00';
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1];
      startTime = addMinutesToTime(last.start_time, last.duration_minutes);
    }
    socket.emit('create-agenda-slot', {
      dayId, block_id: block.id, slot_type: 'block',
      start_time: startTime, duration_minutes: block.duration_minutes
    });
  }

  // US-A005: Quick pause
  function addPause(dayId, pause) {
    if (archived) return;
    const daySlots = state.agendaSlots.filter(s => s.day_id === dayId).sort((a, b) => a.position - b.position);
    const day = days.find(d => d.id === dayId);
    let startTime = day?.start_time || '09:00';
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1];
      startTime = addMinutesToTime(last.start_time, last.duration_minutes);
    }
    socket.emit('create-agenda-slot', {
      dayId, slot_type: 'pause', title: pause.title,
      start_time: startTime, duration_minutes: pause.duration
    });
  }

  // US-A006: Buffer
  function addBuffer(dayId) {
    if (archived) return;
    const daySlots = state.agendaSlots.filter(s => s.day_id === dayId).sort((a, b) => a.position - b.position);
    const day = days.find(d => d.id === dayId);
    let startTime = day?.start_time || '09:00';
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1];
      startTime = addMinutesToTime(last.start_time, last.duration_minutes);
    }
    socket.emit('create-agenda-slot', {
      dayId, slot_type: 'buffer', title: 'Buffer',
      start_time: startTime, duration_minutes: 15
    });
  }

  function deleteSlot(slotId) {
    if (archived) return;
    socket.emit('delete-agenda-slot', { slotId });
  }

  function resizeSlot(slotId, newDuration) {
    socket.emit('update-agenda-slot', { slotId, duration_minutes: newDuration });
  }

  // US-A010: Auto schedule
  function autoSchedule(dayId) {
    if (archived) return;
    socket.emit('auto-schedule-agenda', { dayId });
  }

  // Drag & drop for slots
  function handleDragStart(e, idx, dayId) {
    setDragIndex({ idx, dayId });
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, toIdx, dayId) {
    e.preventDefault();
    if (archived || !dragIndex || dragIndex.dayId !== dayId) { setDragIndex(null); return; }
    const daySlots = state.agendaSlots.filter(s => s.day_id === dayId).sort((a, b) => a.position - b.position);
    const reordered = [...daySlots];
    const [moved] = reordered.splice(dragIndex.idx, 1);
    reordered.splice(toIdx, 0, moved);
    socket.emit('reorder-agenda-slots', { dayId, orderedIds: reordered.map(s => s.id) });
    setDragIndex(null);
  }

  // US-A001: Empty state
  if (days.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-card mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,222,89,0.15)' }}>
          <Calendar size={32} style={{ color: 'var(--color-accent-dark)' }} />
        </div>
        <h2 className="font-display text-h2-mobile mb-3">Planifiez votre intervention</h2>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Configurez les jours et horaires, puis placez vos blocs du déroulé dans l'agenda.
        </p>
        <button onClick={createDay} className="btn-primary text-body-sm flex items-center gap-2 mx-auto">
          <Plus size={18} /> Configurer le premier jour
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Unscheduled blocks (US-A009) */}
      {blocks.length > 0 && (
        <UnscheduledBlocks blocks={blocks} scheduledIds={scheduledIds}
          onSchedule={(b) => scheduleBlock(days[0].id, b)} />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setViewMode(viewMode === 'timeline' ? 'table' : 'timeline')}
          className="btn-ghost text-caption flex items-center gap-1">
          {viewMode === 'timeline' ? <Table size={14} /> : <LayoutList size={14} />}
          {viewMode === 'timeline' ? 'Vue table' : 'Vue timeline'}
        </button>
        <button onClick={createDay} className="btn-ghost text-caption flex items-center gap-1">
          <Plus size={14} /> Ajouter un jour
        </button>
      </div>

      {/* Days */}
      {days.map(day => {
        const daySlots = state.agendaSlots
          .filter(s => s.day_id === day.id)
          .sort((a, b) => a.position - b.position);

        // Recalculate start times sequentially
        let runningTime = day.start_time;
        const slotsWithTime = daySlots.map(slot => {
          const st = runningTime;
          runningTime = addMinutesToTime(runningTime, slot.duration_minutes);
          return { ...slot, computedStart: st };
        });

        const totalPlanned = daySlots.reduce((a, s) => a + (s.duration_minutes || 0), 0);
        const availableMinutes = timeToMinutes(day.end_time) - timeToMinutes(day.start_time);
        const overflow = totalPlanned - availableMinutes;

        // US-A014: Current time indicator
        const now = new Date();
        const today = day.date && day.date === now.toISOString().slice(0, 10);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const dayStartMinutes = timeToMinutes(day.start_time);
        const dayEndMinutes = timeToMinutes(day.end_time);
        const isLive = today && currentMinutes >= dayStartMinutes && currentMinutes <= dayEndMinutes;

        return (
          <div key={day.id} className="mb-8">
            <DayConfig day={day}
              onUpdate={(fields) => updateDay(day.id, fields)}
              onDelete={() => deleteDay(day.id)}
              canDelete={days.length > 1} />

            {/* Time indicators (US-A011, US-A012) */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-caption flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <Clock size={12} />
                Planifié : {formatDuration(totalPlanned)} / {formatDuration(availableMinutes)}
              </span>
              {overflow > 0 && (
                <span className="text-caption flex items-center gap-1 font-semibold" style={{ color: 'var(--color-error)' }}>
                  <AlertTriangle size={12} />
                  Dépassement de {formatDuration(overflow)}
                </span>
              )}
              {availableMinutes - totalPlanned > 0 && (
                <span className="text-caption" style={{ color: 'var(--color-success)' }}>
                  {formatDuration(availableMinutes - totalPlanned)} disponibles
                </span>
              )}
              {isLive && (
                <span className="text-caption font-semibold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
                  En cours
                </span>
              )}
            </div>

            {/* Fill bar */}
            <div className="flex rounded-full overflow-hidden h-1.5 mb-4" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
              <div className="transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, (totalPlanned / Math.max(availableMinutes, 1)) * 100)}%`,
                  backgroundColor: overflow > 0 ? 'var(--color-error)' : 'var(--color-accent-dark)'
                }} />
            </div>

            {/* Slots */}
            {viewMode === 'timeline' ? (
              <div className="space-y-1.5">
                {slotsWithTime.map((slot, i) => {
                  const block = slot.block_id ? blocks.find(b => b.id === slot.block_id) : null;
                  const isOverflow = overflow > 0 && timeToMinutes(addMinutesToTime(slot.computedStart, slot.duration_minutes)) > dayEndMinutes;
                  return (
                    <div key={slot.id} style={{ opacity: isOverflow ? 0.5 : 1 }}>
                      <AgendaSlot
                        slot={slot}
                        block={block}
                        startTime={slot.computedStart}
                        onDelete={() => deleteSlot(slot.id)}
                        onResize={(d) => resizeSlot(slot.id, d)}
                        onDragStart={(e, idx) => handleDragStart(e, idx, day.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e, idx) => handleDrop(e, idx, day.id)}
                        index={i}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* US-A017: Table view */
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="text-left text-label uppercase" style={{ color: 'var(--color-text-muted)', borderBottom: '2px solid var(--color-border)' }}>
                      <th className="py-2 pr-4">Horaire</th>
                      <th className="py-2 pr-4">Activité</th>
                      <th className="py-2 pr-4">Durée</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotsWithTime.map(slot => {
                      const block = slot.block_id ? blocks.find(b => b.id === slot.block_id) : null;
                      const bt = block ? (BLOCK_TYPES[block.block_type] || BLOCK_TYPES.production) : null;
                      const endTime = addMinutesToTime(slot.computedStart, slot.duration_minutes);
                      return (
                        <tr key={slot.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td className="py-2 pr-4 font-medium">{slot.computedStart}–{endTime}</td>
                          <td className="py-2 pr-4">{block ? block.title : slot.title || 'Pause'}</td>
                          <td className="py-2 pr-4">{formatDuration(slot.duration_minutes)}</td>
                          <td className="py-2 pr-4">
                            {bt ? (
                              <span className="text-caption px-2 py-0.5 rounded-full" style={{ backgroundColor: `${bt.color}15`, color: bt.color }}>
                                {bt.label}
                              </span>
                            ) : (
                              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{slot.slot_type === 'pause' ? 'Pause' : 'Buffer'}</span>
                            )}
                          </td>
                          <td className="py-2">
                            <button onClick={() => deleteSlot(slot.id)} className="p-1 rounded hover:bg-black/5 opacity-40 hover:opacity-100">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add slot actions */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Add block from déroulé */}
              <AddBlockDropdown blocks={blocks} scheduledIds={scheduledIds}
                onSelect={(b) => scheduleBlock(day.id, b)} />

              {/* Quick pauses (US-A005) */}
              {QUICK_PAUSES.map(p => (
                <button key={p.title} onClick={() => addPause(day.id, p)}
                  className="btn-ghost text-caption flex items-center gap-1">
                  <p.icon size={12} /> {p.title} ({p.duration}min)
                </button>
              ))}

              {/* Buffer (US-A006) */}
              <button onClick={() => addBuffer(day.id)}
                className="btn-ghost text-caption flex items-center gap-1">
                <Pause size={12} /> Buffer (15min)
              </button>

              {/* Auto schedule (US-A010) */}
              {blocks.filter(b => !scheduledIds.includes(b.id)).length > 0 && (
                <button onClick={() => autoSchedule(day.id)}
                  className="btn-primary text-caption flex items-center gap-1">
                  <Wand2 size={12} /> Planifier automatiquement
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== Dropdown to add a block from déroulé (US-A004) =====
function AddBlockDropdown({ blocks, scheduledIds, onSelect }) {
  const [open, setOpen] = useState(false);
  const unscheduled = blocks.filter(b => !scheduledIds.includes(b.id));

  if (unscheduled.length === 0) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="btn-ghost text-caption flex items-center gap-1">
        <Plus size={12} /> Ajouter un bloc
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-card elevation-2 z-50 min-w-[250px] max-h-[240px] overflow-y-auto p-1"
          style={{ backgroundColor: 'var(--color-surface)' }}>
          {unscheduled.map(b => {
            const bt = BLOCK_TYPES[b.block_type] || BLOCK_TYPES.production;
            return (
              <button key={b.id}
                onClick={() => { onSelect(b); setOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-btn text-caption hover:bg-black/5 flex items-center gap-2 transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bt.color }} />
                <span className="truncate">{b.title}</span>
                <span className="ml-auto shrink-0" style={{ color: 'var(--color-text-muted)' }}>{formatDuration(b.duration_minutes)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
