"use strict";

(function () {
  var captcha = {
    key: 'mainpage',
    dummy: '',
    url: '/cgi-bin/captcha1.pl/b/'
  };

  var _ref = function () {
    var quickReplyContainer = document.createElement('table');
    quickReplyContainer.insertAdjacentHTML('beforeend', "\n        <tr>\n        \t<td class=\"doubledash\">&gt;&gt;</td>\n        \t<td class=\"iichan-postform-container reply\">\n           <div class=\"theader\">\u041E\u0442\u0432\u0435\u0442 \u0432 \u0442\u0440\u0435\u0434 \u2116<span class=\"iichan-quick-reply-thread\"></span><div class=\"iichan-quick-reply-close-form-btn\" title=\"\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443\"><svg>\n            <use class=\"iichan-icon-form-close-use\" xlink:href=\"#iichan-icon-form-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n          </svg></div></div>\n          </td>\n        </tr>\n        \n      ");
    quickReplyContainer.id = 'iichan-quick-reply-container';
    var hideFormBtn = quickReplyContainer.querySelector('.iichan-quick-reply-close-form-btn');
    hideFormBtn.addEventListener('click', function (e) {
      return movePostform(null, true);
    });
    var postformContainer = quickReplyContainer.querySelector('.iichan-postform-container');
    return {
      quickReplyContainer: quickReplyContainer,
      postformContainer: postformContainer
    };
  }(),
      quickReplyContainer = _ref.quickReplyContainer,
      postformContainer = _ref.postformContainer;

  var quickReplyShowFormBtn = function () {
    var btn = document.createElement('a');
    btn.classList.add('iichan-quick-reply-show-form-btn');
    return btn;
  }();

  var hiddenParentInput = function () {
    var inp = document.createElement('input');
    inp.setAttribute('type', 'hidden');
    inp.setAttribute('name', 'parent');
    return inp;
  }();

  var updateCaptcha = function updateCaptcha() {
    var img = document.querySelector('#captcha');

    if (!img) {
      return;
    }

    var url = captcha.url,
        key = captcha.key,
        dummy = captcha.dummy;
    img.src = "".concat(url, "?key=").concat(key, "&dummy=").concat(dummy, "&").concat(Math.random());
  };

  var updateCaptchaParams = function updateCaptchaParams(parentThread) {
    if (!parentThread) {
      captcha.key = 'mainpage';
      captcha.dummy = '';
    } else {
      var opRef = parentThread.id.substr('thread-'.length);
      var lastReply = parentThread.querySelector('table:last-child .reply');
      var lastRef = lastReply ? lastReply.id.substr('reply'.length) : opRef;
      captcha.key = "res".concat(opRef);
      captcha.dummy = lastRef;
    }

    updateCaptcha();
  };

  var setParentInputValue = function setParentInputValue(postform, value) {
    var threadIdSpan = quickReplyContainer.querySelector('.iichan-quick-reply-thread');

    if (threadIdSpan) {
      threadIdSpan.textContent = value || '';
    }

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
      reflink = ">>".concat(reflink, "\n");

      if (!textarea.value.endsWith(reflink)) {
        if (textarea.value.length && !textarea.value.endsWith('\n')) {
          reflink = '\n' + reflink;
        }

        textarea.setRangeText(reflink, textarea.textLength, textarea.textLength, 'end');
      }
    }
  };

  var placePostareaButton = function placePostareaButton() {
    var postarea = document.querySelector('.postarea');

    if (postarea) {
      postarea.appendChild(quickReplyShowFormBtn);
    }

    var theader = document.querySelector('body > .theader');

    if (theader) {
      theader.style.display = 'none';
    }
  };

  var placeFormAfterReply = function placeFormAfterReply(postform, replyTo) {
    var replyContainer = findParent(replyTo, 'table');
    var parentThread = findParent(replyTo, '[id^=thread]');

    if (!replyContainer || !parentThread) {
      return;
    }

    var opRef = parentThread.id.substr('thread-'.length);
    var ref = replyTo.id.substr('reply'.length);
    postformContainer.appendChild(postform);
    replyContainer.parentNode.insertBefore(quickReplyContainer, replyContainer.nextSibling);
    placePostareaButton();
    setParentInputValue(postform, opRef);
    updateCaptchaParams(parentThread);
    addReflinkAndFocus(ref);
  };

  var placeFormAfterOp = function placeFormAfterOp(postform, replyTo) {
    var firstReply = replyTo.querySelector('table');
    var ref = replyTo.id.substr('thread-'.length);
    postformContainer.appendChild(postform);
    replyTo.insertBefore(quickReplyContainer, firstReply);
    placePostareaButton();
    setParentInputValue(postform, ref);
    updateCaptchaParams(replyTo);
    addReflinkAndFocus(ref);
  };

  var placeFormAtPostarea = function placeFormAtPostarea(postform, focus) {
    var postarea = document.querySelector('.postarea'); // append postfrom to postarea

    if (postarea) {
      postarea.appendChild(postform);

      if (focus) {
        addReflinkAndFocus();
      }
    } // remove table.reply


    if (quickReplyContainer.parentNode) {
      quickReplyContainer.parentNode.removeChild(quickReplyContainer);
    } // remove button from postarea


    if (quickReplyShowFormBtn.parentNode) {
      var theader = document.querySelector('body > .theader');

      if (theader) {
        theader.style.display = null;
      }

      quickReplyShowFormBtn.parentNode.removeChild(quickReplyShowFormBtn);
    } // reset form parent value


    if (document.body.classList.contains('replypage')) {
      // reply to thread
      var parentThread = document.querySelector('[id^=thread]');
      var opRef = parentThread.id.substr('thread-'.length);
      setParentInputValue(postform, opRef);
      updateCaptchaParams(parentThread);
    } else {
      // create thread
      setParentInputValue(postform, null);
      updateCaptchaParams();
    }
  };

  var movePostform = function movePostform(replyTo, closeQuickReply) {
    var postform = document.querySelector('#postform');

    if (!postform) {
      return;
    } // replyTo === null => return postform to default position


    if (!replyTo) {
      postform.dataset.replyTo = '';
      placeFormAtPostarea(postform, !closeQuickReply); // already at same post => return to default, no focus
    } else if (postform.dataset.replyTo === replyTo.id) {
      postform.dataset.replyTo = '';
      placeFormAtPostarea(postform, false); // replyTo is reply (not OP)
    } else if (replyTo.classList.contains('reply')) {
      postform.dataset.replyTo = replyTo.id;
      placeFormAfterReply(postform, replyTo); // replyTo is thread (OP)
    } else {
      postform.dataset.replyTo = replyTo.id;
      placeFormAfterOp(postform, replyTo);
    }
  };

  var onQuickReplyClick = function onQuickReplyClick(e) {
    var btn = e.target;

    while (btn && !btn.classList.contains('iichan-quick-reply-btn')) {
      btn = btn.parentElement;
    }

    if (btn) {
      var afterReply = document.getElementById(btn.dataset.postId);
      movePostform(afterReply);
    }

    e.preventDefault();
  };

  var addReplyBtn = function addReplyBtn(reply) {
    if (!reply) return;
    var label = reply.querySelector(':scope > .reflink');
    if (!label) return;
    label.insertAdjacentHTML('afterend', "\n    <div class=\"iichan-quick-reply-btn\" title=\"\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u043E\u0442\u0432\u0435\u0442\" data-post-id=\"".concat(reply.id, "\">\n      <svg>\n        <use class=\"iichan-icon-reply-use\" xlink:href=\"#iichan-icon-reply\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\n    </div>\n  "));
    var btn = reply.querySelector('.iichan-quick-reply-btn');
    btn.addEventListener('click', onQuickReplyClick);
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
        if (!_iteratorNormalCompletion && _iterator.return != null) {
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
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n      .iichan-quick-reply-btn {\n        display: inline-block;\n        width: 16px;\n        height: 16px;\n        vertical-align: text-top;\n      }\n      \n      .iichan-quick-reply-btn > svg {\n        width: 16px;\n        height: 16px;\n      }\n      \n      .iichan-quick-reply-btn use {\n        pointer-events: none;\n      }\n      \n      .replypage .iichan-quick-reply-show-form-btn::after {\n        content: '[\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0444\u043E\u0440\u043C\u0443 \u043E\u0442\u0432\u0435\u0442\u0430]';\n      }\n      \n      .iichan-quick-reply-show-form-btn::after {\n        content: '[\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0442\u0440\u0435\u0434]';\n      }\n      \n      .iichan-quick-reply-show-form-btn,\n      .iichan-quick-reply-btn {\n        cursor: pointer;\n      }\n      \n      #iichan-quick-reply-container .rules {\n        display: none;\n      }\n      \n      #iichan-quick-reply-icons {\n        display: none;\n      }\n      \n      .iichan-postform-container .theader {\n        width: auto;\n      }\n      \n      .iichan-quick-reply-close-form-btn {\n        float: right;\n        cursor: pointer;\n        padding: 1px;\n      }\n      \n      .iichan-quick-reply-close-form-btn svg {\n        width: 16px;\n        height: 16px;\n        vertical-align: text-top;\n      }\n      \n      .iichan-quick-reply-close-form-btn use {\n        pointer-events: none;\n      }\n      \n    </style>");
  };

  var appendHTML = function appendHTML() {
    var iconsContainer = "<div id=\"iichan-quick-reply-icons\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\">\n      <symbol id=\"iichan-icon-reply\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n        <path\n          fill=\"currentcolor\"\n          d=\"M 8,0.98745 A 7.0133929,5.9117254 0 0 0 0.986328,6.89859 7.0133929,5.9117254 0 0 0 3.037109,11.07043 L 1.835937,15.01255 6.230469,12.61078 A 7.0133929,5.9117254 0 0 0 8,12.80973 7.0133929,5.9117254 0 0 0 15.013672,6.89859 7.0133929,5.9117254 0 0 0 8,0.98745 Z\"/>\n      </symbol>\n      <symbol id=\"iichan-icon-form-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n        <path\n          fill=\"currentcolor\"\n          d=\"m 11.734373,2.0393046 c -0.551714,0.0032 -1.101132,0.214707 -1.521485,0.636719 l -2.2656251,2.275391 -2.359375,-2.314453 c -0.798816,-0.783843 -2.079336,-0.777297 -2.86914,0.01563 l -0.171875,0.171875 c -0.789805,0.792922 -0.781239,2.063814 0.01758,2.847656 l 2.359375,2.314453 -2.304688,2.3125004 c -0.840706,0.844025 -0.83272,2.194937 0.01758,3.029297 l 0.01172,0.01172 c 0.850299,0.834359 2.212029,0.826446 3.052734,-0.01758 l 2.302735,-2.3125 2.4101561,2.363281 c 0.798817,0.783842 2.077383,0.777297 2.867188,-0.01563 l 0.171875,-0.173828 c 0.789804,-0.792922 0.781238,-2.061861 -0.01758,-2.845703 l -2.408204,-2.3632824 2.265625,-2.27539 c 0.840706,-0.844025 0.832721,-2.194938 -0.01758,-3.029297 l -0.0098,-0.01172 c -0.42515,-0.41718 -0.979537,-0.622294 -1.53125,-0.619141 z\"/>\n      </symbol>\n    </svg>\n  </div>";
    document.body.insertAdjacentHTML('beforeend', iconsContainer);
  };

  var init = function init() {
    if (document.querySelector('#de-main')) return;
    var captchaImg = document.querySelector('#captcha'); // get captcha root url

    if (captchaImg) {
      captcha.url = captchaImg.getAttribute('src').match(/[^\?]*/)[0];
    } // remove default captcha update handler


    var captchaLink = document.querySelector('input[name=captcha] + a');

    if (captchaLink) {
      captchaLink.removeAttribute('onclick');
      captchaLink.addEventListener('click', function (e) {
        updateCaptcha();
        e.preventDefault();
      });
    }

    if (document.body.classList.contains('replypage')) {
      var parentThread = document.querySelector('[id^=thread]');
      updateCaptchaParams(parentThread);
    } else {
      updateCaptchaParams();
    }

    appendCSS();
    appendHTML();
    processNodes();
    quickReplyShowFormBtn.addEventListener('click', function (e) {
      movePostform();
      e.preventDefault();
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
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
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
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();