/**
 * Cloudflare Worker for GitHub OAuth token exchange.
 *
 * Deploy to api.agentstate.tech
 *
 * Required environment variables (set in Cloudflare Workers dashboard):
 *   GITHUB_CLIENT_ID     — GitHub OAuth App client ID
 *   GITHUB_CLIENT_SECRET — GitHub OAuth App client secret
 *
 * Setup:
 *   1. Register a GitHub OAuth App at https://github.com/settings/developers
 *      - Homepage URL: https://agentstate.tech
 *      - Callback URL: https://agentstate.tech
 *   2. Deploy this worker to Cloudflare Workers
 *   3. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET as secrets
 *   4. Route api.agentstate.tech/* to this worker
 *   5. Set GITHUB_CLIENT_ID in assembler.js
 *   6. Set OAUTH_WORKER_URL in assembler.js to https://api.agentstate.tech/oauth/token
 */

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://agentstate.tech',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/oauth/token' && request.method === 'POST') {
      try {
        const { code } = await request.json();

        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Missing code parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for access token
        const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: code,
          }),
        });

        const tokenData = await tokenResp.json();

        if (tokenData.error) {
          return new Response(
            JSON.stringify({ error: tokenData.error_description || tokenData.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ access_token: tokenData.access_token }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Internal error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
