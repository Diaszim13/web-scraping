// @ts-nocheck
const puppeteer = require('puppeteer-extra');
const XLSX = require('xlsx');
const env = require('dotenv').config();

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StelphPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StelphPlugin());
//LOGGER  
const Logger = require('./logger.js');

const weblink = process.env.LINK;
const link = XLSX.readFile(`./arquivos/${process.env.EXCEL}`);

const worksheet = link.Sheets[link.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(worksheet);

const arr = data.map(Object.values);

// puppeteer.use(stelphPlugin());

(async () => {
  const logger = new Logger();
  const browser = await puppeteer.launch({ headless: true, args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'] });
  let page = await browser.newPage();

  for (const data of arr) {
    if (data) {

      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'platform', {get: () =>  'Win32'})
        Object.defineProperty(navigator, 'productSub', {get: () =>  '20100101'})
        Object.defineProperty(navigator, 'vendor', {get: () =>  ''})
        Object.defineProperty(navigator, 'oscpu', {get: () =>  'Windows NT 10.0; Win64; x64'})
      })

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Gecko/20100101 Firefox/73.0 Chrome/114.0.0.0 Safari/537.36');

      await page.goto(weblink, { waitUntil: 'networkidle0', timeout: 0 });


      await page.setDefaultNavigationTimeout(0);
      if (!browser.isConnected()) {
        logger.info('Pagina fechada com sucesso');
        return false;
      }

      let dados = {
        nome: data[0],
        cpf: data[1],
        nascimento: data[2],
        celular: data[3]
      }


      const date = new Date(dados['nascimento']);
      
      const databr = date.toLocaleDateString('pt-BR');
      let cpf = dados['cpf'].toString();
      if(cpf.length < 11){
        cpf = cpf.padStart(11, '0');
      }

      await page.type('#name', dados["nome"]);
      await page.type("#cpf", cpf);
      await page.type("#birthDate", databr.toString());
      await page.type("#whatsappNumber", dados['celular'].toString());
      await page.click("#term");

      await Promise.all([
        page.click("#btn-simulation")
      ]);


      try {
        await Promise.all([
          page.waitForSelector(".swal2-x-mark", { timeout: 10000 })
        ]);
        
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

        continue;

      } catch (Exception) {
        page.waitForNavigation(),
          logger.info('Pagina aberta com sucesso');
      }
      const tempo = parseInt(process.env.TEMPO, 10);
      await new Promise(resolve => setTimeout(resolve, tempo));
      continue;

    }
  }
  setTimeout(() => {
    browser.close();
  }, 5000);
})()
