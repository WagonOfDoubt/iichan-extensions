const captcha = {
  key: 'mainpage',
  dummy: '',
  url: '/cgi-bin/captcha1.pl/b/',
};

const { quickReplyContainer, postformContainer } = (() => {
  const quickReplyContainer = document.createElement('table');
    quickReplyContainer.insertAdjacentHTML('beforeend', `
        //=include quick-reply-container.html
      `);
    quickReplyContainer.id = '<%= CONTAINER_ID %>';
    const hideFormBtn = quickReplyContainer.querySelector('.<%= CLOSE_FORM_BTN_CLASSNAME %>');
    hideFormBtn.addEventListener('click', (e) => movePostform(null, true));
    const postformContainer = quickReplyContainer.querySelector('.<%= FORM_CONTAINER_CLASSNAME %>');
    return { quickReplyContainer, postformContainer };
})();

const quickReplyShowFormBtn = (() => {
  const btn = document.createElement('a');
  btn.classList.add('<%= SHOW_FORM_BTN_CLASSNAME %>');
  return btn;
})();

const hiddenParentInput = (() => {
  const inp = document.createElement('input');
  inp.setAttribute('type', 'hidden');
  inp.setAttribute('name', 'parent');
  return inp;
})();

const updateCaptcha = () => {
  const img = document.querySelector('#captcha');
  if (!img) {
    return;
  }
  const { url, key, dummy } = captcha;
  img.src = `${url}?key=${key}&dummy=${dummy}&${Math.random()}`;
};

const updateCaptchaParams = (parentThread) => {
  if (!parentThread) {
    captcha.key = 'mainpage';
    captcha.dummy = '';
  } else {
    const opRef = parentThread.id.substr('thread-'.length);
    const lastReply = parentThread.querySelector('table:last-child .reply');
    const lastRef = lastReply ? lastReply.id.substr('reply'.length) : opRef;
    captcha.key = `res${opRef}`;
    captcha.dummy = lastRef;
  }
  updateCaptcha();
};

const setParentInputValue = (postform, value) => {
  const threadIdSpan = quickReplyContainer.querySelector('.<%= FORM_HEADER_THREAD_NUM_CLASSNAME %>');
  if (threadIdSpan) {
    threadIdSpan.textContent = value || '';
  }
  let inp = postform.querySelector('[name=parent]');
  if (!value) {
    if (inp) {
      postform.removeChild(inp);
    }
    return;
  }

  if (!inp) {
    inp = hiddenParentInput;
    postform.appendChild(inp);
  }

  inp.setAttribute('value', value);
};

const findParent = (child, parentSelector) => {
  let parent = child;
  while (parent && parent !== document && !parent.matches(parentSelector)) {
    parent = parent.parentNode;
  }
  if (parent === document) {
    return null;
  }
  return parent;
};

const addReflinkAndFocus = (reflink) => {
  const textarea = document.querySelector('[name=nya4]');
  if (!textarea) {
    return;
  }
  textarea.focus(false);
  if (reflink) {
    reflink = `>>${reflink}\n`;
    if (!textarea.value.endsWith(reflink)) {
      if (textarea.value.length && !textarea.value.endsWith('\n')) {
        reflink = '\n' + reflink;
      }
      textarea.setRangeText(reflink, textarea.textLength, textarea.textLength, 'end');
    }
  }
};

const placePostareaButton = () => {
  const postarea = document.querySelector('.postarea');
  if (postarea) {
    postarea.appendChild(quickReplyShowFormBtn);
  }
  const theader = document.querySelector('body > .theader');
  if (theader) {
    theader.style.display = 'none';
  }
};

const placeFormAfterReply = (postform, replyTo) => {
  const replyContainer = findParent(replyTo, 'table');
  const parentThread = findParent(replyTo, '[id^=thread]');
  if (!replyContainer || !parentThread) {
    return;
  }
  const opRef = parentThread.id.substr('thread-'.length);
  const ref = replyTo.id.substr('reply'.length);

  postformContainer.appendChild(postform);
  replyContainer.parentNode.insertBefore(quickReplyContainer, replyContainer.nextSibling);

  placePostareaButton();
  setParentInputValue(postform, opRef);
  updateCaptchaParams(parentThread);
  addReflinkAndFocus(ref);
};

const placeFormAfterOp = (postform, replyTo) => {
  const firstReply = replyTo.querySelector('table');
  const ref = replyTo.id.substr('thread-'.length);
  
  postformContainer.appendChild(postform);
  replyTo.insertBefore(quickReplyContainer, firstReply);
  
  placePostareaButton();
  setParentInputValue(postform, ref);
  updateCaptchaParams(replyTo);
  addReflinkAndFocus(ref);
};

