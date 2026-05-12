/**
 * Seamless infinite marquee.
 * Duplicates content until the strip is at least 2x viewport wide,
 * then animates `translateX(-50%)` so the loop is visually seamless.
 *
 * Pauses on hover and respects prefers-reduced-motion.
 */
export function initMarquee(track) {
  if (!track) return;
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (reduceMotion) {
    track.style.animation = 'none';
    return;
  }

  const original = Array.from(track.children).map((node) => node.cloneNode(true));

  const ensureWidth = () => {
    while (track.scrollWidth < window.innerWidth * 2) {
      original.forEach((node) => track.appendChild(node.cloneNode(true)));
    }
  };

  ensureWidth();

  const fragment = document.createDocumentFragment();
  Array.from(track.children).forEach((node) =>
    fragment.appendChild(node.cloneNode(true)),
  );
  track.appendChild(fragment);

  const setDuration = () => {
    const baseSpeed = 90;
    const widthHalf = track.scrollWidth / 2;
    const duration = Math.max(20, widthHalf / baseSpeed);
    track.style.animationDuration = `${duration}s`;
  };

  setDuration();

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(setDuration);
  });
}
