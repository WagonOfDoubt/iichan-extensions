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
  const settingsBtn = bottomAdminbar.querySelector('.<%= CONFIGURATOR_BTN_CLASSNAME %>');
  settingsBtn.addEventListener('click', toggleSettingsView);
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
  const closeBtn = settingsPanel.querySelector('.<%= CLOSE_BTN_CLASSNAME %>');
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

<% if (USERSCRIPT) { %>  // jshint ignore:line
const appendHTML = () => {
  const iconsContainer = `<div id="<%= ICONS_CONTAINER_ID %>">
    //=include configurator-icons.svg
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};
<% } %>  // jshint ignore:line

const init = () => {
  appendCSS();
  <% if (USERSCRIPT) { %>  // jshint ignore:line
  appendHTML();
  <% } %>  // jshint ignore:line
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
