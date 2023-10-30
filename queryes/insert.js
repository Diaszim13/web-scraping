const Database = require('../db');
const mysql = require('mysql');


class Insert
{
    database = new Database();

    if (database) {

        const coon = database.coon();

        coon.query('INSERT into data valeus()',)
    }
}


module.exports = Insert;