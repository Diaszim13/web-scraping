const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const env = require('dotenv').config();


const weblink = process.env.LINK;
const link = XLSX.readFile(process.env.EXCEL);

const worksheet = link.Sheets[link.SheetNames[1]];

const data = XLSX.utils.sheet_to_json(worksheet);

arr = Object.values(data);


(async () => {
    // Inicializar o Puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navegar até a página desejada
    await page.goto(weblink, { waitUntil: 'networkidle2' });

    // Esperar a página carregar completamente
    await page.waitForSelector('#name');

    await page.type('#name',"matheus dias");
    await page.type("#cpf", process.env.CPF);
    await page.type("#birthDate", "20/05/2000");
    await page.type("#whatsappNumber", arr[0].CELULAR);
    await page.click("#term");

    const name = await page.$eval("#name", input => input.value);
    const cpf = await page.$eval("#cpf", input => input.value);
    const aniversario = await page.$eval("#birthDate", input => input.value);
    const whats = await page.$eval("#whatsappNumber", input => input.value);
    const checkbox = await page.$eval("#term", input => input.value);


    await page.click("#btn-simulation");

  
  await Promise.all([
    page.waitForNavigation(),
    // page.click("#btn-simulation"),
  ]);

  const newPage = await browser.pages().then(page => page[page.length - 1]);
  
  //TODO preciso saber quais sao os ids dos campos para preencher
  const result = await newPage.evaluate(() => {
    const data = document.querySelector("#result").innerText;
    return data;
  });

  

    // Fechar o navegador
    // await browser.close();
})();
