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
      if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) {
        return;
      }

      let thumb = this.querySelector('.thumb');
      let isExpanded = !thumb.classList.toggle(EXPANDED_THUMB_CLASSNAME);
      let imageExt = this.href.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) return;

      thumb.src = isExpanded ? thumb.thumbSrc : this.href;
      e.preventDefault();
    };

    let thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.thumbSrc = img.src;
      let a = img.parentNode;
      if (!a) continue;
      a.addEventListener('click', onThumbnailClick);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        //=include expand-images.css
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
