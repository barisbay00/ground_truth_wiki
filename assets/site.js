const basePath = window.WIKI_BASE_PATH || "/";
const input = document.querySelector("#site-search");
const results = document.querySelector("#search-results");
let searchDataPromise;

function getSearchData() {
  if (!searchDataPromise) {
    searchDataPromise = fetch(`${basePath}search-data.json`).then((response) => {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json();
    });
  }

  return searchDataPromise;
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function resultScore(item, terms) {
  const title = normalize(item.title);
  const path = normalize(item.path);
  const text = normalize(item.text);

  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 6;
    if (path.includes(term)) return score + 3;
    if (text.includes(term)) return score + 1;
    return score;
  }, 0);
}

function renderResults(items) {
  if (!results) return;

  if (!items.length) {
    results.innerHTML = '<div class="search-empty">No matches</div>';
    return;
  }

  results.innerHTML = `<ul>${items
    .slice(0, 8)
    .map(
      (item) =>
        `<li><a href="${item.url}">${item.title}</a><span>${item.path}</span></li>`
    )
    .join("")}</ul>`;
}

if (input && results) {
  input.addEventListener("input", async () => {
    const query = normalize(input.value);
    if (query.length < 2) {
      results.innerHTML = "";
      return;
    }

    const terms = query.split(" ");
    const data = await getSearchData();
    const matches = data
      .map((item) => ({ ...item, score: resultScore(item, terms) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    renderResults(matches);
  });
}
