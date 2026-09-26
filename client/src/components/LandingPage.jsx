import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { ArrowRight, CalendarRange, ChevronDown, ChevronUp, Compass, Loader2, Target, Users } from 'lucide-react';
import Logo from './brand/Logo.jsx';
import { SIGNATURE } from '../planning/constants.js';
import { fmtDur } from '../planning/utils.js';

const PATH = [
  {
    icon: Compass, step: 'Cadrer', title: 'Avec le sponsor, avant tout',
    text: 'Quatre temps (avant, pendant, risques, conclusion), des questions génératives, les 8 polarités pour régler la posture. On voit les écarts avant d\'entrer dans la salle.',
  },
  {
    icon: Users, step: 'Concevoir', title: 'Le déroulé au quart d\'heure',
    text: 'Une question-titre, une intention, des séquences qui tombent juste. Une bibliothèque de méthodes, le double diamant, des contrôles qui repèrent le trou, le débordement, les 2 h sans pause.',
  },
  {
    icon: CalendarRange, step: 'Envoyer', title: 'Une page A4 par jour',
    text: 'Le planning client, lisible en une minute. La fiche animateur pour soi. En PDF, en HTML modifiable, en JSON. Toujours aux couleurs Insuffle.',
  },
  {
    icon: Target, step: 'Mesurer', title: 'Le succès, pas l\'ambiance',
    text: 'Des critères observables posés avant. Avant 1, après 10, voté en direct par le groupe. Le ROTI à part. La suite : qui fait quoi, pour quand, et les rendez-vous à J+15 et J+90.',
  },
];

const FAQ = [
  { q: 'Faut-il créer un compte ?', a: 'Non. Un lien, un prénom, et on travaille. Chaque cadrage a son adresse unique : la partager, c\'est donner accès.' },
  { q: 'Combien de personnes en même temps ?', a: 'Jusqu\'à 80 personnes connectées sur un même cadrage. Assez pour que toute une salle vote l\'échelle Avant / Après depuis son téléphone.' },
  { q: 'Qu\'est-ce qui part chez le client ?', a: 'Le planning A4 : une page par jour, question-titre, intention, séquences, ce qui en sort. Ni matériel, ni consignes internes, ni prix. La fiche animateur reste pour vous.' },
  { q: 'Quels exports ?', a: 'PDF (via l\'impression du navigateur), HTML modifiable en cliquant sur les textes, JSON au format planning Insuffle, tableur CSV, texte à coller dans un mail.' },
  { q: 'Pour une formation ?', a: 'Oui. Passez la charte en Académie : le planning prend les couleurs d\'Insuffle Académie. Un modèle de journée de formation est prêt, avec l\'évaluation des acquis et la satisfaction en fin de journée.' },
  { q: 'Qui est derrière ?', a: 'Insuffle, cabinet de facilitation stratégique, et Insuffle Académie, organisme de formation certifié Qualiopi. C\'est l\'outil que nous utilisons pour cadrer nos propres temps collectifs.' },
];

function Section({ children, className = '', style, id }) {
  return <section id={id} style={style} className={className}>{children}</section>;
}

