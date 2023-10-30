const mysql = require('mysql');
const env = require('dotenv').config();


class Database {

    constructor() {
        const coon = mysql.createConnection({
            host: proccess.env.db_server,
            user: proccess.env.db_user,
            password: proccess.env.db_pass,
            database: proccess.env.db_db
        });

        coon.connect((err) => {
            if (err) return false;

            console.log('Conectado com sucesso');

            return coon;
        });
    }

}


module.exports = Database;