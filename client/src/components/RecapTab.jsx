import { useStore } from '../store.jsx';
import { FileText, Users, Sliders, Calendar, User, Building2, AlertTriangle, CheckCircle2, MessageSquare, Clock, Layers, CalendarDays } from 'lucide-react';

/**
 * Fiche Récap — synthèse visuelle de l'atelier.
 * N'affiche que les sections remplies pour rester concentré sur l'essentiel.
 */
export default function RecapTab() {
  const { state } = useStore();
  const space = state.space || {};

  // Collect data
  const hasHeader = space.client_name || space.sponsor || space.facilitator || space.session_date;
  const totalCards = state.cards.length;
  const authors = [...new Set(state.cards.map(c => c.author))];
  const discussCards = state.cards.filter(c => c.marked_discuss);

  // Group cards by phase+column
  const phaseData = state.phases.map(phase => {
    const phaseCards = state.cards.filter(c => c.phase === phase.key);
    const columns = phase.columns.map(col => {
      const cards = phaseCards.filter(c => c.column_key === col.key);
      return { ...col, cards };
    }).filter(col => col.cards.length > 0);
    return { ...phase, columns, cardCount: phaseCards.length };
  }).filter(p => p.cardCount > 0);

  // Axes summary
  const axesData = state.axesDef.map(axis => {
    const positions = state.axes.filter(a => a.axis_key === axis.key && a.position != null);
    const finalPos = state.axesFinal.find(a => a.axis_key === axis.key);
    const allPos = positions.map(p => p.position);
    const avg = allPos.length > 0 ? allPos.reduce((a, b) => a + b, 0) / allPos.length : null;
    const spread = allPos.length > 1 ? Math.max(...allPos) - Math.min(...allPos) : 0;
    return { ...axis, positions, finalPos, avg, spread, count: allPos.length };
  }).filter(a => a.count > 0);

  const divergences = axesData.filter(a => a.spread >= 3);
  const moderates = axesData.filter(a => a.spread >= 2 && a.spread < 3);

  // Déroulé data
  const blocks = [...(state.blocks || [])].sort((a, b) => a.position - b.position);
  const sections = [...(state.sections || [])].sort((a, b) => a.position - b.position);
  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration_minutes || 0), 0);

  const BLOCK_TYPE_LABELS = {
    ouverture: 'Ouverture', icebreaker: 'Icebreaker', production: 'Production',
    exploration: 'Exploration', debriefing: 'Débriefing', decision: 'Décision',
    pause: 'Pause', cloture: 'Clôture', transition: 'Transition', energizer: 'Energizer',
  };
  const BLOCK_TYPE_COLORS = {
    ouverture: '#22c55e', icebreaker: '#f59e0b', production: '#3b82f6',
    exploration: '#8b5cf6', debriefing: '#ec4899', decision: '#ef4444',
    pause: '#6b7280', cloture: '#14b8a6', transition: '#a3a3a3', energizer: '#f97316',
  };

  // Agenda data
  const agendaDays = [...(state.agendaDays || [])].sort((a, b) => a.position - b.position);
  const agendaSlots = state.agendaSlots || [];

  // Nothing to show
  if (!hasHeader && totalCards === 0 && axesData.length === 0 && blocks.length === 0 && agendaDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText size={40} style={{ color: 'var(--color-border)' }} />
        <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
          Rien à afficher pour l'instant. Ajoutez des cartes ou positionnez les axes pour voir la fiche récap.
        </p>
      </div>
    );
  }

  function formatDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 animate-fade-in">
      {/* Header card */}
      {hasHeader && (
        <div className="rounded-card elevation-2 overflow-hidden mb-8" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="p-6 md:p-8" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a2744 100%)' }}>
            <p className="text-label uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>
              Fiche récapitulative
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              {space.client_name || 'Cadrage de temps collectif'}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              {space.facilitator && (
                <span className="flex items-center gap-1.5"><User size={14} /> {space.facilitator}</span>
              )}
              {space.sponsor && (
                <span className="flex items-center gap-1.5"><Building2 size={14} /> {space.sponsor}</span>
              )}
              {space.session_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(space.session_date)}
                  {space.session_date_end ? ` — ${formatDate(space.session_date_end)}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Stats bar */}
          {totalCards > 0 && (
            <div className="flex flex-wrap gap-6 px-6 md:px-8 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{totalCards}</p>
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Cartes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{authors.length}</p>
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Contributeurs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{axesData.length}</p>
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Axes positionnés</p>
              </div>
              {discussCards.length > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{discussCards.length}</p>
                  <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>À discuter</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alerts */}
      {divergences.length > 0 && (
        <div className="rounded-card p-4 mb-6 flex items-start gap-3"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-body-sm mb-1" style={{ color: 'var(--color-error)' }}>
              Divergence{divergences.length > 1 ? 's' : ''} forte{divergences.length > 1 ? 's' : ''} détectée{divergences.length > 1 ? 's' : ''}
            </p>
            <ul className="text-caption space-y-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {divergences.map(a => (
                <li key={a.key}>{a.left} / {a.right} — écart de {a.spread} points</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {moderates.length > 0 && (
        <div className="rounded-card p-4 mb-6 flex items-start gap-3"
          style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-body-sm mb-1" style={{ color: 'var(--color-warning)' }}>
              Écart{moderates.length > 1 ? 's' : ''} modéré{moderates.length > 1 ? 's' : ''}
            </p>
            <ul className="text-caption space-y-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {moderates.map(a => (
                <li key={a.key}>{a.left} / {a.right} — écart de {a.spread} points</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Phases content */}
      {phaseData.map(phase => (
        <div key={phase.key} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: phase.color }} />
            <h2 className="font-display text-lg font-bold" style={{ color: phase.color }}>{phase.name}</h2>
            <span className="text-caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              {phase.cardCount} carte{phase.cardCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {phase.columns.map(col => (
              <div key={col.key} className="rounded-card elevation-1 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                  <h3 className="text-body-sm font-semibold">{col.name}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {col.cards.map(card => (
                    <div key={card.id} className="flex gap-3 items-start">
                      <div className="w-1 h-full rounded-full shrink-0 mt-1" style={{ backgroundColor: card.author_color, minHeight: 16 }} />
                      <div className="flex-1 min-w-0">
                        {card.content.startsWith('[Q] ') ? (
                          <>
                            <p className="text-caption italic mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                              {card.content.slice(4).split('\n\n')[0]}
                            </p>
                            <p className="text-body-sm">{card.content.slice(4).split('\n\n').slice(1).join('\n\n')}</p>
                          </>
                        ) : (
                          <p className="text-body-sm">{card.content}</p>
                        )}
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {card.author}
                          {card.marked_discuss ? ' · À discuter' : ''}
                          {(card.tags || []).length > 0 ? ` · ${card.tags.join(', ')}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 8 Axes recap */}
      {axesData.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <h2 className="font-display text-lg font-bold">8 axes de positionnement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {axesData.map((axis, i) => {
              const bgColor = axis.spread >= 3 ? 'rgba(239,68,68,0.05)' : axis.spread >= 2 ? 'rgba(245,158,11,0.05)' : 'var(--color-surface)';
              const borderColor = axis.spread >= 3 ? 'rgba(239,68,68,0.2)' : axis.spread >= 2 ? 'rgba(245,158,11,0.2)' : 'var(--color-border)';
              return (
                <div key={axis.key} className="rounded-card p-4 elevation-1"
                  style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                        {i + 1}
                      </span>
                      <span className="text-body-sm font-semibold">{axis.left} — {axis.right}</span>
                    </div>
                    {axis.spread >= 3 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Divergence</span>}
                    {axis.spread >= 2 && axis.spread < 3 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">Écart</span>}
                    {axis.spread < 2 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Aligné</span>}
                  </div>

                  {/* Scale visualization */}
                  <div className="relative h-6 flex items-center">
                    <div className="absolute inset-x-0 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
                    {/* Position dots */}
                    {axis.positions.map((p, pi) => (
                      <div key={pi} className="absolute w-3 h-3 rounded-full border-2 border-white"
                        style={{ left: `${((p.position - 1) / 4) * 100}%`, backgroundColor: p.color || 'var(--color-primary)', transform: 'translateX(-50%)' }}
                        title={`${p.pseudo}: ${p.position}`} />
                    ))}
                    {/* Average marker */}
                    {axis.avg !== null && (
                      <div className="absolute w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent"
                        style={{ left: `${((axis.avg - 1) / 4) * 100}%`, borderTopColor: 'var(--color-accent)', transform: 'translateX(-50%)', top: -4 }} />
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{axis.left}</span>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{axis.right}</span>
                  </div>

                  {axis.finalPos?.position && (
                    <p className="text-caption mt-2 font-medium" style={{ color: 'var(--color-accent-dark)' }}>
                      Position finale : {axis.finalPos.position}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Déroulé */}
      {blocks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <h2 className="font-display text-lg font-bold" style={{ color: '#3b82f6' }}>Déroulé de l'atelier</h2>
            <span className="text-caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              {blocks.length} bloc{blocks.length > 1 ? 's' : ''} · {Math.floor(totalDuration / 60)}h{String(totalDuration % 60).padStart(2, '0')}
            </span>
          </div>

          {/* Type distribution bar */}
          {totalDuration > 0 && (
            <div className="flex rounded-full overflow-hidden h-2 mb-4">
              {Object.entries(blocks.reduce((acc, b) => { acc[b.block_type] = (acc[b.block_type] || 0) + (b.duration_minutes || 0); return acc; }, {}))
                .sort((a, b) => b[1] - a[1])
                .map(([type, mins]) => (
                  <div key={type} style={{ width: `${(mins / totalDuration) * 100}%`, backgroundColor: BLOCK_TYPE_COLORS[type] || '#6b7280' }}
                    title={`${BLOCK_TYPE_LABELS[type] || type}: ${mins} min`} />
                ))}
            </div>
          )}

          {/* Blocks list */}
          <div className="space-y-2">
            {(() => {
              const sectionMap = {};
              sections.forEach(s => { sectionMap[s.id] = s; });
              let currentSection = null;
              const items = [];
              let cumulative = 0;

              for (const block of blocks) {
                if (block.section_id && block.section_id !== currentSection) {
                  currentSection = block.section_id;
                  const sec = sectionMap[block.section_id];
                  if (sec) items.push({ type: 'section', data: sec, key: `sec-${sec.id}` });
                }
                cumulative += block.duration_minutes || 0;
                items.push({ type: 'block', data: block, cumulative, key: `blk-${block.id}` });
              }
              return items.map(item => {
                if (item.type === 'section') {
                  return (
                    <div key={item.key} className="flex items-center gap-2 pt-3 pb-1">
                      <Layers size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-body-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>{item.data.title}</span>
                    </div>
                  );
                }
                const b = item.data;
                return (
                  <div key={item.key} className="rounded-card elevation-1 p-3" style={{ backgroundColor: 'var(--color-surface)', borderLeft: `3px solid ${BLOCK_TYPE_COLORS[b.block_type] || '#6b7280'}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-label font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: BLOCK_TYPE_COLORS[b.block_type] || '#6b7280', color: 'white' }}>
                          {BLOCK_TYPE_LABELS[b.block_type] || b.block_type}
                        </span>
                        <span className="text-body-sm font-semibold">{b.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-caption shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={12} /> {b.duration_minutes} min
                        <span className="opacity-50">({Math.floor(item.cumulative / 60)}h{String(item.cumulative % 60).padStart(2, '0')})</span>
                      </div>
                    </div>
                    {b.intention && <p className="text-body-sm italic" style={{ color: 'var(--color-text-muted)' }}>{b.intention}</p>}
                    <div className="flex flex-wrap gap-3 mt-1 text-caption" style={{ color: 'var(--color-text-muted)' }}>
                      {b.format && b.format !== 'pleniere' && <span>Format: {b.format}{b.format_detail ? ` (${b.format_detail})` : ''}</span>}
                      {b.material && <span>Matériel: {b.material}</span>}
                      {b.deliverable && <span>Livrable: {b.deliverable}</span>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Agenda */}
      {agendaDays.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <h2 className="font-display text-lg font-bold" style={{ color: '#f59e0b' }}>Agenda</h2>
            <span className="text-caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              {agendaDays.length} jour{agendaDays.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {agendaDays.map(day => {
              const daySlots = agendaSlots.filter(s => s.day_id === day.id).sort((a, b) => a.position - b.position);
              return (
                <div key={day.id} className="rounded-card elevation-1 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="px-4 py-2.5 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <h3 className="text-body-sm font-semibold flex items-center gap-2">
                      <CalendarDays size={14} />
                      Jour {day.day_number}{day.date ? ` — ${(() => { try { return new Date(day.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); } catch { return day.date; } })()}` : ''}
                    </h3>
                    <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{day.start_time} — {day.end_time}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    {daySlots.length === 0 && (
                      <p className="text-caption italic" style={{ color: 'var(--color-text-muted)' }}>Aucun créneau planifié</p>
                    )}
                    {daySlots.map(slot => {
                      const block = blocks.find(b => b.id === slot.block_id);
                      const endTime = (() => {
                        const [h, m] = (slot.start_time || '09:00').split(':').map(Number);
                        const total = (h * 60 + m + (slot.duration_minutes || 0)) % 1440;
                        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
                      })();
                      return (
                        <div key={slot.id} className="flex items-center gap-3 py-1.5 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                          <span className="text-caption font-mono w-24 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            {slot.start_time} — {endTime}
                          </span>
                          {block ? (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BLOCK_TYPE_COLORS[block.block_type] || '#6b7280' }} />
                              <span className="text-body-sm font-medium truncate">{block.title}</span>
                              <span className="text-caption shrink-0" style={{ color: 'var(--color-text-muted)' }}>{slot.duration_minutes} min</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{slot.title || slot.slot_type}</span>
                              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{slot.duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
          Fiche generee le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} par Insuffle Cadrage Live — insuffle.com
        </p>
      </div>
    </div>
  );
}
