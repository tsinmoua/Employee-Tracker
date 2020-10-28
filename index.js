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
                "View employees by manager",
                "Update an employee's role",
                "Update an employee's manager",
                "Delete a department",
                "Delete a role",
                "Delete an employee",
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
            case "View employees by manager":
                return viewEmployeesByManager();
            case "Update an employee's role":
                return updateEmployeesRole();
            case "Update an employee's manager":
                return updateEmployeesManager();
            case "Delete a department":
                return deleteDepartment();
            case "Delete a role":
                return deleteRole();
            case "Delete an employee":
                return deleteEmployee();
            case "Exit":
                console.log('\x1b[42m%s\x1b[0m', "\n You have exited the application.");
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

function correspondingID(input, array) {
    for (let i = 0; i < array.length; i++) {
        if (input === array[i].name) {
            return array[i].id
        } else if (input === "No manager") {
            return null;
        }
    }
}

function addARole() {

    connection.query("SELECT * FROM department ORDER BY id", function (err, res) {
        if (err) throw err;

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
                choices: res
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
                                department_id: correspondingID(chosenDept, res)
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
    })
}

function addAnEmployee() {

connection.query("SELECT id, title AS name FROM role ORDER BY id", function (err, res) {
    connection.query("SELECT id, CONCAT(first_name, ' ',last_name) AS name FROM employee ORDER BY id", function (err, res2) {
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
            choices: res
        },
        {
            name: "managerID",
            type: "rawlist",
            message: "Who is the employee's manager?",
            choices: [...res2, "No manager"]
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
                            role_id: correspondingID(chosenRole, res),
                            manager_id: correspondingID(chosenManager, res2)
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
    })
})
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
        employee.first_name AS 'First Name',
        employee.last_name AS 'Last Name',
        department.name AS Department,
        role.title as Title,
        role.salary AS Salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS Manager 
        FROM employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON manager.id = employee.manager_id
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

function viewEmployeesByManager() {
    inquirer.prompt(
        {
            name: "managerName",
            type: "rawlist",
            message: "Who is the manager of the employees you want to view?",
            choices: employeeArray
        }
    ).then(function (answer) {
        connection.query(
            `SELECT employee.id,
            employee.first_name AS 'First Name',
            employee.last_name AS 'Last Name',
            department.name AS Department,
            role.title as Title,
            CONCAT(manager.first_name, ' ', manager.last_name) AS Manager 
            FROM employee 
                LEFT JOIN role ON employee.role_id = role.id 
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON manager.id = employee.manager_id
                WHERE CONCAT(manager.first_name, ' ', manager.last_name) = ?
            ORDER BY department.name;`, [answer.managerName],
            function (err, res) {
                if (err) {
                    console.log(err);
                    return start();
                }
                console.table(res)
                return start();
            });

    });
}

function updateEmployeesRole() {

    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee ORDER BY id", function (err, res) {
        connection.query("SELECT id, title AS name FROM role ORDER BY id", function (err, res2) {

    inquirer.prompt([
        {
            name: "employeeName",
            type: "rawlist",
            message: "What is the name of the employee who's role you want to update?",
            choices: res
        },
        {
            name: "employeeRole",
            type: "rawlist",
            message: "What is the new role for the employee?",
            choices: res2
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
                                role_id: correspondingID(chosenRole, res2)
                            },
                            {
                                id: correspondingID(chosenEmployee, res)
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
})
    })
}

function updateEmployeesManager() {

    connection.query("SELECT id, CONCAT(first_name, ' ',last_name) AS name FROM employee ORDER BY id", function (err, res) {

    inquirer.prompt([
        {
            name: "employeeName",
            type: "rawlist",
            message: "What is the name of the employee who's manager you want to update?",
            choices: res
        },
        {
            name: "employeeManager",
            type: "rawlist",
            message: "Who is the new manager for the employee?",
            choices: [...res, "No manager"]
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
                                manager_id: correspondingID(chosenManager, res)
                            },
                            {
                                id: correspondingID(chosenEmployee, res)
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
    })
};

function deleteDepartment() {

    connection.query("SELECT * FROM department ORDER BY id", function (err, res) {

    inquirer.prompt(
        {
            name: "department",
            type: "rawlist",
            message: "What is the name of the department you want to delete?",
            choices: res
        }
    ).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to delete the department: ${answer.department}`,
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
                    return connection.query("DELETE FROM department WHERE name = ?", [answer.department],
                        function (err, res) {
                            if (err) {
                                console.log(err);
                                return start();
                            } else {
                                console.log('\x1b[42m%s\x1b[0m', `\n ${res.affectedRows} department named "${answer.department}" has been deleted!\n`);
                                return start();
                            }
                        }
                    );
                case "No, go back":
                    return deleteDepartment();
                case "Main Menu":
                    return start();
            }
        });
    });
})
}

function deleteRole() {

    connection.query("SELECT id, title AS name FROM role ORDER BY id", function (err, res) {

    inquirer.prompt(
        {
            name: "role",
            type: "rawlist",
            message: "What is the name of the role you want to delete?",
            choices: res
        }
    ).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to delete the role: ${answer.role}`,
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
                    return connection.query("DELETE FROM role WHERE title = ?", [answer.role],
                        function (err, res) {
                            if (err) {
                                console.log(err);
                                return start();
                            } else {
                                console.log('\x1b[42m%s\x1b[0m', `\n ${res.affectedRows} role named "${answer.role}" has been deleted!\n`);
                                return start();
                            }
                        }
                    );
                case "No, go back":
                    return deleteRole();
                case "Main Menu":
                    return start();
            }
        });
    });
})
}

function deleteEmployee() {

    connection.query("SELECT id, CONCAT(first_name, ' ',last_name) AS name FROM employee ORDER BY id", function (err, res) {

    inquirer.prompt(
        {
            name: "employee",
            type: "rawlist",
            message: "What is the name of the employee you want to delete?",
            choices: res
        }
    ).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to delete the employee: ${answer.employee}`,
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
                    return connection.query("DELETE FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?", [answer.employee],
                        function (err, res) {
                            if (err) {
                                console.log(err);
                                return start();
                            } else {
                                console.log('\x1b[42m%s\x1b[0m', `\n ${res.affectedRows} employee named "${answer.employee}" has been deleted!\n`);
                                return start();
                            }
                        }
                    );
                case "No, go back":
                    return deleteEmployee();
                case "Main Menu":
                    return start();
            }
        });
    });
})
}