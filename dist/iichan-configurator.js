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
  spoiler_off: () => `
    .spoiler {
      color: #F5F5F5 !important;
      background-color: #888 !important;
    }`,
  doubledash_off: () => `
    .doubledash {
      display: none;
    }`
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
        <use class="iichan-icon-settings-close-use" xlink:href="/extras/icons.svg#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
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
        <h5>Внешний вид</h5>
        <div>
          <label><input type="checkbox" name="spoiler_off_en">Раскрывать спойлеры</label>
        </div>
        <div>
          <label><input type="checkbox" name="doubledash_off_en">Скрывать >> перед постами</label>
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

const init = () => {
  appendCSS();
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