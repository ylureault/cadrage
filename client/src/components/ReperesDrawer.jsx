import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useStore } from '../store.jsx';
import { Drawer } from './ui/Overlay.jsx';
import {
  BOUSSOLE_4C, CONVICTIONS, DECISION_MODES, DIAMOND, FACILITATION_TYPES, QUESTIONS_GENERATIVES, SIGNATURE, SITUATIONS, TROIS_P,
} from '../planning/constants.js';

const TABS = [
  { key: 'cadrer', label: 'Cadrer' },
  { key: 'questions', label: 'Questions' },
  { key: 'concevoir', label: 'Concevoir' },
  { key: 'decider', label: 'Décider' },
];

function Block({ title, children }) {
  return (
    <section className="mb-5">
      <h3 className="font-display font-semibold text-body-sm mb-2">{title}</h3>
      {children}
    </section>
  );
}

// Les repères de L'art de la facilitation et de la méthode Insuffle, à portée de main pendant le cadrage.
export default function ReperesDrawer({ onClose }) {
  const { dispatch } = useStore();
  const [tab, setTab] = useState('cadrer');

  async function copy(q) {
    try { await navigator.clipboard.writeText(q); dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Question copiée', type: 'success' } }); }
    catch { /* presse-papier indisponible */ }
  }

  return (
    <Drawer title="Repères Insuffle" onClose={onClose} width={600}>
      <p className="font-display text-body italic mb-4" style={{ color: 'var(--color-academie)' }}>« {SIGNATURE} »</p>
      <div className="flex gap-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className="px-3 py-1.5 rounded-full text-caption font-semibold"
            style={{ backgroundColor: tab === t.key ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: tab === t.key ? 'var(--color-surface)' : 'var(--color-text-muted)' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'cadrer' && (
        <>
          <Block title="Objectif, intention, décision, action">
            <p className="text-body-sm">On remonte de l'objectif affiché à l'intention, puis au vrai besoin du sponsor. « De quoi ai-je besoin du groupe ? » Si le sponsor veut manipuler le groupe à travers vous, c'est de la facipulation : le cadrage vous en protège.</p>
          </Block>
          <Block title="La Boussole 4C autour du cadre">
            <div className="grid sm:grid-cols-2 gap-2">
              {BOUSSOLE_4C.map(c => (
                <div key={c.key} className="rounded-card p-3" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                  <p className="font-bold text-body-sm uppercase tracking-wide">{c.label}</p>
                  <p className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{c.question}</p>
                </div>
              ))}
            </div>
          </Block>
          <Block title="Le cadre et le cadre de facilitation">
            <p className="text-body-sm"><b>Le cadre</b> : la règle du jeu, le cadre de sécurité. <b>Le cadre de facilitation</b> : clarifier l'intention. Ne jamais confondre les deux.</p>
          </Block>
          <Block title="Les 3P">
            <ul className="grid gap-1.5">{TROIS_P.map(p => <li key={p.label} className="text-body-sm"><b>{p.label}.</b> {p.text}</li>)}</ul>
          </Block>
          <Block title="La carte de la complexité du collectif">
            <p className="text-caption mb-2" style={{ color: 'var(--color-text-muted)' }}>La complexité du problème n'est pas la complexité du collectif qui doit le résoudre. Ne jamais s'en servir pour classer : pour ouvrir la conversation.</p>
            <img src="/brand/carte-complexite.svg" alt="La carte de la complexité du collectif : cinq situations, trois facilitations" className="w-full rounded-card mb-2" style={{ backgroundColor: '#fff' }} />
            <div className="grid gap-1">
              {SITUATIONS.map(s => <p key={s.key} className="text-caption"><b>{s.label}</b> · problème {s.probleme}, collectif {s.collectif}. {s.appelle}</p>)}
            </div>
          </Block>
          <Block title="Trois facilitations, emboîtées">
            <ul className="grid gap-1">{FACILITATION_TYPES.map(f => <li key={f.key} className="text-body-sm"><b>{f.label}.</b> {f.text}</li>)}</ul>
            <p className="text-caption mt-1.5" style={{ color: 'var(--color-text-muted)' }}>Un facilitateur de transformation sait faire du contenu. L'inverse est faux.</p>
          </Block>
        </>
      )}

      {tab === 'questions' && (
        <Block title="Questions génératives">
          <p className="text-caption mb-3" style={{ color: 'var(--color-text-muted)' }}>Des questions qui ouvrent au lieu d'agresser. Cliquez pour copier.</p>
          <ul className="grid gap-1.5">
            {QUESTIONS_GENERATIVES.map(q => (
              <li key={q}>
                <button type="button" onClick={() => copy(q)} className="w-full text-left text-body-sm px-3 py-2 rounded-btn flex gap-2 items-start hover:elevation-1 transition-shadow" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                  <span className="flex-1 italic" style={{ color: 'var(--color-academie)' }}>{q}</span><Copy size={13} className="shrink-0 mt-1 opacity-40" />
                </button>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {tab === 'concevoir' && (
        <>
          <Block title="Le double diamant">
            <div className="grid gap-2">
              {Object.entries(DIAMOND).map(([k, d]) => (
                <div key={k} className="flex gap-3 items-start">
                  <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: d.color }} />
                  <p className="text-body-sm"><b>{d.label}.</b> {d.hint}</p>
                </div>
              ))}
            </div>
            <p className="text-caption mt-2" style={{ color: 'var(--color-text-muted)' }}>Le rouleau à gauche : le préparatoire, on part de ce qui est déjà fait. L'entonnoir à droite : le filtre des critères de succès. Et la facilitation ne s'arrête pas au temps collectif : la suite.</p>
          </Block>
          <Block title="Un planning qui part au client">
            <ul className="grid gap-1 text-body-sm list-disc pl-5">
              <li>Toujours une question-titre et une intention générale.</li>
              <li>Chaque séquence a son intention, reliée à l'intention générale.</li>
              <li>Créneaux de 15 min. Pas de trou, pas de chevauchement.</li>
              <li>Le moins d'information possible : ni matériel, ni prix, ni consignes internes.</li>
              <li>Rien d'inventé. Ce qui n'est pas connu s'écrit « à confirmer ».</li>
              <li>Zéro tiret long.</li>
            </ul>
          </Block>
          <Block title="Nos convictions">
            <ul className="grid gap-1 text-body-sm">{CONVICTIONS.map(c => <li key={c}>{c}</li>)}</ul>
          </Block>
          <Block title="B = f (P, E)">
            <p className="text-body-sm">Le comportement dépend de la personne et de son environnement. En situation complexe, on agit sur l'environnement pour agir sur les comportements.</p>
          </Block>
        </>
      )}

      {tab === 'decider' && (
        <>
          <Block title="Décider sans arbitrer">
            <ul className="grid gap-1.5">{DECISION_MODES.map(d => <li key={d.label} className="text-body-sm"><b>{d.label}.</b> {d.text}</li>)}</ul>
            <p className="text-caption mt-2" style={{ color: 'var(--color-text-muted)' }}>Outils : vote par gommettes, gradients d'accord de Kaner, décision par consentement.</p>
          </Block>
          <Block title="Le conflit, catalyseur">
            <p className="text-body-sm">Utiliser le désaccord au lieu de l'éviter : CNV, OSBD, triangle de Karpman, le singe sur l'épaule. Oser la conversation à haut potentiel. Et nommer l'éléphant au milieu de la pièce.</p>
          </Block>
          <Block title="La sécurité psychologique">
            <p className="text-body-sm">Poser un cadre où chacun peut parler sans risque (Edmondson). Sans elle, on fait de l'intelligence collectée, pas de l'intelligence collective.</p>
          </Block>
        </>
      )}
    </Drawer>
  );
}
