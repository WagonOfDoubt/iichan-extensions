"use strict";

(function () {
  var EXTENSIONS = ['webm', 'mp4', 'ogv'];
  var LOCALSTORAGE_KEY = 'iichan_video_settings';
  var VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';
  var HIDE_VIDEO_BTN_CLASSNAME = 'iichan-hide-video-btn';
  var HIDE_VIDEO_BTN_TITLE = 'Закрыть видео';
  var HIDE_VIDEO_BTN_TEXT = 'Закрыть видео';
  var MUTE_CHECKBOX_CLASSNAME = 'iichan-mute-video-checkbox';
  var MUTE_CHECKBOX_TITLE = 'Включить звук при открытии видео';

  var onThumbnailClick = function onThumbnailClick(e) {
    var videoSettings = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');

    if (!videoSettings.hasOwnProperty('enableSound')) {
      videoSettings.enableSound = false;
    }

    if (e.target.classList.contains(MUTE_CHECKBOX_CLASSNAME)) {
      // костыль
      setTimeout(function () {
        return e.target.checked = !e.target.checked;
      }, 0);
      videoSettings.enableSound = e.target.checked;
      window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(videoSettings));
      e.preventDefault();
      return;
    }

    var parentNode = e.currentTarget.parentNode;

    if (e.currentTarget.videoMode === 'on') {
      e.currentTarget.videoMode = 'off';
      parentNode.removeChild(document.getElementById(e.currentTarget.videoplayerid));
      e.currentTarget.innerHTML = e.currentTarget.thumbHTML;
    } else {
      e.currentTarget.videoMode = 'on';
      var vp = document.createElement('video');
      vp.id = 'video' + ('' + Math.random()).replace(/\D/g, '');
      vp.poster = e.currentTarget.thumbSrc;
      vp.src = e.currentTarget.href;
      vp.autoplay = true;
      vp.controls = true;
      vp.loop = true;
      vp.muted = !videoSettings.enableSound;
      vp.classList.add(VIDEO_PLAYER_CLASSNAME);
      e.currentTarget.videoplayerid = vp.id;
      parentNode.insertBefore(vp, e.currentTarget.nextSibling);
      var enableSound = videoSettings.enableSound ? 'checked' : '';
      e.currentTarget.innerHTML = "\n    <div>\n      <input type=\"checkbox\" ".concat(enableSound, " class=\"").concat(MUTE_CHECKBOX_CLASSNAME, "\" title=\"").concat(MUTE_CHECKBOX_TITLE, "\">\n      <div class=\"").concat(HIDE_VIDEO_BTN_CLASSNAME, "\" title=\"").concat(HIDE_VIDEO_BTN_TITLE, "\"><span><svg>\n        <use class=\"iichan-icon-close-use\" xlink:href=\"#iichan-icon-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>").concat(HIDE_VIDEO_BTN_TEXT, "</span></div>\n    </div>\n    ");
    }

    e.preventDefault();
  };

  var addListeners = function addListeners(rootNode) {
    var thumbs = (rootNode || document).querySelectorAll('.thumb');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = thumbs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var img = _step.value;
        var a = img.parentNode;
        if (!a) continue;
        var videoExt = a.href.split('.').pop();
        if (!EXTENSIONS.includes(videoExt)) continue;
        a.thumbSrc = img.src;
        a.thumbHTML = a.innerHTML;
        a.addEventListener('click', onThumbnailClick);
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

  var appendCSS = function appendCSS() {
    return document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n    .".concat(VIDEO_PLAYER_CLASSNAME, " {\n      max-width: 100%;\n      height: auto;\n      box-sizing: border-box;\n      padding: 2px 20px;\n      margin: 0;\n    }\n    \n    .").concat(HIDE_VIDEO_BTN_CLASSNAME, " {\n      margin: 2px 20px;\n    }\n    \n    .").concat(MUTE_CHECKBOX_CLASSNAME, " {\n      float: right;\n    }\n    \n    .").concat(HIDE_VIDEO_BTN_CLASSNAME, " > span::before {\n      content: '[';\n    }\n    \n    .").concat(HIDE_VIDEO_BTN_CLASSNAME, " > span::after {\n      content: ']';\n    }\n    \n    .").concat(HIDE_VIDEO_BTN_CLASSNAME, " svg {\n      width: 16px;\n      height: 16px;\n      vertical-align: text-top;\n    }\n    \n    .").concat(HIDE_VIDEO_BTN_CLASSNAME, " use {\n      pointer-events: none;\n    }\n    \n    a.imglink {\n      text-decoration: none;\n    }\n    \n    #iichan-video-player-icons {\n      display: none;\n    }\n  </style>"));
  };

  var appendHTML = function appendHTML() {
    var icons = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"iichan-icon-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n        <path\n          fill=\"currentcolor\"\n          d=\"m 11.734373,2.0393046 c -0.551714,0.0032 -1.101132,0.214707 -1.521485,0.636719 l -2.2656251,2.275391 -2.359375,-2.314453 c -0.798816,-0.783843 -2.079336,-0.777297 -2.86914,0.01563 l -0.171875,0.171875 c -0.789805,0.792922 -0.781239,2.063814 0.01758,2.847656 l 2.359375,2.314453 -2.304688,2.3125004 c -0.840706,0.844025 -0.83272,2.194937 0.01758,3.029297 l 0.01172,0.01172 c 0.850299,0.834359 2.212029,0.826446 3.052734,-0.01758 l 2.302735,-2.3125 2.4101561,2.363281 c 0.798817,0.783842 2.077383,0.777297 2.867188,-0.01563 l 0.171875,-0.173828 c 0.789804,-0.792922 0.781238,-2.061861 -0.01758,-2.845703 l -2.408204,-2.3632824 2.265625,-2.27539 c 0.840706,-0.844025 0.832721,-2.194938 -0.01758,-3.029297 l -0.0098,-0.01172 c -0.42515,-0.41718 -0.979537,-0.622294 -1.53125,-0.619141 z\"/>\n      </symbol>\n    </svg>\n  ";
    var iconsContainer = "<div id=\"iichan-video-player-icons\">\n    ".concat(icons, "\n  </div>");
    document.body.insertAdjacentHTML('beforeend', iconsContainer);
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    appendHTML();
    addListeners();

    if ('MutationObserver' in window) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = mutation.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var node = _step2.value;
              if (!node.querySelectorAll) return;
              addListeners(node);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();