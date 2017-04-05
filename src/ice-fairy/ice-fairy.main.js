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
