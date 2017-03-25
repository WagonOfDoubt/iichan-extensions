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
