export function selectPosts(posts, query, sort) {
  const words = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  const compare = (a, b) => a.localeCompare(b, "en", { sensitivity: "base" });
  return posts.filter(post => {
    const text = `${post.title} ${post.text || ""}`.toLocaleLowerCase("en");
    return words.every(word => text.includes(word));
  }).sort((a, b) => {
    const primary = sort === "title" ? compare(a.title, b.title)
      : sort === "oldest" ? compare(a.date, b.date) : compare(b.date, a.date);
    return primary || compare(a.slug, b.slug);
  });
}

if (typeof document !== "undefined") {
  const form = document.querySelector(".search-form");
  const input = document.querySelector("#search");
  const journal = document.querySelector(".journal");
  input.value = new URL(location.href).searchParams.get("q") || "";

  if (journal) {
    const list = journal.querySelector(".post-list");
    const sort = journal.querySelector("#sort");
    const count = journal.querySelector("#result-count");
    const empty = journal.querySelector("#empty-message");
    const error = journal.querySelector("#search-error");
    const posts = [...list.children].map(node => ({
      node, slug: node.dataset.slug,
      title: node.querySelector(".post-title").textContent,
      date: node.querySelector("time").dateTime,
      url: node.querySelector("a").getAttribute("href"),
    }));
    let index;
    let revision = 0;
    let timer;
    sort.hidden = false;

    function readURL() {
      const params = new URL(location.href).searchParams;
      input.value = params.get("q") || "";
      sort.value = ["newest", "oldest", "title"].includes(params.get("sort")) ? params.get("sort") : "newest";
    }

    function saveURL() {
      const url = new URL(location.href);
      if (input.value.trim()) url.searchParams.set("q", input.value);
      else url.searchParams.delete("q");
      if (sort.value !== "newest") url.searchParams.set("sort", sort.value);
      else url.searchParams.delete("sort");
      history.replaceState(null, "", url);
    }

    async function render() {
      const current = ++revision;
      const query = input.value.trim();
      let searchable = posts;
      error.hidden = true;
      count.textContent = query ? "Searching…" : `${posts.length} posts`;
      if (query) {
        try {
          if (!index) {
            index = fetch(journal.dataset.index).then(response => {
              if (!response.ok) throw new Error("Index unavailable");
              return response.json();
            }).then(entries => {
              if (!Array.isArray(entries) || entries.some(entry => typeof entry.url !== "string" || typeof entry.text !== "string")) {
                throw new Error("Invalid search index");
              }
              return new Map(entries.map(entry => [entry.url, entry.text]));
            }).catch(failure => { index = undefined; throw failure; });
          }
          const text = await index;
          if (current !== revision) return;
          searchable = posts.map(post => ({ ...post, text: text.get(post.url) || "" }));
        } catch {
          if (current !== revision) return;
          error.hidden = false;
          searchable = posts;
        }
      }
      if (current !== revision) return;
      const found = selectPosts(searchable, error.hidden ? query : "", sort.value);
      const shown = new Set(found.map(post => post.node));
      for (const post of posts) post.node.hidden = !shown.has(post.node);
      for (const post of found) list.append(post.node);
      count.textContent = `${found.length} ${query && error.hidden ? (found.length === 1 ? "result" : "results") : (found.length === 1 ? "post" : "posts")}`;
      empty.hidden = found.length > 0;
      empty.textContent = query && error.hidden ? "No matching posts" : "No posts yet.";
    }

    input.addEventListener("input", () => {
      ++revision;
      clearTimeout(timer);
      saveURL();
      timer = setTimeout(render, 120);
    });
    sort.addEventListener("change", () => { clearTimeout(timer); saveURL(); render(); });
    form.addEventListener("submit", event => { event.preventDefault(); clearTimeout(timer); saveURL(); render(); });
    addEventListener("popstate", () => { clearTimeout(timer); readURL(); render(); });
    readURL();
    render();
  }
}
