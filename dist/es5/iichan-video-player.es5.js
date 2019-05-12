"use strict";

(function () {
  var EXTENSIONS = ['webm', 'mp4', 'ogv'];

  var onThumbnailClick = function onThumbnailClick(e) {
    var videoSettings = JSON.parse(window.localStorage.getItem('iichan_video_settings') || '{}');

    if (!videoSettings.hasOwnProperty('enableSound')) {
      videoSettings.enableSound = false;
    }

    if (e.target.classList.contains('iichan-mute-video-checkbox')) {
      // костыль
      setTimeout(function () {
        return e.target.checked = !e.target.checked;
      }, 0);
      videoSettings.enableSound = e.target.checked;
      window.localStorage.setItem('iichan_video_settings', JSON.stringify(videoSettings));
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
      vp.classList.add('iichan-video-player');
      e.currentTarget.videoplayerid = vp.id;
      parentNode.insertBefore(vp, e.currentTarget.nextSibling);
      var enableSound = videoSettings.enableSound ? 'checked' : '';
      e.currentTarget.innerHTML = "\n    <div>\n      <input type=\"checkbox\" ".concat(enableSound, " class=\"iichan-mute-video-checkbox\" title=\"\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A \u043F\u0440\u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0438 \u0432\u0438\u0434\u0435\u043E\">\n      <div class=\"iichan-hide-video-btn\" title=\"\u0417\u0430\u043A\u0440\u044B\u0442\u044C\xA0\u0432\u0438\u0434\u0435\u043E\"><span><svg>\n        <use class=\"iichan-icon-video-close-use\" xlink:href=\"/icons.svg#iichan-icon-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\u0417\u0430\u043A\u0440\u044B\u0442\u044C\xA0\u0432\u0438\u0434\u0435\u043E</span></div>\n    </div>\n    ");
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
    return document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n    .iichan-video-player {\n      max-width: 100%;\n      height: auto;\n      box-sizing: border-box;\n      padding: 2px 20px;\n      margin: 0;\n    }\n    \n    .iichan-hide-video-btn {\n      margin: 2px 20px;\n    }\n    \n    .iichan-mute-video-checkbox {\n      float: right;\n    }\n    \n    .iichan-hide-video-btn > span::before {\n      content: '[';\n    }\n    \n    .iichan-hide-video-btn > span::after {\n      content: ']';\n    }\n    \n    .iichan-hide-video-btn svg {\n      width: 16px;\n      height: 16px;\n      vertical-align: text-top;\n    }\n    \n    .iichan-hide-video-btn use {\n      pointer-events: none;\n    }\n    \n    #iichan-video-player-icons {\n      display: none;\n    }\n    \n    a.imglink {\n      text-decoration: none;\n    }\n  </style>");
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    appendCSS();
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