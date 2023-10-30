const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const env = require('dotenv').config();
const mysql = require('mysql');
const Insert = require('./querys/insert.js');
const createDB = require('./querys/createdb.js');

//LOGGER
const Logger = require('./logger.js');


const weblink = process.env.LINK;
const link = XLSX.readFile(process.env.EXCEL);

const worksheet = link.Sheets[link.SheetNames[1]];

const data = XLSX.utils.sheet_to_json(worksheet);

const arr = Object.values(data);

(async () => {
  // Inicializar o Puppeteer
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const logger = new Logger();

  const coon = await mysql.createConnection({
    host: process.env.db_server,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_db
  });

  coon.connect((err) => {
    if (err) throw err;

    console.log('Conectou: ');
  });

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

      // @ts-ignore
      const name = await page.$eval("#name", input => input.value);
      // @ts-ignore
      const cpf = await page.$eval("#cpf", input => input.value);
      // @ts-ignore
      const aniversario = await page.$eval("#birthDate", input => input.value);
      // @ts-ignore
      const whats = await page.$eval("#whatsappNumber", input => input.value);
      // @ts-ignore
      const checkbox = await page.$eval("#term", input => input.value);

      let vals = {
        "nome": name,
        "cpf": cpf,
        "celular": whats,
        "data_nascimento": aniversario
      }

      await page.click("#btn-simulation");

      await Promise.all([
        page.waitForNavigation(),      
        // coon.query('INSERT into clientes SET ?', vals, (err, results, fields) => {
        //   if (err) {
        //     return coon.rollback(() => {
        //       logger.error('Deu erro');
        //       throw err;
        //     });
        //   }
        //   else {
        //     console.log('goi');
        //   }
        // })
        // page.click("#btn-simulation"),
      ]);

      const newPage = await browser.pages().then(page => page[page.length - 1]);

      if (newPage != null) {
	  //TODO ver aq se vai retornar os dados certo do insert
        logger.info('Pagina aberta com sucesso');
        
        const result = await newPage.evaluate(async () => {

          const valor1 = document.querySelector("#val");
          const valor2 = document.querySelector("#val2");
          const valor3 = document.querySelector("#val3");

          const tags = await newPage.$$('div');
          
          const data = {'valor1': valor1, 'valor2': valor2, 'valor3': valor3, 'tags': tags};

          if (data)
          {
            // coon.query('INSERT into clientes SET ?', data, (err, results, fields) => {
            //   if (err) {
            //     return coon.rollback(() => {
            //       logger.error('Deu erro');
            //       throw err;
            //     });
            //   }
            //   else {
            //     console.log('goi');
            //   }
            // })
            const insert = new Insert(data);

            if(insert) {
              return true;
            }
          }

        });
      }
      else {
        logger.error('Pagina não aberta');
      }

      //await browser.close();
      setTimeout(() => {
        browser.close();
      }, 5000000);
    }
  }

})()
