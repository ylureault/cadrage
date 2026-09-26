import { useStore } from '../store.jsx';
import { FileText, Users, Sliders, Calendar, User, Building2, AlertTriangle, CheckCircle2, MessageSquare, CalendarDays } from 'lucide-react';
import Logo from './brand/Logo.jsx';
import { computeDay, dayLabel, fmtDur, hm, sortByPos, formatDate as formatLongDate } from '../planning/utils.js';
import { successSummary } from '../planning/sheet.js';
import { CRITERION_STATUS } from '../planning/constants.js';

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

  // Planning et succès
  const days = sortByPos(state.agendaDays || []);
  const blocks = state.blocks || [];
  const success = state.success || { criteria: [], actions: [], votes: [] };
  const ss = successSummary(success);
  const planning = state.planning || {};

  // Nothing to show
  if (!hasHeader && totalCards === 0 && axesData.length === 0 && blocks.length === 0 && days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText size={40} style={{ color: 'var(--color-border)' }} />
        <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
          Rien à afficher pour l'instant. Ajoutez des cartes, positionnez les polarités ou concevez le déroulé pour voir la fiche récap.
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
          <div className="p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #141E37 0%, #1f2b4d 100%)' }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <Logo height={24} color="#F2C245" academie={planning.charte === 'academie'} />
              <button onClick={() => window.print()} className="no-print text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10" style={{ color: '#F2C245', boxShadow: 'inset 0 0 0 1px rgba(242,194,69,.4)' }}>Imprimer la fiche</button>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
              {space.client_name || 'Cadrage de temps collectif'}
            </h1>
            {planning.question && <p className="font-display text-lg text-white/90 mb-1">{planning.question}</p>}
            {planning.intention && <p className="text-body-sm text-white/70 mb-4">{planning.intention}</p>}
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
                  {space.session_date_end ? ` au ${formatDate(space.session_date_end)}` : ''}
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
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Polarités positionnées</p>
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

      {/* Succès */}
      {(success.criteria.length > 0 || success.actions.length > 0 || success.votes.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
            <h2 className="font-display text-lg font-bold">Le succès</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              [ss.score == null ? '·' : `${ss.score} %`, 'Critères atteints'],
              [`${ss.avant ? ss.avant.avg.toFixed(1).replace('.', ',') : '·'} → ${ss.apres ? ss.apres.avg.toFixed(1).replace('.', ',') : '·'}`, 'Avant / Après'],
              [ss.roti ? `${ss.roti.avg.toFixed(1).replace('.', ',')} / 5` : '·', 'ROTI'],
              [ss.actionRate == null ? '·' : `${ss.actionRate} %`, 'Actions faites'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-card p-3 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
                <p className="font-display font-bold text-xl">{v}</p>
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
              </div>
            ))}
          </div>
          {success.criteria.length > 0 && (
            <ul className="grid gap-1.5">
              {success.criteria.map(c => (
                <li key={c.id} className="flex gap-2 text-body-sm">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 h-fit mt-0.5" style={{ backgroundColor: CRITERION_STATUS[c.status]?.color }}>{CRITERION_STATUS[c.status]?.label}</span>
                  <span>{c.statement}{c.indicator ? <span style={{ color: 'var(--color-text-muted)' }}> · {c.indicator}</span> : null}</span>
                </li>
              ))}
            </ul>
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
                <li key={a.key}>{a.left} / {a.right} : écart de {a.spread} points</li>
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
                <li key={a.key}>{a.left} / {a.right} : écart de {a.spread} points</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Le temps collectif conçu */}
      {days.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <h2 className="font-display text-lg font-bold">Le déroulé</h2>
            <span className="text-caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              {days.length} jour{days.length > 1 ? 's' : ''} · {fmtDur(days.reduce((a, d) => a + computeDay(d, blocks).planned, 0))}
            </span>
          </div>
          <div className="grid gap-4">
            {days.map((day, i) => {
              const c = computeDay(day, blocks);
              return (
                <div key={day.id} className="rounded-card elevation-1 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
                    <h3 className="text-body-sm font-semibold flex items-center gap-2">
                      <CalendarDays size={14} /> {dayLabel(day, i)}{day.date ? `, ${formatLongDate(day.date)}` : ''}
                    </h3>
                    <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{hm(c.start)} à {hm(Math.max(c.end, c.plannedEnd))}</span>
                  </div>
                  <div className="p-3">
                    {c.seqs.length === 0 && <p className="text-caption italic" style={{ color: 'var(--color-text-muted)' }}>Aucune séquence.</p>}
                    {c.seqs.map(s => (
                      <div key={s.id} className="flex gap-3 py-1.5 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="text-caption font-semibold w-14 shrink-0 tabular-nums">{hm(s.start)}</span>
                        <span className="w-1 rounded-full shrink-0" style={{ backgroundColor: s.kind === 'apport' ? '#F2C245' : s.kind === 'pause' ? 'var(--color-border)' : 'var(--color-ink)' }} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-body-sm ${s.kind === 'pause' ? 'uppercase tracking-wide text-caption' : 'font-semibold'}`} style={s.kind === 'pause' ? { color: 'var(--color-text-muted)' } : undefined}>
                            {s.title} <span className="font-normal text-caption" style={{ color: 'var(--color-text-muted)' }}>· {fmtDur(s.duration_minutes)}</span>
                          </p>
                          {s.intention && <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{s.intention}</p>}
                          {s.production && <p className="text-caption font-semibold">→ {s.production}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8 Axes recap */}
      {axesData.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <h2 className="font-display text-lg font-bold">Les 8 polarités</h2>
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
                      <span className="text-body-sm font-semibold">{axis.left} / {axis.right}</span>
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

      {/* Le détail du cadrage */}
      {phaseData.length > 0 && <h2 className="font-display font-bold text-[22px] mt-12 mb-6">Le détail du cadrage</h2>}
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

      {/* Footer */}
      <div className="text-center py-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
          Fiche générée le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} avec le cadrage Insuffle · insuffle.com
        </p>
      </div>
    </div>
  );
}
