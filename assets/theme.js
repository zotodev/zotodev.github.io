(() => {
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let saved;
  try { saved = localStorage.getItem("zoto-theme"); } catch {}
  const preferred = () => system.matches ? "dark" : "light";
  root.dataset.theme = saved === "dark" || saved === "light" ? saved : preferred();

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".theme-toggle");
    const label = () => button.setAttribute("aria-label", `Switch to ${root.dataset.theme === "dark" ? "light" : "dark"} theme`);
    button.hidden = false;
    label();
    button.addEventListener("click", () => {
      saved = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = saved;
      try { localStorage.setItem("zoto-theme", saved); } catch {}
      label();
    });
    system.addEventListener("change", () => {
      if (saved !== "dark" && saved !== "light") {
        root.dataset.theme = preferred();
        label();
      }
    });
  });
})();
