import { useCallback, useMemo } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';

// Actions du planning. Chaque modification garde une photo de l'état d'avant : « Annuler » la rejoue.
export function usePlanning() {
  const { state, dispatch } = useStore();
  const archived = !!state.archived;

  const snapshot = useCallback(() => ({
    planning: state.planning,
    agendaDays: state.agendaDays,
    blocks: state.blocks,
  }), [state.planning, state.agendaDays, state.blocks]);

  const emit = useCallback((event, payload, { history = true } = {}) => {
    if (archived) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Cadrage archivé : lecture seule.', type: 'warning' } });
      return;
    }
    if (history) dispatch({ type: 'PUSH_PLANNING_HISTORY', snapshot: snapshot() });
    socket.emit(event, payload);
  }, [archived, dispatch, snapshot]);

  return useMemo(() => ({
    archived,
    canUndo: state.planningHistory.length > 0,
    canRedo: state.planningFuture.length > 0,

    setMeta: (fields, opts) => emit('planning:meta', { fields }, opts),

    addDay: (fields = {}) => emit('day:create', fields),
    updateDay: (dayId, fields, opts) => emit('day:update', { dayId, ...fields }, opts),
    deleteDay: (dayId, keepSequences = true) => emit('day:delete', { dayId, keepSequences }),
    moveDay: (dayId, toIndex) => emit('day:move', { dayId, toIndex }),
    duplicateDay: (dayId) => emit('day:duplicate', { dayId }),

    addSequence: (dayId, index, fields) => emit('seq:create', { dayId, index, fields }),
    updateSequence: (id, fields, opts) => emit('seq:update', { id, fields }, opts),
    deleteSequence: (id) => emit('seq:delete', { id }),
    moveSequence: (id, dayId, index) => emit('seq:move', { id, dayId, index }),
    duplicateSequence: (id) => emit('seq:duplicate', { id }),

    replaceAll: (data) => emit('planning:replace', { data }),
    applyTemplate: (templateId, mode = 'replace') => emit('planning:template-apply', { templateId, mode }),

    undo: () => {
      const prev = state.planningHistory[state.planningHistory.length - 1];
      if (!prev || archived) return;
      dispatch({ type: 'POP_PLANNING_HISTORY', current: snapshot() });
      socket.emit('planning:replace', { data: prev });
    },
    redo: () => {
      const next = state.planningFuture[state.planningFuture.length - 1];
      if (!next || archived) return;
      dispatch({ type: 'POP_PLANNING_FUTURE', current: snapshot() });
      socket.emit('planning:replace', { data: next });
    },
  }), [archived, emit, state.planningHistory, state.planningFuture, dispatch, snapshot]);
}
