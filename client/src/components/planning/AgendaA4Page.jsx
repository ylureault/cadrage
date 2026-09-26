import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Mail, ClipboardCopy, Download, FileCode2, FileJson, FileSpreadsheet, Printer, Upload } from 'lucide-react';
import { useStore } from '../../store.jsx';
import { usePlanning } from '../../planning/usePlanning.js';
import { buildSheetHtml, printSheet, sheetFileName } from '../../planning/sheet.js';
import { toSkillJson, toFullJson, fromAnyJson, toPlainText, toCsv } from '../../planning/exporters.js';
import { analyzePlanning, dayLabel, downloadFile, pageOrientation, sortByPos } from '../../planning/utils.js';
import { PLANNING_COLUMNS } from '../../planning/constants.js';
import { Segmented } from '../ui/Overlay.jsx';
import SequenceEditor from './SequenceEditor.jsx';
import { InsuffleNudge } from '../promo/Insuffle.jsx';
import VersionsPanel from './VersionsPanel.jsx';

// Aperçu fidèle d'une page A4 : l'iframe reçoit exactement le HTML imprimé.
export function SheetFrame({ html, pageWidthPx, onClickSeq, onFit, minHeight = 400 }) {
  const wrap = useRef(null);
  const frame = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1.25, el.clientWidth / (pageWidthPx + 24))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageWidthPx]);

  useEffect(() => {
    function onMsg(e) {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === 'sheet-fit') {
        setHeight(Math.max(minHeight, e.data.height + 8));
        onFit?.(e.data);
      }
      if (e.data?.type === 'sheet-click' && e.data.seq) onClickSeq?.(e.data.seq);
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onClickSeq, onFit, minHeight]);

  return (
    <div ref={wrap} className="w-full overflow-hidden" style={{ height: height * scale }}>
      {/* zoom plutôt que transform : le texte est remis en page à la bonne taille, donc net */}
      <iframe ref={frame} title="Aperçu A4" srcDoc={html} sandbox="allow-scripts allow-modals"
        style={{ width: pageWidthPx + 24, height, border: 0, zoom: scale, display: 'block', background: 'transparent' }} />
    </div>
  );
}

