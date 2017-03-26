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

!function(){"use strict";function e(){let e=document.querySelector("input[name=captcha]");e&&e.addEventListener("keypress",function(e){const t="йцукенгшщзхъїфыівапролджэєячсмитьбюёґ",n="qwertyuiop[]]assdfghjkl;''zxcvbnm,.`\\";let o,s=e.charCode||e.keyCode,c=String.fromCharCode(s).toLowerCase();if(!(s<1040||s>1279||(o=t.indexOf(c))===-1)){c=n[o];let t=e.target,s=c,r=t.scrollTop,a=t.selectionStart;t.value=t.value.substr(0,a)+s+t.value.substr(t.selectionEnd),t.setSelectionRange(a+s.length,a+s.length),t.focus(),t.scrollTop=r,e.preventDefault()}})}document.body?e():document.addEventListener("DOMContentLoaded",e)}();
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
      if (!window.matchMedia(HANDHELD_MEDIA_QUERY).matches) {
        return;
      }

      let thumb = this.querySelector('.thumb');
      let isExpanded = !thumb.classList.toggle(EXPANDED_THUMB_CLASSNAME);
      let imageExt = this.href.match(/\w*$/).toString();
      if (!EXTENSIONS.includes(imageExt)) return;

      thumb.src = isExpanded ? thumb.thumbSrc : this.href;
      e.preventDefault();
    };

    let thumbs = document.querySelectorAll('.thumb');
    for (let img of thumbs) {
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.thumbSrc = img.src;
      let a = img.parentNode;
      if (!a) continue;
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

!function(){"use strict";function t(t){function e(t){if(window.matchMedia(i).matches){let e=this.querySelector(".thumb"),n=!e.classList.toggle(o),i=this.href.match(/\w*$/).toString();c.includes(i)&&(e.src=n?e.thumbSrc:this.href,t.preventDefault())}}let n=document.querySelectorAll(".thumb");for(let r of n){r.removeAttribute("width"),r.removeAttribute("height"),r.thumbSrc=r.src;let t=r.parentNode;t&&t.addEventListener("click",e)}}function e(){document.head.insertAdjacentHTML("beforeend",`<style type="text/css">
        .iichan-image-fullsize {
            max-width: calc(100% - 56px);
        }
      </style>`)}function n(){e(),t()}const i="(min-width: 10cm)",c=["jpg","jpeg","gif","png"],o="iichan-image-fullsize";document.body?n():document.addEventListener("DOMContentLoaded",n)}();
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

!function(){"use strict";function e(){return JSON.parse(window.localStorage.getItem(l)||"[]")}function t(e){window.localStorage.setItem(l,JSON.stringify(e))}function n(){let e=document.querySelectorAll("[id^=thread]");for(let t of e){let e=t.querySelector(":scope > label");if(e){e.insertAdjacentHTML("afterend",`
        <a class="${u}" title="Скрыть тред">[-]</a>
      `);let n=e.nextElementSibling;n.threadId=t.id,n.addEventListener("click",d)}}}function i(n){let i="object"==typeof n?n.target.threadId:n,d=e(),c=d.indexOf(i);if(c!==-1){d.splice(c,1),t(d);let e=document.getElementById(i);if(e){e.classList.remove(s);let t=document.getElementById("iichan-hidden-"+i);t&&t.parentElement.removeChild(t)}}}function d(n){let d="object"==typeof n?n.target.threadId:n,c=document.getElementById(d);if(c&&c.parentNode){let n=d.split("-")[1],o=c.querySelector(".filetitle").innerText||c.querySelector("blockquote").innerText||"изображение";o=o.substr(0,a);let r="iichan-hidden-"+d;c.insertAdjacentHTML("beforebegin",`
      <div class="reply ${h}" id="${r}">Тред <a>№${n}</a> скрыт (${o})</div>
    `);let l=c.previousElementSibling.querySelector(":scope > a");l.threadId=d,l.addEventListener("click",i),c.classList.add(s);let u=e();u.includes(d)||(u.push(d),t(u))}}function c(){let t=e();for(let n of t)d(n)}function o(){document.head.insertAdjacentHTML("beforeend",`<style type="text/css">
        .${h} {
            pointer-events: none;
        }
        
        .${h} a {
            cursor: pointer;
            pointer-events: auto;
        }
        
        .${h}:hover + div,
        .${h}:hover + div + br {
            display: block !important;
        }
        
        .iichan-thread-hidden {
            display: none;
        }
        .iichan-thread-hidden +  br {
            display: none;
        }
        
        .${u} {
            margin-left: 0.2em;
            cursor: pointer;
        }
      </style>`)}function r(){o(),n(),c()}const a=50,l="iichan_hidden_threads",s="iichan-thread-hidden",u="iichan-hide-thread-btn",h="iichan-hidden-thread-placeholder";document.body?r():document.addEventListener("DOMContentLoaded",r)}();