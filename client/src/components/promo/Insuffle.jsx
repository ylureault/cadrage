import { useState } from 'react';
import { ArrowUpRight, GraduationCap, Mail, Phone, Sparkles, X } from 'lucide-react';
import { useStore } from '../../store.jsx';
import Logo from '../brand/Logo.jsx';
import { Drawer } from '../ui/Overlay.jsx';
import { CLIENTS, CONTACT, FORMATIONS, FORMATION_FAITS, OFFRES_INSUFFLE, OUTILS, POSITIONNEMENT, PREMIER_ECHANGE } from '../../planning/insuffle.js';

export function mailtoInsuffle(state, sujet = 'Échange sur un temps collectif') {
  const client = state?.space?.client_name ? ` · ${state.space.client_name}` : '';
  const q = state?.planning?.question ? `\n\nNotre question-titre : « ${state.planning.question} »` : '';
  const link = typeof window !== 'undefined' ? `\n\nLe cadrage : ${window.location.href.split('#')[0]}` : '';
  const body = `Bonjour,\n\nNous préparons un temps collectif avec l'outil de cadrage et aimerions en parler 30 minutes.${q}${link}\n\nÀ bientôt,`;
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(sujet + client)}&body=${encodeURIComponent(body)}`;
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
          <a key={o.key} href={o.url} target="_blank" rel="noopener" className="group rounded-card p-4 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
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
          <a key={f.key} href={f.url} target="_blank" rel="noopener" className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-academie-bg)]"
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
          <a key={o.url} href={o.url} target="_blank" rel="noopener" className="rounded-card p-3 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
            <p className="font-semibold text-body-sm flex items-center gap-1">{o.titre} <ArrowUpRight size={13} className="opacity-40" /></p>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{o.texte}</p>
          </a>
        ))}
      </div>
    </Drawer>
  );
}

// Encart contextuel discret, refermable (mémorisé par cadrage)
export function InsuffleNudge({ id, title, children, cta = 'Parler de votre temps collectif', academie = false, onMore }) {
  const { state } = useStore();
  const key = `insuffle-nudge-${state.spaceId}-${id}`;
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(key) === '1'; } catch { return false; } });
  if (hidden) return null;
  const accent = academie ? 'var(--color-academie)' : 'var(--color-accent-dark)';
  return (
    <aside className="relative rounded-card p-4 overflow-hidden no-print" style={{ backgroundColor: academie ? 'var(--color-academie-bg)' : 'var(--color-accent-soft)', boxShadow: 'inset 0 0 0 1px var(--color-border)' }}>
      <button type="button" className="absolute top-2 right-2 p-1 rounded-md opacity-40 hover:opacity-100" aria-label="Masquer"
        onClick={() => { setHidden(true); try { localStorage.setItem(key, '1'); } catch { /* stockage indisponible */ } }}><X size={14} /></button>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>
        {academie ? <GraduationCap size={13} /> : <Sparkles size={13} />} {academie ? 'Insuffle Académie' : 'Insuffle'}
      </p>
      <p className="font-display font-semibold text-body-sm mb-1 pr-4">{title}</p>
      <div className="text-caption mb-3" style={{ color: 'var(--color-text-muted)' }}>{children}</div>
      <div className="flex flex-wrap items-center gap-2">
        <a href={academie ? FORMATIONS[0].url : mailtoInsuffle(state)} target={academie ? '_blank' : undefined} rel="noopener"
          className="inline-flex items-center gap-1.5 text-caption font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: academie ? 'var(--color-academie)' : '#141E37', color: '#fff' }}>
          {cta} <ArrowUpRight size={13} />
        </a>
        {onMore && <button type="button" onClick={onMore} className="text-caption font-semibold underline-offset-2 hover:underline" style={{ color: accent }}>En savoir plus</button>}
      </div>
    </aside>
  );
}
