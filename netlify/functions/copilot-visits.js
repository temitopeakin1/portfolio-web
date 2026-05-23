'use strict';

const { corsHeaders } = require('./lib/blog-http.cjs');
const { handleCopilotVisits } = require('./lib/copilot-visits-handlers.cjs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event, 'GET, POST, OPTIONS'), body: '' };
  }
  return handleCopilotVisits(event);
};
