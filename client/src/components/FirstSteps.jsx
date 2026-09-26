import { ArrowRight, Compass, LayoutList, Share2, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store.jsx';

export const goView = (v) => window.dispatchEvent(new CustomEvent('insuffle:view', { detail: v }));
export const openShare = () => window.dispatchEvent(new CustomEvent('insuffle:share'));

// Un cadrage tout neuf : par où commencer
export default function FirstSteps() {
  const { state } = useStore();
  if (state.archived || state.cards.length > 0) return null;
  const steps = [
    { icon: Share2, title: 'Invitez le sponsor', text: 'Un lien, un prénom. Vous cadrez ensemble, en direct.', cta: 'Partager', on: openShare },
    { icon: Compass, title: 'Répondez aux questions-guides', text: 'Pourquoi maintenant ? Qui décide vraiment ? C\'est un succès si…', cta: 'Commencer', on: () => document.querySelector('[role="region"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
    { icon: SlidersHorizontal, title: 'Positionnez les 8 polarités', text: 'Décider ou faire mûrir ? Contenu ou processus ? Les écarts sautent aux yeux.', cta: 'Y aller', on: () => document.querySelector('[data-section="polarites"]')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: LayoutList, title: 'Puis concevez le déroulé', text: 'Question-titre, intention, séquences au quart d\'heure. Ou partez d\'un modèle.', cta: 'Concevoir', on: () => goView('conception') },
  ];
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-6 pt-6 animate-fade-in" aria-label="Premiers pas">
      <div className="rounded-[20px] p-5 md:p-6 hero-glow text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="relative">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#F2C245' }}>Premiers pas</p>
          <h2 className="font-display font-bold text-[22px] md:text-[26px] mb-5">80 % d'un temps collectif se joue avant. On commence.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((s, i) => (
              <button key={s.title} onClick={s.on} className="group text-left rounded-2xl p-4 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
                <span className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold" style={{ backgroundColor: '#F2C245', color: '#141E37' }}>{i + 1}</span>
                  <s.icon size={16} className="text-white/60" />
                </span>
                <span className="block font-semibold text-[15px] mb-1">{s.title}</span>
                <span className="block text-[13px] text-white/60 mb-3">{s.text}</span>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold group-hover:gap-2 transition-all" style={{ color: '#F2C245' }}>{s.cta} <ArrowRight size={14} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
