class page {

    puppeteer = ''

    constructor() {
        this.puppeteer = require('puppeteer')
    }

    async datapage(url,args)
    {
        const arraydata = []

        const browser = await this.puppeteer.launch(args["browser"])
        const page = await browser.newPage();

        await page.setViewport({ 'width' : 1920, 'height' : 1080 });

        await page.setUserAgent(args["useragent"]);

        await page.goto(url,args["pageconfig"]);

        //Имитурем клик на сайте
        await page.click(args["click"]);
        await page.waitForSelector('div.v-item-group');

        await page.click(args["click"]);
        await page.waitForSelector('div.v-item-group');

        //Клик на кнопку пагинации
        while(args["pagination"]["access"]) {

            const progresbar = await page.evaluate(elem => {
                elem = document.querySelector('.v-progress-linear.theme--light').getAttribute('aria-valuenow');
                return Promise.resolve(elem);
            })

            console.log(progresbar)

            if (progresbar === '100') {
                break;
            }

            await page.click(args["pagination"]["button"])
            await page.waitForSelector('div.v-item-group');
        }
        //Имитурем клик на сайте

        //Получаем все ссылки на товары
        let links = await page.evaluate(() => {
            const arraylinks = []
            let childs = document.querySelectorAll('.product-list-view__variant__link > a');

            childs.forEach(elem => {
                arraylinks.push(elem.getAttribute('href'));
            })

            return arraylinks;
        })
        //Получаем все ссылки на товары

        //Получаем все данные по товарам
        let count = 1
        for (const link of links) {
            await page.goto(args["baseurl"] + link, args["pageconfig"]);

            let dataitem = await page.evaluate(() => {

                let title = document.querySelector('h1.productTitle').textContent.trim();
                let sku = '';
                let imgs = [];

                //Получаем артикул
                let childs = document.querySelectorAll('div.productFamilyBlock div.rte')
                childs.forEach(elem => {

                    const text = elem.textContent.trim()

                    if (text.indexOf('Номер артикула') !== -1) {
                        sku = text.replace('Номер артикула ','')
                    }
                })
                //Получаем артикул

                //Получаем все картинки товара
                let sliderimgsparent = document.querySelector('div.productSliderMain > div.slick-list');

                let bloks = sliderimgsparent.querySelectorAll('div.slide');

                bloks.forEach(elem => {
                    let indexattr = elem.getAttribute('data-slick-index');
                    if (indexattr.indexOf('-') === -1) {

                        let link = elem.querySelector('a').getAttribute('href');

                        if (imgs.indexOf(link) === -1) {
                            imgs.push(link);
                        }
                    }
                })
                //Получаем все картинки товара

                return {
                    title,
                    sku,
                    imgs
                }
            })

            console.log(count++)
            console.log(dataitem["title"])

            arraydata.push(dataitem)
        }

        await browser.close();

        return arraydata;
    }
}

module.exports = page