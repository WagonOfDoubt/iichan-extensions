// ==UserScript==
// @name         [IIchan] English captcha
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Fixes non-english keyboard layout for captcha input
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-eng-captcha.meta.js
// @author       Cirno
// @match        http://iichan.hk/*
// @match        https://iichan.hk/*
// @grant        none
// ==/UserScript==

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
