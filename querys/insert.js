const Database = require('../db');
const mysql = require('mysql');


const Logger = require('../logger.js');

class Insert {
    logger = new Logger();
    database = new Database();

    data = {}; 

    constructor(data) { 
        this.data = data;
    }

    if(database) {
        const coon = database.coon();
        
        coon.query('INSERT into data SET ?', this.data , (err, results, fields) => {
            if (err) {
                return coon.roolback(() => {
                    this.logger.error('Deu erro');
                    throw err;
                });
            };

            coon.commit((err) => {
                if (err) {
                    return coon.roolback(() => {
                        this.logger.error('Deu erro');
                        throw err;
                    });
                }
                this.logger.info('Cadastrado com sucesso!');
                console.log('success!');
            });

            console.log("Cadastrado com sucesso: " + results.insertId);
        });
    }
}

module.exports = Insert;
