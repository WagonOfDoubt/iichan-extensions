"use strict";

(function () {
  var styles = {
    post_btns_color: function post_btns_color(c) {
      return "\n    .catthread .iichan-hide-thread-btn svg,\n    .iichan-post-btns div > svg {\n      color: ".concat(c || '#000000', " !important;\n    }");
    },
    post_btns_color_hover: function post_btns_color_hover(c) {
      return "\n    .catthread .iichan-hide-thread-btn:hover svg,\n    .iichan-post-btns div:hover > svg {\n      color: ".concat(c || '#000000', " !important;\n    }");
    },
    post_btns_color_background: function post_btns_color_background(c) {
      return "\n    .catthread .iichan-hide-thread-btn,\n    .iichan-post-btns div {\n      background-color: ".concat(c || '#000000', " !important;\n      border-radius: 3px;\n      padding: 2px;\n    }");
    },
    spoiler_off: function spoiler_off() {
      return "\n    .spoiler {\n      color: #F5F5F5 !important;\n      background-color: #888 !important;\n    }";
    },
    doubledash_off: function doubledash_off() {
      return "\n    .doubledash {\n      display: none;\n    }";
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
    var settingsBtn = bottomAdminbar.querySelector('.iican-configurator-btn');
    settingsBtn.addEventListener('click', toggleSettingsView);
  };

  var addSettingsPanel = function addSettingsPanel() {
    var bottomAdminbar = Array.from(document.body.querySelectorAll('.adminbar')).pop();
    if (!bottomAdminbar) return;
    bottomAdminbar.insertAdjacentHTML('afterend', "\n    <form class=\"reply iichan-settings-panel\">\n       <div class=\"theader\">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438<div class=\"iichan-settings-close-btn\" title=\"\u0417\u0430\u043A\u0440\u044B\u0442\u044C\"><svg>\n        <use class=\"iichan-icon-settings-close-use\" xlink:href=\"/extras/icons.svg#iichan-icon-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg></div></div>\n      <div class=\"iichan-settings-panel-content\">\n        <h5>\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0439</h5>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_quick_reply\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0431\u044B\u0441\u0442\u0440\u044B\u0439 \u043E\u0442\u0432\u0435\u0442*</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_hide_threads\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0441\u043A\u0440\u044B\u0442\u0438\u0435 \u0442\u0440\u0435\u0434\u043E\u0432*</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_expand_images\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A*</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"disable_video_player\"> \u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043B\u0435\u0435\u0440 \u0432\u0438\u0434\u0435\u043E*</label>\n        </div>\n        <small>* \u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B</small>\n        <h5>\u0426\u0432\u0435\u0442 \u043A\u043D\u043E\u043F\u043E\u043A \u043F\u043E\u0441\u0442\u043E\u0432</h5>\n        <div>\n          <label><input type=\"checkbox\" name=\"post_btns_color_en\"> \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 <input type=\"color\" name=\"post_btns_color\"></label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"post_btns_color_hover_en\"> \u041F\u043E \u043D\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u044E <input type=\"color\" name=\"post_btns_color_hover\"></label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"post_btns_color_background_en\"> \u0424\u043E\u043D <input type=\"color\" name=\"post_btns_color_background\"></label>\n        </div>\n        <h5>\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0432\u0438\u0434</h5>\n        <div>\n          <label><input type=\"checkbox\" name=\"spoiler_off_en\">\u0420\u0430\u0441\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0441\u043F\u043E\u0439\u043B\u0435\u0440\u044B</label>\n        </div>\n        <div>\n          <label><input type=\"checkbox\" name=\"doubledash_off_en\">\u0421\u043A\u0440\u044B\u0432\u0430\u0442\u044C >> \u043F\u0435\u0440\u0435\u0434 \u043F\u043E\u0441\u0442\u0430\u043C\u0438</label>\n        </div>\n      </div>\n    </form>\n    \n    ".trim());
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

    var closeBtn = settingsPanel.querySelector('.iichan-settings-close-btn');
    closeBtn.addEventListener('click', toggleSettingsView);
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
    var allStyles = Object.keys(styles);
    var styleProperty = property;

    if (styleProperty.endsWith('_en')) {
      styleProperty = styleProperty.slice(0, -'_en'.length);
    }

    if (allStyles.includes(styleProperty)) {
      updateStyles(settings);
    }
  };

  var updateStyles = function updateStyles(settings) {
    var allStyles = Object.keys(styles);

    for (var _i = 0, _allStyles = allStyles; _i < _allStyles.length; _i++) {
      var styleName = _allStyles[_i];
      var enableKey = styleName + '_en';
      var style = null;

      if (settings[enableKey]) {
        style = styles[styleName](settings[styleName]);
      }

      changeCustomStyle(styleName, style);
    }
  };

  var toggleSettingsView = function toggleSettingsView(e) {
    var settingsPanel = document.body.querySelector('.iichan-settings-panel');
    settingsPanel.classList.toggle('iichan-settings-panel-show');
    e.preventDefault();
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n    .iichan-settings-panel {\n      display: none;\n      position: fixed;\n      right: 0;\n      bottom: 0;\n      overflow: auto;\n      max-height: 100%;\n    }\n    \n    .iichan-settings-panel.iichan-settings-panel-show {\n      display: block;\n    }\n    \n    .iichan-settings-panel .theader {\n      width: auto;\n    }\n    \n    .iichan-settings-panel-content {\n      padding: 0 10px 10px;\n    }\n    \n    .iichan-settings-panel-content input[type=\"color\"] {\n      float: right;\n      clear: both;\n    }\n    \n    .iichan-settings-close-btn {\n      float: right;\n      cursor: pointer;\n      padding: 1px;\n    }\n    \n    .iichan-settings-close-btn svg {\n      width: 16px;\n      height: 16px;\n      vertical-align: text-top;\n    }\n    \n    .iichan-settings-close-btn use {\n      pointer-events: none;\n    }\n    \n    .iichan-settings-panel-content h5 {\n      margin: 10px 0 5px;\n    }\n    \n    #iichan-configurator-icons {\n      display: none;\n    }\n    \n    </style>");
  };

  var changeCustomStyle = function changeCustomStyle(styleName, style) {
    var oldStyleEl = document.getElementById("iichan-style-".concat(styleName));

    if (oldStyleEl) {
      document.head.removeChild(oldStyleEl);
    }

    if (style) {
      document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\" id=\"iichan-style-".concat(styleName, "\">").concat(style, "</style>"));
    }
  }; // jshint ignore:line


  var init = function init() {
    appendCSS(); // jshint ignore:line

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