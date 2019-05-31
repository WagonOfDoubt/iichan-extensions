(() => {
const styles = {
  post_btns_color: (c) => `
    .iichan-post-btns svg { color: ${c} !important; }`,
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
  const btn = bottomAdminbar.querySelector('.iican-configurator-btn');
  btn.addEventListener('click', toggleSettingsView);
};

const addSettingsPanel = () => {
  const bottomAdminbar = Array
    .from(document.body.querySelectorAll('.adminbar'))
    .pop();
  if (!bottomAdminbar) return;
  bottomAdminbar.insertAdjacentHTML('afterend', `
    <form class="reply iichan-settings-panel">
      <div class="theader">Настройки</div>
      <div class="iichan-settings-panel-content">
        <div>
          <label><input type="checkbox" name="disable_quick_reply"> Отключить быстрый ответ</label>
        </div>
        <div>
          <label><input type="checkbox" name="disable_hide_threads"> Отключить скрытие тредов</label>
        </div>
        <div>
          <label><input type="checkbox" name="disable_expand_images"> Отключить разворот картинок</label>
        </div>
        <div>
          <label><input type="checkbox" name="disable_video_player"> Отключить плеер видео</label>
        </div>
        <div>
          <label><input type="checkbox" name="post_btns_color_en"> Цвет кнопок постов <input type="color" name="post_btns_color"></label>
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
  if (property === 'post_btns_color_en' || property === 'post_btns_color') {
    updateStyles(settings);
  }
};

const updateStyles = (settings) => {
  let style = null;
  if (settings.post_btns_color_en) {
    style = styles.post_btns_color(settings.post_btns_color);
  }
  changeCustomStyle('post_btns_color', style);
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
      clear: both;
      float: right;
    }
    
    .iichan-settings-panel.iichan-settings-panel-show {
      display: block;
    }
    
    .iichan-settings-panel .theader {
      width: auto;
    }
    
    .iichan-settings-panel-content {
      padding: 10px;
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

const init = () => {
  appendCSS();
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