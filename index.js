// @ts-nocheck
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const env = require('dotenv').config();

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
  // executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`
  //C:\\Users\\mathe\\AppData\\Local\\Programs\\Opera\\launcher.exe
  const browser = await puppeteer.launch({ headless: false, executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe` });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  const logger = new Logger();


  // Navegar até a página desejada
  // ALGO COM swal2-title e swal2-content
  for (const data of arr) {
    if (data) {
      if (!browser.isConnected()) {
        logger.info('Pagina fechada com sucesso');
        return false;
      }
      await page.goto(weblink, { waitUntil: 'networkidle2', timeout: 0 });
      // process.env.CPF = data.CPF;

      let dados = {
        nome: data['NOME'],
        cpf: data['CPF'],
        celular: data['CELULAR']
      }
      await page.type('#name', dados["nome"]);
      await page.type("#cpf", dados['cpf']);
      await page.type("#birthDate", "20/05/2000");
      await page.type("#whatsappNumber", dados['celular']);
      await page.click("#term");

      await Promise.all([
        page.click("#btn-simulation")
      ]);


      try {
        await Promise.all([
          page.waitForSelector(".swal2-x-mark", { timeout: 5000 })
        ],
          // { waitUntil: 'networkidle2', timeout: 0 }
        );
        const err = await page.evaluate(() => {
          return document.querySelector(".swal2-x-mark");
        });

        if (err != null) {
          logger.error('Não foi possivel encontrar para o cliente: ' + data.nome);
        }
        if (!browser.isConnected()) {
          logger.info('Pagina fechada com sucesso');
          return false;
        }
        continue;

        // if (await page.$eval(".swal2-x-mark", element => element.textContent) !== null) {
        //   logger.error('Não foi possivel encontrar para o cliente: ' + data.nome);
        // }

      } catch (Exception) {
        page.waitForNavigation(),
          logger.info('Pagina aberta com sucesso');
      }



      const pages = await browser.pages();
      const newPage = pages[pages.length - 1];
      await newPage.setDefaultNavigationTimeout(0);
      console.table(newPage);
      if (newPage != null) {
        //TODO ver aq se vai retornar os dados certo do insert
        logger.info('Pagina aberta com sucesso');

        await Promise.all(
          [
            newPage.waitForSelector('#template-result', { timeout: 0 }),
          ]
        )
        if (await newPage.$eval("#template-result", element => element.textContent) !== null) {
          logger.info(data['CPF'] + ' Cadastrado com sucesso!');
        }


        continue;

      }
      else {
        logger.error('Pagina não aberta');
      }

      //await browser.close();

    }
  }
  setTimeout(() => {
    browser.close();
  }, 5000000);
})()
