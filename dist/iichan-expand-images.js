(() => {
/*
Если это условие НЕ выполняется, изображения будут открываться как обычно на новой вкладке.
См. https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
*/
const HANDHELD_MEDIA_QUERY = '(min-width: 10cm)';
/*
Список расширений файлов, для которых может применяться раскрытие.
*/
const EXTENSIONS = ['jpg', 'jpeg', 'gif', 'png'];

const onThumbnailClick = (e) => {
  if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
  const img = e.currentTarget.querySelector('.thumb');
  const isExpanded = img.src == img.dataset.fullSrc;
  img.setAttribute('width', isExpanded ? img.dataset.thumbWidth : img.dataset.fullWidth);
  img.setAttribute('height', isExpanded ? img.dataset.thumbHeight : img.dataset.fullHeight);
  img.src = isExpanded ? img.dataset.thumbSrc : img.dataset.fullSrc;
  e.preventDefault();
};

const addListeners = (rootNode) => {
  const thumbs = (rootNode || document).querySelectorAll('.thumb');
  for (const img of thumbs) {
    const a = img.parentNode;
    if (!a) continue;
    const imageExt = a.href.split('.').pop();
    if (!EXTENSIONS.includes(imageExt)) continue;
    img.dataset.thumbWidth = img.getAttribute('width');
    img.dataset.thumbHeight = img.getAttribute('height');
    img.dataset.thumbSrc = img.src;
    img.dataset.fullSrc = a.href;
    const post = a.parentNode;
    if (!post) continue;
    const filesize = post.querySelector('.filesize > em');
    if (!filesize) continue;
    const WxH = filesize.innerText.match(/(\d+)x(\d+)/);
    if( WxH === null ) continue;
    img.dataset.fullWidth = WxH[1];
    img.dataset.fullHeight = WxH[2];
    a.addEventListener('click', onThumbnailClick);
  }
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
      @media only screen and ${HANDHELD_MEDIA_QUERY} {
        a img.thumb {
          margin: 0;
          padding: 2px 20px;
        }
      
        a img.thumb[src*="/src/"] {
          height: auto;
          max-width: calc(100% - 40px);
        }
      }
    </style>`);
};

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');

const init = () => {
  if (isDollchan()) return;
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