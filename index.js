const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const env = require('dotenv').config();


const weblink = process.env.LINK;
const link = XLSX.readFile('./arquivos antigos/01 404PROMORA FGTS C6 20 - 10 .xlsx');

const worksheet = link.Sheets[link.SheetNames[1]];

const data = XLSX.utils.sheet_to_json(worksheet);

arr = Object.values(data);

/**
  * DATA
*   {
    NOME: 'CARLOS EDUARDO HABY DE BAIRROS',
    CPF: '050.603.099-75',
    CELULAR: '(51)982451824',
    'Valor_Bruto\\': '1.405,38 \\',
    'Valor_Liberado\\': '765,32 \\',
    monitor: ' OBSERVACAO: \\',
    data_registro: '1074 Monitor nome:01 404PROMORA FGTS C6 07.10',
    __EMPTY: 45207.8328125
  },
  * */ 

(async () => {
    // Inicializar o Puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navegar até a página desejada
    await page.goto(weblink, { waitUntil: 'networkidle2' });

    // Esperar a página carregar completamente
    await page.waitForSelector('#name');

    await page.type('#name',"matheus dias");
    await page.type("#cpf", "08312694994");
    await page.type("#birthDate", "20/05/2000");
    await page.type("#whatsappNumber", arr[0].CELULAR);
    await page.click("#term");

    const name = await page.$eval("#name", input => input.value);
    const cpf = await page.$eval("#cpf", input => input.value);
    const aniversario = await page.$eval("#birthDate", input => input.value);
    const whats = await page.$eval("#whatsappNumber", input => input.value);
    const checkbox = await page.$eval("#term", input => input.value);


    await page.click("#btn-simulation");

  console.log(name, cpf, aniversario, whats, checkbox);
  
  await Promise.all([
    page.waitForNavigation(),
    // page.click("#btn-simulation"),
  ]);

  const newPage = await browser.pages().then(page => page[page.length - 1]);
  console.log(newPage.url());
  

    // Fechar o navegador
    // await browser.close();
})();
