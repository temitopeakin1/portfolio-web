'use strict';
const { corsHeaders } = require('./lib/blog-http.cjs');
const { handleAdminBlog } = require('./lib/blog-handlers.cjs');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(event), body: '' };
  return handleAdminBlog(event);
};
