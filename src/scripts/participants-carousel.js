/**
 * Looped, auto-advancing participants carousel.
 *
 * - Auto-advances every 4 seconds.
 * - Truly infinite: clones the first N cards after the last so we can scroll
 *   seamlessly past them, then jumps back to the start with the transition
 *   disabled so the visual loop is invisible.
 * - Pauses on hover, focus and when the tab is hidden.
 * - Supports touch swipe and arrow buttons; respects reduced motion.
 */
const AUTOPLAY_MS = 4000;

export function initParticipantsCarousel() {
  const viewport = document.querySelector('[data-participants-viewport]');
  const track = document.querySelector('[data-participants-track]');
  const prevBtn = document.querySelector('[data-participants-prev]');
  const nextBtn = document.querySelector('[data-participants-next]');
  const currentEl = document.querySelector('[data-participants-current]');
  const totalEl = document.querySelector('[data-participants-total]');

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const original = Array.from(track.children);
  const realTotal = original.length;
  if (realTotal === 0) return;
  if (totalEl) totalEl.textContent = String(realTotal);

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const visibleCount = () => {
    const w = window.innerWidth;
    if (w >= 1100) return 3;
    if (w >= 720) return 2;
    return 1;
  };

  // Append clones so the carousel can advance past the end seamlessly.
  let cloneCount = visibleCount();
  const ensureClones = () => {
    // Wipe and re-add to keep the count tidy after viewport changes.
    track.innerHTML = '';
    original.forEach((node) => track.appendChild(node.cloneNode(true)));
    for (let i = 0; i < cloneCount; i += 1) {
      const clone = original[i].cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  };

  ensureClones();

  let index = 0;
  let timer = 0;
  let paused = false;
  let busy = false;

  const slideWidth = () => {
    const slide = track.firstElementChild;
    if (!slide) return 0;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return slide.getBoundingClientRect().width + gap;
  };

  const setTrack = (offset, animate = true) => {
    track.style.transition = animate
      ? 'transform 0.6s cubic-bezier(0.65,0,0.05,0.95)'
      : 'none';
    track.style.transform = `translateX(${offset}px)`;
  };

  const update = (animate = true) => {
    setTrack(-slideWidth() * index, animate);
    if (currentEl) {
      currentEl.textContent = String((((index % realTotal) + realTotal) % realTotal) + 1);
    }
  };

  const goNext = () => {
    if (busy) return;
    busy = true;
    index += 1;
    update(true);

    if (index >= realTotal) {
      // Wait for transition end, then snap back to the start.
      window.setTimeout(() => {
        index = 0;
        update(false);
        // Force reflow before re-enabling animation.
        track.getBoundingClientRect();
        busy = false;
      }, 620);
    } else {
      window.setTimeout(() => {
        busy = false;
      }, 620);
    }
  };

  const goPrev = () => {
    if (busy) return;
    busy = true;
    if (index <= 0) {
      // Jump to mirrored end first (no animation), then animate one step back.
      index = realTotal;
      update(false);
      track.getBoundingClientRect();
      window.requestAnimationFrame(() => {
        index -= 1;
        update(true);
        window.setTimeout(() => {
          busy = false;
        }, 620);
      });
    } else {
      index -= 1;
      update(true);
      window.setTimeout(() => {
        busy = false;
      }, 620);
    }
  };

  const startAutoplay = () => {
    if (reduceMotion) return;
    stopAutoplay();
    timer = window.setInterval(() => {
      if (!paused) goNext();
    }, AUTOPLAY_MS);
  };

  const stopAutoplay = () => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
  };

  prevBtn.addEventListener('click', () => {
    goPrev();
    startAutoplay();
  });
  nextBtn.addEventListener('click', () => {
    goNext();
    startAutoplay();
  });

  const carouselRoot = viewport.parentElement;
  ['mouseenter', 'focusin'].forEach((evt) =>
    carouselRoot.addEventListener(evt, () => {
      paused = true;
    }),
  );
  ['mouseleave', 'focusout'].forEach((evt) =>
    carouselRoot.addEventListener(evt, () => {
      paused = false;
    }),
  );

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
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
        if (dx < 0) goNext();
        else goPrev();
        startAutoplay();
      }
      startX = null;
    },
    { passive: true },
  );

  // Resize handling: re-clone if visibleCount changed; recompute offset.
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const newCount = visibleCount();
      if (newCount !== cloneCount) {
        cloneCount = newCount;
        ensureClones();
        index = Math.min(index, realTotal - 1);
      }
      update(false);
    });
  });

  update(false);
  startAutoplay();
}
