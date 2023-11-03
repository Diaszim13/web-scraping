// @ts-nocheck
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const env = require('dotenv').config();
const mysql = require('mysql');
const Insert = require('./querys/insert.js');
const createDB = require('./querys/createdb.js');

//LOGGER  
const Logger = require('./logger.js');

/**
 * 
O id para acessar a div que tem os dados que serão carregados é esse!
#table - parcLabel
Este cpf pega um certo do banco c6bank
121.212.517 - 74

Assim vem no html os campos que preciso

<div class="col-md-4">
    <p class="m-0 pt-3">Parcelas</p>
    <h3 class="m-0 pb-3"><%=register.qtdParc%> anos</h3>
</div>
<div class="col-md-4">
	<p class="m-0 pt-3">Valor total do empréstimo</p>
	<h3 class="m-0 pb-3">R$ <%=maskMoney(register.totalCreditAccountFGTS.toFixed(2))%></h3>
</div>
<div class="col-md-4">
	<p class="m-0 pt-3">Valor total Liberado</p>
	<h3 class="m-0 pb-3">R$ <%=maskMoney(register.totalCreditLiberty.toFixed(2))%></h3>
</div>


Este é o html quando da erro antes de fazer a simulação
<div aria-labelledby="swal2-title" aria-describedby="swal2-html-container" class="swal2-popup swal2-modal swal2-icon-error swal2-show" tabindex="-1" role="dialog" aria-live="assertive" aria-modal="true" style="display: grid;"><button type="button" class="swal2-close" aria-label="Close this dialog" style="display: none;">×</button><ul class="swal2-progress-steps" style="display: none;"></ul><div class="swal2-icon swal2-error swal2-icon-show" style="display: flex;"><span class="swal2-x-mark">
    <span class="swal2-x-mark-line-left"></span>
    <span class="swal2-x-mark-line-right"></span>
  </span>
</div><img class="swal2-image"
 style="display: none;"><h2 class="swal2-title" id="swal2-title" style="display: block;">Oops...</h2><div class="swal2-html-container"
  id="swal2-html-container" style="display: block;">[31054]
   Não foi possível realizar a simulação, tente utilizar outro navegador! [02/11/2023 21:56:31]</div><input id="swal2-input" class="swal2-input" 
   style="display: none;"><input type="file" class="swal2-file" style="display: none;"><div class="swal2-range" style="display: none;"><input
    type="range"><output></output></div><select id="swal2-select" class="swal2-select" style="display: none;"></select><div class="swal2-radio"
     style="display: none;"></div><label class="swal2-checkbox" style="display: none;"><input type="checkbox" id="swal2-checkbox"><span class="swal2-label">
     </span></label><textarea id="swal2-textarea" class="swal2-textarea" style="display: none;"></textarea><div class="swal2-validation-message" 
     id="swal2-validation-message" style="display: none;"></div><div class="swal2-actions" style="display: flex;"><div class="swal2-loader"></div><button type="button" 
     class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;">OK</button><button type="button" class="swal2-deny swal2-styled" aria-label=""
      style="display: none;">No</button><button type="button" class="swal2-cancel swal2-styled" aria-label="" style="display: none;">Cancel</button></div><div 
      class="swal2-footer" style="display: none;"></div><div class="swal2-timer-progress-bar-container"><div class="swal2-timer-progress-bar" style="display: 
      none;"></div></div></div>
 */

const weblink = process.env.LINK;
const link = XLSX.readFile(process.env.EXCEL);

const worksheet = link.Sheets[link.SheetNames[1]];

const data = XLSX.utils.sheet_to_json(worksheet);

const arr = Object.values(data);

(async () => {
  // Inicializar o Puppeteer
  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();
  const logger = new Logger();

  // const coon = await mysql.createConnection({
  //   host: process.env.db_server,
  //   user: process.env.db_user,
  //   password: process.env.db_pass,
  //   database: process.env.db_db
  // });

  // coon.connect((err) => {
  //   if (err) throw err;

  //   console.log('Conectou: ');
  // });

  // Navegar até a página desejada
  // ALGO COM swal2-title e swal2-content
  for (const data of arr) {
    if (data) {

      await page.goto(weblink, { waitUntil: 'networkidle2' });
      // process.env.CPF = data.CPF;

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

      const pages = await browser.pages();
      const newPage = pages[pages.length - 1];

      if (newPage != null) {
	  //TODO ver aq se vai retornar os dados certo do insert
        logger.info('Pagina aberta com sucesso');
        
        await Promise.all(
          [
            newPage.waitForNavigation({ waitUntil: 'load'}),
          ]
        )

        const tableParcLabel = await newPage.$("#table-parcLabel");

        

        const variableValue = await page.evaluate(() => {
          return {
            'pagamento': register.febrabanId,
            'Quantidade parcelas': register.qtdParc
            , 'total de credito liberado': register.totalCreditLiberty,
            'VALOR DO EMPRESTIMO': register.totalCreditAccountFGTS
          };
        });

        
        

        if (febrabanId)
        {
          
        }

        console.log(variableValue);


        if (tableParcLabel != null)
        {
          const content = await newPage.$eval(el => el.textContent, element);

          if (content)
          {
            logger.info(content);  
          }
        }

        // for (let tag in tags)
        // {
        //   const tagNames = tag.classList;
        //   // if() {}
        //   tagNames.forEach(tagName => {
        //     console.log(tagName);
        //   });
        // }
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
