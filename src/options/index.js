import {
  createDraftSnippet,
  deleteSnippet,
  ensureStore,
  exportStore,
  importStore,
  installPack,
  resetSnippetsToDefaults,
  saveSnippet,
  updateSettings
} from "../shared/storage.js";
import { collectInputLabels } from "../shared/template.js";

const state = {
  store: null,
  filteredSnippets: [],
  selectedSnippetId: null
};

const elements = {
  addInputButton: document.querySelector("#add-input-button"),
  bodyInput: document.querySelector("#body-input"),
  deleteButton: document.querySelector("#delete-button"),
  descriptionInput: document.querySelector("#description-input"),
  downloadLibraryPackButton: document.querySelector("#download-library-pack-button"),
  downloadSamplePackButton: document.querySelector("#download-sample-pack-button"),
  editorTitle: document.querySelector("#editor-title"),
  exportButton: document.querySelector("#export-button"),
  importButton: document.querySelector("#import-button"),
  importFileInput: document.querySelector("#import-file-input"),
  inputsEditor: document.querySelector("#inputs-editor"),
  installPackButton: document.querySelector("#install-pack-button"),
  list: document.querySelector("#snippet-list"),
  newSnippetButton: document.querySelector("#new-snippet-button"),
  packFileInput: document.querySelector("#pack-file-input"),
  resetDefaultsButton: document.querySelector("#reset-defaults-button"),
  pageOriginsList: document.querySelector("#page-origins-list"),
  saveButton: document.querySelector("#save-button"),
  searchInput: document.querySelector("#search-input"),
  tabs: [...document.querySelectorAll(".tab")],
  panels: [...document.querySelectorAll(".tab-panel")],
  titleInput: document.querySelector("#title-input"),
  triggerInput: document.querySelector("#trigger-input")
};

const TAB_STORAGE_KEY = "prompt-expander:options-tab";

function activateTab(tabId) {
  const target = elements.tabs.find((tab) => tab.id === tabId) ?? elements.tabs[0];
  if (!target) {
    return;
  }

  for (const tab of elements.tabs) {
    tab.classList.toggle("is-active", tab === target);
    tab.setAttribute("aria-selected", tab === target ? "true" : "false");
  }

  const panelId = target.dataset.panel;
  for (const panel of elements.panels) {
    panel.hidden = panel.id !== panelId;
  }

  try {
    localStorage.setItem(TAB_STORAGE_KEY, target.id);
  } catch (_error) {
    // Private mode etc. — the tab just won't persist.
  }
}

function wireTabs() {
  for (const tab of elements.tabs) {
    tab.addEventListener("click", () => activateTab(tab.id));
  }

  let saved = null;
  try {
    saved = localStorage.getItem(TAB_STORAGE_KEY);
  } catch (_error) {
    saved = null;
  }
  activateTab(saved ?? "tab-snippets");
}

