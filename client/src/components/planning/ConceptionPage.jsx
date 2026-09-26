import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowDown, ArrowUp, BookOpen, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Coffee,
  Copy, Edit3, FileText, GripVertical, Info, LayoutTemplate, Lightbulb, Minus, Play, Plus, Redo2, Trash2, Undo2, Utensils, Wand2,
} from 'lucide-react';
import { useStore } from '../../store.jsx';
import socket from '../../socket.js';
import { usePlanning } from '../../planning/usePlanning.js';
import { analyzePlanning, computeDay, dayLabel, fmtDur, hm, sequencesOf, sortByPos, stripDashes, formatDate } from '../../planning/utils.js';
import { BLOCK_TYPES, DIAMOND, KINDS } from '../../planning/constants.js';
import { AutoField, Segmented } from '../ui/Overlay.jsx';
import FicheCard from './FicheCard.jsx';
import SequenceEditor from './SequenceEditor.jsx';
import MethodLibrary from './MethodLibrary.jsx';
import TemplatesModal from './TemplatesModal.jsx';

const DRAG_TYPE = 'application/x-insuffle-seq';

// ================= Ligne de séquence =================
function SequenceRow({ seq, index, onEdit, onDropAt, dayId, isFirst, isLast, highlight, live }) {
  const actions = usePlanning();
  const [over, setOver] = useState(null); // 'before' | 'after'
  const ro = actions.archived;
  const kind = KINDS[seq.kind] ? seq.kind : 'collectif';
  const bt = BLOCK_TYPES[seq.block_type];
  const step = 15;

  const leftColor = kind === 'apport' ? '#F2C245' : kind === 'pause' ? 'transparent' : 'var(--color-primary)';
  const bg = kind === 'apport' ? 'rgba(242,194,69,0.10)' : kind === 'pause'
    ? 'repeating-linear-gradient(135deg, var(--color-surface-alt) 0 8px, var(--color-surface) 8px 16px)' : 'var(--color-surface)';

  return (
    <div
      draggable={!ro}
      onDragStart={e => { e.dataTransfer.setData(DRAG_TYPE, seq.id); e.dataTransfer.setData('text/plain', seq.title); e.dataTransfer.effectAllowed = 'move'; }}
      onDragOver={e => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        setOver(e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      }}
      onDragLeave={() => setOver(null)}
      onDrop={e => {
        const id = e.dataTransfer.getData(DRAG_TYPE);
        const pos = over;
        setOver(null);
        if (!id) return;
        e.preventDefault();
        e.stopPropagation();
        onDropAt(id, pos === 'after' ? index + 1 : index);
      }}
      className={`group relative flex items-stretch rounded-card transition-shadow ${kind === 'pause' ? '' : 'elevation-1 hover:elevation-2'} ${highlight ? 'ring-2 ring-red-400' : ''} ${live ? 'ring-2 ring-emerald-500' : ''}`}
      style={{ background: bg, borderLeft: `5px solid ${leftColor}`, border: kind === 'pause' ? '1px dashed var(--color-border)' : undefined, borderLeftWidth: 5, borderLeftStyle: 'solid', borderLeftColor: leftColor }}
    >
      {over && <div className="absolute left-0 right-0 h-0.5 rounded-full pointer-events-none" style={{ backgroundColor: 'var(--color-accent)', top: over === 'before' ? -4 : undefined, bottom: over === 'after' ? -4 : undefined }} />}

      <div className="w-[76px] shrink-0 flex flex-col justify-center pl-2.5 py-2 text-caption" style={{ color: 'var(--color-text-muted)' }}>
        <span className="font-bold text-body-sm" style={{ color: 'var(--color-text)' }}>{seq.start != null ? hm(seq.start) : '·'}</span>
        <span className="text-[11px]">{seq.end != null ? hm(seq.end) : ''}</span>
      </div>

      <button type="button" onClick={() => onEdit(seq.id)} className="flex-1 min-w-0 text-left py-2.5 pr-2">
        {kind === 'pause' ? (
          <span className="flex items-center gap-2 text-body-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            {/déj/i.test(seq.title) ? <Utensils size={14} /> : <Coffee size={14} />} {seq.title}
          </span>
        ) : (
          <>
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold text-body-sm leading-snug">{seq.title}</span>
              {kind === 'apport' && <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F2C245', color: '#141E37' }}>Apport</span>}
              {seq.diamond && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: DIAMOND[seq.diamond]?.color }} title={DIAMOND[seq.diamond]?.hint}>{DIAMOND[seq.diamond]?.label}</span>}
              {bt && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bt.color }} title={bt.label} />}
              {seq.attention_flag && <AlertTriangle size={13} style={{ color: 'var(--color-warning)' }} aria-label="Point d'attention" />}
            </span>
            {seq.intention
              ? <span className="block text-caption mt-0.5 line-clamp-2">{seq.intention}</span>
              : <span className="block text-caption mt-0.5 italic" style={{ color: 'var(--color-warning)' }}>Intention à écrire</span>}
            {(seq.format || seq.production) && (
              <span className="block text-caption mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                {seq.format}{seq.production && <b style={{ color: 'var(--color-text)' }}>{seq.format ? ' → ' : ''}{seq.production}</b>}
              </span>
            )}
          </>
        )}
      </button>

      <div className="flex items-center gap-0.5 pr-1.5 shrink-0">
        {!ro && (
          <button type="button" className="p-1 rounded hover:bg-black/5 opacity-50 hover:opacity-100" aria-label="Réduire de 15 min"
            onClick={() => actions.updateSequence(seq.id, { duration_minutes: Math.max(5, seq.duration_minutes - step) })}><Minus size={13} /></button>
        )}
        <span className="text-caption font-bold w-12 text-center tabular-nums">{fmtDur(seq.duration_minutes)}</span>
        {!ro && (
          <button type="button" className="p-1 rounded hover:bg-black/5 opacity-50 hover:opacity-100" aria-label="Allonger de 15 min"
            onClick={() => actions.updateSequence(seq.id, { duration_minutes: Math.min(600, seq.duration_minutes + step) })}><Plus size={13} /></button>
        )}
        {!ro && (
          <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-1">
            <button type="button" className="p-1 rounded hover:bg-black/5 disabled:opacity-20" disabled={isFirst} aria-label="Monter"
              onClick={() => actions.moveSequence(seq.id, dayId, index - 1)}><ArrowUp size={14} /></button>
            <button type="button" className="p-1 rounded hover:bg-black/5 disabled:opacity-20" disabled={isLast} aria-label="Descendre"
              onClick={() => actions.moveSequence(seq.id, dayId, index + 1)}><ArrowDown size={14} /></button>
            <button type="button" className="p-1 rounded hover:bg-black/5" aria-label="Dupliquer" onClick={() => actions.duplicateSequence(seq.id)}><Copy size={14} /></button>
            <button type="button" className="p-1 rounded hover:bg-black/5" aria-label="Supprimer" style={{ color: 'var(--color-error)' }}
              onClick={() => { if (confirm(`Supprimer « ${seq.title} » ?`)) actions.deleteSequence(seq.id); }}><Trash2 size={14} /></button>
          </div>
        )}
        {!ro && <span className="cursor-grab opacity-25 group-hover:opacity-60 pl-0.5 hidden sm:inline" aria-hidden><GripVertical size={16} /></span>}
      </div>
    </div>
  );
}

