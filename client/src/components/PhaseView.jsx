import { useStore } from '../store.jsx';
import ColumnView from './ColumnView.jsx';
import { Lock } from 'lucide-react';

/* Jony Ive : chaque phase a sa couleur de fond, comme le canvas papier.
   Ça structure visuellement sans surcharger. */
export default function PhaseView({ phase }) {
  const { state } = useStore();
  const ps = state.phaseStates.find(p => p.phase === phase.key);
  const hiddenCols = state.hiddenColumns || [];

  // Filter visible columns (facilitator always sees all, with opacity)
  const visibleColumns = state.isFacilitator
    ? phase.columns
    : phase.columns.filter(col => !hiddenCols.includes(col.key));

  if (visibleColumns.length === 0 && !state.isFacilitator) return null;

  return (
    <div className="animate-fade-in"
      id={`phase-${phase.key}`}
      role="tabpanel"
      aria-label={phase.name}
      style={{ backgroundColor: phase.bgColor || 'transparent' }}>

      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Phase header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: phase.color }} />
          <div>
            <h2 className="font-display text-h2-mobile md:text-h2 flex items-center gap-2" style={{ color: phase.color }}>
              {!!ps?.locked && <Lock size={16} style={{ color: 'var(--color-text-muted)' }} />}
              {phase.name}
            </h2>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{phase.description}</p>
          </div>
          {!!ps?.locked && (
            <span className="text-label px-3 py-1 rounded-tag"
              style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              Phase verrouillée par le facilitateur
            </span>
          )}
        </div>

        {/* Responsive grid */}
        <div className={`grid gap-4 md:gap-6 ${
          visibleColumns.length === 1 ? 'grid-cols-1 max-w-xl' :
          visibleColumns.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          visibleColumns.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {visibleColumns.map(col => (
            <div key={col.key} className={hiddenCols.includes(col.key) ? 'opacity-40' : ''}>
              <ColumnView column={col} phase={phase} locked={!!ps?.locked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
