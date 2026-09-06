import {
  createDraftSnippet,
  deleteSnippet,
  ensureStore,
  exportStore,
  importStore,
  saveSnippet
} from "../shared/storage.js";

const state = {
  store: null,
  filteredSnippets: [],
  selectedSnippetId: null
};

const elements = {
  bodyInput: document.querySelector("#body-input"),
  deleteButton: document.querySelector("#delete-button"),
  descriptionInput: document.querySelector("#description-input"),
  editorTitle: document.querySelector("#editor-title"),
  exportButton: document.querySelector("#export-button"),
  importButton: document.querySelector("#import-button"),
  importFileInput: document.querySelector("#import-file-input"),
  list: document.querySelector("#snippet-list"),
  newSnippetButton: document.querySelector("#new-snippet-button"),
  saveButton: document.querySelector("#save-button"),
  searchInput: document.querySelector("#search-input"),
  titleInput: document.querySelector("#title-input"),
  triggerInput: document.querySelector("#trigger-input")
};

let draft = createDraftSnippet();

function getSelectedSnippet() {
  return (
    state.store?.snippets.find((snippet) => snippet.id === state.selectedSnippetId) ?? null
  );
}

function syncFormFromDraft() {
  elements.titleInput.value = draft.title;
  elements.triggerInput.value = draft.trigger;
  elements.descriptionInput.value = draft.description;
  elements.bodyInput.value = draft.body;

  const editing = Boolean(state.selectedSnippetId);
  elements.editorTitle.textContent = editing
    ? draft.title || "Edit snippet"
    : "New snippet";
  elements.saveButton.textContent = editing ? "Save changes" : "Create snippet";
  elements.deleteButton.hidden = !editing;
}

function syncDraftFromForm() {
  draft = {
    ...draft,
    title: elements.titleInput.value,
    trigger: elements.triggerInput.value,
    description: elements.descriptionInput.value,
    body: elements.bodyInput.value
  };
}

function filterSnippets() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const snippets = state.store?.snippets ?? [];

  state.filteredSnippets = snippets.filter((snippet) => {
    if (!query) {
      return true;
    }

    return (
      snippet.title.toLowerCase().includes(query) ||
      snippet.trigger.toLowerCase().includes(query) ||
      snippet.description.toLowerCase().includes(query)
    );
  });
}

function renderSnippetList() {
  filterSnippets();

  if (state.filteredSnippets.length === 0) {
    elements.list.innerHTML =
      '<div class="empty-state">No snippets matched. Create one on the right.</div>';
    return;
  }

  elements.list.innerHTML = "";

  for (const snippet of state.filteredSnippets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      snippet.id === state.selectedSnippetId
        ? "snippet-list-item is-active"
        : "snippet-list-item";
    button.innerHTML = `
      <span class="snippet-title">${snippet.title}</span>
      <span class="snippet-trigger">${snippet.trigger}</span>
      <span class="snippet-description">${snippet.description || "No description yet."}</span>
    `;

    button.addEventListener("click", () => {
      state.selectedSnippetId = snippet.id;
      draft = { ...snippet };
      syncFormFromDraft();
      renderSnippetList();
    });

    elements.list.appendChild(button);
  }
}

function resetToNewSnippet() {
  state.selectedSnippetId = null;
  draft = createDraftSnippet();
  syncFormFromDraft();
  renderSnippetList();
}

async function refreshStore() {
  state.store = await ensureStore();

  if (state.selectedSnippetId) {
    const selected = getSelectedSnippet();
    draft = selected ? { ...selected } : createDraftSnippet();
  }

  syncFormFromDraft();
  renderSnippetList();
}

async function handleSave() {
  try {
    syncDraftFromForm();
    state.store = await saveSnippet(draft);
    state.selectedSnippetId = draft.id;
    await refreshStore();
  } catch (error) {
    window.alert(error.message);
  }
}

async function handleDelete() {
  if (!state.selectedSnippetId) {
    return;
  }

  const confirmed = window.confirm("Delete this snippet?");
  if (!confirmed) {
    return;
  }

  await deleteSnippet(state.selectedSnippetId);
  resetToNewSnippet();
  await refreshStore();
}

async function handleExport() {
  const store = await exportStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `prompt-expander-${dateStamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function handleImport(event) {
  const [file] = event.target.files ?? [];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state.store = await importStore(parsed);
    resetToNewSnippet();
    await refreshStore();
  } catch (error) {
    window.alert(error.message || "Import failed.");
  } finally {
    elements.importFileInput.value = "";
  }
}

function wireEvents() {
  elements.newSnippetButton.addEventListener("click", resetToNewSnippet);
  elements.saveButton.addEventListener("click", handleSave);
  elements.deleteButton.addEventListener("click", handleDelete);
  elements.searchInput.addEventListener("input", renderSnippetList);
  elements.exportButton.addEventListener("click", handleExport);
  elements.importButton.addEventListener("click", () => {
    elements.importFileInput.click();
  });
  elements.importFileInput.addEventListener("change", handleImport);
  elements.titleInput.addEventListener("input", syncDraftFromForm);
  elements.triggerInput.addEventListener("input", syncDraftFromForm);
  elements.descriptionInput.addEventListener("input", syncDraftFromForm);
  elements.bodyInput.addEventListener("input", syncDraftFromForm);
}

async function init() {
  wireEvents();
  await refreshStore();
}

void init();
