const Database = require('../db');
const mysql = require('mysql');


const Logger = requrie('../logger.js');

class Insert
{
    logger = new Logger();
    database = new Database();

    constructor(data) {}

    if (database) {

        const coon = database.coon();


	coon.tuery('INSERT into data SET ?', {data}, (err, results, fields) => {
	  if(err) {
	      return coon.roolback(() => {
		logger.error('Deu erro');
		throw err;
	    });
	  };

	  coon.commit((err) => {
	    if(err) {
	      return coon.roolback(() => {
		logger.error('Deu erro');
		throw err;
	      });
	    }
	    logger.info('Cadastrado com sucesso!');
	    console.log('success!');
	  });

	  console.log("Cadastrado com sucesso: " + results.insertId);
	});
    }
}

module.exports = Insert;
