// Contact form — client-side validation and submission.
// Works against /api/contact (Vercel serverless). Requires #contact-form in the DOM.

type FieldName = 'name' | 'phone' | 'email' | 'message';

interface ApiResponse {
  ok?: boolean;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

const RULES: Record<FieldName, { validate: (v: string) => boolean; message: string }> = {
  name: {
    validate: v => v.trim().length >= 2,
    message: 'Please enter your name (at least 2 characters).',
  },
  phone: {
    validate: v => /^[+\d][\d\s\-().]{3,}$/.test(v.trim()),
    message: 'Please enter a valid phone number.',
  },
  email: {
    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: 'Please enter a valid email address.',
  },
  message: {
    validate: v => v.trim().length >= 10,
    message: 'Message must be at least 10 characters.',
  },
};

function qs<T extends Element>(sel: string, ctx: ParentNode = document): T | null {
  return ctx.querySelector<T>(sel);
}

function showFieldError(form: HTMLFormElement, field: string, msg: string): void {
  const input = qs<HTMLElement>(`[name="${field}"]`, form);
  const wrapper = input?.closest<HTMLElement>('.field');
  if (!wrapper) return;
  wrapper.classList.add('field--error');
  const err = document.createElement('span');
  err.className = 'field__error';
  err.setAttribute('role', 'alert');
  err.textContent = msg;
  wrapper.appendChild(err);
}

function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLElement>('.field--error').forEach(el => el.classList.remove('field--error'));
  form.querySelectorAll<HTMLElement>('.field__error').forEach(el => el.remove());
}

function setStatus(el: HTMLElement | null, type: 'success' | 'error' | '', msg: string): void {
  if (!el) return;
  el.textContent = msg;
  el.className = type ? `form-status form-status--${type}` : 'form-status';
}

function setLoading(form: HTMLFormElement, btn: HTMLButtonElement | null, on: boolean): void {
  if (on) {
    form.classList.add('is-loading');
    if (btn) {
      btn.disabled = true;
      btn.dataset['label'] = btn.textContent ?? '';
      btn.textContent = 'Sending…';
    }
  } else {
    form.classList.remove('is-loading');
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset['label'] ?? 'Send enquiry';
    }
  }
}

function fieldValue(form: HTMLFormElement, name: string): string {
  return (qs<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`, form)?.value ?? '').trim();
}

export function initContactForm(): void {
  const form = qs<HTMLFormElement>('#contact-form');
  if (!form) return;

  const status = qs<HTMLElement>('.form-status', form);
  const submitBtn = qs<HTMLButtonElement>('button[type="submit"]', form);

  // Stamp load time so the server can reject submissions faster than a human types.
  const startedInput = qs<HTMLInputElement>('[name="_startedAt"]', form);
  if (startedInput) startedInput.value = String(Date.now());

  // Inline validation on blur — show errors field-by-field as the user moves away.
  (Object.keys(RULES) as FieldName[]).forEach(name => {
    const input = qs<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`, form);
    if (!input) return;
    input.addEventListener('blur', () => {
      const wrapper = input.closest<HTMLElement>('.field');
      if (!wrapper) return;
      // Only surface an error if the field has been touched.
      if (!input.value) return;
      wrapper.querySelector<HTMLElement>('.field__error')?.remove();
      wrapper.classList.remove('field--error');
      if (!RULES[name].validate(input.value)) {
        showFieldError(form, name, RULES[name].message);
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors(form);
    setStatus(status, '', '');

    // Full client-side validation pass before submitting.
    const fieldNames: FieldName[] = ['name', 'phone', 'email', 'message'];
    let valid = true;
    for (const name of fieldNames) {
      const val = fieldValue(form, name);
      if (!RULES[name].validate(val)) {
        showFieldError(form, name, RULES[name].message);
        valid = false;
      }
    }
    if (!valid) {
      // Move focus to first error so keyboard and screen-reader users find it immediately.
      form.querySelector<HTMLElement>('.field--error [name]')?.focus();
      return;
    }

    setLoading(form, submitBtn, true);

    const payload = {
      name: fieldValue(form, 'name'),
      phone: fieldValue(form, 'phone'),
      email: fieldValue(form, 'email'),
      message: fieldValue(form, 'message'),
      _honeypot: (qs<HTMLInputElement>('[name="_honeypot"]', form)?.value ?? ''),
      _startedAt: (qs<HTMLInputElement>('[name="_startedAt"]', form)?.value ?? ''),
    };

    try {
      const res = await fetch('/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as ApiResponse;

      if (res.ok && data.ok) {
        form.reset();
        // Re-stamp after reset so a second submission (unlikely) still passes the timing check.
        if (startedInput) startedInput.value = String(Date.now());
        setStatus(status, 'success', 'Thank you — we\'ve received your enquiry and will be in touch shortly.');
      } else if (data.errors && data.errors.length > 0) {
        for (const err of data.errors) {
          showFieldError(form, err.field, err.message);
        }
        setStatus(status, 'error', 'Please correct the errors above and try again.');
        form.querySelector<HTMLElement>('.field--error [name]')?.focus();
      } else {
        setStatus(status, 'error', data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus(status, 'error', 'Unable to send — please check your connection and try again.');
    } finally {
      setLoading(form, submitBtn, false);
    }
  });
}
