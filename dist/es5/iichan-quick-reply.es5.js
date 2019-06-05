"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  var captcha = {
    main: {
      key: 'mainpage',
      dummy: '',
      url: '/cgi-bin/captcha1.pl/b/'
    },
    quick: {
      key: 'mainpage',
      dummy: '',
      url: '/cgi-bin/captcha1.pl/b/'
    }
  };
  var SAVE_STATE_TIMEOUT = 3 * 60 * 1000;

  var _ref = function () {
    var quickReplyContainer = document.createElement('table');
    quickReplyContainer.insertAdjacentHTML('beforeend', "\n      <tr>\n      \t<td class=\"doubledash\">&gt;&gt;</td>\n      \t<td class=\"iichan-postform-container reply\">\n         <div class=\"theader\">\u041E\u0442\u0432\u0435\u0442 \u0432 \u0442\u0440\u0435\u0434 \u2116<span class=\"iichan-quick-reply-thread\"></span><div class=\"iichan-quick-reply-close-form-btn\" title=\"\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443\"><svg>\n          <use class=\"iichan-icon-form-close-use\" xlink:href=\"/extras/icons.svg#iichan-icon-close\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n        </svg></div></div>\n        </td>\n      </tr>\n      \n    ");
    quickReplyContainer.id = 'iichan-quick-reply-container';
    var hideFormBtn = quickReplyContainer.querySelector('.iichan-quick-reply-close-form-btn');
    hideFormBtn.addEventListener('click', function (e) {
      return movePostform(null);
    });
    var quickPostformContainer = quickReplyContainer.querySelector('.iichan-postform-container');
    return {
      quickReplyContainer: quickReplyContainer,
      quickPostformContainer: quickPostformContainer
    };
  }(),
      quickReplyContainer = _ref.quickReplyContainer,
      quickPostformContainer = _ref.quickPostformContainer;

  var getMainForm = function () {
    var mainForm;
    return function () {
      if (!mainForm) {
        mainForm = document.getElementById('postform');
      }

      return mainForm;
    };
  }();

  var getQuickReplyForm = function () {
    var quickReplyForm;
    return function () {
      if (!quickReplyForm) {
        var postform = getMainForm();
        quickReplyForm = postform.cloneNode(true); // deep clone

        quickReplyForm.id = 'iichan-quick-reply-form';
        var quickCaptcha = quickReplyForm.querySelector('#captcha');

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
  }();

  var hiddenParentInput = function () {
    var inp = document.createElement('input');
    inp.setAttribute('type', 'hidden');
    inp.setAttribute('name', 'parent');
    return inp; // kaeritai
  }();

  var addUpdateCaptchaListener = function addUpdateCaptchaListener(form) {
    var captchaLink = form.querySelector('input[name=captcha] + a');

    if (captchaLink) {
      captchaLink.removeAttribute('onclick');
      captchaLink.addEventListener('click', function (e) {
        updateCaptcha();
        e.preventDefault();
      });
    }
  };

  var getCaptchaImageUrl = function getCaptchaImageUrl(captchaOpts) {
    var url = captchaOpts.url,
        key = captchaOpts.key,
        dummy = captchaOpts.dummy;
    return "".concat(url, "?key=").concat(key, "&dummy=").concat(dummy, "&").concat(Math.random());
  };

  var updateCaptcha = function updateCaptcha() {
    var quickCaptchaImg = document.getElementById('iichan-quick-reply-captcha');
    var mainCaptchaImg = document.getElementById('captcha');
    var quickCaptchaUrl = getCaptchaImageUrl(captcha.quick);

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

  var updateCaptchaParams = function updateCaptchaParams(parentThread) {
    if (!parentThread) {
      captcha.quick.key = 'mainpage';
      captcha.quick.dummy = '';
    } else {
      var opRef = parentThread.id.substr('thread-'.length);
      var lastReply = parentThread.querySelector('table:last-child .reply');
      var lastRef = lastReply ? lastReply.id.substr('reply'.length) : opRef;
      captcha.quick.key = "res".concat(opRef);
      captcha.quick.dummy = lastRef;
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

  var addReflinkAndFocus = function addReflinkAndFocus(postform, reflink) {
    var textarea = postform && postform.querySelector('[name=nya4]');

    if (!textarea) {
      return;
    }

    textarea.focus();

    if (reflink) {
      reflink = ">>".concat(reflink, "\n");

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

  var placeQuickReplyFormAfterReply = function placeQuickReplyFormAfterReply(replyTo, addReflink) {
    var quickReplyForm = getQuickReplyForm();
    var replyContainer = findParent(replyTo, 'table');
    var parentThread = findParent(replyTo, '[id^=thread]');

    if (!replyContainer || !parentThread) {
      return;
    }

    var opRef = parentThread.id.substr('thread-'.length);
    var ref = replyTo.id.substr('reply'.length);
    replyContainer.parentNode.insertBefore(quickReplyContainer, replyContainer.nextSibling);
    setParentInputValue(quickReplyForm, opRef);
    updateCaptchaParams(parentThread);

    if (addReflink) {
      addReflinkAndFocus(quickReplyForm, ref);
    }
  };

  var placeQuickReplyFormAfterOp = function placeQuickReplyFormAfterOp(replyTo, addReflink) {
    var quickReplyForm = getQuickReplyForm();
    var firstReply = replyTo.querySelector('table');
    var ref = replyTo.id.substr('thread-'.length);
    replyTo.insertBefore(quickReplyContainer, firstReply);
    setParentInputValue(quickReplyForm, ref);
    updateCaptchaParams(replyTo);

    if (addReflink) {
      addReflinkAndFocus(quickReplyForm, ref);
    }
  };

  var closeQuickReplyForm = function closeQuickReplyForm() {
    if (!quickReplyContainer.parentNode) {
      return;
    }

    quickReplyContainer.parentNode.removeChild(quickReplyContainer);
  };

  var movePostform = function movePostform(replyTo) {
    var addReflink = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var quickReplyForm = getQuickReplyForm(); // replyTo === null OR already at same post => close quick reply form

    if (!replyTo || quickReplyForm.dataset.replyTo === replyTo.id) {
      quickReplyForm.dataset.replyTo = '';
      closeQuickReplyForm(); // replyTo is reply (not OP)
    } else if (replyTo.classList.contains('reply')) {
      quickReplyForm.dataset.replyTo = replyTo.id;
      placeQuickReplyFormAfterReply(replyTo, addReflink); // replyTo is thread (OP)
    } else {
      quickReplyForm.dataset.replyTo = replyTo.id;
      placeQuickReplyFormAfterOp(replyTo, addReflink);
    }
  };

  var syncForms = function syncForms(e) {
    if (!e) return;
    var sourceInput = e instanceof Event ? e.target : e;
    var quickReplyForm = getQuickReplyForm();
    var mainForm = getMainForm();
    var targetForm = quickReplyForm.contains(sourceInput) ? mainForm : quickReplyForm;
    var sourceForm = quickReplyForm.contains(sourceInput) ? quickReplyForm : mainForm;
    var targetInput = targetForm[sourceInput.name];
    var inputType = sourceInput.type;

    if (!targetInput) {
      return;
    }

    if (inputType === 'radio') {
      var sourceGroup = sourceForm[sourceInput.name];
      targetInput.value = sourceGroup.value;
    } else if (inputType === 'checkbox') {
      targetInput.checked = sourceInput.checked;
    } else if (inputType === 'file') {
      // might not work in all browsers
      var newFileInput = sourceInput.cloneNode();
      var parent = targetInput.parentElement;
      parent.removeChild(targetInput);
      parent.insertBefore(newFileInput, parent.firstChild);
    } else {
      targetInput.value = sourceInput.value;
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

  var onReflinkClick = function onReflinkClick(e) {
    var ref = '';
    var reply = findParent(e.target, '.reply');
    var thread = findParent(e.target, '[id^=thread]');

    if (reply) {
      ref = reply.id.substr('reply'.length);
    } else if (thread) {
      ref = thread.id.substr('thread-'.length);
    }

    if (ref) {
      if (quickReplyContainer.parentNode) {
        var quickReplyForm = getQuickReplyForm();
        addReflinkAndFocus(quickReplyForm, ref);
      } else if (document.body.classList.contains('replypage')) {
        var postform = getMainForm();
        addReflinkAndFocus(postform, ref);
      } else {
        var afterReply = reply || thread;
        movePostform(afterReply);
      }
    }

    e.preventDefault();
  };

  var serializeForm = function serializeForm(form) {
    var formData = {};
    var inputs = form.querySelectorAll('input, textarea');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var input = _step.value;
        if (!input.name) continue;
        if (input.type === 'file') continue;
        formData[input.name] = {
          type: input.type
        };

        if (input.type === 'radio') {
          var group = form[input.name];
          formData[input.name].value = group.value;
        } else if (input.type === 'checkbox') {
          formData[input.name].checked = input.checked;
        } else {
          formData[input.name].value = input.value;
        }
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

    return formData;
  };

  var deserializeForm = function deserializeForm(form, formData) {
    var inputs = form.querySelectorAll('input, textarea');
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = inputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var input = _step2.value;
        if (!formData[input.name]) continue;
        if (formData[input.name].type !== input.type) continue;
        console.log(input.name, formData[input.name]);

        if (input.type === 'radio') {
          var group = form[input.name];
          group.value = formData[input.name].value;
        } else if (input.type === 'checkbox') {
          input.checked = formData[input.name].checked;
        } else {
          input.value = formData[input.name].value;
        }
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
  };

  var onBeforeUnload = function onBeforeUnload(e) {
    if (isDollchan()) return; // if form is closed, don't save it's state

    if (!quickReplyContainer.parentNode) return;
    var status = getStatus();
    var quickReplyForm = getQuickReplyForm();
    status.lastQuickReply = quickReplyForm.dataset.replyTo;
    status.lastUrl = window.location.href;
    status.timestamp = Date.now(); // serialize form if it's board page, thus forms are not in sync.

    if (!document.body.classList.contains('replypage')) {
      status.formData = serializeForm(quickReplyForm);
    }

    setStatus(status);
    console.log(status);
  };

  var checkFormStateAfterReload = function checkFormStateAfterReload() {
    if (isDollchan()) return;
    var status = getStatus();

    if (status.lastUrl !== window.location.href || !status.timestamp) {
      return;
    } // user returned to previous page by clicking a link, purge data
    // or if timeout was reached


    var timePassed = Date.now() - status.timestamp;

    if (!pageWasReloaded() || timePassed > SAVE_STATE_TIMEOUT) {
      status.lastUrl = null;
      status.lastQuickReply = null;
      status.timestamp = null;
      status.formData = null;
      setStatus(status);
      return;
    }

    if (status.lastQuickReply) {
      var reply = document.getElementById(status.lastQuickReply);
      movePostform(reply, false);

      if (!document.body.classList.contains('replypage') && status.formData) {
        var quickReplyForm = getQuickReplyForm();
        console.log('deserializeForm', status.formData);
        deserializeForm(quickReplyForm, status.formData);
      }
    }

    status.lastUrl = null;
    status.lastQuickReply = null;
    status.timestamp = null;
    status.formData = null;
    setStatus(status);
  };

  var addReplyBtn = function addReplyBtn(reply) {
    if (!reply) return;
    var label = reply.querySelector(':scope > .reflink');
    if (!label) return;
    var btnContainer = reply.querySelector(".iichan-post-btns");

    if (!btnContainer) {
      btnContainer = document.createElement('span');
      btnContainer.classList.add("iichan-post-btns");
      label.parentNode.insertBefore(btnContainer, label.nextSibling);
    }

    btnContainer.insertAdjacentHTML('beforeend', "\n    <div class=\"iichan-quick-reply-btn\" title=\"\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u043E\u0442\u0432\u0435\u0442\" data-post-id=\"".concat(reply.id, "\">\n      <svg>\n        <use class=\"iichan-icon-reply-use\" xlink:href=\"/extras/icons.svg#iichan-icon-reply\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"/>\n      </svg>\n    </div>\n  ").trim());
    var btn = reply.querySelector('.iichan-quick-reply-btn');
    btn.addEventListener('click', onQuickReplyClick);
    var labelLink = label.querySelector('a');
    if (!labelLink) return;
    labelLink.addEventListener('click', onReflinkClick);
  };

  var processNodes = function processNodes(rootNode) {
    var replySelector = '.reply, [id^=thread]';

    if (rootNode && rootNode.matches(replySelector)) {
      addReplyBtn(rootNode);
      return;
    }

    var replies = (rootNode || document.body).querySelectorAll(replySelector);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = replies[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var reply = _step3.value;
        addReplyBtn(reply);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  };

  var appendCSS = function appendCSS() {
    document.head.insertAdjacentHTML('beforeend', "<style type=\"text/css\">\n      .iichan-quick-reply-btn {\n        display: inline-block;\n        width: 16px;\n        height: 16px;\n        vertical-align: text-top;\n      }\n      \n      .iichan-quick-reply-btn > svg {\n        width: 16px;\n        height: 16px;\n      }\n      \n      .iichan-quick-reply-btn use {\n        pointer-events: none;\n      }\n      \n      .iichan-quick-reply-btn {\n        margin-left: 0.4em;\n        cursor: pointer;\n      }\n      \n      #iichan-quick-reply-container .rules {\n        display: none;\n      }\n      \n      #iichan-quick-reply-icons {\n        display: none;\n      }\n      \n      .iichan-postform-container .theader {\n        width: auto;\n      }\n      \n      .iichan-quick-reply-close-form-btn {\n        float: right;\n        cursor: pointer;\n        padding: 1px;\n      }\n      \n      .iichan-quick-reply-close-form-btn svg {\n        width: 16px;\n        height: 16px;\n        vertical-align: text-top;\n      }\n      \n      .iichan-quick-reply-close-form-btn use {\n        pointer-events: none;\n      }\n      \n    </style>");
  }; // jshint ignore:line


  var pageWasReloaded = function pageWasReloaded() {
    var performance = window.performance;
    if (!performance) return false;
    var navigation = performance.navigation;
    if (!navigation) return false;
    return navigation.type === navigation.TYPE_RELOAD || navigation.type === navigation.TYPE_BACK_FORWARD;
  };

  var getSettings = function getSettings() {
    return JSON.parse(window.localStorage.getItem('iichan_settings') || '{}');
  };

  var getStatus = function getStatus() {
    return JSON.parse(window.localStorage.getItem('iichan_quick_reply') || '{}');
  };

  var setStatus = function setStatus(status) {
    return window.localStorage.setItem('iichan_quick_reply', JSON.stringify(status));
  };

  var isDollchan = function isDollchan() {
    return document.body.classList.contains('de-runned') || !!document.body.querySelector('#de-main');
  };

  var init = function init() {
    if (isDollchan()) return;
    if (!document.getElementById('delform')) ;
    if (getSettings().disable_quick_reply) return;
    var postform = getMainForm();

    if (!postform) {
      return;
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    var captchaImg = document.body.querySelector('#captcha'); // get captcha root url

    if (captchaImg) {
      var captchaSrc = captchaImg.getAttribute('src');

      var _captchaSrc$match = captchaSrc.match(/([^\?]*)\?key=(.*)&dummy=(.*)/),
          _captchaSrc$match2 = _slicedToArray(_captchaSrc$match, 4),
          matched = _captchaSrc$match2[0],
          captchaUrl = _captchaSrc$match2[1],
          captchaKey = _captchaSrc$match2[2],
          captchaDummy = _captchaSrc$match2[3];

      captcha.main.url = captchaUrl;
      captcha.main.key = captchaKey;
      captcha.main.dummy = captchaDummy;
      captcha.quick.url = captchaUrl;
    } // remove default captcha update handler


    addUpdateCaptchaListener(postform);

    if (document.body.classList.contains('replypage')) {
      postform.addEventListener('change', syncForms);
      postform.addEventListener('input', syncForms);
    }

    appendCSS(); // jshint ignore:line

    processNodes();
    checkFormStateAfterReload();

    if ('MutationObserver' in window) {
      var observer = new MutationObserver(function (mutations) {
        if (isDollchan()) return;
        mutations.forEach(function (mutation) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = mutation.addedNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var node = _step4.value;
              if (!node.querySelectorAll) return;
              processNodes(node);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
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