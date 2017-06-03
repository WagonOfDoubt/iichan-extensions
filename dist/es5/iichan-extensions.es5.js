'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';

  function init() {
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
  }

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
  /*
  Класс CSS, применяемый для раскрытых картинок.
  */
  var EXPANDED_THUMB_CLASSNAME = 'iichan-image-fullsize';

  function addListeners(e) {
    function onThumbnailClick(e) {
      if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
      var img = e.currentTarget.querySelector('.thumb');
      var isExpanded = img.classList.toggle(EXPANDED_THUMB_CLASSNAME);
      if (isExpanded) {
        img.removeAttribute('width');
        img.removeAttribute('height');
      } else {
        img.setAttribute('width', img.thumbWidth);
        img.setAttribute('height', img.thumbHeight);
      }
      img.src = isExpanded ? e.currentTarget.href : img.thumbSrc;
      e.preventDefault();
    }

    var thumbs = document.querySelectorAll('.thumb');
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
        img.thumbWidth = img.getAttribute('width');
        img.thumbHeight = img.getAttribute('height');
        img.thumbSrc = img.src;
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
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + EXPANDED_THUMB_CLASSNAME + ' {\n            max-width: calc(100% - 42px);\n        }\n      </style>');
  }

  function init() {
    appendCSS();
    addListeners();
  }

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
  var HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
  var HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  var PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
  var board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

  function getHiddenThreads() {
    var json = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
    return Array.isArray(json) ? {} : json;
  }

  function setHiddenThreads(hiddenThreads) {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
  }

  function addHideBtns() {
    var threads = document.querySelectorAll('[id^=thread]');
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = threads[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var thread = _step2.value;

        var label = thread.querySelector(':scope > label');
        if (!label) continue;

        label.insertAdjacentHTML('afterend', '\n        <span class="' + HIDE_BTN_CLASSNAME + '" title="\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0440\u0435\u0434"></span>\n      ');
        var btn = label.nextElementSibling;
        btn.threadId = thread.id;
        btn.addEventListener('click', hideThread);
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
  }

  function unhideThread(e) {
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

    thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
    var placeholder = document.getElementById('iichan-hidden-' + threadId);
    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }
  }

  function hideThread(e) {
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

    thread.classList.add(HIDDEN_THREAD_CLASSNAME);
    // save result
    var hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    if (!hiddenThreads[board].includes(threadId)) {
      hiddenThreads[board].push(threadId);
      setHiddenThreads(hiddenThreads);
    }
  }

  function hideAllHiddenThreads() {
    var hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      return;
    }
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = hiddenThreads[board][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var thread = _step3.value;

        hideThread(thread);
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
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + PLACEHOLDER_CLASSNAME + ' {\n            pointer-events: none;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ' a {\n            cursor: pointer;\n            pointer-events: auto;\n        }\n        \n        .' + PLACEHOLDER_CLASSNAME + ':hover + div,\n        .' + PLACEHOLDER_CLASSNAME + ':hover + div + br {\n            display: block !important;\n        }\n        \n        .' + HIDDEN_THREAD_CLASSNAME + ' {\n            display: none;\n        }\n        .' + HIDDEN_THREAD_CLASSNAME + ' +  br {\n            display: none;\n        }\n        \n        .' + HIDE_BTN_CLASSNAME + ' {\n            margin-left: 0.2em;\n            cursor: pointer;\n        }\n        \n        .' + HIDE_BTN_CLASSNAME + '::after {\n            content: \'[\u2715]\';\n        }\n      </style>');
  }

  function init() {
    appendCSS();
    addHideBtns();
    hideAllHiddenThreads();
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();