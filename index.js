// @ts-nocheck
const puppeteer = require('puppeteer-extra');
const XLSX = require('xlsx');
const env = require('dotenv').config();

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

//LOGGER  
const Logger = require('./logger.js');

const weblink = process.env.LINK;
const link = XLSX.readFile(process.env.EXCEL);

const worksheet = link.Sheets[link.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(worksheet);

const arr = data.map(Object.values);

(async () => {
  // Inicializar o Puppeteer
  // executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`
  //C:\\Users\\mathe\\AppData\\Local\\Programs\\Opera\\launcher.exe

  const logger = new Logger();
  const browser = await puppeteer.launch({ headless: false });

  // Navegar até a página desejada
  // ALGO COM swal2-title e swal2-content
  for (const data of arr) {
    if (data) {
      const page = await browser.newPage();
      await page.goto(weblink, { waitUntil: 'networkidle0', timeout: 0 });


      await puppeteer.use(RecaptchaPlugin({
          provider: { id: '2captcha', token: process.env.recapcha },
          visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
        })
      );
      let { captchas } = await page.findRecaptchas()
      let { solutions } = await page.getRecaptchaSolutions(captchas)
      let { solved, error } = await page.enterRecaptchaSolutions(solutions)

      await page.setDefaultNavigationTimeout(0);
      if (!browser.isConnected()) {
        logger.info('Pagina fechada com sucesso');
        return false;
      }
      // process.env.CPF = data.CPF;

      // let val = await page.waitForSelector('#recaptcha-token', { timeout: 0 });

        await page.solveRecaptchas()
      
      let dados = {
        nome: data[0],
        cpf: data[1],
        nascimento: data[2],
        celular: data[3]
      }

      const date = new Date(dados['nascimento']);

      const databr = date.toLocaleDateString('pt-BR');

      await page.type('#name', dados["nome"]);
      await page.type("#cpf", dados['cpf'].toString());
      await page.type("#birthDate", databr.toString());
      await page.type("#whatsappNumber", dados['celular'].toString());
      await page.click("#term");

      await Promise.all([
        page.click("#btn-simulation")
      ]);


      try {
        await Promise.all([
          page.waitForSelector(".swal2-x-mark", { timeout: 10000 })
        ],
          // { waitUntil: 'networkidle2', timeout: 0 }
        );
        const err = await page.evaluate(() => {
          return document.querySelector(".swal2-x-mark");
        });

        if (err != null) {
          logger.error('Não foi possivel encontrar para o cliente: ' + dados["nome"]);
        }
        if (!browser.isConnected()) {
          logger.info('Pagina fechada com sucesso');
          return false;
        }
        await page.close();
        browser.close();
        continue;

        // if (await page.$eval(".swal2-x-mark", element => element.textContent) !== null) {
        //   logger.error('Não foi possivel encontrar para o cliente: ' + data.nome);
        // }

      } catch (Exception) {
        page.waitForNavigation(),
          logger.info('Pagina aberta com sucesso');
      }


      browser.on('targetCreated', async target => {
        const newPage = await target.pages();
        console.log(newPage.url());
      });

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
