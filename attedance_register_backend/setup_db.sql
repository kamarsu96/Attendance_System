-- Smart Attendance & Payroll Management System - Master Schema
-- Optimized for MySQL 8.0+

CREATE DATABASE IF NOT EXISTS attendance_registration;
USE attendance_registration;

-- ==========================================
-- 1. CORE ORGANIZATION TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    address TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    logo_url VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contractors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    agency_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius_meters INT DEFAULT 100,
    is_main_branch BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    designation_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ==========================================
-- 2. EMPLOYEE TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT,
    designation_id INT,
    branch_id INT,
    contractor_id INT NULL,
    joining_date DATE,
    qualification VARCHAR(255) DEFAULT NULL,
    employment_type ENUM('full-time', 'contract', 'intern', 'part-time') DEFAULT 'full-time',
    status ENUM('active', 'resigned', 'terminated', 'on-leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (designation_id) REFERENCES designations(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL,
    UNIQUE KEY idx_emp_code_company (company_id, employee_code)
);

CREATE TABLE IF NOT EXISTS employee_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    dob DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    blood_group VARCHAR(10),
    profile_picture_url VARCHAR(255),
    current_address TEXT,
    permanent_address TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    document_type VARCHAR(50), -- Aadhar, PAN, Passport
    document_number VARCHAR(100),
    file_path VARCHAR(255),
    expiry_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_bank_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    bank_name VARCHAR(150),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    branch_name VARCHAR(100),
    account_holder_name VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    contact_name VARCHAR(255),
    relationship VARCHAR(50),
    phone VARCHAR(20),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. ATTENDANCE & SHIFTS
-- ==========================================

CREATE TABLE IF NOT EXISTS shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    shift_name VARCHAR(100),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_minutes INT DEFAULT 15,
    break_duration_minutes INT DEFAULT 60,
    overtime_eligibility BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shift_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL, -- For temporary shifts
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIMESTAMP NULL,
    check_out TIMESTAMP NULL,
    check_in_location TEXT,
    check_out_location TEXT,
    check_in_lat DECIMAL(10, 8),
    check_in_lng DECIMAL(11, 8),
    status ENUM('present', 'absent', 'late', 'half-day', 'holiday', 'on-leave') DEFAULT 'present',
    work_hours DECIMAL(5, 2) DEFAULT 0.00,
    overtime_hours DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY idx_emp_date (employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT NOT NULL,
    log_type ENUM('in', 'out', 'break_start', 'break_end'),
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location TEXT,
    device_id VARCHAR(255),
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_corrections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT NOT NULL,
    requested_by INT NOT NULL,
    reason TEXT,
    old_value TEXT, -- JSON of old checkin/out
    new_value TEXT, -- JSON of new checkin/out
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. LEAVE MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    leave_name VARCHAR(50) NOT NULL,
    total_allowed INT NOT NULL, -- Per year
    is_paid BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL,
    used INT DEFAULT 0,
    remaining INT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    UNIQUE KEY idx_emp_leave_year (employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE IF NOT EXISTS leave_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_request_id INT NOT NULL,
    approver_id INT NOT NULL,
    status ENUM('approved', 'rejected') NOT NULL,
    comments TEXT,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. PAYROLL TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS salary_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    basic_salary DECIMAL(15, 2) NOT NULL,
    overtime_rate_per_hour DECIMAL(10, 2) DEFAULT 0.00,
    salary_type ENUM('monthly', 'weekly', 'daily') DEFAULT 'monthly',
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    status ENUM('draft', 'processed', 'completed') DEFAULT 'draft',
    processed_at TIMESTAMP NULL,
    processed_by INT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_run_id INT NOT NULL,
    employee_id INT NOT NULL,
    working_days INT,
    present_days INT,
    absent_days INT,
    overtime_hours DECIMAL(10, 2),
    gross_earnings DECIMAL(15, 2),
    total_deductions DECIMAL(15, 2),
    net_salary DECIMAL(15, 2),
    FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS payroll_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_detail_id INT NOT NULL,
    allowance_name VARCHAR(100),
    amount DECIMAL(15, 2),
    FOREIGN KEY (payroll_detail_id) REFERENCES payroll_details(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_detail_id INT NOT NULL,
    deduction_name VARCHAR(100),
    amount DECIMAL(15, 2),
    FOREIGN KEY (payroll_detail_id) REFERENCES payroll_details(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payslips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_detail_id INT NOT NULL UNIQUE,
    payslip_number VARCHAR(50) UNIQUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    FOREIGN KEY (payroll_detail_id) REFERENCES payroll_details(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. HOLIDAYS & SCHEDULES
-- ==========================================

CREATE TABLE IF NOT EXISTS holiday_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    group_name VARCHAR(100),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_group_id INT NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(255),
    description TEXT,
    FOREIGN KEY (holiday_group_id) REFERENCES holiday_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS work_calendars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    branch_id INT NULL,
    year INT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ==========================================
-- 7. SECURITY & ACCESS
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL -- super_admin, company_admin, hr, manager, employee
);

CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NULL UNIQUE, -- For employees
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255), -- e.g., 'CREATE_EMPLOYEE', 'PROCESS_PAYROLL'
    entity_name VARCHAR(100), -- 'employees', 'payroll'
    entity_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. NOTIFICATIONS & SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(255),
    message TEXT,
    target_type ENUM('all', 'department', 'individual'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE,
    setting_value TEXT
);

CREATE TABLE IF NOT EXISTS company_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    setting_key VARCHAR(100),
    setting_value TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY idx_company_setting (company_id, setting_key)
);

CREATE TABLE IF NOT EXISTS api_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_method VARCHAR(10),
    request_url TEXT,
    request_payload TEXT,
    response_code INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_message TEXT,
    stack_trace TEXT,
    request_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 9. SEED INITIAL ROLES
-- ==========================================

INSERT INTO roles (role_name) VALUES ('super_admin'), ('company_admin'), ('hr'), ('manager'), ('employee');
