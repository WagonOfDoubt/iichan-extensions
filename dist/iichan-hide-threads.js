(() => {
/*
Сколько первых символов из поста показывать в заголовке скрытого треда
*/
const THREAD_TITLE_LENGTH = 50;

const LOCALSTORAGE_KEY = 'iichan_hidden_threads';
const HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
const HIDE_BTN_TITLE = 'Скрыть тред';
const UNHIDE_BTN_TITLE = 'Раскрыть тред';
const HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
const PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
const board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

const getHiddenThreads = () => {
  const json = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '{}');
  return Array.isArray(json) ? {} : json;
};

const setHiddenThreads = (hiddenThreads) => {
  window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
};

const setThreadHidden = (threadId, isHidden) => {
  const hiddenThreads = getHiddenThreads();
  if (!hiddenThreads[board]) {
    hiddenThreads[board] = [];
  }
  if (!isHidden) {
    const index = hiddenThreads[board].indexOf(threadId);
    if (index === -1) return;
    hiddenThreads[board].splice(index, 1);
  } else {
    if (!hiddenThreads[board].includes(threadId)) {
      hiddenThreads[board].push(threadId);
    }
  }
  setHiddenThreads(hiddenThreads);
};

const addHideBtn = (thread) => {
  if (!thread) return;
  const label = thread.querySelector(':scope > .reflink');
  if (!label) return;
  label.insertAdjacentHTML('afterend', `
    <div class="${HIDE_BTN_CLASSNAME}" title="${HIDE_BTN_TITLE}" data-thread-id="${thread.id}">
      <svg>
        <use class="iichan-icon-hide-use" xlink:href="#iichan-icon-hide" width="16" height="16" viewBox="0 0 16 16"/>
        <use class="iichan-icon-unhide-use" xlink:href="#iichan-icon-unhide" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `);
  const btn = thread.querySelector(`.${HIDE_BTN_CLASSNAME}`);
  btn.addEventListener('click', hideThread);
};

const addToggleBtn = (thread) => {
  //catalog only
  if (!thread) return;
  const catthread = thread.querySelector('.catthread');
  catthread.insertAdjacentHTML('beforeend', `
    <div class="${HIDE_BTN_CLASSNAME}" title="${HIDE_BTN_TITLE}" data-thread-id="${thread.id}">
      <svg>
        <use class="iichan-icon-hide-use" xlink:href="#iichan-icon-hide" width="16" height="16" viewBox="0 0 16 16"/>
        <use class="iichan-icon-unhide-use" xlink:href="#iichan-icon-unhide" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `);
  const btn = catthread.querySelector(`.${HIDE_BTN_CLASSNAME}`);
  btn.classList.add('reply');
  btn.addEventListener('click', toggleThread);
};

const addPlaceholder = (thread) => {
  if (!thread) return;
  const threadNo = thread.id.split('-').pop();
  let threadTitle = thread.querySelector('.filetitle').innerText ||
    thread.querySelector('blockquote').innerText;
  threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
  const placeholderId = 'iichan-hidden-' + thread.id;
  thread.insertAdjacentHTML('beforebegin', `
    <div class="reply ${PLACEHOLDER_CLASSNAME}" id="${placeholderId}">Тред <a title="${UNHIDE_BTN_TITLE}">№${threadNo}</a> скрыт (${threadTitle || 'изображение'})</div>
  `);

  const placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
  placeholderBtn.dataset.threadId = thread.id;
  placeholderBtn.addEventListener('click', unhideThread);
};

const processThreads = (rootNode) => {
  const catalogMode = !!document.querySelector('.catthreadlist');
  const threadsSelector = catalogMode ? '.catthreadlist a' : '[id^=thread]';
  const threads = (rootNode && rootNode.id.startsWith('thread-')) ? [rootNode] :
    (rootNode || document).querySelectorAll(threadsSelector);
  const addBtn = catalogMode ? addToggleBtn : addHideBtn;
  const hiddenThreads = getHiddenThreads();
  for (const thread of threads) {
    thread.id = catalogMode ? 'thread-' + thread.title.match(/^#(\d+)\s/)[1] : thread.id;
    addBtn(thread);
    if (!hiddenThreads[board]) {
      continue;
    }
    if (hiddenThreads[board].includes(thread.id)) {
      hideThread(thread.id);
    }
  }
};

const unhideThread = (e) => {
  let btn = e.target ? e.target : null;
  while (btn && !btn.classList.contains(HIDE_BTN_CLASSNAME)) {
    btn = btn.parentElement;
  }
  const threadId = btn ? btn.dataset.threadId : e;
  setThreadHidden(threadId, false);

  const thread = document.getElementById(threadId);
  if(!thread) return;
  thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
  const placeholder = document.getElementById('iichan-hidden-' + threadId);
  if (placeholder) {
    placeholder.parentElement.removeChild(placeholder);
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
};

const hideThread = (e) => {
  let btn = e.target ? e.target : null;
  while (btn && !btn.classList.contains(HIDE_BTN_CLASSNAME)) {
    btn = btn.parentElement;
  }
  const threadId = btn ? btn.dataset.threadId : e;
  setThreadHidden(threadId, true);

  const thread = document.getElementById(threadId);
  if(!thread || !thread.parentNode) return;
  thread.classList.add(HIDDEN_THREAD_CLASSNAME);
  const catalogMode = !!document.querySelector('.catthreadlist');
  if (!catalogMode) {
    addPlaceholder(thread);
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
};

const toggleThread = (e) => {
  // for catalog only
  let btn = e.target ? e.target : null;
  while (btn && !btn.classList.contains(HIDE_BTN_CLASSNAME)) {
    btn = btn.parentElement;
  }
  const threadId = btn ? btn.dataset.threadId : e;
  const threadNo = threadId.split('-').pop();
  const thread = document.getElementById('thread-' + threadNo);
  setThreadHidden(threadId, thread.classList.toggle(HIDDEN_THREAD_CLASSNAME));
  if (e.preventDefault) {
    e.preventDefault();
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
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-top;
      }
      
      .${HIDE_BTN_CLASSNAME} use {
        pointer-events: none;
      }
      
      .${HIDE_BTN_CLASSNAME} > svg {
        width: 16px;
        height: 16px;
      }
      
      [id^=thread]:not(.iichan-thread-hidden) .${HIDE_BTN_CLASSNAME} .iichan-icon-unhide-use {
        display: none;
      }
      
      [id^=thread].iichan-thread-hidden .${HIDE_BTN_CLASSNAME} .iichan-icon-hide-use {
        display: none;
      }
      
      .catthreadlist a {
        position: relative;
        transition: opacity .3s ease-in-out, filter .3s ease-in-out;
      }
      
      .catthreadlist .${HIDDEN_THREAD_CLASSNAME} {
        opacity: .6;
      }
      
      .catthreadlist .${HIDDEN_THREAD_CLASSNAME}:not(:hover) {
        opacity: .1;
        filter: grayscale(100%);
      }
      
      .catthread:hover .${HIDE_BTN_CLASSNAME} {
        display: block;
      }
      
      .catthread .${HIDE_BTN_CLASSNAME} {
        text-decoration: none;
        position: absolute;
        top: 0;
        right: 0;
        display: none;
        padding: 6px;
      }
      
    </style>`);
};

const appendHTML = () => {
  const icons = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="iichan-icon-hide" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="m 2.8925753,6.0097655 c -1.039639,0 -1.876953,0.837315 -1.876953,1.876954 v 0.226562 c 0,1.039639 0.837314,1.876953 1.876953,1.876953 10.8787687,0 0.063512,0 10.2148497,0 1.039637,0 1.876953,-0.837314 1.876953,-1.876953 v -0.226562 c 0,-1.039639 -0.837315,-1.876954 -1.876953,-1.876954 -10.8494379,0 -0.248141,0 -10.2148497,0 z"/>
      </symbol>
      <symbol id="iichan-icon-unhide" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="m 7.9589815,1.003906 c -1.106736,0 -1.996094,0.89131 -1.996094,1.998047 v 2.982421 h -3.070312 c -1.039639,0 -1.876953,0.837315 -1.876953,1.876954 V 8.08789 c 0,1.039639 0.837314,1.876953 1.876953,1.876953 h 3.070312 v 3.033204 c 0,1.106736 0.889358,1.998047 1.996094,1.998047 h 0.01563 c 1.106736,0 1.996094,-0.891311 1.996094,-1.998047 V 9.964843 h 3.1367195 c 1.039637,0 1.876953,-0.837314 1.876953,-1.876953 V 7.861328 c 0,-1.039639 -0.837315,-1.876954 -1.876953,-1.876954 H 9.9707005 V 3.001953 c 0,-1.106737 -0.889358,-1.998047 -1.996094,-1.998047 z"/>
      </symbol>
    </svg>
  `;
  const iconsContainer = `<div id="iichan-hide-threads-icons">
    ${icons}
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};

const init = () => {
  if (document.querySelector('#de-main')) return;
  if (document.querySelector('body.replypage')) return;
  appendCSS();
  appendHTML();
  processThreads();
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          processThreads(node);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

})();