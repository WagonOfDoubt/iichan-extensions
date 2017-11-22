// ==UserScript==
// @name         [IIchan] Hide threads
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.4
// @description  Adds hide thread feature to iichan
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-hide-threads.meta.js
// @author       Cirno
// @match        http://iichan.hk/*
// @match        https://iichan.hk/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  /*
  Сколько первых символов из поста показывать в заголовке скрытого треда
  */
  const THREAD_TITLE_LENGTH = 50;

  const LOCALSTORAGE_KEY = 'iichan_hidden_threads';
  const HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
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
    const label = thread.querySelector(':scope > label');
    if (!label) return;
    const btn = document.createElement('span');
    btn.title = 'Скрыть тред';
    btn.classList.add(HIDE_BTN_CLASSNAME);
    btn.dataset.threadId = thread.id;
    btn.addEventListener('click', hideThread);
    thread.insertBefore(btn, label.nextSibling);  // insert after
  };

  const addToggleBtn = (thread) => {
    //catalog only
    if (!thread) return;
    const btn = document.createElement('div');
    btn.title = 'Скрыть тред';
    btn.classList.add(HIDE_BTN_CLASSNAME, 'reply');
    btn.dataset.threadId = thread.id;
    btn.addEventListener('click', toggleThread);
    thread.querySelector('.catthread').appendChild(btn);
  };

  const addPlaceholder = (thread) => {
    if (!thread) return;
    const threadNo = thread.id.split('-').pop();
    let threadTitle = thread.querySelector('.filetitle').innerText ||
      thread.querySelector('blockquote').innerText;
    threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
    const placeholderId = 'iichan-hidden-' + thread.id;
    thread.insertAdjacentHTML('beforebegin', `
      <div class="reply ${PLACEHOLDER_CLASSNAME}" id="${placeholderId}">Тред <a>№${threadNo}</a> скрыт (${threadTitle || 'изображение'})</div>
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
    const threadId = e.target ? e.target.dataset.threadId : e;
    setThreadHidden(threadId, false);

    const thread = document.getElementById(threadId);
    if(!thread) return;
    thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
    const placeholder = document.getElementById('iichan-hidden-' + threadId);
    if (placeholder) {
      placeholder.parentElement.removeChild(placeholder);
    }
  };

  const hideThread = (e) => {
    const threadId = e.target ? e.target.dataset.threadId : e;
    setThreadHidden(threadId, true);

    const thread = document.getElementById(threadId);
    if(!thread || !thread.parentNode) return;
    thread.classList.add(HIDDEN_THREAD_CLASSNAME);
    const catalogMode = !!document.querySelector('.catthreadlist');
    if (!catalogMode) {
      addPlaceholder(thread);
    }
  };

  const toggleThread = (e) => {
    // for catalog only
    const threadId = e.target ? e.target.dataset.threadId : e;
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
        }
        
        .${HIDE_BTN_CLASSNAME}::after {
            content: '[✕]';
        }
        
        .catthreadlist a {
          position: relative;
          transition: all .3s ease-in-out;
        }
        
        .catthreadlist .${HIDDEN_THREAD_CLASSNAME} {
          opacity: .6;
        }
        
        .catthreadlist .${HIDDEN_THREAD_CLASSNAME}:not(:hover) {
          opacity: .2;
          filter: blur(1px);
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
          width: 25px;
          height: 25px;
        }
        
        .catthreadlist .${HIDDEN_THREAD_CLASSNAME} .${HIDE_BTN_CLASSNAME}::after {
          content: '[┼]';
        }
      </style>`);
  };

  const init = () => {
    if (document.querySelector('#de-main')) return;
    if (document.querySelector('body.replypage')) return;
    appendCSS();
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
    };
  }
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
