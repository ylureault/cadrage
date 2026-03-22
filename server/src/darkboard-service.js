/**
 * Service d'intégration DarkBoard — appels API vers darkboard.insuffle.com
 * Permet de créer un board lié au cadrage et d'y pré-remplir les éléments.
 */

const DARKBOARD_BASE_URL = process.env.DARKBOARD_URL || 'https://darkboard.insuffle.com';

// Mapping cadrage format → DarkBoard template
const TEMPLATE_MAP = {
  brainstorming: 'Brainstorming',
  retrospective: 'Retrospective',
  prioritisation: 'Matrix 2×2',
  kanban: 'Kanban',
  exploration: 'Mind Map',
  diagnostic: 'SWOT',
  planning: 'Timeline',
  parcours: 'User Journey',
};

/**
 * Create a DarkBoard linked to a cadrage space.
 * @param {string} spaceId - The cadrage space ID
 * @param {object} spaceData - Space metadata (client_name, facilitator, etc.)
 * @param {object} options - { template, prefill }
 * @returns {Promise<{boardId, boardUrl, templateApplied, elementsCreated}>}
 */
export async function createLinkedBoard(spaceId, spaceData, options = {}) {
  const boardId = `cadrage-${spaceId}`;
  const template = options.template || 'brainstorming';
  const prefill = options.prefill !== false;

  // Step 1: Create the board on DarkBoard
  const createRes = await fetch(`${DARKBOARD_BASE_URL}/api/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: boardId }),
  });

  if (!createRes.ok && createRes.status !== 409) {
    throw new Error(`DarkBoard API error: ${createRes.status} ${await createRes.text()}`);
  }

  // Step 2: If prefill, inject context elements from cadrage
  let elementsCreated = 0;
  if (prefill && spaceData) {
    const operations = buildPrefillOperations(spaceData, template);
    elementsCreated = operations.length;

    if (operations.length > 0) {
      const updateRes = await fetch(`${DARKBOARD_BASE_URL}/api/board/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations }),
      });

      if (!updateRes.ok) {
        console.error('DarkBoard prefill failed:', await updateRes.text());
        // Non-blocking: board is created even if prefill fails
      }
    }
  }

  const boardUrl = `${DARKBOARD_BASE_URL}/board/${boardId}`;

  return {
    boardId,
    boardUrl,
    templateApplied: TEMPLATE_MAP[template] || template,
    elementsCreated,
  };
}

/**
 * Build prefill operations from cadrage space data.
 * Elements are positioned above the working area (negative Y) to not interfere.
 */
function buildPrefillOperations(spaceData, template) {
  const ops = [];
  let yOffset = -400;

  // Title
  if (spaceData.client_name) {
    ops.push({
      type: 'add',
      element: {
        type: 'text',
        x: 100,
        y: yOffset,
        width: 600,
        height: 60,
        text: spaceData.client_name,
        fontSize: 36,
        fontWeight: 'bold',
        locked: true,
      },
    });
    yOffset += 80;
  }

  // Facilitator info
  if (spaceData.facilitator) {
    ops.push({
      type: 'add',
      element: {
        type: 'text',
        x: 100,
        y: yOffset,
        width: 400,
        height: 30,
        text: `Facilitateur : ${spaceData.facilitator}`,
        fontSize: 16,
        color: '#888888',
        locked: true,
      },
    });
    yOffset += 50;
  }

  // Session date
  if (spaceData.session_date) {
    ops.push({
      type: 'add',
      element: {
        type: 'text',
        x: 100,
        y: yOffset,
        width: 400,
        height: 30,
        text: `Date : ${spaceData.session_date}`,
        fontSize: 16,
        color: '#888888',
        locked: true,
      },
    });
    yOffset += 80;
  }

  // Cards grouped by phase as context stickies
  if (spaceData.cards && spaceData.cards.length > 0) {
    // Group by phase
    const byPhase = {};
    for (const card of spaceData.cards) {
      if (!byPhase[card.phase]) byPhase[card.phase] = [];
      byPhase[card.phase].push(card);
    }

    const phaseColors = {
      avant: '#3498db',         // blue
      pendant_facilitation: '#2ecc71', // green
      pendant_risques: '#e74c3c',     // red
      conclusion: '#f39c12',          // orange
    };

    let xOffset = 100;
    for (const [phase, cards] of Object.entries(byPhase)) {
      // Phase header
      ops.push({
        type: 'add',
        element: {
          type: 'text',
          x: xOffset,
          y: yOffset,
          width: 250,
          height: 30,
          text: phase.toUpperCase().replace(/_/g, ' '),
          fontSize: 18,
          fontWeight: 'bold',
          color: phaseColors[phase] || '#ffffff',
          locked: true,
        },
      });

      let cardY = yOffset + 40;
      for (const card of cards.slice(0, 10)) { // Max 10 cards per phase
        ops.push({
          type: 'add',
          element: {
            type: 'sticky',
            x: xOffset,
            y: cardY,
            width: 220,
            height: 120,
            text: card.content,
            color: phaseColors[phase] || '#ffde59',
            locked: true,
          },
        });
        cardY += 140;
      }
      xOffset += 280;
    }
  }

  return ops;
}

/**
 * Get embed URL for iframe integration
 */
export function getEmbedUrl(spaceId, options = {}) {
  const boardId = `cadrage-${spaceId}`;
  const params = new URLSearchParams({
    source: 'cadrage',
    session: spaceId,
    embed: 'true',
    toolbar: options.toolbar || 'full',
    theme: options.theme || 'dark',
  });
  return `${DARKBOARD_BASE_URL}/board/${boardId}?${params}`;
}

/**
 * Check if a board exists for this cadrage
 */
export async function checkBoardExists(spaceId) {
  const boardId = `cadrage-${spaceId}`;
  try {
    const res = await fetch(`${DARKBOARD_BASE_URL}/api/board/${boardId}`);
    return res.ok;
  } catch {
    return false;
  }
}

export { DARKBOARD_BASE_URL, TEMPLATE_MAP };
