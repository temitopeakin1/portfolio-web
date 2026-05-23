'use strict';

const { corsHeaders, jsonResponse } = require('./blog-http.cjs');
const {
  initBlobsFromEvent,
  getVisitCount,
  incrementVisitCount,
} = require('./copilot-visits-store.cjs');

async function handleCopilotVisits(event) {
  initBlobsFromEvent(event);

  try {
    if (event.httpMethod === 'GET') {
      const count = await getVisitCount();
      return jsonResponse(event, 200, { count });
    }

    if (event.httpMethod === 'POST') {
      const count = await incrementVisitCount();
      return jsonResponse(event, 200, { count });
    }

    return {
      statusCode: 405,
      headers: { ...corsHeaders(event, 'GET, POST, OPTIONS'), 'Content-Type': 'text/plain' },
      body: 'Method Not Allowed',
    };
  } catch (err) {
    console.error('[copilot-visits]', err?.message || err);
    return jsonResponse(event, 500, {
      error: err?.message || 'Could not update visit counter',
    });
  }
}

module.exports = { handleCopilotVisits };
