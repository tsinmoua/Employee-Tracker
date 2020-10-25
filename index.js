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
                "Update employee roles",
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
            case "Update employee roles":
                return updateEmployeeRoles();
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

                    connection.query("INSERT INTO department SET ?",
                        {
                            name: capFirstLetter(answer.department),
                        },
                        function (err, res) {
                            if (err) {
                                console.log(`\n \n There is already a department named "${capFirstLetter(answer.department)}". You will be taken back to the main menu \n`);
                                return start();
                            } else {
                                console.log(`\n \n ${res.affectedRows} department named "${capFirstLetter(answer.department)}" has been added!\n`);
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

function addARole() {

    let deptArray = [];

    connection.query("SELECT * FROM department ORDER BY id", function (err, res) {
        if (err) throw err;
        res.forEach(element => {
            deptArray.push({ id: element.id, name: element.name });
        });
    })

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
            type: "list",
            message: "What is the department for that role?",
            choices: deptArray
        }
    ])
        .then(function (answer) {
            inquirer.prompt(
                {
                    name: "confirm",
                    type: "rawlist",
                    message: `Are you sure want to add the role: ${capFirstLetter(answer.role)}, $${answer.salary}, ${answer.departmentId}`,
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

                        console.log("--------------------ID------------------");
                        // console.log(answer.departmentId.id);
                        let chosenDept = answer.departmentId
                        // console.log(chosenDept);
                        const deptID = function (dept) {
                            for (let i = 0; i < deptArray.length; i++) {
                                if (dept === deptArray[i].name) {
                                    return deptArray[i].id
                                }
                            }
                        }
                        // console.log(deptID(chosenDept));

                        connection.query("INSERT INTO role SET ?",
                            {
                                title: capFirstLetter(answer.role),
                                salary: answer.salary,
                                department_id: deptID(chosenDept)
                            },
                            function (err, res) {
                                if (err) {
                                    console.log(`\n \n There is already a role named "${capFirstLetter(answer.role)}". You will be taken back to the main menu \n`);
                                    return start();
                                } else {
                                    console.log(`\n \n ${res.affectedRows} role named "${capFirstLetter(answer.role)}" has been added!\n`);
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
        managerArray.push("This employee doesn't have a manager")
        // console.log(managerArray);
    })

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
            type: "list",
            message: "What is the employee's role?",
            choices: roleArray
        },
        {
            name: "managerID",
            type: "list",
            message: "Who is the employee's manager?",
            choices: managerArray
        }
    ]).then(function (answer) {
        inquirer.prompt(
            {
                name: "confirm",
                type: "rawlist",
                message: `Are you sure want to add the employee: ${capFirstLetter(answer.firstName)} ${capFirstLetter(answer.lastName)}, ${answer.roleID}, with the manager: ${answer.managerID}`,
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

                    let chosenRole = answer.roleID
                    // console.log(chosenRole);
                    const roleID = function (role) {
                        for (let i = 0; i < roleArray.length; i++) {
                            if (role === roleArray[i].name) {
                                return roleArray[i].id
                            }
                        }
                    }
                    // console.log(roleID(chosenRole));

                    let chosenManager = answer.managerID
                    // console.log(chosenManager);
                    const managerID = function (manager) {
                        for (let i = 0; i < managerArray.length; i++) {
                            if (manager === managerArray[i].name) {
                                return managerArray[i].id
                            } else if (manager === "This employee doesn't have a manager") {
                                return null;
                            }
                        }
                    }
                    // console.log(managerID(chosenManager));

                    return connection.query("INSERT INTO employee SET ?",
                        {
                            first_name: capFirstLetter(answer.firstName),
                            last_name: capFirstLetter(answer.lastName),
                            role_id: roleID(chosenRole),
                            manager_id: managerID(chosenManager)
                        },
                        function (err, res) {
                            if (err){
                                console.log(err);
                                return start();
                            }
                            console.log(`\n ${res.affectedRows} employee named "${capFirstLetter(answer.firstName)} ${capFirstLetter(answer.lastName)}" has been added!\n`);
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