(() => {
const EXTENSIONS = ['webm', 'mp4', 'ogv'];

const onThumbnailClick = (e) => {
  const videoSettings = JSON.parse(window.localStorage.getItem('iichan_video_settings') || '{}');
  if (!videoSettings.hasOwnProperty('enableSound')) {
    videoSettings.enableSound = false;
  }
  if (e.target.classList.contains('iichan-mute-video-checkbox')) {
    // костыль
    setTimeout(() => e.target.checked = !e.target.checked, 0);
    videoSettings.enableSound = e.target.checked;
    window.localStorage.setItem('iichan_video_settings', JSON.stringify(videoSettings));
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
    vp.classList.add('iichan-video-player');
    e.currentTarget.videoplayerid = vp.id;
    parentNode.insertBefore(vp, e.currentTarget.nextSibling);
    const enableSound = videoSettings.enableSound ? 'checked' : '';
    e.currentTarget.innerHTML = `
    <div>
      <input type="checkbox" ${ enableSound } class="iichan-mute-video-checkbox" title="Включить звук при открытии видео">
      <div class="iichan-hide-video-btn" title="Закрыть видео"><span><svg>
        <use class="iichan-icon-video-close-use" xlink:href="/extras/icons.svg#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>Закрыть видео</span></div>
    </div>
    `;
  }

  e.preventDefault();
};

const addListeners = (rootNode) => {
  const thumbs = (rootNode || document.body).querySelectorAll('.thumb');
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
    .iichan-video-player {
      max-width: 100%;
      height: auto;
      box-sizing: border-box;
      padding: 2px 20px;
      margin: 0;
    }
    
    .iichan-hide-video-btn {
      margin: 2px 20px;
    }
    
    .iichan-mute-video-checkbox {
      float: right;
    }
    
    .iichan-hide-video-btn > span::before {
      content: '[';
    }
    
    .iichan-hide-video-btn > span::after {
      content: ']';
    }
    
    .iichan-hide-video-btn svg {
      width: 16px;
      height: 16px;
      vertical-align: text-top;
    }
    
    .iichan-hide-video-btn use {
      pointer-events: none;
    }
    
    #iichan-video-player-icons {
      display: none;
    }
    
    a.imglink {
      text-decoration: none;
    }
  </style>`
);

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');




const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const init = () => {
  if (isDollchan()) return;
  if (getSettings().disable_video_player) return;
  appendCSS();
  
  addListeners();
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      if (isDollchan()) return;
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