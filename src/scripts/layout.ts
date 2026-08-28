const toggle = document.getElementById("sidebarToggle");
const backdrop = document.getElementById("sidebarBackdrop");
const close = document.getElementById("sidebarClose");
const collapse = document.getElementById("sidebarCollapse");
const sidebar = document.getElementById("sidebar");
const DESKTOP_BREAKPOINT = 720;

let desktopPinned = false;
let desktopHovered = false;
let compactLayout = window.innerWidth < DESKTOP_BREAKPOINT;
let hoverCloseTimer: number | undefined;

function isCompactLayout() {
  return window.innerWidth < DESKTOP_BREAKPOINT;
}

function clearHoverCloseTimer() {
  if (hoverCloseTimer !== undefined) {
    window.clearTimeout(hoverCloseTimer);
    hoverCloseTimer = undefined;
  }
}

function updateToggleState(expanded: boolean) {
  toggle?.setAttribute("aria-expanded", String(expanded));
  toggle?.setAttribute("aria-label", expanded ? "侧边栏已展开" : "展开侧边栏");
}

function syncDesktopSidebar() {
  const expanded = desktopPinned || desktopHovered;
  document.body.classList.toggle(
    "sidebar-expanded",
    !compactLayout && expanded,
  );
  document.body.classList.toggle(
    "sidebar-collapsed",
    !compactLayout && !expanded,
  );
  updateToggleState(
    compactLayout ? document.body.classList.contains("sidebar-open") : expanded,
  );
}

function setDesktopHover(value: boolean) {
  clearHoverCloseTimer();
  desktopHovered = value;
  syncDesktopSidebar();
}

function scheduleDesktopClose() {
  clearHoverCloseTimer();
  if (desktopPinned) return;
  hoverCloseTimer = window.setTimeout(() => {
    desktopHovered = false;
    syncDesktopSidebar();
  }, 120);
}

function closeSidebar() {
  sidebar?.classList.remove("open");
  document.body.classList.remove("sidebar-open");
  document.body.style.overflow = "";
  updateToggleState(false);
}

function openSidebar() {
  sidebar?.classList.add("open");
  document.body.classList.add("sidebar-open");
  document.body.style.overflow = "hidden";
  updateToggleState(true);
}

toggle?.addEventListener("mouseenter", () => {
  if (!compactLayout) setDesktopHover(true);
});
toggle?.addEventListener("mouseleave", () => {
  if (!compactLayout) scheduleDesktopClose();
});
toggle?.addEventListener("click", () => {
  if (compactLayout) {
    openSidebar();
    return;
  }
  desktopPinned = true;
  setDesktopHover(true);
});
backdrop?.addEventListener("click", closeSidebar);
close?.addEventListener("click", closeSidebar);
collapse?.addEventListener("click", () => {
  desktopPinned = false;
  desktopHovered = false;
  clearHoverCloseTimer();
  syncDesktopSidebar();
});
sidebar?.addEventListener("mouseenter", () => {
  if (!compactLayout) setDesktopHover(true);
});
sidebar?.addEventListener("mouseleave", () => {
  if (!compactLayout) scheduleDesktopClose();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (compactLayout) {
    closeSidebar();
    return;
  }
  desktopPinned = false;
  desktopHovered = false;
  clearHoverCloseTimer();
  syncDesktopSidebar();
});

window.addEventListener(
  "resize",
  () => {
    const nextCompactLayout = isCompactLayout();
    if (nextCompactLayout !== compactLayout) {
      compactLayout = nextCompactLayout;
      clearHoverCloseTimer();
      desktopHovered = false;
      closeSidebar();
    }
    syncDesktopSidebar();
  },
  { passive: true },
);

document
  .querySelectorAll<HTMLAnchorElement>(".sidebar-item")
  .forEach((link) => {
    link.addEventListener("click", () => {
      if (compactLayout) closeSidebar();
    });
  });

syncDesktopSidebar();
