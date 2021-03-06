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
      //=include quick-reply-container.html
    `);
  quickReplyContainer.id = '<%= CONTAINER_ID %>';
  const hideFormBtn = quickReplyContainer.querySelector('.<%= CLOSE_FORM_BTN_CLASSNAME %>');
  hideFormBtn.addEventListener('click', (e) => movePostform(null));
  const quickPostformContainer = quickReplyContainer.querySelector('.<%= FORM_CONTAINER_CLASSNAME %>');
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
      quickReplyForm.id = '<%= QUCK_REPLY_FORM_ID %>';
      const quickCaptcha = quickReplyForm.querySelector('#captcha');
      if (quickCaptcha) {
        quickCaptcha.id = '<%= QUCK_REPLY_CAPTCHA_ID %>';
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
  const quickCaptchaImg = document.getElementById('<%= QUCK_REPLY_CAPTCHA_ID %>');
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
  } else if (replyTo.classList.contains('reply') || replyTo.classList.contains('highlight')) {
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
  while (btn && !btn.classList.contains('<%= BTN_CLASSNAME %>')) {
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
  const reply = findParent(e.target, '[id^=reply]');
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
  let btnContainer = reply.querySelector(`.<%= POST_BTNS_CONTAINER_CLASSNAME %>`);
  if (!btnContainer) {
    btnContainer = document.createElement('span');
    btnContainer.classList.add(`<%= POST_BTNS_CONTAINER_CLASSNAME %>`);
    label.parentNode.insertBefore(btnContainer, label.nextSibling);
  }
  btnContainer.insertAdjacentHTML('beforeend', `
    //=include quick-reply-btn.html
  `.trim());
  const btn = reply.querySelector('.<%= BTN_CLASSNAME %>');
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
      //=include quick-reply.css
    </style>`);
};


<% if (USERSCRIPT) { %>  // jshint ignore:line
const appendHTML = () => {
  const iconsContainer = `<div id="<%= ICONS_CONTAINER_ID %>">
    //=include quick-reply-icons.svg
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};
<% } %>  // jshint ignore:line

const pageWasReloaded = () => {
  const performance = window.performance;
  if (!performance) return false;
  const navigation = performance.navigation;
  if (!navigation) return false;
  return navigation.type === navigation.TYPE_RELOAD ||
    navigation.type === navigation.TYPE_BACK_FORWARD;
};

const getSettings = () => JSON.parse(
  window.localStorage.getItem('<%= SETTINGS_LOCALSTORAGE_KEY %>') || '{}');

const getStatus = () => JSON.parse(
  window.localStorage.getItem('<%= STATUS_LOCALSTORAGE_KEY %>') || '{}');

const setStatus = (status) =>
  window.localStorage.setItem('<%= STATUS_LOCALSTORAGE_KEY %>', JSON.stringify(status));

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
  <% if (USERSCRIPT) { %>  // jshint ignore:line
  appendHTML();
  <% } %>  // jshint ignore:line
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
