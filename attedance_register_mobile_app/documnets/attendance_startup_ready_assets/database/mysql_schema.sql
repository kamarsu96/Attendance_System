
CREATE TABLE companies (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(150) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 company_id INT,
 name VARCHAR(150),
 FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE employees (
 id INT AUTO_INCREMENT PRIMARY KEY,
 company_id INT,
 department_id INT,
 name VARCHAR(150),
 email VARCHAR(150),
 salary DECIMAL(10,2),
 FOREIGN KEY (company_id) REFERENCES companies(id),
 FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE attendance (
 id INT AUTO_INCREMENT PRIMARY KEY,
 employee_id INT,
 checkin_time DATETIME,
 checkout_time DATETIME,
 FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE leaves (
 id INT AUTO_INCREMENT PRIMARY KEY,
 employee_id INT,
 start_date DATE,
 end_date DATE,
 status VARCHAR(50),
 FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE payroll (
 id INT AUTO_INCREMENT PRIMARY KEY,
 employee_id INT,
 month VARCHAR(20),
 salary DECIMAL(10,2),
 FOREIGN KEY (employee_id) REFERENCES employees(id)
);
