export function selectPosts(posts, query) {
  const words = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  return posts.filter(post => {
    const text = post.title.toLocaleLowerCase("en");
    return words.every(word => text.includes(word));
  });
}

if (typeof document !== "undefined") {
  const form = document.querySelector(".search-form");
  const input = document.querySelector("#search");
  const journal = document.querySelector(".journal");
  input.value = new URL(location.href).searchParams.get("q") || "";

  if (journal) {
    const list = journal.querySelector(".post-list");
    const count = journal.querySelector("#result-count");
    const empty = journal.querySelector("#empty-message");
    const skeleton = journal.querySelector(".loading-skeleton");
    const posts = [...list.children].map(node => ({
      node,
      title: node.querySelector(".post-title").textContent,
    }));
    let timer;

    function readURL() {
      const params = new URL(location.href).searchParams;
      input.value = params.get("q") || "";
    }

    function saveURL() {
      const url = new URL(location.href);
      if (input.value.trim()) url.searchParams.set("q", input.value);
      else url.searchParams.delete("q");
      history.replaceState(null, "", url);
    }

    function render() {
      const query = input.value.trim();
      const found = selectPosts(posts, query);
      skeleton.hidden = true;
      list.hidden = false;
      journal.setAttribute("aria-busy", "false");
      const shown = new Set(found.map(post => post.node));
      for (const post of posts) post.node.hidden = !shown.has(post.node);
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
    form.addEventListener("submit", event => { event.preventDefault(); clearTimeout(timer); saveURL(); render(); });
    addEventListener("popstate", () => { clearTimeout(timer); readURL(); render(); });
    readURL();
    render();
  }
}
