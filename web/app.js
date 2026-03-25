const SWIFT_DATA_PATH = "../Sources/PeptideGuideApp/Data/MockCompounds.swift";
const STORAGE_KEY = "peptideguide-web-state-v2";

const laneConfig = {
  metabolism: {
    id: "metabolism",
    title: "Metabolism / Fat Loss",
    subtitle: "Appetite, glucose handling, body composition, and metabolic signaling.",
    icon: "scalemass",
  },
  recovery: {
    id: "recovery",
    title: "Recovery / Healing",
    subtitle: "Repair-oriented compounds focused on tissue recovery and inflammatory tone.",
    icon: "cross.case",
  },
  cognitive: {
    id: "cognitive",
    title: "Cognitive / Mood",
    subtitle: "Focus, stress resilience, mood, and neuro-supportive pathways.",
    icon: "brain.head.profile",
  },
  performance: {
    id: "performance",
    title: "Performance / Growth",
    subtitle: "Growth hormone secretagogues, performance signaling, and physique support.",
    icon: "figure.strengthtraining.traditional",
  },
  immune: {
    id: "immune",
    title: "Immune / Systemic",
    subtitle: "Immune communication, mucosal health, and systemic regulation.",
    icon: "allergens",
  },
  appearance: {
    id: "appearance",
    title: "Appearance",
    subtitle: "Skin, hair, pigmentation, and visible quality-of-life oriented compounds.",
    icon: "sparkles",
  },
  energy: {
    id: "energy",
    title: "Cellular Energy",
    subtitle: "Mitochondrial efficiency, endurance, and cellular energy maintenance.",
    icon: "bolt.heart",
  },
};

const libraryNav = [
  { id: "home", title: "Home", icon: "house" },
  { id: "explore", title: "Explore", icon: "magnifyingglass" },
  { id: "compare", title: "Compare", icon: "square.split.2x2" },
  { id: "saved", title: "Saved", icon: "bookmark" },
];

const preferenceNav = { id: "preferences", title: "Preferences", icon: "gearshape" };

const viewMeta = {
  home: {
    title: "Home",
    subtitle: "Explore compounds by goal and return to recent work quickly.",
  },
  explore: {
    title: "Explore All Compounds",
    subtitle: "Search by name, category, tag, or summary text.",
  },
  compare: {
    title: "Compare Compounds",
    subtitle: "Compare 2-3 compounds side by side across mechanism, systems, and differentiators.",
  },
  saved: {
    title: "Saved",
    subtitle: "Bookmarks and saved compare sets persist in this browser.",
  },
  preferences: {
    title: "Preferences",
    subtitle: "Adjust launch behavior and reading density for the detail pane.",
  },
};

const compareRows = [
  { label: "Primary systems affected", key: "primarySystems" },
  { label: "Appetite effect", key: "appetiteEffect" },
  { label: "Recovery relevance", key: "recoveryRelevance" },
  { label: "Cognitive relevance", key: "cognitiveRelevance" },
  { label: "Energy / mitochondria relevance", key: "energyRelevance" },
  { label: "Research maturity", key: "researchMaturity" },
  { label: "Notable differentiators", key: "differentiators" },
];

const suggestedNames = ["Retatrutide", "BPC-157", "Semax", "SS-31"];
const trendingNames = ["Tirzepatide", "Tesamorelin", "GHK-Cu", "MOTS-c"];

const app = document.querySelector("#app");

const state = {
  compounds: [],
  compoundMap: new Map(),
  view: { name: "home" },
  selectedCompoundId: null,
  savedIds: [],
  compareIds: [],
  savedCompareSets: [],
  recentIds: [],
  searchText: "",
  activeTags: [],
  sortOption: "alphabetical",
  preferredLaunchScreen: "home",
  readingDensity: "comfortable",
  pickerOpen: false,
  pickerFilter: "",
  focusTarget: null,
};

boot();

async function boot() {
  restoreState();
  bindEvents();

  try {
    const response = await fetch(SWIFT_DATA_PATH);
    if (!response.ok) {
      throw new Error(`Unable to load ${SWIFT_DATA_PATH}`);
    }

    const source = await response.text();
    state.compounds = parseMockCompoundsSource(source);
    state.compoundMap = new Map(state.compounds.map((compound) => [compound.id, compound]));
    parseHashRoute(true);
    ensureSelection();
    renderApp();
  } catch (error) {
    renderError(error);
  }
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    parseHashRoute(false);
    ensureSelection();
    renderApp();
  });

  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      state.focusTarget = "search";
      setView({ name: "explore" });
      return;
    }

    if (event.key === "Escape" && state.pickerOpen) {
      state.pickerOpen = false;
      renderApp();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const actionNode = target.closest("[data-action]");
    if (actionNode) {
      handleAction(actionNode, event);
      return;
    }

    if (state.pickerOpen && target.classList.contains("modal-backdrop")) {
      state.pickerOpen = false;
      renderApp();
      return;
    }

    const compoundCard = target.closest("[data-compound-card]");
    if (compoundCard) {
      openCompound(compoundCard.dataset.compoundCard, true);
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.dataset.role === "search") {
      state.searchText = target.value;
      state.focusTarget = "search";
      renderApp();
      return;
    }

    if (target.dataset.role === "picker-filter") {
      state.pickerFilter = target.value;
      state.focusTarget = "picker-filter";
      renderApp();
    }
  });
}

