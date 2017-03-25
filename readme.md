# IIchan Extensions
Набор скриптов, расширяющих стандартный функционал [Вакабы](http://wakaba.c3.cx/).

## Состав:
- [iichan-expand-images.user.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/userscript/iichan-expand-images.user.js) - раскрывалка картинок 
- [iichan-hide-threads.user.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/userscript/iichan-hide-threads.user.js) - скрывалка тредов 
- [iichan-eng-captcha.user.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/userscript/iichan-eng-captcha.user.js) - автоматическое исправление русской раскладки клавиатуры на английскую при вводе капчи  (представляет собой копипасту из [Куклоскрипта](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools))
- [iichan-extensions.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-extensions.js) - все сразу в одном файле

## Фичи:
- Совместим с [Dollchan Extension Tools](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools)
- Не содержит костылей для старых браузеров
- Можно копипастить в wakaba.js
- Можно использовать как юзерскрипт и подключать через [Tampermonkey](https://tampermonkey.net/)
- Легковесный: суммарно занимает менее 10 Кб в несжатом виде

## Сборка:
- Установить [Node.js](https://nodejs.org/), если еще не.
- Установить [Gulp](http://gulpjs.com/): `npm install -g gulp`
- В папке проекта сделать `npm install`.
- Сделать `gulp make`.

В папке *dist* появятся собранные файлы.
