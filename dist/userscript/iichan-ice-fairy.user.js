// ==UserScript==
// @name         Cirno forever
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.1
// @description  Sets Cirno as default name in /b/
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-ice-fairy.user.js
// @author       Cirno
// @match        http://iichan.hk/b/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const NAME = 'Сырно';

  function init() {
    let namespans = document.querySelectorAll('.postername, .commentpostername');

    for (let ns of namespans) {
      ns.innerHTML = NAME;
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
