type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "\"Martone Planning Studio is a dedicated, focused and hardworking practice. Martin Morapedi's knowledge of planning matters and ability to network with stakeholders brought huge success to our company.\"",
    name: "Tefo Kgowe",
    role: "Managing Director, Perfect Inch (Pty) Ltd",
  },
  {
    quote: "\"Martone Planning Studio's knowledge of physical planning, retail network planning, development issues and business development matters sets them apart from other practices.\"",
    name: "Joel Mzyece",
    role: "Managing Director, Okavango Properties Pty Ltd",
  },
  {
    quote: "\"Martone Planning Studio provided outstanding expertise across critical projects, with deliverables completed on time and to an excellent standard.\"",
    name: "Henry Mugambi",
    role: "Company Secretary, True Horizon (Pty) Ltd",
  },
  {
    quote: "\"We have no hesitation in recommending Martin Othusitse Morapedi and Martone Planning Studio for any town planning or related assignments.\"",
    name: "Isaac Ntombela",
    role: "Managing Director, Ntombela Holdings",
  },
  {
    quote: "\"With all the projects delivered by Martone Planning Studio, I am confident they can tackle any town planning matter including subdivisions of any kind.\"",
    name: "Reatile Clausen Morapedi",
    role: "Managing Director, RCM aRChitecte",
  },
];

export function initTestimonials(): void {
  const quote = document.querySelector<HTMLElement>("[data-testimonial-quote]");
  const name = document.querySelector<HTMLElement>("[data-testimonial-name]");
  const role = document.querySelector<HTMLElement>("[data-testimonial-role]");
  const previous = document.querySelector<HTMLButtonElement>("[data-testimonial-prev]");
  const next = document.querySelector<HTMLButtonElement>("[data-testimonial-next]");

  if (!quote || !name || !role || !previous || !next) {
    return;
  }

  let currentIndex = 0;

  const show = (index: number): void => {
    currentIndex = (index + testimonials.length) % testimonials.length;
    const item = testimonials[currentIndex];

    if (!item) {
      return;
    }

    quote.textContent = item.quote;
    name.textContent = item.name;
    role.textContent = item.role;
  };

  previous.addEventListener("click", () => show(currentIndex - 1));
  next.addEventListener("click", () => show(currentIndex + 1));

  show(0);
}
