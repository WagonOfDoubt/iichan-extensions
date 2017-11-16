(() => {
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

  const addListeners = (e) => {
    const onThumbnailClick = (e) => {
      if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
      const img = e.currentTarget.querySelector('.thumb');
      const isExpanded = img.classList.toggle(EXPANDED_THUMB_CLASSNAME);
      if (isExpanded) {
        img.removeAttribute('width');
        img.removeAttribute('height');
      } else {
        img.setAttribute('width', img.thumbWidth);
        img.setAttribute('height', img.thumbHeight);
      }
      img.src = isExpanded ? e.currentTarget.href : img.thumbSrc;
      e.preventDefault();
    };

    const thumbs = document.querySelectorAll('.thumb');
    for (const img of thumbs) {
      const a = img.parentNode;
      if (!a) continue;
      const imageExt = a.href.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) continue;
      img.thumbWidth = img.getAttribute('width');
      img.thumbHeight = img.getAttribute('height');
      img.thumbSrc = img.src;
      a.addEventListener('click', onThumbnailClick);
    }
  };

  const appendCSS = () => {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${EXPANDED_THUMB_CLASSNAME} {
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
