"use strict";

(function () {
  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */
  var THREAD_TITLE_LENGTH = 50;
  var LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  var HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  var HIDE_BTN_TITLE = 'Скрыть тред';
  var UNHIDE_BTN_TITLE = 'Раскрыть тред';
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
    var label = thread.querySelector(':scope > .reflink');
    if (!label) return;
    label.insertAdjacentHTML('afterend', "\n    <div class=\"".concat(HIDE_BTN_CLASSNAME, "\" title=\"").concat(HIDE_BTN_TITLE, "\" data-thread-id=\"").concat(thread.id, "\">\n      <svg>\n        <use class=\"iichan-icon-hide-use\" xlink:href=\"#iichan-icon-hide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n        <use class=\"iichan-icon-unhide-use\" xlink:href=\"#iichan-icon-unhide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\n    </div>\n  "));
    var btn = thread.querySelector(".".concat(HIDE_BTN_CLASSNAME));
    btn.addEventListener('click', hideThread);
  };

  var addToggleBtn = function addToggleBtn(thread) {
    //catalog only
    if (!thread) return;
    var catthread = thread.querySelector('.catthread');
    catthread.insertAdjacentHTML('beforeend', "\n    <div class=\"".concat(HIDE_BTN_CLASSNAME, "\" title=\"").concat(HIDE_BTN_TITLE, "\" data-thread-id=\"").concat(thread.id, "\">\n      <svg>\n        <use class=\"iichan-icon-hide-use\" xlink:href=\"#iichan-icon-hide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n        <use class=\"iichan-icon-unhide-use\" xlink:href=\"#iichan-icon-unhide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\n    </div>\n  "));
    var btn = catthread.querySelector(".".concat(HIDE_BTN_CLASSNAME));
    btn.classList.add('reply');
    btn.addEventListener('click', toggleThread);
  };

  var addPlaceholder = function addPlaceholder(thread) {
    if (!thread) return;
    var threadNo = thread.id.split('-').pop();
    var threadTitle = thread.querySelector('.filetitle').innerText || thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    var placeholderId = 'iichan-hidden-' + thread.id;
    thread.insertAdjacentHTML('beforebegin', "\n    <div class=\"reply ".concat(PLACEHOLDER_CLASSNAME, "\" id=\"").concat(placeholderId, "\">\u0422\u0440\u0435\u0434 <a title=\"").concat(UNHIDE_BTN_TITLE, "\" data-thread-id=\"").concat(thread.id, "\">\u2116").concat(threadNo, "</a> \u0441\u043A\u0440\u044B\u0442 (").concat(threadTitle || 'изображение', ")</div>\n  "));
    var placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
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

  var getTargetThreadId = function getTargetThreadId(e) {
    if (typeof e === 'string') {
      return e;
    }

    var btn = e.target;

    while (btn && !(btn.dataset && btn.dataset.threadId)) {
      btn = btn.parentElement;
    }

    return btn && btn.dataset.threadId;
  };

  var unhideThread = function unhideThread(e) {
    var threadId = getTargetThreadId(e);
    setThreadHidden(threadId, false);
    var thread = document.getElementById(threadId);
    if (!thread) return;
    thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
    var placeholder = document.getElementById('iichan-hidden-' + threadId);

    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }

    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  var hideThread = function hideThread(e) {
    var threadId = getTargetThreadId(e);
    setThreadHidden(threadId, true);
    var thread = document.getElementById(threadId);
    if (!thread || !thread.parentNode) return;
    thread.classList.add(HIDDEN_THREAD_CLASSNAME);
    var catalogMode = !!document.querySelector('.catthreadlist');

    if (!catalogMode) {
      addPlaceholder(thread);
    }

    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  var toggleThread = function toggleThread(e) {
    // for catalog only
    var threadId = getTargetThreadId(e);
    var threadNo = threadId.split('-').pop();
    var thread = document.getElementById('thread-' + threadNo);
    setThreadHidden(threadId, thread.classList.toggle(HIDDEN_THREAD_CLASSNAME));

    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n      .".concat(PLACEHOLDER_CLASSNAME, " {\n        pointer-events: none;\n      }\n      \n      .").concat(PLACEHOLDER_CLASSNAME, " a {\n        cursor: pointer;\n        pointer-events: auto;\n      }\n      \n      .").concat(PLACEHOLDER_CLASSNAME, ":hover + div,\n      .").concat(PLACEHOLDER_CLASSNAME, ":hover + div + br {\n        display: block !important;\n      }\n      \n      .").concat(PLACEHOLDER_CLASSNAME, " + div {\n        display: none;\n      }\n      .").concat(PLACEHOLDER_CLASSNAME, " + div +  br {\n        display: none;\n      }\n      \n      .").concat(HIDE_BTN_CLASSNAME, " {\n        margin-left: 0.2em;\n        cursor: pointer;\n        display: inline-block;\n        width: 16px;\n        height: 16px;\n        vertical-align: text-top;\n      }\n      \n      .").concat(HIDE_BTN_CLASSNAME, " use {\n        pointer-events: none;\n      }\n      \n      .").concat(HIDE_BTN_CLASSNAME, " > svg {\n        width: 16px;\n        height: 16px;\n      }\n      \n      [id^=thread]:not(.iichan-thread-hidden) .").concat(HIDE_BTN_CLASSNAME, " .iichan-icon-unhide-use {\n        display: none;\n      }\n      \n      [id^=thread].iichan-thread-hidden .").concat(HIDE_BTN_CLASSNAME, " .iichan-icon-hide-use {\n        display: none;\n      }\n      \n      .catthreadlist a {\n        position: relative;\n        transition: opacity .3s ease-in-out, filter .3s ease-in-out;\n      }\n      \n      .catthreadlist .").concat(HIDDEN_THREAD_CLASSNAME, " {\n        opacity: .6;\n      }\n      \n      .catthreadlist .").concat(HIDDEN_THREAD_CLASSNAME, ":not(:hover) {\n        opacity: .1;\n        filter: grayscale(100%);\n      }\n      \n      .catthread:hover .").concat(HIDE_BTN_CLASSNAME, " {\n        display: block;\n      }\n      \n      .catthread .").concat(HIDE_BTN_CLASSNAME, " {\n        text-decoration: none;\n        position: absolute;\n        top: 0;\n        right: 0;\n        display: none;\n        padding: 6px;\n      }\n      \n    </style>"));
  };

  var appendHTML = function appendHTML() {
    var icons = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"iichan-icon-hide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n        <path\n          fill=\"currentcolor\"\n          d=\"m 2.8925753,6.0097655 c -1.039639,0 -1.876953,0.837315 -1.876953,1.876954 v 0.226562 c 0,1.039639 0.837314,1.876953 1.876953,1.876953 10.8787687,0 0.063512,0 10.2148497,0 1.039637,0 1.876953,-0.837314 1.876953,-1.876953 v -0.226562 c 0,-1.039639 -0.837315,-1.876954 -1.876953,-1.876954 -10.8494379,0 -0.248141,0 -10.2148497,0 z\"/>\n      </symbol>\n      <symbol id=\"iichan-icon-unhide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n        <path\n          fill=\"currentcolor\"\n          d=\"m 7.9589815,1.003906 c -1.106736,0 -1.996094,0.89131 -1.996094,1.998047 v 2.982421 h -3.070312 c -1.039639,0 -1.876953,0.837315 -1.876953,1.876954 V 8.08789 c 0,1.039639 0.837314,1.876953 1.876953,1.876953 h 3.070312 v 3.033204 c 0,1.106736 0.889358,1.998047 1.996094,1.998047 h 0.01563 c 1.106736,0 1.996094,-0.891311 1.996094,-1.998047 V 9.964843 h 3.1367195 c 1.039637,0 1.876953,-0.837314 1.876953,-1.876953 V 7.861328 c 0,-1.039639 -0.837315,-1.876954 -1.876953,-1.876954 H 9.9707005 V 3.001953 c 0,-1.106737 -0.889358,-1.998047 -1.996094,-1.998047 z\"/>\n      </symbol>\n    </svg>\n  ";
    var iconsContainer = "<div id=\"iichan-hide-threads-icons\">\n    ".concat(icons, "\n  </div>");
    document.body.insertAdjacentHTML('beforeend', iconsContainer);
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    if (document.querySelector('body.replypage')) return;
    appendCSS();
    appendHTML();
    processThreads();

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
              processThreads(node);
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