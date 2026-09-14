const sectionIds = ["about", "skills", "projects", "experience", "activities", "contact"];
const allLinks = [...document.querySelectorAll("[data-nav-link]")];
const desktopNav = document.querySelector("[data-desktop-nav]");
const spotlight = document.querySelector("[data-spotlight]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const aboutSection = document.querySelector("[data-about-section]");
const aboutPin = document.querySelector("[data-about-pin]");
const aboutIdentityItems = [...document.querySelectorAll("[data-about-identity]")];
const aboutRuleItems = [...document.querySelectorAll("[data-about-rule]")];
const aboutTitlePieces = [...document.querySelectorAll(".about-title-line")];
const aboutSupport = [...document.querySelectorAll("[data-about-support]")];
const aboutTags = [...document.querySelectorAll("[data-about-tag]")];
const aboutSideLeft = document.querySelector("[data-about-side-left]");
const aboutSideRight = document.querySelector("[data-about-side-right]");
const puzzlePanels = [...document.querySelectorAll("[data-puzzle-panel]")];
const aboutCards = [...document.querySelectorAll("[data-about-card]")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeId = "about";
let aboutTicking = false;

const panelOrigins = [
  { x: -360, y: -120, scale: 0.84 },
  { x: 0, y: -190, scale: 0.8 },
  { x: 360, y: -120, scale: 0.84 },
  { x: -300, y: 60, scale: 0.82 },
  { x: 0, y: 120, scale: 0.78 },
  { x: 300, y: 60, scale: 0.82 },
  { x: -180, y: 240, scale: 0.76 },
  { x: 180, y: 240, scale: 0.76 },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function progressBetween(progress, start, end) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp((progress - start) / (end - start));
}

function easeInOut(value) {
  return value * value * (3 - 2 * value);
}

function setStyleVars(element, vars) {
  Object.entries(vars).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
}

function desktopLinks() {
  return [...document.querySelectorAll(".desktop-nav [data-nav-link]")];
}

function setSpotlightTo(link, visible = true) {
  if (!desktopNav || !spotlight || !link) return;

  const navRect = desktopNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const left = linkRect.left - navRect.left;

  spotlight.style.setProperty("--spotlight-left", `${left}px`);
  spotlight.style.setProperty("--spotlight-width", `${linkRect.width}px`);
  spotlight.style.setProperty("--spotlight-opacity", visible ? "1" : "0.72");
}

function updateActiveLink(id) {
  activeId = id;

  allLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const activeDesktopLink = document.querySelector(`.desktop-nav [href="#${id}"]`);
  setSpotlightTo(activeDesktopLink, true);
}

function closeMenu() {
  if (!mobileMenu || !menuToggle) return;

  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  if (!mobileMenu || !menuToggle) return;

  const isOpening = mobileMenu.hidden;
  mobileMenu.hidden = !isOpening;
  menuToggle.setAttribute("aria-expanded", String(isOpening));
  menuToggle.setAttribute("aria-label", isOpening ? "Close navigation menu" : "Open navigation menu");
  document.body.classList.toggle("menu-open", isOpening);
}

function getScrollPaddingTop() {
  return Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

function scrollToSection(id, replace = false) {
  const target = document.getElementById(id);
  if (!target) return;

  const offset = id === "about" ? 0 : getScrollPaddingTop();
  const top = Math.max(0, target.offsetTop - offset);
  const behavior = replace || prefersReducedMotion.matches ? "auto" : "smooth";

  window.scrollTo({ top, behavior });
  if (replace) {
    window.history.replaceState(null, "", `#${id}`);
  } else {
    window.history.pushState(null, "", `#${id}`);
  }
  updateActiveLink(id);
}

desktopLinks().forEach((link) => {
  link.addEventListener("pointerenter", () => setSpotlightTo(link, true));
  link.addEventListener("focus", () => setSpotlightTo(link, true));
});

desktopNav?.addEventListener("pointerleave", () => {
  const activeDesktopLink = document.querySelector(`.desktop-nav [href="#${activeId}"]`);
  setSpotlightTo(activeDesktopLink, true);
});

allLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href")?.replace("#", "");
    if (sectionIds.includes(id)) {
      event.preventDefault();
      scrollToSection(id);
    }

    closeMenu();
  });
});

menuToggle?.addEventListener("click", toggleMenu);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    menuToggle?.focus();
  }
});

document.addEventListener("click", (event) => {
  const header = document.querySelector("[data-navbar]");
  if (!header?.contains(event.target)) {
    closeMenu();
  }
});

const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      updateActiveLink(visible.target.id);
    }
  },
  {
    root: null,
    rootMargin: "-38% 0px -42% 0px",
    threshold: [0.08, 0.18, 0.32, 0.48, 0.64],
  }
);

sections.forEach((section) => observer.observe(section));

