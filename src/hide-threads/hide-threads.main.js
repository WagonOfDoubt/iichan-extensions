/*
Сколько первых символов из поста показывать в заголовке скрытого треда
*/
const THREAD_TITLE_LENGTH = 50;
const board = window.location.href.match(/(?:\w+\.\w+\/)(.*)(?=\/)/)[1];

const getHiddenThreads = () => {
  const json = JSON.parse(window.localStorage.getItem('<%= LOCALSTORAGE_KEY %>') || '{}');
  return Array.isArray(json) ? {} : json;
};

const setHiddenThreads = (hiddenThreads) => {
  window.localStorage.setItem('<%= LOCALSTORAGE_KEY %>', JSON.stringify(hiddenThreads));
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
  let btnContainer = thread.querySelector(`.<%= POST_BTNS_CONTAINER_CLASSNAME %>`);
  if (!btnContainer) {
    btnContainer = document.createElement('span');
    btnContainer.classList.add(`<%= POST_BTNS_CONTAINER_CLASSNAME %>`);
    label.parentNode.insertBefore(btnContainer, label.nextSibling);
  }
  btnContainer.insertAdjacentHTML('afterbegin', `
    //=include hide-thread-btn.html
  `.trim());
  const btn = thread.querySelector(`.<%= HIDE_BTN_CLASSNAME %>`);
  btn.addEventListener('click', hideThread);
};

const addToggleBtn = (thread) => {
  //catalog only
  if (!thread) return;
  const catthread = thread.querySelector('.catthread');
  catthread.insertAdjacentHTML('beforeend', `
    //=include hide-thread-btn.html
  `.trim());
  const btn = catthread.querySelector(`.<%= HIDE_BTN_CLASSNAME %>`);
  btn.classList.add('reply');
  btn.addEventListener('click', toggleThread);
};

const addPlaceholder = (thread) => {
  if (!thread) return;
  const threadNo = thread.id.split('-').pop();
  let threadTitle = thread.querySelector('.filetitle').innerText ||
    thread.querySelector('blockquote').innerText;
  threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
  const placeholderId = '<%= PLACEHOLDER_ID_PREFIX %>' + thread.id;
  thread.insertAdjacentHTML('beforebegin', `
    //=include placeholder.html
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
  thread.classList.remove('<%= HIDDEN_THREAD_CLASSNAME %>');
  const placeholder = document.getElementById('<%= PLACEHOLDER_ID_PREFIX %>' + threadId);
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
  thread.classList.add('<%= HIDDEN_THREAD_CLASSNAME %>');
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
  setThreadHidden(threadId, thread.classList.toggle('<%= HIDDEN_THREAD_CLASSNAME %>'));
  if (e.preventDefault) {
    e.preventDefault();
  }
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
      //= include hide-threads.css
    </style>`);
};

<% if (USERSCRIPT) { %>
const appendHTML = () => document.body.insertAdjacentHTML('beforeend', `
  <div id="<%= ICONS_CONTAINER_ID %>">
    //=include hide-threads-icons.svg
  </div>`);
<% } %>

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');

const getSettings = () => JSON.parse(
  window.localStorage.getItem('<%= SETTINGS_LOCALSTORAGE_KEY %>') || '{}');

const init = () => {
  if (isDollchan()) return;
  if (getSettings().disable_hide_threads) return;
  if (document.querySelector('body.replypage')) return;
  appendCSS();
  <% if (USERSCRIPT) { %>
  appendHTML();
  <% } %>
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
