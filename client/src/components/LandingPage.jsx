import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import {
  Zap, Users, Layout, FileText, Shield, Smartphone,
  ChevronDown, ChevronUp, ArrowRight, Star, Clock, Sliders,
  ExternalLink, Mail, MessageSquare
} from 'lucide-react';

/* US-455: Landing page SaaS avec social proof Insuffle */

const FEATURES = [
  { icon: Users, title: 'Collaboration temps réel', desc: 'Travaillez à plusieurs sur le même canvas, en live.' },
  { icon: Shield, title: 'Sans compte, accès par URL', desc: 'Un lien, un pseudo, c\'est parti. Zéro friction.' },
  { icon: Layout, title: 'Canvas structuré en 4 phases', desc: 'AVANT, PENDANT Facilitation, PENDANT Risques, CONCLUSION.' },
  { icon: Zap, title: '100+ questions-guides Insuffle', desc: 'Des questions puissantes pour aller au fond du cadrage.' },
  { icon: Sliders, title: '8 curseurs de positionnement', desc: 'Calibrez votre temps collectif avec le sponsor.' },
  { icon: Clock, title: 'Mode facilitateur', desc: 'Timer, spotlight, verrouillage de phases, brainstorming silencieux.' },
  { icon: FileText, title: 'Export PDF brandé', desc: 'Exportez votre cadrage avec la marque Insuffle.' },
  { icon: Smartphone, title: 'Mobile et tablette', desc: 'Contribuez depuis n\'importe quel appareil.' },
];

const STEPS = [
  { num: '1', title: 'Créez un espace', desc: 'Un clic, pas de compte, une URL unique générée.' },
  { num: '2', title: 'Partagez le lien', desc: 'Client, sponsor, co-facilitateur : tout le monde entre.' },
  { num: '3', title: 'Cadrez ensemble en live', desc: 'Cartes, curseurs, discussions : tout se synchronise.' },
];

const TARGETS = [
  'Facilitateurs indépendants',
  'Certifiés Insuffle Académie',
  'Consultants en transformation',
  'Coachs d\'équipe et de dirigeants',
  'Managers facilitateurs',
];

const FAQ = [
  { q: 'Faut-il créer un compte ?', a: 'Non. L\'outil fonctionne sans inscription. Choisissez un pseudo et commencez.' },
  { q: 'Mes données sont-elles confidentielles ?', a: 'Oui. Les espaces ne sont accessibles que via leur URL unique. Aucune donnée personnelle n\'est collectée. Connexion HTTPS chiffrée.' },
  { q: 'Combien de participants peuvent travailler en même temps ?', a: 'Jusqu\'à 15 personnes en temps réel sur le même espace de cadrage.' },
  { q: 'L\'outil fonctionne-t-il sur mobile ?', a: 'Oui, sur téléphone et tablette. L\'interface s\'adapte à la taille de l\'écran.' },
  { q: 'Qui est derrière cet outil ?', a: 'Insuffle, cabinet de facilitation stratégique fondé par Yoan Lureault. Insuffle Académie forme les facilitateurs et est certifié Qualiopi.' },
  { q: 'Puis-je exporter le cadrage ?', a: 'Oui. Export PDF (avec marque Insuffle), texte brut, et bientôt Notion et Google Docs.' },
  { q: 'Qu\'est-ce qu\'Insuffle Académie ?', a: 'Le centre de formation d\'Insuffle, certifié Qualiopi, qui forme les facilitateurs à la facilitation d\'ateliers et d\'intelligence collective.' },
];

