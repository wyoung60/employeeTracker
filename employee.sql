DROP DATABASE IF EXISTS company_db;

CREATE DATABASE company_db;

USE company_db;

CREATE TABLE departments(
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
name VARCHAR(30)
);

CREATE TABLE roles(
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
title VARCHAR(30),
salary DECIMAL,
departmentID INT
);

CREATE TABLE employees(
id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
first_name VARCHAR(30),
last_name VARCHAR(30),
roleID INT,
managerID INT
);

INSERT INTO departments(name) VALUES ("Meat"), ("Seafood"), ("Grocery"), ("Deli");

INSERT INTO roles(title, salary, departmentID) VALUES ("Team Leader", 50000, 1), ("Team Member", 30000, 1),("Team Leader", 60000, 2), ("Team Member", 35000, 2),("Team Leader", 40000, 3), ("Team Member", 27000, 3),("Team Leader", 50000, 4), ("Team Member", 30000, 4);

INSERT INTO employees(first_name, last_name, roleID, managerID) VALUES("Luke", "Skyrunner", 1, null), ("Devin", "Frank", 2, 1);

SELECT * FROM departments;

SELECT * FROM roles;

SELECT * FROM employees;