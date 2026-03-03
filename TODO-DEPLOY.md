# Deployment Steps

## 1. Register GitHub OAuth App
- Go to https://github.com/settings/developers
- New OAuth App
  - Application name: Agent State Assembler
  - Homepage URL: https://agentstate.tech
  - Authorization callback URL: https://agentstate.tech
- Copy the Client ID and generate a Client Secret

## 2. Deploy Cloudflare Worker
- Create a Cloudflare Workers project with `worker.js`
- Set environment secrets:
  - `GITHUB_CLIENT_ID` — from step 1
  - `GITHUB_CLIENT_SECRET` — from step 1
- Route `api.agentstate.tech/*` to the worker
- Verify: `curl -X OPTIONS https://api.agentstate.tech/oauth/token` should return CORS headers

## 3. Configure assembler.js
- Set `GITHUB_CLIENT_ID` to the value from step 1
- Set `OAUTH_WORKER_URL` to `https://api.agentstate.tech/oauth/token`

## 4. Push agentstate-site
- Commit and push changes to deploy via GitHub Pages
- Verify the assembler section loads collection.json and renders the grid

## 5. Populate real skill content
- Run `python scripts/sync-upstream.py` in agentstate-awesome to fetch actual SKILL.md files from upstream repos
- Commit and push updated skills + rebuilt collection.json

## 6. Commit modified manifests in agentstate-awesome
- 10 skill manifests have minor edits (trailing newline removals)
- Stage, commit, and push
