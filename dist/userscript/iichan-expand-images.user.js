// ==UserScript==
// @name         [IIchan] Expand images
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.7
// @description  Expands images on click
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-expand-images.meta.js
// @author       Cirno
// @match        http://nowere.net/*
// @match        https://nowere.net/*
// @grant        none
// ==/UserScript==

(() => {
const onThumbnailClick = (e) => {
  const fallbackMediaQuery = '(min-width: 360px)'; // jshint ignore:line
  if (!window.matchMedia(fallbackMediaQuery).matches) {
    return;
  }
  const img = e.currentTarget.querySelector('.thumb');
  const isExpanded = img.src == img.dataset.fullSrc;
  const w = isExpanded ? img.dataset.thumbWidth : img.dataset.fullWidth;
  const h = isExpanded ? img.dataset.thumbHeight : img.dataset.fullHeight;
  img.setAttribute('width', w);
  img.setAttribute('height', h);
  if (isExpanded) {
    img.style = '';
  } else {
    img.style.width = w + 'px';
    // img.style.height = h + 'px';
    img.style.height = 'auto';
  }
  img.src = isExpanded ? img.dataset.thumbSrc : img.dataset.fullSrc;
  e.preventDefault();
};

const addListeners = (rootNode) => {
  const thumbs = (rootNode || document).querySelectorAll('.thumb');
  for (const img of thumbs) {
    const a = img.parentNode;
    if (!a) continue;
    const imageExt = a.href.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp']; // jshint ignore:line
    if (!allowedExtensions.includes(imageExt)) continue;
    img.dataset.thumbWidth = img.getAttribute('width');
    img.dataset.thumbHeight = img.getAttribute('height');
    img.dataset.thumbSrc = img.src;
    img.dataset.fullSrc = a.href;
    const post = a.parentNode;
    if (!post) continue;
    const filesize = post.querySelector('.filesize > em');
    if (!filesize) continue;
    const WxH = filesize.innerText.match(/(\d+)x(\d+)/);
    if (WxH === null) continue;
    img.dataset.fullWidth = WxH[1];
    img.dataset.fullHeight = WxH[2];
    a.addEventListener('click', onThumbnailClick);
  }
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
      @media only screen and (min-width: 360px) {
        a img.thumb[src*="/src/"] {
          max-width: calc(100% - 8px);
          max-height: initial;
        }
        a img.thumb {
          margin: 0;
          padding: 2px 4px;
        }
      }
      @media only screen and (min-width: 480px) {
        a img.thumb[src*="/src/"] {
          max-width: calc(100% - 40px);
          max-height: initial;
        }
        a img.thumb {
          margin: 0;
          padding: 2px 20px;
        }
      }
    </style>`);
};

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');

const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const init = () => {
  if (isDollchan()) return;
  if (getSettings().disable_expand_images) return;
  appendCSS();
  addListeners();
  if ('MutationObserver' in window) {
    if (isDollchan()) return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          addListeners(node);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

})();