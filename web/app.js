const DATA_PATH = "../Sources/PeptideGuideApp/Resources/peptides.json";
const STORAGE_KEY = "peptideguide-web-state-v1";

const laneConfig = {
  metabolism: {
    id: "metabolism",
    title: "Metabolism / Fat Loss",
    subtitle: "Appetite, glucose handling, body composition, and metabolic signaling.",
    icon: "MT",
  },
  recovery: {
    id: "recovery",
    title: "Recovery / Healing",
    subtitle: "Repair-oriented compounds focused on tissue recovery and inflammatory tone.",
    icon: "RC",
  },
  cognitive: {
    id: "cognitive",
    title: "Cognitive / Mood",
    subtitle: "Focus, stress resilience, mood, and neuro-supportive pathways.",
    icon: "CG",
  },
  performance: {
    id: "performance",
    title: "Performance / Growth",
    subtitle: "Growth hormone secretagogues, performance signaling, and physique support.",
    icon: "PF",
  },
  immune: {
    id: "immune",
    title: "Immune / Systemic",
    subtitle: "Immune communication, mucosal health, and systemic regulation.",
    icon: "IM",
  },
  appearance: {
    id: "appearance",
    title: "Appearance",
    subtitle: "Skin, hair, pigmentation, and visible quality-of-life oriented compounds.",
    icon: "AP",
  },
  energy: {
    id: "energy",
    title: "Cellular Energy",
    subtitle: "Mitochondrial efficiency, endurance, and cellular energy maintenance.",
    icon: "EN",
  },
};

const goalLabelMap = {
  metabolicHealth: "Metabolic Health",
  fatLoss: "Fat Loss",
  energy: "Energy",
  bodyComposition: "Body Composition",
  longevity: "Longevity",
  healing: "Healing",
  recovery: "Recovery",
  inflammationBalance: "Inflammation Balance",
  cognition: "Cognition",
  mood: "Mood",
  performance: "Performance",
  immuneSupport: "Immune Support",
  pigmentation: "Pigmentation",
};

const goalToLaneMap = {
  metabolicHealth: ["metabolism"],
  fatLoss: ["metabolism"],
  bodyComposition: ["metabolism", "performance"],
  energy: ["energy", "metabolism"],
  longevity: ["energy"],
  healing: ["recovery"],
  recovery: ["recovery"],
  inflammationBalance: ["recovery", "immune"],
  cognition: ["cognitive"],
  mood: ["cognitive"],
  performance: ["performance"],
  immuneSupport: ["immune"],
  pigmentation: ["appearance"],
};

const viewMeta = {
  home: {
    title: "Home",
    subtitle: "Explore compounds by goal and return to recent work quickly.",
  },
  explore: {
    title: "Explore All Compounds",
    subtitle: "Search by name, lane, goals, or evidence framing.",
  },
  compare: {
    title: "Compare Compounds",
    subtitle: "Review 2-3 compounds side by side across mechanism, benefits, and research.",
  },
  saved: {
    title: "Saved",
    subtitle: "Bookmarks and saved compare sets persist in this browser.",
  },
  preferences: {
    title: "Preferences",
    subtitle: "Adjust launch behavior and reading density for the inspector.",
  },
};

const suggestedIds = ["retatrutide", "bpc157", "semax", "ss31"];
const trendingIds = ["tirzepatide", "tesamorelin", "ghkcu", "motsc"];

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
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`Unable to load ${DATA_PATH}`);
    }

    const rawCompounds = await response.json();
    state.compounds = rawCompounds.map(normalizeCompound);
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
    }

    if (event.key === "Escape" && state.pickerOpen) {
      state.pickerOpen = false;
      renderApp();
    }
  });

  document.addEventListener("click", (event) => {
    const actionNode = event.target.closest("[data-action]");
    if (actionNode) {
      handleAction(actionNode, event);
      return;
    }

    const compoundCard = event.target.closest("[data-compound-card]");
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
    }

    if (target.dataset.role === "picker-filter") {
      state.pickerFilter = target.value;
      state.focusTarget = "picker-filter";
      renderApp();
    }
  });
}