window.addEventListener("resize", () => {
  const activeDesktopLink = document.querySelector(`.desktop-nav [href="#${activeId}"]`);
  setSpotlightTo(activeDesktopLink, true);

  if (window.matchMedia("(min-width: 921px)").matches) {
    closeMenu();
  }

  requestAboutUpdate();
});

window.addEventListener("load", () => {
  const hashId = window.location.hash.replace("#", "");
  if (sectionIds.includes(hashId)) {
    updateActiveLink(hashId);
    window.requestAnimationFrame(() => {
      scrollToSection(hashId, true);
      window.setTimeout(() => scrollToSection(hashId, true), 80);
    });
  } else {
    updateActiveLink(activeId);
  }

  updateAboutScroll();
});

function updateAboutScroll() {
  aboutTicking = false;
  if (!aboutSection || !aboutPin) return;

  const rect = aboutSection.getBoundingClientRect();
  const scrollDistance = Math.max(1, aboutSection.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / scrollDistance);

  if (prefersReducedMotion.matches) {
    setStyleVars(aboutPin, {
      "--dark-stage": "1",
      "--identity-opacity": "0",
      "--rule-opacity": "0",
      "--rule-line-scale": "0",
      "--support-opacity": "0",
      "--side-opacity": "0",
      "--intro-opacity": "0",
      "--puzzle-opacity": "0",
      "--image-stage-opacity": "1",
      "--image-stage-y": "0",
    });

    aboutCards.forEach((card, index) => {
      const isFinal = index === aboutCards.length - 1;
      card.style.setProperty("--card-opacity", isFinal ? "1" : "0");
      card.style.setProperty("--card-y", "0");
      card.style.setProperty("--card-x", "0");
      card.style.setProperty("--card-scale", "1");
      card.style.setProperty("--card-clip", "0%");
    });
    return;
  }

  const introExit = easeInOut(progressBetween(progress, 0.62, 0.7));
  const identityIn = easeInOut(progressBetween(progress, 0.03, 0.08));
  const ruleIn = easeInOut(progressBetween(progress, 0.08, 0.13));
  const supportIn = easeInOut(progressBetween(progress, 0.13, 0.2));
  const sideLeftIn = easeInOut(progressBetween(progress, 0.13, 0.2));
  const sideRightIn = easeInOut(progressBetween(progress, 0.13, 0.2));
  const microOut = easeInOut(progressBetween(progress, 0.62, 0.7));
  const darkStage = easeInOut(progressBetween(progress, 0.68, 0.78));
  const puzzleIn = easeInOut(progressBetween(progress, 0.72, 0.84));
  const puzzleOut = easeInOut(progressBetween(progress, 0.86, 0.94));
  const imageStage = easeInOut(progressBetween(progress, 0.8, 0.9));

  setStyleVars(aboutPin, {
    "--dark-stage": darkStage.toFixed(3),
    "--identity-opacity": (identityIn * (1 - introExit)).toFixed(3),
    "--identity-y": (18 - 18 * identityIn - 18 * introExit).toFixed(2),
    "--rule-opacity": (ruleIn * (1 - introExit)).toFixed(3),
    "--rule-line-scale": (ruleIn * (1 - introExit)).toFixed(3),
    "--support-opacity": (supportIn * (1 - microOut)).toFixed(3),
    "--support-y": (18 - 18 * supportIn - 18 * microOut).toFixed(2),
    "--side-opacity": (Math.max(sideLeftIn, sideRightIn) * (1 - microOut)).toFixed(3),
    "--side-y": (20 - 20 * Math.max(sideLeftIn, sideRightIn) + 16 * microOut).toFixed(2),
    "--intro-opacity": (1 - introExit).toFixed(3),
    "--intro-y": (-92 * introExit).toFixed(2),
    "--intro-scale": (1 - 0.06 * introExit).toFixed(3),
    "--puzzle-opacity": (puzzleIn * (1 - puzzleOut)).toFixed(3),
    "--image-stage-opacity": imageStage.toFixed(3),
    "--image-stage-y": (52 - 52 * imageStage).toFixed(2),
  });

  aboutTitlePieces.forEach((piece, index) => {
    const ranges = [
      [0.2, 0.26],
      [0.26, 0.34],
      [0.26, 0.34],
      [0.34, 0.42],
    ];
    const [start, end] = ranges[index] || [0.14, 0.22];
    const pieceIn = easeInOut(progressBetween(progress, start, end));
    const pieceOut = easeInOut(progressBetween(progress, 0.62, 0.7));

    piece.style.setProperty("--piece-opacity", (pieceIn * (1 - pieceOut)).toFixed(3));
    piece.style.setProperty("--piece-y", (44 - 44 * pieceIn - 42 * pieceOut).toFixed(2));

    if (piece.classList.contains("about-title-problem")) {
      piece.style.setProperty("--problem-x", (-26 + 26 * pieceIn - 12 * pieceOut).toFixed(2));
    }

    if (piece.classList.contains("about-title-meets")) {
      piece.style.setProperty("--meets-x", (26 - 26 * pieceIn + 12 * pieceOut).toFixed(2));
    }
  });

  aboutTags.forEach((tag, index) => {
    const tagIn = easeInOut(progressBetween(progress, 0.42 + index * 0.06, 0.48 + index * 0.06));
    const tagOut = easeInOut(progressBetween(progress, 0.62, 0.7));
    const finalRotate = tag.style.getPropertyValue("--tag-rotate-final") || getComputedStyle(tag).getPropertyValue("--tag-rotate-final") || "0deg";

    tag.style.setProperty("--tag-opacity", (tagIn * (1 - tagOut)).toFixed(3));
    tag.style.setProperty("--tag-y", (22 - 22 * tagIn + 16 * tagOut).toFixed(2));
    tag.style.setProperty("--tag-scale", (0.92 + 0.08 * tagIn - 0.04 * tagOut).toFixed(3));
    tag.style.setProperty("--tag-rotate", finalRotate.trim());
  });

  aboutIdentityItems.forEach((item) => {
    item.style.setProperty("--identity-opacity", (identityIn * (1 - introExit)).toFixed(3));
    item.style.setProperty("--identity-y", (18 - 18 * identityIn - 18 * introExit).toFixed(2));
  });

  aboutRuleItems.forEach((item) => {
    item.style.setProperty("--rule-opacity", (ruleIn * (1 - introExit)).toFixed(3));
    item.style.setProperty("--rule-line-scale", (ruleIn * (1 - introExit)).toFixed(3));
  });

  aboutSupport.forEach((item) => {
    item.style.setProperty("--support-opacity", (supportIn * (1 - microOut)).toFixed(3));
    item.style.setProperty("--support-y", (18 - 18 * supportIn - 18 * microOut).toFixed(2));
  });

  if (aboutSideLeft) {
    aboutSideLeft.style.setProperty("--side-opacity", (sideLeftIn * (1 - microOut)).toFixed(3));
    aboutSideLeft.style.setProperty("--side-y", (20 - 20 * sideLeftIn + 16 * microOut).toFixed(2));
  }

  if (aboutSideRight) {
    aboutSideRight.style.setProperty("--side-opacity", (sideRightIn * (1 - microOut)).toFixed(3));
    aboutSideRight.style.setProperty("--side-y", (20 - 20 * sideRightIn + 16 * microOut).toFixed(2));
  }

  puzzlePanels.forEach((panel, index) => {
    const origin = panelOrigins[index] || { x: 0, y: 0, scale: 1 };
    const assemble = easeInOut(progressBetween(progress, 0.5 + index * 0.012, 0.64 + index * 0.008));
    const scatter = easeInOut(progressBetween(progress, 0.7, 0.82));
    const x = origin.x * (1 - assemble) + origin.x * -0.18 * scatter;
    const y = origin.y * (1 - assemble) + (index < 3 ? -95 : 95) * scatter;
    const scale = origin.scale + (1 - origin.scale) * assemble - 0.08 * scatter;

    panel.style.setProperty("--panel-x", x.toFixed(2));
    panel.style.setProperty("--panel-y", y.toFixed(2));
    panel.style.setProperty("--panel-scale", scale.toFixed(3));
    panel.style.setProperty("--panel-opacity", (1 - scatter * 0.88).toFixed(3));
  });

  const cardWindows = [
    { start: 0.62, full: 0.7, fade: 0.77, end: 0.82, x: -42 },
    { start: 0.78, full: 0.84, fade: 0.9, end: 0.94, x: 38 },
    { start: 0.91, full: 0.97, fade: 1, end: 1, x: 0 },
  ];

  aboutCards.forEach((card, index) => {
    const timing = cardWindows[index];
    const cardIn = easeInOut(progressBetween(progress, timing.start, timing.full));
    const cardOut = index === aboutCards.length - 1 ? 0 : easeInOut(progressBetween(progress, timing.fade, timing.end));
    const opacity = cardIn * (1 - cardOut);
    const y = 42 - 42 * cardIn - 24 * cardOut;
    const x = timing.x * (1 - cardIn) + timing.x * -0.35 * cardOut;
    const scale = 0.94 + 0.06 * cardIn - 0.035 * cardOut;
    const clip = 28 - 28 * cardIn + 16 * cardOut;

    card.classList.toggle("is-current", opacity > 0.55);
    card.style.setProperty("--card-opacity", opacity.toFixed(3));
    card.style.setProperty("--card-y", y.toFixed(2));
    card.style.setProperty("--card-x", x.toFixed(2));
    card.style.setProperty("--card-scale", scale.toFixed(3));
    card.style.setProperty("--card-clip", `${clip.toFixed(2)}%`);
  });
}

function requestAboutUpdate() {
  if (aboutTicking) return;
  aboutTicking = true;
  window.requestAnimationFrame(updateAboutScroll);
}

window.addEventListener("scroll", requestAboutUpdate, { passive: true });
prefersReducedMotion.addEventListener?.("change", updateAboutScroll);
updateAboutScroll();
