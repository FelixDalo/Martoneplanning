import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Tokens from context/ui-tokens.md "Motion"
const FADE_UP_EASE = "cubic-bezier(0.24,0.74,0.39,0.96)";
const SIGNATURE_EASE = "cubic-bezier(0.65,0.13,0.2,1.17)";
const REVEAL_DURATION = 0.8;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toElements(nodeList: NodeListOf<Element>): HTMLElement[] {
  return Array.from(nodeList).filter((el): el is HTMLElement => el instanceof HTMLElement);
}

const GSAP_CONTROL_KEYS = new Set([
  "duration",
  "ease",
  "stagger",
  "delay",
  "overwrite",
  "onComplete",
  "onStart",
  "onUpdate",
  "onInterrupt",
  "clearProps",
]);

/**
 * Property names actually being tweened (e.g. "opacity,y" or "clipPath"), for use as `clearProps`
 * once a reveal finishes. Without this, the reveal's own inline style (e.g. `transform` from a
 * `y` tween) stays on the element forever and silently blocks any later CSS rule touching the
 * same property — e.g. `.card:hover { transform: ... }` never applying once a card has already
 * played its reveal, since an inline style always wins over a stylesheet rule.
 */
function clearablePropsOf(tweenVars: gsap.TweenVars): string {
  return Object.keys(tweenVars)
    .filter((key) => !GSAP_CONTROL_KEYS.has(key))
    .join(",");
}

/**
 * Scroll-reveals elements below the given fold threshold via ScrollTrigger. Anything already
 * on/above screen at setup time (direct load on a #hash anchor, reload while already scrolled,
 * back/forward restoration — or simply sitting near the top of a normal page load) gets the
 * same reveal played immediately instead: its scroll-crossing event already happened before
 * this code ran, so a ScrollTrigger.batch onEnter would never fire for it and it would either
 * stay stuck hidden forever, or — the bug this replaced — get silently left at its default
 * visible state with no entrance animation at all. Same defensive "default to visible, but
 * still animate" pattern as nav.ts's first-run handling.
 */
function setupScrollReveal(
  targets: HTMLElement[],
  hiddenVars: gsap.TweenVars,
  tweenVars: gsap.TweenVars,
  startPercent: number,
  batchOptions: { interval?: number; batchMax?: number } = {},
): void {
  if (!targets.length) return;

  const threshold = window.innerHeight * startPercent;
  const alreadyVisible: HTMLElement[] = [];
  const belowFold: HTMLElement[] = [];
  for (const el of targets) {
    (el.getBoundingClientRect().top > threshold ? belowFold : alreadyVisible).push(el);
  }

  const clearProps = clearablePropsOf(tweenVars);

  if (alreadyVisible.length) {
    gsap.set(alreadyVisible, hiddenVars);
    gsap.to(alreadyVisible, { ...tweenVars, delay: 0.2, overwrite: "auto", clearProps });
  }

  if (!belowFold.length) return;

  gsap.set(belowFold, hiddenVars);
  ScrollTrigger.batch(belowFold, {
    start: `top ${startPercent * 100}%`,
    once: true,
    ...batchOptions,
    // "auto" (not true): only overwrites genuinely overlapping properties on these targets.
    // A plain `true` would kill ANY other active tween on the same element — e.g. the unrelated
    // borderColor/boxShadow anchor-arrival flash from initAnchorHighlight — even though the
    // property sets never overlap, which froze that flash mid-transition before its own
    // clearProps could run.
    onEnter: (batch) => gsap.to(batch, { ...tweenVars, overwrite: "auto", clearProps }),
  });
}

/** First section in <main> — the page's hero/header, revealed on load rather than on scroll. */
function getIntroSection(): HTMLElement | null {
  return document.querySelector<HTMLElement>("main > section:first-of-type");
}

/** Home hero: titleblock, h1, lead and CTA row animate in on load as a short staggered sequence. */
function revealHero(hero: HTMLElement): void {
  const items = [
    hero.querySelector<HTMLElement>(".titleblock"),
    hero.querySelector<HTMLElement>("h1"),
    hero.querySelector<HTMLElement>(".lead"),
    hero.querySelector<HTMLElement>(".btn-row"),
  ].filter((el): el is HTMLElement => el !== null);

  if (!items.length) return;

  gsap.set(items, { opacity: 0, y: 22 });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: REVEAL_DURATION,
    ease: FADE_UP_EASE,
    stagger: 0.12,
    delay: 0.2,
    clearProps: "opacity,transform",
  });
}

/** Interior/project-detail page headers: every direct child of the header's .container fades up together on load. */
function revealPageIntro(section: HTMLElement): void {
  const container = section.querySelector<HTMLElement>(":scope > .container");
  const scope = container ?? section;
  const items = Array.from(scope.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !el.classList.contains("rule"),
  );

  if (!items.length) return;

  gsap.set(items, { opacity: 0, y: 18 });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: FADE_UP_EASE,
    stagger: 0.1,
    delay: 0.15,
    clearProps: "opacity,transform",
  });
}

function initIntroReveal(): HTMLElement | null {
  const heroSection = document.querySelector<HTMLElement>('[data-section="hero"]');
  if (heroSection) {
    revealHero(heroSection);
    return heroSection;
  }

  const introSection = getIntroSection();
  if (introSection) revealPageIntro(introSection);
  return introSection;
}

