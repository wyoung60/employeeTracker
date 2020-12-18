const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");

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
        "Add New Employee",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "View Departments",
        "Add New Department",
        "Remove Department",
        "View Roles",
        "Add New Role",
        "Remove Role",
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
        case "Add New Employee":
          return addEmployee();
        case "Remove Employee":
          return viewEmployees("Remove");
        case "Update Employee Role":
          return viewEmployees("Update Role");
        case "Update Employee Manager":
          return viewEmployees("Update Manager");
        case "View Departments":
          return viewDepartment();
        case "Add New Department":
          return addDepartment();
        case "Remove Department":
          return viewDepartment("Remove");
        case "View Roles":
          return viewRole();
        case "Add New Role":
          return viewDepartment("Role");
        case "Remove Role":
          return viewRole("Remove");
        case "Exit":
          connection.end();
      }
    });
};

const viewEmployees = (next) => {
  const query =
    'SELECT employees.id AS ID, employees.first_name AS FirstName, employees.last_name AS LastName, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id;';

  connection.query(query, (err, res) => {
    if (err) throw err;
    switch (next) {
      case "Remove":
        return removeEmployee(res);
      case "Update Role":
        return updateEmployeeRole(res, "Employee");
      case "Update Manager":
        return updateEmployeeManager(res, "Employee");
      default:
        console.table(res);
        menuOptions();
        break;
    }
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
          'SELECT employees.id AS ID, employees.first_name AS FirstName, employees.last_name AS LastName, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id WHERE ?';

        connection.query(query2, { name: data.department }, (err, res) => {
          if (err) throw err;
          console.table(res);
          menuOptions();
        });
      });
  });
};

const viewEmployeeByManager = () => {
  const query1 =
    "SELECT id, first_name, last_name FROM employees WHERE managerID IS null";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    let managerChoices = [];
    res.forEach((manager) => {
      managerChoices.push({
        value: manager.id,
        name: `${manager.first_name} ${manager.last_name}`,
      });
    });
    inquirer
      .prompt([
        {
          type: "list",
          message: "Whose team would you like to see?",
          name: "manager",
          choices: managerChoices,
        },
      ])
      .then((data) => {
        const query2 =
          'SELECT employees.id AS ID, employees.first_name AS FirstName, employees.last_name AS LastName, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id WHERE employees.?';

        connection.query(query2, { managerID: data.manager }, (err, res) => {
          if (err) throw err;
          console.table(res);
          menuOptions();
        });
      });
  });
};

const addEmployee = () => {
  let newEmployee = {
    first_name: "",
    last_name: "",
    roleID: "",
    managerID: "",
  };
  inquirer
    .prompt([
      { message: "What is the employee's first name?", name: "first_name" },
      { message: "What is the employee's last name?", name: "last_name" },
    ])
    .then((data) => {
      newEmployee.first_name = data.first_name;
      newEmployee.last_name = data.last_name;
      query1 = "SELECT id, title FROM roles";
      connection.query(query1, (err, res) => {
        if (err) throw err;
        let roleArray = [];
        res.forEach((role) => {
          roleArray.push({ value: role.id, name: role.title });
        });
        inquirer
          .prompt({
            type: "list",
            message: "What will be the new employee's role?",
            name: "roleID",
            choices: roleArray,
          })
          .then((data) => {
            newEmployee.roleID = parseInt(data.roleID);
            const query3 =
              "SELECT id, first_name, last_name FROM employees WHERE managerID IS null";
            connection.query(query3, (err, res) => {
              if (err) throw err;
              let managerArray = [{ value: null, name: "N/A" }];
              res.forEach((manager) => {
                managerArray.push({
                  value: manager.id,
                  name: `${manager.first_name} ${manager.last_name}`,
                });
              });
              inquirer
                .prompt({
                  type: "list",
                  message: "Who will the employee report to?",
                  name: "managerID",
                  choices: managerArray,
                })
                .then((data) => {
                  newEmployee.managerID = data.managerID;
                  const query4 = "INSERT INTO employees SET ?";
                  connection.query(query4, newEmployee, (err) => {
                    if (err) throw err;
                    menuOptions();
                  });
                });
            });
          });
      });
    });
};

