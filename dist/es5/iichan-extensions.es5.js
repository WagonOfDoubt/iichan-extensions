'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    var captchaInput = document.querySelector('input[name=captcha]');
    if (!captchaInput) return;

    captchaInput.addEventListener('keypress', function (e) {
      /*
      copypasta from
      https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/blob/master/src/Dollchan_Extension_Tools.es6.user.js
      */
      var ruUa = 'йцукенгшщзхъїфыівапролджэєячсмитьбюёґ',
          en = 'qwertyuiop[]]assdfghjkl;\'\'zxcvbnm,.`\\';
      var i = void 0,
          code = e.charCode || e.keyCode,
          chr = String.fromCharCode(code).toLowerCase();
      if (code < 0x0410 || code > 0x04FF || (i = ruUa.indexOf(chr)) === -1) {
        return;
      }
      chr = en[i];
      var el = e.target;
      var txt = chr;
      var scrtop = el.scrollTop;
      var start = el.selectionStart;
      el.value = el.value.substr(0, start) + txt + el.value.substr(el.selectionEnd);
      el.setSelectionRange(start + txt.length, start + txt.length);
      el.focus();
      el.scrollTop = scrtop;
      e.preventDefault();
    });
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();

(function () {
  'use strict';

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
        var imageExt = a.href.match(/\w*$/).toString();
        if (!EXTENSIONS.includes(imageExt)) continue;
        img.dataset.thumbWidth = img.getAttribute('width');
        img.dataset.thumbHeight = img.getAttribute('height');
        img.dataset.thumbSrc = img.src;
        img.dataset.fullSrc = a.href;
        var post = a.parentNode;
        if (!post) continue;
        var filesize = post.querySelector('.filesize > em');
        if (!filesize) continue;
        var WxH = filesize.innerText.match(/(\d*)x(\d*)/);
        img.dataset.fullWidth = WxH[1];
        img.dataset.fullHeight = WxH[2];
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
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .thumb {\n          max-width: 100%;\n          height: auto;\n          box-sizing: border-box;\n          margin: 0;\n          padding: 2px 20px\n        }\n      </style>');
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    addListeners();
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
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = threads[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var thread = _step3.value;

        var label = thread.querySelector(':scope > label');
        if (!label) continue;

        label.insertAdjacentHTML('afterend', '\n        <span class="' + HIDE_BTN_CLASSNAME + '" title="\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0440\u0435\u0434"></span>\n      ');
        var btn = label.nextElementSibling;
        btn.threadId = thread.id;
        btn.addEventListener('click', hideThread);
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
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = hiddenThreads[board][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var thread = _step4.value;

        hideThread(thread);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
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
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = mutation.addedNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var node = _step5.value;

            if (!node.querySelectorAll) return;
            addHideBtns(node);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
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

  var onThumbnailClick = function onThumbnailClick(e) {
    var parentNode = e.currentTarget.parentNode;
    var vp = document.createElement('video');
    vp.src = e.currentTarget.href;
    vp.classList.add(VIDEO_PLAYER_CLASSNAME);
    parentNode.insertBefore(vp, e.currentTarget);
    parentNode.removeChild(e.currentTarget);
    e.preventDefault();
  };

  var addListeners = function addListeners(rootNode) {
    var thumbs = (rootNode || document).querySelectorAll('.thumb');
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = thumbs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var img = _step6.value;

        var a = img.parentNode;
        if (!a) continue;
        var videoExt = a.href.split('.').pop();
        if (!EXTENSIONS.includes(videoExt)) continue;
        a.addEventListener('click', onThumbnailClick);
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + VIDEO_PLAYER_CLASSNAME + ' {\n          max-width: 100%;\n          height: auto;\n          box-sizing: border-box;\n          margin: 0;\n          padding: 2px 20px\n        }\n      </style>');
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    addListeners();
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = mutation.addedNodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var node = _step7.value;

            if (!node.querySelectorAll) return;
            addListeners(node);
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
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