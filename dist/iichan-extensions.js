(() => {
  'use strict';

  const init = () => {
    if (document.querySelector('#de-main')) return;
    const captchaInput = document.querySelector('input[name=captcha]');
    if (!captchaInput) return;

    captchaInput.addEventListener('keypress', (e) => {
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
      const el = e.target;
      const txt = chr;
      const scrtop = el.scrollTop;
      const start = el.selectionStart;
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

(() => {
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

  const onThumbnailClick = (e) => {
    if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) return;
    const img = e.currentTarget.querySelector('.thumb');
    const isExpanded = img.src == img.dataset.fullSrc;
    img.setAttribute('width', isExpanded ? img.dataset.thumbWidth : img.dataset.fullWidth);
    img.setAttribute('height', isExpanded ? img.dataset.thumbHeight : img.dataset.fullHeight);
    img.src = isExpanded ? img.dataset.thumbSrc : img.dataset.fullSrc;
    e.preventDefault();
  };

  const addListeners = (rootNode) => {
    const thumbs = (rootNode || document).querySelectorAll('.thumb');
    for (const img of thumbs) {
      const a = img.parentNode;
      if (!a) continue;
      const imageExt = a.href.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) continue;
      img.dataset.thumbWidth = img.getAttribute('width');
      img.dataset.thumbHeight = img.getAttribute('height');
      img.dataset.thumbSrc = img.src;
      img.dataset.fullSrc = a.href;
      const post = a.parentNode;
      if (!post) continue;
      const filesize = post.querySelector('.filesize > em');
      if (!filesize) continue;
      const WxH = filesize.innerText.match(/(\d*)x(\d*)/);
      img.dataset.fullWidth = WxH[1];
      img.dataset.fullHeight = WxH[2];
      a.addEventListener('click', onThumbnailClick);
    }
  };

  const appendCSS = () => {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .thumb {
          max-width: 100%;
          height: auto;
          box-sizing: border-box;
          margin: 0;
          padding: 2px 20px
        }
        
      </style>`);
  };

  const init = () => {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    addListeners();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          addListeners(node);
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

(() => {
  'use strict';

  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */
  const THREAD_TITLE_LENGTH = 50;

  const LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  const HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
  const PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
  const board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

  const getHiddenThreads = () => {
    const json = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
    return Array.isArray(json) ? {} : json;
  };

  const setHiddenThreads = (hiddenThreads) => {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
  };

  const addHideBtns = (rootNode) => {
    const threads = (rootNode && rootNode.id.startsWith('thread-')) ? [rootNode] :
      (rootNode || document).querySelectorAll('[id^=thread]');
    for (const thread of threads) {
      const label = thread.querySelector(':scope > label');
      if (!label) continue;

      label.insertAdjacentHTML('afterend', `
        <span class="${HIDE_BTN_CLASSNAME}" title="Скрыть тред"></span>
      `);
      const btn = label.nextElementSibling;
      btn.threadId = thread.id;
      btn.addEventListener('click', hideThread);
    }
  };

  const unhideThread = (e) => {
    const threadId = typeof e === 'object' ? e.target.threadId : e;
    const hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    const index = hiddenThreads[board].indexOf(threadId);
    if (index === -1) return;
    hiddenThreads[board].splice(index, 1);
    setHiddenThreads(hiddenThreads);

    const thread = document.getElementById(threadId);
    if(!thread) return;

    const placeholder = document.getElementById('iichan-hidden-' + threadId);
    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }
  };

  const hideThread = (e) => {
    const threadId = typeof e === 'object' ? e.target.threadId : e;
    const thread = document.getElementById(threadId);
    if(!thread || !thread.parentNode) return;

    const threadNo = threadId.split('-')[1];
    let threadTitle = thread.querySelector('.filetitle').innerText ||
      thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    const placeholderId = 'iichan-hidden-' + threadId;
    thread.insertAdjacentHTML('beforebegin', `
      <div class="reply ${PLACEHOLDER_CLASSNAME}" id="${placeholderId}">Тред <a>№${threadNo}</a> скрыт (${threadTitle || 'изображение'})</div>
    `);

    const placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
    placeholderBtn.threadId = threadId;
    placeholderBtn.addEventListener('click', unhideThread);

    // save result
    const hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      hiddenThreads[board] = [];
    }
    if (!hiddenThreads[board].includes(threadId)) {
      hiddenThreads[board].push(threadId);
      setHiddenThreads(hiddenThreads);
    }
  };

  const hideAllHiddenThreads = () => {
    const hiddenThreads = getHiddenThreads();
    if (!hiddenThreads[board]) {
      return;
    }
    for (const thread of hiddenThreads[board]) {
      hideThread(thread);
    }
  };

  const appendCSS = () => {
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
        
        .${PLACEHOLDER_CLASSNAME} + div {
            display: none;
        }
        .${PLACEHOLDER_CLASSNAME} + div +  br {
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
  };

  const init = () => {
    if (document.querySelector('#de-main')) return;
    const threads = document.querySelectorAll('[id^=thread]');
    if (threads.length <= 1) {
      return;
    }
    appendCSS();
    addHideBtns();
    hideAllHiddenThreads();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          addHideBtns(node);
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

(() => {
  'use strict';

  /*
  Список расширений файлов, преобразуемых в видеопроигрыватели.
  */
  const EXTENSIONS = ['webm', 'mp4', 'ogv'];
  /*
  Класс CSS, применяемый для видеопроигрывателей.
  */
  const VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';

  const onThumbnailClick = (e) => {
    const parentNode = e.currentTarget.parentNode;
    const vp = document.createElement('video');
    vp.src = e.currentTarget.href;
    vp.classList.add(VIDEO_PLAYER_CLASSNAME);
    parentNode.insertBefore(vp, e.currentTarget);
    parentNode.removeChild(e.currentTarget);
    e.preventDefault();
  };

  const addListeners = (rootNode) => {
    const thumbs = (rootNode || document).querySelectorAll('.thumb');
    for (const img of thumbs) {
      const a = img.parentNode;
      if (!a) continue;
      const videoExt = a.href.split('.').pop();
      if (!EXTENSIONS.includes(videoExt)) continue;
      a.addEventListener('click', onThumbnailClick);
    }
  };

  const appendCSS = () => {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        .${VIDEO_PLAYER_CLASSNAME} {
            max-width: calc(100% - 42px);
        }
      </style>`);
  };

  const init = () => {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    addListeners();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          addListeners(node);
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