// ================= Encadré du jour =================
function EncadreEditor({ day }) {
  const actions = usePlanning();
  const enc = day.encadre || { titre: '', items: [], colonnes: 1 };
  const [open, setOpen] = useState(false);
  const ro = actions.archived;
  const save = (next) => actions.updateDay(day.id, { encadre: next });
  const items = enc.items || [];

  return (
    <div className="mt-3 rounded-card" style={{ border: '1px dashed var(--color-border)' }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-caption font-semibold" style={{ color: 'var(--color-text-muted)' }}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Encadré sous le planning {enc.titre ? `: ${enc.titre}` : '(sous-questions, tables, consignes clés)'}
      </button>
      {open && (
        <div className="px-3 pb-3 grid gap-2 animate-fade-in">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-[200px]"><AutoField value={enc.titre} disabled={ro} placeholder="Ex : Les 5 tables : on se place dans un an et on raconte au passé" onSave={v => save({ ...enc, titre: v })} /></div>
            <Segmented value={enc.colonnes === 2 ? 2 : 1} disabled={ro} onChange={v => save({ ...enc, colonnes: v })} options={[{ value: 1, label: '1 colonne' }, { value: 2, label: '2 colonnes' }]} />
          </div>
          {items.map((it, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-48 shrink-0"><AutoField value={it.label} disabled={ro} placeholder={`${i + 1}. Titre court.`} onSave={v => save({ ...enc, items: items.map((x, j) => j === i ? { ...x, label: v } : x) })} /></div>
              <div className="flex-1"><AutoField value={it.texte} disabled={ro} placeholder="La sous-question, dérivée de la question-titre ?" onSave={v => save({ ...enc, items: items.map((x, j) => j === i ? { ...x, texte: v } : x) })} /></div>
              {!ro && <button type="button" className="p-2 rounded hover:bg-black/5" aria-label="Retirer" onClick={() => save({ ...enc, items: items.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>}
            </div>
          ))}
          {!ro && (
            <div className="flex gap-2">
              <button type="button" className="btn-ghost text-caption flex items-center gap-1" onClick={() => save({ ...enc, items: [...items, { label: `${items.length + 1}.`, texte: '' }] })}><Plus size={13} /> Ligne</button>
              {(enc.titre || items.length > 0) && <button type="button" className="btn-ghost text-caption" onClick={() => { if (confirm('Vider l\'encadré ?')) save({ titre: '', items: [] }); }}>Vider</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ================= Jour =================
function DayPanel({ day, index, count, blocks, onEdit, onLibrary, overflowIds, liveId }) {
  const actions = usePlanning();
  const ro = actions.archived;
  const c = computeDay(day, blocks);
  const fill = c.window > 0 ? Math.min(100, (c.planned / c.window) * 100) : 0;
  const over = c.plannedEnd - c.end;
  const [dropOver, setDropOver] = useState(false);

  const quick = (fields) => actions.addSequence(day.id, null, fields);

  return (
    <section className="rounded-card p-4 sm:p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }} aria-label={dayLabel(day, index)}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
        <div className="w-36"><AutoField value={day.label} disabled={ro} onSave={v => actions.updateDay(day.id, { label: v })} placeholder={`Jour ${index + 1}`} className="font-display font-bold !text-body" /></div>
        <input type="date" className="input-field !w-auto text-caption" value={day.date || ''} disabled={ro} aria-label="Date du jour"
          onChange={e => actions.updateDay(day.id, { date: e.target.value })} />
        <div className="flex items-center gap-1 text-caption">
          <input type="time" step={900} className="input-field !w-auto text-caption" value={day.start_time} disabled={ro} aria-label="Début"
            onChange={e => e.target.value && actions.updateDay(day.id, { start_time: e.target.value })} />
          <span>à</span>
          <input type="time" step={900} className="input-field !w-auto text-caption" value={day.end_time} disabled={ro} aria-label="Fin"
            onChange={e => e.target.value && actions.updateDay(day.id, { end_time: e.target.value })} />
        </div>
        {day.date && <span className="text-caption capitalize hidden md:inline" style={{ color: 'var(--color-text-muted)' }}>{formatDate(day.date)}</span>}
        {!ro && (
          <div className="flex items-center gap-0.5 ml-auto">
            <button type="button" className="p-1.5 rounded hover:bg-black/5 disabled:opacity-20" disabled={index === 0} aria-label="Jour précédent" onClick={() => actions.moveDay(day.id, index - 1)}><ArrowUp size={15} /></button>
            <button type="button" className="p-1.5 rounded hover:bg-black/5 disabled:opacity-20" disabled={index === count - 1} aria-label="Jour suivant" onClick={() => actions.moveDay(day.id, index + 1)}><ArrowDown size={15} /></button>
            <button type="button" className="p-1.5 rounded hover:bg-black/5" aria-label="Dupliquer le jour" title="Dupliquer le jour" onClick={() => actions.duplicateDay(day.id)}><Copy size={15} /></button>
            <button type="button" className="p-1.5 rounded hover:bg-black/5" aria-label="Supprimer le jour" title="Supprimer le jour" style={{ color: 'var(--color-error)' }}
              onClick={() => {
                if (!c.seqs.length) { actions.deleteDay(day.id, false); return; }
                const keep = confirm(`Supprimer ${dayLabel(day, index)} ?\n\nOK : ses séquences partent sur le banc.\nAnnuler : on ne supprime rien.`);
                if (keep) actions.deleteDay(day.id, true);
              }}><Trash2 size={15} /></button>
          </div>
        )}
      </header>

      <div className="flex items-center gap-3 mb-3 text-caption">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${fill}%`, backgroundColor: over > 0 ? 'var(--color-error)' : fill === 100 ? 'var(--color-success)' : 'var(--color-accent)' }} />
        </div>
        <span className="font-semibold tabular-nums" style={{ color: over > 0 ? 'var(--color-error)' : fill === 100 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {fmtDur(c.planned)} / {fmtDur(c.window)}
          {over > 0 ? ` · dépasse de ${fmtDur(over)}` : c.planned < c.window && c.seqs.length ? ` · ${fmtDur(c.window - c.planned)} libres` : c.seqs.length ? ' · tombe juste' : ''}
        </span>
      </div>

      <div className="space-y-1.5"
        onDragOver={e => { if (e.dataTransfer.types.includes(DRAG_TYPE)) { e.preventDefault(); setDropOver(true); } }}
        onDragLeave={() => setDropOver(false)}
        onDrop={e => { setDropOver(false); const id = e.dataTransfer.getData(DRAG_TYPE); if (id) { e.preventDefault(); actions.moveSequence(id, day.id, null); } }}>
        {c.seqs.map((s, i) => (
          <SequenceRow key={s.id} seq={s} index={i} dayId={day.id} onEdit={onEdit}
            isFirst={i === 0} isLast={i === c.seqs.length - 1}
            highlight={overflowIds.includes(s.id)} live={liveId === s.id}
            onDropAt={(id, at) => {
              const list = c.seqs.map(x => x.id);
              const from = list.indexOf(id);
              const target = from >= 0 && from < at ? at - 1 : at;
              actions.moveSequence(id, day.id, target);
            }} />
        ))}
        {c.seqs.length === 0 && (
          <div className="rounded-card py-8 text-center text-body-sm" style={{ border: `2px dashed ${dropOver ? 'var(--color-accent)' : 'var(--color-border)'}`, color: 'var(--color-text-muted)' }}>
            Glissez une séquence ici, ou ajoutez-en une ci-dessous.
          </div>
        )}
        {c.seqs.length > 0 && <div className="h-2 rounded" style={{ backgroundColor: dropOver ? 'var(--color-accent)' : 'transparent' }} />}
      </div>

      {!ro && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <button type="button" className="btn-ghost text-caption flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => quick({ kind: 'collectif', title: 'Nouvelle séquence', duration_minutes: 30, block_type: 'production' })}><Plus size={13} /> Séquence</button>
          <button type="button" className="btn-ghost text-caption flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => quick({ kind: 'apport', title: 'Apport', duration_minutes: 15, block_type: 'transition' })}><Lightbulb size={13} /> Apport</button>
          <button type="button" className="btn-ghost text-caption flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => quick({ kind: 'pause', title: 'Pause', duration_minutes: 15 })}><Coffee size={13} /> Pause</button>
          <button type="button" className="btn-ghost text-caption flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => quick({ kind: 'pause', title: 'Déjeuner', duration_minutes: 60 })}><Utensils size={13} /> Déjeuner</button>
          <button type="button" className="btn-ghost text-caption flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => onLibrary(day.id)}><BookOpen size={13} /> Méthode</button>
          {c.plannedEnd < c.end && c.seqs.length > 0 && (
            <button type="button" className="btn-ghost text-caption flex items-center gap-1 ml-auto" title="Allonge la dernière séquence non-pause pour finir pile à l'heure"
              onClick={() => {
                const last = [...c.seqs].reverse().find(s => s.kind !== 'pause');
                if (last) actions.updateSequence(last.id, { duration_minutes: last.duration_minutes + (c.end - c.plannedEnd) });
              }}><Wand2 size={13} /> Finir à {hm(c.end)}</button>
          )}
        </div>
      )}

      <EncadreEditor day={day} />
    </section>
  );
}

// ================= Contrôles et équilibre =================
function ChecksPanel({ analysis, onFixDashes, onEdit }) {
  const { issues, stats } = analysis;
  const errors = issues.filter(i => i.level === 'error');
  const warns = issues.filter(i => i.level === 'warn');
  const tips = issues.filter(i => i.level === 'tip');
  const work = stats.collectif + stats.apport + stats.pause;
  const diamondTotal = stats.diverger + stats.groan + stats.converger;

  const Item = ({ i }) => (
    <li className="flex gap-2 text-caption leading-snug">
      {i.level === 'error' ? <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
        : i.level === 'warn' ? <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          : <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />}
      <span>
        {i.msg}
        {i.seqId && <button type="button" className="ml-1 underline" onClick={() => onEdit(i.seqId)}>Ouvrir</button>}
        {i.fix === 'dashes' && <button type="button" className="ml-1 underline" onClick={onFixDashes}>Corriger partout</button>}
      </span>
    </li>
  );

  return (
    <div className="grid gap-4">
      <section className="rounded-card p-4 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
        <h3 className="font-display font-semibold text-body-sm mb-2 flex items-center gap-2">
          {errors.length === 0 && warns.length === 0 ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <AlertTriangle size={16} style={{ color: errors.length ? 'var(--color-error)' : 'var(--color-warning)' }} />}
          Contrôles
          <span className="text-caption font-normal ml-auto" style={{ color: 'var(--color-text-muted)' }}>{errors.length} bloquant{errors.length > 1 ? 's' : ''} · {warns.length} à regarder</span>
        </h3>
        {issues.length === 0 && <p className="text-caption" style={{ color: 'var(--color-success)' }}>Tout tombe juste. Le planning peut partir au client.</p>}
        <ul className="space-y-1.5">
          {[...errors, ...warns].map((i, k) => <Item key={k} i={i} />)}
        </ul>
        {tips.length > 0 && (
          <>
            <p className="text-label uppercase font-semibold mt-3 mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Repères</p>
            <ul className="space-y-1.5">{tips.map((i, k) => <Item key={k} i={i} />)}</ul>
          </>
        )}
      </section>

      {work > 0 && (
        <section className="rounded-card p-4 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="font-display font-semibold text-body-sm mb-3">Équilibre du déroulé</h3>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
            <div style={{ width: `${(stats.collectif / work) * 100}%`, backgroundColor: 'var(--color-ink)' }} title="Collectif" />
            <div style={{ width: `${(stats.apport / work) * 100}%`, backgroundColor: '#F2C245' }} title="Apport" />
            <div style={{ width: `${(stats.pause / work) * 100}%`, backgroundColor: '#c4c4c4' }} title="Pauses" />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-caption mb-1">
            <span><b>{fmtDur(stats.collectif)}</b> collectif</span>
            <span><b>{fmtDur(stats.apport)}</b> apport</span>
            <span><b>{fmtDur(stats.pause)}</b> pauses</span>
          </div>
          <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
            {stats.actif} % de travail actif. Repère : {stats.repere.label.toLowerCase()}.
          </p>

          {diamondTotal > 0 && (
            <>
              <p className="text-label uppercase font-semibold mt-4 mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Double diamant</p>
              <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
                {['diverger', 'groan', 'converger'].map(k => <div key={k} style={{ width: `${(stats[k] / diamondTotal) * 100}%`, backgroundColor: DIAMOND[k].color }} title={DIAMOND[k].label} />)}
              </div>
              <div className="flex flex-wrap gap-x-3 text-caption">
                {['diverger', 'groan', 'converger'].map(k => <span key={k}><b>{fmtDur(stats[k])}</b> {DIAMOND[k].label.toLowerCase()}</span>)}
              </div>
            </>
          )}

          <p className="text-label uppercase font-semibold mt-4 mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Par nature</p>
          <div className="grid gap-1">
            {Object.entries(stats.byType).filter(([k]) => k !== 'pause').sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-caption">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BLOCK_TYPES[k]?.color || '#999' }} />
                <span className="flex-1">{BLOCK_TYPES[k]?.label || k}</span>
                <span className="tabular-nums font-semibold">{fmtDur(v)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Bench({ blocks, onEdit }) {
  const actions = usePlanning();
  const { state } = useStore();
  const bench = sequencesOf(blocks, null);
  const days = sortByPos(state.agendaDays);
  const [over, setOver] = useState(false);
  return (
    <section className="rounded-card p-4" style={{ border: `2px dashed ${over ? 'var(--color-accent)' : 'var(--color-border)'}`, backgroundColor: 'var(--color-surface)' }}
      onDragOver={e => { if (e.dataTransfer.types.includes(DRAG_TYPE)) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { setOver(false); const id = e.dataTransfer.getData(DRAG_TYPE); if (id) { e.preventDefault(); actions.moveSequence(id, null, null); } }}>
      <h3 className="font-display font-semibold text-body-sm mb-1">Le banc</h3>
      <p className="text-caption mb-2" style={{ color: 'var(--color-text-muted)' }}>Les séquences en réserve, pas encore placées. Glissez-les dans un jour, ou déposez ici ce que vous sortez.</p>
      <div className="space-y-1.5">
        {bench.map(s => (
          <div key={s.id} draggable={!actions.archived}
            onDragStart={e => { e.dataTransfer.setData(DRAG_TYPE, s.id); e.dataTransfer.effectAllowed = 'move'; }}
            className="flex items-center gap-2 rounded-btn px-2.5 py-1.5 text-caption cursor-grab"
            style={{ backgroundColor: 'var(--color-surface-alt)', borderLeft: `3px solid ${s.kind === 'apport' ? '#F2C245' : s.kind === 'pause' ? '#c4c4c4' : 'var(--color-ink)'}` }}>
            <button type="button" className="flex-1 text-left truncate font-medium" onClick={() => onEdit(s.id)}>{s.title}</button>
            <span className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{fmtDur(s.duration_minutes)}</span>
            {days.length > 0 && !actions.archived && (
              <select className="text-caption bg-transparent" value="" aria-label="Placer dans un jour" onChange={e => e.target.value && actions.moveSequence(s.id, e.target.value, null)}>
                <option value="">Placer…</option>
                {days.map((d, i) => <option key={d.id} value={d.id}>{dayLabel(d, i)}</option>)}
              </select>
            )}
          </div>
        ))}
        {bench.length === 0 && <p className="text-caption italic" style={{ color: 'var(--color-text-muted)' }}>Vide.</p>}
      </div>
    </section>
  );
}

// ================= Jour J : où en est-on ? =================
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), intervalMs); return () => clearInterval(t); }, [intervalMs]);
  return now;
}

function LiveBar({ days, blocks }) {
  const { state } = useStore();
  const now = useNow();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const day = days.find(d => d.date === today);
  if (!day) return null;
  const c = computeDay(day, blocks);
  const mins = now.getHours() * 60 + now.getMinutes();
  const cur = c.seqs.find(s => mins >= s.start && mins < s.end);
  const next = c.seqs.find(s => s.start >= mins && s !== cur);
  const canTimer = state.isFacilitator || (state.facilitators || []).length === 0;
  if (!cur && !next) return null;
  return (
    <div className="rounded-card px-4 py-3 mb-4 flex flex-wrap items-center gap-3 elevation-1" style={{ backgroundColor: '#141E37', color: '#fff' }} role="status">
      <span className="flex items-center gap-1.5 text-caption font-bold uppercase tracking-wider" style={{ color: '#F2C245' }}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Jour J
      </span>
      {cur ? (
        <span className="text-body-sm"><b>{cur.title}</b> · jusqu'à {hm(cur.end)} · reste {fmtDur(cur.end - mins)}</span>
      ) : <span className="text-body-sm">Pas encore commencé.</span>}
      {next && <span className="text-caption opacity-70">Ensuite : {next.title} à {hm(next.start)}</span>}
      {cur && canTimer && (
        <button type="button" className="ml-auto btn-primary !py-1 !px-3 text-caption flex items-center gap-1"
          onClick={() => socket.emit('start-timer', { duration: Math.max(60, (cur.end - mins) * 60) })}>
          <Play size={13} /> Timer jusqu'à {hm(cur.end)}
        </button>
      )}
    </div>
  );
}

// ================= Page =================
export default function ConceptionPage({ onOpenAgenda }) {
  const { state, dispatch } = useStore();
  const actions = usePlanning();
  const [editId, setEditId] = useState(null);
  const [library, setLibrary] = useState({ open: false, dayId: null });
  const [templates, setTemplates] = useState(false);
  const days = sortByPos(state.agendaDays);
  const blocks = state.blocks;
  const analysis = useMemo(() => analyzePlanning(state.planning, days, blocks), [state.planning, days, blocks]);
  const now = useNow(60000);
  const liveId = useMemo(() => {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const day = days.find(d => d.date === today);
    if (!day) return null;
    const mins = now.getHours() * 60 + now.getMinutes();
    return computeDay(day, blocks).seqs.find(s => mins >= s.start && mins < s.end)?.id || null;
  }, [now, days, blocks]);

  // Raccourcis : Ctrl+Z / Ctrl+Maj+Z
  useEffect(() => {
    function onKey(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) actions.redo(); else actions.undo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  function fixDashes() {
    const p = state.planning;
    const meta = {};
    for (const k of ['question', 'intention', 'footer_note', 'reference', 'accueil']) if (/[—–]/.test(p[k] || '')) meta[k] = stripDashes(p[k]);
    if (Object.keys(meta).length) actions.setMeta(meta);
    for (const b of blocks) {
      const f = {};
      for (const k of ['title', 'intention', 'format', 'production']) if (/[—–]/.test(b[k] || '')) f[k] = stripDashes(b[k]);
      if (Object.keys(f).length) actions.updateSequence(b.id, f, { history: false });
    }
    for (const d of days) {
      const enc = d.encadre;
      const lbl = /[—–]/.test(d.label || '');
      const encDirty = enc && /[—–]/.test(JSON.stringify(enc));
      if (lbl || encDirty) {
        actions.updateDay(d.id, {
          ...(lbl ? { label: stripDashes(d.label) } : {}),
          ...(encDirty ? { encadre: { ...enc, titre: stripDashes(enc.titre), items: (enc.items || []).map(i => ({ label: stripDashes(i.label), texte: stripDashes(i.texte) })) } } : {}),
        }, { history: false });
      }
    }
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Tirets longs remplacés', type: 'success' } });
  }

  const totalMinutes = days.reduce((a, d) => a + computeDay(d, blocks).planned, 0);
  const empty = days.length === 0 && blocks.length === 0;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-5">
      <LiveBar days={days} blocks={blocks} />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <div className="grid gap-5 min-w-0">
          <FicheCard compact={!empty} />

          <div className="flex flex-wrap items-center gap-2 sticky top-[49px] z-10 py-2 -my-2" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <button type="button" onClick={() => setTemplates(true)} className="btn-ghost text-body-sm flex items-center gap-1.5" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <LayoutTemplate size={16} /> Modèles
            </button>
            <button type="button" onClick={() => setLibrary({ open: true, dayId: days[0]?.id ?? null })} className="btn-ghost text-body-sm flex items-center gap-1.5" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <BookOpen size={16} /> Méthodes
            </button>
            {!actions.archived && (
              <button type="button" onClick={() => actions.addDay({ date: days.length === 0 ? (state.space?.session_date || '') : '' })} className="btn-ghost text-body-sm flex items-center gap-1.5" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <CalendarPlus size={16} /> Jour
              </button>
            )}
            <div className="flex items-center" style={{ border: '1px solid var(--color-border)', borderRadius: 8, backgroundColor: 'var(--color-surface)' }}>
              <button type="button" onClick={actions.undo} disabled={!actions.canUndo} className="p-2 disabled:opacity-30" aria-label="Annuler" title="Annuler (Ctrl+Z)"><Undo2 size={16} /></button>
              <button type="button" onClick={actions.redo} disabled={!actions.canRedo} className="p-2 disabled:opacity-30" aria-label="Rétablir" title="Rétablir (Ctrl+Maj+Z)"><Redo2 size={16} /></button>
            </div>
            <span className="text-caption ml-1" style={{ color: 'var(--color-text-muted)' }}>
              {days.length} jour{days.length > 1 ? 's' : ''} · {fmtDur(totalMinutes)}
            </span>
            {onOpenAgenda && (
              <button type="button" onClick={onOpenAgenda} className="btn-primary text-body-sm flex items-center gap-1.5 ml-auto">
                <FileText size={16} /> Agenda A4
              </button>
            )}
          </div>

          {empty && (
            <div className="rounded-card p-8 text-center elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
              <h2 className="font-display font-bold text-h2-mobile mb-2">Concevez le temps collectif</h2>
              <p className="text-body-sm max-w-xl mx-auto mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Une question-titre, une intention, puis des séquences au quart d'heure. Partez d'un modèle Insuffle ou d'une page blanche.
              </p>
              {!actions.archived && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button type="button" className="btn-primary flex items-center gap-2" onClick={() => setTemplates(true)}><LayoutTemplate size={18} /> Partir d'un modèle</button>
                  <button type="button" className="btn-ghost flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}
                    onClick={() => actions.addDay({ start_time: '09:00', end_time: '12:30', date: state.space?.session_date || '' })}><CalendarPlus size={18} /> Page blanche</button>
                </div>
              )}
            </div>
          )}

          {days.map((d, i) => (
            <DayPanel key={d.id} day={d} index={i} count={days.length} blocks={blocks}
              onEdit={setEditId} onLibrary={(id) => setLibrary({ open: true, dayId: id })} overflowIds={state.sheetOverflow || []} liveId={liveId} />
          ))}
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-[64px] lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto pb-2">
          <ChecksPanel analysis={analysis} onFixDashes={fixDashes} onEdit={setEditId} />
          <Bench blocks={blocks} onEdit={setEditId} />
        </aside>
      </div>

      {editId && <SequenceEditor seqId={editId} onClose={() => setEditId(null)} />}
      {library.open && <MethodLibrary targetDayId={library.dayId} onClose={() => setLibrary({ open: false, dayId: null })} />}
      {templates && <TemplatesModal onClose={() => setTemplates(false)} />}
    </div>
  );
}

