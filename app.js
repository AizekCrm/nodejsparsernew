const start_parser = require('./parser/index');

//Данный конфиг модифицируется под каждый сайт
const config = {
    url: 'https://www.fischerfixing.ru/', //*********** указываем адрес страницы которую будем парсить
    baseurl: 'https://www.fischerfixing.ru/',//*********** указываем адрес базовой страницы сайта, если будем использовать редиректы на другую страницу сайта, например пагинация.
    useragent: '',//указываем агента чтобы при парсинге нас не приняли за бота
    click: '',//указываем на кнопку которую необходимо нажимать, опять же если необходимо
    fileread: '', // если есть файл с готовыми ссылками на товары
    filesavepath: '',//если необходимо сохранить файл с данными псоле парсинга в нужную вам дрирректорию, то указыавем путь, если нет пути то будет использоваться путь указанный в скрипте.
    pagination: {//если на сайте в товарах или коллекциях есть пагинация то включаем данный конфиг и в button передаём блок с указанем класса или же ссылку с классом.
        access: true,
        button: 'a.paging-button'
    },
    pageconfig: {//*********** Данный конфиг говорит о том что, после открытия страницы мы ожидаем полной её прогрузки, и убираем все тайм ауты.
        waitUntil: 'domcontentloaded',
        timeout: 0,
    },
    browser: {//данный конфиг не обязателен, здесь мы говорим что при начале парсинга загружалась страница которую парсим(для првоерки работы парсера), скорость анимации клика, и надо ли открывать инструмент разрабочитка.
        headless: true,
        slowMo: 100,
        devtools: false
    }
}

start_parser.index(config)

//Вся nodejs работает Асинхронно, поэтому в моём проекте я создал некую функцию контейнер ‘index’, асинхронную конечно, которая запускает все мои остальные функции последовательно, сделал я это для того чтобы сначало спарсить данные потом записать их в файл.