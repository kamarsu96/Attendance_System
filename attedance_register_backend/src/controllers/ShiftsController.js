const shiftAssignmentRepository = require('../repositories/ShiftAssignmentRepository');

class ShiftsController {
    async getShifts(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            
            // Fetch ALL employees and their shift assignments from DB
            const assignments = await shiftAssignmentRepository.getAllEmployeeShifts(companyId);
            const dbStats = await shiftAssignmentRepository.getStatsByCompany(companyId);

            // Transform DB data to match frontend requirements
            const shifts = assignments.map(a => {
                let type = 'Not Assigned';
                let timing = '--:-- - --:--';
                
                if (a.shift_name) {
                    type = a.shift_name;
                    timing = `${a.start_time.substring(0, 5)} - ${a.end_time.substring(0, 5)}`;
                }

                return {
                    id: `#EMP-${a.employee_id}`,
                    employee_id: a.employee_id,
                    assignment_id: a.assignment_id,
                    name: `${a.first_name} ${a.last_name}`,
                    dept: a.department_name || 'Unassigned',
                    type: type,
                    timing: timing,
                    status: a.assignment_id ? 'Active' : 'Unassigned',
                    initials: `${(a.first_name || 'E').charAt(0)}${(a.last_name || 'E').charAt(0)}`.toUpperCase(),
                    avatar: a.profile_picture_url || `https://ui-avatars.com/api/?name=${a.first_name}+${a.last_name}`
                };
            });

            const stats = [
                { label: 'Total Shifts', value: dbStats.total_shifts.toString(), trend: 'Live', icon: 'layers', color: 'primary' },
                { label: 'Morning Shift', value: dbStats.morning_shifts.toString(), subtext: 'Active', icon: 'wb_sunny', color: 'amber' },
                { label: 'Evening Shift', value: dbStats.evening_shifts.toString(), subtext: 'Active', icon: 'wb_twilight', color: 'orange' },
                { label: 'Night Shift', value: dbStats.night_shifts.toString(), subtext: 'Active', icon: 'dark_mode', color: 'indigo' }
            ];
            
            res.status(200).json({ success: true, data: { shifts, stats } });
        } catch (error) {
            console.error('getShifts Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async createShift(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const shiftId = await shiftRepository.create({ ...req.body, company_id: companyId });
            res.status(201).json({ success: true, message: 'Shift created successfully', shiftId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async assignShift(req, res) {
        try {
            const { employee_id, shift_id, start_date, end_date } = req.body;
            console.log('Assigning shift:', { employee_id, shift_id, start_date, end_date });
            
            if (!employee_id || !shift_id || !start_date || start_date.trim() === '') {
                return res.status(400).json({ success: false, message: 'Employee, Shift, and Start Date are required' });
            }

            // Explicitly set to null if empty string or whitespace
            const finalEndDate = (end_date && typeof end_date === 'string' && end_date.trim() !== '') ? end_date : null;
            
            console.log('Final values for DB:', { employee_id, shift_id, start_date, finalEndDate });
            
            await shiftAssignmentRepository.assignShift(employee_id, shift_id, start_date, finalEndDate);
            res.status(200).json({ success: true, message: 'Shift assigned successfully' });
        } catch (error) {
            console.error('assignShift Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getShiftList(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const shifts = await shiftRepository.findByCompany(companyId);
            res.status(200).json({ success: true, data: shifts });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async deleteAssignment(req, res) {
        try {
            const id = req.params.id;
            await shiftAssignmentRepository.deleteAssignment(id);
            res.status(200).json({ success: true, message: 'Shift assignment deleted' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

const shiftRepository = require('../repositories/ShiftRepository');
module.exports = new ShiftsController();
