"use strict";

(function () {
  /*
  Если это условие НЕ выполняется, изображения будут открываться как обычно на новой вкладке.
  См. https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
  */
  var HANDHELD_MEDIA_QUERY = '(min-width: 10cm)';
  /*
  Список расширений файлов, для которых может применяться раскрытие.
  */

  var EXTENSIONS = ['jpg', 'jpeg', 'gif', 'png'];

  var onThumbnailClick = function onThumbnailClick(e) {
    if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
    var img = e.currentTarget.querySelector('.thumb');
    var isExpanded = img.src == img.dataset.fullSrc;
    img.setAttribute('width', isExpanded ? img.dataset.thumbWidth : img.dataset.fullWidth);
    img.setAttribute('height', isExpanded ? img.dataset.thumbHeight : img.dataset.fullHeight);
    img.src = isExpanded ? img.dataset.thumbSrc : img.dataset.fullSrc;
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
        var imageExt = a.href.split('.').pop();
        if (!EXTENSIONS.includes(imageExt)) continue;
        img.dataset.thumbWidth = img.getAttribute('width');
        img.dataset.thumbHeight = img.getAttribute('height');
        img.dataset.thumbSrc = img.src;
        img.dataset.fullSrc = a.href;
        var post = a.parentNode;
        if (!post) continue;
        var filesize = post.querySelector('.filesize > em');
        if (!filesize) continue;
        var WxH = filesize.innerText.match(/(\d+)x(\d+)/);
        if (WxH === null) continue;
        img.dataset.fullWidth = WxH[1];
        img.dataset.fullHeight = WxH[2];
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
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n      @media only screen and ".concat(HANDHELD_MEDIA_QUERY, " {\n        a img.thumb {\n          margin: 0;\n          padding: 2px 20px;\n        }\n      \n        a img.thumb[src*=\"/src/\"] {\n          height: auto;\n          max-width: calc(100% - 40px);\n        }\n      }\n    </style>"));
  };

  var isDollchan = function isDollchan() {
    return document.body.classList.contains('de-runned') || !!document.body.querySelector('#de-main');
  };

  var init = function init() {
    if (isDollchan()) return;
    appendCSS();
    addListeners();

    if ('MutationObserver' in window) {
      if (isDollchan()) return;
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