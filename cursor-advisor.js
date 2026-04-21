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
    { name: 'claude-4-sonnet',           displayName: 'Claude 4 Sonnet',            tier: 'daily_driver', inPrice: 3.0,  outPrice: 15.0,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-4-5-haiku',         displayName: 'Claude 4.5 Haiku',           tier: 'daily_driver', inPrice: 1.0,  outPrice: 5.0,   requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'moderate', provider: 'Anthropic' },
    { name: 'claude-4-sonnet-1m',       displayName: 'Claude 4 Sonnet 1M',         tier: 'daily_driver', inPrice: 6.0,  outPrice: 22.5,  requestPrice: 0.04, isDailyDriver: true,  isMaxOnly: false, isHidden: true,  intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-opus-4-7-thinking-high', displayName: 'Claude 4.7 Opus Thinking', tier: 'daily_driver', inPrice: 5.0, outPrice: 25.0, requestPrice: 0.04, isDailyDriver: true, isMaxOnly: false, isHidden: true,  intelligenceTier: 'frontier', provider: 'Anthropic' },
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
    { name: 'claude-4-6-sonnet',        displayName: 'Claude 4.6 Sonnet',          tier: 'premium',      inPrice: 3.0,  outPrice: 15.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: false, intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-4-5-sonnet',        displayName: 'Claude 4.5 Sonnet',          tier: 'premium',      inPrice: 3.0,  outPrice: 15.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: true,  intelligenceTier: 'high',     provider: 'Anthropic' },
    { name: 'claude-4-6-opus',          displayName: 'Claude 4.6 Opus',            tier: 'premium',      inPrice: 5.0,  outPrice: 25.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: false, intelligenceTier: 'frontier', provider: 'Anthropic' },
    { name: 'claude-4-5-opus',          displayName: 'Claude 4.5 Opus',            tier: 'premium',      inPrice: 5.0,  outPrice: 25.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: true,  intelligenceTier: 'frontier', provider: 'Anthropic' },
    { name: 'claude-4-6-opus-fast',     displayName: 'Claude 4.6 Opus (Fast)',     tier: 'premium',      inPrice: 30.0, outPrice: 150.0, requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: true,  intelligenceTier: 'frontier', provider: 'Anthropic' },
    { name: 'claude-opus-4-7',          displayName: 'Claude 4.7 Opus',            tier: 'premium',      inPrice: 5.0,  outPrice: 25.0,  requestPrice: null, isDailyDriver: false, isMaxOnly: true,  isHidden: false, intelligenceTier: 'frontier', provider: 'Anthropic' },
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

  // ── Model selection state ─────────────────────────────────────────────────
  const LS_KEY_SELECTED = 'advisorSelectedModels';
  const DEFAULT_SELECTED_MODELS = new Set([
    'claude-4-sonnet', 'claude-4-5-haiku', 'claude-4-5-opus', 'claude-4-5-sonnet',
    'claude-4-6-opus', 'claude-4-6-sonnet', 'claude-opus-4-7-thinking-high',
    'composer-1.5', 'gemini-3-flash', 'gemini-3-pro', 'gemini-3.1-pro',
    'gpt-5-mini', 'gpt-5.2', 'gpt-5.3-codex', 'gpt-5.4',
  ]);

  let _selectedModelNames = null;

  function loadSelectedModels(allModels) {
    const validNames = new Set(allModels.map(m => m.name));
    try {
      const raw = localStorage.getItem(LS_KEY_SELECTED);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(n => validNames.has(n));
          if (valid.length > 0) { _selectedModelNames = new Set(valid); return; }
        }
      }
    } catch (_) {}
    _selectedModelNames = new Set([...DEFAULT_SELECTED_MODELS].filter(n => validNames.has(n)));
  }

  function saveSelectedModels() {
    localStorage.setItem(LS_KEY_SELECTED, JSON.stringify([..._selectedModelNames]));
  }

  function getActiveModels(allModels) {
    if (!_selectedModelNames || _selectedModelNames.size === 0) {
      return allModels.filter(m => !m.isHidden).map(m => ({ ...m, isHidden: false }));
    }
    return allModels
      .filter(m => _selectedModelNames.has(m.name))
      .map(m => ({ ...m, isHidden: false }));
  }

  // ── Config helpers ────────────────────────────────────────────────────────
  function getConfig() {
    function num(id, def, allowZero = false) {
      const el = document.getElementById(id);
      const v = el ? el.valueAsNumber : NaN;
      return isFinite(v) && (allowZero ? v >= 0 : v > 0) ? v : def;
    }
    const discountPctEl = document.getElementById('cfg-discount-pct');
    const discountPctRaw = discountPctEl ? Number(discountPctEl.value) : 50;
    return {
      premiumRequests: num('cfg-premium-req', 500, true),
      onDemandBudget:  num('cfg-budget',       20, true),
      flatRate:        num('cfg-flat-rate',   0.04),
      overhead:        num('cfg-overhead',    1.20),
      discountPct:    (isFinite(discountPctRaw) && discountPctRaw >= 0 && discountPctRaw <= 100) ? discountPctRaw : 50,
      discountScope:  document.getElementById('cfg-discount-scope')?.value || 'frontier',
      discountExpiry: document.getElementById('cfg-discount-expiry')?.value || '2026-04-30',
    };
  }

  function getDiscountInfo(cfg) {
    if (cfg.discountScope === 'none' || cfg.discountPct <= 0) {
      return { active: false, multiplier: 1, daysRemaining: null };
    }
    const today = new Date().toISOString().slice(0, 10);
    if (cfg.discountExpiry && cfg.discountExpiry < today) {
      return { active: false, expired: true, multiplier: 1, daysRemaining: 0, scope: cfg.discountScope };
    }
    const expDate   = new Date(cfg.discountExpiry + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    const daysRemaining = Math.ceil((expDate - todayDate) / 86400000);
    return { active: true, expired: false, multiplier: 1 - cfg.discountPct / 100, daysRemaining, scope: cfg.discountScope };
  }

  function isModelDiscounted(model, discountInfo) {
    if (!discountInfo.active) return false;
    if (discountInfo.scope === 'all') return true;
    if (discountInfo.scope === 'frontier') return model.intelligenceTier === 'frontier';
    return false;
  }

  // ── Core Calculations ─────────────────────────────────────────────────────
  function costPerRequest(model, inTok, outTok, cfg, discountInfo) {
    const multiplier = (discountInfo && isModelDiscounted(model, discountInfo)) ? discountInfo.multiplier : 1;
    if (model.requestPrice !== null) return model.requestPrice * multiplier;
    return ((inTok / 1_000_000) * model.inPrice +
            (outTok / 1_000_000) * model.outPrice) * cfg.overhead * multiplier;
  }

  function tierSortKey(model) {
    return [TIER_RANK[model.intelligenceTier] ?? 9, -(model.inPrice + model.outPrice)];
  }

  function cmpTierKey(a, b) {
    const ka = tierSortKey(a), kb = tierSortKey(b);
    return ka[0] - kb[0] || ka[1] - kb[1];
  }

  function pickBestDriver(models, hidden, cfg, discountInfo) {
    const candidates = models.filter(m => m.isDailyDriver && m.isHidden === hidden);
    if (!candidates.length) return null;
    const getPrice = m => costPerRequest(m, 0, 0, cfg, discountInfo);
    const minPrice = Math.min(...candidates.map(getPrice));
    const cheapest = candidates.filter(m => getPrice(m) === minPrice);
    return cheapest.reduce((best, m) => {
      const ka = [TIER_RANK[m.intelligenceTier] ?? 9, PROVIDER_RANK[m.provider] ?? 9, (m.displayName || m.name).length];
      const kb = [TIER_RANK[best.intelligenceTier] ?? 9, PROVIDER_RANK[best.provider] ?? 9, (best.displayName || best.name).length];
      for (let i = 0; i < ka.length; i++) { if (ka[i] !== kb[i]) return ka[i] < kb[i] ? m : best; }
      return best;
    });
  }

  function bestModelForTask(models, preferredTier, strategy, inTok, outTok, cfg, discountInfo) {
    const tierOrder = { premium: ['premium', 'standard'], standard: ['standard', 'premium'], free: ['free', 'standard'] };
    const eligible = models.filter(m => !m.isMaxOnly && m.tier !== 'daily_driver' && m.requestPrice === null && m.inPrice > 0);
    const cpr = (m) => costPerRequest(m, inTok, outTok, cfg, discountInfo);
    for (const tier of (tierOrder[preferredTier] || ['standard'])) {
      const candidates = eligible.filter(m => m.tier === tier);
      if (!candidates.length) continue;
      if (strategy === 'quality') return candidates.reduce((b, m) => (m.inPrice + m.outPrice) > (b.inPrice + b.outPrice) ? m : b);
      return candidates.reduce((b, m) => cpr(m) < cpr(b) ? m : b);
    }
    return eligible.length ? eligible.reduce((b, m) => cpr(m) < cpr(b) ? m : b) : null;
  }

  // ── Formatting helpers ────────────────────────────────────────────────────
  function modelLabel(m) { return m.displayName || m.name; }

  function fmtCost(n) {
    if (n === 0) return 'free';
    if (n < 0.01) return '$' + n.toFixed(4);
    if (n < 0.1)  return '$' + n.toFixed(3);
    return '$' + n.toFixed(2);
  }

  const TIER_TITLE = {
    frontier: 'Frontier — highest capability tier; best for complex reasoning and architecture',
    high:     'High — strong capability; good balance of quality and speed',
    moderate: 'Moderate — fast and lightweight; optimised for simple edits and autocomplete',
  };

  function tierBadge(tier) {
    const cls   = { frontier: 'frontier', high: 'high', moderate: 'moderate' }[tier] || 'moderate';
    const title = TIER_TITLE[tier] || tier;
    return `<span class="tier-badge ${cls}" title="${title}">${tier}</span>`;
  }

  // ── Credit helpers ─────────────────────────────────────────────────────────
  function creditsPerReq(model, cfg) {
    if (model.requestPrice === null) return null;
    return Math.round((model.requestPrice ?? cfg.flatRate) / cfg.flatRate);
  }

  function creditPill(credits) {
    if (credits === 1) return `<span class="credit-pill credit-pill--1">&#9679;&thinsp;1 credit</span>`;
    if (credits === 2) return `<span class="credit-pill credit-pill--2">&#9679;&#9679;&thinsp;2 credits</span>`;
    return `<span class="credit-pill credit-pill--multi">&#9679;&times;${credits} credits</span>`;
  }

  // ── Model-selection helpers for Quick Guide ──────────────────────────────

  // Returns { best, value, bestVal } for Plan mode.
  // best  — highest-intelligence visible model (may be isMaxOnly)
  // value — best visible request-pool (driver) model (never isMaxOnly)
  // bestVal — cheapest driver with intelligence ≥ "high", distinct from above
  function pickPlanModels(models, cfg, discountInfo) {
    const heavy = TASKS.find(t => t.key === 'heavy') || TASKS[0];
    const allVisible = models.filter(m => !m.isHidden);
    if (!allVisible.length) return { best: null, value: null, bestVal: null };

    const best = allVisible.reduce((b, m) => {
      const tierM = TIER_RANK[m.intelligenceTier] ?? 9;
      const tierB = TIER_RANK[b.intelligenceTier] ?? 9;
      if (tierM !== tierB) return tierM < tierB ? m : b;
      const premM = m.isMaxOnly ? 0 : 1;
      const premB = b.isMaxOnly ? 0 : 1;
      if (premM !== premB) return premM > premB ? m : b;
      const costM = costPerRequest(m, heavy.in, heavy.out, cfg, discountInfo);
      const costB = costPerRequest(b, heavy.in, heavy.out, cfg, discountInfo);
      return (m.isMaxOnly ? costM > costB : costM < costB) ? m : b;
    });

    const drivers = models.filter(m => m.isDailyDriver && !m.isHidden);
    const driversSorted = drivers.slice().sort(cmpTierKey);
    const value = best.isDailyDriver
      ? (driversSorted.filter(m => m !== best)[0] || null)
      : (driversSorted[0] || null);

    const remaining = drivers.filter(m => m !== best && m !== value);
    const bestVal = remaining.length ? remaining.slice().sort(cmpTierKey)[0] : null;

    return { best, value, bestVal };
  }

  // Returns { best, value, bestVal } for Build (request-pool only, visible drivers).
  function pickDriverTriple(models, cfg, discountInfo) {
    const drivers = models.filter(m => m.isDailyDriver && !m.isHidden);
    if (!drivers.length) return { best: null, value: null, bestVal: null };

    const best = pickBestDriver(models, false, cfg, discountInfo);
    const others = drivers.filter(m => m !== best);

    let value = null;
    if (others.length) {
      const getPrice = m => costPerRequest(m, 0, 0, cfg, discountInfo);
      const minReqPrice = Math.min(...others.map(getPrice));
      const tied = others.filter(m => getPrice(m) === minReqPrice);
      value = tied.reduce((b, m) =>
        (TIER_RANK[m.intelligenceTier] ?? 9) > (TIER_RANK[b.intelligenceTier] ?? 9) ? m : b, tied[0]);
    }

    const remaining = others.filter(m => m !== value);
    const bestVal = remaining.length
      ? remaining.reduce((b, m) => cmpTierKey(m, b) < 0 ? m : b)
      : null;

    return { best, value, bestVal };
  }

  // Returns { best, value, bestVal } for Quick Edit (visible drivers only, favour cheapest/fastest).
  function pickEditTriple(models, cfg, discountInfo) {
    const drivers = models.filter(m => m.isDailyDriver && !m.isHidden);
    if (!drivers.length) return { best: null, value: null, bestVal: null };

    const getPrice = m => costPerRequest(m, 0, 0, cfg, discountInfo);
    const minPrice = Math.min(...drivers.map(getPrice));
    const cheapest = drivers.filter(m => getPrice(m) === minPrice);
    const best = cheapest.reduce((b, m) =>
      (TIER_RANK[m.intelligenceTier] ?? 9) > (TIER_RANK[b.intelligenceTier] ?? 9) ? m : b, cheapest[0]);

    const rest = drivers.filter(m => m !== best).sort((a, b) => {
      const ca = getPrice(a), cb = getPrice(b);
      if (ca !== cb) return ca - cb;
      return (TIER_RANK[b.intelligenceTier] ?? 9) - (TIER_RANK[a.intelligenceTier] ?? 9);
    });
    const value   = rest[0] || null;
    const bestVal = rest.filter(m => m !== value)[0] || null;

    return { best, value, bestVal };
  }

  // ── Render: Quick Guide (9 scenario cards: 3 per scenario) ───────────────
  function renderTldr(models, cfg, discountInfo) {
    const heavy = TASKS.find(t => t.key === 'heavy') || TASKS[0];

    const { best: planBest,  value: planBudget,  bestVal: planSmart  } = pickPlanModels(models, cfg, discountInfo);
    const { best: buildBest, value: buildBudget, bestVal: buildSmart } = pickDriverTriple(models, cfg, discountInfo);
    const { best: editBest,  value: editBudget,  bestVal: editSmart  } = pickEditTriple(models, cfg, discountInfo);

    const budgetCredits = Math.floor(cfg.onDemandBudget / cfg.flatRate);
    const buildCr     = buildBest ? (creditsPerReq(buildBest, cfg) || 1) : 1;
    const buildInclR  = buildBest ? Math.floor(cfg.premiumRequests / buildCr) : 0;
    const buildBestPrice = buildBest ? costPerRequest(buildBest, 0, 0, cfg, discountInfo) : cfg.flatRate;
    const buildOndemR = buildBest ? Math.floor(cfg.onDemandBudget / buildBestPrice) : 0;

    // ── Pick reasons (why this model won each slot) ──────────────────────────
    const tierCap  = t => t ? (t[0].toUpperCase() + t.slice(1)) : '';
    const crNote   = (m) => { const c = creditsPerReq(m, cfg) || 1; return c === 1 ? '1 credit' : `${c} credits`; };
    const drvRate  = buildBest ? fmtCost(buildBestPrice) : fmtCost(cfg.flatRate);

    const planBestReason = planBest ? (planBest.isMaxOnly
      ? `Max Mode — per-token billing, bypasses the credit pool`
      : `Highest flat-rate intelligence`) : '';
    const planBudgetReason = planBudget ? (planBudget === buildBest
      ? `The recommended daily driver — best flat-rate quality at ${drvRate}/req`
      : `Best flat-rate option — ${tierCap(planBudget.intelligenceTier)} tier at ${crNote(planBudget)}`) : '';
    const planSmartReason = planSmart ? (() => {
      const cr = creditsPerReq(planSmart, cfg) || 1;
      const dCr = buildBest ? (creditsPerReq(buildBest, cfg) || 1) : 1;
      return cr > dCr
        ? `Frontier flat-rate at ${cr} credits — between daily driver and Max Mode`
        : `${tierCap(planSmart.intelligenceTier)} flat-rate at ${crNote(planSmart)}`;
    })() : '';

    const buildBestReason = buildBest ? `Recommended daily driver — highest-tier flat-rate model` : '';
    const buildBudgetReason = buildBudget ? (() => {
      const budgetPrice = costPerRequest(buildBudget, 0, 0, cfg, discountInfo);
      const samePrice = budgetPrice === buildBestPrice;
      return samePrice
        ? `Same ${drvRate} rate as Best — ${tierCap(buildBudget.intelligenceTier)} tier for lighter tasks`
        : `Cheapest driver — ${tierCap(buildBudget.intelligenceTier)} tier at ${fmtCost(budgetPrice)}/req`;
    })() : '';
    const buildSmartReason = buildSmart
      ? `${tierCap(buildSmart.intelligenceTier)} tier at ${crNote(buildSmart)} — best quality above the minimum rate`
      : '';

    const editBestReason = editBest
      ? `Lightest &amp; fastest — minimum cost for quick tasks`
      : '';
    const editBudgetReason = editBudget ? (() => {
      const editBestPrice  = editBest ? costPerRequest(editBest, 0, 0, cfg, discountInfo) : cfg.flatRate;
      const editBudgetPrice = costPerRequest(editBudget, 0, 0, cfg, discountInfo);
      const samePrice = editBudgetPrice === editBestPrice;
      return samePrice
        ? `${tierCap(editBudget.intelligenceTier)} quality at the same ${fmtCost(editBudgetPrice)} rate — more capable for same cost`
        : `Cheapest remaining — ${tierCap(editBudget.intelligenceTier)} tier at ${fmtCost(editBudgetPrice)}/req`;
    })() : '';
    const editSmartReason = editSmart
      ? `${tierCap(editSmart.intelligenceTier)} tier at ${crNote(editSmart)} — when precision matters more than speed`
      : '';

    function scenarioCard(scenario, exampleUses, model, tag, reason) {
      if (!model) return '';
      const isMax  = !!model.isMaxOnly;
      const price  = isMax
        ? costPerRequest(model, heavy.in, heavy.out, cfg, discountInfo)
        : costPerRequest(model, 0, 0, cfg, discountInfo);
      const costStr = fmtCost(price) + '/req';

      let billingHtml;
      if (isMax) {
        const reqs = price > 0 ? Math.floor(cfg.onDemandBudget / price) : 0;
        const mult = cfg.flatRate > 0 ? (price / cfg.flatRate).toFixed(1) : '?';
        billingHtml = `
          <span class="credit-pill credit-pill--maxmode">Max Mode &middot; per-token</span>
          <div class="scenario-budget">~${reqs.toLocaleString()} reqs for $${cfg.onDemandBudget.toFixed(0)} &middot; ${mult}&times; vs driver</div>`;
      } else {
        const cr     = creditsPerReq(model, cfg) || 1;
        const inclR  = Math.floor(cfg.premiumRequests / cr);
        const ondemR = Math.floor(cfg.onDemandBudget / (model.requestPrice ?? cfg.flatRate));
        const budgetPart = ondemR > 0 ? ` + ${ondemR.toLocaleString()} on-demand` : '';
        billingHtml = `
          ${creditPill(cr)}
          <div class="scenario-budget">${inclR.toLocaleString()} included${budgetPart} reqs</div>`;
      }

      const hiddenId    = model.isHidden ? ` <span class="model-id">${model.name}</span>` : '';
      const tagCls      = tag === 'Best' ? 'scenario-tag--best' : tag === 'Budget' ? 'scenario-tag--budget' : 'scenario-tag--smart';
      const examplesHtml = exampleUses ? `<span class="scenario-examples">${exampleUses}</span>` : '';
      const reasonHtml   = reason      ? `<div class="scenario-reason">${reason}</div>` : '';

      return `
        <div class="scenario-card">
          <div class="scenario-header">
            <div class="scenario-header-top">
              <span class="scenario-label">${scenario}</span>
              <span class="scenario-tag ${tagCls}">${tag}</span>
            </div>
            ${examplesHtml}
          </div>
          <div class="scenario-model">${modelLabel(model)}${hiddenId}</div>
          <div class="scenario-detail">
            <strong>${costStr}</strong>
            ${tierBadge(model.intelligenceTier)}
          </div>
          ${reasonHtml}
          <div class="scenario-billing">${billingHtml}</div>
        </div>`;
    }

    // ── Daily driver banner ──────────────────────────────────────────────────
    const driverBannerHtml = (() => {
      const m = buildBest;
      if (!m) return '';
      const cr     = creditsPerReq(m, cfg) || 1;
      const inclR  = Math.floor(cfg.premiumRequests / cr);
      const driverPrice = costPerRequest(m, 0, 0, cfg, discountInfo);
      const ondemR = driverPrice > 0 ? Math.floor(cfg.onDemandBudget / driverPrice) : 0;
      const priceStr = fmtCost(driverPrice);
      const ondemPart = ondemR > 0
        ? `<div class="ddb-stat"><span class="ddb-stat-val">+${ondemR.toLocaleString()}</span><span class="ddb-stat-lbl">on-demand reqs</span></div>`
        : '';

      // Discount tip: if a discounted frontier Max Mode model is cheaper than the driver for a medium task, mention it
      const medium = TASKS.find(t => t.key === 'medium') || TASKS[1];
      const cheaperFrontier = discountInfo.active ? (() => {
        const frontierMaxModels = models.filter(m2 => m2.isMaxOnly && isModelDiscounted(m2, discountInfo));
        if (!frontierMaxModels.length) return null;
        const best = frontierMaxModels.reduce((b, m2) =>
          costPerRequest(m2, medium.in, medium.out, cfg, discountInfo) <
          costPerRequest(b, medium.in, medium.out, cfg, discountInfo) ? m2 : b);
        const bestCost = costPerRequest(best, medium.in, medium.out, cfg, discountInfo);
        return bestCost < driverPrice ? { model: best, cost: bestCost } : null;
      })() : null;

      const discountTip = cheaperFrontier
        ? `<div class="ddb-discount-tip">💡 Once included credits run out, <strong>${modelLabel(cheaperFrontier.model)}</strong> at ${fmtCost(cheaperFrontier.cost)}/medium task costs less than the ${fmtCost(cfg.flatRate)} on-demand driver rate — worth considering for complex tasks.</div>`
        : '';

      return `
        <div class="daily-driver-banner">
          <div class="ddb-top">
            <div class="ddb-left">
              <span class="ddb-eyebrow">Recommended daily driver</span>
              <div class="ddb-model">${modelLabel(m)}</div>
              <div class="ddb-meta">${m.provider}&ensp;&middot;&ensp;${tierBadge(m.intelligenceTier)}&ensp;&middot;&ensp;${creditPill(cr)}</div>
            </div>
            <div class="ddb-stats">
              <div class="ddb-stat"><span class="ddb-stat-val">${inclR.toLocaleString()}</span><span class="ddb-stat-lbl">incl. reqs / cycle</span></div>
              ${ondemPart}
              <div class="ddb-stat"><span class="ddb-stat-val">${priceStr}</span><span class="ddb-stat-lbl">per request</span></div>
            </div>
          </div>
          <div class="ddb-note">Flat-rate billing from your request pool — best choice for most everyday tasks. Costs draw from included credits first, then on-demand budget.</div>
          ${discountTip}
        </div>`;
    })();

    const el = document.getElementById('section-tldr');
    if (!el) return;
    el.innerHTML = `
      ${driverBannerHtml}
      <div class="tldr-legend">
        <span class="tldr-legend-item" title="Flat-rate billing from your request pool">
          ${creditPill(1)} Request pool — flat rate · uses included &amp; on-demand credits
        </span>
        <span class="tldr-legend-sep">·</span>
        <span class="tldr-legend-item" title="Per-token billing from your on-demand budget — does not use credit pool">
          <span class="credit-pill credit-pill--maxmode">Max Mode</span> Per-token · billed from on-demand budget only
        </span>
      </div>
      <div class="scenario-grid">
        <div class="scenario-group">
          ${scenarioCard('Plan', 'Architecture &middot; complex debug &middot; refactor', planBest, 'Best', planBestReason)}
          ${scenarioCard('Plan', null, planBudget, 'Budget', planBudgetReason)}
          ${scenarioCard('Plan', null, planSmart, 'Smart', planSmartReason)}
        </div>
        <div class="scenario-group">
          ${scenarioCard('Build', 'Features &middot; code review &middot; implement', buildBest, 'Best', buildBestReason)}
          ${scenarioCard('Build', null, buildBudget, 'Budget', buildBudgetReason)}
          ${scenarioCard('Build', null, buildSmart, 'Smart', buildSmartReason)}
        </div>
        <div class="scenario-group">
          ${scenarioCard('Quick Edit', 'Small fixes &middot; explain &middot; rename', editBest, 'Best', editBestReason)}
          ${scenarioCard('Quick Edit', null, editBudget, 'Budget', editBudgetReason)}
          ${scenarioCard('Quick Edit', null, editSmart, 'Smart', editSmartReason)}
        </div>
      </div>
      <div class="tldr-budget-line">
        Request pool: <strong>${cfg.premiumRequests.toLocaleString()} included credits</strong>
        ${budgetCredits > 0 ? `+ <strong>${budgetCredits.toLocaleString()} on-demand credits</strong>` : ''}
        = <strong>${buildOndemR > 0
          ? `${buildInclR.toLocaleString()} + ${buildOndemR.toLocaleString()} Build-tier requests`
          : `${buildInclR.toLocaleString()} Build-tier requests (included)`}</strong>
        at ${fmtCost(cfg.flatRate)}/credit.
        ${planBest?.isMaxOnly ? `<span class="tldr-warning" style="display:inline;margin-left:0.25rem">Plan Best uses Max Mode — billed per-token from your $${cfg.onDemandBudget.toFixed(0)} budget, not from the credit pool.</span>` : ''}
      </div>`;
  }

  // ── Render: Request Pool ──────────────────────────────────────────────────
  function renderRequestPool(models, cfg, discountInfo) {
    const el = document.getElementById('section-request-pool');
    if (!el) return;

    const drivers = models.filter(m => m.isDailyDriver);
    const rpSubtitle = document.getElementById('request-pool-subtitle');
    if (rpSubtitle) rpSubtitle.textContent = drivers.length
      ? `${drivers.length} flat-rate models — bills from your credit allowance`
      : 'Flat-rate models — bills from your credit allowance';
    if (!drivers.length) { el.innerHTML = '<p class="empty-state">No request-pool models in current data.</p>'; return; }

    const rec = pickBestDriver(models, false, cfg, discountInfo);

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
        const isRec  = m === rec;
        const effPrice = costPerRequest(m, 0, 0, cfg, discountInfo);
        const cost   = fmtCost(effPrice);
        const cr     = creditsPerReq(m, cfg) || 1;
        const inclR  = Math.floor(cfg.premiumRequests / cr);
        const odmR   = effPrice > 0 ? Math.floor(cfg.onDemandBudget / effPrice) : 0;
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
            <td class="credits-cell">${creditPill(cr)}<span class="credit-budget">${inclR.toLocaleString()}${odmR > 0 ? ` + ${odmR.toLocaleString()}` : ''} reqs</span></td>
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
          <td class="credits-cell" style="color:var(--warn)">FREE PREVIEW — pricing may change</td>
        </tr>`).join('');
    }

    const budgetCredits = Math.floor(cfg.onDemandBudget / cfg.flatRate);
    el.innerHTML = `
      <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1.25rem">
        All models below bill at a flat rate from your request pool at ${fmtCost(cfg.flatRate)}/credit.
        <strong style="color:var(--text)">&#9679;&#9679; 2-credit</strong> models cost ${fmtCost(cfg.flatRate * 2)}/req and halve your effective budget.
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
              <th>Credits &amp; Budget</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="section-tip">
        <strong>Tips:</strong> Disable Auto routing. Avoid Max Mode for credit-pool tasks.
        ${budgetCredits > 0
          ? `After ${cfg.premiumRequests.toLocaleString()} included credits, on-demand kicks in at the same rate (${budgetCredits.toLocaleString()} credits @ ${fmtCost(cfg.flatRate)}/req).`
          : `You have ${cfg.premiumRequests.toLocaleString()} included credits. Set an on-demand budget above to unlock extra requests.`}
      </div>`;
  }

  // ── Render: API Pool ──────────────────────────────────────────────────────
  function renderApiPool(models, cfg, discountInfo) {
    const el = document.getElementById('section-api-pool');
    if (!el) return;

    const eligible = models.filter(m => !m.isMaxOnly && m.tier !== 'daily_driver' && m.requestPrice === null && m.inPrice > 0);
    const apSubtitle = document.getElementById('api-pool-subtitle');
    if (apSubtitle) apSubtitle.textContent = eligible.length
      ? `${eligible.length} per-token model${eligible.length !== 1 ? 's' : ''} — bills from your on-demand budget`
      : 'Per-token models — bills from your on-demand budget';
    if (!eligible.length) { el.innerHTML = '<p class="empty-state">No API-pool per-token models in current data.</p>'; return; }

    if (eligible.length === 1) {
      const m       = eligible[0];
      const heavy   = TASKS.find(t => t.key === 'heavy')   || TASKS[0];
      const trivial = TASKS.find(t => t.key === 'trivial') || TASKS[TASKS.length - 1];
      const cHeavy  = costPerRequest(m, heavy.in, heavy.out, cfg, discountInfo);
      const cTriv   = costPerRequest(m, trivial.in, trivial.out, cfg, discountInfo);
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
      const best = bestModelForTask(models, task.preferredTier, task.strategy, task.in, task.out, cfg, discountInfo);
      if (!best) {
        rows += `<tr><td>${task.label}</td><td colspan="3" style="color:var(--text-muted)">(none)</td></tr>`;
        continue;
      }
      const cost  = costPerRequest(best, task.in, task.out, cfg, discountInfo);
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
  function renderMaxMode(models, cfg, discountInfo) {
    const el = document.getElementById('section-max-mode');
    if (!el) return;

    const maxModels = models.filter(m => m.isMaxOnly && m.requestPrice === null);
    const mmSubtitle = document.getElementById('max-mode-subtitle');
    if (mmSubtitle) mmSubtitle.textContent = maxModels.length
      ? `${maxModels.length} per-token model${maxModels.length !== 1 ? 's' : ''} — per-token billing, use with care`
      : 'Per-token, no request credits consumed — use with care';
    if (!maxModels.length) { el.innerHTML = '<p class="empty-state">No Max Mode models in current data.</p>'; return; }

    const heavy = TASKS.find(t => t.key === 'heavy') || TASKS[0];
    const light = TASKS.find(t => t.key === 'light') || TASKS[2] || TASKS[0];
    const surcharge = Math.round((cfg.overhead - 1) * 100);

    const sorted = maxModels.slice().sort((a, b) =>
      costPerRequest(a, heavy.in, heavy.out, cfg, discountInfo) - costPerRequest(b, heavy.in, heavy.out, cfg, discountInfo)
    );

    let rows = '';
    for (const m of sorted) {
      const cHeavy = costPerRequest(m, heavy.in, heavy.out, cfg, discountInfo);
      const cLight = costPerRequest(m, light.in, light.out, cfg, discountInfo);
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

  // ── Render: Header subtitle + config card summary ────────────────────────
  function renderSubtitle(cfg, discountInfo) {
    const el = document.getElementById('header-subtitle');
    if (el) {
      const credits = Math.floor(cfg.onDemandBudget / cfg.flatRate);
      el.textContent = `${cfg.premiumRequests.toLocaleString()} included credits · $${cfg.onDemandBudget.toFixed(0)} on-demand (${credits.toLocaleString()} credits @ ${fmtCost(cfg.flatRate)}/req)`;
    }
    const configSub = document.getElementById('config-summary-text');
    if (configSub) {
      const parts = [
        `${cfg.premiumRequests.toLocaleString()} credits`,
        `$${cfg.onDemandBudget.toFixed(0)} on-demand`,
      ];
      if (discountInfo && discountInfo.active) {
        const scope = cfg.discountScope === 'all' ? 'all models' : 'frontier models';
        parts.push(`${cfg.discountPct}% off ${scope} · ${discountInfo.daysRemaining}d left`);
      }
      configSub.textContent = parts.join(' · ');
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

  // ── Render: Discount status hint ─────────────────────────────────────────
  function renderDiscountStatus(cfg, discountInfo) {
    const el = document.getElementById('discount-expiry-status');
    if (!el) return;
    if (cfg.discountScope === 'none' || cfg.discountPct <= 0) { el.textContent = ''; return; }
    if (discountInfo.expired) {
      el.textContent = 'Discount expired';
      el.style.color = 'var(--warn)';
      return;
    }
    if (discountInfo.active) {
      const scope = cfg.discountScope === 'all' ? 'all models' : 'frontier models';
      el.textContent = `${cfg.discountPct}% off ${scope} · ${discountInfo.daysRemaining} day${discountInfo.daysRemaining !== 1 ? 's' : ''} remaining`;
      el.style.color = 'var(--accent-light)';
    }
  }

  // ── Render: Model selection card ──────────────────────────────────────────
  function renderModelSelectionCard(allModels, cfg, discountInfo) {
    const list    = document.getElementById('model-sel-list');
    const summary = document.getElementById('model-sel-summary');
    if (!list) return;

    const filterVal = (document.getElementById('model-sel-search')?.value || '').toLowerCase();

    // Group models by provider
    const byProvider = {};
    for (const m of allModels) {
      const p = m.provider || 'Other';
      (byProvider[p] = byProvider[p] || []).push(m);
    }

    list.innerHTML = '';

    for (const prov of Object.keys(byProvider).sort()) {
      const provModels = byProvider[prov]
        .slice()
        .sort(cmpTierKey)
        .filter(m => !filterVal ||
          (m.displayName || '').toLowerCase().includes(filterVal) ||
          m.name.toLowerCase().includes(filterVal));
      if (!provModels.length) continue;

      const groupEl = document.createElement('li');
      groupEl.className = 'model-sel-group';

      const hdr = document.createElement('div');
      hdr.className = 'model-sel-group-header';
      hdr.textContent = prov;
      groupEl.appendChild(hdr);

      const itemsEl = document.createElement('ul');
      itemsEl.className = 'model-sel-group-items';

      for (const m of provModels) {
        const isSelected  = _selectedModelNames ? _selectedModelNames.has(m.name) : false;
        const isDiscounted = isModelDiscounted(m, discountInfo);
        const id = `msel-${m.name}`;

        const li = document.createElement('li');
        li.className = 'model-sel-item';

        const discBadge = (discountInfo.active && isDiscounted)
          ? `<span class="discount-badge">${cfg.discountPct}% off</span>` : '';

        li.innerHTML = `
          <label class="model-sel-label" for="${id}">
            <span class="model-sel-name">${m.displayName || m.name}</span>
            <span class="model-sel-meta">${tierBadge(m.intelligenceTier)}${discBadge}</span>
          </label>
          <button role="switch" aria-checked="${isSelected}" id="${id}"
            class="model-toggle${isSelected ? ' is-on' : ''}"
            data-model="${m.name}"
            aria-label="Toggle ${m.displayName || m.name}"></button>`;

        itemsEl.appendChild(li);
      }

      groupEl.appendChild(itemsEl);
      list.appendChild(groupEl);
    }

    const selectedCount = _selectedModelNames ? allModels.filter(m => _selectedModelNames.has(m.name)).length : 0;
    const noSelNote = (_selectedModelNames && _selectedModelNames.size === 0)
      ? ' — showing defaults (no models selected)' : '';

    if (summary) {
      summary.textContent = `${selectedCount} of ${allModels.length} models selected${noSelNote}`;
    }

    // Update the collapsible card subtitle with selected count
    const cardSubtitle = document.getElementById('model-sel-card-subtitle');
    if (cardSubtitle) {
      cardSubtitle.textContent = `${selectedCount} of ${allModels.length} models selected`;
    }

    // Event delegation for toggles
    list.onclick = (e) => {
      const btn = e.target.closest('[role="switch"]');
      if (!btn) return;
      const name = btn.dataset.model;
      if (!name || !_selectedModelNames) return;
      if (_selectedModelNames.has(name)) {
        _selectedModelNames.delete(name);
      } else {
        _selectedModelNames.add(name);
      }
      saveSelectedModels();
      renderAll(_activeModels);
    };
  }

  // ── Master render ─────────────────────────────────────────────────────────
  function renderAll(allModels) {
    const cfg          = getConfig();
    const models       = getActiveModels(allModels);
    const discountInfo = getDiscountInfo(cfg);
    renderModelSelectionCard(allModels, cfg, discountInfo);
    renderSubtitle(cfg, discountInfo);
    renderDiscountStatus(cfg, discountInfo);
    renderTldr(models, cfg, discountInfo);
    renderRequestPool(models, cfg, discountInfo);
    renderApiPool(models, cfg, discountInfo);
    renderMaxMode(models, cfg, discountInfo);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  let _activeModels = MODEL_DATA;

  // Render model selection + config subtitle immediately so nothing is empty on load
  loadSelectedModels(MODEL_DATA);
  const _initCfg = getConfig();
  const _initDi  = getDiscountInfo(_initCfg);
  renderSubtitle(_initCfg, _initDi);
  renderModelSelectionCard(MODEL_DATA, _initCfg, _initDi);

  loadModels().then(({ models, date, source }) => {
    _activeModels = models;
    updateBadge(source, date);
    loadSelectedModels(models);
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

  // Model search (filter only — no cost recalc)
  document.getElementById('model-sel-search')?.addEventListener('input', () => {
    if (_activeModels) renderModelSelectionCard(_activeModels, getConfig(), getDiscountInfo(getConfig()));
  });

  // Select all / deselect all
  document.getElementById('btn-sel-all')?.addEventListener('click', () => {
    if (!_selectedModelNames || !_activeModels) return;
    _activeModels.forEach(m => _selectedModelNames.add(m.name));
    saveSelectedModels();
    renderAll(_activeModels);
  });
  document.getElementById('btn-sel-none')?.addEventListener('click', () => {
    if (!_selectedModelNames) return;
    _selectedModelNames.clear();
    saveSelectedModels();
    renderAll(_activeModels);
  });

  // Discount inputs
  ['cfg-discount-pct', 'cfg-discount-expiry'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderAll(_activeModels), 150);
    });
  });
  document.getElementById('cfg-discount-scope')?.addEventListener('change', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => renderAll(_activeModels), 150);
  });

})();
