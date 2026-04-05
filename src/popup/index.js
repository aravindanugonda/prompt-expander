import { ensureStore } from "../shared/storage.js";

const searchInput = document.querySelector("#popup-search-input");
const list = document.querySelector("#popup-snippet-list");
const openOptionsButton = document.querySelector("#open-options-button");

let snippets = [];

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = snippets.filter((snippet) => {
    if (!query) {
      return true;
    }

    return (
      snippet.title.toLowerCase().includes(query) ||
      snippet.trigger.toLowerCase().includes(query) ||
      snippet.description.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No matching snippets.</div>';
    return;
  }

  list.innerHTML = "";

  for (const snippet of filtered) {
    const card = document.createElement("article");
    card.className = "popup-card";

    const title = document.createElement("h2");
    title.textContent = snippet.title;

    const trigger = document.createElement("code");
    trigger.textContent = snippet.trigger;

    const description = document.createElement("p");
    description.className = "muted";
    description.textContent = snippet.description || "No description yet.";

    const actions = document.createElement("div");
    actions.className = "popup-card-actions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "secondary-button";
    copyButton.textContent = "Copy body";
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(snippet.body);
      copyButton.textContent = "Copied";
      setTimeout(() => {
        copyButton.textContent = "Copy body";
      }, 1200);
    });

    actions.appendChild(copyButton);
    card.append(title, trigger, description, actions);
    list.appendChild(card);
  }
}

async function init() {
  const store = await ensureStore();
  snippets = store.snippets;
  render();
}

searchInput.addEventListener("input", render);
openOptionsButton.addEventListener("click", () => {
  void chrome.runtime.openOptionsPage();
});

void init();
