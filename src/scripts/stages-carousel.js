/**
 * Stages "carousel".
 *
 * - On wide screens (>= 901px) the cards are arranged in a static collage
 *   (CSS Grid) — the carousel buttons act as page jumps inside the same
 *   grid for accessibility (focus the next card).
 * - On narrow screens the cards become a horizontal carousel (one card per
 *   viewport). The carousel is *not* looped and does *not* autoplay,
 *   per requirements.
 */
export function initStagesCarousel() {
  const viewport = document.querySelector('[data-stages-viewport]');
  const track = document.querySelector('[data-stages-track]');
  const prevBtn = document.querySelector('[data-stages-prev]');
  const nextBtn = document.querySelector('[data-stages-next]');
  const currentEl = document.querySelector('[data-stages-current]');
  const totalEl = document.querySelector('[data-stages-total]');

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const cards = () => Array.from(track.children);
  const total = cards().length;
  if (totalEl) totalEl.textContent = String(total);

  let index = 0;

  const isCarousel = () => window.matchMedia('(max-width: 900px)').matches;

  const update = () => {
    if (isCarousel()) {
      const slide = cards()[0];
      if (!slide) return;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      const slideWidth = slide.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-slideWidth * index}px)`;
    } else {
      track.style.transform = '';
      const card = cards()[index];
      if (card) {
        card.classList.add('is-active');
        cards().forEach((c, i) => {
          if (i !== index) c.classList.remove('is-active');
        });
      }
    }

    if (currentEl) currentEl.textContent = String(index + 1);

    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= total - 1;
  };

  const next = () => {
    if (index < total - 1) index += 1;
    update();
  };
  const prev = () => {
    if (index > 0) index -= 1;
    update();
  };

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard navigation when track focused
  track.tabIndex = 0;
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  });

  // Touch swipe
  let startX = null;
  viewport.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  viewport.addEventListener(
    'touchend',
    (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next();
        else prev();
      }
      startX = null;
    },
    { passive: true },
  );

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      // reset on layout change so we don't end up with a partial offset
      if (!isCarousel()) {
        track.style.transform = '';
      }
      update();
    });
  });

  update();
}
