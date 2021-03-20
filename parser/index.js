const Page = require('./class/class_page');
const fs = require('fs')

const page = new Page();

//Получаем все ссылки из файла
async function getdatafromfiles(path) //Получение ссылок можно осуществить на прямую с сайта записать их файл
{
    return JSON.parse(await fs.promises.readFile(path, {encoding: 'utf-8'}));
}

async function getdatapage(values,config)
{
    let allitems = [];

    for (const namecoll in values) {
        console.log('_______' + namecoll + '________')
        for (const value of values[namecoll]) {

            const url = config["url"] + value;

            await page.datapage(url, config)  //<-------------(datapage) ДАННАЯ ФУНКЦИЯ МОДИФИЦИРУЕТСЯ ПОД РАЗНЫЕ САЙТЫ ---------------
                .then((data) => {
                    console.log('___ OK ___')
                    data.forEach(elem => {
                        allitems.push(elem);
                    })
                })
        }
    }

    console.log(allitems)

    return allitems;
}

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

async function savedatainfilebyconfig (data,config) {
    await fs.writeFile(config["filesavepath"], data ,(err) => {
        if (!err) {
            console.log('файл записан');
        } else {
            throw err;
        }
    });
}

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

module.exports.index = index;