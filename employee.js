// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");

// Create connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Password",
  database: "company_db",
});

//Menu function
const menuOptions = () => {
  //Inquirer with menu options
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
      //Switch case for menu options
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

//Function to view all employees
const viewEmployees = (next) => {
  //Query variable
  const query =
    'SELECT employees.id AS ID, employees.first_name AS FirstName, employees.last_name AS LastName, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id;';
  //Query to database inserting query variable
  connection.query(query, (err, res) => {
    //Throw error
    if (err) throw err;
    //Switch case for next function or display and return to menu
    switch (next) {
      case "Remove":
        return removeEmployee(res);
      case "Update Role":
        return updateEmployeeRole(res, "Employee");
      case "Update Manager":
        return updateEmployeeManager(res);
      default:
        console.table(res);
        menuOptions();
        break;
    }
  });
};

//Function to display employees by department
const viewEmployeesDepartment = () => {
  const query1 = "SELECT * FROM departments";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    //Empty array to store data for prompt
    let departmentChoices = [];
    //Loop through response and store data
    res.forEach((department) => {
      departmentChoices.push(department.name);
    });
    //Inquirer to select department
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
        //Query to view all employee info with ID's substituted for real values and department value matches
        const query2 =
          'SELECT employees.id AS ID, employees.first_name AS FirstName, employees.last_name AS LastName, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id WHERE ?';
        //Query to data searching for matching department name.  Displays and returns to menu.
        connection.query(query2, { name: data.department }, (err, res) => {
          if (err) throw err;
          console.table(res);
          menuOptions();
        });
      });
  });
};

//Function to show all manager's employees
const viewEmployeeByManager = () => {
  //Searches all employees without a manager
  const query1 =
    "SELECT id, first_name, last_name FROM employees WHERE managerID IS null";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    //Array to store manager info from loop through response
    let managerChoices = [];
    res.forEach((manager) => {
      managerChoices.push({
        value: manager.id,
        name: `${manager.first_name} ${manager.last_name}`,
      });
    });
    //Inquirer with response info
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
        //Query to return all employee info where managerID matches
        const query2 =
          'SELECT employees.id AS ID, employees.first_name AS FirstName, employees.last_name AS LastName, title AS Title, name AS Department, salary AS Salary, CONCAT(a.first_name, " ", a.last_name) AS Manager FROM employees LEFT JOIN roles ON employees.roleID = roles.id LEFT JOIN departments ON roles.departmentID = departments.id LEFT JOIN employees a ON employees.managerID = a.id WHERE employees.?';

        connection.query(query2, { managerID: data.manager }, (err, res) => {
          if (err) throw err;
          //Display data and returns to menu
          console.table(res);
          menuOptions();
        });
      });
  });
};