function handleAction(node, event) {
  const { action } = node.dataset;
  if (!action) {
    return;
  }

  if (action !== "open-modal") {
    event.preventDefault();
  }

  if (action === "set-view") {
    setView({ name: node.dataset.view });
    return;
  }

  if (action === "set-lane") {
    setView({ name: "lane", laneId: node.dataset.lane });
    return;
  }

  if (action === "toggle-save") {
    event.stopPropagation();
    toggleSaved(node.dataset.id);
    return;
  }

  if (action === "toggle-compare") {
    event.stopPropagation();
    toggleCompare(node.dataset.id);
    return;
  }

  if (action === "remove-compare") {
    removeCompare(node.dataset.id);
    return;
  }

  if (action === "clear-tags") {
    state.activeTags = [];
    renderApp();
    persistState();
    return;
  }

  if (action === "toggle-tag") {
    toggleTag(node.dataset.tag);
    return;
  }

  if (action === "set-sort") {
    state.sortOption = node.dataset.sort;
    renderApp();
    persistState();
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
    return;
  }
}

function normalizeCompound(item) {
  const goalLabels = (item.matchingGoals || []).map((goal) => goalLabelMap[goal] || humanize(goal));
  const lanes = deriveLanes(item.matchingGoals || [], item.category || "");
  const aliases = (item.aliases || []).filter(Boolean);
  const tags = unique([
    ...goalLabels,
    evidenceLabel(item.evidenceLevel),
    ...aliases,
  ]);

  return {
    id: item.id,
    name: item.name,
    aliases,
    audienceNote: item.audienceNote || "",
    category: item.category || "",
    categorySummary: item.categorySummary || "",
    evidenceLevel: item.evidenceLevel || "mixed",
    matchingGoals: item.matchingGoals || [],
    goalLabels,
    lanes,
    tags,
    mechanism: item.whatItDoesInBody || "",
    benefits: item.potentialBenefits || "",
    research: item.researchSnapshot || "",
    resources: item.suggestedResources || "",
    searchableText: [
      item.name,
      aliases.join(" "),
      item.category,
      item.categorySummary,
      goalLabels.join(" "),
      item.audienceNote,
      item.whatItDoesInBody,
      item.potentialBenefits,
      item.researchSnapshot,
      item.suggestedResources,
      item.evidenceLevel,
    ]
      .join(" ")
      .toLowerCase(),
  };
}

