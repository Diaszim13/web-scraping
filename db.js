const mysql = require('mysql');
const env = require('dotenv').config();


    
this.coon = mysql.createConnection({
    host: process.env.db_server,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_db
});

this.coon.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }

    console.log('Connected to database with threadId: ' + this.coon.threadId);
});

