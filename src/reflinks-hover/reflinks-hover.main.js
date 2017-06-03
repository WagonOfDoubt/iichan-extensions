(function() {
  'use strict';

  const POPUP_OFFSET = {x: 5, y: 5};

  function appendCSS() {
    document.head.insertAdjacentHTML('beforeend',
      `<style type="text/css">
        //= include reflinks-hover.css
      </style>`);
  }

  function init() {
    let currentPopup = null;
    const onHover = (event) => {
      if (document.querySelector('#de-main')) {
        return;
      }
      const postId = event.target.innerText.match(/\d+/).toString();
      const post = document.querySelector(`#reply${ postId }`);
      if (!post) {
        return;
      }
      currentPopup = document.createElement('div');
      currentPopup.innerHTML = post.innerHTML;
      currentPopup.classList.add('reply');
      currentPopup.classList.add('reply-popup');
      currentPopup.style.position = 'fixed';
      currentPopup.style.left = (event.clientX + POPUP_OFFSET.x) + 'px';
      currentPopup.style.top = (event.clientY + POPUP_OFFSET.y) + 'px';
      document.body.appendChild(currentPopup);
    };
    const onLeave = (event) => {
      if (document.querySelector('#de-main')) {
        return;
      }
      if (currentPopup) {
        document.body.removeChild(currentPopup);
        currentPopup = null;
      }
    };
    const onMove = (event) => {
      if (document.querySelector('#de-main')) {
        return;
      }
      if (currentPopup) {
        currentPopup.style.left = (event.clientX + POPUP_OFFSET.x) + 'px';
        currentPopup.style.top = (event.clientY + POPUP_OFFSET.y) + 'px';
      }
    };
    if (document.querySelector('#de-main')) {
      return;
    }
    const reflinks = document.querySelectorAll('a[onclick^="highlight"]');
    if (!reflinks.length) {
      return;
    }
    appendCSS();
    for (let link of reflinks) {
      link.addEventListener('mouseenter', onHover);
      link.addEventListener('mouseleave', onLeave);
      link.addEventListener('mousemove', onMove);
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
