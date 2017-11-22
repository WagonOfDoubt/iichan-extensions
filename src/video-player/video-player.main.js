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

  const onThumbnailClick = e => {
    const parentNode = e.currentTarget.parentNode;

    if( e.currentTarget.videoMode === 'on' ){
      e.currentTarget.videoMode = 'off';

      parentNode.removeChild(document.getElementById(
         e.currentTarget.videoplayerid
      ));
      e.currentTarget.innerHTML = e.currentTarget.thumbHTML;
    } else {
      e.currentTarget.videoMode = 'on';

      const vp = document.createElement('video');
      vp.id = 'video' + ('' + Math.random()).replace(/\D/g, '');
      vp.poster = e.currentTarget.thumbSrc;
      vp.src = e.currentTarget.href;
      vp.autoplay = true;
      vp.controls = true;
      vp.loop = true;
      vp.muted = true;
      vp.classList.add(VIDEO_PLAYER_CLASSNAME);
      e.currentTarget.videoplayerid = vp.id;
      parentNode.insertBefore(vp, e.currentTarget.nextSibling);
      e.currentTarget.innerHTML = '<div style="padding: 2px 20px;">[Свернуть видео]</div>';
    }

    e.preventDefault();
  };

  const addListeners = rootNode => {
    const thumbs = (rootNode || document).querySelectorAll('.thumb');
    for (const img of thumbs) {
      const a = img.parentNode;
      if (!a) continue;
      const videoExt = a.href.split('.').pop();
      if (!EXTENSIONS.includes(videoExt)) continue;
      a.thumbSrc = img.src;
      a.thumbHTML = a.innerHTML;
      a.addEventListener('click', onThumbnailClick);
    }
  };

  const appendCSS = () => document.head.insertAdjacentHTML(
    'beforeend',
    `<style type="text/css">.${VIDEO_PLAYER_CLASSNAME} {
      max-width: 100%;
      height: auto;
      box-sizing: border-box;
      padding: 2px 20px;
      margin: 0;
    }</style>`
  );

  const init = () => {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    addListeners();
    if ('MutationObserver' in window) {
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
