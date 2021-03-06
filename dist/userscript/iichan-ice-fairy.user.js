// ==UserScript==
// @name         [IIchan] Cirno 4ever
// @namespace    http://iichan.hk/
// @license      MIT
// @version      9
// @description  Sets Cirno as default name in /b/
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-ice-fairy.meta.js
// @author       Cirno
// @match        http://iichan.hk/b/*
// @match        https://iichan.hk/b/*
// @grant        none
// ==/UserScript==

(() => {
const init = () => {
  const dayRegexp = new RegExp(/(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s/, 'i');
  
  const checkDate = (text) => {
    const day = text.match(dayRegexp);
    if (!day || day.length < 1) {
      return false;  // date not found
    }
    if (day[1] === 'Пн') {
      return false;  // don't change name on this day
    }
    return true;
  };

  const cirnify = (node) => {
    const labels = node.querySelectorAll('label');
    for (const label of labels) {
      const namespan = label.querySelector('.postername, .commentpostername');
      if (!namespan) {
        continue;
      }
      if (!checkDate(label.innerText)) {
        continue;
      }
      namespan.innerHTML = 'Сырно';
    }
  };
  cirnify(document.body);
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          cirnify(node);
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