const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/employees', require('./src/routes/employee.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));
app.use('/api/payroll', require('./src/routes/payroll.routes'));
app.use('/api/leaves', require('./src/routes/leave.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/shifts', require('./src/routes/shifts.routes'));
app.use('/api/settings', require('./src/routes/settings.routes'));
app.use('/api/notifications', require('./src/routes/notifications.routes'));
app.use('/api/branches', require('./src/routes/branch.routes'));
app.use('/api/departments', require('./src/routes/department.routes'));
app.use('/api/designations', require('./src/routes/designation.routes'));
app.use('/api/leave-types', require('./src/routes/leaveType.routes'));
app.use('/api/roles', require('./src/routes/role.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/permissions', require('./src/routes/rolePermission.routes'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

app.get('/api/metadata', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            genders: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
            ],
            maritalStatuses: [
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' }
            ],
            employmentTypes: [
                { value: 'full-time', label: 'Full-time Employee' },
                { value: 'part-time', label: 'Part-time Employee' },
                { value: 'contract', label: 'Contract Worker' },
                { value: 'intern', label: 'Intern' }
            ]
        }
    });
});
// app.use('/api/auth', require('./src/routes/auth.routes'));

module.exports = app;
