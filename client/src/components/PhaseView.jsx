import { useStore } from '../store.jsx';
import ColumnView from './ColumnView.jsx';

export default function PhaseView({ phase }) {
  const { state } = useStore();
  const ps = state.phaseStates.find(p => p.phase === phase.key);

  return (
    <div className="max-w-[1600px] mx-auto p-4">
      {/* Phase header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: phase.color }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: phase.color }}>
            {ps?.locked ? '🔒 ' : ''}{phase.name}
          </h2>
          <p className="text-xs text-gray-500">{phase.description}</p>
        </div>
        {ps?.locked && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Phase verrouillée par le facilitateur</span>
        )}
      </div>

      {/* Columns grid */}
      <div className={`grid gap-4 ${
        phase.columns.length === 1 ? 'grid-cols-1 max-w-xl' :
        phase.columns.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        phase.columns.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {phase.columns.map(col => (
          <ColumnView key={col.key} column={col} phase={phase} locked={!!ps?.locked} />
        ))}
      </div>
    </div>
  );
}
