const root = document.documentElement;
const nav = document.querySelector(".site-nav");
const burger = document.querySelector(".burger");
const themeToggle = document.querySelector("#theme-toggle");
const themeSwitchText = document.querySelector(".theme-switch-text");
const scrollFab = document.querySelector(".scroll-fab");
const siteHeader = document.querySelector(".site-header");
const siteFooter = document.querySelector(".site-footer");
const mainSections = Array.from(document.querySelectorAll("main > section"));
const revealItems = document.querySelectorAll(".reveal");
const menuLinks = document.querySelectorAll(".nav-menu a");

const storedTheme = localStorage.getItem("sandbox-theme");
root.dataset.theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";

function updateThemeButton() {
  if (!themeToggle) return;
  const isDark = root.dataset.theme === "dark";
  if (themeSwitchText) {
    themeSwitchText.textContent = isDark ? "Lys" : "Mørk";
  }
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Skift til lys tilstand" : "Skift til mørk tilstand",
  );
  themeToggle.setAttribute("aria-checked", String(isDark));
}

function setMenuState(isOpen) {
  if (!nav || !burger) return;
  nav.classList.toggle("is-open", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute("aria-label", isOpen ? "Luk menu" : "Åbn menu");
}

function headerOffset() {
  return siteHeader ? siteHeader.offsetHeight : 0;
}

function maxScrollY() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function atPageBottom() {
  return window.scrollY >= maxScrollY() - 24;
}

function footerOffset() {
  if (!siteFooter) return 16;

  const footerRect = siteFooter.getBoundingClientRect();
  const overlap = window.innerHeight - footerRect.top + 16;

  return Math.max(16, overlap);
}

function isTopMode() {
  return atPageBottom();
}

function nextTopLevelSection() {
  const currentMarker = window.scrollY + headerOffset() + 24;
  return mainSections.find((section) => section.offsetTop > currentMarker + 8);
}

function scrollForward() {
  const nextSection = nextTopLevelSection();
  const targetTop = nextSection
    ? nextSection.offsetTop - headerOffset() - 16
    : maxScrollY();

  window.scrollTo({
    top: Math.min(maxScrollY(), Math.max(0, targetTop)),
    behavior: "smooth",
  });
}

updateThemeButton();
setMenuState(false);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("sandbox-theme", root.dataset.theme);
    updateThemeButton();
  });
}

if (burger) {
  burger.addEventListener("click", () => {
    setMenuState(!nav.classList.contains("is-open"));
  });
}

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

function updateScrollFab() {
  if (!scrollFab) return;
  const topMode = isTopMode();
  scrollFab.textContent = topMode ? "Til toppen" : "Til indhold";
  scrollFab.classList.toggle("is-top", topMode);
  scrollFab.setAttribute(
    "aria-label",
    topMode ? "Til toppen" : "Til indhold",
  );
  scrollFab.style.bottom = `${footerOffset()}px`;
}

if (scrollFab && mainSections.length) {
  scrollFab.addEventListener("click", () => {
    if (isTopMode()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    scrollForward();
  });
}

window.addEventListener("scroll", updateScrollFab, { passive: true });
window.addEventListener("load", updateScrollFab);
window.addEventListener("resize", () => {
  updateScrollFab();
  if (window.innerWidth >= 860) {
    setMenuState(false);
  }
});
updateScrollFab();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) return;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
