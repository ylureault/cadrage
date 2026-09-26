import { useState } from 'react';
import { ChevronDown, ChevronRight, Compass, Info } from 'lucide-react';
import { useStore } from '../../store.jsx';
import { usePlanning } from '../../planning/usePlanning.js';
import { EVENT_TYPES, SITUATIONS, CHARTES } from '../../planning/constants.js';
import { AutoField, Label, Segmented } from '../ui/Overlay.jsx';
import { LONG_DASH } from '../../planning/utils.js';

// La fiche du temps collectif : ce qui fait le haut de chaque page du planning.
export default function FicheCard({ compact = false }) {
  const { state, dispatch } = useStore();
  const p = state.planning || {};
  const space = state.space || {};
  const actions = usePlanning();
  const [open, setOpen] = useState(!compact || !p.question);
  const ro = actions.archived;
  const roHeader = ro || ((state.facilitators || []).length > 0 && !state.isFacilitator);

  const save = (field) => (value) => actions.setMeta({ [field]: value });
  const saveHeader = (field) => (value) => {
    dispatch({ type: 'UPDATE_HEADER', field, value });
    actions.setMeta({ [field]: value }, { history: false });
  };
  const situation = SITUATIONS.find(s => s.key === p.situation);

  return (
    <section className="rounded-card elevation-1 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }} aria-label="Fiche du temps collectif">
      <div className="px-5 pt-5 pb-4" style={{ borderTop: `4px solid ${CHARTES[p.charte]?.main || '#141E37'}` }}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-label font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Question-titre</span>
          <Segmented
            value={p.charte || 'insuffle'}
            onChange={(v) => actions.setMeta({ charte: v })}
            disabled={ro}
            options={[{ value: 'insuffle', label: 'Insuffle', title: 'Charte navy et jaune, pour un séminaire ou un atelier' }, { value: 'academie', label: 'Académie', title: 'Charte violette Insuffle Académie, pour une formation' }]}
          />
        </div>
        <AutoField value={p.question} onSave={save('question')} disabled={ro} maxLength={400} multiline rows={1} autoGrow
          placeholder="La question qui embarque le groupe dans une réponse commune ?"
          className="!text-[20px] sm:!text-[24px] font-display font-bold !py-2 !border-transparent hover:!border-[var(--color-border)] focus:!border-[var(--color-accent)]"
          style={{ color: state.darkMode ? 'var(--color-text)' : (CHARTES[p.charte]?.main || 'var(--color-text)') }} />
        <div className="w-16 h-1.5 rounded-full mt-1.5 mb-4" style={{ backgroundColor: CHARTES[p.charte]?.accent || '#F2C245' }} />
        <div className="flex gap-3 items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mt-2 shrink-0"
            style={state.darkMode ? { backgroundColor: CHARTES[p.charte]?.accent, color: '#141E37' } : { backgroundColor: CHARTES[p.charte]?.main || '#141E37', color: '#fff' }}>Intention</span>
          <AutoField value={p.intention} onSave={save('intention')} disabled={ro} multiline rows={1} autoGrow maxLength={1000}
            placeholder="Ce qu'on aimerait avoir obtenu à la fin. « Que chacun reparte en… »" />
        </div>
        {(LONG_DASH.test(p.question || '') || LONG_DASH.test(p.intention || '')) && (
          <p className="text-caption mt-2" style={{ color: 'var(--color-warning)' }}>Tiret long repéré : sur une page client, on le remplace par un point ou une virgule.</p>
        )}
      </div>

      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-5 py-2.5 text-body-sm font-medium border-t hover:bg-black/[0.02]"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }} aria-expanded={open}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Le cadre : client, date, lieu, participants, type, situation
        {!open && (
          <span className="ml-auto truncate text-caption hidden sm:inline">
            {[space.client_name, p.participants && `${p.participants} participants`, p.lieu, EVENT_TYPES.find(e => e.key === p.event_type)?.label].filter(Boolean).join(' · ')}
          </span>
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 grid gap-4 animate-fade-in">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><Label>Client</Label><AutoField value={space.client_name} onSave={saveHeader('client_name')} disabled={roHeader} placeholder="Nom du client" /></div>
            <div><Label>Sponsor</Label><AutoField value={space.sponsor} onSave={saveHeader('sponsor')} disabled={roHeader} placeholder="Le commanditaire" /></div>
            <div><Label>Animé par</Label><AutoField value={space.facilitator} onSave={saveHeader('facilitator')} disabled={roHeader} placeholder="Yoan Lureault, Insuffle" /></div>
            <div><Label>Date</Label><AutoField inputType="date" value={space.session_date} onSave={saveHeader('session_date')} disabled={roHeader} /></div>
            <div><Label>Lieu</Label><AutoField value={p.lieu} onSave={save('lieu')} disabled={ro} placeholder="Lieu à confirmer" /></div>
            <div><Label>Participants</Label><AutoField value={p.participants} onSave={save('participants')} disabled={ro} placeholder="30" /></div>
            <div><Label>Accueil</Label><AutoField value={p.accueil} onSave={save('accueil')} disabled={ro} placeholder="café d'accueil dès 8h45" /></div>
            <div>
              <Label>Type de temps collectif</Label>
              <select className="input-field w-full" value={p.event_type || ''} disabled={ro}
                onChange={e => actions.setMeta({ event_type: e.target.value })}>
                <option value="">Choisir…</option>
                {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label hint="Sous le logo, à droite. Ex : Séminaire du siège · demi-journée">Référence</Label><AutoField value={p.reference} onSave={save('reference')} disabled={ro} placeholder="Séminaire · 2 jours" /></div>
            <div><Label hint="Une ligne libre en pied de page">Pied de page</Label><AutoField value={p.footer_note} onSave={save('footer_note')} disabled={ro} placeholder="Toutes les fonctions, en tables mélangées." /></div>
          </div>

          <div className="rounded-card p-4" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Compass size={16} style={{ color: 'var(--color-academie)' }} />
              <span className="font-display font-semibold text-body-sm">Où se situe ce collectif ?</span>
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>La carte de la complexité du collectif</span>
            </div>
            <p className="text-caption mb-3 flex gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
              <Info size={13} className="shrink-0 mt-0.5" />
              La complexité du problème n'est pas la complexité du collectif qui doit le résoudre. La carte ne sert pas à classer : elle ouvre la conversation.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SITUATIONS.map(s => {
                const active = p.situation === s.key;
                return (
                  <button key={s.key} type="button" disabled={ro}
                    onClick={() => actions.setMeta({ situation: active ? '' : s.key })}
                    className="px-3 py-1.5 rounded-full text-caption font-semibold transition-all"
                    style={{
                      backgroundColor: active ? 'var(--color-academie)' : 'var(--color-surface)',
                      color: active ? '#fff' : 'var(--color-text)',
                      border: `1px solid ${active ? 'var(--color-academie)' : 'var(--color-border)'}`,
                    }}
                    title={`Problème ${s.probleme}, collectif ${s.collectif}`}>
                    {s.label}
                  </button>
                );
              })}
            </div>
            {situation && (
              <p className="text-body-sm mt-3 animate-fade-in">
                <b>{situation.label}</b> : problème {situation.probleme}, collectif {situation.collectif}. <span style={{ color: 'var(--color-text-muted)' }}>{situation.appelle}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
