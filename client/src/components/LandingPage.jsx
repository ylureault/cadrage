import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openConsent, trackEvent } from '../analytics.js';
import { api } from '../api.js';
import {
  ArrowRight, ArrowUpRight, CalendarRange, Check, ChevronDown, Compass, FileDown, GraduationCap, Loader2, Mail, MousePointer2,
  Phone, Radio, Sparkles, Target, Users, Vote,
} from 'lucide-react';
import Logo from './brand/Logo.jsx';
import { SIGNATURE } from '../planning/constants.js';
import { fmtDur } from '../planning/utils.js';
import { CLIENTS, CONTACT, FORMATIONS, FORMATION_FAITS, OFFRES_INSUFFLE, OUTILS, POSITIONNEMENT, PREMIER_ECHANGE } from '../planning/insuffle.js';

const PATH = [
  { icon: Compass, step: 'Cadrer', title: 'Avec le sponsor, avant tout', text: 'Quatre temps, des questions génératives, les 8 polarités pour régler la posture. On voit les écarts avant d\'entrer dans la salle.' },
  { icon: Users, step: 'Concevoir', title: 'Le déroulé au quart d\'heure', text: 'Une question-titre, une intention, des séquences qui tombent juste. 43 méthodes, le double diamant, des contrôles qui repèrent le trou et le débordement.' },
  { icon: CalendarRange, step: 'Envoyer', title: 'Une page A4 par jour', text: 'Le planning client lisible en une minute, la fiche animateur pour soi. En PDF, en HTML modifiable, en JSON.' },
  { icon: Target, step: 'Mesurer', title: 'Le succès, pas l\'ambiance', text: 'Des critères observables posés avant. Avant 1, après 10, voté en direct. Le ROTI à part. La suite à 72 h, J+15, J+90.' },
];

const LIVE = [
  { icon: MousePointer2, title: 'Les curseurs de chacun', text: 'Vous voyez où les autres regardent, comme sur un tableau blanc.' },
  { icon: Radio, title: 'Qui écrit quoi', text: '« Claire écrit » s\'affiche sur la séquence qu\'elle modifie. Pas de doublon, pas d\'écrasement.' },
  { icon: Sparkles, title: 'Ce qui vient de bouger', text: 'Chaque modification s\'illumine de la couleur de son auteur.' },
  { icon: Vote, title: 'Toute la salle vote', text: 'QR code projeté, 80 personnes, l\'échelle Avant / Après se remplit en direct.' },
];

const FAQ = [
  { q: 'C\'est vraiment gratuit ?', a: 'Oui. C\'est l\'outil qu\'Insuffle utilise pour cadrer ses propres temps collectifs, et nous l\'offrons. Si un jour vous voulez qu\'on facilite avec vous, vous savez où nous trouver.' },
  { q: 'Faut-il créer un compte ?', a: 'Non. Un lien, un prénom, et on travaille. Chaque cadrage a son adresse unique : la partager, c\'est donner accès.' },
  { q: 'Qu\'est-ce qui part chez le client ?', a: 'Le planning A4 : une page par jour, question-titre, intention, séquences, ce qui en sort. Ni matériel, ni consignes internes. La fiche animateur reste pour vous.' },
  { q: 'Quels exports ?', a: 'PDF, HTML modifiable en cliquant sur les textes, JSON au format planning Insuffle, tableur CSV, texte à coller dans un mail.' },
  { q: 'Pour une formation ?', a: 'Passez la charte en Académie : le planning prend les couleurs d\'Insuffle Académie. Un modèle de journée de formation est prêt, avec l\'évaluation des acquis et la satisfaction.' },
];