function deriveLanes(goals, category) {
  const lanes = new Set();

  goals.forEach((goal) => {
    (goalToLaneMap[goal] || []).forEach((laneId) => lanes.add(laneId));
  });

  const categoryValue = category.toLowerCase();
  if (categoryValue.includes("metabolic")) lanes.add("metabolism");
  if (categoryValue.includes("recovery")) lanes.add("recovery");
  if (categoryValue.includes("cognitive")) lanes.add("cognitive");
  if (categoryValue.includes("performance") || categoryValue.includes("growth hormone")) lanes.add("performance");
  if (categoryValue.includes("immune")) lanes.add("immune");
  if (categoryValue.includes("pigmentation")) lanes.add("appearance");
  if (categoryValue.includes("energy") || categoryValue.includes("mitochondrial")) lanes.add("energy");

  if (lanes.size === 0) {
    lanes.add("metabolism");
  }

  return Array.from(lanes);
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

  const title = normalizedIds.map((id) => state.compoundMap.get(id)?.name || id).join(" vs ");
  state.savedCompareSets = [
    {
      id: `compare-${Date.now()}`,
      title,
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
  if (navigator.clipboard && navigator.clipboard.writeText) {
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
    || suggestedIds.find((id) => state.compoundMap.has(id))
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
  return ids
    .map((id) => state.compoundMap.get(id))
    .filter(Boolean);
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
  const savedCount = state.savedIds.length;
  const compareCount = state.compareIds.length;

  const libraryItems = [
    { id: "home", title: "Home", note: "Overview", count: null },
    { id: "explore", title: "Explore", note: "All compounds", count: state.compounds.length },
    { id: "compare", title: "Compare", note: "2-3 compounds", count: compareCount || null },
    { id: "saved", title: "Saved", note: "Bookmarks", count: savedCount || null },
  ];

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
          ${libraryItems.map(renderLibraryNavItem).join("")}
        </section>
        <section class="nav-group" data-reveal style="--delay: 120ms">
          <div class="nav-label">Lanes</div>
          ${laneItems.map(renderLaneNavItem).join("")}
        </section>
        <section class="nav-group" data-reveal style="--delay: 180ms">
          <div class="nav-label">Settings</div>
          ${renderLibraryNavItem({ id: "preferences", title: "Preferences", note: "Launch and reading", count: null })}
        </section>
      </div>
      <div class="sidebar-foot">
        <div class="status-block">
          <strong>${state.compounds.length} compounds loaded</strong>
          <span>Saved state is local to this browser. Compare sets and preferences persist automatically.</span>
        </div>
      </div>
    </aside>
  `;
}

function renderLibraryNavItem(item) {
  const isActive = state.view.name === item.id;
  return `
    <button class="nav-item ${isActive ? "is-active" : ""}" data-action="set-view" data-view="${escapeHtml(item.id)}">
      <span class="nav-item-main">
        <span class="nav-item-icon">${escapeHtml(item.title.slice(0, 2).toUpperCase())}</span>
        <span class="nav-item-meta">
          <span class="nav-item-title">${escapeHtml(item.title)}</span>
          <span class="nav-item-note">${escapeHtml(item.note)}</span>
        </span>
      </span>
      ${item.count ? `<span class="nav-count">${item.count}</span>` : ""}
    </button>
  `;
}

function renderLaneNavItem(item) {
  const isActive = state.view.name === "lane" && state.view.laneId === item.id;
  return `
    <button class="nav-item ${isActive ? "is-active" : ""}" data-action="set-lane" data-lane="${escapeHtml(item.id)}">
      <span class="nav-item-main">
        <span class="nav-item-icon">${escapeHtml(item.icon)}</span>
        <span class="nav-item-meta">
          <span class="nav-item-title">${escapeHtml(item.title)}</span>
          <span class="nav-item-note">${escapeHtml(item.subtitle)}</span>
        </span>
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
        <button class="button" data-action="open-picker">Add to compare</button>
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
  const recent = compoundsFromIds(state.recentIds);
  const suggested = compoundsFromIds(suggestedIds);
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
      <div class="section-head" data-reveal style="--delay: 90ms">
        <div>
          <h2 class="section-title">Explore by lane</h2>
          <p class="section-copy">Choose a working lane and then refine by goals or evidence.</p>
        </div>
      </div>
      <div class="lane-grid">
        ${laneCards
          .map((lane, index) => renderLaneCard(lane, state.compounds.filter((compound) => compound.lanes.includes(lane.id)).length, 140 + index * 40))
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 240ms">
        <div>
          <h2 class="section-title">Suggested for you</h2>
          <p class="section-copy">A curated starting set that mirrors the desktop app’s front door.</p>
        </div>
      </div>
      <div class="card-grid">
        ${renderCompoundCards(suggested, true, 280)}
      </div>
    </section>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 340ms">
        <div>
          <h2 class="section-title">Recently viewed</h2>
          <p class="section-copy">Return to the compounds you opened in the inspector.</p>
        </div>
      </div>
      ${recent.length
        ? `<div class="card-grid">${renderCompoundCards(recent, true, 380)}</div>`
        : renderEmptyState("No recent compounds", "Open a profile from any lane or from Explore to populate this section.", "RV", 380)}
    </section>
  `;
}

function renderExploreView() {
  const results = sortedCompounds(filteredCompounds());
  const trending = compoundsFromIds(trendingIds);

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
            ${renderCompoundCards(trending, true, 150)}
          </div>
        </section>
      `
      : ""}
    <section class="section">
      <div class="section-head" data-reveal style="--delay: 220ms">
        <div>
          <h2 class="section-title">${state.searchText ? "Results" : "All compounds"}</h2>
          <p class="section-copy">${results.length} matches across the full library.</p>
        </div>
      </div>
      ${results.length
        ? `<div class="card-grid">${renderCompoundCards(results, false, 250)}</div>`
        : renderEmptyState("No matches found", "Try a different search term or clear one or more active tags.", "SR", 260)}
    </section>
  `;
}

function renderLaneView(laneId) {
  const results = sortedCompounds(filteredCompounds(laneId));
  const lane = laneConfig[laneId];

  return `
    ${renderSearchPanel(laneId, 60)}
    <section class="section">
      <div class="section-head" data-reveal style="--delay: 120ms">
        <div>
          <h2 class="section-title">${escapeHtml(lane.title)}</h2>
          <p class="section-copy">${escapeHtml(lane.subtitle)}</p>
        </div>
        <div class="segmented">
          ${["alphabetical", "recentlyViewed", "savedFirst"]
            .map(
              (sortOption) => `
                <button
                  class="chip ${state.sortOption === sortOption ? "is-active" : ""}"
                  data-action="set-sort"
                  data-sort="${sortOption}"
                >
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
      <div class="compare-header">
        <div>
          <h2 class="section-title">Comparison set</h2>
          <p class="section-copy">Compare 2-3 compounds side by side across the same decision fields.</p>
        </div>
        <div class="surface-actions">
          <button class="button-ghost" data-action="open-picker">Add compound</button>
          <button class="button" data-action="save-compare-set">Save set</button>
        </div>
      </div>
      <div class="compare-selection">
        ${[0, 1, 2]
          .map((index) => renderCompareSlot(compareCompounds[index], 120 + index * 40))
          .join("")}
      </div>
    </section>

    <section class="section">
      ${compareCompounds.length >= 2
        ? renderCompareTable(compareCompounds)
        : renderEmptyState("Build a comparison", "Add at least two compounds to render the comparison table.", "CP", 220)}
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
        : renderEmptyState("Nothing saved yet", "Use Save from any compound card or from the inspector to collect compounds here.", "SV", 140)}
    </section>

    <section class="section">
      <div class="section-head" data-reveal style="--delay: 220ms">
        <div>
          <h2 class="section-title">Saved compare sets</h2>
          <p class="section-copy">Persisted comparison bundles you can reopen instantly.</p>
        </div>
      </div>
      ${state.savedCompareSets.length
        ? `
          <div class="saved-grid">
            ${state.savedCompareSets
              .map((set, index) => renderSavedSet(set, 260 + index * 30))
              .join("")}
          </div>
        `
        : renderEmptyState("No saved compare sets", "Save any active comparison from the Compare workspace.", "CS", 260)}
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
                <button
                  class="chip ${state.preferredLaunchScreen === option ? "is-active" : ""}"
                  data-action="set-launch-screen"
                  data-value="${option}"
                >
                  ${escapeHtml(option.charAt(0).toUpperCase() + option.slice(1))}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="preferences-row">
        <h2 class="section-title">Reading density</h2>
        <p class="section-copy">Adjust spacing in the detail inspector for scanning or longer reading sessions.</p>
        <div class="segmented">
          ${["comfortable", "compact"]
            .map(
              (option) => `
                <button
                  class="chip ${state.readingDensity === option ? "is-active" : ""}"
                  data-action="set-density"
                  data-value="${option}"
                >
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
      <input
        class="search-field"
        type="search"
        data-role="search"
        placeholder="Search compounds, goals, or evidence"
        value="${escapeAttribute(state.searchText)}"
      />
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
  return compounds
    .map((compound, index) => renderCompoundCard(compound, compact, startDelay + index * 30))
    .join("");
}

function renderCompoundCard(compound, compact, delay) {
  const isSaved = state.savedIds.includes(compound.id);
  const isCompared = state.compareIds.includes(compound.id);
  const isSelected = state.selectedCompoundId === compound.id;

  return `
    <article
      class="compound-card ${isSelected ? "is-selected" : ""}"
      data-compound-card="${escapeHtml(compound.id)}"
      data-compact="${compact}"
      data-reveal
      style="--delay: ${delay}ms"
      tabindex="0"
    >
      <div class="compound-card-top">
        <div class="compound-card-name">
          <h3>${escapeHtml(compound.name)}</h3>
          <span class="evidence-pill">${escapeHtml(evidenceLabel(compound.evidenceLevel))}</span>
        </div>
        <span class="ghost-chip">${escapeHtml(compound.category)}</span>
      </div>
      <div class="compound-card-main">
        <p class="compound-card-copy">${escapeHtml(compound.categorySummary || compound.audienceNote)}</p>
        <div class="lane-card-meta">
          ${compound.goalLabels.slice(0, compact ? 2 : 4).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
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
        <span class="lane-mark">${escapeHtml(lane.icon)}</span>
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

function renderCompareSlot(compound, delay) {
  if (!compound) {
    return `
      <div class="compare-slot" data-reveal style="--delay: ${delay}ms">
        <div>
          <strong>Open slot</strong>
          <p>Add a compound from the library or from the picker.</p>
        </div>
        <div class="compare-selection-actions">
          <button class="button-ghost" data-action="open-picker">Choose compound</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="compare-slot" data-reveal style="--delay: ${delay}ms">
      <div>
        <strong>${escapeHtml(compound.name)}</strong>
        <p>${escapeHtml(compound.category)}</p>
      </div>
      <div class="compare-selection-actions">
        <button class="button-quiet" data-action="open-compound" data-id="${escapeHtml(compound.id)}">Open</button>
        <button class="button-danger" data-action="remove-compare" data-id="${escapeHtml(compound.id)}">Remove</button>
      </div>
    </div>
  `;
}

function renderCompareTable(compounds) {
  const rows = [
    { label: "Category", key: "category" },
    { label: "Evidence", render: (compound) => evidenceLabel(compound.evidenceLevel) },
    { label: "Goals", render: (compound) => compound.goalLabels.join(", ") },
    { label: "Audience fit", key: "audienceNote" },
    { label: "What it does in the body", key: "mechanism" },
    { label: "Potential benefits", key: "benefits" },
    { label: "Research snapshot", key: "research" },
    { label: "Suggested resources", key: "resources" },
  ];

  return `
    <div class="compare-table-wrap" data-reveal style="--delay: 240ms">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Field</th>
            ${compounds.map((compound) => `<th>${escapeHtml(compound.name)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <th>${escapeHtml(row.label)}</th>
                  ${compounds
                    .map((compound) => `<td>${escapeHtml(row.render ? row.render(compound) : compound[row.key])}</td>`)
                    .join("")}
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
  const names = set.ids
    .map((id) => state.compoundMap.get(id)?.name)
    .filter(Boolean)
    .join(", ");

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
          <h2>Select a compound</h2>
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
          </div>
          <span class="evidence-pill">${escapeHtml(evidenceLabel(compound.evidenceLevel))}</span>
        </div>
        <p>${escapeHtml(compound.categorySummary)}</p>
        <div class="detail-meta">
          <span class="ghost-chip">${escapeHtml(compound.category)}</span>
          ${compound.goalLabels.map((goal) => `<span class="chip">${escapeHtml(goal)}</span>`).join("")}
        </div>
      </header>

      <div class="detail-actions">
        <button class="button" data-action="toggle-save" data-id="${escapeHtml(compound.id)}">${isSaved ? "Saved" : "Save compound"}</button>
        <button class="button-ghost" data-action="toggle-compare" data-id="${escapeHtml(compound.id)}">${isCompared ? "In compare" : "Add to compare"}</button>
        <button class="button-quiet" data-action="share-compound" data-id="${escapeHtml(compound.id)}">Share</button>
      </div>

      ${compound.aliases.length
        ? `
          <section class="detail-section">
            <h3>Aliases</h3>
            <div class="detail-meta">
              ${compound.aliases.map((alias) => `<span class="ghost-chip">${escapeHtml(alias)}</span>`).join("")}
            </div>
          </section>
        `
        : ""}

      <section class="detail-section">
        <h3>Audience note</h3>
        <p class="detail-section-copy">${escapeHtml(compound.audienceNote)}</p>
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
        <h3>Suggested resources</h3>
        <p class="detail-section-copy">${escapeHtml(compound.resources)}</p>
      </section>
    </article>
  `;
}

function renderPickerModal() {
  const candidates = sortedCompounds(state.compounds)
    .filter((compound) => !state.compareIds.includes(compound.id))
    .filter((compound) => {
      const query = state.pickerFilter.trim().toLowerCase();
      return !query || compound.searchableText.includes(query);
    });

  return `
    <div class="modal-backdrop" data-action="close-picker">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div>
            <h2 class="section-title">Add to compare</h2>
            <p class="section-copy">Choose up to three compounds for a side-by-side read.</p>
          </div>
          <button class="button-ghost" data-action="close-picker">Close</button>
        </div>
        <div class="modal-body">
          <input
            class="search-field"
            type="search"
            data-role="picker-filter"
            placeholder="Filter compounds"
            value="${escapeAttribute(state.pickerFilter)}"
          />
          <div class="picker-list">
            ${candidates.length
              ? candidates
                  .map(
                    (compound) => `
                      <article class="picker-item">
                        <div>
                          <h3>${escapeHtml(compound.name)}</h3>
                          <p>${escapeHtml(compound.categorySummary || compound.audienceNote)}</p>
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
    const valueLength = target.value.length;
    target.setSelectionRange(valueLength, valueLength);
  }
  state.focusTarget = null;
}

function renderError(error) {
  app.innerHTML = `
    <div class="error-screen">
      <div class="error-card">
        <div class="boot-mark">PG</div>
        <h1>PeptideGuide could not load its data</h1>
        <p>The web app expects to be served from the repo root so it can read <code>${escapeHtml(DATA_PATH)}</code>.</p>
        <p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p>
        <p>Run <code>python3 -m http.server 4173</code> in <code>/Users/shawnroland/Documents/Playground</code>, then open <code>http://localhost:4173/web/</code>.</p>
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

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function humanize(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function evidenceLabel(level) {
  if (!level) return "Evidence: Mixed";
  return `Evidence: ${humanize(level)}`;
}

function sortLabel(value) {
  if (value === "recentlyViewed") {
    return "Recently Viewed";
  }
  if (value === "savedFirst") {
    return "Saved First";
  }
  return "Alphabetical";
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
