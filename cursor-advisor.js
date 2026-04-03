/* ==========================================================================
   Cursor Model Advisor — JavaScript
   Model data is loaded dynamically from models.json (committed weekly by
   GitHub Actions). Falls back to the hardcoded MODEL_DATA array if the
   JSON file is unavailable (first deploy, offline, etc.).
   ========================================================================== */

(function () {
  'use strict';

  // ── Theme Toggle ──────────────────────────────────────────────────────────
  const html     = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const saved    = localStorage.getItem('theme');

  if (saved === 'light') {
    html.classList.add('light-theme');
  } else if (!saved && window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.classList.add('light-theme');
  }

  if (themeBtn) {
    if (html.classList.contains('light-theme')) {
      themeBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
    themeBtn.addEventListener('click', () => {
      const isLight = html.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  // ── Sticky Header ─────────────────────────────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-sticky', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Static Model Data (last updated 2026-04-02) ───────────────────────────
  // Fields: name, displayName, tier, inPrice, outPrice, requestPrice,
  //         isMaxOnly, isDailyDriver, isHidden, intelligenceTier, provider
  const FALLBACK_DATE = '2026-04-02';

  const MODEL_DATA = [
    // ── Daily drivers (request-pool, req >= 1) ────────────────────────────
    { name: 'claude-sonnet-4',          displayName: 'Claude 4 Sonnet',            tier: 'daily_driver', inPrice: 3.0,  outPrice: 15.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-haiku-4-5',         displayName: 'Claude 4.5 Haiku',           tier: 'daily_driver', inPrice: 1.0,  outPrice: 5.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'Anthropic' },
    { name: 'claude-sonnet-4-1m',       displayName: 'Claude 4 Sonnet 1M',         tier: 'daily_driver', inPrice: 6.0,  outPrice: 22.5,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'gemini-3.1-pro',           displayName: 'Gemini 3.1 Pro',             tier: 'daily_driver', inPrice: 2.0,  outPrice: 12.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: false, intelligenceTier: 'frontier', provider: 'Google' },
    { name: 'gemini-3-pro',             displayName: 'Gemini 3 Pro',               tier: 'daily_driver', inPrice: 2.0,  outPrice: 12.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Google' },
    { name: 'gemini-3-flash',           displayName: 'Gemini 3 Flash',             tier: 'daily_driver', inPrice: 0.5,  outPrice: 3.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'Google' },
    { name: 'gemini-3-pro-image-preview', displayName: 'Gemini 3 Pro Image Preview', tier: 'daily_driver', inPrice: 2.0, outPrice: 12.0, requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Google' },
    { name: 'gemini-2.5-flash',         displayName: 'Gemini 2.5 Flash',           tier: 'daily_driver', inPrice: 0.3,  outPrice: 2.5,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'Google' },
    { name: 'gpt-5.1',                  displayName: 'GPT-5',                      tier: 'daily_driver', inPrice: 1.25, outPrice: 10.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5-codex',              displayName: 'GPT-5-Codex',                tier: 'daily_driver', inPrice: 1.25, outPrice: 10.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5-mini',               displayName: 'GPT-5 Mini',                 tier: 'daily_driver', inPrice: 0.25, outPrice: 2.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'OpenAI' },
    { name: 'gpt-5-fast',               displayName: 'GPT-5 Fast',                 tier: 'daily_driver', inPrice: 2.5,  outPrice: 20.0,  requestPrice: 0.08, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5.2',                  displayName: 'GPT-5.2',                    tier: 'daily_driver', inPrice: 1.75, outPrice: 14.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5.2-codex',            displayName: 'GPT-5.2 Codex',              tier: 'daily_driver', inPrice: 1.75, outPrice: 14.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5.4-mini',             displayName: 'GPT-5.4 Mini',               tier: 'daily_driver', inPrice: 0.75, outPrice: 4.5,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5.4-nano',             displayName: 'GPT-5.4 Nano',               tier: 'daily_driver', inPrice: 0.2,  outPrice: 1.25,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'OpenAI' },
    { name: 'gpt-5.1-codex',            displayName: 'GPT-5.1 Codex',              tier: 'daily_driver', inPrice: 1.25, outPrice: 10.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'gpt-5.1-codex-mini',       displayName: 'GPT-5.1 Codex Mini',         tier: 'daily_driver', inPrice: 0.25, outPrice: 2.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'OpenAI' },
    { name: 'gpt-5.1-codex-max',        displayName: 'GPT-5.1 Codex Max',          tier: 'daily_driver', inPrice: 1.25, outPrice: 10.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'OpenAI' },
    { name: 'grok-4-20',                displayName: 'Grok 4.20',                  tier: 'daily_driver', inPrice: 2.0,  outPrice: 6.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: false, intelligenceTier: 'high',     provider: 'xAI' },
    { name: 'kimi-k2.5',                displayName: 'Kimi K2.5',                  tier: 'daily_driver', inPrice: 0.6,  outPrice: 3.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Moonshot' },
    { name: 'composer-1',               displayName: 'Composer 1',                 tier: 'daily_driver', inPrice: 1.25, outPrice: 10.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Cursor' },
    { name: 'composer-1.5',             displayName: 'Composer 1.5',               tier: 'daily_driver', inPrice: 3.5,  outPrice: 17.5,  requestPrice: 0.08, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Cursor' },
    { name: 'composer-2',               displayName: 'Composer 2',                 tier: 'daily_driver', inPrice: 0.5,  outPrice: 2.5,   requestPrice: 0.08, isDailyDriver: true,  isMaxOnly: false, isHidden: false, intelligenceTier: 'frontier', provider: 'Cursor' },
    // ── Max Mode / per-token (req=0, isMax=true) ──────────────────────────
    { name: 'claude-sonnet-4-6',        displayName: 'Claude 4.6 Sonnet',          tier: 'premium',      inPrice: 3.0,  outPrice: 15.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: false, intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-sonnet-4-5',        displayName: 'Claude 4.5 Sonnet',          tier: 'premium',      inPrice: 3.0,  outPrice: 15.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: true,  intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-opus-4-6',          displayName: 'Claude 4.6 Opus',            tier: 'premium',      inPrice: 5.0,  outPrice: 25.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: false, intelligenceTier: 'frontier', provider: 'Anthropic' },
    { name: 'claude-opus-4-5',          displayName: 'Claude 4.5 Opus',            tier: 'premium',      inPrice: 5.0,  outPrice: 25.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: true,  intelligenceTier: 'frontier', provider: 'Anthropic' },
    { name: 'claude-opus-4-6-fast',     displayName: 'Claude 4.6 Opus (Fast)',     tier: 'premium',      inPrice: 30.0, outPrice: 150.0, requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: true,  intelligenceTier: 'frontier', provider: 'Anthropic' },
    { name: 'gpt-5.4',                  displayName: 'GPT-5.4',                    tier: 'premium',      inPrice: 2.5,  outPrice: 15.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: false, intelligenceTier: 'frontier', provider: 'OpenAI' },
    // ── API-pool per-token (req=0, isMax=false) ───────────────────────────
    { name: 'gpt-5.3-codex',            displayName: 'GPT-5.3 Codex',              tier: 'premium',      inPrice: 1.75, outPrice: 14.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: false, isHidden: false, intelligenceTier: 'frontier', provider: 'OpenAI' },
  ];

  // ── Task Definitions ──────────────────────────────────────────────────────
  const TASKS = [
    { key: 'heavy',   label: 'Complex (refactor / arch / debug)', in: 12000, out: 2000, preferredTier: 'premium',  strategy: 'quality' },
    { key: 'medium',  label: 'Medium (feature / code review)',    in: 6000,  out: 800,  preferredTier: 'premium',  strategy: 'value'   },
    { key: 'light',   label: 'Light (small fix / explain)',       in: 2000,  out: 300,  preferredTier: 'standard', strategy: 'value'   },
    { key: 'trivial', label: 'Trivial (autocomplete / rename)',   in: 500,   out: 100,  preferredTier: 'free',     strategy: 'value'   },
  ];

  // ── Provider / Tier Ranking ───────────────────────────────────────────────
  const PROVIDER_RANK  = { Anthropic: 0, OpenAI: 1, Google: 2, xAI: 3, Cursor: 4 };
  const TIER_RANK      = { frontier: 0, high: 1, moderate: 2 };

  // ── Config helpers ────────────────────────────────────────────────────────
  function getConfig() {
    function num(id, def) {
      const v = parseFloat(document.getElementById(id)?.value);
      return isFinite(v) && v > 0 ? v : def;
    }
    function str(id, def) {
      const v = document.getElementById(id)?.value?.trim();
      return v || def;
    }
    return {
      planName:         str('cfg-plan-name',   'Pro'),
      premiumRequests:  num('cfg-premium-req',  500),
      onDemandBudget:   num('cfg-budget',        20),
      flatRate:         num('cfg-flat-rate',    0.04),
      overhead:         num('cfg-overhead',     1.20),
    };
  }

  // ── Core Calculations ─────────────────────────────────────────────────────
  function costPerRequest(model, inTok, outTok, cfg) {
    if (model.requestPrice !== null) return model.requestPrice;
    return ((inTok / 1_000_000) * model.inPrice +
            (outTok / 1_000_000) * model.outPrice) * cfg.overhead;
  }

  function tierSortKey(model) {
    return [TIER_RANK[model.intelligenceTier] ?? 9, -(model.inPrice + model.outPrice)];
  }

  function cmpTierKey(a, b) {
    const ka = tierSortKey(a), kb = tierSortKey(b);
    return ka[0] - kb[0] || ka[1] - kb[1];
  }

  function pickBestDriver(models, hidden, cfg) {
    const candidates = models.filter(m => m.isDailyDriver && m.isHidden === hidden);
    if (!candidates.length) return null;
    const minPrice = Math.min(...candidates.map(m => m.requestPrice ?? cfg.flatRate));
    const cheapest = candidates.filter(m => (m.requestPrice ?? cfg.flatRate) === minPrice);
    return cheapest.reduce((best, m) => {
      const ka = [TIER_RANK[m.intelligenceTier] ?? 9, PROVIDER_RANK[m.provider] ?? 9, (m.displayName || m.name).length];
      const kb = [TIER_RANK[best.intelligenceTier] ?? 9, PROVIDER_RANK[best.provider] ?? 9, (best.displayName || best.name).length];
      for (let i = 0; i < ka.length; i++) { if (ka[i] !== kb[i]) return ka[i] < kb[i] ? m : best; }
      return best;
    });
  }

  function bestModelForTask(models, preferredTier, strategy, inTok, outTok, cfg) {
    const tierOrder = { premium: ['premium', 'standard'], standard: ['standard', 'premium'], free: ['free', 'standard'] };
    const eligible = models.filter(m => !m.isMaxOnly && m.tier !== 'daily_driver' && m.requestPrice === null && m.inPrice > 0);
    for (const tier of (tierOrder[preferredTier] || ['standard'])) {
      const candidates = eligible.filter(m => m.tier === tier);
      if (!candidates.length) continue;
      if (strategy === 'quality') return candidates.reduce((b, m) => (m.inPrice + m.outPrice) > (b.inPrice + b.outPrice) ? m : b);
      return candidates.reduce((b, m) => costPerRequest(m, inTok, outTok, cfg) < costPerRequest(b, inTok, outTok, cfg) ? m : b);
    }
    return eligible.length ? eligible.reduce((b, m) => costPerRequest(m, inTok, outTok, cfg) < costPerRequest(b, inTok, outTok, cfg) ? m : b) : null;
  }

  // ── Formatting helpers ────────────────────────────────────────────────────
  function modelLabel(m) { return m.displayName || m.name; }

  function fmtCost(n) {
    if (n === 0) return 'free';
    if (n < 0.01) return '$' + n.toFixed(4);
    if (n < 0.1)  return '$' + n.toFixed(3);
    return '$' + n.toFixed(2);
  }

  function tierBadge(tier) {
    const cls = { frontier: 'frontier', high: 'high', moderate: 'moderate' }[tier] || 'moderate';
    return `<span class="tier-badge ${cls}">${tier}</span>`;
  }

  // ── Render: TL;DR ─────────────────────────────────────────────────────────
  function renderTldr(models, cfg) {
    const heavy       = TASKS.find(t => t.key === 'heavy') || TASKS[0];
    const bestVisible = pickBestDriver(models, false, cfg);
    const bestHidden  = pickBestDriver(models, true, cfg);
    const moderates   = models.filter(m => m.isDailyDriver && m.intelligenceTier === 'moderate');
    const budgetPick  = moderates.length
      ? moderates.reduce((b, m) => {
          const ra = m.requestPrice ?? cfg.flatRate, rb = b.requestPrice ?? cfg.flatRate;
          if (ra !== rb) return ra < rb ? m : b;
          return (m.inPrice + m.outPrice) < (b.inPrice + b.outPrice) ? m : b;
        })
      : null;
    const maxCandidates = models.filter(m => m.isMaxOnly && !m.isHidden);
    const maxPick = maxCandidates.length
      ? maxCandidates.reduce((b, m) => costPerRequest(m, heavy.in, heavy.out, cfg) < costPerRequest(b, heavy.in, heavy.out, cfg) ? m : b)
      : null;

    const totalCredits = cfg.premiumRequests + Math.floor(cfg.onDemandBudget / cfg.flatRate);

    function itemHtml(label, model, isRec, extra) {
      if (!model) return '';
      const cost = model.requestPrice !== null
        ? fmtCost(model.requestPrice) + '/req'
        : fmtCost(costPerRequest(model, heavy.in, heavy.out, cfg)) + '/req';
      return `
        <div class="tldr-item ${isRec ? 'is-recommended' : ''}">
          <div class="tldr-item-label">${label}</div>
          <div class="tldr-item-name">${modelLabel(model)}</div>
          <div class="tldr-item-detail">
            <strong>${cost}</strong>
            ${tierBadge(model.intelligenceTier)}
            ${model.isHidden ? `<span class="model-id">${model.name}</span>` : ''}
          </div>
          ${extra || ''}
        </div>`;
    }

    let maxExtra = '';
    if (maxPick) {
      const mc   = costPerRequest(maxPick, heavy.in, heavy.out, cfg);
      const mult = (mc / cfg.flatRate).toFixed(1);
      maxExtra = `<div class="tldr-warning">${mult}× vs driver</div>`;
    }

    const el = document.getElementById('section-tldr');
    if (!el) return;
    el.innerHTML = `
      <div class="tldr-grid">
        ${itemHtml('Best daily driver', bestVisible, true)}
        ${itemHtml('Best hidden driver', bestHidden, false)}
        ${itemHtml('Budget pick', budgetPick, false)}
        ${itemHtml('Max Mode pick', maxPick, false, maxExtra)}
      </div>
      <div class="tldr-budget-line">
        Total budget: <strong>${cfg.premiumRequests.toLocaleString()} included</strong>
        + <strong>${Math.floor(cfg.onDemandBudget / cfg.flatRate).toLocaleString()} on-demand</strong>
        = <strong>${totalCredits.toLocaleString()} requests</strong>
        at ${fmtCost(cfg.flatRate)}/req.
      </div>
      <div class="tldr-warning" style="margin-top:0.5rem">
        Max Mode costs 2–20× more per request — use only when drivers aren't enough.
      </div>`;
  }

  // ── Render: Request Pool ──────────────────────────────────────────────────
  function renderRequestPool(models, cfg) {
    const el = document.getElementById('section-request-pool');
    if (!el) return;

    const drivers = models.filter(m => m.isDailyDriver);
    if (!drivers.length) { el.innerHTML = '<p class="empty-state">No request-pool models in current data.</p>'; return; }

    const rec = pickBestDriver(models, false, cfg);

    // Group by provider, sort providers alphabetically
    const provMap = {};
    for (const m of drivers) {
      const p = m.provider || 'Other';
      (provMap[p] = provMap[p] || []).push(m);
    }

    let rows = '';
    for (const prov of Object.keys(provMap).sort()) {
      const group = provMap[prov].slice().sort(cmpTierKey);
      group.forEach((m, i) => {
        const isRec = m === rec;
        const cost  = fmtCost(m.requestPrice ?? cfg.flatRate);
        const note  = (m.requestPrice && m.requestPrice > cfg.flatRate)
          ? `${Math.round(m.requestPrice / cfg.flatRate)} credits`
          : '';
        const nameCell = m.isHidden
          ? `${modelLabel(m)} <span class="model-id">(${m.name})</span>`
          : modelLabel(m);
        rows += `
          <tr class="${isRec ? 'row-recommended' : ''}">
            <td class="provider-cell">${i === 0 ? prov : ''}</td>
            <td class="model-cell">
              ${isRec ? '<span class="rec-marker">▶</span>' : ''}${nameCell}
            </td>
            <td class="cost-cell">${cost}</td>
            <td>${tierBadge(m.intelligenceTier)}</td>
            <td class="note-cell">${note}</td>
          </tr>`;
      });
    }

    // Free API-pool models
    const freeApi = models.filter(m => !m.isDailyDriver && !m.isMaxOnly && m.inPrice === 0 && m.outPrice === 0 && m.tier === 'free');
    if (freeApi.length) {
      rows += freeApi.map(m => `
        <tr class="free-preview-row">
          <td class="provider-cell">${m.provider || ''}</td>
          <td class="model-cell">${modelLabel(m)}</td>
          <td class="cost-cell" style="color:var(--warn)">free</td>
          <td>${tierBadge(m.intelligenceTier)}</td>
          <td class="note-cell" style="color:var(--warn)">FREE PREVIEW — pricing may change</td>
        </tr>`).join('');
    }

    const budgetCredits = Math.floor(cfg.onDemandBudget / cfg.flatRate);
    el.innerHTML = `
      <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1.25rem">
        All models below bill at a flat rate from your request pool.
        ${fmtCost(cfg.flatRate)}/credit — 2-credit models cost ${fmtCost(cfg.flatRate * 2)}.
        Disable <strong style="color:var(--text)">Auto</strong> routing to control credit spend.
      </p>
      <div class="table-scroll">
        <table class="advisor-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Model</th>
              <th>$/req</th>
              <th>Tier</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="section-tip">
        <strong>Tips:</strong> Disable Auto routing. Avoid Max Mode for credit-pool tasks.
        After ${cfg.premiumRequests.toLocaleString()} included credits, on-demand kicks in at the same rate
        (${budgetCredits.toLocaleString()} credits @ ${fmtCost(cfg.flatRate)}/req).
      </div>`;
  }

  // ── Render: API Pool ──────────────────────────────────────────────────────
  function renderApiPool(models, cfg) {
    const el = document.getElementById('section-api-pool');
    if (!el) return;

    const eligible = models.filter(m => !m.isMaxOnly && m.tier !== 'daily_driver' && m.requestPrice === null && m.inPrice > 0);
    if (!eligible.length) { el.innerHTML = '<p class="empty-state">No API-pool per-token models in current data.</p>'; return; }

    if (eligible.length === 1) {
      const m       = eligible[0];
      const heavy   = TASKS.find(t => t.key === 'heavy')   || TASKS[0];
      const trivial = TASKS.find(t => t.key === 'trivial') || TASKS[TASKS.length - 1];
      const cHeavy  = costPerRequest(m, heavy.in, heavy.out, cfg);
      const cTriv   = costPerRequest(m, trivial.in, trivial.out, cfg);
      const rHeavy  = cHeavy  > 0 ? Math.floor(cfg.onDemandBudget / cHeavy)  : 0;
      const rTriv   = cTriv   > 0 ? Math.floor(cfg.onDemandBudget / cTriv)   : 0;
      el.innerHTML = `
        <div class="api-compact">
          <div>
            <div class="api-compact-name">${modelLabel(m)} ${tierBadge(m.intelligenceTier)}</div>
            <div class="api-compact-detail">
              ${fmtCost(m.inPrice)} / ${fmtCost(m.outPrice)} per 1M in/out tokens
            </div>
          </div>
          <div>
            <div class="api-compact-detail">Cost range: <strong>${fmtCost(cTriv)}/trivial</strong> → <strong>${fmtCost(cHeavy)}/complex</strong></div>
            <div class="api-compact-detail">Requests for $${cfg.onDemandBudget.toFixed(0)}: <strong>${rHeavy.toLocaleString()}–${rTriv.toLocaleString()}</strong></div>
          </div>
        </div>`;
      return;
    }

    let rows = '';
    for (const task of TASKS) {
      const best = bestModelForTask(models, task.preferredTier, task.strategy, task.in, task.out, cfg);
      if (!best) {
        rows += `<tr><td>${task.label}</td><td colspan="3" style="color:var(--text-muted)">(none)</td></tr>`;
        continue;
      }
      const cost  = costPerRequest(best, task.in, task.out, cfg);
      const reqs  = cost > 0 ? Math.floor(cfg.onDemandBudget / cost) : Infinity;
      const reqsStr = isFinite(reqs) ? reqs.toLocaleString() : 'unlimited';
      rows += `
        <tr>
          <td>${task.label}</td>
          <td class="model-cell">${modelLabel(best)} ${tierBadge(best.intelligenceTier)}</td>
          <td class="cost-cell">${fmtCost(cost)}</td>
          <td class="cost-cell">${reqsStr}</td>
        </tr>`;
    }

    el.innerHTML = `
      <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1.25rem">
        These models bill per-token from your on-demand budget.
      </p>
      <div class="table-scroll">
        <table class="advisor-table">
          <thead>
            <tr>
              <th>Task Type</th>
              <th>Recommended Model</th>
              <th>$/req</th>
              <th>Reqs for $${cfg.onDemandBudget.toFixed(0)}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ── Render: Max Mode ──────────────────────────────────────────────────────
  function renderMaxMode(models, cfg) {
    const el = document.getElementById('section-max-mode');
    if (!el) return;

    const maxModels = models.filter(m => m.isMaxOnly && m.requestPrice === null);
    if (!maxModels.length) { el.innerHTML = '<p class="empty-state">No Max Mode models in current data.</p>'; return; }

    const heavy = TASKS.find(t => t.key === 'heavy') || TASKS[0];
    const light = TASKS.find(t => t.key === 'light') || TASKS[2] || TASKS[0];
    const surcharge = Math.round((cfg.overhead - 1) * 100);

    const sorted = maxModels.slice().sort((a, b) =>
      costPerRequest(a, heavy.in, heavy.out, cfg) - costPerRequest(b, heavy.in, heavy.out, cfg)
    );

    let rows = '';
    for (const m of sorted) {
      const cHeavy = costPerRequest(m, heavy.in, heavy.out, cfg);
      const cLight = costPerRequest(m, light.in, light.out, cfg);
      const reqs   = cHeavy > 0 ? Math.floor(cfg.onDemandBudget / cHeavy) : Infinity;
      const reqsStr = isFinite(reqs) ? reqs.toLocaleString() : 'unlimited';
      const mult   = cfg.flatRate > 0 ? cHeavy / cfg.flatRate : 0;
      const multClass = mult >= 10 ? 'mult-warn' : mult >= 3 ? 'mult-warn' : 'mult-ok';
      const nameCell = m.isHidden
        ? `${modelLabel(m)} <span class="model-id">(${m.name})</span>`
        : modelLabel(m);
      rows += `
        <tr>
          <td class="model-cell">${nameCell} ${tierBadge(m.intelligenceTier)}</td>
          <td class="cost-cell">${fmtCost(cHeavy)}</td>
          <td class="cost-cell">${fmtCost(cLight)}</td>
          <td class="cost-cell">${reqsStr}</td>
          <td class="${multClass}">${mult.toFixed(1)}×</td>
        </tr>`;
    }

    el.innerHTML = `
      <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1.25rem">
        Max Mode bills per-token from your $${cfg.onDemandBudget.toFixed(0)} budget
        (${surcharge}% surcharge on API cost). Does <strong style="color:var(--text)">not</strong>
        consume request credits — every call deducts directly.
      </p>
      <div class="table-scroll">
        <table class="advisor-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>$/complex</th>
              <th>$/light</th>
              <th>Reqs/$${cfg.onDemandBudget.toFixed(0)}</th>
              <th>vs driver</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="section-tip">
        Break-even: a ${fmtCost(cfg.flatRate)} driver is always cheaper per-request.
        Use Max Mode when you need capability the drivers lack, or when one high-quality
        response saves multiple round-trips.
      </div>`;
  }

  // ── Render: Header subtitle ───────────────────────────────────────────────
  function renderSubtitle(cfg) {
    const el = document.getElementById('header-subtitle');
    if (el) {
      const credits = Math.floor(cfg.onDemandBudget / cfg.flatRate);
      el.textContent = `${cfg.planName} plan · ${cfg.premiumRequests.toLocaleString()} included credits · $${cfg.onDemandBudget.toFixed(0)} on-demand (${credits.toLocaleString()} credits @ ${fmtCost(cfg.flatRate)}/req)`;
    }
  }

  // ── Dynamic model loading ─────────────────────────────────────────────────
  async function loadModels() {
    try {
      const res = await fetch('models.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.models) || data.models.length === 0) throw new Error('Empty');
      return { models: data.models, date: data.date, source: data.source };
    } catch (_) {
      return { models: MODEL_DATA, date: FALLBACK_DATE, source: 'fallback' };
    }
  }

  function updateBadge(source, date) {
    const el = document.getElementById('source-badge');
    if (!el) return;
    const svg = el.querySelector('svg');
    el.textContent = '';
    if (svg) el.appendChild(svg);
    el.appendChild(document.createTextNode(
      source === 'live' ? `Live model data · fetched ${date}` : `Static fallback · last updated ${date}`
    ));
  }

  // ── Master render ─────────────────────────────────────────────────────────
  function renderAll(models) {
    const cfg = getConfig();
    renderSubtitle(cfg);
    renderTldr(models, cfg);
    renderRequestPool(models, cfg);
    renderApiPool(models, cfg);
    renderMaxMode(models, cfg);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  let _activeModels = MODEL_DATA;

  loadModels().then(({ models, date, source }) => {
    _activeModels = models;
    updateBadge(source, date);
    renderAll(_activeModels);
  });

  // ── Input wiring with debounce ────────────────────────────────────────────
  let debounceTimer;
  document.querySelectorAll('.config-field input').forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderAll(_activeModels), 150);
    });
  });

})();
