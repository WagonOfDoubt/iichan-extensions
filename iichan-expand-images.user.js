// ==UserScript==
// @name         Expand images on iichan
// @namespace    http://iichan.hk/
// @license      MIT
// @version      0.1
// @description  Expands images on click
// @icon         http://iichan.hk/favicon.ico
// @updateURL    https://raw.github.com/WagonOfDoubt/iichan-extensions/master/iichan-expand-images.user.js
// @author       Cirno
// @match        http://iichan.hk/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var MIN_DISPLAY_WIDTH = 700;  // ширина, при которой картинки будут открываться как обычно
    var MIN_DISPLAY_HEIGHT = 700;  // высота, при которой картинки будут открываться как обычно
    var EXPANDED_THUMB_CLASSNAME = 'iichan-image-fullsize';
    var EXPANDABLE_FORMATS = ['jpg', 'jpeg', 'gif', 'png'];

    function addListeners(e) {
        var onThumbnailClick = function(e) {
            if (screen.width < MIN_DISPLAY_WIDTH ||
                screen.height < MIN_DISPLAY_HEIGHT) {
                return;
            }

            var thumb = this.querySelector('.thumb');
            if (thumb.classList.contains(EXPANDED_THUMB_CLASSNAME)) {
                thumb.src = thumb.originalSrc;
                thumb.width = thumb.originalWidth;
                thumb.height = thumb.originalHeight;
                thumb.classList.remove(EXPANDED_THUMB_CLASSNAME);
                e.preventDefault();
                return;
            }

            var imageSrc = this.href;
            var imageFormat = imageSrc.split('.');
            imageFormat = imageFormat[imageFormat.length - 1];
            if (EXPANDABLE_FORMATS.indexOf(imageFormat) === -1) {
                return;
            }

            e.preventDefault();
            var thumbSrc = thumb.src;
            thumb.originalSrc = thumb.src;
            thumb.originalWidth = thumb.width;
            thumb.originalHeight = thumb.height;
            thumb.removeAttribute('width');
            thumb.removeAttribute('height');
            thumb.classList.add(EXPANDED_THUMB_CLASSNAME);
            thumb.src = imageSrc;
        };

        var thumbs = document.querySelectorAll('.thumb');
        for (var i = thumbs.length - 1; i >= 0; i--) {
            var img = thumbs[i];
            var a = img.parentNode;
            if (a) {
                a.addEventListener('click', onThumbnailClick);
            }
        }
    }

    function appendCSS() {
        document.head.insertAdjacentHTML('beforeend', '<style type="text/css">' +
                                         '.' + EXPANDED_THUMB_CLASSNAME + ' {' +
                                         '   max-width: 97%; max-height: 97%;' +
                                         '}</style>');
    }

    function init() {
        // element.classList is required
        if (!('classList' in Element.prototype)) {
            return;
        }
        appendCSS();
        addListeners();
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
