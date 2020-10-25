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
            case "EXIT":
                console.log("You have exited the application");
                connection.end();
        }
    });
}

function addADepartment() {
    // console.log("You have chosen: Add a department");
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
                        "I don't want to add a department anymore"
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
                case "I don't want to add a department anymore":
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
            deptArray.push({id: element.id, name: element.name});
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
    // .then(function (answer) {
    //     inquirer.prompt(
    //         {
    //             name: "confirm",
    //             type: "rawlist",
    //             message: `Are you sure want to add the department: ${capFirstLetter(answer.department)}`,
    //             choices:
    //                 [
    //                     "Yes",
    //                     "No, go back",
    //                     "I don't want to add a department anymore"
    //                 ]
    //         }
    //     ).then(function (answer2) {
    //         switch (answer2.confirm) {
    //             case "Yes":
    //                 connection.query("INSERT INTO department SET ?",
    //                     {
    //                         name: capFirstLetter(answer.department),
    //                     },
    //                     function (err, res) {
    //                         if (err) {
    //                             console.log(`\n` + `\n There is already a department named "${capFirstLetter(answer.department)}". You will be taken back to the main menu \n`);
    //                             return start();
    //                         } else {
    //                             console.log(`\n` + `\n ${res.affectedRows} department named "${capFirstLetter(answer.department)}" has been added!\n`);
    //                             return start();
    //                         }
    //                     }
    //                 );
    //             case "No, go back":
    //                 return addADepartment();
    //             case "I don't want to add a department anymore":
    //                 return start();
    //         }
    //     });
    // });
}
