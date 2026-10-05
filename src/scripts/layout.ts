const tocToggle = document.getElementById("articleTocToggle");
const tocColumn = document.querySelector<HTMLElement>(".article-toc-column");
const tocDetails = tocColumn?.querySelector<HTMLDetailsElement>(".article-toc");
const scrollContainer = document.querySelector<HTMLElement>(".main-area");
const mobileQuery = window.matchMedia("(max-width: 720px)");

function syncFloatingToc() {
  const floating = Boolean(mobileQuery.matches && scrollContainer && scrollContainer.scrollTop > 8);
  tocToggle?.classList.toggle("is-floating", floating);
}

function syncTocToggle() {
  const open = Boolean(mobileQuery.matches && tocColumn?.classList.contains("is-mobile-open"));
  tocToggle?.setAttribute("aria-expanded", String(open));
  tocToggle?.setAttribute("aria-label", open ? "关闭文章目录" : "打开文章目录");
  tocToggle?.classList.toggle("is-open", open);
}

function closeMobileToc() {
  tocColumn?.classList.remove("is-mobile-open");
  syncTocToggle();
}

tocToggle?.addEventListener("click", () => {
  if (!mobileQuery.matches || !tocColumn) return;
  const open = tocColumn.classList.toggle("is-mobile-open");
  if (open && tocDetails) tocDetails.open = true;
  syncTocToggle();
});

document.addEventListener("click", (event) => {
  if (!tocColumn?.classList.contains("is-mobile-open")) return;
  const target = event.target as Node;
  if (tocColumn.contains(target) || tocToggle?.contains(target)) return;
  closeMobileToc();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileToc();
});

tocColumn?.querySelectorAll<HTMLAnchorElement>(".article-toc-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileQuery.matches) closeMobileToc();
  });
});

mobileQuery.addEventListener("change", () => {
  closeMobileToc();
  syncFloatingToc();
  syncTocToggle();
});

scrollContainer?.addEventListener("scroll", syncFloatingToc, { passive: true });

syncFloatingToc();
syncTocToggle();
