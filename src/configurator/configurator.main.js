const styles = {
  post_btns_color: (c) => `
    .iichan-post-btns svg { color: ${c} !important; }`,
};


const getSettings = () => JSON.parse(
  window.localStorage.getItem('<%= SETTINGS_LOCALSTORAGE_KEY %>') || '{}');

const setSettings = (settings) =>
  window.localStorage.setItem('<%= SETTINGS_LOCALSTORAGE_KEY %>', JSON.stringify(settings));

const addSettingsBtn = () => {
  const bottomAdminbar = Array
    .from(document.body.querySelectorAll('.adminbar'))
    .pop();
  if (!bottomAdminbar) return;
  bottomAdminbar.insertAdjacentHTML('beforeend', `
    //=include configurator-btn.html
    `.trim());
  const btn = bottomAdminbar.querySelector('.<%= CONFIGURATOR_BTN_CLASSNAME %>');
  btn.addEventListener('click', toggleSettingsView);
};

const addSettingsPanel = () => {
  const bottomAdminbar = Array
    .from(document.body.querySelectorAll('.adminbar'))
    .pop();
  if (!bottomAdminbar) return;
  bottomAdminbar.insertAdjacentHTML('afterend', `
    //=include settings-panel.html
    `.trim());
  const settingsPanel = document.body.querySelector('.<%= SETTINGS_PANEL_CLASSNAME %>');
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
  const settingsPanel = document.body.querySelector('.<%= SETTINGS_PANEL_CLASSNAME %>');
  settingsPanel.classList.toggle('<%= SETTINGS_PANEL_SHOW_CLASSNAME %>');
  e.preventDefault();
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
    //=include configurator.css
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
