const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require('asciiart-logo');

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
    console.log('\x1b[42m%s\x1b[0m', "\n Connected as ID: " + connection.threadId + "\n");
    console.log(logo({
        name: "Employee Tracker",
        borderColor: "bold-green",
        logoColor: "bold-green",
        font: "DOS Rebel"
    }).render());

    start();
});

// used to capitalize user inputs if not already
function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function start() {
    inquirer.prompt({
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
                "Update an employee's role",
                "Update an employee's manager",
                "Exit"
            ]
    }).then(function (answer) {
        switch (answer.action) {
            case "Add a department":
                return addADepartment();
            case "Add a role":
                return addARole();
            case "Add an employee":
                return addAnEmployee();
            case "View departments":
                return viewDepartments();
            case "View roles":
                return viewroles();
            case "View employees":
                return viewEmployees();
            case "Update an employee's role":
                return updateEmployeesRole();
            case "Update an employee's manager":
                return updateEmployeesManager();
            case "Exit":
                console.log("You have exited the application.");
                return connection.end();
        }
    });
}

function addADepartment() {
    inquirer.prompt(
        {
            name: "department",
            type: "input",
            message: "What is the name of the department you want to add?"
        }
    ).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to add the department: ${capFirstLetter(answer.department)}`,
                choices:
                    [
                        "Yes",
                        "No, go back",
                        "Main Menu"
                    ]
            }
        ).then(function (answer2) {
            switch (answer2.confirm) {
                case "Yes":
                    // console.log("Inserting a new department");

                    return connection.query("INSERT INTO department SET ?",
                        {
                            name: capFirstLetter(answer.department),
                        },
                        function (err, res) {
                            if (err) {
                                console.log('\x1b[41m%s\x1b[0m', `\n There is already a department named "${capFirstLetter(answer.department)}". You will be taken back to the main menu \n`);
                                return start();
                            } else {
                                console.log('\x1b[42m%s\x1b[0m', `\n ${res.affectedRows} department named "${capFirstLetter(answer.department)}" has been added!\n`);
                                return start();
                            }
                        }
                    );
                case "No, go back":
                    return addADepartment();
                case "Main Menu":
                    return start();
            }
        });
    });
}

let deptArray = [];
connection.query("SELECT * FROM department ORDER BY id", function (err, res) {
    if (err) throw err;
    res.forEach(element => {
        deptArray.push({ id: element.id, name: element.name });
    });
})

let roleArray = [];
connection.query("SELECT id, title FROM role ORDER BY id", function (err, res) {
    if (err) throw err;
    // console.log(res);
    res.forEach(element => {
        roleArray.push({ id: element.id, name: element.title });
    });
    // console.log(roleArray);
})

let managerArray = [];
connection.query("SELECT id, first_name, last_name FROM employee ORDER BY id", function (err, res) {
    if (err) throw err;
    // console.log(res);
    res.forEach(element => {
        managerArray.push({ id: element.id, name: element.first_name + " " + element.last_name });

    });
    managerArray.push("No manager")
    // console.log(managerArray);
})

let employeeArray = [];
connection.query("SELECT id, first_name, last_name FROM employee ORDER BY id", function (err, res) {
    if (err) throw err;
    // console.log(res);
    res.forEach(element => {
        employeeArray.push({ id: element.id, name: element.first_name + " " + element.last_name });

    });
    // console.log(employeeArray);
})

function correspondingID (input, array) {
    for (let i = 0; i < array.length; i++) {
        if (input === array[i].name) {
            return array[i].id
        } else if (input === "No manager") {
            return null;
        }
    }
}

function addARole() {
    inquirer.prompt([
        {
            name: "role",
            type: "input",
            message: "What is the name of the role you want to add?"
        },
        {
            name: "salary",
            type: "input",
            message: "What is the salary for that role?",
            validate: input => {
                if (input !== "" && input.match(/^\d+(?:\.\d{0,2})?$/) !== null) {
                    return true;
                }
                return "Please enter a valid salary."
            },
        },
        {
            name: "departmentId",
            type: "rawlist",
            message: "What is the department for that role?",
            choices: deptArray
        }
    ]).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to add the Role: ${capFirstLetter(answer.role)}, Salary: $${answer.salary}, Department: ${answer.departmentId}`,
                choices:
                    [
                        "Yes",
                        "No, go back",
                        "Main Menu"
                    ]
            }
        ).then(function (answer2) {
            switch (answer2.confirm) {
                case "Yes":
                    let chosenDept = answer.departmentId
                    // console.log(chosenDept);

                    return connection.query("INSERT INTO role SET ?",
                        {
                            title: capFirstLetter(answer.role),
                            salary: answer.salary,
                            department_id: correspondingID(chosenDept, deptArray)
                        },
                        function (err, res) {
                            if (err) {
                                console.log('\x1b[41m%s\x1b[0m', `\n There is already a role named "${capFirstLetter(answer.role)}". You will be taken back to the main menu \n`);
                                return start();
                            } else {
                                console.log('\x1b[42m%s\x1b[0m', `\n ${res.affectedRows} role named "${capFirstLetter(answer.role)}" has been added!\n`);
                                return start();
                            }
                        }
                    );
                case "No, go back":
                    return addARole();
                case "Main Menu":
                    return start();
            }
        });
    });
}

