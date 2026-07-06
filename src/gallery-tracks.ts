import { gsap } from 'gsap';

export function initGalleryTracks(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rows = Array.from(document.querySelectorAll<HTMLElement>('.marquee-gallery__row'));
  if (!rows.length) return;

  // Row 0 moves faster, row 1 slower — keeps them visually out of sync
  const DURATIONS = [45, 65];

  rows.forEach((row, i) => {
    const track = row.querySelector<HTMLElement>('.marquee-gallery__track');
    if (!track) return;

    // Clone the original set and append — track is now 2× wide.
    // Animating x to -50% moves exactly one full original set width, then snaps back.
    const originals = Array.from(track.querySelectorAll<HTMLImageElement>('img'));
    originals.forEach(img => {
      const clone = img.cloneNode(true) as HTMLImageElement;
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    gsap.to(track, {
      x: '-50%',
      duration: DURATIONS[i] ?? 50,
      ease: 'none',
      repeat: -1,
    });
  });
}
