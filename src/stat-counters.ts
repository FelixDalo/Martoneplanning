import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const COUNT_DURATION = 1.3;
const COUNT_EASE = "power2.out";

interface ParsedStat {
  el: HTMLElement;
  target: number;
  suffix: string;
}

/** Splits "10+", "98%", "7" etc. into a numeric target and whatever non-digit suffix follows it. */
function parseStat(el: HTMLElement): ParsedStat | null {
  const match = (el.textContent ?? "").trim().match(/^(\d+)(.*)$/);
  if (!match) return null;
  return { el, target: Number(match[1]), suffix: match[2] };
}

function animateCount(stat: ParsedStat): void {
  const counter = { value: 0 };
  gsap.to(counter, {
    value: stat.target,
    duration: COUNT_DURATION,
    ease: COUNT_EASE,
    onUpdate: () => {
      stat.el.textContent = `${Math.round(counter.value)}${stat.suffix}`;
    },
  });
}

/**
 * Stat numbers count up from 0 to their authored value on scroll, preserving any suffix
 * ("+", "%", etc.). Numbers themselves are still placeholder/pending client confirmation
 * (see progress-tracker.md) — this only animates whatever value is currently authored.
 */
export function initStatCounters(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("main .stat__num"));
  if (!targets.length) return;

  const stats = targets.map(parseStat).filter((s): s is ParsedStat => s !== null);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const threshold = window.innerHeight * 0.88;
  const alreadyVisible: ParsedStat[] = [];
  const belowFold: ParsedStat[] = [];
  for (const stat of stats) {
    (stat.el.getBoundingClientRect().top > threshold ? belowFold : alreadyVisible).push(stat);
  }

  for (const stat of stats) stat.el.textContent = `0${stat.suffix}`;
  for (const stat of alreadyVisible) animateCount(stat);

  if (!belowFold.length) return;

  ScrollTrigger.batch(belowFold.map((stat) => stat.el), {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      for (const el of batch) {
        const stat = belowFold.find((s) => s.el === el);
        if (stat) animateCount(stat);
      }
    },
  });
}