function rememberSpace(id, client = '') {
  try {
    const recent = JSON.parse(localStorage.getItem('recentSpaces') || '[]').filter(r => r.id !== id);
    recent.unshift({ id, date: new Date().toISOString(), client });
    localStorage.setItem('recentSpaces', JSON.stringify(recent.slice(0, 20)));
  } catch (_) { /* stockage indisponible */ }
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => { api.listTemplates().then(d => setTemplates(d.system || [])).catch(() => {}); }, []);

  async function create(templateId = null) {
    setCreating(templateId || 'blank');
    try {
      const { id } = await api.createSpace(templateId ? { templateId } : {});
      rememberSpace(id);
      navigate(templateId ? `/${id}#conception` : `/${id}`);
    } catch (e) {
      alert(`Création impossible : ${e.message}`);
    } finally {
      setCreating(null);
    }
  }

  let recentSpaces = [];
  try { recentSpaces = JSON.parse(localStorage.getItem('recentSpaces') || '[]'); } catch (_) { /* stockage indisponible */ }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
      <header className="sticky top-0 z-50 text-white" style={{ backgroundColor: '#141E37' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3" aria-label="Accueil">
            <Logo height={26} color="#F2C245" />
            <span className="font-display font-semibold text-sm pl-3 border-l border-white/20 hidden sm:inline">Cadrage de temps collectif</span>
          </a>
          <nav className="flex items-center gap-2 md:gap-5 text-sm" aria-label="Navigation principale">
            <a href="#chemin" className="hidden md:inline hover:text-[#F2C245]">La méthode</a>
            <a href="#modeles" className="hidden md:inline hover:text-[#F2C245]">Les modèles</a>
            <a href="#faq" className="hidden md:inline hover:text-[#F2C245]">Questions</a>
            <button onClick={() => navigate('/6AG_demo')} className="px-3 py-1.5 rounded-btn border border-white/25 hover:border-[#F2C245] hover:text-[#F2C245] transition-colors">Voir la démo</button>
            <button onClick={() => create()} disabled={!!creating} className="btn-primary text-sm !py-1.5">Créer un cadrage</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="text-white" style={{ background: 'linear-gradient(160deg, #141E37 0%, #1d2a4d 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-caption font-semibold uppercase tracking-[0.18em] mb-5" style={{ color: '#F2C245' }}>Insuffle · Insuffle Académie</p>
          <h1 className="font-display font-bold leading-[1.05] text-[38px] md:text-[64px] mb-6 max-w-4xl">
            80 % d'un temps collectif se joue avant.
          </h1>
          <div className="w-20 h-2 rounded-full mb-8" style={{ backgroundColor: '#F2C245' }} />
          <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed mb-10">
            Un séminaire raté, c'est rarement un problème d'animation. C'est un problème de cadrage.
            Ici, vous cadrez avec le sponsor, vous concevez le déroulé au quart d'heure, vous envoyez un planning A4 propre.
            Et vous mesurez si ça a marché.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => create()} disabled={!!creating} className="btn-primary text-base !px-6 !py-3 flex items-center gap-2">
              {creating === 'blank' ? <Loader2 size={18} className="animate-spin" /> : null} Créer un cadrage <ArrowRight size={18} />
            </button>
            <a href="#modeles" className="px-6 py-3 rounded-btn border border-white/25 hover:border-[#F2C245] hover:text-[#F2C245] transition-colors text-base font-semibold">Partir d'un modèle</a>
          </div>
          <p className="text-sm text-white/50 mt-5">Sans compte. Un lien, et toute l'équipe travaille en direct.</p>
        </div>
      </section>

      {/* Signature */}
      <Section className="py-12 md:py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p className="max-w-4xl mx-auto px-4 md:px-8 text-center font-display text-xl md:text-3xl leading-snug" style={{ color: 'var(--color-academie)' }}>
          « {SIGNATURE} »
        </p>
      </Section>

      {/* Recent */}
      {recentSpaces.length > 0 && (
        <Section className="py-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-label uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-muted)' }}>Vos cadrages récents</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentSpaces.slice(0, 6).map(s => (
                <button key={s.id} onClick={() => navigate(`/${s.id}`)} className="text-left p-4 rounded-card elevation-1 hover:elevation-2 transition-shadow" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="font-semibold text-body-sm">{s.client || 'Cadrage sans nom'}</div>
                  <div className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                    {(() => { try { return new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; } })()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Le chemin */}
      <Section id="chemin" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="font-display font-bold text-h1-mobile md:text-h1 mb-3">Cadrer, concevoir, envoyer, mesurer.</h2>
          <p className="text-body mb-10 max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>Un seul espace, du premier appel avec le sponsor au rendez-vous à J+90.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PATH.map((p, i) => (
              <div key={p.step} className="rounded-card p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)', borderTop: '4px solid #F2C245' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-caption font-bold" style={{ backgroundColor: '#141E37', color: '#F2C245' }}>{i + 1}</span>
                  <span className="text-caption font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{p.step}</span>
                  <p.icon size={18} className="ml-auto" style={{ color: 'var(--color-accent-dark)' }} />
                </div>
                <h3 className="font-display font-semibold text-body mb-2">{p.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Positionnement */}
      <Section className="py-16 md:py-20 text-white" style={{ backgroundColor: '#141E37' }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid md:grid-cols-3 gap-8">
          <div>
            <p className="font-display font-bold text-xl mb-2" style={{ color: '#F2C245' }}>Faciliter n'est pas animer.</p>
            <p className="text-white/70 text-body-sm">L'animateur fait passer un bon moment. Le facilitateur fait émerger des décisions.</p>
          </div>
          <div>
            <p className="font-display font-bold text-xl mb-2" style={{ color: '#F2C245' }}>Faciliter n'est pas conseiller.</p>
            <p className="text-white/70 text-body-sm">Le consultant apporte ses solutions. Le facilitateur fait émerger les vôtres.</p>
          </div>
          <div>
            <p className="font-display font-bold text-xl mb-2" style={{ color: '#F2C245' }}>Collectée n'est pas collective.</p>
            <p className="text-white/70 text-body-sm">Sans désir partagé ni sécurité, les meilleurs outils ne produisent que de l'intelligence collectée.</p>
          </div>
        </div>
      </Section>

      {/* Modèles */}
      <Section id="modeles" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="font-display font-bold text-h1-mobile md:text-h1 mb-3">Partir d'un modèle</h2>
          <p className="text-body mb-10 max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>Des déroulés qui tombent juste au quart d'heure. Vous partez d'une base, vous la faites vôtre avec les mots du client.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="rounded-card p-5 elevation-1 flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderTop: `4px solid ${t.charte === 'academie' ? '#6B1963' : '#141E37'}` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-body">{t.name}</h3>
                  {t.charte === 'academie' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: '#6B1963' }}>Académie</span>}
                </div>
                {t.question && <p className="text-body-sm italic mb-2" style={{ color: 'var(--color-text)' }}>« {t.question} »</p>}
                <p className="text-body-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
                <p className="text-caption font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>{t.days} jour{t.days > 1 ? 's' : ''} · {t.sequences} séquences · {fmtDur(t.minutes)}</p>
                <button onClick={() => create(t.id)} disabled={!!creating} className="mt-auto btn-ghost text-body-sm flex items-center justify-center gap-2" style={{ border: '1px solid var(--color-border)' }}>
                  {creating === t.id ? <Loader2 size={16} className="animate-spin" /> : null} Créer avec ce modèle <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h2 className="font-display font-bold text-h2-mobile md:text-h2 mb-8">Les questions qu'on nous pose</h2>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {FAQ.map((f, i) => (
              <div key={f.q} className="py-4" style={{ borderColor: 'var(--color-border)' }}>
                <button className="w-full flex items-center justify-between gap-4 text-left font-semibold" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && <p className="text-body-sm mt-2 animate-fade-in" style={{ color: 'var(--color-text-muted)' }}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Appel final */}
      <section className="py-16 md:py-20 text-center" style={{ backgroundColor: '#F2C245', color: '#141E37' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display font-bold text-h1-mobile md:text-h1 mb-4">Le flou tue plus que le conflit.</h2>
          <p className="text-body mb-8">Commencez par la question-titre. Le reste suit.</p>
          <button onClick={() => create()} disabled={!!creating} className="px-7 py-3 rounded-btn font-semibold text-base" style={{ backgroundColor: '#141E37', color: '#F2C245' }}>Créer un cadrage</button>
        </div>
      </section>

      <footer className="py-10 text-white/70" style={{ backgroundColor: '#141E37' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <Logo height={30} color="#F2C245" />
            <p className="text-caption mt-3">Cabinet de facilitation stratégique · Deauville, interventions partout en France</p>
          </div>
          <div className="text-caption grid gap-1 md:text-right">
            <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:text-white">insuffle.com</a>
            <a href="https://insuffle-academie.com" target="_blank" rel="noopener" className="hover:text-white">Insuffle Académie · organisme de formation certifié Qualiopi</a>
            <a href="mailto:contact@insuffle.com" className="hover:text-white">contact@insuffle.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