//Function to add employee
const addEmployee = () => {
  //Created an object to store info through multiple inquires
  let newEmployee = {
    first_name: "",
    last_name: "",
    roleID: "",
    managerID: "",
  };
  //Gathers employee's name
  inquirer
    .prompt([
      { message: "What is the employee's first name?", name: "first_name" },
      { message: "What is the employee's last name?", name: "last_name" },
    ])
    .then((data) => {
      //Stores to object
      newEmployee.first_name = data.first_name;
      newEmployee.last_name = data.last_name;
      //Select data from roles table
      const query1 = "SELECT id, title FROM roles";
      connection.query(query1, (err, res) => {
        if (err) throw err;
        //Creating an array for use in inquirer
        let roleArray = [];
        res.forEach((role) => {
          roleArray.push({ value: role.id, name: role.title });
        });
        //Prompts question with stored info
        inquirer
          .prompt({
            type: "list",
            message: "What will be the new employee's role?",
            name: "roleID",
            choices: roleArray,
          })
          .then((data) => {
            //Stores to object
            newEmployee.roleID = data.roleID;
            //Selects managers
            const query3 =
              "SELECT id, first_name, last_name FROM employees WHERE managerID IS null";
            connection.query(query3, (err, res) => {
              if (err) throw err;
              //Creating an array for use in inquirer.  Sorts no manager option
              let managerArray = [{ value: null, name: "N/A" }];
              res.forEach((manager) => {
                managerArray.push({
                  value: manager.id,
                  name: `${manager.first_name} ${manager.last_name}`,
                });
              });
              //Inquirer with manager names
              inquirer
                .prompt({
                  type: "list",
                  message: "Who will the employee report to?",
                  name: "managerID",
                  choices: managerArray,
                })
                .then((data) => {
                  //Stores to object
                  newEmployee.managerID = data.managerID;
                  //Insert new employee into database setting all available options and returns to menu
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

//Function to remove employee
const removeEmployee = (data) => {
  //Store employee info needed for inquirer from data
  let employeeData = [];
  data.forEach((employee) => {
    employeeData.push({
      name: `${employee.FirstName} ${employee.LastName}`,
      value: employee.ID,
    });
  });
  //Prompts with employee info
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
      //Deletes employee where ID matches in database and returns to menu
      const query = "DELETE FROM employees WHERE ?";
      connection.query(query, { id: data.employeeName }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

//Creating object need for updateEmployeeRole and updateEmployeeManager functions
const employeeToUpdate = { id: "" };

//Update employee's role
const updateEmployeeRole = (data, tableName) => {
  //Switch statement to perform proper operation.  Data returned from two functions for employee names and roles
  switch (tableName) {
    case "Employee":
      //Array for inquirer with info from data variable
      const employeeNames = [];
      data.forEach((name) => {
        employeeNames.push({
          name: `${name.FirstName} ${name.LastName}`,
          value: name.ID,
        });
      });
      //Inquirer with stored data
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
          //Updating global object
          employeeToUpdate.id = data.employeeID;
          //Gathers role information
          viewRole("Update Role");
        });
      break;
    //Returns with role info and processes here
    case "Role":
      //Array for inquirer with info from data variable
      const roleNames = [];
      data.forEach((role) => {
        roleNames.push({ name: role.title, value: role.id });
      });
      //Inquirer with stored data
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
          //Updates employee's role info where id matches and returns menu
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

//Updates employee's manager
const updateEmployeeManager = (data) => {
  //Array for inquirer with info from data variable
  const employeeNames = [];
  data.forEach((name) => {
    employeeNames.push({
      name: `${name.FirstName} ${name.LastName}`,
      value: name.ID,
    });
  });
  //Inquirer with stored info
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
      //Stores data in global variable
      employeeToUpdate.id = data.employeeID;
      //Gathers manager's names for inquirer
      const query1 =
        "SELECT id, first_name, last_name FROM employees WHERE managerID IS null";
      connection.query(query1, (err, res) => {
        if (err) throw err;
        //Stores data for inquirer
        managerNames = [{ name: "N/A", value: null }];
        res.forEach((manager) => {
          managerNames.push({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
          });
        });
        //Inquirer with manager's names
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
            //Updates managerID on select employee ID and returns menu
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
};

//Views all department
const viewDepartment = (next) => {
  //Select all from departments table
  const query1 = "SELECT * FROM departments";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    //Send info to other functions for use or displays and returns menu
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

//Adds new deparment
const addDepartment = () => {
  //Inquirer for new department
  inquirer
    .prompt([
      {
        message: "What is the name of the department you would like ot add?",
        name: "departmentName",
      },
    ])
    .then((data) => {
      //Inserts new department in departments table and returns to menu
      const query1 = "INSERT INTO departments SET ?";
      connection.query(query1, { name: data.departmentName }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

//Function to remove department
const removeDepartment = (data) => {
  //Stores data in inquirer friendly format
  const deparmentArray = [];
  data.forEach((department) => {
    deparmentArray.push({ name: department.name, value: department.id });
  });
  inquirer
    .prompt([
      {
        type: "list",
        message: "What department would you like to remove?",
        name: "name",
        choices: deparmentArray,
      },
    ])
    .then((data) => {
      //Deletes department with matching id
      const query1 = "DELETE FROM departments WHERE ?";
      connection.query(query1, { id: data.name }, (err) => {
        if (err) throw err;
        //Deletes roles with matching department id and returns to menu
        const query2 = "DELETE FROM roles WHERE ?";
        connection.query(query2, { departmentID: data.name }, (err) => {
          if (err) throw err;
          menuOptions();
        });
      });
    });
};

//Function to view all roles
const viewRole = (next) => {
  //Gather data from roles table
  const query =
    "SELECT roles.id, title, salary, name FROM roles LEFT JOIN departments ON roles.departmentID = departments.id";
  connection.query(query, (err, res) => {
    if (err) throw err;
    //Sends data to next function or displays and returns to menu
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

//Function to add new role
const addRole = (data) => {
  //Store info for inquirer
  let departmentChoices = [];
  data.forEach((department) =>
    departmentChoices.push({
      name: department.name,
      value: department.id,
    })
  );
  //Object to store info through multiple inquirers
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
      //Stores data to object
      newRole.title = data.title;
      newRole.salary = data.salary;
      newRole.departmentID = data.departmentID;
      //Inserts into role table and returns menu
      const query = "INSERT INTO roles SET ?";
      connection.query(query, newRole, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

//Function to remove role
const removeRole = (data) => {
  //Store data need for inquirer list
  let roleNames = [];
  data.forEach((role) => {
    roleNames.push({ name: role.title, value: role.id });
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
      //Deletes from roles where id matches and returns menu
      const query = "DELETE FROM roles WHERE ?";
      connection.query(query, { id: data.title }, (err) => {
        if (err) throw err;
        menuOptions();
      });
    });
};

//Connect to database
connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection at id ${connection.threadId}`);
  //Displays logo
  console.log(logo({ name: "Employee Manager" }).render());
  //Starts menu
  menuOptions();
});
