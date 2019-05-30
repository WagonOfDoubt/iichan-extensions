const EXTENSIONS = ['webm', 'mp4', 'ogv'];

const onThumbnailClick = (e) => {
  const videoSettings = JSON.parse(window.localStorage.getItem('<%= LOCALSTORAGE_KEY %>') || '{}');
  if (!videoSettings.hasOwnProperty('enableSound')) {
    videoSettings.enableSound = false;
  }
  if (e.target.classList.contains('<%= MUTE_CHECKBOX_CLASSNAME %>')) {
    // костыль
    setTimeout(() => e.target.checked = !e.target.checked, 0);
    videoSettings.enableSound = e.target.checked;
    window.localStorage.setItem('<%= LOCALSTORAGE_KEY %>', JSON.stringify(videoSettings));
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
    vp.classList.add('<%= VIDEO_PLAYER_CLASSNAME %>');
    e.currentTarget.videoplayerid = vp.id;
    parentNode.insertBefore(vp, e.currentTarget.nextSibling);
    const enableSound = videoSettings.enableSound ? 'checked' : '';
    e.currentTarget.innerHTML = `
    //=include hide-video-btn.html
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
    //=include video-player.css
  </style>`
);

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');


<% if (USERSCRIPT) { %>
const appendHTML = () => document.body.insertAdjacentHTML('beforeend',
  `<div id="<%= ICONS_CONTAINER_ID %>">
    //=include video-player-icons.svg
  </div>`
);
<% } %>

const init = () => {
  if (isDollchan()) return;
  appendCSS();
  <% if (USERSCRIPT) { %>
  appendHTML();
  <% } %>
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
