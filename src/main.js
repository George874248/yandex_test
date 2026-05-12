import { participants } from './scripts/data.js';
import { initMarquee } from './scripts/marquee.js';
import { initParticipantsCarousel } from './scripts/participants-carousel.js';
import { initStagesCarousel } from './scripts/stages-carousel.js';
import { initReveal } from './scripts/reveal.js';
import { renderParticipants } from './scripts/render-participants.js';

const ready = (fn) =>
  document.readyState !== 'loading'
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn, { once: true });

ready(() => {
  const waitForLayout = window.__layoutReady ?? Promise.resolve();
  waitForLayout.then(() => {
    renderParticipants(participants);
    document.querySelectorAll('[data-marquee]').forEach((track) => initMarquee(track));
    initStagesCarousel();
    initParticipantsCarousel();
    initReveal();
  });
});
