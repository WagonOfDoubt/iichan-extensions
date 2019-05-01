(() => {
const EXTENSIONS = ['webm', 'mp4', 'ogv'];
const LOCALSTORAGE_KEY = 'iichan_video_settings';
const VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';
const HIDE_VIDEO_BTN_CLASSNAME = 'iichan-hide-video-btn';
const HIDE_VIDEO_BTN_TITLE = 'Свернуть видео';
const HIDE_VIDEO_BTN_TEXT = '[Свернуть видео]';
const MUTE_CHECKBOX_CLASSNAME = 'iichan-mute-video-checkbox';
const MUTE_CHECKBOX_TITLE = 'Включить звук при открытии видео';

const onThumbnailClick = (e) => {
  const videoSettings = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
  if (!videoSettings.hasOwnProperty('enableSound')) {
    videoSettings.enableSound = false;
  }
  if (e.target.classList.contains(MUTE_CHECKBOX_CLASSNAME)) {
    // костыль
    setTimeout(() => e.target.checked = !e.target.checked, 0);
    videoSettings.enableSound = e.target.checked;
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(videoSettings));
    e.preventDefault();
    return;
  }
  const parentNode = e.currentTarget.parentNode;

  if(e.currentTarget.videoMode === 'on'){
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
    vp.muted = !videoSettings.enableSound;
    vp.classList.add(VIDEO_PLAYER_CLASSNAME);
    e.currentTarget.videoplayerid = vp.id;
    parentNode.insertBefore(vp, e.currentTarget.nextSibling);
    const enableSound = videoSettings.enableSound ? 'checked' : '';
    e.currentTarget.innerHTML = `
    <div>
      <input type="checkbox" ${enableSound} class="${MUTE_CHECKBOX_CLASSNAME}" title="${MUTE_CHECKBOX_TITLE}">
      <div class="${HIDE_VIDEO_BTN_CLASSNAME}" title="${HIDE_VIDEO_BTN_TITLE}">${HIDE_VIDEO_BTN_TEXT}</div>
    </div>
    `;
  }

  e.preventDefault();
};

const addListeners = (rootNode) => {
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
  `<style type="text/css">
    .${VIDEO_PLAYER_CLASSNAME} {
      max-width: 100%;
      height: auto;
      box-sizing: border-box;
      padding: 2px 20px;
      margin: 0;
    }
    .${HIDE_VIDEO_BTN_CLASSNAME} {
      padding: 2px 20px;
    }
    .${MUTE_CHECKBOX_CLASSNAME} {
      float: right;
    }
  </style>`
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