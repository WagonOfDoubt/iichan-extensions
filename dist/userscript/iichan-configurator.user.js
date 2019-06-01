// ==UserScript==
// @name         [IIchan] Configurator
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.1
// @description  Configure scripts on iichan
// @icon         https://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-configurator.meta.js
// @author       Cirno
// @match        http://iichan.hk/*
// @match        https://iichan.hk/*
// @grant        none
// ==/UserScript==

(() => {
const styles = {
  post_btns_color: (c) => `
    .catthread .iichan-hide-thread-btn svg,
    .iichan-post-btns div > svg {
      color: ${c || '#000000'} !important;
    }`,
  post_btns_color_hover: (c) => `
    .catthread .iichan-hide-thread-btn:hover svg,
    .iichan-post-btns div:hover > svg {
      color: ${c || '#000000'} !important;
    }`,
  post_btns_color_background: (c) => `
    .catthread .iichan-hide-thread-btn,
    .iichan-post-btns div {
      background-color: ${c || '#000000'} !important;
      border-radius: 3px;
      padding: 2px;
    }`,
};


const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const setSettings = (settings) =>
  window.localStorage.setItem('iichan_settings', JSON.stringify(settings));

const addSettingsBtn = () => {
  const bottomAdminbar = Array
    .from(document.body.querySelectorAll('.adminbar'))
    .pop();
  if (!bottomAdminbar) return;
  bottomAdminbar.insertAdjacentHTML('beforeend', `
    <span class="iican-configurator-btn-container">[<a href="#" class="iican-configurator-btn">Настройки</a>]</span>
    
    `.trim());
  const settingsBtn = bottomAdminbar.querySelector('.iican-configurator-btn');
  settingsBtn.addEventListener('click', toggleSettingsView);
};

const addSettingsPanel = () => {
  const bottomAdminbar = Array
    .from(document.body.querySelectorAll('.adminbar'))
    .pop();
  if (!bottomAdminbar) return;
  bottomAdminbar.insertAdjacentHTML('afterend', `
    <form class="reply iichan-settings-panel">
       <div class="theader">Настройки<div class="iichan-settings-close-btn" title="Закрыть"><svg>
        <use class="iichan-icon-settings-close-use" xlink:href="#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
      </svg></div></div>
      <div class="iichan-settings-panel-content">
        <h5>Отключение функций</h5>
        <div>
          <label><input type="checkbox" name="disable_quick_reply"> Отключить быстрый ответ*</label>
        </div>
        <div>
          <label><input type="checkbox" name="disable_hide_threads"> Отключить скрытие тредов*</label>
        </div>
        <div>
          <label><input type="checkbox" name="disable_expand_images"> Отключить разворот картинок*</label>
        </div>
        <div>
          <label><input type="checkbox" name="disable_video_player"> Отключить плеер видео*</label>
        </div>
        <small>* Требуется перезагрузка страницы</small>
        <h5>Цвет кнопок постов</h5>
        <div>
          <label><input type="checkbox" name="post_btns_color_en"> Основной <input type="color" name="post_btns_color"></label>
        </div>
        <div>
          <label><input type="checkbox" name="post_btns_color_hover_en"> По наведению <input type="color" name="post_btns_color_hover"></label>
        </div>
        <div>
          <label><input type="checkbox" name="post_btns_color_background_en"> Фон <input type="color" name="post_btns_color_background"></label>
        </div>
      </div>
    </form>
    
    `.trim());
  const settingsPanel = document.body.querySelector('.iichan-settings-panel');
  settingsPanel.addEventListener('change', onSettingsChange);
  const settings = getSettings();
  const inputs = settingsPanel.querySelectorAll('input[name]');
  for (const input of inputs) {
    if (input.type === 'checkbox') {
      input.checked = settings[input.name];
    } else {
      input.value = settings[input.name];
    }
  }
  const closeBtn = settingsPanel.querySelector('.iichan-settings-close-btn');
  closeBtn.addEventListener('click', toggleSettingsView);
};

const onSettingsChange = (e) => {
  const input = e.target;
  const property = input.name;
  let value;
  if (input.type === 'checkbox'){
    value = input.checked;
  } else {
    value = input.value;
  }
  const settings = getSettings();
  settings[property] = value;
  setSettings(settings);
  propertyUpdate(property, settings);
};

const propertyUpdate = (property, settings) => {
  const allStyles = Object.keys(styles);
  let styleProperty = property;
  if (styleProperty.endsWith('_en')) {
    styleProperty = styleProperty.slice(0, -'_en'.length);
  }
  if (allStyles.includes(styleProperty)) {
    updateStyles(settings);
  }
};

const updateStyles = (settings) => {
  const allStyles = Object.keys(styles);
  for (const styleName of allStyles) {
    const enableKey = styleName + '_en';
    let style = null;
    if (settings[enableKey]) {
      style = styles[styleName](settings[styleName]);
    }
    changeCustomStyle(styleName, style);
  }
};

const toggleSettingsView = (e) => {
  const settingsPanel = document.body.querySelector('.iichan-settings-panel');
  settingsPanel.classList.toggle('iichan-settings-panel-show');
  e.preventDefault();
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
    .iichan-settings-panel {
      display: none;
      position: fixed;
      right: 0;
      bottom: 0;
      overflow: auto;
      max-height: 100%;
    }
    
    .iichan-settings-panel.iichan-settings-panel-show {
      display: block;
    }
    
    .iichan-settings-panel .theader {
      width: auto;
    }
    
    .iichan-settings-panel-content {
      padding: 0 10px 10px;
    }
    
    .iichan-settings-panel-content input[type="color"] {
      float: right;
      clear: both;
    }
    
    .iichan-settings-close-btn {
      float: right;
      cursor: pointer;
      padding: 1px;
    }
    
    .iichan-settings-close-btn svg {
      width: 16px;
      height: 16px;
      vertical-align: text-top;
    }
    
    .iichan-settings-close-btn use {
      pointer-events: none;
    }
    
    .iichan-settings-panel-content h5 {
      margin: 10px 0 5px;
    }
    
    #iichan-configurator-icons {
      display: none;
    }
    
    </style>`);
};

const changeCustomStyle = (styleName, style) => {
  const oldStyleEl = document.getElementById(`iichan-style-${ styleName }`);
  if (oldStyleEl) {
    document.head.removeChild(oldStyleEl);
  }
  if (style) {
    document.head.insertAdjacentHTML('beforeend', 
      `<style type="text/css" id="iichan-style-${ styleName }">${style}</style>`);    
  }
};

  // jshint ignore:line
const appendHTML = () => {
  const iconsContainer = `<div id="iichan-configurator-icons">
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="iichan-icon-close" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="m 11.734373,2.0393046 c -0.551714,0.0032 -1.101132,0.214707 -1.521485,0.636719 l -2.2656251,2.275391 -2.359375,-2.314453 c -0.798816,-0.783843 -2.079336,-0.777297 -2.86914,0.01563 l -0.171875,0.171875 c -0.789805,0.792922 -0.781239,2.063814 0.01758,2.847656 l 2.359375,2.314453 -2.304688,2.3125004 c -0.840706,0.844025 -0.83272,2.194937 0.01758,3.029297 l 0.01172,0.01172 c 0.850299,0.834359 2.212029,0.826446 3.052734,-0.01758 l 2.302735,-2.3125 2.4101561,2.363281 c 0.798817,0.783842 2.077383,0.777297 2.867188,-0.01563 l 0.171875,-0.173828 c 0.789804,-0.792922 0.781238,-2.061861 -0.01758,-2.845703 l -2.408204,-2.3632824 2.265625,-2.27539 c 0.840706,-0.844025 0.832721,-2.194938 -0.01758,-3.029297 l -0.0098,-0.01172 c -0.42515,-0.41718 -0.979537,-0.622294 -1.53125,-0.619141 z"/>
      </symbol>
    </svg>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};
  // jshint ignore:line

const init = () => {
  appendCSS();
    // jshint ignore:line
  appendHTML();
    // jshint ignore:line
  addSettingsBtn();
  addSettingsPanel();
  const settings = getSettings();
  updateStyles(settings);
};

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

})();