function handleAction(node, event) {
  const action = node.dataset.action;
  if (!action) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (action === "set-view") {
    setView({ name: node.dataset.view });
    return;
  }

  if (action === "set-lane") {
    setView({ name: "lane", laneId: node.dataset.lane });
    return;
  }

  if (action === "toggle-save") {
    toggleSaved(node.dataset.id);
    return;
  }

  if (action === "toggle-compare") {
    toggleCompare(node.dataset.id);
    return;
  }

  if (action === "remove-compare") {
    removeCompare(node.dataset.id);
    return;
  }

  if (action === "clear-tags") {
    state.activeTags = [];
    persistState();
    renderApp();
    return;
  }

  if (action === "toggle-tag") {
    toggleTag(node.dataset.tag);
    return;
  }

  if (action === "set-sort") {
    state.sortOption = node.dataset.sort;
    persistState();
    renderApp();
    return;
  }

  if (action === "open-compound") {
    openCompound(node.dataset.id, true);
    return;
  }

  if (action === "share-compound") {
    shareCompound(node.dataset.id);
    return;
  }

  if (action === "open-picker") {
    if (state.compareIds.length >= 3) {
      return;
    }
    state.pickerOpen = true;
    state.pickerFilter = "";
    state.focusTarget = "picker-filter";
    renderApp();
    return;
  }

  if (action === "close-picker") {
    state.pickerOpen = false;
    renderApp();
    return;
  }

  if (action === "picker-add") {
    addCompare(node.dataset.id);
    state.pickerOpen = state.compareIds.length < 3;
    state.focusTarget = state.pickerOpen ? "picker-filter" : null;
    renderApp();
    return;
  }

  if (action === "save-compare-set") {
    saveCompareSet();
    return;
  }

  if (action === "load-compare-set") {
    loadCompareSet(node.dataset.id);
    return;
  }

  if (action === "delete-compare-set") {
    deleteCompareSet(node.dataset.id);
    return;
  }

  if (action === "set-launch-screen") {
    state.preferredLaunchScreen = node.dataset.value;
    persistState();
    renderApp();
    return;
  }

  if (action === "set-density") {
    state.readingDensity = node.dataset.value;
    persistState();
    renderApp();
  }
}

function parseMockCompoundsSource(source) {
  const blocks = source
    .split("makeCompound(")
    .slice(1)
    .map((segment) => segment.split("\n        )")[0]);

  return blocks.map((block) => {
    const fields = {};

    block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const match = line.match(/^(\w+):\s*(.+?)(,)?$/);
        if (!match) {
          return;
        }
        const [, key, value] = match;
        fields[key] = value;
      });

    const categories = parseCategoryArray(fields.categories);
    const tags = parseStringArray(fields.tags);
    const name = parseQuotedValue(fields.name);
    const id = slugify(name);
    const resources = buildResourceLinks(name);

    return {
      id,
      name,
      categories,
      category: categories.map((categoryId) => laneConfig[categoryId].title).join(" • "),
      categorySummary: categories[0] ? laneConfig[categories[0]].subtitle : "",
      lanes: categories,
      tags,
      summary: parseQuotedValue(fields.summary),
      mechanism: parseQuotedValue(fields.mechanism),
      benefits: parseQuotedValue(fields.benefits),
      research: parseQuotedValue(fields.research),
      primarySystems: parseQuotedValue(fields.primarySystems),
      appetiteEffect: parseQuotedValue(fields.appetiteEffect),
      recoveryRelevance: parseQuotedValue(fields.recoveryRelevance),
      cognitiveRelevance: parseQuotedValue(fields.cognitiveRelevance),
      energyRelevance: parseQuotedValue(fields.energyRelevance),
      researchMaturity: parseQuotedValue(fields.researchMaturity),
      differentiators: parseQuotedValue(fields.differentiators),
      resources,
      searchableText: [
        name,
        categories.map((categoryId) => laneConfig[categoryId].title).join(" "),
        tags.join(" "),
        parseQuotedValue(fields.summary),
        parseQuotedValue(fields.mechanism),
        parseQuotedValue(fields.benefits),
        parseQuotedValue(fields.research),
        parseQuotedValue(fields.primarySystems),
        parseQuotedValue(fields.differentiators),
      ]
        .join(" ")
        .toLowerCase(),
    };
  });
}

function parseQuotedValue(value = "") {
  const normalized = value.trim().replace(/,$/, "");
  if (normalized.startsWith("\"") && normalized.endsWith("\"")) {
    return normalized.slice(1, -1);
  }
  return normalized;
}

function parseStringArray(value = "") {
  return Array.from(value.matchAll(/"([^"]+)"/g)).map((match) => match[1]);
}

function parseCategoryArray(value = "") {
  return Array.from(value.matchAll(/\.(\w+)/g)).map((match) => match[1]);
}

