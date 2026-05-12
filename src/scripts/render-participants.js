/**
 * Builds participant cards into the carousel track.
 */

export function renderParticipants(list) {
  const track = document.querySelector('[data-participants-track]');
  if (!track) return;

  track.innerHTML = list
    .map(
      (p) => `
      <li class="participant-card">
        <div class="participant-card__photo">
          <img src="/assets/img/man-slider.svg" alt="" loading="lazy" />
        </div>
        <h3 class="participant-card__title">${p.name}</h3>
        <p class="participant-card__role">${p.role}</p>
        <a href="#participants" class="participant-card__more">Подробнее</a>
      </li>`,
    )
    .join('');

  const total = document.querySelector('[data-participants-total]');
  if (total) total.textContent = String(list.length);
}
