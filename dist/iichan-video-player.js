(() => {
const EXTENSIONS = ['webm', 'mp4', 'ogv'];
const LOCALSTORAGE_KEY = 'iichan_video_settings';
const VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';
const HIDE_VIDEO_BTN_CLASSNAME = 'iichan-hide-video-btn';
const HIDE_VIDEO_BTN_TITLE = 'Закрыть видео';
const HIDE_VIDEO_BTN_TEXT = 'Закрыть видео';
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
      <div class="${HIDE_VIDEO_BTN_CLASSNAME}" title="${HIDE_VIDEO_BTN_TITLE}"><span><svg>
        <use class="iichan-icon-close-use" xlink:href="#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>${HIDE_VIDEO_BTN_TEXT}</span></div>
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
      margin: 2px 20px;
    }
    
    .${MUTE_CHECKBOX_CLASSNAME} {
      float: right;
    }
    
    .${HIDE_VIDEO_BTN_CLASSNAME} > span::before {
      content: '[';
    }
    
    .${HIDE_VIDEO_BTN_CLASSNAME} > span::after {
      content: ']';
    }
    
    .${HIDE_VIDEO_BTN_CLASSNAME} svg {
      width: 16px;
      height: 16px;
      vertical-align: text-top;
    }
    
    .${HIDE_VIDEO_BTN_CLASSNAME} use {
      pointer-events: none;
    }
    
    a.imglink {
      text-decoration: none;
    }
    
    #iichan-video-player-icons {
      display: none;
    }
  </style>`
);

const appendHTML = () => {
  const icons = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="iichan-icon-close" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="m 11.734373,2.0393046 c -0.551714,0.0032 -1.101132,0.214707 -1.521485,0.636719 l -2.2656251,2.275391 -2.359375,-2.314453 c -0.798816,-0.783843 -2.079336,-0.777297 -2.86914,0.01563 l -0.171875,0.171875 c -0.789805,0.792922 -0.781239,2.063814 0.01758,2.847656 l 2.359375,2.314453 -2.304688,2.3125004 c -0.840706,0.844025 -0.83272,2.194937 0.01758,3.029297 l 0.01172,0.01172 c 0.850299,0.834359 2.212029,0.826446 3.052734,-0.01758 l 2.302735,-2.3125 2.4101561,2.363281 c 0.798817,0.783842 2.077383,0.777297 2.867188,-0.01563 l 0.171875,-0.173828 c 0.789804,-0.792922 0.781238,-2.061861 -0.01758,-2.845703 l -2.408204,-2.3632824 2.265625,-2.27539 c 0.840706,-0.844025 0.832721,-2.194938 -0.01758,-3.029297 l -0.0098,-0.01172 c -0.42515,-0.41718 -0.979537,-0.622294 -1.53125,-0.619141 z"/>
      </symbol>
    </svg>
  `;
  const iconsContainer = `<div id="iichan-video-player-icons">
    ${icons}
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};

const init = () => {
  if (document.querySelector('#de-main')) return;
  appendCSS();
  appendHTML();
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