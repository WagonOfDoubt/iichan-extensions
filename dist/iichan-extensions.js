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

(function() {
  'use strict';

  /*
  Если это условие НЕ выполняется, изображения будут открываться как обычно на новой вкладке.
  См. https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
  */
  const HANDHELD_MEDIA_QUERY = '(min-width: 10cm)';
  /*
  Список расширений файлов, для которых может применяться раскрытие.
  */
  const EXTENSIONS = ['jpg', 'jpeg', 'gif', 'png'];
  /*
  Класс CSS, применяемый для раскрытых картинок.
  */
  const EXPANDED_THUMB_CLASSNAME = 'iichan-image-fullsize';

  function addListeners(e) {
    function onThumbnailClick(e) {
      if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
      const img = e.currentTarget.querySelector('.thumb');
      const isExpanded = img.classList.toggle(EXPANDED_THUMB_CLASSNAME);
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

    const thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      let a = img.parentNode;
      if (!a) continue;
      let imageExt = a.href.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) continue;
      img.thumbWidth = img.getAttribute('width');
      img.thumbHeight = img.getAttribute('height');
      img.thumbSrc = img.src;
      a.addEventListener('click', onThumbnailClick);
    }
  }

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${EXPANDED_THUMB_CLASSNAME} {
            max-width: calc(100% - 42px);
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

(function() {
  'use strict';

  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */
  const THREAD_TITLE_LENGTH = 50;

  const LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  const HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
  const HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  const PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
  const board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

  function getHiddenThreads() {
    const json = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
    return Array.isArray(json) ? {} : json;
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
        <span class="${HIDE_BTN_CLASSNAME}" title="Скрыть тред"></span>
      `);
      let btn = label.nextElementSibling;
      btn.threadId = thread.id;
      btn.addEventListener('click', hideThread);
    }
  }

  function unhideThread(e) {
    let threadId = typeof e === 'object' ? e.target.threadId : e;
    let hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    let index = hiddenThreads[board].indexOf(threadId);
    if (index === -1) return;
    hiddenThreads[board].splice(index, 1);
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
      thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    let placeholderId = 'iichan-hidden-' + threadId;
    thread.insertAdjacentHTML('beforebegin', `
      <div class="reply ${PLACEHOLDER_CLASSNAME}" id="${placeholderId}">Тред <a>№${threadNo}</a> скрыт (${threadTitle || 'изображение'})</div>
    `);

    let placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
    placeholderBtn.threadId = threadId;
    placeholderBtn.addEventListener('click', unhideThread);

    thread.classList.add(HIDDEN_THREAD_CLASSNAME);
    // save result
    let hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    if (!hiddenThreads[board].includes(threadId)) {
      hiddenThreads[board].push(threadId);
      setHiddenThreads(hiddenThreads);
    }
  }

  function hideAllHiddenThreads() {
    let hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      return;
    }
    for (let thread of hiddenThreads[board]) {
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
        
        .${HIDE_BTN_CLASSNAME}::after {
            content: '[✕]';
        }
      </style>`);
  }

  function init() {
    const threads = document.querySelectorAll('[id^=thread]');
    if (threads.length <= 1) {
      return;
    }
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

(function() {
  'use strict';

  const POPUP_OFFSET = {x: 5, y: 5};

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .reply-popup {
        	border: 1px solid currentColor;
        }
      </style>`);
  }

  function init() {
    let currentPopup = null;
    const onHover = (event) => {
      if (document.querySelector('#de-main')) {
        return;
      }
      const postId = event.target.innerText.match(/\d+/).toString();
      const post = document.querySelector(`#reply${ postId }`);
      if (!post) {
        return;
      }
      currentPopup = document.createElement('div');
      currentPopup.innerHTML = post.innerHTML;
      currentPopup.classList.add('reply');
      currentPopup.classList.add('reply-popup');
      currentPopup.style.position = 'fixed';
      currentPopup.style.left = (event.clientX + POPUP_OFFSET.x) + 'px';
      currentPopup.style.top = (event.clientY + POPUP_OFFSET.y) + 'px';
      document.body.appendChild(currentPopup);
    };
    const onLeave = (event) => {
      if (document.querySelector('#de-main')) {
        return;
      }
      if (currentPopup) {
        document.body.removeChild(currentPopup);
        currentPopup = null;
      }
    };
    const onMove = (event) => {
      if (document.querySelector('#de-main')) {
        return;
      }
      if (currentPopup) {
        currentPopup.style.left = (event.clientX + POPUP_OFFSET.x) + 'px';
        currentPopup.style.top = (event.clientY + POPUP_OFFSET.y) + 'px';
      }
    };
    if (document.querySelector('#de-main')) {
      return;
    }
    const reflinks = document.querySelectorAll('a[onclick^="highlight"]');
    if (!reflinks.length) {
      return;
    }
    appendCSS();
    for (let link of reflinks) {
      link.addEventListener('mouseenter', onHover);
      link.addEventListener('mouseleave', onLeave);
      link.addEventListener('mousemove', onMove);
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
