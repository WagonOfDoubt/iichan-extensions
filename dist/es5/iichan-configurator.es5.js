"use strict";

(function () {
  var styles = {
    post_btns_color: function post_btns_color(c) {
      return "\n    .iichan-post-btns svg { color: ".concat(c, " !important; }");
    }
  };

  var getSettings = function getSettings() {
    return JSON.parse(window.localStorage.getItem('iichan_settings') || '{}');
  };

  var setSettings = function setSettings(settings) {
    return window.localStorage.setItem('iichan_settings', JSON.stringify(settings));
  };

  var addSettingsBtn = function addSettingsBtn() {
    var bottomAdminbar = Array.from(document.body.querySelectorAll('.adminbar')).pop();
    if (!bottomAdminbar) return;
    bottomAdminbar.insertAdjacentHTML('beforeend', "\n    <span class=\"iican-configurator-btn-container\">[<a href=\"#\" class=\"iican-configurator-btn\">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</a>]</span>\n    \n    ".trim());
    var btn = bottomAdminbar.querySelector('.iican-configurator-btn');
    btn.addEventListener('click', toggleSettingsView);
  };

  var addSettingsPanel = function addSettingsPanel() {
    var bottomAdminbar = Array.from(document.body.querySelectorAll('.adminbar')).pop();
    if (!bottomAdminbar) return;
    bottomAdminbar.insertAdjacentHTML('afterend', "\n    <form class=\"reply iichan-settings-panel\">\n      <div class=\"theader\">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</div>\n      <div class=\"iichan-settings-panel-content\">\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_quick_reply\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0431\u044B\u0441\u0442\u0440\u044B\u0439 \u043E\u0442\u0432\u0435\u0442</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_hide_threads\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0441\u043A\u0440\u044B\u0442\u0438\u0435 \u0442\u0440\u0435\u0434\u043E\u0432</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_expand_images\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_video_player\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043B\u0435\u0435\u0440 \u0432\u0438\u0434\u0435\u043E</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"post_btns_color_en\"> \u0426\u0432\u0435\u0442 \u043A\u043D\u043E\u043F\u043E\u043A \u043F\u043E\u0441\u0442\u043E\u0432 <input type=\"color\" name=\"post_btns_color\"></label>\n        </div>\n      </div>\n    </form>\n    \n    ".trim());
    var settingsPanel = document.body.querySelector('.iichan-settings-panel');
    settingsPanel.addEventListener('change', onSettingsChange);
    var settings = getSettings();
    var inputs = settingsPanel.querySelectorAll('input[name]');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var input = _step.value;

        if (input.type === 'checkbox') {
          input.checked = settings[input.name];
        } else {
          input.value = settings[input.name];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  var onSettingsChange = function onSettingsChange(e) {
    var input = e.target;
    var property = input.name;
    var value;

    if (input.type === 'checkbox') {
      value = input.checked;
    } else {
      value = input.value;
    }

    var settings = getSettings();
    settings[property] = value;
    setSettings(settings);
    propertyUpdate(property, settings);
  };

  var propertyUpdate = function propertyUpdate(property, settings) {
    if (property === 'post_btns_color_en' || property === 'post_btns_color') {
      updateStyles(settings);
    }
  };

  var updateStyles = function updateStyles(settings) {
    var style = null;

    if (settings.post_btns_color_en) {
      style = styles.post_btns_color(settings.post_btns_color);
    }

    changeCustomStyle('post_btns_color', style);
  };

  var toggleSettingsView = function toggleSettingsView(e) {
    var settingsPanel = document.body.querySelector('.iichan-settings-panel');
    settingsPanel.classList.toggle('iichan-settings-panel-show');
    e.preventDefault();
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n    .iichan-settings-panel {\n      display: none;\n      clear: both;\n      float: right;\n    }\n    \n    .iichan-settings-panel.iichan-settings-panel-show {\n      display: block;\n    }\n    \n    .iichan-settings-panel .theader {\n      width: auto;\n    }\n    \n    .iichan-settings-panel-content {\n      padding: 10px;\n    }\n    \n    </style>");
  };

  var changeCustomStyle = function changeCustomStyle(styleName, style) {
    var oldStyleEl = document.getElementById("iichan-style-".concat(styleName));

    if (oldStyleEl) {
      document.head.removeChild(oldStyleEl);
    }

    if (style) {
      document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\" id=\"iichan-style-".concat(styleName, "\">").concat(style, "</style>"));
    }
  };

  var init = function init() {
    appendCSS();
    addSettingsBtn();
    addSettingsPanel();
    var settings = getSettings();
    updateStyles(settings);
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();