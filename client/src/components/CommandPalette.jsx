import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import { Search, Download, Sliders, Activity, Settings, HelpCircle, LayoutList, CalendarRange, Target, Compass, Presentation } from 'lucide-react';

/* US-411: Command Palette (Cmd+K) */

const ACTIONS = [
  { id: 'conception', label: 'Concevoir le déroulé', icon: LayoutList },
  { id: 'agenda', label: 'Agenda A4 et exports', icon: CalendarRange },
  { id: 'succes', label: 'Mesure du succès', icon: Target },
  { id: 'reperes', label: 'Repères Insuffle', icon: Compass },
  { id: 'salle', label: 'Projeter : mode salle', icon: Presentation },
  { id: 'export', label: 'Exporter', icon: Download, shortcut: 'E' },
  { id: 'axes', label: 'Les 8 polarités', icon: Sliders },
  { id: 'activity', label: 'Activité récente', icon: Activity },
  { id: 'facilitator', label: 'Mode facilitateur', icon: Settings, shortcut: 'F' },
  { id: 'help', label: 'Aide et raccourcis', icon: HelpCircle, shortcut: '?' },
];

export default function CommandPalette({ onClose, onAction }) {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filteredActions = ACTIONS.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  // Also search cards
  const matchingCards = query.length >= 2
    ? state.cards.filter(c => c.content.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const allResults = [
    ...filteredActions.map(a => ({ type: 'action', ...a })),
    ...matchingCards.map(c => ({ type: 'card', id: c.id, label: c.content.substring(0, 60), icon: null, author: c.author })),
  ];

  function handleKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, allResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && allResults[selectedIndex]) {
      const item = allResults[selectedIndex];
      if (item.type === 'action') onAction(item.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]"
      onClick={onClose} role="dialog" aria-modal="true" aria-label="Recherche et actions">
      {/* Overlay */}
      <div className="absolute inset-0 animate-fade-in" style={{ backgroundColor: 'rgba(12,22,41,0.5)' }} />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 rounded-modal elevation-3 overflow-hidden animate-scale-in"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une action, une carte..."
            className="flex-1 py-3 bg-transparent outline-none text-body"
            style={{ color: 'var(--color-text)' }}
          />
          <kbd className="text-label px-1.5 py-0.5 rounded-tag" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto py-2">
          {allResults.length === 0 && (
            <p className="text-body-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Aucun résultat</p>
          )}
          {allResults.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selectedIndex ? '' : ''}`}
                style={{
                  backgroundColor: i === selectedIndex ? 'var(--color-surface-alt)' : 'transparent',
                  color: 'var(--color-text)',
                }}
                onClick={() => { if (item.type === 'action') onAction(item.id); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}>
                {Icon && <Icon size={18} style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />}
                {!Icon && <div className="w-[18px] h-[18px] rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />}
                <span className="flex-1 text-body-sm truncate">{item.label}</span>
                {item.shortcut && (
                  <kbd className="text-label px-1.5 py-0.5 rounded-tag" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{item.shortcut}</kbd>
                )}
                {item.author && (
                  <span className="text-label" style={{ color: 'var(--color-text-muted)' }}>{item.author}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center gap-4 text-label" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <span>↑↓ Naviguer</span>
          <span>↵ Sélectionner</span>
          <span>Esc Fermer</span>
        </div>
      </div>
    </div>
  );
}