/** Titleblock section labels blur-in + fade as they scroll into view (creative-direction.md "Subtle blur-in on headings"). */
function initTitleblockReveal(introSection: HTMLElement | null): void {
  const targets = toElements(document.querySelectorAll("main .titleblock")).filter(
    (el) => !introSection || !introSection.contains(el),
  );
  setupScrollReveal(
    targets,
    { opacity: 0, filter: "blur(6px)" },
    { opacity: 1, filter: "blur(0px)", duration: 0.7, ease: FADE_UP_EASE, stagger: 0.08 },
    0.88,
  );
}

/** Hairline .rule dividers draw on from left to right as a dimension line would. */
function initRuleReveal(introSection: HTMLElement | null): void {
  const targets = toElements(document.querySelectorAll("main .rule")).filter(
    (el) => !introSection || !introSection.contains(el),
  );
  setupScrollReveal(
    targets,
    { scaleX: 0, transformOrigin: "left center" },
    { scaleX: 1, duration: 0.7, ease: SIGNATURE_EASE, stagger: 0.06 },
    0.92,
  );
}

/** Card-like grid items (service/project/programme/why-feature cards, vmv statements, steps, stat blocks) stagger up together. */
function initCardReveal(introSection: HTMLElement | null): void {
  const selector = "main .card, main .vmv-stmt, main .step, main .grid > div:has(> .stat__num)";
  const targets = toElements(document.querySelectorAll(selector)).filter(
    (el) => !introSection || !introSection.contains(el),
  );
  setupScrollReveal(
    targets,
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.7, ease: FADE_UP_EASE, stagger: 0.08 },
    0.9,
    { interval: 0.08, batchMax: 4 },
  );
}

// A 4-point polygon collapsed to a zero-width line at the left edge, opening out to the full
// rectangle — same point count/order on both ends so GSAP can interpolate each corner directly.
const CLIP_HIDDEN = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
const CLIP_VISIBLE = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

/** Framed media (plans, photos, galleries) reveals left-to-right through an animated polygon clip-path as it scrolls into view. Applies to every plan/photo, including media nested inside cards — the card's own fade-up and the photo's clip reveal are independent, complementary signals. Also covers Home's Why Martone image, the one non-`.framed` media the user asked to include. */
function initFramedMediaReveal(introSection: HTMLElement | null): void {
  const targets = toElements(
    document.querySelectorAll("main .framed .media, main [data-why-media]"),
  ).filter(
    (el) => !introSection || !introSection.contains(el),
  );
  setupScrollReveal(
    targets,
    { clipPath: CLIP_HIDDEN },
    { clipPath: CLIP_VISIBLE, duration: 0.9, ease: SIGNATURE_EASE, stagger: 0.1 },
    0.88,
    { interval: 0.08, batchMax: 3 },
  );
}

/** Named structural content blocks (section heads, service feature copy, FAQ column, testimonial grid, Why Martone top, two-column text panels) fade up as one unit. */
function initContentBlockReveal(introSection: HTMLElement | null): void {
  const selector = [
    "main .section-head",
    "main .svc-content",
    "main .faqsec__right",
    "main .testimonial-grid",
    "main .why__top",
    "main .grid-2 > div:not(.framed):not(.card)",
  ].join(", ");

  const targets = toElements(document.querySelectorAll(selector)).filter(
    (el) => !introSection || !introSection.contains(el),
  );
  setupScrollReveal(
    targets,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: REVEAL_DURATION, ease: FADE_UP_EASE, stagger: 0.1 },
    0.88,
    { interval: 0.08, batchMax: 3 },
  );
}

/**
 * Briefly flashes a section's titleblock border/glow to cyan when the user arrives via an
 * in-page hash link (e.g. Programmes' Overview cards, Services' jump nav) — on direct/deep
 * load and on same-page hash clicks. Color/box-shadow only, no movement, so this stays active
 * even under prefers-reduced-motion (STANDARDS.md: reduced motion means gentler, not zero —
 * keep opacity/color, drop movement). Sections without a .titleblock (e.g. Contact's #location
 * panel) are silently skipped rather than inventing a fallback visual.
 */
function initAnchorHighlight(): void {
  const flash = (titleblock: HTMLElement) => {
    gsap.killTweensOf(titleblock);
    gsap
      .timeline()
      .to(titleblock, {
        borderColor: "#43C8F3",
        boxShadow: "0 0 0 3px rgba(67,200,243,0.18)",
        duration: prefersReducedMotion() ? 0.01 : 0.4,
        ease: FADE_UP_EASE,
      })
      .to(
        titleblock,
        {
          borderColor: "#EBEBEB",
          boxShadow: "0 0 0 0 rgba(67,200,243,0)",
          duration: prefersReducedMotion() ? 0.01 : 0.6,
          ease: FADE_UP_EASE,
          clearProps: "borderColor,boxShadow",
        },
        "+=0.5",
      );
  };

  const highlightFromHash = (hash: string) => {
    if (!hash) return;
    let target: Element | null;
    try {
      target = document.querySelector(hash);
    } catch {
      return;
    }
    if (!target) return;

    const titleblock = target.matches(".titleblock")
      ? target
      : target.querySelector(".titleblock");
    if (titleblock instanceof HTMLElement) flash(titleblock);
  };

  if (location.hash) highlightFromHash(location.hash);
  window.addEventListener("hashchange", () => highlightFromHash(location.hash));
}

export function initAnimations(): void {
  initAnchorHighlight();

  if (prefersReducedMotion()) return;

  const introSection = initIntroReveal();
  initTitleblockReveal(introSection);
  initRuleReveal(introSection);
  initCardReveal(introSection);
  initFramedMediaReveal(introSection);
  initContentBlockReveal(introSection);
}
