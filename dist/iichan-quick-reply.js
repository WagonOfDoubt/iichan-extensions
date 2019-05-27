(() => {
const captcha = {
  main: {
    key: 'mainpage',
    dummy: '',
    url: '/cgi-bin/captcha1.pl/b/',    
  },
  quick: {
    key: 'mainpage',
    dummy: '',
    url: '/cgi-bin/captcha1.pl/b/',    
  }
};

const { quickReplyContainer, quickPostformContainer } = (() => {
  const quickReplyContainer = document.createElement('table');
  quickReplyContainer.insertAdjacentHTML('beforeend', `
      <tr>
      	<td class="doubledash">&gt;&gt;</td>
      	<td class="iichan-postform-container reply">
         <div class="theader">Ответ в тред №<span class="iichan-quick-reply-thread"></span><div class="iichan-quick-reply-close-form-btn" title="Закрыть форму"><svg>
          <use class="iichan-icon-form-close-use" xlink:href="/extras/icons.svg#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
        </svg></div></div>
        </td>
      </tr>
      
    `);
  quickReplyContainer.id = 'iichan-quick-reply-container';
  const hideFormBtn = quickReplyContainer.querySelector('.iichan-quick-reply-close-form-btn');
  hideFormBtn.addEventListener('click', (e) => movePostform(null));
  const quickPostformContainer = quickReplyContainer.querySelector('.iichan-postform-container');
  return { quickReplyContainer, quickPostformContainer };
})();

const getMainForm = (() => {
  let mainForm;
  return () => {
    if (!mainForm) {
      mainForm = document.getElementById('postform');
    }
    return mainForm;
  };
})();

const getQuickReplyForm = (() => {
  let quickReplyForm;
  return () => {
    if (!quickReplyForm) {
      const postform = getMainForm();
      quickReplyForm = postform.cloneNode(true);  // deep clone
      quickReplyForm.id = 'iichan-quick-reply-form';
      const quickCaptcha = quickReplyForm.querySelector('#captcha');
      if (quickCaptcha) {
        quickCaptcha.id = 'iichan-quick-reply-captcha';
      }
      addUpdateCaptchaListener(quickReplyForm);
      if (document.body.classList.contains('replypage')) {
        quickReplyForm.addEventListener('change', syncForms);
        quickReplyForm.addEventListener('input', syncForms);
      }
      quickPostformContainer.appendChild(quickReplyForm);
    }
    return quickReplyForm;
  };
})();

const hiddenParentInput = (() => {
  const inp = document.createElement('input');
  inp.setAttribute('type', 'hidden');
  inp.setAttribute('name', 'parent');
  return inp;  // kaeritai
})();

const addUpdateCaptchaListener = (form) => {
  const captchaLink = form.querySelector('input[name=captcha] + a');
  if (captchaLink) {
    captchaLink.removeAttribute('onclick');
    captchaLink.addEventListener('click', (e) => {
      updateCaptcha();
      e.preventDefault();
    });
  }
};

const getCaptchaImageUrl = (captchaOpts) => {
  const { url, key, dummy } = captchaOpts;
  return `${url}?key=${key}&dummy=${dummy}&${Math.random()}`;
};

const updateCaptcha = () => {
  const quickCaptchaImg = document.getElementById('iichan-quick-reply-captcha');
  const mainCaptchaImg = document.getElementById('captcha');
  const quickCaptchaUrl = getCaptchaImageUrl(captcha.quick);
  if (quickCaptchaImg) {
    quickCaptchaImg.src = quickCaptchaUrl;
  }
  if (mainCaptchaImg) {
    if (captcha.quick.key === captcha.main.key) {
      mainCaptchaImg.src = quickCaptchaUrl;
    } else {
      mainCaptchaImg.src = getCaptchaImageUrl(captcha.main);
    }    
  }
};

const updateCaptchaParams = (parentThread) => {
  if (!parentThread) {
    captcha.quick.key = 'mainpage';
    captcha.quick.dummy = '';
  } else {
    const opRef = parentThread.id.substr('thread-'.length);
    const lastReply = parentThread.querySelector('table:last-child .reply');
    const lastRef = lastReply ? lastReply.id.substr('reply'.length) : opRef;
    captcha.quick.key = `res${opRef}`;
    captcha.quick.dummy = lastRef;
  }
  updateCaptcha();
};

const setParentInputValue = (postform, value) => {
  const threadIdSpan = quickReplyContainer.querySelector('.iichan-quick-reply-thread');
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

const addReflinkAndFocus = (postform, reflink) => {
  const textarea = postform && postform.querySelector('[name=nya4]');
  if (!textarea) {
    return;
  }
  textarea.focus();
  if (reflink) {
    reflink = `>>${reflink}\n`;
    if (!textarea.value.endsWith(reflink)) {
      if (textarea.value.length && !textarea.value.endsWith('\n')) {
        reflink = '\n' + reflink;
      }
      textarea.setRangeText(reflink, textarea.textLength, textarea.textLength, 'end');
    }
  }
  syncForms(textarea);
};

const placeQuickReplyFormAfterReply = (replyTo) => {
  const quickReplyForm = getQuickReplyForm();
  const replyContainer = findParent(replyTo, 'table');
  const parentThread = findParent(replyTo, '[id^=thread]');
  if (!replyContainer || !parentThread) {
    return;
  }
  const opRef = parentThread.id.substr('thread-'.length);
  const ref = replyTo.id.substr('reply'.length);

  replyContainer.parentNode.insertBefore(quickReplyContainer, replyContainer.nextSibling);

  setParentInputValue(quickReplyForm, opRef);
  updateCaptchaParams(parentThread);
  addReflinkAndFocus(quickReplyForm, ref);
};

const placeQuickReplyFormAfterOp = (replyTo) => {
  const quickReplyForm = getQuickReplyForm();
  const firstReply = replyTo.querySelector('table');
  const ref = replyTo.id.substr('thread-'.length);
  
  replyTo.insertBefore(quickReplyContainer, firstReply);
  
  setParentInputValue(quickReplyForm, ref);
  updateCaptchaParams(replyTo);
  addReflinkAndFocus(quickReplyForm, ref);
};

const closeQuickReplyForm = () => {
  if (!quickReplyContainer.parentNode) {
    return;
  }
  quickReplyContainer.parentNode.removeChild(quickReplyContainer);
};

const movePostform = (replyTo) => {
  const quickReplyForm = getQuickReplyForm();

  // replyTo === null OR already at same post => close quick reply form
  if (!replyTo || quickReplyForm.dataset.replyTo === replyTo.id) {
    quickReplyForm.dataset.replyTo = '';
    closeQuickReplyForm();
  // replyTo is reply (not OP)
  } else if (replyTo.classList.contains('reply')) {
    quickReplyForm.dataset.replyTo = replyTo.id;
    placeQuickReplyFormAfterReply(replyTo);
  // replyTo is thread (OP)
  } else {
    quickReplyForm.dataset.replyTo = replyTo.id;
    placeQuickReplyFormAfterOp(replyTo);
  }
};

const syncForms = (e) => {
  const sourceInput = e instanceof Event ? e.target : e;
  const quickReplyForm = getQuickReplyForm();
  const mainForm = getMainForm();
  const targetForm = quickReplyForm.contains(sourceInput) ? mainForm : quickReplyForm;
  const sourceForm = quickReplyForm.contains(sourceInput) ? quickReplyForm : mainForm;
  const targetInput = targetForm[sourceInput.name];
  const inputType = sourceInput.type;
  if (!targetInput) {
    return;
  }
  if (inputType === 'radio') {
    const sourceGroup = sourceForm[sourceInput.name];
    targetInput.value = sourceGroup.value;
  } else if (inputType === 'checkbox') {
    targetInput.checked = sourceInput.checked;
  } else if (inputType === 'file') {
    // might not work in all browsers
    const newFileInput = sourceInput.cloneNode();
    const parent = targetInput.parentElement;
    parent.removeChild(targetInput);
    parent.insertBefore(newFileInput, parent.firstChild);
  } else {
    targetInput.value = sourceInput.value;
  }
};

const onQuickReplyClick = (e) => {
  let btn = e.target;
  while (btn && !btn.classList.contains('iichan-quick-reply-btn')) {
    btn = btn.parentElement;
  }
  if (btn) {
    const afterReply = document.getElementById(btn.dataset.postId);
    movePostform(afterReply);
  }
  e.preventDefault();
};

const onReflinkClick = (e) => {
  let ref = '';
  const reply = findParent(e.target, '.reply');
  const thread = findParent(e.target, '[id^=thread]');
  if (reply) {
    ref = reply.id.substr('reply'.length);
  } else if (thread) {
    ref = thread.id.substr('thread-'.length);
  }
  if (ref) {
    if (quickReplyContainer.parentNode) {
      const quickReplyForm = getQuickReplyForm();
      addReflinkAndFocus(quickReplyForm, ref);
    } else if (document.body.classList.contains('replypage')) {
      const postform = getMainForm();
      addReflinkAndFocus(postform, ref);
    } else {
      const afterReply = reply || thread;
      movePostform(afterReply);
    }
  }
  e.preventDefault();
};

const addReplyBtn = (reply) => {
  if (!reply) return;
  const label = reply.querySelector(':scope > .reflink');
  if (!label) return;
  label.insertAdjacentHTML('afterend', `
    <div class="iichan-quick-reply-btn" title="Быстрый ответ" data-post-id="${ reply.id }">
      <svg>
        <use class="iichan-icon-reply-use" xlink:href="/extras/icons.svg#iichan-icon-reply" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `);
  const btn = reply.querySelector('.iichan-quick-reply-btn');
  btn.addEventListener('click', onQuickReplyClick);
  const labelLink = label.querySelector('a');
  if (!labelLink) return;
  labelLink.addEventListener('click', onReflinkClick);
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
      .iichan-quick-reply-btn {
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-top;
      }
      
      .iichan-quick-reply-btn > svg {
        width: 16px;
        height: 16px;
      }
      
      .iichan-quick-reply-btn use {
        pointer-events: none;
      }
      
      .iichan-quick-reply-btn {
        cursor: pointer;
      }
      
      #iichan-quick-reply-container .rules {
        display: none;
      }
      
      #iichan-quick-reply-icons {
        display: none;
      }
      
      .iichan-postform-container .theader {
        width: auto;
      }
      
      .iichan-quick-reply-close-form-btn {
        float: right;
        cursor: pointer;
        padding: 1px;
      }
      
      .iichan-quick-reply-close-form-btn svg {
        width: 16px;
        height: 16px;
        vertical-align: text-top;
      }
      
      .iichan-quick-reply-close-form-btn use {
        pointer-events: none;
      }
      
    </style>`);
};



const init = () => {
  if (document.querySelector('#de-main')) return;
  const postform = getMainForm();
  if (!postform) {
    return;
  }
  const captchaImg = document.querySelector('#captcha');
  // get captcha root url
  if (captchaImg) {
    const captchaSrc = captchaImg.getAttribute('src');
    const [matched, captchaUrl, captchaKey, captchaDummy ] = captchaSrc.match(/([^\?]*)\?key=(.*)&dummy=(.*)/);
    captcha.main.url = captchaUrl;
    captcha.main.key = captchaKey;
    captcha.main.dummy = captchaDummy;
    captcha.quick.url = captchaUrl;
  }
  // remove default captcha update handler
  addUpdateCaptchaListener(postform);
  if (document.body.classList.contains('replypage')) {
    postform.addEventListener('change', syncForms);
    postform.addEventListener('input', syncForms);
  }
  appendCSS();
  
  processNodes();

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