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

const SAVE_STATE_TIMEOUT = 3 * 60 * 1000;

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
  if (document.body.classList.contains('replypage')) {
    syncForms(textarea);
  }
};

const placeQuickReplyFormAfterReply = (replyTo, addReflink) => {
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
  if (addReflink) {
    addReflinkAndFocus(quickReplyForm, ref);
  }
};

const placeQuickReplyFormAfterOp = (replyTo, addReflink) => {
  const quickReplyForm = getQuickReplyForm();
  const firstReply = replyTo.querySelector('table');
  const ref = replyTo.id.substr('thread-'.length);
  
  replyTo.insertBefore(quickReplyContainer, firstReply);
  
  setParentInputValue(quickReplyForm, ref);
  updateCaptchaParams(replyTo);
  if (addReflink) {
    addReflinkAndFocus(quickReplyForm, ref);
  }
};

const closeQuickReplyForm = () => {
  if (!quickReplyContainer.parentNode) {
    return;
  }
  quickReplyContainer.parentNode.removeChild(quickReplyContainer);
};

const movePostform = (replyTo, addReflink = true) => {
  const quickReplyForm = getQuickReplyForm();

  // replyTo === null OR already at same post => close quick reply form
  if (!replyTo || quickReplyForm.dataset.replyTo === replyTo.id) {
    quickReplyForm.dataset.replyTo = '';
    closeQuickReplyForm();
  // replyTo is reply (not OP)
  } else if (replyTo.classList.contains('reply')) {
    quickReplyForm.dataset.replyTo = replyTo.id;
    placeQuickReplyFormAfterReply(replyTo, addReflink);
  // replyTo is thread (OP)
  } else {
    quickReplyForm.dataset.replyTo = replyTo.id;
    placeQuickReplyFormAfterOp(replyTo, addReflink);
  }
};

const syncForms = (e) => {
  if (!e) return;
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
      e.preventDefault();
    } else if (document.body.classList.contains('replypage')) {
      const postform = getMainForm();
      addReflinkAndFocus(postform, ref);
      e.preventDefault();
    }
  }
};


const serializeForm = (form) => {
  const formData = {};
  const inputs = form.querySelectorAll('input, textarea');
  for (const input of inputs) {
    if (!input.name) continue;
    if (input.type === 'file') continue;
    formData[input.name] = { type: input.type };
    if (input.type === 'radio') {
      const group = form[input.name];
      formData[input.name].value = group.value;
    } else if (input.type === 'checkbox') {
      formData[input.name].checked = input.checked;
    } else {
      formData[input.name].value = input.value;
    }
  }
  return formData;
};


const deserializeForm = (form, formData) => {
  const inputs = form.querySelectorAll('input, textarea');
  for (const input of inputs) {
    if (!formData[input.name]) continue;
    if (formData[input.name].type !== input.type) continue;
    if (input.type === 'radio') {
      const group = form[input.name];
      group.value = formData[input.name].value;
    } else if (input.type === 'checkbox') {
      input.checked = formData[input.name].checked;
    } else {
      input.value = formData[input.name].value;
    }
  }
};


const onBeforeUnload = (e) => {
  if (isDollchan()) return;

  const status = getStatus();

  const quickReplyForm = getQuickReplyForm();
  const textarea = quickReplyForm.querySelector('textarea');

  if (quickReplyContainer.parentNode || textarea.value) {
    status.lastQuickReply = quickReplyForm.dataset.replyTo;
    status.lastUrl = window.location.href;
    status.timestamp = Date.now();

    // serialize form if it's board page, thus forms are not in sync.
    if (!document.body.classList.contains('replypage')) {
      status.formData = serializeForm(quickReplyForm);
    }
  }

  setStatus(status);
};


const checkFormStateAfterReload = () => {
  if (isDollchan()) return;

  const status = getStatus();
  if (status.lastUrl !== window.location.href || !status.timestamp) {
    return;
  }

  // user returned to previous page by clicking a link, purge data
  // or if timeout was reached
  const timePassed = Date.now() - status.timestamp;
  if (!pageWasReloaded() || timePassed > SAVE_STATE_TIMEOUT) {
    status.lastUrl = null;
    status.lastQuickReply = null;
    status.timestamp = null;
    status.formData = null;
    setStatus(status);
    return;
  }

  if (status.lastQuickReply) {
    const reply = document.getElementById(status.lastQuickReply);
    movePostform(reply, false);
  }

  if (!document.body.classList.contains('replypage') && status.formData) {
    const quickReplyForm = getQuickReplyForm();
    deserializeForm(quickReplyForm, status.formData);
  }

  status.lastUrl = null;
  status.lastQuickReply = null;
  status.timestamp = null;
  status.formData = null;
  setStatus(status);
};


const addReplyBtn = (reply) => {
  if (!reply) return;
  const label = reply.querySelector(':scope > .reflink');
  if (!label) return;
  let btnContainer = reply.querySelector(`.iichan-post-btns`);
  if (!btnContainer) {
    btnContainer = document.createElement('span');
    btnContainer.classList.add(`iichan-post-btns`);
    label.parentNode.insertBefore(btnContainer, label.nextSibling);
  }
  btnContainer.insertAdjacentHTML('beforeend', `
    <div class="iichan-quick-reply-btn" title="Быстрый ответ" data-post-id="${ reply.id }">
      <svg>
        <use class="iichan-icon-reply-use" xlink:href="/extras/icons.svg#iichan-icon-reply" width="16" height="16" viewBox="0 0 16 16"/>
      </svg>
    </div>
  `.trim());
  const btn = reply.querySelector('.iichan-quick-reply-btn');
  btn.addEventListener('click', onQuickReplyClick);
  const labelLink = label.querySelector('a');
  if (!labelLink) return;
  labelLink.addEventListener('click', onReflinkClick);
};


const processNodes = (rootNode) => {
  const replySelector = '.reply, [id^=thread]';
  if (rootNode && rootNode.matches(replySelector)) {
    addReplyBtn(rootNode);
    return;
  }
  const replies = (rootNode || document.body).querySelectorAll(replySelector);
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
        margin-left: 0.4em;
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


  // jshint ignore:line

const pageWasReloaded = () => {
  const performance = window.performance;
  if (!performance) return false;
  const navigation = performance.navigation;
  if (!navigation) return false;
  return navigation.type === navigation.TYPE_RELOAD ||
    navigation.type === navigation.TYPE_BACK_FORWARD;
};

const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const getStatus = () => JSON.parse(
  window.localStorage.getItem('iichan_quick_reply') || '{}');

const setStatus = (status) =>
  window.localStorage.setItem('iichan_quick_reply', JSON.stringify(status));

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');

const init = () => {
  if (isDollchan()) return;
  if (!document.getElementById('delform'));
  if (getSettings().disable_quick_reply) return;
  const postform = getMainForm();
  if (!postform) {
    return;
  }
  window.addEventListener('beforeunload', onBeforeUnload);
  const captchaImg = document.body.querySelector('#captcha');
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
    // jshint ignore:line
  processNodes();

  checkFormStateAfterReload();

  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      if (isDollchan()) return;
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