const placeFormAtPostarea = (postform, focus) => {
  const postarea = document.querySelector('.postarea');
  // append postfrom to postarea
  if (postarea) {
    postarea.appendChild(postform);
    if (focus) {
      addReflinkAndFocus();
    }
  }
  // remove table.reply
  if (quickReplyContainer.parentNode) {
    quickReplyContainer.parentNode.removeChild(quickReplyContainer);
  }
  // remove button from postarea
  if (quickReplyShowFormBtn.parentNode) {
    const theader = document.querySelector('body > .theader');
    if (theader) {
      theader.style.display = null;
    }
    quickReplyShowFormBtn.parentNode.removeChild(quickReplyShowFormBtn);
  }
  // reset form parent value
  if (document.body.classList.contains('replypage')) {
    // reply to thread
    const parentThread = document.querySelector('[id^=thread]');
    const opRef = parentThread.id.substr('thread-'.length);
    setParentInputValue(postform, opRef);
    updateCaptchaParams(parentThread);
  } else {
    // create thread
    setParentInputValue(postform, null);
    updateCaptchaParams();
  }
};

const movePostform = (replyTo, closeQuickReply) => {
  const postform = document.querySelector('#postform');
  if (!postform) {
    return;
  }

  // replyTo === null => return postform to default position
  if (!replyTo) {
    postform.dataset.replyTo = '';
    placeFormAtPostarea(postform, !closeQuickReply);
  // already at same post => return to default, no focus
  } else if (postform.dataset.replyTo === replyTo.id) {
    postform.dataset.replyTo = '';
    placeFormAtPostarea(postform, false);
  // replyTo is reply (not OP)
  } else if (replyTo.classList.contains('reply')) {
    postform.dataset.replyTo = replyTo.id;
    placeFormAfterReply(postform, replyTo);
  // replyTo is thread (OP)
  } else {
    postform.dataset.replyTo = replyTo.id;
    placeFormAfterOp(postform, replyTo);
  }
};

const onQuickReplyClick = (e) => {
  let btn = e.target;
  while (btn && !btn.classList.contains('<%= BTN_CLASSNAME %>')) {
    btn = btn.parentElement;
  }
  if (btn) {
    const afterReply = document.getElementById(btn.dataset.postId);
    movePostform(afterReply);
  }
  e.preventDefault();
};

const addReplyBtn = (reply) => {
  if (!reply) return;
  const label = reply.querySelector(':scope > .reflink');
  if (!label) return;
  label.insertAdjacentHTML('afterend', `
    //=include quick-reply-btn.html
  `);
  const btn = reply.querySelector('.<%= BTN_CLASSNAME %>');
  btn.addEventListener('click', onQuickReplyClick);
};

const processNodes = (rootNode) => {
  const replies = (rootNode || document).querySelectorAll('.reply, [id^=thread]');
  for (const reply of replies) {
    addReplyBtn(reply);
  }
};

const appendCSS = () => {
  document.head.insertAdjacentHTML('beforeend',
    `<style type="text/css">
      //=include quick-reply.css
    </style>`);
};

<% if (USERSCRIPT) { %>
const appendHTML = () => {
  const iconsContainer = `<div id="<%= ICONS_CONTAINER_ID %>">
    //=include quick-reply-icons.svg
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};
<% } %>

const init = () => {
  if (document.querySelector('#de-main')) return;
  const captchaImg = document.querySelector('#captcha');
  // get captcha root url
  if (captchaImg) {
    captcha.url = captchaImg.getAttribute('src').match(/[^\?]*/)[0];
  }
  // remove default captcha update handler
  const captchaLink = document.querySelector('input[name=captcha] + a');
  if (captchaLink) {
    captchaLink.removeAttribute('onclick');
    captchaLink.addEventListener('click', (e) => {
      updateCaptcha();
      e.preventDefault();
    });
  }
  if (document.body.classList.contains('replypage')) {
    const parentThread = document.querySelector('[id^=thread]');
    updateCaptchaParams(parentThread);
  } else {
    updateCaptchaParams();
  }
  appendCSS();
  <% if (USERSCRIPT) { %>
  appendHTML();
  <% } %>
  processNodes();
  quickReplyShowFormBtn.addEventListener('click', (e) => {
    movePostform();
    e.preventDefault();
  });
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
          if (!node.querySelectorAll) return;
          processNodes(node);
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