const removeEmployee = (data) => {
  let employeeData = [];
  data.forEach((employee) => {
    employeeData.push({
      name: `${employee.FirstName} ${employee.LastName}`,
      value: employee.ID,
    });
  });
  inquirer
    .prompt([
      {
        type: "list",
        message: "What employee would you like to remove?",
        name: "employeeName",
        choices: employeeData,
      },
    ])
    .then((data) => {
      const query = "DELETE FROM employees WHERE ?";
      connection.query(query, { id: data.employeeName }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

const employeeToUpdate = { id: "" };

const updateEmployeeRole = (data, tableName) => {
  switch (tableName) {
    case "Employee":
      const employeeNames = [];
      data.forEach((name) => {
        employeeNames.push({
          name: `${name.FirstName} ${name.LastName}`,
          value: name.ID,
        });
      });
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employeeID",
            choices: employeeNames,
          },
        ])
        .then((data) => {
          employeeToUpdate.id = data.employeeID;
          viewRole("Update Role");
        });
      break;
    case "Role":
      console.log(employeeToUpdate);
      const roleNames = [];
      data.forEach((role) => {
        roleNames.push({ name: role.title, value: role.id });
      });
      inquirer
        .prompt([
          {
            type: "list",
            message: "What is the employee's new role?",
            name: "newRole",
            choices: roleNames,
          },
        ])
        .then((data) => {
          const query = "UPDATE employees SET ? WHERE ?";
          connection.query(
            query,
            [{ roleID: data.newRole }, { id: employeeToUpdate.id }],
            (err) => {
              if (err) throw err;
            }
          );
          menuOptions();
        });
      break;
  }
};

const updateEmployeeManager = (data, tableName) => {
  switch (tableName) {
    case "Employee":
      const employeeNames = [];
      data.forEach((name) => {
        employeeNames.push({
          name: `${name.FirstName} ${name.LastName}`,
          value: name.ID,
        });
      });
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employeeID",
            choices: employeeNames,
          },
        ])
        .then((data) => {
          employeeToUpdate.id = data.employeeID;
          const query1 =
            "SELECT id, first_name, last_name FROM employees WHERE managerID IS null";
          connection.query(query1, (err, res) => {
            if (err) throw err;
            managerNames = [{ name: "N/A", value: null }];
            res.forEach((manager) => {
              managerNames.push({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id,
              });
            });
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "Who is the employee's new manager?",
                  name: "newManager",
                  choices: managerNames,
                },
              ])
              .then((data) => {
                const query2 = "UPDATE employees SET ? WHERE ?";
                connection.query(
                  query2,
                  [{ managerID: data.newManager }, { id: employeeToUpdate.id }],
                  (err) => {
                    if (err) throw err;
                    menuOptions();
                  }
                );
              });
          });
        });
      break;
  }
};

const viewDepartment = (next) => {
  const query1 = "SELECT * FROM departments";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    switch (next) {
      case "Remove":
        return removeDepartment(res);
      case "Role":
        return addRole(res);
      default:
        console.table(res);
        menuOptions();
    }
  });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        message: "What is the name of the department you would like ot add?",
        name: "departmentName",
      },
    ])
    .then((data) => {
      const query1 = "INSERT INTO departments SET ?";
      connection.query(query1, { name: data.departmentName }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

const removeDepartment = (data) => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What department would you like to remove?",
        name: "name",
        choices: data,
      },
    ])
    .then((data) => {
      const query2 = "DELETE FROM departments WHERE ?";
      connection.query(query2, { name: data.name }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

const viewRole = (next) => {
  const query =
    "SELECT roles.id, title, salary, name FROM roles LEFT JOIN departments ON roles.departmentID = departments.id";
  connection.query(query, (err, res) => {
    if (err) throw err;
    switch (next) {
      case "Remove":
        return removeRole(res);
      case "Update Role":
        return updateEmployeeRole(res, "Role");
      default:
        console.table(res);
        menuOptions();
        break;
    }
  });
};

const addRole = (data) => {
  let departmentChoices = [];
  data.forEach((department) =>
    departmentChoices.push({
      name: department.name,
      value: department.id,
    })
  );
  let newRole = {
    title: "",
    salary: "",
    departmentID: "",
  };
  inquirer
    .prompt([
      {
        message: "What is the name of the role you would like to add?",
        name: "title",
      },
      { message: "What is the salary for the role?", name: "salary" },
      {
        type: "list",
        message: "What department should the role be added to?",
        name: "departmentID",
        choices: departmentChoices,
      },
    ])
    .then((data) => {
      newRole.title = data.title;
      newRole.salary = data.salary;
      newRole.departmentID = data.departmentID;
      const query = "INSERT INTO roles SET ?";
      connection.query(query, newRole, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

const removeRole = (data) => {
  let roleNames = [];
  data.forEach((role) => {
    roleNames.push({ name: role.title });
  });
  inquirer
    .prompt([
      {
        type: "list",
        message: "What role would you like to remove?",
        name: "title",
        choices: roleNames,
      },
    ])
    .then((data) => {
      const query = "DELETE FROM roles WHERE ?";
      connection.query(query, { title: data.title }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  console.log(logo({ name: "Employee Manager" }).render());
  menuOptions();
});
