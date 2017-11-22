(() => {
  'use strict';

  // Список расширений файлов, преобразуемых в видеопроигрыватели:
  const VIDEO_EXTENSIONS = ['webm', 'mp4', 'ogv'];
  // Класс тега отключателя видеопроигрывателей:
  const VIDEO_TOGGLE = 'iichan-toggle-video-player';
  // Класс тега видеопроигрывателей:
  const VIDEO_PLAYER_CLASSNAME = 'iichan-video-player';
  // Стиль тега видеопроигрывателей:
  const appendCSS = () => document.head.insertAdjacentHTML(
    'beforeend',
    `<style type="text/css">.${VIDEO_PLAYER_CLASSNAME} {
      max-width: 100%;
      height: auto;
      box-sizing: border-box;
      padding: 2px 20px;
      margin: 0;
    }</style>`
  );
  // Загрузчик jQuery с контролем целостности:
  const jqReady = callbackJQ => {
    if( typeof jQuery === 'function' ) return jQuery(callbackJQ);

    var jqScript = document.getElementById('iichanJQ');
    if( jqScript ) return jqScript.addEventListener(
       'load', () => jQuery(callbackJQ)
    );

    jqScript = document.createElement('script');
    jqScript.crossOrigin = 'anonymous';
    jqScript.id = 'iichanJQ';
    jqScript.integrity = 'sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=';
    jqScript.src = 'https://code.jquery.com/jquery-3.2.1.min.js';
    jqScript.addEventListener('load', () => jQuery(callbackJQ));
    document.body.appendChild(jqScript);
  };

  jqReady(function(){
    const $ = jQuery;

    if( $('#de-main').length > 0 ) return;
    appendCSS();

    $('body').on('click', '.thumb', function(){
      const $img = $(this);
      const $a = $img.closest('a');
      const vpMode = $a.data('vpMode');

      const renderVideoPlayer = () => {
        const $vp = $('<video>').attr({
          poster: $img.attr('src'),
          src: $a.attr('href'),
          autoplay: true,
          controls: true,
          loop: true,
          muted: true
        }).addClass(VIDEO_PLAYER_CLASSNAME);

        $a.addClass(VIDEO_TOGGLE).data({
          thumbHTML: $a.html(),
          videoPlayer: $vp
        }).after($vp).html(
          '<div style="padding: 2px 20px;">[Свернуть видео]</div>'
        );
        return false; // do not proparate the click
      };

      if( vpMode === 'off' ) return true; // propagate the click
      if( vpMode === 'on' ) return renderVideoPlayer();

      // determine (once) if a video player is necessary:
      const videoExt = $a.attr('href').split('.').pop();
      if( VIDEO_EXTENSIONS.includes(videoExt) ){
        $a.data('vpMode', 'on');
        return renderVideoPlayer();
      } else {
        $a.data('vpMode', 'off');
        return true;
      }
    });

    $('body').on('click', '.' + VIDEO_TOGGLE, function(){
      const $a = $(this);
      $a.removeClass(VIDEO_TOGGLE).html(
        $a.data('thumbHTML') 
      ).data('videoPlayer').remove();
      return false; // do not propagate the click
    });
  });
})();
