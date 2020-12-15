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
      choices: ["Add department", "Employees", "Exit"],
    })
    .then((data) => {
      switch (data.userSelection) {
        case "Add department":
          return addDepartment();
        case "Departments":
          console.log("1");
          break;
        case "Employees":
          console.log("2");
        case "Exit":
          connection.end();
      }
    });
};

function addDepartment() {
  inquirer
    .prompt({
      message: "What is the name of the department you would like to add?",
      name: "newDepartment",
    })
    .then((data) => {
      connection.query(
        "INSERT INTO departments SET ?",
        {
          name: data.newDepartment,
        },
        menuOptions()
      );
    });
}

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  menuOptions();
});
