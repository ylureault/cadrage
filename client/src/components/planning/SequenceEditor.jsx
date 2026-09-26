import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useStore } from '../../store.jsx';
import { usePlanning } from '../../planning/usePlanning.js';
import { KINDS, BLOCK_TYPES, DIAMOND } from '../../planning/constants.js';
import { METHODS_BY_KEY } from '../../planning/methods.js';
import { computeDay, hm, fmtDur, LONG_DASH } from '../../planning/utils.js';
import { Drawer, Label, Segmented } from '../ui/Overlay.jsx';

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];

const FORMAT_HINTS = ['Plénière.', 'Binômes.', 'Trinômes.', 'Sous-groupes de 4.', 'Tables de 6 mélangées.', 'Seul, en silence.', 'Debout.', 'En sous-salles (visio).'];

export default function SequenceEditor({ seqId, onClose }) {
  const { state } = useStore();
  const actions = usePlanning();
  const seq = state.blocks.find(b => b.id === seqId);
  const [f, setF] = useState(() => seq ? { ...seq } : null);
  const [dirty, setDirty] = useState(false);
  const ro = actions.archived;

  useEffect(() => {
    if (!seq) return;
    if (!dirty) setF({ ...seq });
  }, [seq]); // eslint-disable-line react-hooks/exhaustive-deps

  const timing = useMemo(() => {
    if (!seq?.day_id) return null;
    const day = state.agendaDays.find(d => d.id === seq.day_id);
    if (!day) return null;
    const c = computeDay(day, state.blocks);
    const s = c.seqs.find(x => x.id === seq.id);
    return s ? { start: s.start, end: s.start + (parseInt(f?.duration_minutes, 10) || 0), day } : null;
  }, [seq, state.agendaDays, state.blocks, f?.duration_minutes]);

  if (!seq || !f) return null;

  const set = (k, v) => { setF(prev => ({ ...prev, [k]: v })); setDirty(true); };

  function save(close = true) {
    const fields = {};
    for (const k of ['title', 'kind', 'block_type', 'duration_minutes', 'intention', 'format', 'production', 'description', 'material', 'roles', 'attention_flag', 'attention_note', 'facilitator_notes', 'diamond']) {
      if (f[k] !== seq[k]) fields[k] = f[k];
    }
    if (Object.keys(fields).length) actions.updateSequence(seq.id, fields);
    setDirty(false);
    if (close) onClose();
  }

  function close() {
    if (dirty && !ro) save(true);
    else onClose();
  }

  const method = f.method_key ? METHODS_BY_KEY[f.method_key] : null;
  const isPause = f.kind === 'pause';
  const dashWarn = [f.title, f.intention, f.format, f.production].some(t => LONG_DASH.test(t || ''));

  return (
    <Drawer title={isPause ? 'Pause' : 'Séquence'} onClose={close} width={620}
      footer={<>
        {!ro && <button onClick={() => { actions.duplicateSequence(seq.id); onClose(); }} className="btn-ghost text-body-sm flex items-center gap-1 mr-auto"><Copy size={15} /> Dupliquer</button>}
        {!ro && <button onClick={() => { if (confirm('Supprimer cette séquence ?')) { actions.deleteSequence(seq.id); onClose(); } }} className="btn-ghost text-body-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }}><Trash2 size={15} /> Supprimer</button>}
        <button onClick={onClose} className="btn-ghost text-body-sm">{ro ? 'Fermer' : 'Annuler'}</button>
        {!ro && <button onClick={() => save(true)} className="btn-primary text-body-sm">Enregistrer</button>}
      </>}>
      <form className="grid gap-5" onSubmit={e => { e.preventDefault(); save(true); }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(true); }}>
        {timing && (
          <div className="flex items-center justify-between text-body-sm rounded-btn px-3 py-2" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <span><b>{hm(timing.start)} à {hm(timing.end)}</b> · {timing.day.label}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{fmtDur(f.duration_minutes)}</span>
          </div>
        )}

        <div>
          <Label>Titre</Label>
          <input className="input-field w-full font-semibold" value={f.title || ''} disabled={ro} maxLength={200}
            onChange={e => set('title', e.target.value)} placeholder="Ex : Tables tournantes (World Café)" autoFocus />
        </div>

        <div className="flex flex-wrap gap-5">
          <div>
            <Label>Type sur le planning</Label>
            <Segmented value={f.kind} disabled={ro} onChange={v => { set('kind', v); if (v === 'pause') set('block_type', 'pause'); else if (f.block_type === 'pause') set('block_type', 'production'); }}
              options={Object.values(KINDS).map(k => ({ value: k.key, label: k.label, title: k.hint }))} />
          </div>
          <div>
            <Label>Durée</Label>
            <div className="flex items-center gap-1.5">
              <select className="input-field" value={DURATIONS.includes(+f.duration_minutes) ? +f.duration_minutes : 'autre'} disabled={ro}
                onChange={e => { if (e.target.value !== 'autre') set('duration_minutes', +e.target.value); }}>
                {DURATIONS.map(d => <option key={d} value={d}>{fmtDur(d)}</option>)}
                <option value="autre">Autre…</option>
              </select>
              <input type="number" min={5} max={600} step={5} className="input-field w-20" value={f.duration_minutes} disabled={ro}
                onChange={e => set('duration_minutes', Math.max(5, Math.min(600, parseInt(e.target.value, 10) || 5)))} aria-label="Durée en minutes" />
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>min</span>
            </div>
            {f.duration_minutes % 15 !== 0 && <p className="text-caption mt-1" style={{ color: 'var(--color-warning)' }}>Hors de la grille du quart d'heure.</p>}
          </div>
        </div>

        {!isPause && (
          <>
            <div className="rounded-card p-4 grid gap-4" style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2 text-caption font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                <Eye size={14} /> Sur le planning client
              </div>
              <div>
                <Label hint="Le pourquoi de la séquence, relié à l'intention générale.">Intention</Label>
                <textarea rows={2} className="input-field w-full resize-y" value={f.intention || ''} disabled={ro} maxLength={1000}
                  onChange={e => set('intention', e.target.value)} placeholder="Ex : Voir tout ce qui a été dit, pas seulement ses trois tables." />
              </div>
              <div>
                <Label hint="Comment on travaille. Jargon traduit à la première occurrence.">Format</Label>
                <textarea rows={2} className="input-field w-full resize-y" value={f.format || ''} disabled={ro} maxLength={600}
                  onChange={e => set('format', e.target.value)} placeholder="Ex : 3 tours de 20 min. L'hôte reste à sa table, les autres changent." />
                {!ro && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {FORMAT_HINTS.map(h => (
                      <button key={h} type="button" onClick={() => set('format', f.format ? `${f.format} ${h}` : h)}
                        className="text-[11px] px-2 py-0.5 rounded-full hover:opacity-80" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{h}</button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label hint="Laisser vide si rien de tangible ne sort.">Ce qui en sort</Label>
                <input className="input-field w-full" value={f.production || ''} disabled={ro} maxLength={600}
                  onChange={e => set('production', e.target.value)} placeholder="Ex : 3 pratiques collectives." />
              </div>
              {dashWarn && <p className="text-caption" style={{ color: 'var(--color-warning)' }}>Tiret long repéré : remplacez-le par un point ou une virgule.</p>}
            </div>

            <div className="rounded-card p-4 grid gap-4" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
              <div className="flex items-center gap-2 text-caption font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                <EyeOff size={14} /> Coulisses du facilitateur (fiche animateur, jamais sur le planning client)
              </div>
              {method && (
                <p className="text-caption flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <BookOpen size={13} /> Méthode : <b>{method.name}</b>
                </p>
              )}
              <div>
                <Label>Consignes</Label>
                <textarea rows={4} className="input-field w-full resize-y" value={f.description || ''} disabled={ro} maxLength={5000}
                  onChange={e => set('description', e.target.value)} placeholder="Les consignes telles que vous les direz. Les temps, les relances." />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Matériel</Label>
                  <textarea rows={2} className="input-field w-full resize-y" value={f.material || ''} disabled={ro} maxLength={1000}
                    onChange={e => set('material', e.target.value)} placeholder="Nappes, feutres, gommettes…" />
                </div>
                <div>
                  <Label>Rôles</Label>
                  <textarea rows={2} className="input-field w-full resize-y" value={f.roles || ''} disabled={ro} maxLength={1000}
                    onChange={e => set('roles', e.target.value)} placeholder="Hôtes de table, gardien du temps, sponsor…" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-body-sm font-medium">
                  <input type="checkbox" checked={!!f.attention_flag} disabled={ro} onChange={e => set('attention_flag', e.target.checked)} />
                  <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} /> Point d'attention
                </label>
                {f.attention_flag && (
                  <input className="input-field w-full mt-2" value={f.attention_note || ''} disabled={ro} maxLength={1000}
                    onChange={e => set('attention_note', e.target.value)} placeholder="L'éléphant au milieu de la pièce, un sujet sensible, une personne à surveiller…" />
                )}
              </div>
              <div>
                <Label>Notes</Label>
                <textarea rows={2} className="input-field w-full resize-y" value={f.facilitator_notes || ''} disabled={ro} maxLength={5000}
                  onChange={e => set('facilitator_notes', e.target.value)} placeholder="Plan B, question de relance, ce que j'observe…" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label hint="Pour l'équilibre du déroulé.">Nature</Label>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(BLOCK_TYPES).filter(([k]) => k !== 'pause').map(([k, t]) => (
                    <button key={k} type="button" disabled={ro} onClick={() => set('block_type', k)}
                      className="px-2 py-0.5 rounded-full text-caption font-medium"
                      style={{
                        backgroundColor: f.block_type === k ? t.color : 'var(--color-surface-alt)',
                        color: f.block_type === k ? '#fff' : 'var(--color-text-muted)',
                      }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label hint="Où en est le groupe dans le double diamant ?">Double diamant</Label>
                <Segmented value={f.diamond || ''} disabled={ro} onChange={v => set('diamond', v)}
                  options={[{ value: '', label: 'Aucun' }, ...Object.entries(DIAMOND).map(([k, d]) => ({ value: k, label: d.label, title: d.hint }))]} />
              </div>
            </div>
          </>
        )}
      </form>
    </Drawer>
  );
}
