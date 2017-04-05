(function() {
  'use strict';
  const NAME = 'Сырно';
  const NAME_QUERY = '.postername, .commentpostername';

  function init() {
    function cirnify(node) {
      let namespans = node.querySelectorAll(NAME_QUERY);
      for (let ns of namespans) {
        ns.innerHTML = NAME;
      }
    }

    let observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (let node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          cirnify(node);
        }
      });
    });

    cirnify(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
