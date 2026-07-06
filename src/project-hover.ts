export function initProjectImageHover() {
  const links = document.querySelectorAll<HTMLElement>(".prj-card__imgs");

  links.forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      const rect = link.getBoundingClientRect();
      link.style.setProperty("--hover-x", `${event.clientX - rect.left}px`);
      link.style.setProperty("--hover-y", `${event.clientY - rect.top}px`);
    });
  });
}
