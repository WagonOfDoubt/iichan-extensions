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

  /*
  Если это условие НЕ выполняется, изображения будут открываться как обычно на новой вкладке.
  См. https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
  */
  const HANDHELD_MEDIA_QUERY = '(min-width: 10cm)';
  /*
  Список расширений файлов, для которых может применяться раскрытие.
  */
  const EXTENSIONS = ['jpg', 'jpeg', 'gif', 'png'];
  /*
  Класс CSS, применяемый для раскрытых картинок.
  */
  const EXPANDED_THUMB_CLASSNAME = 'iichan-image-fullsize';

  function addListeners(e) {
    function onThumbnailClick(e) {
      if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
      let thumb = e.currentTarget.querySelector('.thumb');
      let isExpanded = !thumb.classList.toggle(EXPANDED_THUMB_CLASSNAME);
      thumb.src = isExpanded ? thumb.thumbSrc : e.currentTarget.href;
      e.preventDefault();
    }

    let thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      let a = img.parentNode;
      if (!a) continue;
      let imageExt = a.href.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) continue;
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.thumbSrc = img.src;
      a.addEventListener('click', onThumbnailClick);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${EXPANDED_THUMB_CLASSNAME} {
            max-width: calc(100% - 42px);
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
