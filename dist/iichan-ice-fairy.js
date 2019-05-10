(() => {
const init = () => {
  const cirnify = (node) => {
    const labels = node.querySelectorAll('label');
    for (const label of labels) {
      const namespan = label.querySelector('.postername, .commentpostername');
      if (!namespan) {
        continue;
      }
      const day = label.innerText.match(/(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s/);
      if (day.length < 1 || day[1] === 'Пн') {
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