async function downloadPackFile(resourcePath, downloadName) {
  try {
    const response = await fetch(chrome.runtime.getURL(resourcePath));
    const text = await response.text();
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (_error) {
    window.alert("Could not read the bundled pack file.");
  }
}

const INPUT_TYPE_LABELS = {
  text: "Text",
  textarea: "Multi-line",
  select: "Dropdown"
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

  renderInputsEditor();
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

function setDraftInputs(inputs) {
  draft = { ...draft, inputs };
}

function renderInputsEditor() {
  const inputs = Array.isArray(draft.inputs) ? draft.inputs : [];
  elements.inputsEditor.innerHTML = "";

  if (inputs.length === 0) {
    const bodyLabels = collectInputLabels(elements.bodyInput.value || "");
    const empty = document.createElement("p");
    empty.className = "input-row-empty";
    empty.textContent = bodyLabels.length
      ? `Body uses: ${bodyLabels
          .map((label) => `\${input:${label}}`)
          .join(", ")}. Add a row to give one a type.`
      : "No inputs defined. Each ${input:name} in the body becomes a text field.";
    elements.inputsEditor.appendChild(empty);
    return;
  }

  inputs.forEach((input, index) => {
    const row = document.createElement("div");
    row.className = "input-row";

    const name = document.createElement("input");
    name.className = "text-input";
    name.placeholder = "name (matches ${input:name})";
    name.value = input.name;
    name.addEventListener("input", () => {
      const next = [...inputs];
      next[index] = { ...input, name: name.value };
      setDraftInputs(next);
    });

    const type = document.createElement("select");
    for (const [value, label] of Object.entries(INPUT_TYPE_LABELS)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      if (value === input.type) {
        option.selected = true;
      }
      type.appendChild(option);
    }
    type.addEventListener("change", () => {
      const next = [...inputs];
      next[index] = { ...input, type: type.value };
      setDraftInputs(next);
      renderInputsEditor();
    });

    const options = document.createElement("input");
    options.className = "text-input";
    options.placeholder = "option a, option b (dropdown only)";
    options.value = input.options.join(", ");
    options.disabled = input.type !== "select";
    options.addEventListener("input", () => {
      const next = [...inputs];
      next[index] = {
        ...input,
        options: options.value
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      };
      setDraftInputs(next);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger-button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      setDraftInputs(inputs.filter((_, entryIndex) => entryIndex !== index));
      renderInputsEditor();
    });

    row.append(name, type, options, remove);
    elements.inputsEditor.appendChild(row);
  });
}

function addInputRow() {
  const inputs = Array.isArray(draft.inputs) ? draft.inputs : [];
  const bodyLabels = collectInputLabels(elements.bodyInput.value || "");
  const suggested =
    bodyLabels.find((label) => !inputs.some((input) => input.name === label)) ??
    "";
  setDraftInputs([
    ...inputs,
    { name: suggested, label: "", type: "text", options: [], default: "" }
  ]);
  renderInputsEditor();
}

function renderPageOrigins() {
  const origins = state.store?.settings?.pageContextOrigins ?? [];
  elements.pageOriginsList.innerHTML = "";

  if (origins.length === 0) {
    const empty = document.createElement("p");
    empty.className = "input-row-empty";
    empty.textContent = "No sites allowed yet.";
    elements.pageOriginsList.appendChild(empty);
    return;
  }

  for (const origin of origins) {
    const row = document.createElement("div");
    row.className = "page-origin-row";

    const label = document.createElement("span");
    label.textContent = origin;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger-button";
    remove.textContent = "Remove";
    remove.addEventListener("click", async () => {
      await updateSettings({
        pageContextOrigins: origins.filter((entry) => entry !== origin)
      });
      await refreshStore();
    });

    row.append(label, remove);
    elements.pageOriginsList.appendChild(row);
  }
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
  renderPageOrigins();
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

async function handleResetDefaults() {
  const confirmed = window.confirm(
    "Replace all current snippets with the built-in starter set? Your settings and allowed sites are kept."
  );
  if (!confirmed) {
    return;
  }

  state.store = await resetSnippetsToDefaults();
  resetToNewSnippet();
  await refreshStore();
  activateTab("tab-snippets");
  window.alert("Starter snippets restored.");
}

async function handleInstallPack(event) {
  const [file] = event.target.files ?? [];

  if (!file) {
    return;
  }

  try {
    const parsed = JSON.parse(await file.text());
    const { store, summary } = await installPack(parsed);
    state.store = store;
    await refreshStore();

    const parts = [];
    if (summary.added) parts.push(`${summary.added} added`);
    if (summary.replaced) parts.push(`${summary.replaced} replaced`);
    if (summary.renamed) parts.push(`${summary.renamed} kept with a new trigger`);
    if (summary.skipped) parts.push(`${summary.skipped} skipped (duplicate trigger)`);
    if (summary.rejected) parts.push(`${summary.rejected} rejected (invalid)`);
    window.alert(
      parts.length
        ? `Pack installed: ${parts.join(", ")}.`
        : "Pack had no usable snippets."
    );
  } catch (error) {
    window.alert(error.message || "Pack install failed.");
  } finally {
    elements.packFileInput.value = "";
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
  elements.installPackButton.addEventListener("click", () => {
    elements.packFileInput.click();
  });
  elements.packFileInput.addEventListener("change", handleInstallPack);
  elements.downloadSamplePackButton.addEventListener("click", () => {
    void downloadPackFile("packs/code-review.json", "sample-pack-code-review.json");
  });
  elements.downloadLibraryPackButton.addEventListener("click", () => {
    void downloadPackFile("packs/prompt-library.json", "prompt-library.json");
  });
  elements.resetDefaultsButton.addEventListener("click", handleResetDefaults);
  elements.addInputButton.addEventListener("click", addInputRow);
  elements.titleInput.addEventListener("input", syncDraftFromForm);
  elements.triggerInput.addEventListener("input", syncDraftFromForm);
  elements.descriptionInput.addEventListener("input", syncDraftFromForm);
  elements.bodyInput.addEventListener("input", () => {
    syncDraftFromForm();
    // Keep the "body uses ${input:...}" hint fresh while there are no rows yet.
    if (!Array.isArray(draft.inputs) || draft.inputs.length === 0) {
      renderInputsEditor();
    }
  });
}

async function init() {
  wireTabs();
  wireEvents();
  await refreshStore();
}

void init();
