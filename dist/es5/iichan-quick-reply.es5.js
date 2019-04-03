(function () {
  'use strict';

  var QUICK_REPLY_BTN_CLASSNAME = 'iichan-quick-reply-btn';
  var QICK_REPLY_BTN_TITLE = 'Быстрый ответ';
  var QUICK_REPLY_CONTAINER_ID = 'iichan-quick-reply-container';
  var QUICK_REPLY_FORM_CONTAINER_CLASSNAME = 'iichan-postform-container';
  var QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME = 'iichan-quick-reply-show-form-btn';

  var _ref = function () {
    var quickReplyContainer = document.createElement('table');
    quickReplyContainer.insertAdjacentHTML('beforeend', '\n          <tr>\n          \t<td class="doubledash">&gt;&gt;</td>\n          \t<td class="' + QUICK_REPLY_FORM_CONTAINER_CLASSNAME + ' reply"></td>\n          </tr>\n          \n        ');
    quickReplyContainer.id = QUICK_REPLY_CONTAINER_ID;
    var postformContainer = quickReplyContainer.querySelector('.' + QUICK_REPLY_FORM_CONTAINER_CLASSNAME);
    return { quickReplyContainer: quickReplyContainer, postformContainer: postformContainer };
  }(),
      quickReplyContainer = _ref.quickReplyContainer,
      postformContainer = _ref.postformContainer;

  var quickReplyShowFormBtn = function () {
    var btn = document.createElement('a');
    btn.classList.add(QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME);
    return btn;
  }();

  var hiddenParentInput = function () {
    var inp = document.createElement('input');
    inp.setAttribute('type', 'hidden');
    inp.setAttribute('name', 'parent');
    return inp;
  }();

  var setParentInputValue = function setParentInputValue(postform, value) {
    var inp = postform.querySelector('[name=parent]');
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

  var findParent = function findParent(child, parentSelector) {
    var parent = child;
    while (parent && parent !== document && !parent.matches(parentSelector)) {
      parent = parent.parentNode;
    }
    if (parent === document) {
      return null;
    }
    return parent;
  };

  var addReflinkAndFocus = function addReflinkAndFocus(reflink) {
    var textarea = document.querySelector('[name=nya4]');
    if (!textarea) {
      return;
    }
    textarea.focus(false);
    if (reflink) {
      reflink = '>>' + reflink + '\n';
      if (textarea.innerText.length && !textarea.innerText.endsWith('\n')) {
        reflink = '\n' + reflink;
      }
      textarea.setRangeText(reflink, textarea.textLength, textarea.textLength, 'end');
    }
  };

  var placePostareaButton = function placePostareaButton() {
    var postarea = document.querySelector('.postarea');
    if (postarea) {
      postarea.appendChild(quickReplyShowFormBtn);
    }
  };

  var placeFormAfterReply = function placeFormAfterReply(postform, replyTo) {
    var replyContainer = findParent(replyTo, 'table');
    var parentThread = findParent(replyTo, '[id^=thread]');
    if (!replyContainer || !parentThread) {
      return;
    }
    postformContainer.appendChild(postform);
    replyContainer.parentNode.insertBefore(quickReplyContainer, replyContainer.nextSibling);
    placePostareaButton();
    var opRef = parentThread.id.substr('thread-'.length);
    setParentInputValue(postform, opRef);
    var ref = replyTo.id.substr('reply'.length);
    addReflinkAndFocus(ref);
  };

  var placeFormAfterOp = function placeFormAfterOp(postform, replyTo) {
    var firstReply = replyTo.querySelector('table');
    postformContainer.appendChild(postform);
    replyTo.insertBefore(quickReplyContainer, firstReply);
    placePostareaButton();
    var ref = replyTo.id.substr('thread-'.length);
    setParentInputValue(postform, ref);
    addReflinkAndFocus(ref);
  };

  var placeFormAtPostarea = function placeFormAtPostarea(postform) {
    var postarea = document.querySelector('.postarea');
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
      var parentThread = document.querySelector('[id^=thread]');
      var opRef = parentThread.id.substr('thread-'.length);
      setParentInputValue(postform, opRef);
    } else {
      // create thread
      setParentInputValue(postform, null);
    }
  };

  var movePostform = function movePostform(replyTo) {
    var postform = document.querySelector('#postform');
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

  var onQuickReplyClick = function onQuickReplyClick(e) {
    var btn = e.target;
    var afterReply = document.querySelector(btn.dataset.postId);
    movePostform(afterReply);
  };

  var addReplyBtn = function addReplyBtn(reply) {
    if (!reply) return;
    var label = reply.querySelector(':scope > .reflink');
    if (!label) return;
    var btn = document.createElement('span');
    btn.title = QICK_REPLY_BTN_TITLE;
    btn.classList.add(QUICK_REPLY_BTN_CLASSNAME);
    btn.dataset.postId = '#' + reply.id;
    btn.addEventListener('click', onQuickReplyClick);
    reply.insertBefore(btn, label.nextSibling); // insert after
  };

  var processNodes = function processNodes(rootNode) {
    var replies = (rootNode || document).querySelectorAll('.reply, [id^=thread]');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = replies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var reply = _step.value;

        addReplyBtn(reply);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n        .' + QUICK_REPLY_BTN_CLASSNAME + '::after {\n          content: \'[\u25B6]\';\n        }\n        \n        .replypage .' + QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME + '::after {\n          content: \'[\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0444\u043E\u0440\u043C\u0443 \u043E\u0442\u0432\u0435\u0442\u0430]\';\n        }\n        \n        .' + QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME + '::after {\n          content: \'[\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0442\u0440\u0435\u0434]\';\n        }\n        \n        .' + QUICK_REPLY_SHOW_FORM_BTN_CLASSNAME + ',\n        .' + QUICK_REPLY_BTN_CLASSNAME + ' {\n          cursor: pointer;\n        }\n        \n        #' + QUICK_REPLY_CONTAINER_ID + ' .rules {\n          display: none;\n        }\n        \n      </style>');
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    appendCSS();
    processNodes();
    quickReplyShowFormBtn.addEventListener('click', function (e) {
      return movePostform();
    });
    if ('MutationObserver' in window) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = mutation.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var node = _step2.value;

              if (!node.querySelectorAll) return;
              processNodes(node);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
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