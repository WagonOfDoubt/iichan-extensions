(() => {
  'use strict';

  const QUICK_REPLY_BTN_CLASSNAME = 'iichan-quick-reply-btn';
  const QICK_REPLY_BTN_TITLE = 'Быстрый ответ';
  const QUICK_REPLY_CONTAINER_ID = 'iichan-quick-reply-container';
  const QUICK_REPLY_FORM_CONTAINER_CLASSNAME = 'iichan-postform-container';
  const QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME = 'iichan-quick-reply-show-form-btn';

  const { quickReplyContainer, postformContainer } = (() => {
    const quickReplyContainer = document.createElement('table');
      quickReplyContainer.insertAdjacentHTML('beforeend', `
          //=include quick-reply-container.html
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
      if (textarea.innerText.length && !textarea.innerText.endsWith('\n')) {
        reflink = '\n' + reflink;
      }
      textarea.setRangeText(reflink, textarea.textLength, textarea.textLength, 'end');
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
    postformContainer.appendChild(postform);
    replyContainer.parentNode.insertBefore(quickReplyContainer, replyContainer.nextSibling);
    placePostareaButton();
    const opRef = parentThread.id.substr('thread-'.length);
    setParentInputValue(postform, opRef);
    const ref = replyTo.id.substr('reply'.length);
    addReflinkAndFocus(ref);
  };

  const placeFormAfterOp = (postform, replyTo) => {
    const firstReply = replyTo.querySelector('table');
    postformContainer.appendChild(postform);
    replyTo.insertBefore(quickReplyContainer, firstReply);
    placePostareaButton();
    const ref = replyTo.id.substr('thread-'.length);
    setParentInputValue(postform, ref);
    addReflinkAndFocus(ref);
  };

  const placeFormAtPostarea = (postform) => {
    const postarea = document.querySelector('.postarea');
    // append postfrom to postarea
    if (postarea) {
      postarea.appendChild(postform);
      addReflinkAndFocus();
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
    } else {
      // create thread
      setParentInputValue(postform, null);
    }
  };

  const movePostform = (replyTo) => {
    const postform = document.querySelector('#postform');
    if (!postform) {
      return;
    }

    // replyTo === null => return postform to default position
    // already at same post => return to default
    if (!replyTo || postform.dataset.replyTo === replyTo.id) {
      postform.dataset.replyTo = '';
      placeFormAtPostarea(postform);
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
    const btn = e.target;
    const afterReply = document.querySelector(btn.dataset.postId);
    movePostform(afterReply);
  };

  const addReplyBtn = (reply) => {
    if (!reply) return;
    const label = reply.querySelector(':scope > .reflink');
    if (!label) return;
    const btn = document.createElement('span');
    btn.title = QICK_REPLY_BTN_TITLE;
    btn.classList.add(QUICK_REPLY_BTN_CLASSNAME);
    btn.dataset.postId = '#' + reply.id;
    btn.addEventListener('click', onQuickReplyClick);
    reply.insertBefore(btn, label.nextSibling);  // insert after
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

  const init = () => {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    processNodes();
    quickReplyShowFormBtn.addEventListener('click', (e) => movePostform());
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
