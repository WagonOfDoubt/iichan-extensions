'use strict';

(function () {
  'use strict';

  var POPUP_OFFSET = { x: 5, y: 5 };

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .reply-popup {\n        \tborder: 1px solid currentColor;\n        }\n      </style>');
  }

  function init() {
    var currentPopup = null;
    var onHover = function onHover(event) {
      if (document.querySelector('#de-main')) {
        return;
      }
      var postId = event.target.innerText.match(/\d+/).toString();
      var post = document.querySelector('#reply' + postId);
      if (!post) {
        return;
      }
      currentPopup = document.createElement('div');
      currentPopup.innerHTML = post.innerHTML;
      currentPopup.classList.add('reply');
      currentPopup.classList.add('reply-popup');
      currentPopup.style.position = 'fixed';
      currentPopup.style.left = event.clientX + POPUP_OFFSET.x + 'px';
      currentPopup.style.top = event.clientY + POPUP_OFFSET.y + 'px';
      document.body.appendChild(currentPopup);
    };
    var onLeave = function onLeave(event) {
      if (document.querySelector('#de-main')) {
        return;
      }
      if (currentPopup) {
        document.body.removeChild(currentPopup);
        currentPopup = null;
      }
    };
    var onMove = function onMove(event) {
      if (document.querySelector('#de-main')) {
        return;
      }
      if (currentPopup) {
        currentPopup.style.left = event.clientX + POPUP_OFFSET.x + 'px';
        currentPopup.style.top = event.clientY + POPUP_OFFSET.y + 'px';
      }
    };
    if (document.querySelector('#de-main')) {
      return;
    }
    var reflinks = document.querySelectorAll('a[onclick^="highlight"]');
    if (!reflinks.length) {
      return;
    }
    appendCSS();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = reflinks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var link = _step.value;

        link.addEventListener('mouseenter', onHover);
        link.addEventListener('mouseleave', onLeave);
        link.addEventListener('mousemove', onMove);
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
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();