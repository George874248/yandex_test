/**
 * Subtle scroll-reveal: fades blocks in as they enter the viewport.
 * Uses IntersectionObserver and respects prefers-reduced-motion.
 */
export function initReveal() {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const targets = [
    ...document.querySelectorAll(
      '.section-title, .lecture, .info-list, .stage-card, .participant-card, .footer p, .tournament__heading, .lecture__photo',
    ),
  ];
  targets.forEach((el, i) => {
    el.setAttribute('data-reveal', '');
    el.setAttribute('data-reveal-delay', String((i % 3) + 1));
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  targets.forEach((el) => io.observe(el));
}
