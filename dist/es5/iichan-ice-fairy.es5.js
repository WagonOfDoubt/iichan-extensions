"use strict";

(function () {
  var init = function init() {
    var dayRegexp = new RegExp(/(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s/, 'i');

    var checkDate = function checkDate(text) {
      var day = text.match(dayRegexp);

      if (!day || day.length < 1) {
        return false; // date not found
      }

      if (day[1] === 'Пн') {
        return false; // don't change name on this day
      }

      return true;
    };

    var cirnify = function cirnify(node) {
      var labels = node.querySelectorAll('label');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = labels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var label = _step.value;
          var namespan = label.querySelector('.postername, .commentpostername');

          if (!namespan) {
            continue;
          }

          if (!checkDate(label.innerText)) {
            continue;
          }

          namespan.innerHTML = 'Сырно';
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

    cirnify(document.body);

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
              cirnify(node);
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