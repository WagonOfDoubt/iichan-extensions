// ==UserScript==
// @name         Hide threads on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.1
// @description  Adds hide thread feature to iichan
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/iichan-hide-threads.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var THREAD_TITLE_LENGTH = 50;  // Сколько первых символов из поста показывать в заголовке скрытого треда
    var HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
    var PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
    var HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
    var HIDE_BTN_CONTENT = '[-]';
    var HIDE_BTN_TITLE = 'Скрыть тред';
    var LOCALSTORAGE_KEY = 'iichan_hidden_threads';

    function getHiddenThreads() {
        return JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || '[]');
    }

    function setHiddenThreads(hiddenThreads) {
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hiddenThreads));
    }

    function addHideBtns() {
        var threads = document.querySelectorAll('[id^=thread]');
        for (var i = threads.length - 1; i >= 0; i--) {
            var thread = threads[i];
            var label = thread.querySelector('label');
            if (!label) {
                continue;
            }
            var btn = document.createElement('a');
            btn.innerHTML = HIDE_BTN_CONTENT;
            btn.classList.add(HIDE_BTN_CLASSNAME);
            btn.title = HIDE_BTN_TITLE;
            btn.threadId = thread.id;
            btn.addEventListener('click', function() {
                hideThread(this.threadId);
            });
            thread.insertBefore(btn, label.nextSibling);
        }
    }

    function unHideThread(threadId) {
        var hiddenThreads = getHiddenThreads();
        var index = hiddenThreads.indexOf(threadId);
        if (index === -1) {
            return;
        }
        hiddenThreads.splice(index, 1);
        setHiddenThreads(hiddenThreads);

        var thread = document.getElementById(threadId);
        if(!thread) {
            return;
        }
        thread.classList.remove(HIDDEN_THREAD_CLASSNAME);
        var placeholder = document.getElementById('iichan-hidden-' + threadId);
        if (placeholder) {
            placeholder.parentElement.removeChild(placeholder);
        }
    }

    function hideThread(threadId) {
        var thread = document.getElementById(threadId);
        if(!thread) {
            return;
        }
        var parent = thread.parentNode;
        var threadHiddenDiv = document.createElement('div');
        var threadNo = threadId.split('-')[1];
        var threadTitle = thread.querySelector('.filetitle').innerText || thread.querySelector('blockquote').innerText || 'картинка';
        threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
        threadHiddenDiv.innerHTML = 'Тред <a>№' + threadNo + '</a> скрыт (' + threadTitle + ')';
        threadHiddenDiv.id = 'iichan-hidden-' + threadId;
        threadHiddenDiv.classList.add('reply');
        threadHiddenDiv.classList.add(PLACEHOLDER_CLASSNAME);
        threadHiddenDiv.addEventListener('click', function() {unHideThread(threadId);});
        thread.classList.add(HIDDEN_THREAD_CLASSNAME);
        parent.insertBefore(threadHiddenDiv, thread);

        // save result
        var hiddenThreads = getHiddenThreads();
        if (hiddenThreads.indexOf(threadId) === -1) {
            hiddenThreads.push(threadId);
            setHiddenThreads(hiddenThreads);
        }
    }

    function hideAllHiddenThreads() {
        var hiddenThreads = getHiddenThreads();
        for (var i = hiddenThreads.length - 1; i >= 0; i--) {
            hideThread(hiddenThreads[i]);
        }
    }

    function appendCSS() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML =
'.' + PLACEHOLDER_CLASSNAME + ' {' +
'   pointer-events: none;' +
'}' +
'.' + PLACEHOLDER_CLASSNAME + ' a {' +
'   cursor: pointer;' +
'   pointer-events: auto;' +
'}' +
'.' + PLACEHOLDER_CLASSNAME + ':hover + div,' +
'.' + PLACEHOLDER_CLASSNAME + ':hover + div + br {' +
'   display: block !important;' +
'}' +
'.' + HIDDEN_THREAD_CLASSNAME + ' {' +
'   display: none;' +
'}' +
'.' + HIDDEN_THREAD_CLASSNAME + ' + br {' +
'   display: none;' +
'}' +
'.' + HIDE_BTN_CLASSNAME + ' {' +
'   margin-left: 0.2em;' +
'   cursor: pointer;' +
'}';
        document.head.appendChild(css);
    }

    function init() {
        // element.classList is required
        if (!('classList' in Element.prototype)) {
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