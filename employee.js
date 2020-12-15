const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "company_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
});
