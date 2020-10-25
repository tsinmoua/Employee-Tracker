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
                message: `Are you sure want to add the department: ${answer.department}`,
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

                    let query = connection.query(
                        "INSERT INTO department SET ?",
                        {
                            name: answer.department,
                        },
                        function (err, res) {
                            if (err) {
                                console.log(`There is already a department named ${answer.department}. You will be taken back to the main menu`);
                                addADepartment();
                            };
                            console.log(res.affectedRows + ` department named ${answer.department} has been added!\n`);
                            start();
                        }

                    );
                    break;
            }
        });

    });

}
