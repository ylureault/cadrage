import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import Card from './Card.jsx';
import { Plus, ChevronDown, ChevronUp, Eye, EyeOff, HelpCircle, MessageSquarePlus } from 'lucide-react';

export default function ColumnView({ column, phase, locked }) {
  const { state, dispatch } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [newContent, setNewContent] = useState('');
  const prevCardIds = useRef(new Set());

  const cards = useMemo(() => {
    let filtered = state.cards.filter(c => c.column_key === column.key && c.phase === phase.key);

    // Silent mode: only show own cards
    if (state.silentColumns[column.key] && !state.revealedColumns[column.key] && !state.isFacilitator) {
      filtered = filtered.filter(c => c.author === state.pseudo);
    }

    // Search filter (content + author)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.content.toLowerCase().includes(q) || c.author.toLowerCase().includes(q));
    }

    return filtered.sort((a, b) => a.position - b.position);
  }, [state.cards, column.key, phase.key, state.silentColumns, state.revealedColumns, state.isFacilitator, state.pseudo, state.searchQuery]);

  const focusers = Object.entries(state.focusZones)
    .filter(([, col]) => col === column.key)
    .map(([pseudo]) => pseudo);

  // Close form when OUR new card appears in this column (server confirmed)
  useEffect(() => {
    const currentIds = new Set(cards.map(c => c.id));
    if (submitting) {
      // Check if a new card by current user appeared
      const hasOwnNewCard = cards.some(c => c.author === state.pseudo && !prevCardIds.current.has(c.id));
      if (hasOwnNewCard) {
        setNewContent('');
        setAdding(false);
        setSubmitting(false);
      }
    }
    prevCardIds.current = currentIds;
  }, [cards, submitting, state.pseudo]);

  function handleAdd() {
    if (!newContent.trim() || state.archived || submitting) return;
    setSubmitting(true);
    socket.emit('create-card', { phase: phase.key, columnKey: column.key, content: newContent.trim() });
    // Form stays open until server confirms via card-created event
    // If error, the Notifications component will show it (socket 'error' → store notification)
    // Timeout fallback: if no response in 5s, re-enable the button
    setTimeout(() => setSubmitting(false), 5000);
  }

  function handleReplyToQuestion(question) {
    setNewContent(`[Q] ${question}\n\n`);
    setAdding(true);
  }

  function handleFocus() {
    socket.emit('focus-zone', { columnKey: column.key });
  }

  const isSilent = state.silentColumns[column.key] && !state.revealedColumns[column.key];

  return (
    <div className="rounded-card elevation-1 overflow-hidden transition-all duration-200 hover:elevation-2"
      style={{ backgroundColor: 'var(--color-surface)' }}
      onClick={handleFocus}
      role="region" aria-label={column.name}>
      {/* Column header */}
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setCollapsed(!collapsed)} className="p-0.5 rounded-btn transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={collapsed ? 'Déplier' : 'Replier'}>
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <h3 className="text-body-sm font-semibold truncate">{column.name}</h3>
          {cards.length > 0 && (
            <span className="text-label px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{cards.length}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Focus indicators */}
          {focusers.map(p => (
            <div key={p} className="w-5 h-5 rounded-full bg-insuffle-blue text-white text-[10px] flex items-center justify-center font-medium" title={p}>
              {p[0]}
            </div>
          ))}
          {/* Silent mode indicator */}
          {isSilent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
              title="Mode silencieux : chaque participant ne voit que ses propres cartes">
              Silencieux
            </span>
          )}
          {/* Facilitator: toggle silent mode */}
          {state.isFacilitator && (
            <button onClick={() => {
              if (isSilent) socket.emit('reveal-cards', { columnKey: column.key });
              else socket.emit('toggle-silent-mode', { columnKey: column.key, active: !state.silentColumns[column.key] });
            }} className="p-0.5 rounded-btn transition-colors" style={{ color: 'var(--color-text-muted)' }}
              title={isSilent ? 'Révéler toutes les cartes' : 'Activer le mode silencieux (chacun ne voit que ses cartes)'}>
              {isSilent ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
          {/* Questions-guides : TOUJOURS visibles, pliables (Priorité 2 — Tim Brown + Jony Ive)
             Les questions sont du design, pas du contenu. Elles restent comme les labels d'un formulaire. */}
          {column.questions && column.questions.length > 0 && (
            <div className="rounded-btn overflow-hidden" style={{ backgroundColor: 'rgba(255,222,89,0.06)' }}>
              <button
                onClick={() => setQuestionsOpen(!questionsOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[rgba(255,222,89,0.1)] cursor-pointer"
                aria-expanded={questionsOpen}
                aria-label="Questions-guides Insuffle"
                title={questionsOpen ? 'Masquer les questions-guides' : 'Afficher les questions-guides'}>
                <HelpCircle size={14} style={{ color: 'var(--color-accent)' }} />
                <span className="text-label font-semibold flex-1" style={{ color: 'var(--color-text-muted)' }}>
                  Questions-guides
                </span>
                <span className="text-label" style={{ color: 'var(--color-text-muted)' }}>
                  {questionsOpen ? '▾' : '▸'}
                </span>
              </button>
              {questionsOpen && (
                <div className="px-3 pb-3 space-y-1 animate-fade-in">
                  {column.questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-1.5 group/q py-1 highlight-accent"
                      style={{ borderLeftColor: 'var(--color-accent)' }}>
                      <p className="text-body-sm italic leading-snug flex-1"
                        style={{ color: 'var(--color-text-muted)' }}>
                        {q}
                      </p>
                      {!locked && !state.archived && (
                        <button
                          onClick={() => handleReplyToQuestion(q)}
                          className="shrink-0 opacity-0 group-hover/q:opacity-100 focus:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-btn"
                          style={{ color: 'var(--color-accent-dark)', backgroundColor: 'rgba(255,222,89,0.15)' }}
                          title="Créer une carte pour répondre à cette question">
                          <MessageSquarePlus size={12} /> Répondre
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-label mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    Questions issues de la méthode de cadrage Insuffle
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add card form — placed right after questions so they remain visible as inspiration */}
          {adding && (
            <div className="animate-slide-in">
              {newContent.startsWith('[Q] ') && (
                <div className="text-[11px] font-medium px-2 py-1.5 rounded-t-btn mb-0"
                  style={{ backgroundColor: 'rgba(255,222,89,0.12)', color: 'var(--color-text-muted)' }}>
                  Carte liée à une question-guide
                </div>
              )}
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                placeholder={newContent.startsWith('[Q] ') ? 'Écrivez votre réponse ici...' : 'Partagez votre idée, observation ou proposition...'}
                className="input-field w-full text-sm resize-none"
                rows={newContent.startsWith('[Q] ') ? 5 : 3} maxLength={500} autoFocus
                ref={el => { if (el && newContent.startsWith('[Q] ') && el.selectionStart === 0) el.selectionStart = el.selectionEnd = newContent.length; }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd();
                  if (e.key === 'Escape') { setAdding(false); setNewContent(''); }
                }}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{newContent.length}/500 · Ctrl+Entrée pour valider</span>
                <div className="flex gap-1">
                  <button onClick={() => { setAdding(false); setNewContent(''); setSubmitting(false); }} className="btn-ghost text-xs" disabled={submitting}>Annuler</button>
                  <button onClick={handleAdd} disabled={!newContent.trim() || submitting} className="btn-primary text-xs px-3 py-1">
                    {submitting ? 'Envoi...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cards */}
          {cards.map(card => (
            <Card key={card.id} card={card} />
          ))}

          {/* Empty state (quand pas de questions ET pas de cartes) */}
          {cards.length === 0 && !adding && (
            <div className="text-center py-6">
              <Plus size={24} className="mx-auto mb-2" style={{ color: 'var(--color-border)' }} />
              <p className="text-body-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Aucune carte pour l'instant
              </p>
              {!locked && !state.archived && (
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                  Cliquez sur « Ajouter » ci-dessous{column.questions?.length > 0 ? ' ou répondez à une question-guide' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add button */}
      {!collapsed && !adding && !locked && !state.archived && (
        <button onClick={() => setAdding(true)}
          className="w-full py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium transition-all border-t hover:scale-[1.01]"
          style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent-dark)'; e.currentTarget.style.backgroundColor = 'rgba(255,222,89,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.backgroundColor = ''; }}>
          <Plus size={16} /> Ajouter une carte
        </button>
      )}
    </div>
  );
}
