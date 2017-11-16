// ==UserScript==
// @name         Cirno forever
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.2
// @description  Sets Cirno as default name in /b/
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-ice-fairy.user.js
// @author       Cirno
// @match        http://iichan.hk/b/*
// @match        https://iichan.hk/b/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  const NAME = 'Сырно';
  const NAME_QUERY = '.postername, .commentpostername';
  const SPECIAL_DAY = 'Пн';

  const init = () => {
    const cirnify = (node) => {
      const labels = node.querySelectorAll('label');
      for (const label of labels) {
        const namespan = label.querySelector(NAME_QUERY);
        if (!namespan) {
          continue;
        }
        const day = label.innerText.match(/(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s/);
        if (day.length < 1 || day[1] === SPECIAL_DAY) {
          continue;
        }
        namespan.innerHTML = NAME;
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          cirnify(node);
        }
      });
    });

    cirnify(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