export default function AgendaA4Page() {
  const { state, dispatch } = useStore();
  const actions = usePlanning();
  const [variant, setVariant] = useState('planning');
  const [dayFilter, setDayFilter] = useState('');
  const [editId, setEditId] = useState(null);
  const [fit, setFit] = useState({ fs: 7.6, overflow: [] });
  const fileInput = useRef(null);

  const days = sortByPos(state.agendaDays);
  const meta = state.planning || {};
  const space = state.space || {};
  const blocks = state.blocks;
  const cols = meta.planning_columns?.length ? meta.planning_columns : ['sequence', 'intention', 'format', 'production'];
  const orientation = pageOrientation(dayFilter ? days.filter(d => d.id === dayFilter) : days, blocks, meta.orientation);
  const analysis = useMemo(() => analyzePlanning(meta, days, blocks), [meta, days, blocks]);
  const errors = analysis.issues.filter(i => i.level === 'error');

  const payload = { space, meta, days, blocks, success: state.success, dayIds: dayFilter ? [dayFilter] : null };
  const html = useMemo(() => buildSheetHtml({ ...payload, variant, mode: 'preview' }), // eslint-disable-line react-hooks/exhaustive-deps
    [variant, space, meta, days, blocks, state.success, dayFilter]);
  const pageWidthPx = variant === 'planning' && orientation === 'paysage' ? 1123 : 794;

  useEffect(() => {
    if (variant === 'planning') dispatch({ type: 'SET_SHEET_OVERFLOW', ids: fit.overflow || [] });
  }, [fit, variant, dispatch]);

  function toggleColumn(key) {
    if (key === 'sequence') return;
    const next = cols.includes(key) ? cols.filter(c => c !== key) : [...cols, key];
    const ordered = PLANNING_COLUMNS.map(c => c.key).filter(k => next.includes(k));
    if (ordered.length < 2) return;
    actions.setMeta({ planning_columns: ordered });
  }

  function notify(message, type = 'success') { dispatch({ type: 'ADD_NOTIFICATION', notification: { message, type } }); }

  function doPrint() {
    if (!printSheet({ ...payload, variant })) notify('Autorisez les fenêtres pop-up pour imprimer.', 'error');
  }

  function doHtml() {
    downloadFile(`${sheetFileName(variant, space)}.html`, buildSheetHtml({ ...payload, variant, mode: 'editable' }), 'text/html;charset=utf-8');
    notify('HTML modifiable téléchargé');
  }

  // Le mail au client : l'objet, un mot d'accompagnement, le planning en texte. On joint le PDF à la main.
  function doMail() {
    const client = space.client_name ? ` · ${space.client_name}` : '';
    const body = `Bonjour,\n\nVoici le planning de notre temps collectif. Le PDF est en pièce jointe.\n\n${toPlainText({ space, meta, days, blocks })}\nÀ votre disposition pour en parler.\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Planning${client}${meta.reference ? ` · ${meta.reference}` : ''}`)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
  }

  async function doCopy() {
    try { await navigator.clipboard.writeText(toPlainText({ space, meta, days, blocks })); notify('Planning copié, prêt à coller dans un mail'); }
    catch { notify('Copie impossible dans ce navigateur', 'error'); }
  }

  function doImport(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = fromAnyJson(JSON.parse(reader.result));
        if (state.blocks.length && !confirm('Remplacer le planning actuel par ce fichier ? (Annuler reste possible)')) return;
        actions.replaceAll(data);
        notify('Planning importé');
      } catch (err) { notify(err.message || 'Import impossible', 'error'); }
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-5">
      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">
        <aside className="grid gap-4 lg:sticky lg:top-[72px]">
          <section className="rounded-card p-4 elevation-1 grid gap-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display font-bold text-body">Document</h2>
            <div className="grid gap-1.5">
              {[
                { key: 'planning', label: 'Planning client', hint: 'Une page A4 par jour. Part au client tel quel.' },
                { key: 'animateur', label: 'Fiche animateur', hint: 'Consignes, matériel, rôles, points d\'attention. Interne.' },
                { key: 'succes', label: 'Mesure du succès', hint: 'Critères, avant / après, ROTI, la suite.' },
              ].map(v => (
                <button key={v.key} type="button" onClick={() => setVariant(v.key)}
                  className="text-left rounded-btn px-3 py-2 transition-colors"
                  style={{ border: `1.5px solid ${variant === v.key ? 'var(--color-accent)' : 'var(--color-border)'}`, backgroundColor: variant === v.key ? 'rgba(242,194,69,0.10)' : 'transparent' }}>
                  <span className="block font-semibold text-body-sm">{v.label}</span>
                  <span className="block text-caption" style={{ color: 'var(--color-text-muted)' }}>{v.hint}</span>
                </button>
              ))}
            </div>

            {variant !== 'succes' && days.length > 1 && (
              <label className="grid gap-1 text-caption font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                JOURS
                <select className="input-field" value={dayFilter} onChange={e => setDayFilter(e.target.value)}>
                  <option value="">Tous les jours ({days.length})</option>
                  {days.map((d, i) => <option key={d.id} value={d.id}>{dayLabel(d, i)}</option>)}
                </select>
              </label>
            )}

            {variant === 'planning' && (
              <>
                <div>
                  <p className="text-label font-semibold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Colonnes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PLANNING_COLUMNS.map(c => (
                      <label key={c.key} className="flex items-center gap-1 text-caption px-2 py-1 rounded-btn cursor-pointer" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                        <input type="checkbox" checked={cols.includes(c.key)} disabled={c.key === 'sequence' || actions.archived} onChange={() => toggleColumn(c.key)} /> {c.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-label font-semibold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Orientation</p>
                  <Segmented value={meta.orientation || 'auto'} disabled={actions.archived} onChange={v => actions.setMeta({ orientation: v })}
                    options={[{ value: 'auto', label: 'Auto' }, { value: 'portrait', label: 'Portrait' }, { value: 'paysage', label: 'Paysage' }]} />
                  <p className="text-caption mt-1" style={{ color: 'var(--color-text-muted)' }}>Auto : portrait jusqu'à 8 h, paysage au-delà (matin / après-midi).</p>
                </div>
              </>
            )}
            <div>
              <p className="text-label font-semibold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Charte</p>
              <Segmented value={meta.charte || 'insuffle'} disabled={actions.archived} onChange={v => actions.setMeta({ charte: v })}
                options={[{ value: 'insuffle', label: 'Insuffle' }, { value: 'academie', label: 'Académie' }]} />
            </div>
          </section>

          <section className="rounded-card p-4 elevation-1 grid gap-2" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="font-display font-bold text-body mb-1">Exporter</h2>
            <button type="button" onClick={doPrint} className="btn-primary text-body-sm flex items-center justify-center gap-2"><Printer size={16} /> Imprimer / PDF</button>
            <p className="text-caption -mt-1 mb-1" style={{ color: 'var(--color-text-muted)' }}>Destination « Enregistrer en PDF », marges aucune, arrière-plans cochés.</p>
            <button type="button" onClick={doHtml} className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}><FileCode2 size={16} /> HTML modifiable</button>
            {variant === 'planning' && (
              <>
                <button type="button" onClick={doMail} className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}><Mail size={16} /> Préparer le mail au client</button>
                <button type="button" onClick={doCopy} className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}><ClipboardCopy size={16} /> Copier le texte</button>
                <button type="button" onClick={() => downloadFile(`${sheetFileName('planning', space)}.json`, JSON.stringify(toSkillJson({ space, meta, days, blocks }), null, 2), 'application/json')}
                  className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }} title="Format de la compétence planning-temps-collectif (build.py)"><FileJson size={16} /> JSON planning Insuffle</button>
                <button type="button" onClick={() => downloadFile(`${sheetFileName('planning', space)}.csv`, toCsv({ days, blocks }), 'text/csv;charset=utf-8')}
                  className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}><FileSpreadsheet size={16} /> Tableur (CSV)</button>
                <button type="button" onClick={() => downloadFile(`${sheetFileName('planning', space)}-complet.json`, JSON.stringify(toFullJson({ space, meta, days, blocks }), null, 2), 'application/json')}
                  className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}><Download size={16} /> Sauvegarde complète</button>
                {!actions.archived && (
                  <>
                    <button type="button" onClick={() => fileInput.current?.click()} className="btn-ghost text-body-sm flex items-center gap-2" style={{ border: '1px solid var(--color-border)' }}><Upload size={16} /> Importer un JSON</button>
                    <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={doImport} />
                  </>
                )}
              </>
            )}
          </section>
          <VersionsPanel />
          <InsuffleNudge id="agenda" title="Ce planning, on peut aussi l'animer." onMore={() => dispatch({ type: 'TOGGLE_INSUFFLE' })}>
            Insuffle facilite ce type de temps collectif, de la préparation au suivi.
          </InsuffleNudge>
        </aside>

        <div className="min-w-0 grid grid-cols-[minmax(0,1fr)] gap-3">
          {variant === 'planning' && (errors.length > 0 || fit.overflow?.length > 0) && (
            <div className="rounded-card px-4 py-3 text-body-sm flex gap-2" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--color-text)' }} role="alert">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
              <div>
                {errors.map((e, i) => <p key={i}>{e.msg}</p>)}
                {fit.overflow?.length > 0 && <p>{fit.overflow.length} bloc{fit.overflow.length > 1 ? 's' : ''} débord{fit.overflow.length > 1 ? 'ent' : 'e'} (encadré rouge) : coupez du texte plutôt que réduire la police. Cliquez sur le bloc pour le modifier.{orientation === 'portrait' && ' Sur une journée longue, le paysage (matin / après-midi) donne deux fois plus de place à chaque bloc.'}</p>}
              </div>
            </div>
          )}
          {variant === 'planning' && (
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              A4 {orientation} · texte des blocs {String(fit.fs).replace('.', ',')} pt · cliquez sur un bloc pour le modifier.
            </p>
          )}
          <div className="rounded-card p-3 sm:p-4" style={{ backgroundColor: '#E9E7E1' }}>
            <SheetFrame html={html} pageWidthPx={pageWidthPx} onClickSeq={setEditId} onFit={setFit} />
          </div>
        </div>
      </div>
      {editId && <SequenceEditor seqId={editId} onClose={() => setEditId(null)} />}
    </div>
  );
}