function addAnEmployee() {
    inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "What is the employee's first name?",
            validate: input => {
                // console.log(input.match(/\d/g));
                if (input !== "" && input.match(/\d/g) === null) {
                    return true;
                }
                return "Please enter a valid first name."
            }
        },
        {
            name: "lastName",
            type: "input",
            message: "What is the employee's last name?",
            validate: input => {
                // console.log(input.match(/\d/g));
                if (input !== "" && input.match(/\d/g) === null) {
                    return true;
                }
                return "Please enter a valid last name."
            }
        },
        {
            name: "roleID",
            type: "rawlist",
            message: "What is the employee's role?",
            choices: roleArray
        },
        {
            name: "managerID",
            type: "rawlist",
            message: "Who is the employee's manager?",
            choices: managerArray
        }
    ]).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to add the Employee: ${capFirstLetter(answer.firstName)} ${capFirstLetter(answer.lastName)}, Role: ${answer.roleID}, Manager: ${answer.managerID}`,
                choices:
                    [
                        "Yes",
                        "No, go back",
                        "Main Menu"
                    ]
            }
        ).then(function (answer2) {
            switch (answer2.confirm) {
                case "Yes":

                    let chosenRole = answer.roleID;
                    // console.log(chosenRole);

                    let chosenManager = answer.managerID;
                    // console.log(chosenManager);

                    return connection.query("INSERT INTO employee SET ?",
                        {
                            first_name: capFirstLetter(answer.firstName),
                            last_name: capFirstLetter(answer.lastName),
                            role_id: correspondingID(chosenRole, roleArray),
                            manager_id: correspondingID(chosenManager, managerArray)
                        },
                        function (err, res) {
                            if (err) {
                                console.log(err);
                                return start();
                            }
                            console.log('\x1b[42m%s\x1b[0m', `\n ${res.affectedRows} employee named "${capFirstLetter(answer.firstName)} ${capFirstLetter(answer.lastName)}" has been added!\n`);
                            return start();
                        }
                    );
                case "No, go back":
                    return addAnEmployee();
                case "Main Menu":
                    return start();
            }
        });
    });
}

function viewDepartments() {
    connection.query(
        `SELECT department.id,
        department.name AS Department
        FROM department
        ORDER BY id;`,
        function (err, res) {
            if (err) {
                console.log(err);
                return start();
            }
            console.table(res)
            return start();
        });
}

function viewroles() {
    connection.query(
        `SELECT role.id,
        role.title AS Title,
        department.name AS Department,
        role.salary AS Salary
        FROM role
            LEFT JOIN department on role.department_id = department.id
        ORDER BY department.name;`,
        function (err, res) {
            if (err) {
                console.log(err);
                return start();
            }
            console.table(res)
            return start();
        });
}

function viewEmployees() {
    connection.query(
        `SELECT employee.id,
        employee.first_name AS FirstName,
        employee.last_name AS LastName,
        role.title as Title,
        department.name AS Department,
        role.salary AS Salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department on role.department_id = department.id
            LEFT JOIN employee manager on manager.id = employee.manager_id
        ORDER BY department.name;`,
        function (err, res) {
            if (err) {
                console.log(err);
                return start();
            }
            console.table(res)
            return start();
        });
}

function updateEmployeesRole() {

    inquirer.prompt([
        {
            name: "employeeName",
            type: "rawlist",
            message: "What is the name of the employee who's role you want to update?",
            choices: employeeArray
        },
        {
            name: "employeeRole",
            type: "rawlist",
            message: "What is the new role for the employee?",
            choices: roleArray
        },
    ]).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to update the role of ${answer.employeeName} to ${answer.employeeRole}?`,
                choices:
                    [
                        "Yes",
                        "No, go back",
                        "Main Menu"
                    ]
            }
        ).then(function (answer2) {
            switch (answer2.confirm) {
                case "Yes":

                    let chosenRole = answer.employeeRole
                    // console.log(chosenRole);

                    let chosenEmployee = answer.employeeName
                    // console.log(chosenEmployee);

                    return connection.query(
                        "UPDATE employee SET ? WHERE ?",
                        [
                            {
                                role_id: correspondingID(chosenRole, roleArray)
                            },
                            {
                                id: correspondingID(chosenEmployee, employeeArray)
                            }
                        ],
                        function (err, res) {
                            if (err) {
                                console.log(err);
                                return start();
                            }
                            console.log('\x1b[42m%s\x1b[0m', `\n ${answer.employeeName}'s role has been updated to ${answer.employeeRole}! \n`);
                            return start();
                        }
                    )
                case "No, go back":
                    return updateEmployeesRole();
                case "Main Menu":
                    return start();
            }
        });
    })
}

function updateEmployeesManager() {

    inquirer.prompt([
        {
            name: "employeeName",
            type: "rawlist",
            message: "What is the name of the employee who's manager you want to update?",
            choices: employeeArray
        },
        {
            name: "employeeManager",
            type: "rawlist",
            message: "Who is the new manager for the employee?",
            choices: managerArray
        },
    ]).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to update the manager of ${answer.employeeName} to ${answer.employeeManager}?`,
                choices:
                    [
                        "Yes",
                        "No, go back",
                        "Main Menu"
                    ]
            }
        ).then(function (answer2) {
            switch (answer2.confirm) {
                case "Yes":

                    let chosenEmployee = answer.employeeName

                    let chosenManager = answer.employeeManager

                    return connection.query(
                        "UPDATE employee SET ? WHERE ?",
                        [
                            {
                                manager_id: correspondingID(chosenManager, managerArray)
                            },
                            {
                                id: correspondingID(chosenEmployee, employeeArray)
                            }
                        ],
                        function (err, res) {
                            if (err) {
                                console.log(err);
                                return start();
                            }
                            console.log('\x1b[42m%s\x1b[0m', `\n ${answer.employeeName}'s manager has been updated to ${answer.employeeManager}! \n`);
                            return start();
                        }
                    )
                case "No, go back":
                    return updateEmployeesManager();
                case "Main Menu":
                    return start();
            }
        });
    })
};
