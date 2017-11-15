(function() {
  'use strict';

  /*
  Список расширений файлов, преобразуемых в видеопроигрыватели.
  */
  const EXTENSIONS = ['webm', 'mp4', 'ogv'];
  /*
  Класс CSS, применяемый для видеопроигрывателей.
  */
  const VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';

  function addListeners(e) {
    function onThumbnailClick(e) {
      let parentNode = e.currentTarget.parentNode;
      let vp = document.createElement('video');
      vp.src = e.currentTarget.href;
      vp.classList.add(VIDEO_PLAYER_CLASSNAME);
      parentNode.instertBefore(vp, e.currentTarget);
      parentNode.removeChild(e.currentTarget);
      e.preventDefault();
    }

    const thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      let a = img.parentNode;
      if (!a) continue;
      let videoExt = a.href.split('.').pop();
      if (!EXTENSIONS.includes(videoExt)) continue;
      a.addEventListener('click', onThumbnailClick);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        //=include video-player.css
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
