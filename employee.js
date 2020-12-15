const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "company_db",
});

const menuOptions = () => {
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      name: "userSelection",
      choices: ["Departments", "Employees", "Exit"],
    })
    .then((data) => {
      switch (data.userSelection) {
        case "Departments":
          console.log("1");
        case "Employees":
          console.log("2");
        case "Exit":
          connection.end();
      }
    });
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  menuOptions();
});
