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
    var LOCALSTORAGE_KEY = 'iichan_hidden_threads';
    var HIDDEN_THREAD_CLASSNAME = 'iichan-thread-hidden';
    var HIDE_BTN_CLASSNAME = 'iichan-hide-thread-btn';
    var HIDE_BTN_TEMPLATE = '<a class="' + HIDE_BTN_CLASSNAME + '" title="Скрыть тред">[-]</a>';  // лучше [x]?
    var PLACEHOLDER_CLASSNAME = 'iichan-hidden-thread-placeholder';
    var PLACEHOLDER_NO_TEXT = 'картинка';
    var PLACEHOLDER_TEMPLATE = function(id, no, msg) {
        return '<div class="reply ' + PLACEHOLDER_CLASSNAME + '" id="' + id + '">Тред <a>№' + no + '</a> скрыт (' + msg + ')</div>';
    };

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
            var label = thread.querySelector(':scope > label');
            if (!label) {
                continue;
            }
            label.insertAdjacentHTML('afterend', HIDE_BTN_TEMPLATE);
            var btn = label.nextElementSibling;
            btn.threadId = thread.id;
            btn.addEventListener('click', hideThread);
        }
    }

    function unhideThread(e) {
        var threadId = typeof e === 'object' ? e.target.threadId : e;
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

    function hideThread(e) {
        var threadId = typeof e === 'object' ? e.target.threadId : e;
        var thread = document.getElementById(threadId);
        if(!thread || !thread.parentNode) {
            return;
        }

        var threadNo = threadId.split('-')[1];
        var threadTitle = thread.querySelector('.filetitle').innerText ||
            thread.querySelector('blockquote').innerText ||
            PLACEHOLDER_NO_TEXT;
        threadTitle = threadTitle.substr(0, THREAD_TITLE_LENGTH);
        var placeholderId = 'iichan-hidden-' + threadId;
        thread.insertAdjacentHTML('beforebegin', PLACEHOLDER_TEMPLATE(placeholderId, threadNo, threadTitle));
        var placeholderBtn = thread.previousElementSibling.querySelector(':scope > a');
        placeholderBtn.threadId = threadId;
        placeholderBtn.addEventListener('click', unhideThread);

        thread.classList.add(HIDDEN_THREAD_CLASSNAME);
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
        document.head.insertAdjacentHTML('beforeend', '<style type="text/css">' +
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
                                         '}</style>');
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
