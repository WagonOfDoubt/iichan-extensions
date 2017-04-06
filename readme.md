# IIchan Extensions
Набор скриптов, расширяющих функционал Ычана.

## Состав:
- [iichan-expand-images.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-expand-images.js) - раскрывалка картинок 
- [iichan-hide-threads.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-hide-threads.js) - скрывалка тредов 
- [iichan-eng-captcha.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-eng-captcha.js) - автоматическое исправление русской раскладки клавиатуры на английскую при вводе капчи
- [iichan-extensions.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-extensions.js) - все сразу в одном файле
- Опциональные скрипты, не вохдящие в *iichan-extensions.js*:
	- [iichan-ice-fairy.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-ice-fairy.js) - заменяет имя в /b/ на "Сырно"

## Установка в качестве юзерскрипта

Для установки юзерскрипта скачайте расширение [Tampermonkey](https://tampermonkey.net/) или [Greasemonkey](http://www.greasespot.net/) для вашего браузера.

- **[[Установть iichan-expand-images.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-expand-images.user.js)**
- **[[Установть iichan-hide-threads.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-hide-threads.user.js)**
- **[[Установть iichan-eng-captcha.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-eng-captcha.user.js)**
- **[[Установть iichan-ice-fairy.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-ice-fairy.user.js)**

## Фичи:
- Совместим с [Dollchan Extension Tools](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools)
- Не содержит костылей для старых браузеров
- Можно копипастить в wakaba.js
- Можно использовать как юзерскрипт и подключать через [Tampermonkey](https://tampermonkey.net/) или [Greasemonkey](http://www.greasespot.net/)
- Легковесный: суммарно занимает менее 10 Кб в несжатом виде

## Подробности о скриптах

### expand-images

![img](https://raw.githubusercontent.com/WagonOfDoubt/iichan-extensions/master/img/expand-images.png)

- Растягивает изображения внутри постов по щелчку и сворачивает при повторном
- Изображения не вылезают за края экрана при любом размере
- Спойлеры сохраняются при закрытии
- Открывает картинки на новой вкладке, если ширина экрана меньше 10 см (для мобильных устройств)
- Не реагирует на другие типы аттачментов (.swf, .webm, и т.д.)
- Отступ края изображения от края поста одинаков с обеих сторон

### hide-threads

![img](https://raw.githubusercontent.com/WagonOfDoubt/iichan-extensions/master/img/hide-threads.png)

- Добавляет кнопку [-] скрытия треда
- Скрытые треды можно быстро посмотреть по наведению на номер (как в кукле)
- Отображает тему скрытого треда или первую строку ОП-поста
- Сохраняет скрытые треды в localStorage

### eng-captcha

- Представляет собой копипасту из [Куклоскрипта](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools)


### ice-fairy

- Заменяет имя в /b/ на Сырно
- Кроме понедельников
- Изменяет так же имя в постах, добавленных динамически после загрузки страницы, например, при автообновлении треда Куклоскриптом или подгрузке страниц

Если у вас установлен куклоскрипт, того же эффекта можно добиться, применив [спелл](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/wiki/Spells-ru#rep) автозамены:

`#rep[b](/<span class="(comment|)postername">[^<]+<\/span> +(Вт|Ср|Чт|Пт|Сб|Вс)/g,<span class="$1postername">Сырно</span> $2)`

## См. так же

- [IIchan catalogue search](https://github.com/aslian/IIchan-catalogue-search) от [@aslian](https://github.com/aslian)
- [Dollchan Extension Tools](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools) от [@SthephanShinkufag](https://github.com/SthephanShinkufag)

## Сборка (для продвинутых бак):
- Установить [Node.js](https://nodejs.org/), если еще не.
- Установить [Gulp](http://gulpjs.com/): `npm install -g gulp`
- В папке проекта сделать `npm install`.
- Сделать `gulp make`.

В папке *dist* появятся собранные файлы.
