const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const env = require('dotenv').config();
const mysql = require('mysql');

//LOGGER
const Logger = require('./logger');
const logger = new Logger();

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
  // ALGO COM swal2-title e swal2-content
  for (const data of arr) {
    if (data) {
      await page.goto(weblink, { waitUntil: 'networkidle2' });
      process.env.CPF = data.CPF;

      await page.type('#name', "matheus dias");
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

      if (newPage != null) {
        logger.info('Pagina aberta com sucesso');

      }
      else {
        logger.error('Pagina não aberta');
      }
      const result = await newPage.evaluate(async () => {


        const valor = document.querySelector("#val").innerText;
        const valor2 = document.querySelector("#val2").innerText;
        const valor3 = document.querySelector("#val3").innerText;

        const tags = await newPage.$$('div');



        /* 
        const data = document.querySelector("#result").innerText;
        
        const tags = await newPage.$$('div');
    
        if (typeof data == 'text') {
          return data;
        } else {
          // continue;
        }
        */
      });
      //await browser.close();
      setTimeout(() => {
        browser.close();
      }, 5000000);
    }
  }

  /*
   *Buscar e fazer a separação de todas as divs que vem de la
   * */
  //TODO preciso saber quais sao os ids dos campos para preencher


  // if (result) {
  //   const coon = mysql.createConnection({
  //     host: proccess.env.db_server,
  //     user: proccess.env.db_user,
  //     password: proccess.env.db_pass,
  //     database: proccess.env.db_db
  //   });

  //   coon.connect((err) => {
  //     if (err) return false;

  //     console.log('Conectado com sucesso');
  //   });

  //   //TODO aq preciso pegar os dados e tranformar em um objecto e botar no banco nessa variavel
  //   //valuesaq

  //   coon.query('Insert INTO data values (param1, param2, param3, param4)', $valuesaq, (err, result) => {
  //     if (err) throw new err;

  //     console.log('Registrado com sucess, ID: ' + result.id);
  //   });

  //   coon.end((err) => {
  //     if (err) throw new err;

  //     console.log('fechadoa com sucesso');
  //   });
  // } else {
  //   //TODO aq precisa achar um jeito de refazer as requests 
  //   //ter um delimitador ate pegar.
  //   request();
  // }

})()
