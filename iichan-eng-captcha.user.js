// ==UserScript==
// @name         English captcha input language on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.1
// @description  Fixes non-english keyboard layout for captcha input
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/iichan-eng-captcha.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function init() {
        var input = document.querySelector('input[name=captcha]');
        if (!input) {
            return;
        }
        input.addEventListener('keypress', function(e) {
            // copypasta from https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/blob/master/src/Dollchan_Extension_Tools.es6.user.js
            var ruUa = 'йцукенгшщзхъїфыівапролджэєячсмитьбюёґ',
                en = 'qwertyuiop[]]assdfghjkl;\'\'zxcvbnm,.`\\';
            var i, code = e.charCode || e.keyCode,
                chr = String.fromCharCode(code).toLowerCase();
            if(code < 0x0410 || code > 0x04FF || (i = ruUa.indexOf(chr)) === -1) {
                return;
            }
            chr = en[i];
            var el = e.target;
            var txt = chr;
            var scrtop = el.scrollTop;
            var start = el.selectionStart;
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
