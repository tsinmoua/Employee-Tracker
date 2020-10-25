DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE department (
id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(30) NOT NULL,
salary DECIMAL NOT NULL,
department_id INTEGER NOT NULL
);

CREATE TABLE employee (
id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INTEGER NOT NULL,
manager_id INTEGER
);

INSERT INTO department
	(name)
VALUES
    ('Engineering'),
    ('Sales'),
    ('Marketing'),
    ('Human Resources'),
    ('Accounting & Finance'),
    ('Legal');
    
SELECT * FROM department ORDER BY id;
DROP TABLE department;

   
INSERT INTO role
	(title, salary, department_id)
VALUES
    ('Accountant', 60000, 5),
    ('Engineer', 100000, 1),
	('Salesperson', 80000, 2),
    ('Chief HR Officer', 200000, 3),
    ('Lawyer', 100000, 6);
    
SELECT * FROM role ORDER BY id;

INSERT INTO employee
	(first_name, last_name, role_id, manager_id)
VALUES
	('John', 'Doe', 1, NULL),
    ('Jane', 'Doe', 2, 1),
	('Jack', 'Johnson', 3, 1);
    
SELECT * FROM employee ORDER BY id;

