DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE department (
id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(30) UNIQUE NOT NULL,
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
	('Accounting & Finance'),
	('Engineering'),
	('Human Resources'),
	('Legal'),
	('Marketing'),
    ('Sales');
 
INSERT INTO role
	(title, salary, department_id)
VALUES
    ('Accountant', 60000, 1),
    ('Engineer', 100000, 2),
    ('HR Officer', 90000, 3),
    ('Lawyer', 100000, 4),
    ('Marketing Manager', 90000, 5),
	('Salesperson', 60000, 6);
    
INSERT INTO employee
	(first_name, last_name, role_id, manager_id)
VALUES
	('John', 'Doe', 1, NULL),
    ('Jane', 'Doe', 1, 1),
	('Jack', 'Johnson', 2, NULL),
	('Rick', 'Morty', 2, 3),
	('Tyler', 'Richardson', 3, NULL),
	('Abe', 'Lincoln', 4, NULL),
    ('George', 'Washington', 5, NULL),
    ('Benjamin', 'Franklin', 6, 7);