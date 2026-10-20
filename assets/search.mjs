export function selectPosts(posts, query, sort) {
  const words = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  const compare = (a, b) => a.localeCompare(b, "en", { sensitivity: "base" });
  return posts.filter(post => {
    const text = post.title.toLocaleLowerCase("en");
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
    const skeleton = journal.querySelector(".loading-skeleton");
    const posts = [...list.children].map(node => ({
      node, slug: node.dataset.slug,
      title: node.querySelector(".post-title").textContent,
      date: node.querySelector("time").dateTime,
    }));
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

    function render() {
      const query = input.value.trim();
      const found = selectPosts(posts, query, sort.value);
      skeleton.hidden = true;
      list.hidden = false;
      journal.setAttribute("aria-busy", "false");
      const shown = new Set(found.map(post => post.node));
      for (const post of posts) post.node.hidden = !shown.has(post.node);
      for (const post of found) list.append(post.node);
      count.textContent = `${found.length} ${query ? (found.length === 1 ? "result" : "results") : (found.length === 1 ? "post" : "posts")}`;
      empty.hidden = found.length > 0;
      empty.textContent = query ? "No matching posts" : "No posts yet.";
    }

    input.addEventListener("input", () => {
      clearTimeout(timer);
      skeleton.hidden = false;
      list.hidden = true;
      empty.hidden = true;
      count.textContent = "Searching…";
      journal.setAttribute("aria-busy", "true");
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
