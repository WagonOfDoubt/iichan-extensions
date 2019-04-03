# IIchan Extensions
Набор скриптов, расширяющих функционал Ычана.

## Состав:
- [iichan-expand-images.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-expand-images.js) - раскрывалка картинок
- [iichan-hide-threads.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-hide-threads.js) - скрывалка тредов
- [iichan-video-player.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-video-player.js) - раскрытие webm
- [iichan-quick-reply.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-quick-reply.js) - форма быстрого ответа
- Опциональные скрипты, которых нет на Ычане:
  - [iichan-eng-captcha.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-eng-captcha.js) - автоматическое исправление русской раскладки клавиатуры на английскую при вводе капчи
  - [iichan-ice-fairy.js](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/dist/iichan-ice-fairy.js) - заменяет имя в /b/ на "Сырно"

## Версии скриптов в /dist/
В папке /dist/ можно найти много по-разному собранных версий одних и тех же скриптов. Что они означают?

- **userscript** - предпочтительный способ тестирования, устанавливается как описано ниже.
- **без префикса** - собранные скрипты как есть, практически соответствуют своим исходникам, просто исходники разделены на несколько файлов, эти же собраны воедино и работоспособны.
- **minified** - то же, что и обычные файлы, но пожатые, чтобы экономить трафик.
- **es5** - Не рекомендуется. Все скрипты написаны на относительно новом стандарте ES6, который поддерживется новыми браузерами, старыми же не поддерживаются на уровне синтаксиса. В папке ES5 код прогнан через Babel, что теоритически обеспечивает совместимость с более старыми браузерами, однако полная работоспособность не гарантируется, так как могут отсутствовать нужные полифиллы, кроме того, скрипты опираются на новые свойства CSS и HTML, чего Babel исправить не может.
- **escaped** - Основной надежный метод для сайта. Скрипты минифицированы, обернуты в строку, eval и try-catch. Работает по принципу все или ничего: старый браузер не распарсит код с новыми стандартами, при этом просто промолчит, и дополнительный функционал будет недоступен. Новый же браузер будет скорее всего поддерживать все функции. Это дает гарантии, что сайт будет выглядеть на старых устройствах и браузерах неотличимо от того, как выглядел всегда, на новых же все будет работать без необходимости ограничиваться старыми стандартами и нужды в ненужных костылях, и без необходимости тестирования кода на всех кофеарках, выпущенных с 1992 года.

## Установка в качестве юзерскрипта

Для установки юзерскрипта скачайте расширение [Violentmonkey](https://violentmonkey.github.io/get-it/) или [Greasemonkey](http://www.greasespot.net/) для вашего браузера.

### IIchan.hk

Опциональные скрипты, которых нет на Ычане, можно установить самостоятельно в качестве юзерскрипта.

- **[[Установть iichan-eng-captcha.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-eng-captcha.user.js)**
- **[[Установть iichan-ice-fairy.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-ice-fairy.user.js)**

Так же можно заменить скрипты Ычана ([expand-images](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-expand-images.user.js), [hide-threads](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-hide-threads.user.js), [video-player](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-video-player.user.js)) более новыми версиями, если таковые имеются. Для этого добавьте в настройки юзерскрипта пользовтаельские @matches `http://iichan.hk/*` и `https://iichan.hk/*` и, чтобы юзерскрипт и скрипты сайта не конфликтовали, внесите в фильтр адблока или носкрипта адрес `iichan.hk/extras/*`.

### Nowere.net

Следующие скрипты могут работать на nowere.net:

- **[[Установть iichan-eng-captcha.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-eng-captcha.user.js)**
- **[[Установть iichan-expand-images.user.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-expand-images.user.js)**
- **[[Установть iichan-eng-video-player.js]](https://github.com/WagonOfDoubt/iichan-extensions/raw/master/dist/userscript/iichan-video-player.user.js)**

## Фичи:
- Не конфликтует с [Dollchan Extension Tools](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools)
- Не содержит костылей для старых браузеров
- Можно копипастить в wakaba.js
- Можно использовать как юзерскрипт и подключать через [Violentmonkey](https://violentmonkey.github.io/get-it/) или [Greasemonkey](http://www.greasespot.net/)
- Легковесный: суммарно занимает менее 10 Кб в несжатом виде
- Ворует печеньки
- Свободная лицензия [MIT](https://github.com/WagonOfDoubt/iichan-extensions/blob/master/LICENSE)

## Подробности о скриптах

### expand-images

![expand-images screenshot](https://raw.githubusercontent.com/WagonOfDoubt/iichan-extensions/master/img/expand-images.png)

- Растягивает изображения внутри постов по щелчку и сворачивает при повторном
- Изображения не вылезают за края экрана при любом размере
- Спойлеры сохраняются при закрытии
- Открывает картинки на новой вкладке, если ширина экрана меньше 10 см (для мобильных устройств)
- Не реагирует на другие типы аттачментов (.swf, .webm, и т.д.)
- Отступ края изображения от края поста одинаков с обеих сторон

### video-player

- Позволяет смотреть прикрепленные webm, mp4, и ogv файлы прямо на странице
- Звук при разворачивании плеера всегда выключен

### hide-threads

![hide-threads screenshot](https://raw.githubusercontent.com/WagonOfDoubt/iichan-extensions/master/img/hide-threads.png)

- Добавляет кнопку [✕] скрытия треда
- Скрытые треды можно быстро посмотреть по наведению на номер (как в кукле)
- Отображает тему скрытого треда или первую строку ОП-поста
- Сохраняет скрытые треды в localStorage
- Можно скрывать треды в каталоге
- Поменять текст кнопки [✕] можно пользовательским стилем, например так:

```css
.iichan-hide-thread-btn::after {
    content: '[Скрыть тред]';
}
```

### quick-reply

- Добавляет кнопку [▶] быстрого ответа
- Работает при ответе как с доски, так и из треда
- Автоматически добавляет >>ссылку на отвечаемый пост в текст ответа
- Введенные данные не пропадают при ответе на другой пост

### eng-captcha

- Представляет собой копипасту из [Куклоскрипта](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools)


### ice-fairy

- Заменяет имя в /b/ на Сырно
- Кроме понедельников
- Изменяет так же имя в постах, добавленных динамически после загрузки страницы, например, при автообновлении треда Куклоскриптом или подгрузке страниц

Если у вас установлен куклоскрипт, того же эффекта можно добиться, применив [спелл](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools/wiki/Spells-ru#rep) автозамены:

`#rep[b](/<span class="(comment|)postername">[^<]+<\/span> +(Вт|Ср|Чт|Пт|Сб|Вс)/g,<span class="$1postername">Сырно</span> $2)`

## См. так же

- [IIchan archive search](https://github.com/WagonOfDoubt/IIchan-archive-search)
- [IIchan catalogue search](https://github.com/aslian/IIchan-catalogue-search) от [@aslian](https://github.com/aslian)
- [Dollchan Extension Tools](https://github.com/SthephanShinkufag/Dollchan-Extension-Tools) от [@SthephanShinkufag](https://github.com/SthephanShinkufag)
- [Стили для Ычана](https://userstyles.org/styles/browse?category=iichan)

## Сборка (для продвинутых бак):
- Установить [Node.js](https://nodejs.org/), если еще не.
- Установить [Gulp](http://gulpjs.com/): `npm install -g gulp`
- В папке проекта сделать `npm install`.
- Сделать `gulp make`.

В папке *dist* появятся собранные файлы.
