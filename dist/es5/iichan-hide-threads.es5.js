'use strict';

(function () {
  'use strict';

  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */

  var THREAD_TITLE_LENGTH = 50;

  var LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  var HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  var HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
  var PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
  var board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

  var getHiddenThreads = function getHiddenThreads() {
    var json = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
    return Array.isArray(json) ? {} : json;
  };

  var setHiddenThreads = function setHiddenThreads(hiddenThreads) {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
  };

  var setThreadHidden = function setThreadHidden(threadId, isHidden) {
    var hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    if (!isHidden) {
      var index = hiddenThreads[board].indexOf(threadId);
      if (index === -1) return;
      hiddenThreads[board].splice(index, 1);
    } else {
      if (!hiddenThreads[board].includes(threadId)) {
        hiddenThreads[board].push(threadId);
      }
    }
    setHiddenThreads(hiddenThreads);
  };

  var addHideBtn = function addHideBtn(thread) {
    if (!thread) return;
    var label = thread.querySelector(':scope > label');
    if (!label) return;
    var btn = document.createElement('span');
    btn.title = 'Скрыть тред';
    btn.classList.add(HIDE_BTN_CLASSNAME);
    btn.dataset.threadId = thread.id;
    btn.addEventListener('click', hideThread);
    thread.insertBefore(btn, label.nextSibling); // insert after
  };

  var addToggleBtn = function addToggleBtn(thread) {
    //catalog only
    if (!thread) return;
    var btn = document.createElement('div');
    btn.title = 'Скрыть тред';
    btn.classList.add(HIDE_BTN_CLASSNAME, 'reply');
    btn.dataset.threadId = thread.id;
    btn.addEventListener('click', toggleThread);
    thread.querySelector('.catthread').appendChild(btn);
  };

  var addPlaceholder = function addPlaceholder(thread) {
    if (!thread) return;
    var threadNo = thread.id.split('-').pop();
    var threadTitle = thread.querySelector('.filetitle').innerText || thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    var placeholderId = 'iichan-hidden-' + thread.id;
    thread.insertAdjacentHTML('beforebegin', '\n      <div class="reply ' + PLACEHOLDER_CLASSNAME + '" id="' + placeholderId + '">\u0422\u0440\u0435\u0434 <a>\u2116' + threadNo + '</a> \u0441\u043A\u0440\u044B\u0442 (' + (threadTitle || 'изображение') + ')</div>\n    ');

    var placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
    placeholderBtn.dataset.threadId = thread.id;
    placeholderBtn.addEventListener('click', unhideThread);
  };

  var processThreads = function processThreads(rootNode) {
    var catalogMode = !!document.querySelector('.catthreadlist');
    var threadsSelector = catalogMode ? '.catthreadlist a' : '[id^=thread]';
    var threads = rootNode && rootNode.id.startsWith('thread-') ? [rootNode] : (rootNode || document).querySelectorAll(threadsSelector);
    var addBtn = catalogMode ? addToggleBtn : addHideBtn;
    var hiddenThreads = getHiddenThreads();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = threads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var thread = _step.value;

        thread.id = catalogMode ? 'thread-' + thread.title.match(/^#(\d+)\s/)[1] : thread.id;
        addBtn(thread);
        if (!hiddenThreads[board]) {
          continue;
        }
        if (hiddenThreads[board].includes(thread.id)) {
          hideThread(thread.id);
        }
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
    var threadId = e.target ? e.target.dataset.threadId : e;
    setThreadHidden(threadId, false);

    var thread = document.getElementById(threadId);
    if (!thread) return;
    thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
    var placeholder = document.getElementById('iichan-hidden-' + threadId);
    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }
  };

  var hideThread = function hideThread(e) {
    var threadId = e.target ? e.target.dataset.threadId : e;
    setThreadHidden(threadId, true);

    var thread = document.getElementById(threadId);
    if (!thread || !thread.parentNode) return;
    thread.classList.add(HIDDEN_THREAD_CLASSNAME);
    var catalogMode = !!document.querySelector('.catthreadlist');
    if (!catalogMode) {
      addPlaceholder(thread);
    }
  };

  var toggleThread = function toggleThread(e) {
    // for catalog only
    var threadId = e.target ? e.target.dataset.threadId : e;
    var threadNo = threadId.split('-').pop();
    var thread = document.getElementById('thread-' + threadNo);
    setThreadHidden(threadId, thread.classList.toggle(HIDDEN_THREAD_CLASSNAME));
    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + PLACEHOLDER_CLASSNAME + ' {\n            pointer-events: none;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ' a {\n            cursor: pointer;\n            pointer-events: auto;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ':hover + div,\n        .' + PLACEHOLDER_CLASSNAME + ':hover + div + br {\n            display: block !important;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ' + div {\n            display: none;\n        }\n        .' + PLACEHOLDER_CLASSNAME + ' + div +  br {\n            display: none;\n        }\n        \n        .' + HIDE_BTN_CLASSNAME + ' {\n            margin-left: 0.2em;\n            cursor: pointer;\n        }\n        \n        .' + HIDE_BTN_CLASSNAME + '::after {\n            content: \'[\u2715]\';\n        }\n        \n        .catthreadlist a {\n          position: relative;\n          transition: all .3s ease-in-out;\n        }\n        \n        .catthreadlist .' + HIDDEN_THREAD_CLASSNAME + ' {\n          opacity: .6;\n        }\n        \n        .catthreadlist .' + HIDDEN_THREAD_CLASSNAME + ':not(:hover) {\n          opacity: .2;\n          filter: blur(1px);\n        }\n        \n        .catthread:hover .' + HIDE_BTN_CLASSNAME + ' {\n          display: block;\n        }\n        \n        .catthread .' + HIDE_BTN_CLASSNAME + ' {\n          text-decoration: none;\n          position: absolute;\n          top: 0;\n          right: 0;\n          display: none;\n          width: 25px;\n          height: 25px;\n        }\n        \n        .catthreadlist .' + HIDDEN_THREAD_CLASSNAME + ' .' + HIDE_BTN_CLASSNAME + '::after {\n          content: \'[\u253C]\';\n        }\n      </style>');
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    if (document.querySelector('body.replypage')) return;
    appendCSS();
    processThreads();
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = mutation.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var node = _step2.value;

            if (!node.querySelectorAll) return;
            processThreads(node);
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