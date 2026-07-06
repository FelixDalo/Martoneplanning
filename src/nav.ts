import { gsap } from "gsap";

/** Mobile menu links stagger in with a faint rotate-settle, like a ruler snapping flat, instead of a plain fade. */
function playMenuUnfold(menu: HTMLElement): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const links = Array.from(menu.querySelectorAll<HTMLElement>("a"));
  if (!links.length) return;

  gsap.killTweensOf(links);
  gsap.fromTo(
    links,
    { opacity: 0, y: -6, rotation: -2.5, transformOrigin: "left center" },
    {
      opacity: 1,
      y: 0,
      rotation: 0,
      duration: 0.45,
      ease: "back.out(1.6)",
      stagger: 0.05,
      clearProps: "transform",
    },
  );
}

export function initNavbar(): void {
  const navbar = document.querySelector<HTMLElement>(".navbar");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (!navbar || !(toggle instanceof HTMLButtonElement) || !menu) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  let isFirstRun = true;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    navbar.classList.remove("is-hidden");
    navbar.classList.toggle("navbar--scrolled", window.scrollY > 12);
    if (isOpen) playMenuUnfold(menu);
  });

  const updateNavbar = (): void => {
    const currentScrollY = Math.max(window.scrollY, 0);
    const isAtTop = currentScrollY <= 12;
    const scrollDelta = currentScrollY - lastScrollY;
    const isScrollingDown = scrollDelta > 2;
    const isScrollingUp = scrollDelta < -2;
    const isMenuOpen = menu.classList.contains("is-open");

    if (isAtTop) {
      navbar.classList.remove("navbar--scrolled", "is-hidden");
      lastScrollY = currentScrollY;
      isFirstRun = false;
      ticking = false;
      return;
    }

    // On the first evaluation there is no real previous scroll position to diff against
    // (e.g. a reload or back/forward navigation can restore a deep scroll position), so
    // scrollDelta would be ~0 and fall through every branch, leaving the navbar in its
    // unstyled hero state (transparent, white text) over non-hero content. Default to the
    // readable "scrolled" treatment whenever we can't tell the direction yet.
    if (isMenuOpen || isFirstRun || isScrollingUp) {
      navbar.classList.add("navbar--scrolled");
      navbar.classList.remove("is-hidden");
    } else if (isScrollingDown) {
      navbar.classList.remove("navbar--scrolled");
      navbar.classList.add("is-hidden");
    }

    lastScrollY = currentScrollY;
    isFirstRun = false;
    ticking = false;
  };

  updateNavbar();

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateNavbar);
    },
    { passive: true },
  );
}