const DEMO_ROWS = [
  { t: '9h00', title: 'Ouverture', intention: 'Dire pourquoi on est là.', kind: 'c' },
  { t: '9h15', title: 'Partir du futur', intention: 'Partir de l\'entreprise dans un an.', kind: 'a' },
  { t: '9h30', title: 'Tables tournantes (World Café)', intention: 'Raconter au passé l\'entreprise dans un an.', kind: 'c', flash: true, dur: '1h' },
  { t: '10h30', title: 'Pause', kind: 'p' },
  { t: '10h45', title: 'La balade des nappes', intention: 'Voir tout ce qui a été dit.', kind: 'c', typing: true },
  { t: '11h00', title: 'Mon engagement', intention: 'Ce que je fais, moi, dès lundi.', kind: 'c' },
];

// La démonstration du hero : un planning vivant, deux curseurs, un vote qui monte
function HeroDemo() {
  return (
    <div className="relative float-y" aria-hidden>
      <div className="rounded-[22px] overflow-hidden text-left" style={{ backgroundColor: '#F6F5F1', boxShadow: '0 40px 100px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)' }}>
        <div className="flex items-center gap-2 px-4 h-11" style={{ backgroundColor: '#141E37' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" /><span className="w-2.5 h-2.5 rounded-full bg-white/20" /><span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="ml-3 text-[12px] font-semibold text-white/80">Séminaire du siège · demi-journée</span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,.15)', color: '#6EE7B7' }}><span className="live-dot" /> Live</span>
          <span className="flex -space-x-1.5">
            {[['C', '#3498db'], ['T', '#2ecc71'], ['Y', '#e74c3c']].map(([l, c]) => <span key={l} className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: c, boxShadow: '0 0 0 2px #141E37' }}>{l}</span>)}
          </span>
        </div>
        <div className="relative p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6B6E7B' }}>Question-titre</p>
          <p className="font-display font-bold text-[18px] sm:text-[20px] leading-tight mb-2" style={{ color: '#141E37' }}>Comment grandir ensemble quand tout s'accélère ?</p>
          <div className="w-10 h-1 rounded-full mb-4" style={{ backgroundColor: '#F2C245' }} />
          <div className="grid gap-1.5">
            {DEMO_ROWS.map(r => (
              <div key={r.t} className={`relative flex items-center gap-3 rounded-[10px] px-3 py-2 ${r.flash ? 'demo-flash' : ''}`}
                style={{ backgroundColor: r.kind === 'a' ? '#FDF6E3' : r.kind === 'p' ? 'transparent' : '#fff', boxShadow: r.kind === 'p' ? 'inset 0 0 0 1px #E7E4DC' : '0 1px 2px rgba(20,30,55,.06), 0 0 0 1px rgba(20,30,55,.045)' }}>
                {r.kind !== 'p' && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ backgroundColor: r.kind === 'a' ? '#F2C245' : '#141E37' }} />}
                <span className="text-[12px] font-semibold w-10 tabular-nums" style={{ color: '#141E37' }}>{r.t}</span>
                {r.kind === 'p'
                  ? <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6B6E7B' }}>{r.title}</span>
                  : (
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold truncate" style={{ color: '#141E37' }}>{r.title}</span>
                        {r.kind === 'a' && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F2C245', color: '#141E37' }}>Apport</span>}
                        {r.typing && <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#3498db1f', color: '#3498db' }}>Claire écrit <span className="typing-dots"><span /><span /><span /></span></span>}
                      </span>
                      <span className="block text-[11px] truncate" style={{ color: '#6B6E7B' }}>{r.intention}</span>
                    </span>
                  )}
                {r.dur && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#F6F5F1', color: '#141E37' }}>{r.dur}</span>}
              </div>
            ))}
          </div>
          <div className="demo-cursor a"><svg width="16" height="18" viewBox="0 0 18 20"><path d="M1 1l6.5 17 2.6-7.1L17 8.3 1 1z" fill="#2ecc71" stroke="#fff" strokeWidth="1.5" /></svg><span className="absolute left-3.5 top-4 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#2ecc71' }}>Thomas</span></div>
          <div className="demo-cursor b"><svg width="16" height="18" viewBox="0 0 18 20"><path d="M1 1l6.5 17 2.6-7.1L17 8.3 1 1z" fill="#3498db" stroke="#fff" strokeWidth="1.5" /></svg><span className="absolute left-3.5 top-4 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#3498db' }}>Claire</span></div>
        </div>
      </div>
      <div className="hidden sm:block absolute -left-8 -bottom-8 w-60 rounded-2xl p-4" style={{ backgroundColor: '#fff', boxShadow: '0 24px 60px -20px rgba(0,0,0,.5)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A67C00' }}>Avant 1 · après 10</p>
        <div className="flex items-baseline gap-2 mb-2"><span className="font-display font-bold text-[26px]" style={{ color: '#141E37' }}>3,5 → 7,3</span><span className="text-[12px] font-semibold" style={{ color: '#0E9F6E' }}>+3,8</span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F6EEF5' }}><div className="h-full rounded-full demo-bar" style={{ backgroundColor: '#8E2183' }} /></div>
        <p className="text-[11px] mt-2" style={{ color: '#6B6E7B' }}>Voté en direct par la salle</p>
      </div>
    </div>
  );
}

function rememberSpace(id, client = '') {
  try {
    const recent = JSON.parse(localStorage.getItem('recentSpaces') || '[]').filter(r => r.id !== id);
    recent.unshift({ id, date: new Date().toISOString(), client });
    localStorage.setItem('recentSpaces', JSON.stringify(recent.slice(0, 20)));
  } catch (_) { /* stockage indisponible */ }
}

function Eyebrow({ children, color = 'var(--color-accent-dark)' }) {
  return <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color }}>{children}</p>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [templates, setTemplates] = useState([]);

  useEffect(() => { api.listTemplates().then(d => setTemplates(d.system || [])).catch(() => {}); }, []);

  async function create(templateId = null) {
    setCreating(templateId || 'blank');
    try {
      const { id } = await api.createSpace(templateId ? { templateId } : {});
      rememberSpace(id);
      trackEvent('create_space', { template: templateId || 'blank' });
      navigate(templateId ? `/${id}#conception` : `/${id}`);
    } catch (e) {
      alert(`Création impossible : ${e.message}`);
    } finally {
      setCreating(null);
    }
  }

  // La démo : une copie à soi, modifiable, avec des données qui montrent tout
  async function openDemo() {
    setCreating('demo');
    try {
      const { id } = await api.createDemo();
      trackEvent('open_demo');
      rememberSpace(id, 'NovaPulse (démo)');
      navigate(`/${id}#conception`);
    } catch {
      navigate('/6AG_demo');
    } finally {
      setCreating(null);
    }
  }

  let recentSpaces = [];
  try { recentSpaces = JSON.parse(localStorage.getItem('recentSpaces') || '[]'); } catch (_) { /* stockage indisponible */ }
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Échange sur un temps collectif')}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
      <header className="fixed top-0 inset-x-0 z-50 text-white" style={{ background: 'rgba(20,30,55,0.82)', backdropFilter: 'saturate(180%) blur(14px)', boxShadow: '0 1px 0 rgba(255,255,255,.06)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3" aria-label="Accueil">
            <Logo height={24} color="#F2C245" />
            <span className="text-[13px] font-semibold pl-3 border-l border-white/20 hidden sm:inline text-white/80">Cadrage</span>
          </a>
          <nav className="flex items-center gap-1 md:gap-2 text-[14px]" aria-label="Navigation principale">
            {[['#methode', 'La méthode'], ['#direct', 'Le direct'], ['#modeles', 'Les modèles'], ['#insuffle', 'Insuffle']].map(([h, l]) => (
              <a key={h} href={h} className="hidden lg:inline px-3 py-2 rounded-lg text-white/75 hover:text-white hover:bg-white/5">{l}</a>
            ))}
            <button onClick={openDemo} disabled={!!creating} className="px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 font-medium">Démo</button>
            <button onClick={() => create()} disabled={!!creating} className="btn-primary !h-9">Créer un cadrage</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow text-white relative overflow-hidden pt-16">
        <div className="absolute inset-0 grid-bg pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at 30% 30%, black 20%, transparent 75%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <a href="#insuffle" className="inline-flex items-center gap-2 text-[12px] font-semibold pl-1 pr-3 py-1 rounded-full mb-7 hover:bg-white/10" style={{ backgroundColor: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: '#F2C245', color: '#141E37' }}>Offert</span>
              <span className="text-white/80">par Insuffle et Insuffle Académie</span> <ArrowRight size={13} className="text-white/60" />
            </a>
            <h1 className="font-display font-bold leading-[1.02] text-[42px] sm:text-[58px] lg:text-[70px] tracking-[-0.03em] mb-7">
              80 % d'un temps collectif <span style={{ color: '#F2C245' }}>se joue avant.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/75 max-w-xl leading-relaxed mb-10">
              Un séminaire raté, c'est rarement un problème d'animation. C'est un problème de cadrage.
              Cadrez avec le sponsor, concevez au quart d'heure, envoyez un planning A4 propre, mesurez le succès. En direct, à plusieurs.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => create()} disabled={!!creating} className="btn-primary !h-12 !px-6 !text-[15px]">
                {creating === 'blank' ? <Loader2 size={18} className="animate-spin" /> : null} Créer un cadrage <ArrowRight size={18} />
              </button>
              <button onClick={openDemo} disabled={!!creating} className="h-12 px-6 rounded-[10px] font-semibold text-[15px] text-white hover:bg-white/10 inline-flex items-center gap-2" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.2)' }}>{creating === 'demo' ? <Loader2 size={17} className="animate-spin" /> : null} Essayer un cadrage complet</button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/60">
              {['Sans compte', 'Jusqu\'à 80 personnes en direct', 'PDF aux couleurs Insuffle'].map(t => <span key={t} className="flex items-center gap-1.5"><Check size={14} style={{ color: '#F2C245' }} />{t}</span>)}
            </div>
          </div>
          <HeroDemo />
        </div>
      </section>

      {/* Clients */}
      <section className="py-10 border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] shrink-0" style={{ color: 'var(--color-text-muted)' }}>Ils ont travaillé avec Insuffle</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {CLIENTS.map(c => <span key={c} className="font-display font-bold text-[17px] tracking-tight opacity-45">{c}</span>)}
          </div>
        </div>
      </section>

      {recentSpaces.length > 0 && (
        <section className="pt-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--color-text-muted)' }}>Reprendre</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentSpaces.slice(0, 6).map(s => (
                <button key={s.id} onClick={() => navigate(`/${s.id}`)} className="surface text-left p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0" style={{ backgroundColor: '#141E37', color: '#F2C245' }}>{(s.client || 'C')[0].toUpperCase()}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-body-sm truncate">{s.client || 'Cadrage sans nom'}</span>
                    <span className="block text-caption" style={{ color: 'var(--color-text-muted)' }}>{(() => { try { return new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; } })()}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* La méthode */}
      <section id="methode" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <Eyebrow>La méthode Insuffle, dans un outil</Eyebrow>
          <h2 className="font-display font-bold text-[34px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-4 max-w-3xl">Cadrer, concevoir, envoyer, mesurer.</h2>
          <p className="text-lg mb-14 max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>Un seul espace, du premier appel avec le sponsor au rendez-vous à J+90.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {PATH.map((p, i) => (
              <div key={p.step} className="surface p-7 relative overflow-hidden group">
                <span className="absolute -right-4 -top-8 font-display font-bold text-[140px] leading-none select-none" style={{ color: 'var(--color-surface-alt)' }}>{i + 1}</span>
                <div className="relative">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#141E37' }}><p.icon size={20} color="#F2C245" /></span>
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--color-accent-dark)' }}>{p.step}</p>
                  <h3 className="font-display font-semibold text-[22px] mb-2">{p.title}</h3>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-14 text-center font-display text-[22px] md:text-[28px] leading-snug max-w-3xl mx-auto" style={{ color: 'var(--color-academie)' }}>« {SIGNATURE} »</p>
        </div>
      </section>

      {/* Le direct */}
      <section id="direct" className="py-20 md:py-28 text-white relative overflow-hidden" style={{ backgroundColor: '#0F172B' }}>
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-70" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8">
          <Eyebrow color="#6EE7B7"><span className="inline-flex items-center gap-2"><span className="live-dot" /> Le direct</span></Eyebrow>
          <h2 className="font-display font-bold text-[34px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-4 max-w-3xl">Le sponsor, le co-facilitateur et vous. Sur la même page, en même temps.</h2>
          <p className="text-lg mb-14 max-w-2xl text-white/65">Un lien suffit. Chacun voit ce que font les autres, sans rafraîchir, sans version qui se perd par mail.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LIVE.map(l => (
              <div key={l.title} className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,.04)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)' }}>
                <l.icon size={22} style={{ color: '#F2C245' }} />
                <h3 className="font-semibold text-[16px] mt-4 mb-1.5">{l.title}</h3>
                <p className="text-[14px] text-white/60 leading-relaxed">{l.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modèles */}
      <section id="modeles" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <Eyebrow>Démarrer en une minute</Eyebrow>
          <h2 className="font-display font-bold text-[34px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-4">Partir d'un modèle.</h2>
          <p className="text-lg mb-12 max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>Des déroulés qui tombent juste au quart d'heure. Vous partez d'une base, vous la faites vôtre avec les mots du client.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <button key={t.id} onClick={() => create(t.id)} disabled={!!creating} className="surface p-6 flex flex-col text-left group hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ backgroundColor: t.charte === 'academie' ? 'var(--color-academie-bg)' : 'var(--color-accent-soft)', color: t.charte === 'academie' ? 'var(--color-academie)' : 'var(--color-accent-dark)' }}>
                    {t.charte === 'academie' ? 'Académie' : `${t.days} jour${t.days > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{fmtDur(t.minutes)} · {t.sequences} séquences</span>
                </div>
                <h3 className="font-display font-semibold text-[18px] leading-snug mb-2">{t.name}</h3>
                {t.question && <p className="text-[14px] italic mb-2">« {t.question} »</p>}
                <p className="text-[14px] mb-5" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold group-hover:gap-2.5 transition-all" style={{ color: 'var(--color-text)' }}>
                  {creating === t.id ? <Loader2 size={15} className="animate-spin" /> : null} Créer avec ce modèle <ArrowRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Insuffle */}
      <section id="insuffle" className="hero-glow text-white relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-14">
            <div>
              <Logo height={36} color="#F2C245" />
              <h2 className="font-display font-bold text-[34px] md:text-[46px] leading-[1.05] tracking-[-0.02em] mt-8 mb-5">L'outil est offert. Le terrain, c'est notre métier.</h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">Insuffle est un cabinet de facilitation stratégique basé à Deauville, qui intervient partout en France. Insuffle Académie forme les facilitateurs et les managers. On ne livre pas de slides : on produit du mouvement.</p>
              <div className="grid gap-4 mb-10">
                {POSITIONNEMENT.map(p => (
                  <div key={p.titre} className="flex gap-3"><Check size={18} className="shrink-0 mt-0.5" style={{ color: '#F2C245' }} /><p className="text-[15px]"><b>{p.titre}</b> <span className="text-white/65">{p.texte}</span></p></div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={mail} className="btn-primary !h-12 !px-6 !text-[15px]"><Mail size={17} /> Parler de votre temps collectif</a>
                <a href={CONTACT.telHref} className="h-12 px-5 rounded-[10px] font-semibold text-[15px] inline-flex items-center gap-2 hover:bg-white/10" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.2)' }}><Phone size={16} /> {CONTACT.tel}</a>
              </div>
              <p className="text-[13px] text-white/50 mt-3">{PREMIER_ECHANGE}</p>
            </div>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {OFFRES_INSUFFLE.map(o => (
                  <a key={o.key} href={o.url} target="_blank" rel="noopener" className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
                    <div className="flex items-start justify-between gap-2"><p className="font-display font-semibold text-[16px]">{o.titre}</p><ArrowUpRight size={16} className="opacity-40 group-hover:opacity-100" /></div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mt-1 mb-2" style={{ color: '#F2C245' }}>{o.duree}</p>
                    <p className="text-[13px] text-white/60 leading-relaxed">{o.texte}</p>
                  </a>
                ))}
              </div>
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(142,33,131,.16)', boxShadow: 'inset 0 0 0 1px rgba(193,133,187,.25)' }}>
                <p className="flex items-center gap-2 font-display font-semibold text-[16px] mb-1"><GraduationCap size={18} style={{ color: '#E7B6E1' }} /> Insuffle Académie</p>
                <p className="text-[13px] text-white/60 mb-4">{FORMATION_FAITS}</p>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                  {FORMATIONS.map(f => (
                    <a key={f.key} href={f.url} target="_blank" rel="noopener" className="flex items-center justify-between gap-2 text-[14px] py-1.5 border-b border-white/10 hover:text-[#F2C245]">
                      <span className="truncate">{f.titre}</span><span className="text-[12px] text-white/50 shrink-0">{f.duree}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-display font-bold text-[34px] md:text-[44px] leading-[1.05] tracking-[-0.02em] mb-10">Ce qu'on nous demande.</h2>
          <div className="grid gap-2">
            {FAQ.map((f, i) => (
              <div key={f.q} className="rounded-2xl transition-colors" style={{ backgroundColor: openFaq === i ? 'var(--color-surface-alt)' : 'transparent' }}>
                <button className="w-full flex items-center justify-between gap-4 text-left font-semibold text-[16px] px-5 py-4" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {f.q}
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="text-[15px] px-5 pb-5 leading-relaxed animate-fade-in" style={{ color: 'var(--color-text-muted)' }}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel final */}
      <section className="py-20 md:py-24 text-center" style={{ background: 'linear-gradient(180deg, #F6CD5C, #F2C245)', color: '#141E37' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display font-bold text-[36px] md:text-[54px] leading-[1.02] tracking-[-0.02em] mb-5">Le flou tue plus que le conflit.</h2>
          <p className="text-lg mb-9 opacity-80">Commencez par la question-titre. Le reste suit.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => create()} disabled={!!creating} className="h-12 px-7 rounded-[10px] font-semibold text-[15px] inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5" style={{ backgroundColor: '#141E37', color: '#F2C245' }}>Créer un cadrage <ArrowRight size={17} /></button>
            <a href="#modeles" className="h-12 px-7 rounded-[10px] font-semibold text-[15px] inline-flex items-center gap-2" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(20,30,55,.35)' }}><FileDown size={17} /> Partir d'un modèle</a>
          </div>
        </div>
      </section>

      <footer className="py-14 text-white/65" style={{ backgroundColor: '#141E37' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <Logo height={30} color="#F2C245" />
            <p className="text-[14px] mt-4 max-w-sm">Cabinet de facilitation stratégique. Deauville, interventions partout en France. L'outil de cadrage est offert.</p>
          </div>
          <div className="grid gap-2 text-[14px] content-start">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/40 mb-1">Contact</p>
            <a href={mail} className="hover:text-white">{CONTACT.email}</a>
            <a href={CONTACT.telHref} className="hover:text-white">{CONTACT.tel}</a>
            <a href={CONTACT.site} target="_blank" rel="noopener" className="hover:text-white">insuffle.com</a>
            <a href={CONTACT.siteAcademie} target="_blank" rel="noopener" className="hover:text-white">insuffle-academie.com · certifié Qualiopi</a>
          </div>
          <div className="grid gap-2 text-[14px] content-start">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/40 mb-1">Outils gratuits</p>
            {OUTILS.map(o => <a key={o.url} href={o.url} target="_blank" rel="noopener" className="hover:text-white">{o.titre}</a>)}
            <button type="button" onClick={openConsent} className="text-left hover:text-white mt-2">Cookies et mesure d'audience</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
