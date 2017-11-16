// ==UserScript==
// @name         Video players on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Video players on thumbnail click
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-video-player.meta.js
// @author       Mithgol
// @match        http://iichan.hk/*
// @match        https://iichan.hk/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  /*
  Список расширений файлов, преобразуемых в видеопроигрыватели.
  */
  const EXTENSIONS = ['webm', 'mp4', 'ogv'];
  /*
  Класс CSS, применяемый для видеопроигрывателей.
  */
  const VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';

  const addListeners = (e) => {
    const onThumbnailClick = (e) => {
      const parentNode = e.currentTarget.parentNode;
      const vp = document.createElement('video');
      vp.src = e.currentTarget.href;
      vp.classList.add(VIDEO_PLAYER_CLASSNAME);
      parentNode.instertBefore(vp, e.currentTarget);
      parentNode.removeChild(e.currentTarget);
      e.preventDefault();
    };

    const thumbs = document.querySelectorAll('.thumb');
    for (const img of thumbs) {
      const a = img.parentNode;
      if (!a) continue;
      const videoExt = a.href.split('.').pop();
      if (!EXTENSIONS.includes(videoExt)) continue;
      a.addEventListener('click', onThumbnailClick);
    }
  };

  const appendCSS = () => {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${VIDEO_PLAYER_CLASSNAME} {
            max-width: calc(100% - 42px);
        }
      </style>`);
  };

  const init = () => {
    appendCSS();
    addListeners();
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
