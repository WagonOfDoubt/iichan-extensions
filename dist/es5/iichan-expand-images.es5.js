"use strict";

(function () {
  var onThumbnailClick = function onThumbnailClick(e) {
    var fallbackMediaQuery = '(min-width: 360px)'; // jshint ignore:line

    if (!window.matchMedia(fallbackMediaQuery).matches) {
      return;
    }

    var img = e.currentTarget.querySelector('.thumb');
    var isExpanded = img.src == img.dataset.fullSrc;
    var w = isExpanded ? img.dataset.thumbWidth : img.dataset.fullWidth;
    var h = isExpanded ? img.dataset.thumbHeight : img.dataset.fullHeight;
    img.setAttribute('width', w);
    img.setAttribute('height', h);

    if (isExpanded) {
      img.style = '';
    } else {
      img.style.width = w + 'px'; // img.style.height = h + 'px';

      img.style.height = 'auto';
    }

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
        var allowedExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp']; // jshint ignore:line

        if (!allowedExtensions.includes(imageExt)) continue;
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
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n      @media only screen and (min-width: 360px) {\n        a img.thumb[src*=\"/src/\"] {\n          max-width: calc(100% - 8px);\n          max-height: initial;\n        }\n        a img.thumb {\n          margin: 0;\n          padding: 2px 4px;\n        }\n      }\n      @media only screen and (min-width: 480px) {\n        a img.thumb[src*=\"/src/\"] {\n          max-width: calc(100% - 40px);\n          max-height: initial;\n        }\n        a img.thumb {\n          margin: 0;\n          padding: 2px 20px;\n        }\n      }\n    </style>");
  };

  var isDollchan = function isDollchan() {
    return document.body.classList.contains('de-runned') || !!document.body.querySelector('#de-main');
  };

  var getSettings = function getSettings() {
    return JSON.parse(window.localStorage.getItem('iichan_settings') || '{}');
  };

  var init = function init() {
    if (isDollchan()) return;
    if (getSettings().disable_expand_images) return;
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