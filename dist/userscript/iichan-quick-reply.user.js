// ==UserScript==
// @name         [IIchan] Quick reply
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.11
// @description  Adds quick reply feature to iichan
// @icon         https://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/dist/userscript/iichan-quick-reply.meta.js
// @author       Cirno
// @match        http://iichan.hk/*
// @match        https://iichan.hk/*
// @grant        none
// ==/UserScript==

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
          <use class="iichan-icon-form-close-use" xlink:href="#iichan-icon-close" width="16" height="16" viewBox="0 0 16 16"/>
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
  let btnContainer = reply.querySelector(`.iichan-post-btns`);
  if (!btnContainer) {
    btnContainer = document.createElement('span');
    btnContainer.classList.add(`iichan-post-btns`);
    label.parentNode.insertBefore(btnContainer, label.nextSibling);
  }
  btnContainer.insertAdjacentHTML('beforeend', `
    <div class="iichan-quick-reply-btn" title="Быстрый ответ" data-post-id="${ reply.id }">
      <svg>
        <use class="iichan-icon-reply-use" xlink:href="#iichan-icon-reply" width="16" height="16" viewBox="0 0 16 16"/>
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
const appendHTML = () => {
  const iconsContainer = `<div id="iichan-quick-reply-icons">
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="iichan-icon-reply" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="M 8,0.98745 A 7.0133929,5.9117254 0 0 0 0.986328,6.89859 7.0133929,5.9117254 0 0 0 3.037109,11.07043 L 1.835937,15.01255 6.230469,12.61078 A 7.0133929,5.9117254 0 0 0 8,12.80973 7.0133929,5.9117254 0 0 0 15.013672,6.89859 7.0133929,5.9117254 0 0 0 8,0.98745 Z"/>
      </symbol>
      <symbol id="iichan-icon-close" width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="currentcolor"
          d="m 11.734373,2.0393046 c -0.551714,0.0032 -1.101132,0.214707 -1.521485,0.636719 l -2.2656251,2.275391 -2.359375,-2.314453 c -0.798816,-0.783843 -2.079336,-0.777297 -2.86914,0.01563 l -0.171875,0.171875 c -0.789805,0.792922 -0.781239,2.063814 0.01758,2.847656 l 2.359375,2.314453 -2.304688,2.3125004 c -0.840706,0.844025 -0.83272,2.194937 0.01758,3.029297 l 0.01172,0.01172 c 0.850299,0.834359 2.212029,0.826446 3.052734,-0.01758 l 2.302735,-2.3125 2.4101561,2.363281 c 0.798817,0.783842 2.077383,0.777297 2.867188,-0.01563 l 0.171875,-0.173828 c 0.789804,-0.792922 0.781238,-2.061861 -0.01758,-2.845703 l -2.408204,-2.3632824 2.265625,-2.27539 c 0.840706,-0.844025 0.832721,-2.194938 -0.01758,-3.029297 l -0.0098,-0.01172 c -0.42515,-0.41718 -0.979537,-0.622294 -1.53125,-0.619141 z"/>
      </symbol>
    </svg>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', iconsContainer);
};
  // jshint ignore:line

const getSettings = () => JSON.parse(
  window.localStorage.getItem('iichan_settings') || '{}');

const isDollchan = () =>
  document.body.classList.contains('de-runned') ||
    !!document.body.querySelector('#de-main');

const init = () => {
  if (isDollchan()) return;
  if (getSettings().disable_quick_reply) return;
  const postform = getMainForm();
  if (!postform) {
    return;
  }
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
  appendHTML();
    // jshint ignore:line
  processNodes();

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