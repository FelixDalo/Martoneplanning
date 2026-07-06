export function initCsiSection(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".csi-nav__item[data-csi-target]"));
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-csi-item]"));

  if (!links.length || !panels.length || !("IntersectionObserver" in window)) {
    return;
  }

  const setActive = (id: string) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.csiTarget === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target.id) {
        setActive(visible.target.id);
      }
    },
    {
      rootMargin: "-34% 0px -42% 0px",
      threshold: [0.25, 0.45, 0.65],
    }
  );

  panels.forEach((panel) => observer.observe(panel));
}
