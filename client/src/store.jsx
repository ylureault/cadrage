import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const StoreContext = createContext();

// Dark mode: read from localStorage or system preference
function getInitialDarkMode() {
  const stored = localStorage.getItem('insuffle-dark-mode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
}

const initialState = {
  // Connection
  pseudo: null,
  color: null,
  spaceId: null,
  connected: false,
  offline: false,

  // Space data
  space: null,
  cards: [],
  comments: [],
  axes: [],
  axesFinal: [],
  phaseStates: [],
  votes: [],
  participants: [],
  facilitators: [],

  // Planning (conception + agenda A4)
  planning: {},
  blocks: [],
  blockComments: [],
  agendaDays: [],
  planningHistory: [],
  planningFuture: [],
  sheetOverflow: [],
  liveFlash: null,

  // Mesure du succès
  success: { criteria: [], actions: [], votes: [], review: [], votesOpen: [], scaleQuestion: '' },

  // Canvas structure
  phases: [],
  axesDef: [],

  // UI state
  activePhase: 'avant',
  spotlight: null,
  timer: null,
  silentColumns: {},
  revealedColumns: {},
  searchQuery: '',
  showAxes: false,
  showActivity: false,
  showStats: false,
  showExport: false,
  showReperes: false,
  showInsuffle: false,
  darkMode: getInitialDarkMode(),
  isFacilitator: false,
  archived: false,
  welcomeMessage: '',
  notifications: [],
  focusZones: {},
  pendingCards: [],
  hiddenColumns: [],
};

function pickHeader(p) {
  const out = {};
  for (const k of ['client_name', 'sponsor', 'facilitator', 'session_date', 'session_date_end']) if (p[k] !== undefined) out[k] = p[k];
  return out;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PSEUDO': return { ...state, pseudo: action.pseudo, color: action.color };
    case 'SET_SPACE_ID': return { ...state, spaceId: action.spaceId };
    case 'SET_CONNECTED': return { ...state, connected: action.connected };
    case 'SET_OFFLINE': return { ...state, offline: action.offline };
    case 'SET_ARCHIVED': return { ...state, archived: action.archived };

    case 'LOAD_STRUCTURE': return { ...state, phases: action.phases, axesDef: action.axes };
    case 'LOAD_SPACE': {
      const d = action.data;
      return {
        ...state,
        space: d.space,
        cards: d.cards,
        comments: d.comments,
        axes: d.axes,
        axesFinal: d.axesFinal,
        phaseStates: d.phaseStates,
        votes: d.votes,
        planning: d.planning || {},
        blocks: d.blocks || [],
        blockComments: d.blockComments || [],
        agendaDays: d.agendaDays || [],
        success: d.success || initialState.success,
        facilitators: d.space.facilitator_ids || [],
        archived: !!d.space.archived,
        welcomeMessage: d.space.welcome_message || '',
        isFacilitator: (d.space.facilitator_ids || []).includes(state.pseudo),
        hiddenColumns: d.space.hidden_columns || [],
      };
    }

    case 'SET_PARTICIPANTS': return { ...state, participants: action.participants };
    case 'SET_FACILITATORS': {
      return { ...state, facilitators: action.facilitators, isFacilitator: action.facilitators.includes(state.pseudo) };
    }

    // Header
    case 'UPDATE_HEADER': return {
      ...state,
      space: state.space ? { ...state.space, [action.field]: action.value } : state.space
    };

    // Cards
    case 'ADD_CARD': return { ...state, cards: [...state.cards, action.card] };
    case 'UPDATE_CARD': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, content: action.content } : c)
    };
    case 'DELETE_CARD': return { ...state, cards: state.cards.filter(c => c.id !== action.cardId) };
    case 'MOVE_CARD': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId
        ? { ...c, phase: action.toPhase, column_key: action.toColumnKey, position: action.toPosition }
        : c)
    };
    case 'MARK_DISCUSS': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, marked_discuss: action.marked } : c)
    };
    case 'UPDATE_TAGS': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, tags: action.tags } : c)
    };
    case 'UPDATE_REACTIONS': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, reactions: action.reactions } : c)
    };
    case 'UPDATE_VOTES': return { ...state, votes: action.votes };

    // Comments
    case 'ADD_COMMENT': return { ...state, comments: [...state.comments, action.comment] };

    // Axes
    case 'UPDATE_AXIS': {
      const filtered = state.axes.filter(a => a.axis_key !== action.axisKey);
      return { ...state, axes: [...filtered, ...action.positions] };
    }
    case 'UPDATE_AXIS_FINAL': {
      const filtered = state.axesFinal.filter(a => a.axis_key !== action.axisKey);
      return { ...state, axesFinal: [...filtered, { axis_key: action.axisKey, position: action.position, space_id: state.spaceId }] };
    }
    case 'UPDATE_AXIS_LOCK': {
      return {
        ...state,
        axesFinal: state.axesFinal.map(a => a.axis_key === action.axisKey ? { ...a, locked: action.locked ? 1 : 0 } : a)
      };
    }

    // Planning : l'état complet arrive du serveur à chaque modification
    case 'PLANNING_SYNC': {
      // Ce que quelqu'un d'autre vient de changer s'illumine de sa couleur
      let liveFlash = state.liveFlash;
      if (action.by && action.by !== state.pseudo && action.blocks) {
        const before = new Map(state.blocks.map(b => [b.id, b]));
        const color = state.participants.find(p => p.pseudo === action.by)?.color || '#F2C245';
        const ids = {};
        for (const b of action.blocks) {
          const old = before.get(b.id);
          if (!old || old.title !== b.title || old.intention !== b.intention || old.format !== b.format || old.production !== b.production
            || old.duration_minutes !== b.duration_minutes || old.kind !== b.kind || old.day_id !== b.day_id) ids[b.id] = color;
        }
        if (!Object.keys(ids).length) {
          // Simple déplacement : on illumine la séquence qui a le plus bougé
          let best = null; let gap = 0;
          for (const b of action.blocks) {
            const old = before.get(b.id);
            if (old && Math.abs((old.position ?? 0) - (b.position ?? 0)) > gap) { gap = Math.abs(old.position - b.position); best = b.id; }
          }
          if (best) ids[best] = color;
        }
        if (Object.keys(ids).length) liveFlash = { ids, by: action.by, n: (state.liveFlash?.n || 0) + 1 };
      }
      return {
        ...state,
        planning: action.planning || state.planning,
        agendaDays: action.agendaDays || state.agendaDays,
        blocks: action.blocks || state.blocks,
        space: state.space && action.planning ? { ...state.space, ...pickHeader(action.planning) } : state.space,
        liveFlash,
      };
    }
    case 'PUSH_PLANNING_HISTORY': return {
      ...state,
      planningHistory: [...state.planningHistory.slice(-29), action.snapshot],
      planningFuture: [],
    };
    case 'POP_PLANNING_HISTORY': return {
      ...state,
      planningHistory: state.planningHistory.slice(0, -1),
      planningFuture: [...state.planningFuture, action.current],
    };
    case 'POP_PLANNING_FUTURE': return {
      ...state,
      planningFuture: state.planningFuture.slice(0, -1),
      planningHistory: [...state.planningHistory, action.current],
    };

    // Block comments
    case 'ADD_BLOCK_COMMENT': return { ...state, blockComments: [...state.blockComments, action.comment] };

    case 'SET_SHEET_OVERFLOW': return { ...state, sheetOverflow: action.ids };

    // Succès
    case 'SUCCESS_SYNC': return { ...state, success: action.success };

    // Phase states
    case 'UPDATE_PHASE_STATE': return {
      ...state,
      phaseStates: state.phaseStates.map(p => {
        if (p.phase !== action.phase) return p;
        return {
          ...p,
          ...(action.locked !== null ? { locked: !!action.locked } : {}),
          ...(action.hidden !== null ? { hidden: !!action.hidden } : {}),
        };
      })
    };

    // Timer
    case 'SET_TIMER': return { ...state, timer: action.timer };
    case 'CLEAR_TIMER': return { ...state, timer: null };

    // Spotlight
    case 'SET_SPOTLIGHT': return { ...state, spotlight: action.cardId };

    // Silent mode
    case 'SET_SILENT_MODE': return {
      ...state,
      silentColumns: { ...state.silentColumns, [action.columnKey]: action.active },
      revealedColumns: action.active ? { ...state.revealedColumns, [action.columnKey]: false } : state.revealedColumns,
    };
    case 'REVEAL_COLUMN': return {
      ...state,
      revealedColumns: { ...state.revealedColumns, [action.columnKey]: true },
      silentColumns: { ...state.silentColumns, [action.columnKey]: false }
    };

    // UI
    case 'SET_ACTIVE_PHASE': return { ...state, activePhase: action.phase };
    case 'SET_SEARCH': return { ...state, searchQuery: action.query };
    case 'TOGGLE_AXES': return { ...state, showAxes: !state.showAxes };
    case 'TOGGLE_ACTIVITY': return { ...state, showActivity: !state.showActivity };
    case 'TOGGLE_STATS': return { ...state, showStats: !state.showStats };
    case 'TOGGLE_EXPORT': return { ...state, showExport: !state.showExport };
    case 'TOGGLE_REPERES': return { ...state, showReperes: !state.showReperes };
    case 'TOGGLE_INSUFFLE': return { ...state, showInsuffle: !state.showInsuffle };
    case 'TOGGLE_DARK': return { ...state, darkMode: !state.darkMode };
    case 'SET_SPACE_ARCHIVED': return { ...state, archived: action.archived };
    case 'SET_WELCOME_MESSAGE': return { ...state, welcomeMessage: action.message };
    case 'UPDATE_SETTING': {
      const newSpace = state.space ? { ...state.space, [action.key]: action.value } : state.space;
      const extra = {};
      if (action.key === 'hidden_columns') extra.hiddenColumns = action.value;
      return { ...state, space: newSpace, ...extra };
    }
    case 'ADD_NOTIFICATION': return { ...state, notifications: [...state.notifications, { id: Date.now(), ...action.notification }] };
    case 'REMOVE_NOTIFICATION': return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) };
    case 'SET_FOCUS': return { ...state, focusZones: { ...state.focusZones, [action.pseudo]: action.columnKey } };

    default: return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply dark mode class on <html> and persist to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
    localStorage.setItem('insuffle-dark-mode', String(state.darkMode));
  }, [state.darkMode]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