/* US-456: Scroll animation hook */
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ children, className = '' }) {
  const [ref, visible] = useScrollReveal();
  return (
    <section ref={ref} className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  async function handleCreate() {
    setCreating(true);
    try {
      const { id } = await api.createSpace();
      const recent = JSON.parse(localStorage.getItem('recentSpaces') || '[]');
      recent.unshift({ id, date: new Date().toISOString(), client: '' });
      localStorage.setItem('recentSpaces', JSON.stringify(recent.slice(0, 20)));
      navigate(`/${id}`);
    } catch (e) {
      alert('Erreur lors de la création : ' + e.message);
    } finally {
      setCreating(false);
    }
  }

  const recentSpaces = JSON.parse(localStorage.getItem('recentSpaces') || '[]');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      {/* ===== Header (US-381) ===== */}
      <header style={{ backgroundColor: 'var(--color-primary)' }} className="text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-btn flex items-center justify-center font-display font-bold text-lg" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
            <span className="font-display text-lg font-bold">Insuffle <span style={{ color: 'var(--color-accent)' }}>Cadrage Live</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-[var(--color-accent)] transition-colors">Fonctionnalités</a>
            <a href="#method" className="hover:text-[var(--color-accent)] transition-colors">La méthode</a>
            <a href="#faq" className="hover:text-[var(--color-accent)] transition-colors">FAQ</a>
            <button onClick={handleCreate} className="btn-primary text-sm">Créer un cadrage</button>
          </nav>
        </div>
      </header>

      {/* ===== Hero — Seth Godin + Malcolm Gladwell : les 8 axes au centre du récit ===== */}
      <section style={{ backgroundColor: 'var(--color-primary)' }} className="text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <p className="text-caption uppercase tracking-wider opacity-50 mb-4">Insuffle Cadrage Live</p>
          <h1 className="font-display text-h1-mobile md:text-[36px] md:leading-tight mb-6">
            Rendez visibles les <span style={{ color: 'var(--color-accent)' }}>non-dits</span><br className="hidden sm:block" />
            avant le temps collectif.
          </h1>
          <p className="text-body md:text-lg opacity-70 mb-4 max-w-2xl mx-auto">
            Un DG met 5 sur l'axe "Porter le cap". Le facilitateur met 1 — "Agir ensemble".
            <strong style={{ color: 'var(--color-accent)', opacity: 1 }}> Divergence forte.</strong> Silence.
          </p>
          <p className="text-body md:text-lg opacity-60 mb-10 max-w-2xl mx-auto">
            C'est à ce moment-là que le vrai cadrage commence.
            Insuffle Cadrage Live rend cet écart visible — avant l'atelier, pas après.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleCreate} disabled={creating}
              className="btn-primary text-lg px-8 py-3 h-auto animate-pulse-glow">
              {creating ? 'Création...' : 'Créer un cadrage'} <ArrowRight size={20} />
            </button>
          </div>
          <p className="mt-6 text-sm opacity-40">Sans inscription, prêt en 5 secondes</p>
        </div>
      </section>

      {/* ===== Les 8 axes — Seth Godin : le différenciateur au centre ===== */}
      <Section className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-h2-mobile md:text-h2 mb-3">
              Les <span style={{ color: 'var(--color-accent)' }}>8 axes</span> qu'aucun autre outil ne propose
            </h2>
            <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
              Insuffle a formalisé les 8 tensions fondamentales de tout temps collectif. Cet outil vous permet de les calibrer avec votre client en temps réel.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { left: 'Décider', right: 'Faire mûrir', desc: 'Le groupe tranche-t-il ou explore-t-il ?' },
              { left: 'Agir ensemble', right: 'Porter le cap', desc: 'Co-construction ou alignement derrière une vision ?' },
              { left: 'Tenir le cadre', right: 'Autonomie du groupe', desc: 'Jusqu\'où le groupe s\'auto-organise-t-il ?' },
              { left: 'Produire', right: 'Explorer', desc: 'Plan d\'action chiffré ou pistes ouvertes ?' },
              { left: 'Contenu', right: 'Processus', desc: 'Problème de fond ou de fonctionnement ?' },
              { left: 'Prise de recul', right: 'Passage à l\'action', desc: 'Urgence d\'agir ou urgence de comprendre ?' },
              { left: 'Ouvert', right: 'Ciblé', desc: 'Agenda fixé ou accueil de l\'émergence ?' },
              { left: 'Sérieux', right: 'Ludique', desc: 'La culture tolère-t-elle le décalage ?' },
            ].map((ax, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-card border"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-body-sm">{ax.left} <span style={{ color: 'var(--color-text-muted)' }}>↔</span> {ax.right}</div>
                  <div className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{ax.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-label text-center mt-6" style={{ color: 'var(--color-text-muted)' }}>
            15 ans de terrain encodés dans 8 axes · Propriété intellectuelle Insuffle
          </p>
        </div>
      </Section>

      {/* ===== Problem (US-455) ===== */}
      <Section className="py-16 md:py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <p className="text-h2-mobile md:text-h2 font-display" style={{ color: 'var(--color-text-muted)' }}>
            Préparer un temps collectif prend trop de temps.
            Les allers-retours avec le sponsor s'accumulent.
            Le cadrage se perd dans les emails.
          </p>
        </div>
      </Section>

      {/* ===== Recent spaces ===== */}
      {recentSpaces.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
          <h2 className="text-caption uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>Vos cadrages récents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSpaces.slice(0, 6).map(s => (
              <button key={s.id} onClick={() => navigate(`/${s.id}`)}
                className="text-left p-4 rounded-card elevation-1 hover:elevation-2 transition-shadow"
                style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="font-medium text-body-sm">{s.client || 'Sans nom'}</div>
                <div className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{new Date(s.date).toLocaleDateString('fr-FR')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== Steps ===== */}
      <Section className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-h2-mobile md:text-h2 text-center mb-12">Comment ça marche</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-display font-bold mx-auto mb-4"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>{s.num}</div>
                <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== Method (US-399, US-400) ===== */}
      <Section id="method" className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-h2-mobile md:text-h2 mb-4">Basé sur le Canvas de Cadrage Insuffle</h2>
          <p className="text-body md:text-lg max-w-2xl mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }}>
            La méthode repose sur 100+ questions stratégiques réparties en 4 phases :
            AVANT, PENDANT Facilitation, PENDANT Risques, et CONCLUSION.
            Utilisée en mission réelle par les facilitateurs Insuffle.
          </p>
          <p className="text-caption mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Questions issues de la méthode de cadrage Insuffle
          </p>
          <a href="https://insuffle.com" target="_blank" rel="noopener"
            className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
            En savoir plus sur la méthode <ExternalLink size={14} />
          </a>
        </div>
      </Section>

      {/* ===== Features (US-382: jaune partout) ===== */}
      <Section id="features" className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-h2-mobile md:text-h2 text-center mb-12">Ce que vous pouvez faire</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-5 rounded-card border hover:elevation-2 transition-all duration-200"
                style={{ borderColor: 'var(--color-border)' }}>
                <f.icon className="mb-3" size={28} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
                <h3 className="font-semibold mb-1 text-body">{f.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== Targets ===== */}
      <Section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-h2-mobile md:text-h2 mb-8">Pour qui ?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TARGETS.map(t => (
              <span key={t} className="px-5 py-2.5 rounded-full elevation-1 text-body-sm font-medium"
                style={{ backgroundColor: 'var(--color-surface)' }}>{t}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== Insuffle section (US-383, US-385) ===== */}
      <Section className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center text-white">
          <p className="text-caption uppercase tracking-wider mb-4 opacity-60">Un outil par</p>
          <h2 className="font-display text-h1-mobile md:text-h1 mb-4">Insuffle</h2>
          <p className="text-body opacity-70 mb-2">Cabinet de facilitation stratégique</p>
          <p className="text-body-sm opacity-50 mb-8 max-w-xl mx-auto">
            Insuffle accompagne les organisations dans leurs transformations. Insuffle Académie forme les facilitateurs (certifié Qualiopi).
          </p>
          <a href="https://insuffle.com" target="_blank" rel="noopener" className="btn-primary text-base px-8 py-3 h-auto inline-flex items-center gap-2">
            Découvrir Insuffle <ArrowRight size={18} />
          </a>
        </div>
      </Section>

      {/* ===== Académie (US-384, US-396, US-397) ===== */}
      <Section className="py-16 md:py-20" style={{ backgroundColor: '#f3e8f1' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-caption font-semibold text-white" style={{ backgroundColor: 'var(--color-academie)' }}>
            Certifié Qualiopi
          </div>
          <h2 className="font-display text-h2-mobile md:text-h2 mb-4" style={{ color: 'var(--color-academie)' }}>
            Devenez facilitateur certifié
          </h2>
          <p className="font-display font-semibold mb-2">Insuffle Académie</p>
          <p className="text-body mb-8 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Formez-vous à la facilitation, à l'intelligence collective et au cadrage de temps collectifs.
          </p>
          <a href="https://insuffle.com" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-btn transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--color-academie)', color: 'white' }}>
            Découvrir les formations <ArrowRight size={18} />
          </a>
        </div>
      </Section>

      {/* ===== FAQ (US-455) ===== */}
      <Section id="faq" className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-h2-mobile md:text-h2 text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="rounded-card border" style={{ borderColor: 'var(--color-border)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-body"
                  aria-expanded={openFaq === i}>
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-body-sm animate-fade-in" style={{ color: 'var(--color-text-muted)' }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== CTA final ===== */}
      <Section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-h2-mobile md:text-h2 mb-4">Prêt à cadrer votre prochain temps collectif ?</h2>
          <p className="text-body mb-8" style={{ color: 'var(--color-text-muted)' }}>Sans inscription, prêt en 5 secondes.</p>
          <button onClick={handleCreate} disabled={creating} className="btn-primary text-lg px-8 py-3 h-auto">
            {creating ? 'Création...' : 'Créer votre premier cadrage'} <ArrowRight size={20} />
          </button>
        </div>
      </Section>

      {/* ===== Footer (US-459) ===== */}
      <footer style={{ backgroundColor: 'var(--color-primary)' }} className="text-white py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded flex items-center justify-center font-display font-bold"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
                <span className="font-display font-bold">Insuffle</span>
              </div>
              <p className="text-body-sm opacity-60 mb-3">Cabinet de facilitation stratégique</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-[8px]"
                  style={{ backgroundColor: 'var(--color-academie)', color: 'white' }}>IA</div>
                <span className="text-caption opacity-60">Insuffle Académie · Certifié Qualiopi</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-body-sm mb-3">Produit</h4>
              <div className="space-y-1.5 text-body-sm opacity-60">
                <a href="#features" className="block hover:opacity-100 transition-opacity">Fonctionnalités</a>
                <a href="#method" className="block hover:opacity-100 transition-opacity">La méthode</a>
                <a href="#faq" className="block hover:opacity-100 transition-opacity">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-body-sm mb-3">Ressources</h4>
              <div className="space-y-1.5 text-body-sm opacity-60">
                <a href="https://insuffle.com" target="_blank" rel="noopener" className="block hover:opacity-100 transition-opacity">Insuffle.com</a>
                <a href="https://insuffle.com" target="_blank" rel="noopener" className="block hover:opacity-100 transition-opacity">Formations</a>
                <a href="https://insuffle.com" target="_blank" rel="noopener" className="block hover:opacity-100 transition-opacity">Blog</a>
                <a href="#" className="block hover:opacity-100 transition-opacity">Mentions légales</a>
                <a href="#" className="block hover:opacity-100 transition-opacity">Confidentialité</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-caption opacity-40">
            © 2024-2026 Insuffle. Tous droits réservés. | Outil de cadrage Insuffle | insuffle.com
          </div>
        </div>
      </footer>
    </div>
  );
}
