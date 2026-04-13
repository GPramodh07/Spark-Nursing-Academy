const mysql = require('mysql2');

const conn = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "sparks"
});

conn.connect(error => {
    if(error)
    {
        console.log("Error in connection");
    }
    else
    {
        console.log("Connected successfully");
    }
});

module.exports = conn;
