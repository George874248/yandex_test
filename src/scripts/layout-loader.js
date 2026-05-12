import { heroBlock } from '../blocks/hero/index.js';
import { marqueeTopBlock } from '../blocks/marquee-top/index.js';
import { tournamentBlock } from '../blocks/tournament/index.js';
import { stagesBlock } from '../blocks/stages/index.js';
import { participantsBlock } from '../blocks/participants/index.js';
import { marqueeBottomBlock } from '../blocks/marquee-bottom/index.js';
import { footerBlock } from '../blocks/footer/index.js';

function injectBlockStyle(id, css) {
  if (!css || !css.trim()) return;
  const styleId = `block-style-${id}`;
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

export const layoutReady = Promise.resolve().then(() => {
  const bodyRoot = document.getElementById('app-body');
  const footerRoot = document.getElementById('app-footer');
  if (!bodyRoot || !footerRoot) {
    throw new Error('Layout mount points are missing in index.html');
  }

  const bodyBlocks = [
    heroBlock,
    marqueeTopBlock,
    tournamentBlock,
    stagesBlock,
    participantsBlock,
    marqueeBottomBlock,
  ];

  bodyBlocks.forEach((block) => injectBlockStyle(block.id, block.styles));
  injectBlockStyle(footerBlock.id, footerBlock.styles);

  bodyRoot.innerHTML = bodyBlocks.map((block) => block.template).join('\n');
  footerRoot.innerHTML = footerBlock.template;
});

window.__layoutReady = layoutReady;
