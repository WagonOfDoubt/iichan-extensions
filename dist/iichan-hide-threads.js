(() => {
/*
Сколько первых символов из поста показывать в заголовке скрытого треда
*/
const THREAD_TITLE_LENGTH = 50;
const board = window.location.href.match(/(?:[\w\.]+\/)(.*)(?=\/)/)[1];

const getHiddenThreads = () => {
  const json = JSON.parse(window.localStorage.getItem('iichan_hidden_threads') || '{}');
  return Array.isArray(json) ? {} : json;
};

const setHiddenThreads = (hiddenThreads) => {
  window.localStorage.setItem('iichan_hidden_threads', JSON.stringify(hiddenThreads));
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
  let btnContainer = thread.querySelector(`.iichan-post-btns`);
  if (!btnContainer) {
    btnContainer = document.createElement('span');
    btnContainer.classList.add(`iichan-post-btns`);
    label.parentNode.insertBefore(btnContainer, label.nextSibling);
  }
  btnContainer.insertAdjacentHTML('afterbegin', `
    <div class="iichan-hide-thread-btn" title="Скрыть тред" data-thread-id="${thread.id}">
      <svg>
        <use class="iichan-icon-hide-use" xlink:href="/extras/icons.svg#iichan-icon-hide" width="16" height="16" viewBox="0 0 16 16"/>
        <use class="iichan-icon-unhide-use" xlink:href="/extras/icons.svg#iichan-icon-unhide" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `.trim());
  const btn = thread.querySelector(`.iichan-hide-thread-btn`);
  btn.addEventListener('click', hideThread);
};

const addToggleBtn = (thread) => {
  //catalog only
  if (!thread) return;
  const catthread = thread.querySelector('.catthread');
  catthread.insertAdjacentHTML('beforeend', `
    <div class="iichan-hide-thread-btn" title="Скрыть тред" data-thread-id="${thread.id}">
      <svg>
        <use class="iichan-icon-hide-use" xlink:href="/extras/icons.svg#iichan-icon-hide" width="16" height="16" viewBox="0 0 16 16"/>
        <use class="iichan-icon-unhide-use" xlink:href="/extras/icons.svg#iichan-icon-unhide" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `.trim());
  const btn = catthread.querySelector(`.iichan-hide-thread-btn`);
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
    <div class="reply iichan-hidden-thread-placeholder" id="${placeholderId}">Тред <a title="Раскрыть тред" data-thread-id="${thread.id}">№${threadNo}</a> скрыт (${threadTitle || 'изображение'})</div>
  `.trim());

  const placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
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

const getTargetThreadId = (e) => {
  if (typeof e === 'string') {
    return e;
  }
  let btn = e.target;
  while (btn && !(btn.dataset && btn.dataset.threadId)) {
    btn = btn.parentElement;
  }
  return btn && btn.dataset.threadId;
};

const unhideThread = (e) => {
  const threadId = getTargetThreadId(e);
  setThreadHidden(threadId, false);

  const thread = document.getElementById(threadId);
  if(!thread) return;
  thread.classList.remove('iichan-thread-hidden');
  const placeholder = document.getElementById('iichan-hidden-' + threadId);
  if (placeholder) {
    placeholder.parentElement.removeChild(placeholder);
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
};

const hideThread = (e) => {
  const threadId = getTargetThreadId(e);
  setThreadHidden(threadId, true);

  const thread = document.getElementById(threadId);
  if(!thread || !thread.parentNode) return;
  thread.classList.add('iichan-thread-hidden');
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
  const threadId = getTargetThreadId(e);
  const threadNo = threadId.split('-').pop();
  const thread = document.getElementById('thread-' + threadNo);
  setThreadHidden(threadId, thread.classList.toggle('iichan-thread-hidden'));
  if (e.preventDefault) {
    e.preventDefault();
  }
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
      .iichan-hidden-thread-placeholder {
        pointer-events: none;
      }
      
      .iichan-hidden-thread-placeholder a {
        cursor: pointer;
        pointer-events: auto;
      }
      
      .iichan-hidden-thread-placeholder:hover + div,
      .iichan-hidden-thread-placeholder:hover + div + br {
        display: block !important;
      }
      
      .iichan-hidden-thread-placeholder + div {
        display: none;
      }
      .iichan-hidden-thread-placeholder + div +  br {
        display: none;
      }
      
      .iichan-hide-thread-btn {
        margin-left: 0.4em;
        cursor: pointer;
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-top;
      }
      
      .iichan-hide-thread-btn use {
        pointer-events: none;
      }
      
      .iichan-hide-thread-btn > svg {
        width: 16px;
        height: 16px;
      }
      
      [id^=thread]:not(.iichan-thread-hidden) .iichan-hide-thread-btn .iichan-icon-unhide-use {
        display: none;
      }
      
      [id^=thread].iichan-thread-hidden .iichan-hide-thread-btn .iichan-icon-hide-use {
        display: none;
      }
      
      .catthreadlist a {
        position: relative;
        transition: opacity .3s ease-in-out, filter .3s ease-in-out;
      }
      
      .catthreadlist .iichan-thread-hidden {
        opacity: .6;
      }
      
      .catthreadlist .iichan-thread-hidden:not(:hover) {
        opacity: .1;
        filter: grayscale(100%);
      }
      
      .catthread:hover .iichan-hide-thread-btn {
        display: block;
      }
      
      .catthread .iichan-hide-thread-btn {
        text-decoration: none;
        position: absolute;
        top: 0;
        right: 0;
        display: none;
        padding: 6px;
      }
      
      #iichan-hide-threads-icons {
        display: none;
      }
    </style>`);
};

  // jshint ignore:line

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');

const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const init = () => {
  if (isDollchan()) return;
  if (getSettings().disable_hide_threads) return;
  if (document.querySelector('body.replypage')) return;
  appendCSS();
    // jshint ignore:line
  processThreads();
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      if (isDollchan()) return;
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