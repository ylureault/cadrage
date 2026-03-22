import { useStore } from '../store.jsx';

export default function ParticipantsBar() {
  const { state } = useStore();

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-1.5">
      <div className="max-w-[1600px] mx-auto flex items-center gap-2">
        <span className="text-xs text-gray-400">{state.participants.length} en ligne</span>
        <div className="flex -space-x-1">
          {state.participants.map(p => (
            <div key={p.pseudo}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              style={{ backgroundColor: p.color }}
              title={p.pseudo}>
              {p.pseudo[0]?.toUpperCase()}
            </div>
          ))}
        </div>
        {state.isFacilitator && (
          <span className="text-xs text-insuffle-gold font-medium ml-2">Mode facilitateur actif</span>
        )}
      </div>
    </div>
  );
}
