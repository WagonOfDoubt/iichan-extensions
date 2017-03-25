// ==UserScript==
// @name         Expand images on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Expands images on click
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-expand-images.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==


(function() {
  'use strict';

  const MIN_DISPLAY_WIDTH = 700;  // ширина, при которой картинки будут открываться как обычно
  const MIN_DISPLAY_HEIGHT = 700;  // высота, при которой картинки будут открываться как обычно
  const EXPANDED_THUMB_CLASSNAME = 'iichan-image-fullsize';
  const EXTENSIONS = ['jpg', 'jpeg', 'gif', 'png'];

  function addListeners(e) {
    function onThumbnailClick(e) {
      if (screen.width < MIN_DISPLAY_WIDTH ||
        screen.height < MIN_DISPLAY_HEIGHT) {
        return;
      }

      let thumb = this.querySelector('.thumb');
      if (thumb.classList.contains(EXPANDED_THUMB_CLASSNAME)) {
        thumb.src = thumb.originalSrc;
        thumb.width = thumb.originalWidth;
        thumb.height = thumb.originalHeight;
        thumb.classList.remove(EXPANDED_THUMB_CLASSNAME);
        e.preventDefault();
        return;
      }

      let imageSrc = this.href;
      let imageExt = imageSrc.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) return;

      e.preventDefault();
      thumb.originalSrc = thumb.src;
      thumb.originalWidth = thumb.width;
      thumb.originalHeight = thumb.height;
      thumb.removeAttribute('width');
      thumb.removeAttribute('height');
      thumb.classList.add(EXPANDED_THUMB_CLASSNAME);
      thumb.src = imageSrc;
    };

    let thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      let a = img.parentNode;
      if (!a) continue;
      a.addEventListener('click', onThumbnailClick);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${EXPANDED_THUMB_CLASSNAME} {
            max-width: 97%; max-height: 97%;
        }
      </style>`);
  }

  function init() {
    appendCSS();
    addListeners();
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
