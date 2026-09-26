import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, GraduationCap, Info, Mail, Phone, Sparkles, X } from 'lucide-react';
import { useStore } from '../../store.jsx';
import Logo from '../brand/Logo.jsx';
import { Drawer } from '../ui/Overlay.jsx';
import { CLIENTS, CONTACT, FORMATIONS, FORMATION_FAITS, OFFRES_INSUFFLE, OUTILS, POSITIONNEMENT, PREMIER_ECHANGE } from '../../planning/insuffle.js';
import { pickPromo, rememberDismiss, rememberView, withUtm } from '../../planning/promo.js';

export function mailtoInsuffle(state, sujet = 'Échange sur un temps collectif') {
  const client = state?.space?.client_name ? ` · ${state.space.client_name}` : '';
  const q = state?.planning?.question ? `\n\nNotre question-titre : « ${state.planning.question} »` : '';
  const link = typeof window !== 'undefined' ? `\n\nLe cadrage : ${window.location.href.split('#')[0]}` : '';
  const body = `Bonjour,\n\nNous préparons un temps collectif avec l'outil de cadrage et aimerions en parler 30 minutes.${q}${link}\n\nÀ bientôt,`;
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(sujet + client)}&body=${encodeURIComponent(body)}`;
}

export function mailtoAcademie(state, sujet = 'Se former à la facilitation') {
  const body = `Bonjour,\n\nJ'ai préparé un temps collectif avec l'outil de cadrage d'Insuffle et j'aimerais en savoir plus sur vos formations.\n\nÀ bientôt,`;
  return `mailto:${CONTACT.emailAcademie}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(body)}`;
}

// Le panneau complet : qui est Insuffle, ce qu'on fait, comment nous joindre
export function InsuffleDrawer({ onClose }) {
  const { state } = useStore();
  return (
    <Drawer title="Travailler avec Insuffle" onClose={onClose} width={620}>
      <div className="hero-glow text-white rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="relative">
          <Logo height={28} color="#F2C245" />
          <p className="font-display font-bold text-[22px] leading-tight mt-5 mb-2">Cet outil est offert. Le terrain, c'est notre métier.</p>
          <p className="text-white/75 text-body-sm mb-5">Insuffle est un cabinet de facilitation stratégique, basé à Deauville, qui intervient partout en France. Insuffle Académie forme les facilitateurs et les managers.</p>
          <div className="flex flex-wrap gap-2">
            <a href={mailtoInsuffle(state)} className="btn-primary"><Mail size={16} /> Écrire à Insuffle</a>
            <a href={CONTACT.telHref} className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] font-semibold text-[14px] border border-white/25 hover:border-[#F2C245] hover:text-[#F2C245]"><Phone size={15} /> {CONTACT.tel}</a>
          </div>
          <p className="text-[12px] text-white/55 mt-3">{PREMIER_ECHANGE}</p>
        </div>
      </div>

      <h3 className="text-label font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>On facilite vos temps collectifs</h3>
      <div className="grid sm:grid-cols-2 gap-3 mb-7">
        {OFFRES_INSUFFLE.map(o => (
          <a key={o.key} href={withUtm(o.url, 'panneau', o.key)} target="_blank" rel="noopener" className="group rounded-card p-4 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-display font-semibold text-body-sm">{o.titre}</p>
              <ArrowUpRight size={15} className="opacity-30 group-hover:opacity-100 shrink-0" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5 mb-2" style={{ color: 'var(--color-accent-dark)' }}>{o.duree}</p>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{o.texte}</p>
          </a>
        ))}
      </div>

      <h3 className="text-label font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-academie)' }}><GraduationCap size={14} /> Insuffle Académie : se former</h3>
      <div className="rounded-card overflow-hidden mb-2" style={{ boxShadow: 'var(--shadow-1)' }}>
        {FORMATIONS.map((f, i) => (
          <a key={f.key} href={withUtm(f.url, 'panneau', f.key)} target="_blank" rel="noopener" className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-academie-bg)]"
            style={{ backgroundColor: 'var(--color-surface)', borderTop: i ? '1px solid var(--color-border)' : 'none' }}>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-body-sm">{f.titre}</span>
              <span className="block text-caption" style={{ color: 'var(--color-text-muted)' }}>{f.public}</span>
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: 'var(--color-academie-bg)', color: 'var(--color-academie)' }}>{f.duree}</span>
            <ArrowUpRight size={15} className="opacity-30 group-hover:opacity-100 shrink-0" />
          </a>
        ))}
      </div>
      <p className="text-caption mb-7" style={{ color: 'var(--color-text-muted)' }}>{FORMATION_FAITS}</p>

      <div className="grid gap-3 mb-7">
        {POSITIONNEMENT.map(p => (
          <p key={p.titre} className="text-body-sm"><b>{p.titre}</b> <span style={{ color: 'var(--color-text-muted)' }}>{p.texte}</span></p>
        ))}
      </div>

      <h3 className="text-label font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Ils nous ont fait confiance</h3>
      <div className="flex flex-wrap gap-2 mb-7">
        {CLIENTS.map(c => <span key={c} className="text-caption font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)' }}>{c}</span>)}
      </div>

      <h3 className="text-label font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Nos autres outils gratuits</h3>
      <div className="grid sm:grid-cols-3 gap-2">
        {OUTILS.map(o => (
          <a key={o.url} href={withUtm(o.url, 'panneau', 'outil')} target="_blank" rel="noopener" className="rounded-card p-3 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
            <p className="font-semibold text-body-sm flex items-center gap-1">{o.titre} <ArrowUpRight size={13} className="opacity-40" /></p>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{o.texte}</p>
          </a>
        ))}
      </div>
    </Drawer>
  );
}

// Les messages visibles en ce moment : un moment clé ne répète pas ce qu'on a sous les yeux
const ON_SCREEN = new Set();

// Encart contextuel : le moteur choisit le message le plus pertinent pour ce cadrage et cet emplacement
export function SmartPromo({ placement, exclude, className = '' }) {
  const { state, dispatch } = useStore();
  const [closed, setClosed] = useState(null);
  const [why, setWhy] = useState(false);
  const promo = useMemo(() => pickPromo(state, placement, { exclude }),
    [placement, state.spaceId, state.isFacilitator, state.planning?.event_type, state.planning?.situation, state.planning?.charte, state.planning?.participants,
      state.agendaDays?.length, state.blocks?.length, state.space?.session_date, state.success?.review, state.success?.votes?.length, state.success?.actions?.length, closed]);
  const seen = useRef(null);
  useEffect(() => { if (promo && seen.current !== promo.id) { seen.current = promo.id; rememberView(promo.id); } }, [promo]);
  useEffect(() => {
    if (!promo) return undefined;
    ON_SCREEN.add(promo.id);
    return () => ON_SCREEN.delete(promo.id);
  }, [promo]);
  if (!promo) return null;
  const academie = promo.brand === 'academie';
  const accent = academie ? 'var(--color-academie)' : 'var(--color-accent-dark)';
  const href = (c) => (c.href || (academie ? mailtoAcademie(state, c.mail) : mailtoInsuffle(state, c.mail)));
  return (
    <aside key={promo.id} className={`relative rounded-card p-4 overflow-hidden no-print animate-fade-in ${className}`} data-promo={promo.id}
      style={{ backgroundColor: academie ? 'var(--color-academie-bg)' : 'var(--color-accent-soft)', boxShadow: 'inset 0 0 0 1px var(--color-border)' }}>
      <button type="button" className="absolute top-2 right-2 p-1 rounded-md opacity-40 hover:opacity-100" aria-label="Masquer ce message"
        onClick={() => { rememberDismiss(promo.id); setClosed(promo.id); }}><X size={14} /></button>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>
        {academie ? <GraduationCap size={13} /> : <Sparkles size={13} />} {academie ? 'Insuffle Académie' : 'Insuffle'}
      </p>
      <p className="font-display font-semibold text-body-sm mb-1 pr-4">{promo.title}</p>
      <p className="text-caption mb-3" style={{ color: 'var(--color-text-muted)' }}>{promo.text}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <a href={href(promo.cta)} target={promo.cta.external ? '_blank' : undefined} rel="noopener"
          className="inline-flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: academie ? 'var(--color-academie)' : '#141E37', color: '#fff' }}>
          {promo.cta.label} <ArrowUpRight size={13} />
        </a>
        {promo.extra && (
          <a href={href(promo.extra)} target={promo.extra.external ? '_blank' : undefined} rel="noopener" className="text-caption font-semibold underline-offset-2 hover:underline" style={{ color: accent }}>{promo.extra.label}</a>
        )}
        {!promo.extra && placement !== 'participant' && (
          <button type="button" onClick={() => dispatch({ type: 'TOGGLE_INSUFFLE' })} className="text-caption font-semibold underline-offset-2 hover:underline" style={{ color: accent }}>En savoir plus</button>
        )}
      </div>
      {promo.why && promo.id !== 'animer' && promo.id !== 'fondamentaux' && (
        <button type="button" onClick={() => setWhy(w => !w)} className="mt-2.5 flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }} aria-expanded={why}>
          <Info size={11} /> {why ? promo.why : 'Pourquoi ce message ?'}
        </button>
      )}
    </aside>
  );
}

// Un moment clé (export, impression, envoi, fin de vote) : une seule suggestion, au bon moment, jamais deux fois de suite
const MOMENT_GAP = 3 * 86400000;
export function PromoMoment() {
  const { state } = useStore();
  const [promo, setPromo] = useState(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const onMoment = (e) => {
      const key = 'insuffle-promo-moment';
      let last = 0;
      try { last = Number(localStorage.getItem(key)) || 0; } catch { /* stockage indisponible */ }
      if (Date.now() - last < MOMENT_GAP) return;
      const p = pickPromo(stateRef.current, 'moment', { exclude: [...ON_SCREEN] });
      if (!p) return;
      try { localStorage.setItem(key, String(Date.now())); } catch { /* stockage indisponible */ }
      rememberView(p.id);
      setTimeout(() => setPromo({ ...p, moment: e.detail || '' }), 1200);
    };
    window.addEventListener('insuffle:moment', onMoment);
    return () => window.removeEventListener('insuffle:moment', onMoment);
  }, []);
  useEffect(() => { if (!promo) return undefined; const t = setTimeout(() => setPromo(null), 20000); return () => clearTimeout(t); }, [promo]);
  if (!promo) return null;
  const academie = promo.brand === 'academie';
  const intro = { export: 'Votre document est prêt.', print: 'Votre document part à l\'impression.', mail: 'Votre planning est en route.', vote: 'Les votes sont clos.' }[promo.moment] || 'Bon travail.';
  const href = promo.cta.href || (academie ? mailtoAcademie(state, promo.cta.mail) : mailtoInsuffle(state, promo.cta.mail));
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] rounded-card p-4 elevation-3 animate-slide-up no-print" role="status" data-promo-moment={promo.id}
      style={{ backgroundColor: '#141E37', color: '#fff' }}>
      <button type="button" className="absolute top-2 right-2 p-1 rounded-md opacity-50 hover:opacity-100" aria-label="Fermer"
        onClick={() => { rememberDismiss(promo.id); setPromo(null); }}><X size={14} /></button>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: academie ? '#E7B8E0' : '#F2C245' }}>
        {academie ? <GraduationCap size={13} /> : <Sparkles size={13} />} {intro}
      </p>
      <p className="font-display font-semibold text-body-sm mb-1 pr-4">{promo.title}</p>
      <p className="text-caption mb-3 text-white/70">{promo.text}</p>
      <a href={href} target={promo.cta.external ? '_blank' : undefined} rel="noopener" onClick={() => setPromo(null)}
        className="inline-flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F2C245', color: '#141E37' }}>
        {promo.cta.label} <ArrowUpRight size={13} />
      </a>
    </div>
  );
}

export function promoMoment(kind) {
  try { window.dispatchEvent(new CustomEvent('insuffle:moment', { detail: kind })); } catch { /* navigateur ancien */ }
}
