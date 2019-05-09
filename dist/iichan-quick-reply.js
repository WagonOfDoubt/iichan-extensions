(() => {
const QUICK_REPLY_BTN_CLASSNAME = 'iichan-quick-reply-btn';
const QICK_REPLY_BTN_TITLE = 'Быстрый ответ';
const QUICK_REPLY_CONTAINER_ID = 'iichan-quick-reply-container';
const QUICK_REPLY_FORM_CONTAINER_CLASSNAME = 'iichan-postform-container';
const QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME = 'iichan-quick-reply-show-form-btn';

const captcha = {
  key: 'mainpage',
  dummy: '',
  url: '/cgi-bin/captcha1.pl/b/',
};

const { quickReplyContainer, postformContainer } = (() => {
  const quickReplyContainer = document.createElement('table');
    quickReplyContainer.insertAdjacentHTML('beforeend', `
        <tr>
        	<td class="doubledash">&gt;&gt;</td>
        	<td class="${QUICK_REPLY_FORM_CONTAINER_CLASSNAME} reply"></td>
        </tr>
        
      `);
    quickReplyContainer.id = QUICK_REPLY_CONTAINER_ID;
    const postformContainer = quickReplyContainer.querySelector('.' + QUICK_REPLY_FORM_CONTAINER_CLASSNAME);
    return { quickReplyContainer, postformContainer };
})();

const quickReplyShowFormBtn = (() => {
  const btn = document.createElement('a');
  btn.classList.add(QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME);
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

const movePostform = (replyTo) => {
  const postform = document.querySelector('#postform');
  if (!postform) {
    return;
  }

  // replyTo === null => return postform to default position
  if (!replyTo) {
    postform.dataset.replyTo = '';
    placeFormAtPostarea(postform, true);
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
  while (btn && !btn.classList.contains(QUICK_REPLY_BTN_CLASSNAME)) {
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
    <div class="${QUICK_REPLY_BTN_CLASSNAME}" title="${QICK_REPLY_BTN_TITLE}" data-post-id="${reply.id}">
      <svg>
        <use class="iichan-icon-reply-use" xlink:href="#iichan-icon-reply" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `);
  const btn = reply.querySelector(`.${QUICK_REPLY_BTN_CLASSNAME}`);
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
      .${QUICK_REPLY_BTN_CLASSNAME} {
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-top;
      }
      
      .${QUICK_REPLY_BTN_CLASSNAME} > svg {
        width: 16px;
        height: 16px;
      }
      
      .${QUICK_REPLY_BTN_CLASSNAME} use {
        pointer-events: none;
      }
      
      .replypage .${QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME}::after {
        content: '[Показать форму ответа]';
      }
      
      .${QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME}::after {
        content: '[Создать тред]';
      }
      
      .${QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME},
      .${QUICK_REPLY_BTN_CLASSNAME} {
        cursor: pointer;
      }
      
      #${QUICK_REPLY_CONTAINER_ID} .rules {
        display: none;
      }
      
    </style>`);
};

const appendHTML = () => {
  const icons = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="iichan-icon-reply" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="M 8,0.98745 A 7.0133929,5.9117254 0 0 0 0.986328,6.89859 7.0133929,5.9117254 0 0 0 3.037109,11.07043 L 1.835937,15.01255 6.230469,12.61078 A 7.0133929,5.9117254 0 0 0 8,12.80973 7.0133929,5.9117254 0 0 0 15.013672,6.89859 7.0133929,5.9117254 0 0 0 8,0.98745 Z"/>
      </symbol>
    </svg>
  `;
  const iconsContainer = `<div id="iichan-quick-reply-icons">
    ${icons}
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};

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
  appendHTML();
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

})();