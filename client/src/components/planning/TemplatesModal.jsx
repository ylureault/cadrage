import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import socket from '../../socket.js';
import { useStore } from '../../store.jsx';
import { usePlanning } from '../../planning/usePlanning.js';
import { fmtDur } from '../../planning/utils.js';
import { Modal, Segmented } from '../ui/Overlay.jsx';

const LS_KEY = 'insuffle-mes-modeles';
function myTemplateIds() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function rememberTemplate(id) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([id, ...myTemplateIds().filter(x => x !== id)].slice(0, 200))); } catch { /* stockage indisponible */ }
}

export default function TemplatesModal({ onClose }) {
  const { state, dispatch } = useStore();
  const actions = usePlanning();
  const [list, setList] = useState(null);
  const [mode, setMode] = useState(state.blocks.length ? 'append' : 'replace');
  const [name, setName] = useState('');

  useEffect(() => {
    const onList = (d) => setList(d);
    const onSaved = ({ id, name: n }) => {
      rememberTemplate(id);
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: `Modèle « ${n} » enregistré`, type: 'success' } });
      socket.emit('list-templates', { ids: myTemplateIds() });
    };
    socket.on('templates-list', onList);
    socket.on('template-saved', onSaved);
    socket.emit('list-templates', { ids: myTemplateIds() });
    return () => { socket.off('templates-list', onList); socket.off('template-saved', onSaved); };
  }, [dispatch]);

  function apply(t) {
    if (mode === 'replace' && state.blocks.length && !confirm('Remplacer tout le planning actuel par ce modèle ? (Annuler reste possible)')) return;
    actions.applyTemplate(t.id, mode);
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: `Modèle « ${t.name} » ${mode === 'replace' ? 'appliqué' : 'ajouté'}`, type: 'success' } });
    onClose();
  }

  function saveCurrent(e) {
    e.preventDefault();
    if (!name.trim()) return;
    socket.emit('planning:template-save', { name: name.trim(), description: state.planning?.reference || '' });
    setName('');
  }

  const Card = ({ t, personal }) => (
    <div className="rounded-card p-4 flex flex-col gap-1.5" style={{ border: '1px solid var(--color-border)', borderTop: `3px solid ${t.charte === 'academie' ? '#6B1963' : 'var(--color-ink)'}` }}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-body-sm leading-snug">{t.name}</h3>
        {t.charte === 'academie' && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white shrink-0" style={{ backgroundColor: '#6B1963' }}>Académie</span>}
      </div>
      {t.question && <p className="text-caption italic">« {t.question} »</p>}
      {t.description && <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>}
      <p className="text-caption font-semibold" style={{ color: 'var(--color-text-muted)' }}>
        {t.days} jour{t.days > 1 ? 's' : ''} · {t.sequences} séquences · {fmtDur(t.minutes)}
      </p>
      <div className="flex gap-2 mt-auto pt-2">
        <button onClick={() => apply(t)} disabled={actions.archived} className="btn-primary text-caption !py-1.5 !px-3">{mode === 'replace' ? 'Utiliser' : 'Ajouter'}</button>
        {personal && (
          <button onClick={() => { if (confirm(`Supprimer le modèle « ${t.name} » ?`)) socket.emit('planning:template-delete', { templateId: t.id, ids: myTemplateIds() }); }}
            className="btn-ghost text-caption !py-1.5 !px-2" aria-label="Supprimer le modèle"><Trash2 size={14} /></button>
        )}
      </div>
    </div>
  );

  return (
    <Modal title="Modèles de temps collectif" width={960} onClose={onClose}
      subtitle="Des déroulés qui tombent juste au quart d'heure. On part d'un modèle, puis on le fait sien.">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Segmented value={mode} onChange={setMode} options={[
          { value: 'replace', label: 'Remplacer le planning' },
          { value: 'append', label: 'Ajouter les jours à la suite' },
        ]} />
        <form onSubmit={saveCurrent} className="flex gap-2">
          <input className="input-field" placeholder="Nom de mon modèle" value={name} onChange={e => setName(e.target.value)} maxLength={120} />
          <button type="submit" disabled={!name.trim() || actions.archived || state.blocks.length === 0} className="btn-ghost text-body-sm flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }}>
            <Save size={15} /> Enregistrer le planning actuel
          </button>
        </form>
      </div>
      {!list && <p className="text-body-sm py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>}
      {list && (
        <>
          <h3 className="text-label font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Modèles Insuffle</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {list.system.map(t => <Card key={t.id} t={t} />)}
          </div>
          <h3 className="text-label font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Mes modèles</h3>
          {list.personal.length === 0
            ? <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Aucun pour l'instant. Enregistrez le planning actuel pour le réutiliser.</p>
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.personal.map(t => <Card key={t.id} t={t} personal />)}</div>}
        </>
      )}
    </Modal>
  );
}
