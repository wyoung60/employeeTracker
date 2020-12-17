const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Password",
  database: "company_db",
});

const menuOptions = () => {
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      name: "userSelection",
      choices: [
        "View All Employees",
        "View Employees By Department",
        "View Employees By Manager",
        "Exit",
      ],
    })
    .then((data) => {
      switch (data.userSelection) {
        case "View All Employees":
          return viewEmployees();
        case "View Employees By Department":
          return viewEmployeesDepartment();
        case "View Employees By Manager":
          return viewEmployeeByManager();
        case "Exit":
          connection.end();
      }
    });
};

const viewEmployees = () => {
  const query =
    'SELECT employees.id AS ID, employees.first_name AS First_Name, employees.last_name AS Last_Name, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id;';

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
  });
};

const viewEmployeesDepartment = () => {
  const query1 = "SELECT * FROM departments";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    let departmentChoices = [];
    res.forEach((department) => {
      departmentChoices.push(department.name);
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department would you like to see?",
          name: "department",
          choices: departmentChoices,
        },
      ])
      .then((data) => {
        const query2 =
          'SELECT employees.id AS ID, employees.first_name AS First_Name, employees.last_name AS Last_Name, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id WHERE ?';

        connection.query(query2, { name: data.department }, (err, res) => {
          if (err) throw err;
          console.table(res);
          menuOptions();
        });
      });
  });
};

const viewEmployeeByManager = () => {
  const query1 = "SELECT * FROM departments";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    let departmentChoices = [];
    res.forEach((department) => {
      departmentChoices.push(department.name);
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department would you like to see?",
          name: "department",
          choices: departmentChoices,
        },
      ])
      .then((data) => {
        const query2 =
          'SELECT employees.id AS ID, employees.first_name AS First_Name, employees.last_name AS Last_Name, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id WHERE ?';

        connection.query(query2, { name: data.department }, (err, res) => {
          if (err) throw err;
          console.table(res);
          menuOptions();
        });
      });
  });
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  menuOptions();
});

// function addEmployee(departmentOptions, managerList) {
//   inquirer
//     .prompt([
//       {
//         message: "What is the employee's first name?",
//         name: "first_name",
//       },
//       { message: "What is the employee's last name?", name: "last_name" },
//       {
//         type: "list",
//         message: "What role will the employee have?",
//         name: "roleID",
//         choices: departmentOptions,
//       },
//       {
//         type: "list",
//         message: "What role will the employee have?",
//         name: "managerID",
//         choices: departmentOptions,
//       },
//     ])
//     .then((data) => {
//       let roleNumber = departmentOptions.indexOf(data.roleID) + 1;
//       connection.query(
//         "INSERT INTO employees SET ?",
//         {
//           first_name: data.first_name,
//           last_name: data.last_name,
//           roleID: roleNumber,
//         },
//         menuOptions()
//       );
//     });
// }

// function addRole() {
//   inquirer
//     .prompt([
//       { message: "What is the role you would like to add?", name: "title" },
//       { message: "What is the salary of this role?", name: "salary" },
//     ])
//     .then((data) => {
//       connection.query(
//         "INSERT INTO roles SET ?",
//         { title: data.title, salary: data.salary },
//         menuOptions()
//       );
//     });
// }

// function viewEmployees() {
//   const query1 = `ALTER TABLE employees MODIFY COLUMN managerID VARCHAR(30);`;
//   connection.query(query1);
//   const query2 =
//     'UPDATE employees p LEFT JOIN employees tp ON p.managerID = tp.id SET p.managerID = CONCAT(tp.first_name, " ", tp.last_name) WHERE p.managerID = tp.id;';
//   connection.query(query2);
//   const query3 =
//     "SELECT employees.id, first_name, last_name, title, salary, name, managerID FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id;";
//   connection.query(query3, (err, res) => {
//     console.table(res);
//     menuOptions();
//   });
// }

// function viewRoles() {
//   const query = "SELECT * FROM roles";
// }

// function getManagers() {
//   const query =
//     "SELECT first_name, last_name FROM employees WHERE managerID IS null";
//   connection.query(query, (err, res) => {
//     if (err) throw err;
//     let managerList = [];
//     res.forEach((manager) => {
//       managerList.push(`${manager.first_name} ${manager.last_name}`);
//     });
//     console.log(managerList);
//   });
// }

// function addDepartment() {
//   inquirer
//     .prompt({
//       message: "What is the name of the department you would like to add?",
//       name: "newDepartment",
//     })
//     .then((data) => {
//       connection.query(
//         "INSERT INTO departments SET ?",
//         {
//           name: data.newDepartment,
//         },
//         menuOptions()
//       );
//     });
// }
