import { useState, useMemo } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import { X, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';

const AXES_QUESTIONS = {
  decider_murir: ['Le groupe a-t-il le pouvoir de décider, ou seulement de recommander ?', 'Qui valide les décisions après l\'atelier ?', 'Le sujet est-il assez mûr pour décider, ou faut-il d\'abord explorer ?'],
  agir_cap: ['Cherche-t-on à construire une vision commune ou à aligner derrière une vision existante ?', 'Le leader doit-il co-construire ou fixer le cap ?'],
  cadre_autonomie: ['Le groupe est-il mature pour s\'auto-organiser ?', 'Y a-t-il des sujets interdits ?'],
  produire_explorer: ['Faut-il sortir avec un plan d\'action chiffré ou des pistes ouvertes ?'],
  contenu_processus: ['Le problème est-il un problème de fond ou de fonctionnement ?'],
  recul_action: ['Y a-t-il urgence à agir ou urgence à comprendre ?'],
  ouvert_cible: ['L\'agenda est-il fixé ou peut-on accueillir ce qui émerge ?'],
  serieux_ludique: ['La culture de l\'entreprise tolère-t-elle le décalage ?'],
};

function AxisSlider({ axis }) {
  const { state } = useStore();
  const [showDetail, setShowDetail] = useState(false);
  const [explanation, setExplanation] = useState('');

  const positions = state.axes.filter(a => a.axis_key === axis.key);
  const myPos = positions.find(p => p.pseudo === state.pseudo);
  const finalAxis = state.axesFinal.find(a => a.axis_key === axis.key);
  const isLocked = !!finalAxis?.locked;

  // Stats
  const allPositions = positions.filter(p => p.position != null).map(p => p.position);
  const avg = allPositions.length > 0 ? allPositions.reduce((a, b) => a + b, 0) / allPositions.length : null;
  const spread = allPositions.length > 1 ? Math.max(...allPositions) - Math.min(...allPositions) : 0;
  const dispLabel = spread >= 3 ? 'Divergence forte' : spread >= 2 ? 'Écart modéré' : allPositions.length > 0 ? 'Aligné' : '';
  const dispColor = spread >= 3 ? 'text-red-500' : spread >= 2 ? 'text-orange-500' : 'text-green-500';

  function setPosition(pos) {
    if (isLocked || state.archived) return;
    socket.emit('set-axis-position', { axisKey: axis.key, position: pos, explanation });
  }

  function lockAxis() {
    socket.emit('lock-axis', { axisKey: axis.key, locked: !isLocked });
  }

  function setFinal(pos) {
    socket.emit('set-axis-final', { axisKey: axis.key, position: pos });
  }

  return (
    <div className={`p-3 rounded-lg border ${isLocked ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'} ${spread >= 3 ? 'ring-1 ring-red-200' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setShowDetail(!showDetail)} className="flex items-center gap-1 text-sm font-medium hover:text-insuffle-blue">
          {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {axis.left} / {axis.right}
        </button>
        <div className="flex items-center gap-2">
          {dispLabel && <span className={`text-xs font-medium ${dispColor}`}>{dispLabel}</span>}
          {isLocked && <Lock size={14} className="text-gray-400" />}
          {state.isFacilitator && (
            <button onClick={lockAxis} className="p-0.5 hover:bg-gray-100 rounded">
              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-gray-500 w-24 text-right shrink-0">{axis.left}</span>
        <div className="flex-1 flex items-center justify-between px-2 relative">
          {/* Track */}
          <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2" />
          {/* Positions */}
          {[1, 2, 3, 4, 5].map(pos => {
            const posParticipants = positions.filter(p => p.position === pos);
            const isMyPos = myPos?.position === pos;
            const isFinalPos = finalAxis?.position === pos;
            return (
              <button key={pos} onClick={() => setPosition(pos)}
                className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
                  ${isMyPos ? 'border-insuffle-gold bg-insuffle-gold text-insuffle-dark scale-110' :
                    isFinalPos ? 'border-insuffle-gold bg-insuffle-gold/30' :
                    'border-insuffle-dark bg-white hover:border-insuffle-blue'}
                  ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className="text-[10px] font-bold">{pos}</span>
                {/* Participant dots */}
                {posParticipants.length > 0 && (
                  <div className="absolute -bottom-3 flex -space-x-1">
                    {posParticipants.slice(0, 5).map(p => (
                      <div key={p.pseudo} className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: p.color }} title={p.pseudo} />
                    ))}
                    {posParticipants.length > 5 && <span className="text-[8px] ml-0.5">+{posParticipants.length - 5}</span>}
                  </div>
                )}
              </button>
            );
          })}
          {/* Average marker */}
          {avg !== null && (
            <div className="absolute top-1/2 -translate-y-1/2 w-0 h-0"
              style={{ left: `calc(${((avg - 1) / 4) * 100}% + 8px)` }}>
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-insuffle-blue -translate-x-1/2 -translate-y-3" title={`Moyenne: ${avg.toFixed(1)}`} />
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 w-24 shrink-0">{axis.right}</span>
      </div>

      {/* Respondents count */}
      <div className="text-xs text-gray-400 text-center">{allPositions.length} répondant{allPositions.length !== 1 ? 's' : ''}</div>

      {/* Detail panel */}
      {showDetail && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {/* Questions */}
          {AXES_QUESTIONS[axis.key]?.map((q, i) => (
            <p key={i} className="text-xs italic text-gray-400">• {q}</p>
          ))}

          {/* Explanation */}
          {!isLocked && !state.archived && (
            <div>
              <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
                placeholder="Expliquer mon choix..."
                className="input-field w-full text-xs resize-none" rows={2} />
            </div>
          )}

          {/* Facilitator: set final position */}
          {state.isFacilitator && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Position finale :</span>
              {[1, 2, 3, 4, 5].map(p => (
                <button key={p} onClick={() => setFinal(p)}
                  className={`w-6 h-6 rounded-full text-xs font-bold ${finalAxis?.position === p ? 'bg-insuffle-gold text-insuffle-dark' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Individual positions */}
          <div className="space-y-1">
            {positions.filter(p => p.position != null).map(p => (
              <div key={p.pseudo} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-medium">{p.pseudo}</span>
                <span className="text-gray-400">Position {p.position}</span>
                {p.explanation && <span className="text-gray-500 italic">— {p.explanation}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AxesPanel() {
  const { state, dispatch } = useStore();

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[450px] max-w-[90vw] bg-white card-shadow z-40 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold text-lg">8 axes de positionnement</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_AXES' })} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-gray-500 mb-2">Positionnez votre curseur sur chaque axe pour exprimer votre lecture du cadrage. Méthode Insuffle.</p>
        {state.axesDef.map(axis => (
          <AxisSlider key={axis.key} axis={axis} />
        ))}
      </div>
    </div>
  );
}
