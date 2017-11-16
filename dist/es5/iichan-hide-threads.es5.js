'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';

  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */

  var THREAD_TITLE_LENGTH = 50;

  var LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  var HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  var PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
  var board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

  var getHiddenThreads = function getHiddenThreads() {
    var json = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
    return Array.isArray(json) ? {} : json;
  };

  var setHiddenThreads = function setHiddenThreads(hiddenThreads) {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
  };

  var addHideBtns = function addHideBtns(rootNode) {
    var threads = rootNode && rootNode.id.startsWith('thread-') ? [rootNode] : (rootNode || document).querySelectorAll('[id^=thread]');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = threads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var thread = _step.value;

        var label = thread.querySelector(':scope > label');
        if (!label) continue;

        label.insertAdjacentHTML('afterend', '\n        <span class="' + HIDE_BTN_CLASSNAME + '" title="\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0440\u0435\u0434"></span>\n      ');
        var btn = label.nextElementSibling;
        btn.threadId = thread.id;
        btn.addEventListener('click', hideThread);
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

  var unhideThread = function unhideThread(e) {
    var threadId = (typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object' ? e.target.threadId : e;
    var hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    var index = hiddenThreads[board].indexOf(threadId);
    if (index === -1) return;
    hiddenThreads[board].splice(index, 1);
    setHiddenThreads(hiddenThreads);

    var thread = document.getElementById(threadId);
    if (!thread) return;

    var placeholder = document.getElementById('iichan-hidden-' + threadId);
    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }
  };

  var hideThread = function hideThread(e) {
    var threadId = (typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object' ? e.target.threadId : e;
    var thread = document.getElementById(threadId);
    if (!thread || !thread.parentNode) return;

    var threadNo = threadId.split('-')[1];
    var threadTitle = thread.querySelector('.filetitle').innerText || thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    var placeholderId = 'iichan-hidden-' + threadId;
    thread.insertAdjacentHTML('beforebegin', '\n      <div class="reply ' + PLACEHOLDER_CLASSNAME + '" id="' + placeholderId + '">\u0422\u0440\u0435\u0434 <a>\u2116' + threadNo + '</a> \u0441\u043A\u0440\u044B\u0442 (' + (threadTitle || 'изображение') + ')</div>\n    ');

    var placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
    placeholderBtn.threadId = threadId;
    placeholderBtn.addEventListener('click', unhideThread);

    // save result
    var hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    if (!hiddenThreads[board].includes(threadId)) {
      hiddenThreads[board].push(threadId);
      setHiddenThreads(hiddenThreads);
    }
  };

  var hideAllHiddenThreads = function hideAllHiddenThreads() {
    var hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      return;
    }
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = hiddenThreads[board][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var thread = _step2.value;

        hideThread(thread);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + PLACEHOLDER_CLASSNAME + ' {\n            pointer-events: none;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ' a {\n            cursor: pointer;\n            pointer-events: auto;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ':hover + div,\n        .' + PLACEHOLDER_CLASSNAME + ':hover + div + br {\n            display: block !important;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ' + div {\n            display: none;\n        }\n        .' + PLACEHOLDER_CLASSNAME + ' + div +  br {\n            display: none;\n        }\n        \n        .' + HIDE_BTN_CLASSNAME + ' {\n            margin-left: 0.2em;\n            cursor: pointer;\n        }\n        \n        .' + HIDE_BTN_CLASSNAME + '::after {\n            content: \'[\u2715]\';\n        }\n      </style>');
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    var threads = document.querySelectorAll('[id^=thread]');
    if (threads.length <= 1) {
      return;
    }
    appendCSS();
    addHideBtns();
    hideAllHiddenThreads();
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = mutation.addedNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var node = _step3.value;

            if (!node.querySelectorAll) return;
            addHideBtns(node);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();