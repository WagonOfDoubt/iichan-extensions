// ==UserScript==
// @name         English captcha input language on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Fixes non-english keyboard layout for captcha input
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-eng-captcha.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==


(function() {
  'use strict';

  function init() {
    let captchaInput = document.querySelector('input[name=captcha]');
    if (!captchaInput) return;

    captchaInput.addEventListener('keypress', function(e) {
      /*
      copypasta from
      https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/blob/master/src/Dollchan_Extension_Tools.es6.user.js
      */
      const ruUa = 'йцукенгшщзхъїфыівапролджэєячсмитьбюёґ',
        en = 'qwertyuiop[]]assdfghjkl;\'\'zxcvbnm,.`\\';
      let i, code = e.charCode || e.keyCode,
        chr = String.fromCharCode(code).toLowerCase();
      if(code < 0x0410 || code > 0x04FF || (i = ruUa.indexOf(chr)) === -1) {
        return;
      }
      chr = en[i];
      let el = e.target;
      let txt = chr;
      let scrtop = el.scrollTop;
      let start = el.selectionStart;
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

// ==UserScript==
// @name         Expand images on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Expands images on click
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-expand-images.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==


(function() {
  'use strict';

  const MIN_DISPLAY_WIDTH = 700;  // ширина, при которой картинки будут открываться как обычно
  const MIN_DISPLAY_HEIGHT = 700;  // высота, при которой картинки будут открываться как обычно
  const EXPANDED_THUMB_CLASSNAME = 'iichan-image-fullsize';
  const EXTENSIONS = ['jpg', 'jpeg', 'gif', 'png'];

  function addListeners(e) {
    function onThumbnailClick(e) {
      if (screen.width < MIN_DISPLAY_WIDTH ||
        screen.height < MIN_DISPLAY_HEIGHT) {
        return;
      }

      let thumb = this.querySelector('.thumb');
      if (thumb.classList.contains(EXPANDED_THUMB_CLASSNAME)) {
        thumb.src = thumb.originalSrc;
        thumb.width = thumb.originalWidth;
        thumb.height = thumb.originalHeight;
        thumb.classList.remove(EXPANDED_THUMB_CLASSNAME);
        e.preventDefault();
        return;
      }

      let imageSrc = this.href;
      let imageExt = imageSrc.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) return;

      e.preventDefault();
      thumb.originalSrc = thumb.src;
      thumb.originalWidth = thumb.width;
      thumb.originalHeight = thumb.height;
      thumb.removeAttribute('width');
      thumb.removeAttribute('height');
      thumb.classList.add(EXPANDED_THUMB_CLASSNAME);
      thumb.src = imageSrc;
    };

    let thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      let a = img.parentNode;
      if (!a) continue;
      a.addEventListener('click', onThumbnailClick);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${EXPANDED_THUMB_CLASSNAME} {
            max-width: 97%; max-height: 97%;
        }
      </style>`);
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

// ==UserScript==
// @name         Hide threads on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Adds hide thread feature to iichan
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-hide-threads.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==


(function() {
  'use strict';

  const THREAD_TITLE_LENGTH = 50;  // Сколько первых символов из поста показывать в заголовке скрытого треда
  const LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  const HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
  const HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  const PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
  const PLACEHOLDER_NO_TEXT = 'изображение';

  function getHiddenThreads() {
    return JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '[]');
  }

  function setHiddenThreads(hiddenThreads) {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
  }

  function addHideBtns() {
    let threads = document.querySelectorAll('[id^=thread]');
    for (let thread of threads) {
      let label = thread.querySelector(':scope > label');
      if (!label) continue;

      label.insertAdjacentHTML('afterend', `
        <a class="${HIDE_BTN_CLASSNAME}" title="Скрыть тред">[-]</a>
      `);
      let btn = label.nextElementSibling;
      btn.threadId = thread.id;
      btn.addEventListener('click', hideThread);
    }
  }

  function unhideThread(e) {
    let threadId = typeof e === 'object' ? e.target.threadId : e;
    let hiddenThreads = getHiddenThreads();
    let index = hiddenThreads.indexOf(threadId);
    if (index === -1) return;
    hiddenThreads.splice(index, 1);
    setHiddenThreads(hiddenThreads);

    let thread = document.getElementById(threadId);
    if(!thread) return;

    thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
    let placeholder = document.getElementById('iichan-hidden-' + threadId);
    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }
  }

  function hideThread(e) {
    let threadId = typeof e === 'object' ? e.target.threadId : e;
    let thread = document.getElementById(threadId);
    if(!thread || !thread.parentNode) return;

    let threadNo = threadId.split('-')[1];
    let threadTitle = thread.querySelector('.filetitle').innerText ||
      thread.querySelector('blockquote').innerText ||
      PLACEHOLDER_NO_TEXT;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    let placeholderId = 'iichan-hidden-' + threadId;
    thread.insertAdjacentHTML('beforebegin', `
      <div class="reply ${PLACEHOLDER_CLASSNAME}" id="${placeholderId}">Тред <a>№${threadNo}</a> скрыт (${threadTitle})</div>
    `);

    let placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
    placeholderBtn.threadId = threadId;
    placeholderBtn.addEventListener('click', unhideThread);

    thread.classList.add(HIDDEN_THREAD_CLASSNAME);
    // save result
    let hiddenThreads = getHiddenThreads();
    if (!hiddenThreads.includes(threadId)) {
      hiddenThreads.push(threadId);
      setHiddenThreads(hiddenThreads);
    }
  }

  function hideAllHiddenThreads() {
    let hiddenThreads = getHiddenThreads();
    for (let thread of hiddenThreads) {
      hideThread(thread);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${PLACEHOLDER_CLASSNAME} {
            pointer-events: none;
        }
        
        .${PLACEHOLDER_CLASSNAME} a {
            cursor: pointer;
            pointer-events: auto;
        }
        
        .${PLACEHOLDER_CLASSNAME}:hover + div,
        .${PLACEHOLDER_CLASSNAME}:hover + div + br {
            display: block !important;
        }
        
        .${HIDDEN_THREAD_CLASSNAME} {
            display: none;
        }
        .${HIDDEN_THREAD_CLASSNAME} +  br {
            display: none;
        }
        
        .${HIDE_BTN_CLASSNAME} {
            margin-left: 0.2em;
            cursor: pointer;
        }
      </style>`);
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
