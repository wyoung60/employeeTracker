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
      choices: [
        "Add department",
        "Add employee",
        "Add role",
        "View Employees",
        "Exit",
      ],
    })
    .then((data) => {
      switch (data.userSelection) {
        case "Add department":
          return addDepartment();
        case "Departments":
          console.log("1");
          break;
        case "Add employee":
          connection.query("Select * FROM departments", (err, res) => {
            if (err) throw err;
            let departmentOptions = [];
            res.forEach((job) => {
              departmentOptions.push(job.name);
            });
            addEmployee(departmentOptions);
          });

          break;
        case "Add role":
          return addRole();
        case "View Employees":
          return viewEmployees();
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

function addEmployee(departmentOptions) {
  inquirer
    .prompt([
      {
        message: "What is the employee's first name?",
        name: "first_name",
      },
      { message: "What is the employee's last name?", name: "last_name" },
      {
        type: "list",
        message: "What role will the employee have?",
        name: "roleID",
        choices: departmentOptions,
      },
    ])
    .then((data) => {
      let roleNumber = departmentOptions.indexOf(data.roleID) + 1;
      connection.query(
        "INSERT INTO employees SET ?",
        {
          first_name: data.first_name,
          last_name: data.last_name,
          roleID: roleNumber,
        },
        menuOptions()
      );
    });
}

function addRole() {
  inquirer
    .prompt([
      { message: "What is the role you would like to add?", name: "title" },
      { message: "What is the salary of this role?", name: "salary" },
    ])
    .then((data) => {
      connection.query(
        "INSERT INTO roles SET ?",
        { title: data.title, salary: data.salary },
        menuOptions()
      );
    });
}

function viewEmployees() {
  const query =
    "SELECT employees.id, first_name, last_name, title, salary FROM employees LEFT JOIN roles ON employees.roleID = roles.id;";
  connection.query(query, (err, res) => {
    console.table(res);
    menuOptions();
  });
}

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  menuOptions();
});
