const app = require('./app');

// Register routes
const contractorRoutes = require('./src/routes/contractor.routes');
app.use('/api/contractors', contractorRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Smart Attendance & Payroll Server running on port ${PORT}`);
});
