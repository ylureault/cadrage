import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import {
  Zap, Users, Layout, FileText, Shield, Smartphone,
  ChevronDown, ChevronUp, ArrowRight, Star, Clock, Globe
} from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Collaboration temps réel', desc: 'Travaillez à plusieurs sur le même canvas, en live.' },
  { icon: Shield, title: 'Sans compte, accès par URL', desc: 'Un lien, un pseudo, c\'est parti. Zéro friction.' },
  { icon: Layout, title: 'Canvas structuré en 4 phases', desc: 'AVANT, PENDANT Facilitation, PENDANT Risques, CONCLUSION.' },
  { icon: Zap, title: '100+ questions-guides Insuffle', desc: 'Des questions puissantes pour aller au fond du cadrage.' },
  { icon: Star, title: '8 curseurs de positionnement', desc: 'Calibrez votre intervention avec le sponsor.' },
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
  { q: 'Combien de participants peuvent travailler en même temps ?', a: '5 en plan gratuit, 15 en plan Pro. Tout en temps réel.' },
  { q: 'L\'outil fonctionne-t-il sur mobile ?', a: 'Oui, sur téléphone et tablette. L\'interface s\'adapte à la taille de l\'écran.' },
  { q: 'Qui est derrière cet outil ?', a: 'Insuffle, cabinet de facilitation fondé par Yoan Lureault. Insuffle Académie forme les facilitateurs et est certifié Qualiopi.' },
  { q: 'Puis-je exporter le cadrage ?', a: 'Oui. Export PDF (avec marque Insuffle), texte brut, et bientôt Notion et Google Docs.' },
  { q: 'Qu\'est-ce qu\'Insuffle Académie ?', a: 'Le centre de formation d\'Insuffle, certifié Qualiopi, qui forme les facilitateurs à la facilitation d\'ateliers et d\'intelligence collective.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  async function handleCreate() {
    setCreating(true);
    try {
      const { id } = await api.createSpace();
      // Save to recent spaces
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-insuffle-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-insuffle-gold rounded-lg flex items-center justify-center font-bold text-insuffle-dark">I</div>
            <span className="text-xl font-bold">Insuffle <span className="text-insuffle-gold">Cadrage Live</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-insuffle-gold transition">Fonctionnalités</a>
            <a href="#method" className="hover:text-insuffle-gold transition">La méthode</a>
            <a href="#pricing" className="hover:text-insuffle-gold transition">Tarifs</a>
            <a href="#faq" className="hover:text-insuffle-gold transition">FAQ</a>
            <button onClick={handleCreate} className="btn-primary text-sm">Créer un cadrage</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-insuffle-dark text-white py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Préparez vos interventions<br />à plusieurs. <span className="text-insuffle-gold">En live.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            L'outil de cadrage collaboratif basé sur la méthode Insuffle.
            Sans compte. En temps réel. Pensé pour les facilitateurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleCreate} disabled={creating} className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2">
              {creating ? 'Création...' : 'Créer un cadrage gratuit'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Recent spaces */}
      {recentSpaces.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-600">Vos cadrages récents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSpaces.slice(0, 6).map(s => (
              <button key={s.id} onClick={() => navigate(`/${s.id}`)}
                className="text-left p-4 bg-white rounded-lg card-shadow hover:card-shadow-hover transition-shadow">
                <div className="font-medium">{s.client || 'Sans nom'}</div>
                <div className="text-sm text-gray-500">{new Date(s.date).toLocaleDateString('fr-FR')}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 bg-insuffle-gold rounded-full flex items-center justify-center text-xl font-bold text-insuffle-dark mx-auto mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Method */}
      <section id="method" className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Basé sur le Canvas de Cadrage Insuffle</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            La méthode repose sur 100+ questions stratégiques réparties en 4 phases : AVANT, PENDANT Facilitation,
            PENDANT Risques, et CONCLUSION. Utilisée en mission réelle par les facilitateurs Insuffle.
          </p>
          <a href="https://insuffle.com" target="_blank" rel="noopener" className="text-insuffle-blue hover:underline font-medium">
            En savoir plus sur la méthode →
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ce que vous pouvez faire</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-5 rounded-xl border border-gray-100 hover:card-shadow transition-shadow">
                <f.icon className="text-insuffle-blue mb-3" size={28} />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Targets */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Pour qui ?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TARGETS.map(t => (
              <span key={t} className="bg-white px-5 py-2.5 rounded-full card-shadow text-sm font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Insuffle Académie */}
      <section className="py-16 bg-insuffle-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Devenez facilitateur certifié</h2>
          <p className="text-lg text-gray-300 mb-2">Insuffle Académie - Certifié Qualiopi</p>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Formez-vous à la facilitation d'ateliers, à l'intelligence collective et au cadrage d'intervention.
          </p>
          <a href="https://insuffle.com" target="_blank" rel="noopener" className="btn-primary inline-flex items-center gap-2">
            Découvrir les formations <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tarifs</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 card-shadow">
              <h3 className="text-xl font-bold mb-2">Gratuit</h3>
              <p className="text-3xl font-bold mb-4">0€</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>✓ 3 espaces actifs</li>
                <li>✓ 5 participants max</li>
                <li>✓ Export PDF</li>
                <li>✓ Toutes les fonctionnalités de base</li>
              </ul>
              <button onClick={handleCreate} className="btn-primary w-full">Commencer gratuitement</button>
            </div>
            <div className="bg-insuffle-dark text-white rounded-2xl p-8 ring-2 ring-insuffle-gold">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">19€<span className="text-sm font-normal text-gray-400">/mois</span></p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li>✓ Espaces illimités</li>
                <li>✓ 15 participants</li>
                <li>✓ Templates Insuffle</li>
                <li>✓ Marque blanche partielle</li>
                <li>✓ Support prioritaire</li>
              </ul>
              <button className="btn-primary w-full">Passer en Pro</button>
              <p className="text-xs text-gray-400 mt-3 text-center">Pro inclus pour les certifiés Insuffle Académie</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium">
                  {f.q}
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-gray-600 text-sm">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-insuffle-dark text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-insuffle-gold rounded flex items-center justify-center font-bold text-insuffle-dark text-xs">I</div>
                <span className="text-white font-bold">Insuffle</span>
              </div>
              <p className="text-sm">Outil de cadrage collaboratif pour facilitateurs.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Liens</h4>
              <div className="space-y-1 text-sm">
                <a href="https://insuffle.com" target="_blank" rel="noopener" className="block hover:text-white">Insuffle</a>
                <a href="https://insuffle.com" target="_blank" rel="noopener" className="block hover:text-white">Insuffle Académie</a>
                <a href="https://insuffle.com" target="_blank" rel="noopener" className="block hover:text-white">Blog Insuffle</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Légal</h4>
              <div className="space-y-1 text-sm">
                <a href="#" className="block hover:text-white">Mentions légales</a>
                <a href="#" className="block hover:text-white">Politique de confidentialité</a>
                <a href="#" className="block hover:text-white">CGU</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            Outil de cadrage Insuffle | insuffle.com
          </div>
        </div>
      </footer>
    </div>
  );
}
