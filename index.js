const { prompt } = require ("inquirer");
const logo = require("asciiart-logo");
const db = require("./db/connection");
require("console.table");

const getAllDepartments = 'SELECT * FROM department';

const getAllRoles = `SELECT role.id, role.title, role.salary, department.name AS department
FROM role
LEFT JOIN department ON role.department_id = department.id`;

const getAllEmployees =  `SELECT e.id, e.first_name, e.last_name, role.title AS role, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM employee e
LEFT JOIN role ON e.role_id = role.id
LEFT JOIN department ON role.department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id`;

const addDepartment = 'INSERT INTO department (name) VALUES (?)';

const addRole = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';

const addEmployee = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';

const updateEmployeeRole = 'UPDATE employee SET role_id = ? WHERE id = ?';

init();

function init() {
    const logoText = logo({ name: "Employee Manager" }).render();
    console.log(logoText);
    loadMainPrompts();
}

function loadMainPrompts() {
    prompt([
      {
        type: 'list',
        name: 'main',
        message: 'What would you like to do?',
        choices: [
          'View All Employees',
          'Add An Employee',
          'Update An Employee Role',
          'View All Roles',
          'Add A Role',
          'View All Departments',
          'Add A Department',
          'Quit'
        ]
      }
    ]).then((answers) => {
      switch (answers.main) {
        case 'View All Employees':
          db.query(getAllEmployees, (err, results) => {
            if (err) throw err;
            console.table(results);
            loadMainPrompts();
          });
          break;
        case 'Add An Employee':
          db.query(getAllRoles, (err, roles) => {
    if (err) throw err;
    db.query(getAllEmployees, (err, managers) => {
      if (err) throw err;

      prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?",
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?",
        },
        {
          type: "list",
          name: "role_id",
          message: "What is the employee's role?",
          choices: roles.map(role => ({ name: role.title, value: role.id }))
        },
        {
          type: "list",
          name: "manager_id",
          message: "Who is the employee's manager?",
          choices: managers.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }))
        },
      ]).then((answers) => {
        db.query(
          addEmployee,
          [
            answers.first_name,
            answers.last_name,
            answers.role_id,
            answers.manager_id,
          ],
          (err, results) => {
            if (err) throw err;
            console.log("Employee added!");
            loadMainPrompts();
          }
        );
      });
    });
  });
          break;
        case 'Update An Employee Role':
          db.query(getAllEmployees, (err, employee) => {
            if (err) throw err;
          db.query(getAllRoles, (err, role) => {
            if (err) throw err;
              prompt([
              {
                type: "list",
                name: "employee_role",
                message: "which employees role would you like to update?",
                choices: employee.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
              },
              {
                type: "list",
                name: "role_employee",
                message: "Which role would you like to assign the selected employee",
                choices: role.map(role => ({ name: role.title, value: role.id }))
              },
            ]).then((answers) => {
              db.query(updateEmployeeRole,
                [
                  answers.role_employee,
                  answers.employee_role,
                ],
                (err, results) => {
                  if (err) throw err;
                  console.log("Employee Role Updated!");
                  loadMainPrompts();
                }
              );
            });
          });
        });
          break;
        case 'View All Roles':
          db.query(getAllRoles, (err, results) => {
            if (err) throw err;
            console.table(results);
            loadMainPrompts();
          });
          break;
          case 'Add A Role':
            db.query(getAllDepartments, (err, departments) => {
              if (err) throw err;
              prompt([
                {
                  type: "input",
                  name: "role_name",
                  message: "What is the name of the role?",
                },
                {
                  type: "input",
                  name: "salary",
                  message: "What is the salary of this role?",
                },
                {
                  type: "list",
                  name: "department_id",
                  message: "What department does this role belong to?",
                  choices: departments.map(department => ({ name: department.name, value: department.id }))
                },
              ]).then((answers) => {
                db.query(
                  addRole,
                  [
                    answers.role_name,
                    answers.salary,
                    answers.department_id,
                  ],
                  (err, results) => {
                    if (err) throw err;
                    console.log("Role added!");
                    loadMainPrompts();
                  }
                );
              });
            });
            break;
          case 'View All Departments':
            db.query(getAllDepartments, (err, results) => {
              if (err) throw err;
              console.table(results);
              loadMainPrompts();
            });
            break;
          case 'Add A Department':
            prompt([
              {
                type: "input",
                name: "department_name",
                message: "What is the name of the new department?",
              },
            ]).then((answers) => {
              db.query(
                addDepartment,
                [
                  answers.department_name,
                ],
                (err, results) => {
                  if (err) throw err;
                  console.log("Department added!");
                  loadMainPrompts();
                }
              );
            });
            break;
        case 'Quit':
          process.exit(0);
      }
    });
  }