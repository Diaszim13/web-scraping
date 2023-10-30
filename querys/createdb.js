const mysql = require('mysql');
const Logger = require('../logger.js');
const Database = require('../db.js');


class createDB {

    connection = new Database();
    sql = `CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
        cpf VARCHAR(11),
            celular VARCHAR(15),
                data_nascimento DATE
    ) `;
    constructor() { }
    
    if(connection)
    {
        const coon = connection.coon();
        coon.query(this.sql, (err) => {
            if (err) throw err;
            console.log('Conectado!');
        });

    }

}

module.exports = createDB;