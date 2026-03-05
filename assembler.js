/**
 * Agent State Assembler
 * Loads the collection, renders the selection grid, and assembles repos.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  const COLLECTION_URL =
    'https://raw.githubusercontent.com/caetanominuzzo/agentstate-awesome/main/collection.json';
  const GITHUB_CLIENT_ID = ''; // Set after registering OAuth App
  const OAUTH_WORKER_URL = ''; // e.g., https://api.agentstate.tech/oauth/token

  // ---------------------------------------------------------------------------
  // Icon mapping: Simple Icons slug for brand logos, emoji for the rest
  // CDN: https://cdn.simpleicons.org/{slug}/{hexcolor}
  // ---------------------------------------------------------------------------
  var SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org';

  // Local SVG icons (for brands not on Simple Icons)
  var LOCAL_ICONS = {
    'openai-integration': 'assets/openai.svg',
    'groq-integration':   'assets/groq.svg',
  };

  // Map item id → { slug, color } for Simple Icons brand logos
  var BRAND_ICONS = {
    // Existing (skills)
    'jira-integration':          { slug: 'jira',        color: '0052CC' },
    'notion-integration':        { slug: 'notion',      color: 'ffffff' },
    'telegram-notifications':    { slug: 'telegram',    color: '26A5E4' },
    'github-actions-templates':  { slug: 'githubactions', color: '2088FF' },
    'nodejs-backend-patterns':   { slug: 'nodedotjs',   color: '5FA04E' },
    'postgresql-table-design':   { slug: 'postgresql',  color: '4169E1' },
    'mermaid-diagrams':          { slug: 'mermaid',     color: 'FF3670' },

    // Tier 1 — notifications & email
    'discord-integration':                { slug: 'discord',          color: '5865F2' },
    'resend-integration':                 { slug: 'resend',           color: '000000' },

    // Tier 1 — code hosting & CI/CD
    'github-integration':                 { slug: 'github',           color: 'ffffff' },
    'github-actions-integration':         { slug: 'githubactions',    color: '2088FF' },
    'vercel-integration':                 { slug: 'vercel',           color: 'ffffff' },
    'netlify-integration':                { slug: 'netlify',          color: '00C7B7' },

    // Tier 1 — monitoring
    'sentry-integration':                 { slug: 'sentry',           color: '362D59' },
    'datadog-integration':                { slug: 'datadog',          color: '632CA6' },
    'pagerduty-integration':              { slug: 'pagerduty',        color: '06AC38' },

    // Tier 1 — project management
    'linear-integration':                 { slug: 'linear',           color: '5E6AD2' },

    // Tier 1 — analytics
    'posthog-integration':                { slug: 'posthog',          color: 'F54E00' },

    // Tier 1 — cloud & databases
    'cloudflare-integration':             { slug: 'cloudflare',       color: 'F38020' },
    'supabase-integration':               { slug: 'supabase',         color: '3FCF8E' },
    'upstash-integration':                { slug: 'upstash',          color: '00E9A3' },

    // Tier 1 — AI/ML
    'anthropic-integration':              { slug: 'anthropic',        color: 'ffffff' },

    // Tier 1 — finance
    'stripe-integration':                 { slug: 'stripe',           color: '635BFF' },

    // Tier 2 — code hosting
    'gitlab-integration':                 { slug: 'gitlab',           color: 'FC6D26' },
    'bitbucket-integration':              { slug: 'bitbucket',        color: '0052CC' },

    // Tier 2 — CI/CD
    'circleci-integration':               { slug: 'circleci',         color: '343434' },
    'railway-integration':                { slug: 'railway',          color: '0B0D0E' },
    'render-integration':                 { slug: 'render',           color: '46E3B7' },
    'fly-io-integration':                 { slug: 'flydotio',         color: '8B5CF6' },

    // Tier 2 — project management
    'asana-integration':                  { slug: 'asana',            color: 'F06A6A' },
    'trello-integration':                 { slug: 'trello',           color: '0052CC' },
    'clickup-integration':                { slug: 'clickup',          color: '7B68EE' },

    // Tier 2 — documentation
    'confluence-integration':             { slug: 'confluence',       color: '172B4D' },

    // Tier 2 — monitoring
    'grafana-integration':                { slug: 'grafana',          color: 'F46800' },
    'new-relic-integration':              { slug: 'newrelic',         color: '1CE783' },

    // Tier 2 — databases
    'redis-cli-integration':              { slug: 'redis',            color: 'FF4438' },
    'postgresql-cli-integration':         { slug: 'postgresql',       color: '4169E1' },
    'mongodb-cli-integration':            { slug: 'mongodb',          color: '47A248' },
    'mysql-cli-integration':              { slug: 'mysql',            color: '4479A1' },
    'elasticsearch-integration':          { slug: 'elasticsearch',    color: '005571' },
    'airtable-integration':               { slug: 'airtable',         color: '18BFFF' },

    // Tier 2 — CRM & support
    'hubspot-integration':                { slug: 'hubspot',          color: 'FF7A59' },
    'zendesk-integration':                { slug: 'zendesk',          color: '03363D' },

    // Tier 2 — email
    'mailgun-integration':                { slug: 'mailgun',          color: 'F06B66' },

    // Tier 2 — design
    'figma-integration':                  { slug: 'figma',            color: 'F24E1E' },

    // Tier 2 — AI/ML
    'google-gemini-integration':          { slug: 'googlegemini',     color: '8E75B2' },

    // Tier 2 — security
    'snyk-integration':                   { slug: 'snyk',             color: '4C4A73' },

    // Tier 2 — cloud
    'docker-hub-integration':             { slug: 'docker',           color: '2496ED' },

    // Tier 2 — auth & secrets
    'vault-integration':                  { slug: 'vault',            color: 'FFEC6E' },

    // Tier 2 — search
    'algolia-integration':                { slug: 'algolia',          color: '003DFF' },

    // Tier 2 — package registries
    'npm-registry-integration':            { slug: 'npm',              color: 'CB3837' },
    'pypi-integration':                   { slug: 'pypi',             color: '3775A9' },
  };

  // Map item id → { slug, color } for tech-tags based brand icons
  var TECH_BRAND_ICONS = {
    'python':     { slug: 'python',     color: '3776AB' },
    'javascript': { slug: 'javascript', color: 'F7DF1E' },
    'typescript': { slug: 'typescript', color: '3178C6' },
  };

  // Emoji icons for everything else, by item id
  var EMOJI_ICONS = {
    'devin-integration':            '\u{1F916}', // robot
    'api-design-principles':        '\u{1F50C}', // plug
    'architecture-patterns':        '\u{1F3D7}', // building construction
    'error-handling-patterns':      '\u26A0\uFE0F', // warning
    'database-schema-designer':     '\u{1F5C4}', // file cabinet
    'sql-optimization-patterns':    '\u26A1',     // lightning
    'c4-architecture':              '\u{1F4D0}', // triangular ruler
    'frontend-design':              '\u{1F3A8}', // palette
    'code-review-excellence':       '\u{1F441}', // eye
    'debugging-strategies':         '\u{1F50D}', // magnifying glass
    'e2e-testing-patterns':         '\u{1F9EA}', // test tube
    'javascript-testing-patterns':  '\u{1F9EA}', // test tube
    'webapp-testing':               '\u{1F9EA}', // test tube
    'brainstorming':                '\u{1F4A1}', // light bulb
    'executing-plans':              '\u25B6\uFE0F', // play
    'receiving-code-review':        '\u{1F4E5}', // inbox
    'requesting-code-review':       '\u{1F4E4}', // outbox
    'systematic-debugging':         '\u{1F41B}', // bug
    'test-driven-development':      '\u2705',     // check mark
    'verification-before-completion': '\u2714\uFE0F', // heavy check
    'writing-plans':                '\u{1F4DD}', // memo
    'agent-rules':                  '\u{1F4CF}', // straight ruler
    'developer-profiles':           '\u{1F465}', // busts in silhouette
    'glossary-template':            '\u{1F4D6}', // open book
    'organizational-context':       '\u{1F3E2}', // office building
    'semantic-search':              '\u{1F50E}', // magnifying glass right
    'analyst-mode':                 '\u{1F9E0}', // brain
    'deployment-guardrails':        '\u{1F6E1}', // shield
    'resource-limit-enforcement':   '\u23F1\uFE0F', // stopwatch
    'multi-layer-handoff':          '\u{1F500}', // shuffle
    'session-spawner':              '\u{1F504}', // counterclockwise
    // Skills without specific mappings get a default from subcategory
  };

  // Fallback emojis by subcategory
  var SUBCATEGORY_EMOJIS = {
    'backend':              '\u{1F5A5}', // desktop
    'database':             '\u{1F5C4}', // file cabinet
    'devops':               '\u2699\uFE0F', // gear
    'documentation':        '\u{1F4C4}', // page facing up
    'frontend':             '\u{1F3A8}', // palette
    'javascript':           '\u{1F7E8}', // yellow square
    'python':               '\u{1F40D}', // snake
    'quality':              '\u2728',     // sparkles
    'testing':              '\u{1F9EA}', // test tube
    'typescript':           '\u{1F535}', // blue circle
    'workflow':             '\u{1F504}', // counterclockwise
    'agent-platforms':      '\u{1F916}', // robot
    'project-management':   '\u{1F4CB}', // clipboard
    'notifications':        '\u{1F514}', // bell
    'principles':           '\u{1F4CF}', // straight ruler
    'templates':            '\u{1F4C3}', // page with curl
    'tooling':              '\u{1F527}', // wrench
    'reasoning':            '\u{1F9E0}', // brain
    'security':             '\u{1F512}', // lock
    'resource-management':  '\u23F1\uFE0F', // stopwatch
    'multi-agent':          '\u{1F500}', // shuffle
    'session-management':   '\u{1F504}', // counterclockwise
    'code-hosting':         '\u{1F4E6}', // package
    'ci-cd':                '\u{1F680}', // rocket
    'cloud-infrastructure': '\u2601\uFE0F', // cloud
    'databases':            '\u{1F5C4}', // file cabinet
    'monitoring':           '\u{1F4CA}', // bar chart
    'ai-ml':                '\u{1F9E0}', // brain
    'storage':              '\u{1F4BE}', // floppy disk
    'authentication':       '\u{1F512}', // lock
    'analytics':            '\u{1F4C8}', // chart increasing
    'crm-support':          '\u{1F4DE}', // telephone receiver
    'email':                '\u{1F4E7}', // email
    'design':               '\u{1F3A8}', // palette
    'finance':              '\u{1F4B3}', // credit card
    'search':               '\u{1F50D}', // magnifying glass
    'package-registries':   '\u{1F4E6}', // package
    'feature-flags':        '\u{1F6A9}', // flag
    'queues':               '\u{1F4E8}', // incoming envelope
    'api-tools':            '\u{1F527}', // wrench
    'dns':                  '\u{1F310}', // globe
    'cms':                  '\u{1F4DD}', // memo
    'automation':           '\u2699\uFE0F', // gear
    'containers':           '\u{1F4E6}', // package
    'utilities':            '\u{1F9F0}', // toolbox
    'calendar':             '\u{1F4C5}', // calendar
  };

  // Fallback emojis by category
  var CATEGORY_EMOJIS = {
    'skills':         '\u{1F4DA}', // books
    'integrations':   '\u{1F50C}', // plug
    'knowledge':      '\u{1F4D6}', // open book
    'modes':          '\u{1F3AD}', // performing arts
    'orchestration':  '\u{1F3BC}', // musical score
    'meta':           '\u{1F527}', // wrench
  };

  function getItemIcon(item) {
    // 0. Local SVG icons
    if (LOCAL_ICONS[item.id]) {
      return '<img class="card-icon" src="' + LOCAL_ICONS[item.id] + '" alt="" width="18" height="18">';
    }

    // 1. Brand logo via Simple Icons
    if (BRAND_ICONS[item.id]) {
      var b = BRAND_ICONS[item.id];
      return '<img class="card-icon" src="' + SIMPLE_ICONS_CDN + '/' + b.slug + '/' + b.color + '" alt="" width="18" height="18">';
    }

    // 2. Tech-tag based brand logo (first matching tech_tag)
    var techTags = item.tech_tags || [];
    for (var i = 0; i < techTags.length; i++) {
      if (TECH_BRAND_ICONS[techTags[i]]) {
        var t = TECH_BRAND_ICONS[techTags[i]];
        return '<img class="card-icon" src="' + SIMPLE_ICONS_CDN + '/' + t.slug + '/' + t.color + '" alt="" width="18" height="18">';
      }
    }

    // No icon for non-brand items — skip the slot entirely
    return '';
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let collection = null;
  const selectedIds = new Set();

  // ---------------------------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------------------------
  const grid = document.getElementById('assembler-grid');
  const countEl = document.getElementById('assembler-count');
  const envvarsEl = document.getElementById('assembler-envvars');
  const searchInput = document.getElementById('assembler-search');
  const btnZip = document.getElementById('btn-download-zip');
  const btnRepo = document.getElementById('btn-create-repo');
  const filterTabs = document.querySelector('.filter-tabs');

  // ---------------------------------------------------------------------------
  // Load collection
  // ---------------------------------------------------------------------------
  async function loadCollection() {
    try {
      const resp = await fetch(COLLECTION_URL);
      if (!resp.ok) throw new Error(resp.statusText);
      collection = await resp.json();
      var totalEl = document.getElementById('assembler-total');
      if (totalEl) totalEl.textContent = (collection.items || []).length + ' tools & integrations';
      renderFilterTabs();
      renderGrid();
    } catch (e) {
      grid.innerHTML =
        '<p class="assembler-error">Failed to load collection. <button onclick="loadCollection()">Retry</button></p>';
      console.error('Failed to load collection:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // Filter tabs
  // ---------------------------------------------------------------------------
  function renderFilterTabs() {
    var cats = collection.categories || [];
    // Preferred tab order — unlisted categories appear at the end
    var tabOrder = ['integrations', 'skills'];
    cats.sort(function (a, b) {
      var ia = tabOrder.indexOf(a.id);
      var ib = tabOrder.indexOf(b.id);
      if (ia === -1) ia = 999;
      if (ib === -1) ib = 999;
      return ia - ib || a.name.localeCompare(b.name);
    });
    // "All" tab is already in HTML
    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.className = 'filter-tab';
      btn.dataset.category = cat.id;
      btn.textContent = cat.name;
      filterTabs.appendChild(btn);
    });

    // Default to "integrations" tab if it exists, otherwise "all"
    var defaultTab = filterTabs.querySelector('.filter-tab[data-category="integrations"]');
    if (!defaultTab) defaultTab = filterTabs.querySelector('.filter-tab[data-category="all"]');
    if (defaultTab) defaultTab.classList.add('active');

    filterTabs.addEventListener('click', function (e) {
      if (!e.target.classList.contains('filter-tab')) return;
      filterTabs.querySelectorAll('.filter-tab').forEach(function (b) {
        b.classList.remove('active');
      });
      e.target.classList.add('active');
      renderGrid();
    });
  }

  // ---------------------------------------------------------------------------
  // Render grid
  // ---------------------------------------------------------------------------
  function renderGrid() {
    if (!collection) return;

    const activeTab = filterTabs.querySelector('.filter-tab.active');
    const catFilter = activeTab ? activeTab.dataset.category : 'all';
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    let items = collection.items || [];
    if (catFilter !== 'all') {
      items = items.filter(function (i) {
        return i.category === catFilter;
      });
    }
    if (query) {
      items = items.filter(function (i) {
        var haystack = (
          i.name +
          ' ' +
          i.description +
          ' ' +
          (i.tags || []).join(' ') +
          ' ' +
          (i.tech_tags || []).join(' ')
        ).toLowerCase();
        return haystack.indexOf(query) !== -1;
      });
    }

    // Group by category → subcategory
    var catMap = {};
    items.forEach(function (item) {
      var cat = item.category;
      if (!catMap[cat]) catMap[cat] = { noSub: [], subs: {} };
      var sub = item.subcategory || '';
      if (sub) {
        if (!catMap[cat].subs[sub]) catMap[cat].subs[sub] = [];
        catMap[cat].subs[sub].push(item);
      } else {
        catMap[cat].noSub.push(item);
      }
    });

    var html = '';
    var categoryNames = {};
    var categoryOrder = [];
    (collection.categories || []).forEach(function (c) {
      categoryNames[c.id] = c.name;
      categoryOrder.push(c.id);
    });

    var sortedCats = Object.keys(catMap).sort(function (a, b) {
      var ia = categoryOrder.indexOf(a);
      var ib = categoryOrder.indexOf(b);
      if (ia === -1) ia = 999;
      if (ib === -1) ib = 999;
      return ia - ib || a.localeCompare(b);
    });

    sortedCats.forEach(function (cat) {
      var group = catMap[cat];
      var catTitle = categoryNames[cat] || capitalize(cat);

      html += '<div class="assembler-category">';
      html += '<div class="assembler-category-header">';
      html += '<h3 class="assembler-category-title">' + escapeHtml(catTitle) + '</h3>';
      html += '<button class="select-all-btn" data-category="' + escapeHtml(cat) + '">Select all</button>';
      html += '</div>';
      html += '<div class="assembler-columns">';

      // Items without subcategory
      if (group.noSub.length > 0) {
        html += '<div class="assembler-subgroup">';
        group.noSub.sort(function (a, b) { return a.name.localeCompare(b.name); });
        group.noSub.forEach(function (item) { html += renderCard(item); });
        html += '</div>';
      }

      // Subcategory blocks
      var subKeys = Object.keys(group.subs).sort();
      subKeys.forEach(function (sub) {
        var subItems = group.subs[sub];
        subItems.sort(function (a, b) { return a.name.localeCompare(b.name); });
        html += '<div class="assembler-subgroup">';
        html += '<h4 class="assembler-subgroup-title">' + escapeHtml(sub.replace(/-/g, ' ')) + '</h4>';
        subItems.forEach(function (item) { html += renderCard(item); });
        html += '</div>';
      });

      html += '</div>';
      html += '</div>';
    });

    if (!html) {
      html = '<p class="assembler-empty">No items match your search.</p>';
    }

    grid.innerHTML = html;

    // Attach select-all handlers
    grid.querySelectorAll('.select-all-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.category;
        var catCards = grid.querySelectorAll('.assembler-category');
        catCards.forEach(function (section) {
          var header = section.querySelector('.select-all-btn');
          if (!header || header.dataset.category !== cat) return;
          var cards = section.querySelectorAll('.assembler-card');
          // If all are selected, deselect all; otherwise select all
          var allSelected = true;
          cards.forEach(function (c) {
            if (!selectedIds.has(c.dataset.id)) allSelected = false;
          });
          cards.forEach(function (c) {
            if (allSelected) {
              selectedIds.delete(c.dataset.id);
              c.classList.remove('selected');
            } else {
              selectedIds.add(c.dataset.id);
              c.classList.add('selected');
            }
          });
        });
        updateBar();
      });
    });

    // Attach card click handlers
    grid.querySelectorAll('.assembler-card').forEach(function (card) {
      // Info button toggles expand
      var infoBtn = card.querySelector('.card-info-btn');
      if (infoBtn) {
        infoBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          card.classList.toggle('expanded');
        });
      }
      // Mouseleave collapses
      card.addEventListener('mouseleave', function () {
        card.classList.remove('expanded');
      });
      // Card click toggles selection
      card.addEventListener('click', function () {
        toggleItem(card.dataset.id);
      });
    });
  }

  function renderCard(item) {
    var checked = selectedIds.has(item.id) ? ' selected' : '';
    var envCount = (item.env_vars || []).filter(function (v) {
      return typeof v === 'object' ? v.required !== false : true;
    }).length;
    var envBadge = envCount > 0 ? '<span class="card-env-badge">' + envCount + ' env' + '</span>' : '';
    var tags = (item.tech_tags || [])
      .concat(item.tags || [])
      .slice(0, 4)
      .map(function (t) {
        return '<span class="card-tag">' + escapeHtml(t) + '</span>';
      })
      .join('');

    var icon = getItemIcon(item);

    var envVarsList = (item.env_vars || []).map(function (v) {
      if (typeof v === 'object' && v.name) return v;
      if (typeof v === 'string') return { name: v, description: '', required: true };
      return null;
    }).filter(Boolean);

    var envHtml = '';
    if (envVarsList.length > 0) {
      envHtml = '<div class="card-envvars">';
      envVarsList.forEach(function (v) {
        var opt = v.required === false ? ' <span class="card-env-optional">(optional)</span>' : '';
        envHtml += '<div class="card-envvar"><code>' + escapeHtml(v.name) + '</code>' + opt + '</div>';
      });
      envHtml += '</div>';
    }

    return (
      '<div class="assembler-card' + checked + '" data-id="' + escapeHtml(item.id) + '">' +
      '<div class="card-row">' +
      '<span class="card-check" aria-hidden="true"></span>' +
      icon +
      '<span class="card-name">' + escapeHtml(item.name) + '</span>' +
      '<span class="card-row-right">' + envBadge + '<span class="card-info-btn" title="Details">?</span></span>' +
      '</div>' +
      '<div class="card-expand">' +
      '<p class="card-desc">' + escapeHtml(item.description) + '</p>' +
      envHtml +
      '<div class="card-tags">' + tags + '</div>' +
      '</div>' +
      '</div>'
    );
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------
  function toggleItem(id) {
    var wasSelected = selectedIds.has(id);
    var depsAdded = [];
    if (wasSelected) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
      // Auto-select dependencies
      var item = collection.items.find(function (i) { return i.id === id; });
      if (item && item.depends_on) {
        item.depends_on.forEach(function (dep) {
          if (!selectedIds.has(dep)) { selectedIds.add(dep); depsAdded.push(dep); }
        });
      }
    }
    // Update DOM directly instead of re-rendering
    var card = grid.querySelector('.assembler-card[data-id="' + id + '"]');
    if (card) card.classList.toggle('selected', !wasSelected);
    depsAdded.forEach(function (dep) {
      var depCard = grid.querySelector('.assembler-card[data-id="' + dep + '"]');
      if (depCard) depCard.classList.add('selected');
    });
    updateBar();
  }

  function getSelectedItems() {
    return collection.items.filter(function (i) {
      return selectedIds.has(i.id);
    });
  }

  function getRequiredEnvVars() {
    var vars = {};
    getSelectedItems().forEach(function (item) {
      (item.env_vars || []).forEach(function (v) {
        if (typeof v === 'object' && v.name) vars[v.name] = v;
        else if (typeof v === 'string') vars[v] = { name: v, description: '', required: true };
      });
    });
    return Object.values(vars);
  }

  function updateBar() {
    var count = selectedIds.size;
    countEl.textContent = count + ' selected';
    var envVars = getRequiredEnvVars();
    if (envVars.length > 0) {
      envvarsEl.textContent = envVars.length + ' env var' + (envVars.length > 1 ? 's' : '') + ' needed';
    } else {
      envvarsEl.textContent = '';
    }
    btnZip.disabled = count === 0;
  }

  // ---------------------------------------------------------------------------
  // Assembly — Hierarchical AGENTS.md generation
  // ---------------------------------------------------------------------------

  function generateRootAgentsMd(items) {
    var lines = [
      '# Agent State',
      '',
      'An open toolbox for AI agents — integrations, skills, and organizational knowledge.',
      'Plain Python scripts, versioned in Git. No protocols, no vendor lock-in.',
      '',
      '## Directory Guide',
      '',
    ];

    // Collect which top-level dirs exist
    var dirs = {};
    items.forEach(function (item) {
      (item.files || []).forEach(function (f) {
        var topDir = f.dest.split('/')[0];
        if (!dirs[topDir]) dirs[topDir] = [];
        dirs[topDir].push(item.name);
      });
    });

    var dirDescriptions = {
      scripts: 'Helper scripts and API integrations. Each subfolder has its own AGENTS.md.',
      skills: 'Curated procedural knowledge (skills) that guide agent behavior.',
      modes: 'Behavioral profiles that change how agents operate in a session.',
      orchestration: 'Multi-agent coordination templates and session management.',
      knowledge: 'Organizational knowledge — rules, glossary, domain context.',
      memory: 'Persistent organizational memory — developer profiles, system ownership.',
      context: 'High-level organizational context and team structure.',
      docs: 'Extended documentation and onboarding guides.',
      exchange: 'Small tracked artifacts for cross-session sharing.',
      workspace: 'Temporary files and scratch work (gitignored).',
    };

    // Always include base dirs
    ['scripts', 'skills', 'modes', 'orchestration', 'knowledge', 'memory', 'context', 'docs', 'exchange', 'workspace'].forEach(function (d) {
      if (dirs[d] || ['memory', 'context', 'docs', 'exchange', 'workspace'].indexOf(d) !== -1) {
        lines.push('- **' + d + '/** — ' + (dirDescriptions[d] || ''));
      }
    });

    lines.push('');
    lines.push('## Rules');
    lines.push('');
    lines.push('- Search before creating anything new');
    lines.push('- Commit frequently with conventional commit format');
    lines.push('- Scripts: non-interactive, JSON output, proper exit codes');
    lines.push('- Never commit secrets — use `.env` (gitignored)');
    lines.push('- Use scoped AGENTS.md per folder for navigation');
    lines.push('');

    return lines.join('\n');
  }

  function generateFolderAgentsMd(folderPath, items) {
    var folderName = folderPath.split('/').pop() || folderPath;
    var lines = ['# ' + capitalize(folderName.replace(/-/g, ' ')), ''];

    // Find items whose files land in this folder
    var folderItems = items.filter(function (item) {
      return (item.files || []).some(function (f) {
        return f.dest.indexOf(folderPath + '/') === 0 || f.dest.indexOf(folderPath) === 0;
      });
    });

    if (folderItems.length === 0) return null;

    // Group by subfolder
    var subs = {};
    folderItems.forEach(function (item) {
      (item.files || []).forEach(function (f) {
        if (f.dest.indexOf(folderPath + '/') !== 0) return;
        var relPath = f.dest.substring(folderPath.length + 1);
        var parts = relPath.split('/');
        if (parts.length > 1) {
          var sub = parts[0];
          if (!subs[sub]) subs[sub] = [];
          if (subs[sub].indexOf(item) === -1) subs[sub].push(item);
        }
      });
    });

    if (Object.keys(subs).length > 0) {
      lines.push('## Contents');
      lines.push('');
      Object.keys(subs).sort().forEach(function (sub) {
        subs[sub].forEach(function (item) {
          lines.push('- **' + sub + '/** — ' + item.name + ': ' + item.description.trim().split('\n')[0]);
          var envVars = (item.env_vars || []).filter(function (v) {
            return typeof v === 'object' ? v.required !== false : true;
          });
          if (envVars.length > 0) {
            var names = envVars.map(function (v) { return '`' + (v.name || v) + '`'; });
            lines.push('  - Env vars: ' + names.join(', '));
          }
        });
      });
    } else {
      lines.push('## Available');
      lines.push('');
      folderItems.forEach(function (item) {
        lines.push('- **' + item.name + '** — ' + item.description.trim().split('\n')[0]);
      });
    }

    lines.push('');
    return lines.join('\n');
  }

  function generateAllAgentsMdFiles(items) {
    var files = {};

    // Root AGENTS.md
    files['AGENTS.md'] = generateRootAgentsMd(items);

    // Collect all unique parent directories from dest paths
    var allDirs = {};
    items.forEach(function (item) {
      (item.files || []).forEach(function (f) {
        var parts = f.dest.split('/');
        // For each level of nesting, note the directory
        for (var i = 1; i < parts.length; i++) {
          var dir = parts.slice(0, i).join('/');
          allDirs[dir] = true;
        }
      });
    });

    // Generate AGENTS.md for each top-level and second-level directory
    Object.keys(allDirs).sort().forEach(function (dir) {
      var depth = dir.split('/').length;
      if (depth > 2) return; // Only top-level and one level deep
      var content = generateFolderAgentsMd(dir, items);
      if (content) {
        files[dir + '/AGENTS.md'] = content;
      }
    });

    return files;
  }

  // ---------------------------------------------------------------------------
  // Assembly — other generated files
  // ---------------------------------------------------------------------------

  function generateRequirementsTxt(items) {
    var deps = {};
    items.forEach(function (item) {
      (item.python_dependencies || []).forEach(function (dep) {
        var match = dep.match(/^([a-zA-Z0-9_-]+)(.*)/);
        if (match) {
          var pkg = match[1];
          var ver = match[2] || '';
          if (!deps[pkg] || ver > deps[pkg]) deps[pkg] = ver;
        }
      });
    });
    // Always include python-dotenv for .env loading
    if (!deps['python-dotenv']) deps['python-dotenv'] = '>=1.0.0';

    var lines = ['# Generated by Agent State Assembler', '# https://agentstate.tech', ''];
    Object.keys(deps).sort().forEach(function (pkg) {
      lines.push(pkg + deps[pkg]);
    });
    lines.push('');
    return lines.join('\n');
  }

  function generateEnvExample(items) {
    var vars = getRequiredEnvVars();
    if (vars.length === 0) return null;
    var lines = ['# Agent State Environment Variables', '# Copy to .env and fill in your values', ''];
    vars.forEach(function (v) {
      if (v.description) lines.push('# ' + v.description);
      lines.push(v.name + '=');
      lines.push('');
    });
    return lines.join('\n');
  }

  function generateSetupSh(items) {
    var vars = getRequiredEnvVars();
    if (vars.length === 0) return null;

    var lines = [
      '#!/bin/bash',
      '# Agent State Setup — Configure environment variables',
      '# Generated by https://agentstate.tech',
      '',
      'set -e',
      '',
      'ENV_FILE=".env"',
      '',
      'echo "Agent State Setup"',
      'echo "=================="',
      'echo ""',
      'echo "This will create a .env file with your API keys."',
      'echo "The .env file is gitignored and will not be committed."',
      'echo ""',
      '',
    ];

    vars.forEach(function (v) {
      var desc = v.description ? ' (' + v.description + ')' : '';
      lines.push('read -p "' + v.name + desc + ': " ' + v.name);
    });

    lines.push('');
    lines.push('cat > "$ENV_FILE" << EOF');
    lines.push('# Agent State Environment Configuration');
    lines.push('# Generated by setup.sh — DO NOT COMMIT THIS FILE');
    lines.push('');
    vars.forEach(function (v) {
      lines.push(v.name + '=${' + v.name + '}');
    });
    lines.push('EOF');
    lines.push('');
    lines.push('echo ""');
    lines.push('echo "Saved to .env"');
    lines.push('echo "Run: pip install -r requirements.txt"');
    lines.push('');

    return lines.join('\n');
  }

  function generateGitignore() {
    return [
      '# Environment',
      '.env',
      '.env.local',
      '.env.*',
      '',
      '# Python',
      '__pycache__/',
      '*.pyc',
      '*.pyo',
      '.venv/',
      'venv/',
      '',
      '# IDE',
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '',
      '# OS',
      '.DS_Store',
      'Thumbs.db',
      '',
      '# Workspace (temp files)',
      'workspace/*',
      '!workspace/.gitkeep',
      '',
      '# Search index cache',
      '.agentstate-index.json',
      '',
      '# Secrets',
      '*.key',
      '*.pem',
      'secrets/',
      '',
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // Assemble file tree
  // ---------------------------------------------------------------------------
  function assembleFileTree() {
    var items = getSelectedItems();
    var fileTree = {};

    // 1. Item files
    items.forEach(function (item) {
      (item.files || []).forEach(function (f) {
        if (f.content) {
          fileTree[f.dest] = f.content;
        }
      });
    });

    // 2. Hierarchical AGENTS.md files
    var agentsMdFiles = generateAllAgentsMdFiles(items);
    Object.keys(agentsMdFiles).forEach(function (path) {
      fileTree[path] = agentsMdFiles[path];
    });

    // 3. Generated config files
    fileTree['requirements.txt'] = generateRequirementsTxt(items);
    fileTree['.gitignore'] = generateGitignore();

    var envExample = generateEnvExample(items);
    if (envExample) fileTree['.env.example'] = envExample;

    var setupSh = generateSetupSh(items);
    if (setupSh) fileTree['setup.sh'] = setupSh;

    // 4. Always include structural dirs
    fileTree['exchange/.gitkeep'] = '';
    fileTree['workspace/.gitkeep'] = '';
    fileTree['docs/AGENTS.md'] = '# Documentation\n\nExtended documentation and onboarding guides.\n';
    if (!fileTree['context/organizational.md']) {
      fileTree['context/organizational.md'] = '# Organizational Context\n\n<!-- Fill in your organization details -->\n';
    }

    return fileTree;
  }

  // ---------------------------------------------------------------------------
  // Download ZIP
  // ---------------------------------------------------------------------------
  async function downloadZip() {
    if (typeof JSZip === 'undefined') {
      alert('JSZip not loaded. Please refresh and try again.');
      return;
    }

    btnZip.disabled = true;
    btnZip.textContent = 'Building...';

    try {
      var fileTree = assembleFileTree();
      var zip = new JSZip();
      var root = zip.folder('agentstate');

      Object.keys(fileTree).forEach(function (path) {
        root.file(path, fileTree[path]);
      });

      var blob = await zip.generateAsync({ type: 'blob' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'agentstate.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track as virtual pageview + event in GA
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', { page_path: '/download-zip', page_title: 'Download ZIP (' + selectedIds.size + ' items)' });
        gtag('event', 'download_zip', { event_category: 'assembler', value: selectedIds.size });
      }
    } catch (e) {
      console.error('ZIP generation failed:', e);
      alert('Failed to generate ZIP: ' + e.message);
    } finally {
      btnZip.disabled = false;
      btnZip.textContent = 'Download ZIP';
    }
  }

  // ---------------------------------------------------------------------------
  // GitHub OAuth + repo creation
  // ---------------------------------------------------------------------------
  function createGitHubRepo() {
    if (!GITHUB_CLIENT_ID) {
      alert(
        'GitHub integration is not configured yet.\nUse "Download ZIP" for now, or check back soon.'
      );
      return;
    }

    // Store selection in sessionStorage for post-redirect
    sessionStorage.setItem('agentstate_selected', JSON.stringify(Array.from(selectedIds)));

    var redirectUri = window.location.origin + window.location.pathname;
    var scope = 'repo';
    var authUrl =
      'https://github.com/login/oauth/authorize' +
      '?client_id=' + encodeURIComponent(GITHUB_CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=' + encodeURIComponent(scope) +
      '&state=agentstate';

    window.location.href = authUrl;
  }

  async function handleOAuthCallback() {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');
    var state = params.get('state');

    if (!code || state !== 'agentstate') return false;

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);

    // Restore selection
    var saved = sessionStorage.getItem('agentstate_selected');
    if (saved) {
      JSON.parse(saved).forEach(function (id) { selectedIds.add(id); });
      sessionStorage.removeItem('agentstate_selected');
    }

    // Exchange code for token
    try {
      var resp = await fetch(OAUTH_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code }),
      });
      var data = await resp.json();
      if (!data.access_token) throw new Error(data.error || 'No token received');

      await pushToGitHub(data.access_token);
    } catch (e) {
      alert('GitHub authentication failed: ' + e.message);
    }

    return true;
  }

  async function pushToGitHub(token) {
    var repoName = prompt('Repository name:', 'agentstate');
    if (!repoName) return;

    var isPrivate = confirm('Make the repository private?\n\nOK = Private\nCancel = Public');

    btnRepo.disabled = true;
    btnRepo.textContent = 'Creating...';

    try {
      var headers = {
        Authorization: 'token ' + token,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      // Create repo
      var createResp = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          name: repoName,
          description: 'Agent State — Persistent tooling ecosystem for AI agents',
          private: isPrivate,
          auto_init: false,
        }),
      });

      if (!createResp.ok) {
        var err = await createResp.json();
        throw new Error(err.message || 'Failed to create repo');
      }

      var repo = await createResp.json();
      var fullName = repo.full_name;

      // Build file tree
      var fileTree = assembleFileTree();

      // Create files via Contents API (one by one — simpler than tree API)
      var paths = Object.keys(fileTree);
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var content = fileTree[path];
        await fetch('https://api.github.com/repos/' + fullName + '/contents/' + path, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            message: 'Add ' + path,
            content: btoa(unescape(encodeURIComponent(content))),
          }),
        });
      }

      alert('Repository created!\n\n' + repo.html_url);
      window.open(repo.html_url, '_blank');
    } catch (e) {
      alert('Failed to create repo: ' + e.message);
    } finally {
      btnRepo.disabled = false;
      btnRepo.textContent = 'Create GitHub Repo';
    }
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  var _escapeEl = document.createElement('div');
  function escapeHtml(str) {
    _escapeEl.textContent = str;
    return _escapeEl.innerHTML;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener('input', debounce(renderGrid, 200));
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  if (btnZip) btnZip.addEventListener('click', downloadZip);
  if (btnRepo) btnRepo.addEventListener('click', createGitHubRepo);

  // Check for OAuth callback first
  handleOAuthCallback().then(function (wasCallback) {
    loadCollection().then(function () {
      if (wasCallback) {
        updateBar();
        renderGrid();
      }
    });
  });
})();
