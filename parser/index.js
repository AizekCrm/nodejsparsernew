const Page = require('./class/class_page');
const fs = require('fs')

const page = new Page();

//Получаем все ссылки из файла
//В моём случае я использовал уже готовые ссылки на товар но можно реализовать функцию которая будет получать ссылки на товары или коллекции. с помощью
//const browser = await this.puppeteer.launch(args["browser"])
//const page = await browser.newPage();
//await page.goto(url,args["pageconfig"]);
//Фуекция должна быть асинхронной.
async function getdatafromfiles(path) //Здесь я я прочитал файл базовой  функцией nodeJs -> fs.promises.readFile она возвращает мне промис
// данные для дальнейшей обработки в моём случае я преобразую файл из json формата в удобочитаем вид(массив)
{
    return JSON.parse(await fs.promises.readFile(path, {encoding: 'utf-8'}));
}


async function getdatapage(values,config)
{
    let allitems = [];

    //здесь я получаю название коллекции и и в дальнейшем с помощью названия коллекции по ключу получаю все ссылки из массива в данной коллекции
    for (const namecoll in values) {
        console.log('_______' + namecoll + '________')
        for (const value of values[namecoll]) {

            const url = config["url"] + value;

            await page.datapage(url, config)  //<-------------(datapage) ДАННАЯ ФУНКЦИЯ МОДИФИЦИРУЕТСЯ ПОД РАЗНЫЕ САЙТЫ ---------------
                .then((data) => {//then это тоже промисс тоесть я говорю после того как
                    // функция datapage закончит обработку данных и мы получим все данные по товарам с ОДНОЙ страницы
                    // , то массив который мы возвращаем в datapage будет помещен в параметр data и в дальнейшем мы сможем их обработать
                    console.log('___ OK ___')

                    //в моём случа я перебрал массив массивов с масивами в массив с массивами (да, можно запутаться =))
                    data.forEach(elem => {
                        allitems.push(elem);
                    })
                })
        }
    }

    console.log(allitems)

    return allitems;
}

//здесь я сохраняю полученные данные в файл нужного формата в моём случае json
async function savedatainfile(data,namefile,formatwrite)
{
    if (formatwrite === 'json') {
        data = JSON.stringify(data)
    }
    await fs.writeFile('parser/' + formatwrite + '/товары/' + namefile + '.' + formatwrite, data ,(err) => {
        if (!err) {
            console.log('файл записан');
        } else {
            throw err;
        }
    });
}

//здесь я сохраняю полученные данные в файл нужного формата в моём случае json(если указан путь из конфига)
async function savedatainfilebyconfig (data,config) {
    await fs.writeFile(config["filesavepath"], data ,(err) => {
        if (!err) {
            console.log('файл записан');
        } else {
            throw err;
        }
    });
}


//данная функция вызывает все методы асинхронной nodeJs типо синхронно, сделал так потому что функция записи в файл зависима от данных которые мы в неё передаём
// если убрать вызов этой фунции из этого метода то фунция будет работать отдельно и записывать пустой файл
async function index(config) {
    let datafile = '';

    if (config["fileread"] !== '') {
        datafile = await getdatafromfiles(config["fileread"]);
    } else {
        datafile = await getdatafromfiles('');
    }

    const datapage = await getdatapage(datafile,config);

    if (config["filesavepath"] !== '') {
        await savedatainfilebyconfig(datapage,config)
    } else {
        await savedatainfile(datapage,'products','json');
    }
}

//в js ВСЁ является объектом)) поэтому я передал фунцию как объект а вызвал ее уже в файле app.js
module.exports.index = index;