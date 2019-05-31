// ==UserScript==
// @name         [IIchan] Video player
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.9
// @description  Video players on thumbnail click
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-video-player.meta.js
// @author       Mithgol
// @match        http://nowere.net/*
// @match        https://nowere.net/*
// @grant        none
// ==/UserScript==

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
        <use class="iichan-icon-video-close-use" xlink:href="#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
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


  // jshint ignore:line
const appendHTML = () => document.body.insertAdjacentHTML('beforeend',
  `<div id="iichan-video-player-icons">
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="iichan-icon-close" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="m 11.734373,2.0393046 c -0.551714,0.0032 -1.101132,0.214707 -1.521485,0.636719 l -2.2656251,2.275391 -2.359375,-2.314453 c -0.798816,-0.783843 -2.079336,-0.777297 -2.86914,0.01563 l -0.171875,0.171875 c -0.789805,0.792922 -0.781239,2.063814 0.01758,2.847656 l 2.359375,2.314453 -2.304688,2.3125004 c -0.840706,0.844025 -0.83272,2.194937 0.01758,3.029297 l 0.01172,0.01172 c 0.850299,0.834359 2.212029,0.826446 3.052734,-0.01758 l 2.302735,-2.3125 2.4101561,2.363281 c 0.798817,0.783842 2.077383,0.777297 2.867188,-0.01563 l 0.171875,-0.173828 c 0.789804,-0.792922 0.781238,-2.061861 -0.01758,-2.845703 l -2.408204,-2.3632824 2.265625,-2.27539 c 0.840706,-0.844025 0.832721,-2.194938 -0.01758,-3.029297 l -0.0098,-0.01172 c -0.42515,-0.41718 -0.979537,-0.622294 -1.53125,-0.619141 z"/>
      </symbol>
    </svg>
  </div>`
);
  // jshint ignore:line

const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const init = () => {
  if (isDollchan()) return;
  if (getSettings().disable_video_player) return;
  appendCSS();
    // jshint ignore:line
  appendHTML();
    // jshint ignore:line
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