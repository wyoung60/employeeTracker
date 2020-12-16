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
      choices: ["Add department", "Add employee", "Exit"],
    })
    .then((data) => {
      switch (data.userSelection) {
        case "Add department":
          return addDepartment();
        case "Departments":
          console.log("1");
          break;
        case "Add employee":
          return addEmployee();
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

function addEmployee() {
  inquirer
    .prompt([
      {
        message: "What is the employee's first name?",
        name: "first_name",
      },
      { message: "What is the employee's last name?", name: "last_name" },
    ])
    .then((data) => {
      connection.query(
        "INSERT INTO employees SET ?",
        {
          first_name: data.first_name,
          last_name: data.last_name,
        },
        menuOptions()
      );
    });
}

function addRole() {}

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  menuOptions();
});
