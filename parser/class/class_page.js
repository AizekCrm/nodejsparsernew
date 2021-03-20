class page {

    puppeteer = ''

    constructor() {
        this.puppeteer = require('puppeteer')
    }

    async datapage(url,args)
    {
        const arraydata = []

        //Инициализирцем браузер с конфигурациями из массива "const config", если хотим увидеть как работает весь процесс графиески то передайте false в параметр browser: {headless: false}
        const browser = await this.puppeteer.launch(args["browser"])
        //Создаём новую страницу в браузере
        const page = await browser.newPage();

        //Устанавливаем размер окна браузера
        await page.setViewport({ 'width' : 1920, 'height' : 1080 });

        //Агента передаём из конфига, файла app.js
        await page.setUserAgent(args["useragent"]);

        //здесь мы переходим на нужную нам страницу из конфиге, эта основная функция для перехода на нужную страницу, далее будет реализован цикл для парсинга страниц с пагинацией.
        await page.goto(url,args["pageconfig"]);

        //Имитурем клик на сайте. Это функция имитации клика мышкой,
        // есть так же иммтация скрола на мышке или нажатие на кнопку клавиатуры, функционал в puppeteer большой,
        //Данный функционал позволяет нам парсить динамически подгружающиеся данные на странице.
        await page.click(args["click"]);
        //Здесь я говорю скрипту чтобы он подождал полной загрузки страницы и после этого нажал на кнопку, данная функция обязательна.
        await page.waitForSelector('div.v-item-group');

        //из-за косяка на странице клиента у них был открыт таб с товарами и пришлось сначало его закрыть при
        // нажатии и сновая кликнуть на него чтобы он уже прогрузился для отработки скрипта.
        await page.click(args["click"]);
        await page.waitForSelector('div.v-item-group');

        //Клик на кнопку пагинации.Здесь я указал в конфиге true чтобы была проверка на пагинацию на странице.
        //в данном участке кода использовались промисы для возврата значения из колбек функции.Подробности :
        //1. https://www.youtube.com/watch?v=Gpvw-lfVSwg&ab_channel=WebDev%D1%81%D0%BD%D1%83%D0%BB%D1%8F.%D0%9A%D0%B0%D0%BD%D0%B0%D0%BB%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%9B%D1%83%D1%89%D0%B5%D0%BD%D0%BA%D0%BE
        // ---> в данном видео рассказывают что такое коллбек функция.
        //2. https://www.youtube.com/watch?v=1idOY3C1gYU&ab_channel=%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BB%D0%B5%D0%BD%D0%9C%D0%B8%D0%BD%D0%B8%D0%BD
        // ---> в  этом видео более подробно рассказывается что такое промисы и для чего они нужны.
        while(args["pagination"]["access"]) {

            //На странице клиента в качестве пагинации был установлен пргрессбар и я получал значение в процентах при каждом клике на кнопку.
            //Данный метод evalute возвращает уже обработанные данные из коллбека с помощью промиса return Promise.resolve(elem);
            const progresbar = await page.evaluate(elem => {
                //document.querySelector позволяет нам обращаться к елемантам дома к так называемым селекторам
                // в данном примере я обращаюсь к <div class="v-progress-linear theme--light" и его аттрибуту aria-valuenow='сколько то там процентов =)'>
                //если используются более 1 класса в блоке то пишем слитно 2 класса через точку '.v-progress-linear.theme--light'
                elem = document.querySelector('.v-progress-linear.theme--light').getAttribute('aria-valuenow');
                //в данном примере мы возвращаем значение аттрибута
                return Promise.resolve(elem);
            })

            //выводим значение аттрибута на консоль для отслеживания
            console.log(progresbar)

            //и если мы достигнули максимума тоесть 100% прогресс бара это значит мы открыли целиком всю страницу со всем товарами (в моём случае) и цикл завершается.
            if (progresbar === '100') {
                break;
            }

            await page.click(args["pagination"]["button"])
            await page.waitForSelector('div.v-item-group');
        }


        //После того как мы открыли все товары(варианты товара) приступаем к их парсингу.Получаем все ссылки на товары
        let links = await page.evaluate(() => {
            const arraylinks = []
            //здесь я  говорю таким образом с помощью стрелки >, получать только дочерние элементы указанного блока и не более,
            // если указать без стрелки то будут получаться ВСЕ ссылки из данного блока
            let childs = document.querySelectorAll('.product-list-view__variant__link > a');

            //здесь я помещаю все полученные ссылки на товары в массив const arraylinks = [] c помощью цикла .forEach
            childs.forEach(elem => {
                arraylinks.push(elem.getAttribute('href'));
            })

            return arraylinks;
        })
        //Получаем все ссылки на товары

        //далее после того как мы собрали массив с сылками на товары мы начинаем по ним прыгать для сбора данных по одному товару
        //Получаем все данные по товарам
        let count = 1
        for (const link of links) {
            //Как я говорил это основная функция для перехода на страницу, здесь я дополняю базовую ссылку пермалинком на товар
            await page.goto(args["baseurl"] + link, args["pageconfig"]);

            let dataitem = await page.evaluate(() => {

                //здесь я получаю тайтл без лишних элементов textContent.trim() это пробелы и тд
                let title = document.querySelector('h1.productTitle').textContent.trim();
                let sku = '';
                let imgs = [];

                //Получаем артикул товара
                let childs = document.querySelectorAll('div.productFamilyBlock div.rte')
                childs.forEach(elem => {

                    const text = elem.textContent.trim()

                    if (text.indexOf('Номер артикула') !== -1) {
                        sku = text.replace('Номер артикула ','')
                    }
                })

                //Получаем все картинки товара
                let sliderimgsparent = document.querySelector('div.productSliderMain > div.slick-list');

                let bloks = sliderimgsparent.querySelectorAll('div.slide');

                bloks.forEach(elem => {
                    let indexattr = elem.getAttribute('data-slick-index');
                    // в Данном примере у клиента был слайдер с одинаковыми картинками.в Блоке были упорядочены ссылки на картинки
                    // и начинались они с индексом от -2 и до 4, при клике порядок понятное дело менялся
                    // и мне нужны были картинки без дублей, и как раз у картинок дубляжей был индекс с отрицательным знаком
                    // поэтому я указал в условии что если у картинки нет минуса, тоесть -1(true), то записываем её в массив
                    if (indexattr.indexOf('-') === -1) {

                        let link = elem.querySelector('a').getAttribute('href');

                        //доп проверка чтобы в массив не попадали дубли ссылок
                        if (imgs.indexOf(link) === -1) {
                            imgs.push(link);
                        }
                    }
                })


                //Возвращаем собранный массив с нужными данными по товару
                return {
                    title,
                    sku,
                    imgs
                }
            })

            console.log(count++)
            console.log(dataitem["title"])

            //Помещаю собранный массив в общий массив для дальнейшей его обработки в другом месте
            arraydata.push(dataitem)
        }

        //После того как мы закончили работу с парсингом страницы нам необходимо закрыть браузер
        await browser.close();

        return arraydata;
    }
}

//Здесь я передаю инстанс данного класса чтобы использовать данный файл(класс) в качестве модуля в другом месте. В моём случае файл index.js.
module.exports = page