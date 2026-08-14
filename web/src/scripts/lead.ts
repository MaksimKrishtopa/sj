document.querySelectorAll<HTMLFormElement>('[data-lead]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = form.querySelector<HTMLElement>('.lead-ok');
    form.querySelectorAll('input, textarea, button').forEach((el) => {
      if (el instanceof HTMLButtonElement) el.disabled = true;
    });
    if (ok) ok.hidden = false;
  });
});

const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
burger?.addEventListener('click', () => {
  nav?.classList.toggle('open');
  burger.classList.toggle('open');
});
