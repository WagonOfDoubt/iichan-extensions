"use strict";

(function () {
  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */
  var THREAD_TITLE_LENGTH = 50;
  var board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

  var getHiddenThreads = function getHiddenThreads() {
    var json = JSON.parse(window.localStorage.getItem('iichan_hidden_threads') || '{}');
    return Array.isArray(json) ? {} : json;
  };

  var setHiddenThreads = function setHiddenThreads(hiddenThreads) {
    window.localStorage.setItem('iichan_hidden_threads', JSON.stringify(hiddenThreads));
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
    var btnContainer = thread.querySelector(".iichan-post-btns");

    if (!btnContainer) {
      btnContainer = document.createElement('span');
      btnContainer.classList.add("iichan-post-btns");
      label.parentNode.insertBefore(btnContainer, label.nextSibling);
    }

    btnContainer.insertAdjacentHTML('afterbegin', "\n    <div class=\"iichan-hide-thread-btn\" title=\"\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0440\u0435\u0434\" data-thread-id=\"".concat(thread.id, "\">\n      <svg>\n        <use class=\"iichan-icon-hide-use\" xlink:href=\"/extras/icons.svg#iichan-icon-hide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n        <use class=\"iichan-icon-unhide-use\" xlink:href=\"/extras/icons.svg#iichan-icon-unhide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\n    </div>\n  ").trim());
    var btn = thread.querySelector(".iichan-hide-thread-btn");
    btn.addEventListener('click', hideThread);
  };

  var addToggleBtn = function addToggleBtn(thread) {
    //catalog only
    if (!thread) return;
    var catthread = thread.querySelector('.catthread');
    catthread.insertAdjacentHTML('beforeend', "\n    <div class=\"iichan-hide-thread-btn\" title=\"\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0440\u0435\u0434\" data-thread-id=\"".concat(thread.id, "\">\n      <svg>\n        <use class=\"iichan-icon-hide-use\" xlink:href=\"/extras/icons.svg#iichan-icon-hide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n        <use class=\"iichan-icon-unhide-use\" xlink:href=\"/extras/icons.svg#iichan-icon-unhide\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\n    </div>\n  ").trim());
    var btn = catthread.querySelector(".iichan-hide-thread-btn");
    btn.classList.add('reply');
    btn.addEventListener('click', toggleThread);
  };

  var addPlaceholder = function addPlaceholder(thread) {
    if (!thread) return;
    var threadNo = thread.id.split('-').pop();
    var threadTitle = thread.querySelector('.filetitle').innerText || thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    var placeholderId = 'iichan-hidden-' + thread.id;
    thread.insertAdjacentHTML('beforebegin', "\n    <div class=\"reply iichan-hidden-thread-placeholder\" id=\"".concat(placeholderId, "\">\u0422\u0440\u0435\u0434 <a title=\"\u0420\u0430\u0441\u043A\u0440\u044B\u0442\u044C \u0442\u0440\u0435\u0434\" data-thread-id=\"").concat(thread.id, "\">\u2116").concat(threadNo, "</a> \u0441\u043A\u0440\u044B\u0442 (").concat(threadTitle || 'изображение', ")</div>\n  ").trim());
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
    thread.classList.remove('iichan-thread-hidden');
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
    thread.classList.add('iichan-thread-hidden');
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
    setThreadHidden(threadId, thread.classList.toggle('iichan-thread-hidden'));

    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n      .iichan-hidden-thread-placeholder {\n        pointer-events: none;\n      }\n      \n      .iichan-hidden-thread-placeholder a {\n        cursor: pointer;\n        pointer-events: auto;\n      }\n      \n      .iichan-hidden-thread-placeholder:hover + div,\n      .iichan-hidden-thread-placeholder:hover + div + br {\n        display: block !important;\n      }\n      \n      .iichan-hidden-thread-placeholder + div {\n        display: none;\n      }\n      .iichan-hidden-thread-placeholder + div +  br {\n        display: none;\n      }\n      \n      .iichan-hide-thread-btn {\n        margin-left: 0.4em;\n        cursor: pointer;\n        display: inline-block;\n        width: 16px;\n        height: 16px;\n        vertical-align: text-top;\n      }\n      \n      .iichan-hide-thread-btn use {\n        pointer-events: none;\n      }\n      \n      .iichan-hide-thread-btn > svg {\n        width: 16px;\n        height: 16px;\n      }\n      \n      [id^=thread]:not(.iichan-thread-hidden) .iichan-hide-thread-btn .iichan-icon-unhide-use {\n        display: none;\n      }\n      \n      [id^=thread].iichan-thread-hidden .iichan-hide-thread-btn .iichan-icon-hide-use {\n        display: none;\n      }\n      \n      .catthreadlist a {\n        position: relative;\n        transition: opacity .3s ease-in-out, filter .3s ease-in-out;\n      }\n      \n      .catthreadlist .iichan-thread-hidden {\n        opacity: .6;\n      }\n      \n      .catthreadlist .iichan-thread-hidden:not(:hover) {\n        opacity: .1;\n        filter: grayscale(100%);\n      }\n      \n      .catthread:hover .iichan-hide-thread-btn {\n        display: block;\n      }\n      \n      .catthread .iichan-hide-thread-btn {\n        text-decoration: none;\n        position: absolute;\n        top: 0;\n        right: 0;\n        display: none;\n        padding: 6px;\n      }\n      \n      #iichan-hide-threads-icons {\n        display: none;\n      }\n    </style>");
  }; // jshint ignore:line


  var isDollchan = function isDollchan() {
    return document.body.classList.contains('de-runned') || !!document.body.querySelector('#de-main');
  };

  var getSettings = function getSettings() {
    return JSON.parse(window.localStorage.getItem('iichan_settings') || '{}');
  };

  var init = function init() {
    if (isDollchan()) return;
    if (getSettings().disable_hide_threads) return;
    if (document.querySelector('body.replypage')) return;
    appendCSS(); // jshint ignore:line

    processThreads();

    if ('MutationObserver' in window) {
      var observer = new MutationObserver(function (mutations) {
        if (isDollchan()) return;
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