function buildResourceLinks(name) {
  const query = encodeURIComponent(name.replace(/\//g, " "));
  return [
    {
      title: "PubMed Search",
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${query}`,
    },
    {
      title: "ClinicalTrials.gov",
      url: `https://clinicaltrials.gov/search?term=${query}`,
    },
    {
      title: "Google Scholar Overview",
      url: `https://scholar.google.com/scholar?q=${query}`,
    },
  ];
}

function parseHashRoute(initialLoad) {
  const rawHash = window.location.hash.replace(/^#\/?/, "");
  if (!rawHash) {
    state.view = { name: initialLoad ? state.preferredLaunchScreen : "home" };
    return;
  }

  const [head, tail] = rawHash.split("/");
  if (head === "lane" && laneConfig[tail]) {
    state.view = { name: "lane", laneId: tail };
    return;
  }

  if (viewMeta[head]) {
    state.view = { name: head };
    return;
  }

  state.view = { name: "home" };
}

function routeHash(view) {
  if (view.name === "lane") {
    return `#/lane/${view.laneId}`;
  }
  return `#/${view.name}`;
}

function setView(view) {
  state.view = view;
  const nextHash = routeHash(view);
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
    return;
  }
  renderApp();
}

function openCompound(id, trackView) {
  if (!state.compoundMap.has(id)) {
    return;
  }

  state.selectedCompoundId = id;
  if (trackView) {
    state.recentIds = [id, ...state.recentIds.filter((currentId) => currentId !== id)].slice(0, 8);
  }

  persistState();
  renderApp();
}

function toggleSaved(id) {
  if (state.savedIds.includes(id)) {
    state.savedIds = state.savedIds.filter((savedId) => savedId !== id);
  } else {
    state.savedIds = [...state.savedIds, id];
  }

  persistState();
  renderApp();
}

function addCompare(id) {
  if (state.compareIds.includes(id) || state.compareIds.length >= 3) {
    return;
  }

  state.compareIds = [...state.compareIds, id];
  state.selectedCompoundId = id;
  state.recentIds = [id, ...state.recentIds.filter((currentId) => currentId !== id)].slice(0, 8);
  persistState();
}

function removeCompare(id) {
  state.compareIds = state.compareIds.filter((compareId) => compareId !== id);
  persistState();
  renderApp();
}

function toggleCompare(id) {
  if (state.compareIds.includes(id)) {
    state.compareIds = state.compareIds.filter((compareId) => compareId !== id);
  } else if (state.compareIds.length < 3) {
    state.compareIds = [...state.compareIds, id];
  } else {
    state.pickerOpen = true;
    state.focusTarget = "picker-filter";
  }

  persistState();
  renderApp();
}

function toggleTag(tag) {
  if (state.activeTags.includes(tag)) {
    state.activeTags = state.activeTags.filter((currentTag) => currentTag !== tag);
  } else {
    state.activeTags = [...state.activeTags, tag];
  }

  persistState();
  renderApp();
}

function saveCompareSet() {
  if (state.compareIds.length < 2) {
    return;
  }

  const normalizedIds = [...state.compareIds];
  const exists = state.savedCompareSets.some((set) => arrayEquals(set.ids, normalizedIds));
  if (exists) {
    return;
  }

  state.savedCompareSets = [
    {
      id: `compare-${Date.now()}`,
      title: normalizedIds.map((id) => state.compoundMap.get(id)?.name || id).join(" vs "),
      ids: normalizedIds,
    },
    ...state.savedCompareSets,
  ];

  persistState();
  renderApp();
}

function loadCompareSet(id) {
  const selectedSet = state.savedCompareSets.find((set) => set.id === id);
  if (!selectedSet) {
    return;
  }

  state.compareIds = selectedSet.ids.filter((compoundId) => state.compoundMap.has(compoundId)).slice(0, 3);
  if (state.compareIds[0]) {
    state.selectedCompoundId = state.compareIds[0];
  }

  persistState();
  setView({ name: "compare" });
}

function deleteCompareSet(id) {
  state.savedCompareSets = state.savedCompareSets.filter((set) => set.id !== id);
  persistState();
  renderApp();
}

function shareCompound(id) {
  const compound = state.compoundMap.get(id);
  if (!compound) {
    return;
  }

  const shareText = `${compound.name}\n${compound.category}\n${window.location.href}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(shareText).catch(() => {
      window.alert(`Copy this compound manually:\n\n${shareText}`);
    });
    return;
  }

  window.alert(`Copy this compound manually:\n\n${shareText}`);
}

function ensureSelection() {
  if (state.selectedCompoundId && state.compoundMap.has(state.selectedCompoundId)) {
    return;
  }

  const fallbackId = state.recentIds.find((id) => state.compoundMap.has(id))
    || nameListToIds(suggestedNames).find((id) => state.compoundMap.has(id))
    || state.compounds[0]?.id
    || null;

  state.selectedCompoundId = fallbackId;
}

function filteredCompounds(laneId = null) {
  const query = state.searchText.trim().toLowerCase();
  return state.compounds.filter((compound) => {
    const matchesLane = !laneId || compound.lanes.includes(laneId);
    const matchesTags = state.activeTags.length === 0 || state.activeTags.every((tag) => compound.tags.includes(tag));
    const matchesQuery = !query || compound.searchableText.includes(query);
    return matchesLane && matchesTags && matchesQuery;
  });
}

function sortedCompounds(compounds) {
  if (state.sortOption === "alphabetical") {
    return [...compounds].sort((left, right) => left.name.localeCompare(right.name));
  }

  if (state.sortOption === "savedFirst") {
    return [...compounds].sort((left, right) => {
      const leftSaved = state.savedIds.includes(left.id);
      const rightSaved = state.savedIds.includes(right.id);
      if (leftSaved === rightSaved) {
        return left.name.localeCompare(right.name);
      }
      return leftSaved ? -1 : 1;
    });
  }

  const recentOrder = new Map(state.recentIds.map((id, index) => [id, index]));
  return [...compounds].sort((left, right) => {
    const leftOrder = recentOrder.has(left.id) ? recentOrder.get(left.id) : Number.MAX_SAFE_INTEGER;
    const rightOrder = recentOrder.has(right.id) ? recentOrder.get(right.id) : Number.MAX_SAFE_INTEGER;
    if (leftOrder === rightOrder) {
      return left.name.localeCompare(right.name);
    }
    return leftOrder - rightOrder;
  });
}

function availableTags(laneId = null) {
  const source = state.compounds.filter((compound) => !laneId || compound.lanes.includes(laneId));
  return unique(source.flatMap((compound) => compound.tags)).sort((left, right) => left.localeCompare(right));
}

function compoundsFromIds(ids) {
  return ids.map((id) => state.compoundMap.get(id)).filter(Boolean);
}

function nameListToIds(names) {
  return names.map((name) => slugify(name));
}

function renderApp() {
  if (!state.compounds.length) {
    return;
  }

  ensureSelection();

  app.innerHTML = `
    <div class="shell">
      ${renderSidebar()}
      <main class="workspace">
        <div class="workspace-scroll">
          ${renderWorkspace()}
        </div>
      </main>
      <aside class="inspector reading-${escapeHtml(state.readingDensity)}">
        <div class="inspector-scroll">
          ${renderInspector()}
        </div>
      </aside>
    </div>
    ${state.pickerOpen ? renderPickerModal() : ""}
  `;

  restoreFocus();
}

function renderSidebar() {
  const compareCount = state.compareIds.length;
  const savedCount = state.savedIds.length;
  const laneItems = Object.values(laneConfig).map((lane) => ({
    ...lane,
    count: state.compounds.filter((compound) => compound.lanes.includes(lane.id)).length,
  }));

  return `
    <aside class="sidebar">
      <div class="sidebar-head">
        <div class="brand-row">
          <div class="brand-mark">PG</div>
          <div class="brand-copy">
            <strong>PeptideGuide</strong>
            <span>Research workspace</span>
          </div>
        </div>
      </div>

      <div class="sidebar-nav">
        <section class="nav-group" data-reveal style="--delay: 40ms">
          <div class="nav-label">Library</div>
          ${libraryNav
            .map((item) => renderNavItem(item, state.view.name === item.id, item.id === "compare" ? compareCount : item.id === "saved" ? savedCount : null))
            .join("")}
        </section>

        <section class="nav-group" data-reveal style="--delay: 100ms">
          <div class="nav-label">Lanes</div>
          ${laneItems
            .map((item) => renderLaneNavItem(item, state.view.name === "lane" && state.view.laneId === item.id))
            .join("")}
        </section>

        <section class="nav-group" data-reveal style="--delay: 140ms">
          <div class="nav-label">Settings</div>
          ${renderNavItem(preferenceNav, state.view.name === "preferences", null)}
        </section>
      </div>
    </aside>
  `;
}

function renderNavItem(item, isActive, count) {
  return `
    <button class="nav-item ${isActive ? "is-active" : ""}" data-action="set-view" data-view="${escapeHtml(item.id)}">
      <span class="nav-item-main">
        <span class="nav-item-icon">${renderIcon(item.icon)}</span>
        <span class="nav-item-title">${escapeHtml(item.title)}</span>
      </span>
      ${count ? `<span class="nav-count">${count}</span>` : ""}
    </button>
  `;
}

function renderLaneNavItem(item, isActive) {
  return `
    <button class="nav-item nav-item-lane ${isActive ? "is-active" : ""}" data-action="set-lane" data-lane="${escapeHtml(item.id)}">
      <span class="nav-item-main">
        <span class="nav-item-icon">${renderIcon(item.icon)}</span>
        <span class="nav-item-title">${escapeHtml(item.title)}</span>
      </span>
      <span class="nav-count">${item.count}</span>
    </button>
  `;
}

function renderWorkspace() {
  const meta = currentViewMeta();
  return `
    <section class="workspace-head" data-reveal style="--delay: 40ms">
      <div>
        <h1>${escapeHtml(meta.title)}</h1>
        <p>${escapeHtml(meta.subtitle)}</p>
      </div>
      <div class="workspace-actions">
        <button class="button-ghost" data-action="set-view" data-view="explore">Browse library</button>
        <button class="button" data-action="open-picker" ${state.compareIds.length >= 3 ? "disabled" : ""}>Add to compare</button>
      </div>
    </section>
    <section class="workspace-body">
      ${renderViewBody()}
    </section>
  `;
}

function currentViewMeta() {
  if (state.view.name === "lane") {
    const lane = laneConfig[state.view.laneId];
    return {
      title: lane.title,
      subtitle: lane.subtitle,
    };
  }

  return viewMeta[state.view.name] || viewMeta.home;
}

function renderViewBody() {
  switch (state.view.name) {
    case "explore":
      return renderExploreView();
    case "compare":
      return renderCompareView();
    case "saved":
      return renderSavedView();
    case "preferences":
      return renderPreferencesView();
    case "lane":
      return renderLaneView(state.view.laneId);
    case "home":
    default:
      return renderHomeView();
  }
}

function renderHomeView() {
  const suggested = compoundsFromIds(nameListToIds(suggestedNames));
  const recent = compoundsFromIds(state.recentIds);
  const laneCards = Object.values(laneConfig);

  return `
    <div class="metric-strip">
      <div class="metric" data-reveal style="--delay: 60ms">
        <strong>${state.compounds.length}</strong>
        <span>Compound profiles</span>
      </div>
      <div class="metric" data-reveal style="--delay: 100ms">
        <strong>${Object.keys(laneConfig).length}</strong>
        <span>Goal-oriented lanes</span>
      </div>
      <div class="metric" data-reveal style="--delay: 140ms">
        <strong>${state.savedIds.length}</strong>
        <span>Saved compounds</span>
      </div>
    </div>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 180ms">
        <div>
          <h2 class="section-title">Explore by lane</h2>
          <p class="section-copy">Mechanisms, research, and potential benefits organized into focused lanes.</p>
        </div>
      </div>
      <div class="lane-grid">
        ${laneCards
          .map((lane, index) => renderLaneCard(lane, state.compounds.filter((compound) => compound.lanes.includes(lane.id)).length, 220 + index * 30))
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 360ms">
        <div>
          <h2 class="section-title">Suggested for you</h2>
          <p class="section-copy">A curated starting set for fast exploration.</p>
        </div>
      </div>
      <div class="card-grid">
        ${renderCompoundCards(suggested, true, 390)}
      </div>
    </section>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 500ms">
        <div>
          <h2 class="section-title">Recently viewed</h2>
          <p class="section-copy">Shortcuts back to compounds you opened in the detail pane.</p>
        </div>
      </div>
      ${recent.length
        ? `<div class="card-grid">${renderCompoundCards(recent, true, 540)}</div>`
        : renderEmptyState("No recent compounds", "Open a compound from any lane or from Explore to populate this section.", "RV", 540)}
    </section>
  `;
}

function renderExploreView() {
  const results = sortedCompounds(filteredCompounds());
  const trending = compoundsFromIds(nameListToIds(trendingNames));

  return `
    ${renderSearchPanel(null, 60)}
    ${!state.searchText
      ? `
        <section class="section">
          <div class="section-head" data-reveal style="--delay: 120ms">
            <div>
              <h2 class="section-title">Trending</h2>
              <p class="section-copy">High-interest compounds worth opening first.</p>
            </div>
          </div>
          <div class="card-grid">
            ${renderCompoundCards(trending, true, 160)}
          </div>
        </section>
      `
      : ""}
    <section class="section">
      <div class="section-head" data-reveal style="--delay: 240ms">
        <div>
          <h2 class="section-title">${state.searchText ? "Results" : "All compounds"}</h2>
          <p class="section-copy">${results.length} matches across the full library.</p>
        </div>
      </div>
      ${results.length
        ? `<div class="card-grid">${renderCompoundCards(results, false, 270)}</div>`
        : renderEmptyState("No matches found", "Try a different search term or clear one or more selected tags.", "SR", 270)}
    </section>
  `;
}

function renderLaneView(laneId) {
  const lane = laneConfig[laneId];
  const results = sortedCompounds(filteredCompounds(laneId));

  return `
    ${renderSearchPanel(laneId, 60)}
    <section class="section">
      <div class="section-head section-head-stack" data-reveal style="--delay: 120ms">
        <div>
          <h2 class="section-title">${escapeHtml(lane.title)}</h2>
          <p class="section-copy">${escapeHtml(lane.subtitle)}</p>
        </div>
        <div class="segmented">
          ${["alphabetical", "recentlyViewed", "savedFirst"]
            .map(
              (sortOption) => `
                <button class="chip ${state.sortOption === sortOption ? "is-active" : ""}" data-action="set-sort" data-sort="${sortOption}">
                  ${escapeHtml(sortLabel(sortOption))}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
      ${results.length
        ? `<div class="card-grid">${renderCompoundCards(results, false, 170)}</div>`
        : renderEmptyState("No matching compounds", "Clear one or more tags to see the full lane again.", "LN", 170)}
    </section>
  `;
}

function renderCompareView() {
  const compareCompounds = compoundsFromIds(state.compareIds);

  return `
    <section class="compare-surface" data-reveal style="--delay: 80ms">
      <div class="compare-toolbar">
        <div>
          <h2 class="section-title">Selected Compounds</h2>
          <p class="section-copy">Choose 2-3 compounds to compare mechanism, systems, and differentiators.</p>
        </div>
        <div class="surface-actions">
          <button class="button-ghost" data-action="save-compare-set" ${compareCompounds.length < 2 ? "disabled" : ""}>Save set</button>
          <button class="button" data-action="open-picker" ${compareCompounds.length >= 3 ? "disabled" : ""}>Add Compound</button>
        </div>
      </div>

      ${compareCompounds.length
        ? `
          <div class="compare-pill-row">
            ${compareCompounds
              .map(
                (compound) => `
                  <div class="compare-pill">
                    <button class="compare-pill-name" data-action="open-compound" data-id="${escapeHtml(compound.id)}">${escapeHtml(compound.name)}</button>
                    <button class="compare-pill-remove" data-action="remove-compare" data-id="${escapeHtml(compound.id)}">×</button>
                  </div>
                `,
              )
              .join("")}
          </div>
        `
        : `<p class="section-copy compare-empty-note">No compounds selected yet.</p>`}
    </section>

    <section class="section">
      ${compareCompounds.length >= 2
        ? renderCompareTable(compareCompounds)
        : renderEmptyState("Build a comparison", "Add at least two compounds to render the comparison table.", "CP", 180)}
    </section>
  `;
}

function renderSavedView() {
  const savedCompounds = sortedCompounds(compoundsFromIds(state.savedIds));

  return `
    <section class="section">
      <div class="section-head" data-reveal style="--delay: 80ms">
        <div>
          <h2 class="section-title">Saved compounds</h2>
          <p class="section-copy">Bookmarks are stored locally and can be reopened from any route.</p>
        </div>
      </div>
      ${savedCompounds.length
        ? `<div class="saved-grid">${renderCompoundCards(savedCompounds, true, 120)}</div>`
        : renderEmptyState("Nothing saved yet", "Use Save from any card or from the detail pane to collect compounds here.", "SV", 140)}
    </section>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 260ms">
        <div>
          <h2 class="section-title">Saved compare sets</h2>
          <p class="section-copy">Persisted comparison bundles you can reopen instantly.</p>
        </div>
      </div>
      ${state.savedCompareSets.length
        ? `
          <div class="saved-grid">
            ${state.savedCompareSets
              .map((set, index) => renderSavedSet(set, 300 + index * 30))
              .join("")}
          </div>
        `
        : renderEmptyState("No saved compare sets", "Save any active comparison from the Compare workspace.", "CS", 300)}
    </section>
  `;
}

function renderPreferencesView() {
  return `
    <section class="preferences-panel" data-reveal style="--delay: 80ms">
      <div class="preferences-row">
        <h2 class="section-title">Launch screen</h2>
        <p class="section-copy">Choose the first workspace shown when no route is present.</p>
        <div class="segmented">
          ${["home", "explore", "compare", "saved"]
            .map(
              (option) => `
                <button class="chip ${state.preferredLaunchScreen === option ? "is-active" : ""}" data-action="set-launch-screen" data-value="${option}">
                  ${escapeHtml(option.charAt(0).toUpperCase() + option.slice(1))}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>

      <div class="preferences-row">
        <h2 class="section-title">Reading density</h2>
        <p class="section-copy">Adjust spacing in the detail pane for scanning or longer reading sessions.</p>
        <div class="segmented">
          ${["comfortable", "compact"]
            .map(
              (option) => `
                <button class="chip ${state.readingDensity === option ? "is-active" : ""}" data-action="set-density" data-value="${option}">
                  ${escapeHtml(option.charAt(0).toUpperCase() + option.slice(1))}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSearchPanel(laneId, delay) {
  const tags = availableTags(laneId);
  return `
    <section class="search-panel" data-reveal style="--delay: ${delay}ms">
      <input class="search-field" type="search" data-role="search" placeholder="Search compounds, tags, or summary text" value="${escapeAttribute(state.searchText)}" />
      <div class="surface-stack">
        ${tags
          .map(
            (tag) => `
              <button class="chip ${state.activeTags.includes(tag) ? "is-active" : ""}" data-action="toggle-tag" data-tag="${escapeAttribute(tag)}">
                ${escapeHtml(tag)}
              </button>
            `,
          )
          .join("")}
        ${state.activeTags.length ? `<button class="button-quiet" data-action="clear-tags">Clear tags</button>` : ""}
      </div>
    </section>
  `;
}

function renderCompoundCards(compounds, compact, startDelay) {
  return compounds.map((compound, index) => renderCompoundCard(compound, compact, startDelay + index * 30)).join("");
}

function renderCompoundCard(compound, compact, delay) {
  const isSaved = state.savedIds.includes(compound.id);
  const isCompared = state.compareIds.includes(compound.id);
  const isSelected = state.selectedCompoundId === compound.id;

  return `
    <article class="compound-card ${isSelected ? "is-selected" : ""}" data-compound-card="${escapeHtml(compound.id)}" data-compact="${compact}" data-reveal style="--delay: ${delay}ms">
      <div class="compound-card-top">
        <div class="compound-card-title-block">
          <h3>${escapeHtml(compound.name)}</h3>
          <p class="compound-card-category">${escapeHtml(compound.category)}</p>
        </div>
        <button class="card-icon-button" data-action="toggle-save" data-id="${escapeHtml(compound.id)}" aria-label="${isSaved ? "Remove saved compound" : "Save compound"}">
          ${renderIcon(isSaved ? "bookmark.fill" : "bookmark")}
        </button>
      </div>
      <div class="compound-card-main">
        <p class="compound-card-copy">${escapeHtml(compound.summary)}</p>
        <div class="compound-card-tags">
          ${compound.tags.slice(0, compact ? 2 : 3).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <div class="card-actions">
        <button class="button-quiet" data-action="toggle-save" data-id="${escapeHtml(compound.id)}">${isSaved ? "Saved" : "Save"}</button>
        <button class="button-ghost" data-action="toggle-compare" data-id="${escapeHtml(compound.id)}">${isCompared ? "In compare" : "Compare"}</button>
      </div>
    </article>
  `;
}

function renderLaneCard(lane, count, delay) {
  return `
    <button class="lane-card" data-action="set-lane" data-lane="${escapeHtml(lane.id)}" data-reveal style="--delay: ${delay}ms">
      <div class="lane-card-top">
        <span class="lane-mark">${renderIcon(lane.icon)}</span>
        <span class="ghost-chip mono">${count} compounds</span>
      </div>
      <div>
        <h3>${escapeHtml(lane.title)}</h3>
        <p>${escapeHtml(lane.subtitle)}</p>
      </div>
      <div class="lane-card-meta">
        <span class="chip">Open lane</span>
      </div>
    </button>
  `;
}

function renderCompareTable(compounds) {
  return `
    <div class="compare-table-wrap" data-reveal style="--delay: 200ms">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Field</th>
            ${compounds
              .map(
                (compound) => `
                  <th>
                    <div class="compare-heading">
                      <strong>${escapeHtml(compound.name)}</strong>
                      <span>${escapeHtml(compound.category)}</span>
                    </div>
                  </th>
                `,
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${compareRows
            .map(
              (row) => `
                <tr>
                  <th>${escapeHtml(row.label)}</th>
                  ${compounds.map((compound) => `<td>${escapeHtml(compound[row.key])}</td>`).join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSavedSet(set, delay) {
  const names = set.ids.map((id) => state.compoundMap.get(id)?.name).filter(Boolean).join(", ");
  return `
    <article class="saved-set" data-reveal style="--delay: ${delay}ms">
      <div>
        <h3>${escapeHtml(set.title)}</h3>
        <p>${escapeHtml(names)}</p>
      </div>
      <div class="saved-set-meta">
        <span class="ghost-chip mono">${set.ids.length} compounds</span>
      </div>
      <div class="card-actions">
        <button class="button" data-action="load-compare-set" data-id="${escapeHtml(set.id)}">Open set</button>
        <button class="button-danger" data-action="delete-compare-set" data-id="${escapeHtml(set.id)}">Delete</button>
      </div>
    </article>
  `;
}

function renderInspector() {
  const compound = state.compoundMap.get(state.selectedCompoundId);
  if (!compound) {
    return `
      <div class="inspector-empty">
        <div class="inspector-empty-card">
          <h2>Select a Compound</h2>
          <p>Choose a lane or search the library to begin exploring mechanisms, research, and potential benefits.</p>
        </div>
      </div>
    `;
  }

  const isSaved = state.savedIds.includes(compound.id);
  const isCompared = state.compareIds.includes(compound.id);

  return `
    <article class="detail-card" data-reveal style="--delay: 60ms">
      <header class="detail-head">
        <div class="detail-head-top">
          <div>
            <h2>${escapeHtml(compound.name)}</h2>
            <p>${escapeHtml(compound.summary)}</p>
          </div>
        </div>
        <div class="detail-meta">
          ${compound.categories.map((categoryId) => `<span class="ghost-chip">${escapeHtml(laneConfig[categoryId].title)}</span>`).join("")}
          ${compound.tags.slice(0, 4).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </header>

      <div class="detail-actions">
        <button class="button" data-action="toggle-save" data-id="${escapeHtml(compound.id)}">${isSaved ? "Saved" : "Save compound"}</button>
        <button class="button-ghost" data-action="toggle-compare" data-id="${escapeHtml(compound.id)}">${isCompared ? "In compare" : "Add to compare"}</button>
        <button class="button-quiet" data-action="share-compound" data-id="${escapeHtml(compound.id)}">Share</button>
      </div>

      <section class="detail-section">
        <h3>Summary</h3>
        <p class="detail-section-copy">${escapeHtml(compound.summary)}</p>
      </section>

      <section class="detail-section">
        <h3>What it does in the body</h3>
        <p class="detail-section-copy">${escapeHtml(compound.mechanism)}</p>
      </section>

      <section class="detail-section">
        <h3>Potential benefits being studied</h3>
        <p class="detail-section-copy">${escapeHtml(compound.benefits)}</p>
      </section>

      <section class="detail-section">
        <h3>Research snapshot</h3>
        <p class="detail-section-copy">${escapeHtml(compound.research)}</p>
      </section>

      <section class="detail-section">
        <h3>Suggested Resources</h3>
        <div class="resource-list">
          ${compound.resources
            .map(
              (resource) => `
                <a class="resource-link" href="${escapeAttribute(resource.url)}" target="_blank" rel="noreferrer">
                  <span>
                    <strong>${escapeHtml(resource.title)}</strong>
                    <span>${escapeHtml(resource.url)}</span>
                  </span>
                  <span class="resource-link-icon">${renderIcon("arrow.up.right")}</span>
                </a>
              `,
            )
            .join("")}
        </div>
      </section>
    </article>
  `;
}

function renderPickerModal() {
  const query = state.pickerFilter.trim().toLowerCase();
  const candidates = sortedCompounds(state.compounds)
    .filter((compound) => !state.compareIds.includes(compound.id))
    .filter((compound) => !query || compound.searchableText.includes(query));

  return `
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Add to compare">
        <div class="modal-head">
          <div>
            <h2 class="section-title">Add to compare</h2>
            <p class="section-copy">Choose up to three compounds for a side-by-side read.</p>
          </div>
          <button class="button-ghost" data-action="close-picker">Close</button>
        </div>
        <div class="modal-body">
          <input class="search-field" type="search" data-role="picker-filter" placeholder="Filter compounds" value="${escapeAttribute(state.pickerFilter)}" />
          <div class="picker-list">
            ${candidates.length
              ? candidates
                  .map(
                    (compound) => `
                      <article class="picker-item">
                        <div>
                          <h3>${escapeHtml(compound.name)}</h3>
                          <p>${escapeHtml(compound.summary)}</p>
                        </div>
                        <div class="picker-actions">
                          <button class="button" data-action="picker-add" data-id="${escapeHtml(compound.id)}">Add</button>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : renderEmptyState("No compounds found", "Try a broader filter or clear the picker search.", "PK", 0)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEmptyState(title, copy, mark, delay) {
  return `
    <div class="empty-state" ${delay ? `data-reveal style="--delay: ${delay}ms"` : ""}>
      <div class="empty-mark">${escapeHtml(mark)}</div>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(copy)}</p>
      </div>
    </div>
  `;
}

function restoreFocus() {
  if (!state.focusTarget) {
    return;
  }

  const target = document.querySelector(`[data-role="${state.focusTarget}"]`);
  if (target instanceof HTMLInputElement) {
    target.focus();
    const length = target.value.length;
    target.setSelectionRange(length, length);
  }
  state.focusTarget = null;
}

function renderError(error) {
  app.innerHTML = `
    <div class="error-screen">
      <div class="error-card">
        <div class="boot-mark">PG</div>
        <h1>PeptideGuide could not load its data</h1>
        <p>The web app expects to be served from the repo root so it can read <code>${escapeHtml(SWIFT_DATA_PATH)}</code>.</p>
        <p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p>
      </div>
    </div>
  `;
}

function restoreState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    state.savedIds = arrayOrEmpty(parsed.savedIds);
    state.compareIds = arrayOrEmpty(parsed.compareIds);
    state.savedCompareSets = arrayOrEmpty(parsed.savedCompareSets);
    state.recentIds = arrayOrEmpty(parsed.recentIds);
    state.activeTags = arrayOrEmpty(parsed.activeTags);
    state.sortOption = parsed.sortOption || "alphabetical";
    state.preferredLaunchScreen = parsed.preferredLaunchScreen || "home";
    state.readingDensity = parsed.readingDensity || "comfortable";
    state.selectedCompoundId = parsed.selectedCompoundId || null;
  } catch (_error) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function persistState() {
  const payload = {
    savedIds: state.savedIds,
    compareIds: state.compareIds,
    savedCompareSets: state.savedCompareSets,
    recentIds: state.recentIds,
    activeTags: state.activeTags,
    sortOption: state.sortOption,
    preferredLaunchScreen: state.preferredLaunchScreen,
    readingDensity: state.readingDensity,
    selectedCompoundId: state.selectedCompoundId,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function renderIcon(name) {
  const icons = {
    house: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5L12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/></svg>`,
    magnifyingglass: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="5.5"/><path d="M16 16l4 4"/></svg>`,
    "square.split.2x2": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M12 5v14"/><path d="M4 12h16"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h10v15l-5-3-5 3z"/></svg>`,
    "bookmark.fill": `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none"><path d="M7 4.5h10v15l-5-3-5 3z"/></svg>`,
    gearshape: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.25"/><path d="M12 4.5v2.1"/><path d="M12 17.4v2.1"/><path d="M4.5 12h2.1"/><path d="M17.4 12h2.1"/><path d="M6.7 6.7l1.5 1.5"/><path d="M15.8 15.8l1.5 1.5"/><path d="M17.3 6.7l-1.5 1.5"/><path d="M8.2 15.8l-1.5 1.5"/></svg>`,
    scalemass: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9.5h14"/><path d="M12 6.5v3"/><path d="M7 17.5a5 5 0 0 1 10 0"/><path d="M12 14.5l2.8-2"/></svg>`,
    "cross.case": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="11" rx="2"/><path d="M9 7V5.5h6V7"/><path d="M12 10v5"/><path d="M9.5 12.5h5"/></svg>`,
    "brain.head.profile": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 18c-2.8 0-5-2.2-5-5V8a4 4 0 0 1 4-4h2.7c2.4 0 4.3 1.9 4.3 4.3V12a6 6 0 0 1-6 6z"/><path d="M11 8.5a2 2 0 0 0-2 2"/><path d="M11 12.5a2 2 0 0 1-2 2"/></svg>`,
    "figure.strengthtraining.traditional": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10.5h12"/><path d="M4.5 8.5v4"/><path d="M19.5 8.5v4"/><path d="M8.5 10.5l2.5 7"/><path d="M15.5 10.5L13 17.5"/><circle cx="12" cy="6.5" r="1.5"/></svg>`,
    allergens: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5l6 2.3v4.7c0 4-2.3 6.4-6 8.1-3.7-1.7-6-4.1-6-8.1V6.8z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5l1.2 3.3L16.5 9l-3.3 1.2L12 13.5l-1.2-3.3L7.5 9l3.3-1.2z"/><path d="M18 14.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8z"/><path d="M6 14.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8z"/></svg>`,
    "bolt.heart": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3.5L8 12h3l-1 8.5L16 11h-3z"/><path d="M17.5 5.8a2.8 2.8 0 0 1 2.7 2.8c0 2.4-2 4.1-4.7 6.4-2.7-2.3-4.7-4-4.7-6.4a2.8 2.8 0 0 1 4.7-2.1 2.8 2.8 0 0 1 2-0.7z"/></svg>`,
    "arrow.up.right": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16L16 8"/><path d="M9 8h7v7"/></svg>`,
  };

  return icons[name] || "";
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sortLabel(value) {
  if (value === "recentlyViewed") return "Recently Viewed";
  if (value === "savedFirst") return "Saved First";
  return "Alphabetical";
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function arrayEquals(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => item === right[index]);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
