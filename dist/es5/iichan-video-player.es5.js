'use strict';

(function () {
  'use strict';

  /*
  Список расширений файлов, преобразуемых в видеопроигрыватели.
  */

  var EXTENSIONS = ['webm', 'mp4', 'ogv'];
  /*
  Класс CSS, применяемый для видеопроигрывателей.
  */
  var VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';

  var addListeners = function addListeners(e) {
    var onThumbnailClick = function onThumbnailClick(e) {
      var parentNode = e.currentTarget.parentNode;
      var vp = document.createElement('video');
      vp.src = e.currentTarget.href;
      vp.classList.add(VIDEO_PLAYER_CLASSNAME);
      parentNode.insertBefore(vp, e.currentTarget);
      parentNode.removeChild(e.currentTarget);
      e.preventDefault();
    };

    var thumbs = document.querySelectorAll('.thumb');
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
        a.addEventListener('click', onThumbnailClick);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
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
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + VIDEO_PLAYER_CLASSNAME + ' {\n            max-width: calc(100% - 42px);\n        }\n      </style>');
  };

  var init = function init() {
    appendCSS();
    addListeners();
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();