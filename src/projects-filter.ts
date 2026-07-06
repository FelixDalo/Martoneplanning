type FilterButton = HTMLButtonElement & { dataset: DOMStringMap };

function setGroupExpanded(button: HTMLButtonElement, expanded: boolean) {
  const controls = button.getAttribute("aria-controls");
  const items = controls ? document.getElementById(controls) : null;
  const icon = button.querySelector<HTMLElement>("i");

  button.setAttribute("aria-expanded", String(expanded));

  if (items) {
    items.hidden = !expanded;
  }

  if (icon) {
    icon.classList.toggle("ti-x", expanded);
    icon.classList.toggle("ti-plus", !expanded);
  }
}

export function initProjectsFilter() {
  const filterButtons = Array.from(
    document.querySelectorAll<FilterButton>(".prj-cat__item[data-filter], .prj-filter__all[data-filter]")
  );
  const projectCards = Array.from(
    document.querySelectorAll<HTMLElement>(".prj-card[data-project-tags]")
  );
  const groupButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".prj-cat__head[aria-controls]")
  );

  if (!filterButtons.length || !projectCards.length) return;

  const applyFilter = (filter: string) => {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const tags = (card.dataset.projectTags ?? "").split(/\s+/).filter(Boolean);
      const isMatch = filter === "all" || tags.includes(filter);
      card.hidden = !isMatch;
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      if (!filter) return;
      applyFilter(filter);
    });
  });

  groupButtons.forEach((button) => {
    const expanded = button.getAttribute("aria-expanded") !== "false";
    setGroupExpanded(button, expanded);

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") !== "false";
      setGroupExpanded(button, !isExpanded);
    });
  });

  const initial = filterButtons.find((button) => button.classList.contains("active"))?.dataset.filter ?? "all";
  applyFilter(initial);
}
