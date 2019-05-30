const init = () => {
  const dayRegexp = new RegExp(/(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s/, 'i');
  
  const checkDate = (text) => {
    const day = text.match(dayRegexp);
    if (!day || day.length < 1) {
      return false;  // date not found
    }
    if (day[1] === '<%= SPECIAL_DAY %>') {
      return false;  // don't change name on this day
    }
    return true;
  };

  const cirnify = (node) => {
    const labels = node.querySelectorAll('label');
    for (const label of labels) {
      const namespan = label.querySelector('<%= NAME_QUERY %>');
      if (!namespan) {
        continue;
      }
      if (!checkDate(label.innerText)) {
        console.log(label.innerText, false);
        continue;
      }
      console.log(label.innerText, true);
      namespan.innerHTML = '<%= NAME %>';
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
