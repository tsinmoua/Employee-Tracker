var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",
    password: "root",

    database: "employee_tracker_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as ID: " + connection.threadId + "\n");
    start();
});

function start() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices:
                [
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "View departments",
                    "View roles",
                    "View employees",
                    "Update employee roles",
                    "Exit"
                ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add a department":
                    addADepartment();
                    break;
                case "Add a role":
                    addARole();
                    break;
                case "Add an employee":
                    addAnEmployee();
                    break;
                case "View departments":
                    viewDepartments();
                    break;
                case "View roles":
                    viewroles();
                    break;
                case "View employees":
                    viewEmployees();
                    break;
                case "Update employee roles":
                    updateEmployeeRoles();
                    break;
                case "EXIT":
                    console.log("You have exited the application");
                    connection.end();
            }
        });
}