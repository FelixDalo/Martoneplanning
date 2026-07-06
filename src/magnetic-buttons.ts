import { gsap } from "gsap";

const MAX_PULL = 7;
const PULL_FACTOR = 0.3;
const HOVER_LIFT = -2;

/**
 * Buttons pull a few px toward the cursor on hover (gsap.quickTo, per gsap-core's
 * recommended pattern for frequently-updated mouse-follow values), then snap back on leave.
 * Desktop pointer-fine only — touch fires false hover/move events that would make this jittery.
 * Replaces .btn--primary/.btn--ghost's CSS `:hover { transform: translateY(-2px) }` for these
 * buttons only (inline GSAP transforms always win over the stylesheet rule), so the existing
 * lift is reproduced here rather than lost.
 */
export function initMagneticButtons(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const buttons = Array.from(document.querySelectorAll<HTMLElement>(".btn"));

  for (const btn of buttons) {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });

    btn.addEventListener("mousemove", (event) => {
      const rect = btn.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      xTo(gsap.utils.clamp(-MAX_PULL, MAX_PULL, offsetX * PULL_FACTOR));
      yTo(HOVER_LIFT + gsap.utils.clamp(-MAX_PULL, MAX_PULL, offsetY * PULL_FACTOR));
    });

    btn.addEventListener("mouseleave", () => {
      xTo(0);
      yTo(0);
    });
  }
}
