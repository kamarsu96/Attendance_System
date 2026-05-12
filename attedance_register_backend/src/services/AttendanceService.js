const attendanceRepository = require('../repositories/AttendanceRepository');
const companyRepository = require('../repositories/CompanyRepository'); // To get branch coords

class AttendanceService {
    // Haversine formula to calculate distance between two points in meters
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    async checkIn(employeeId, branchCoords, userCoords, location) {
        // Skip radius check for Web Dashboard check-ins
        if (location !== 'Web Dashboard') {
            const distance = this.calculateDistance(
                branchCoords.lat, branchCoords.lng,
                userCoords.lat, userCoords.lng
            );

            if (distance > branchCoords.radius) {
                throw new Error('You are outside the company radius');
            }
        }

        const existing = await attendanceRepository.findTodayRecord(employeeId);
        if (existing) throw new Error('Already checked in today');

        let status = 'present';
        
        // Fetch active shift for the employee to determine if late
        const shiftAssignmentRepository = require('../repositories/ShiftAssignmentRepository');
        const shift = await shiftAssignmentRepository.getActiveShiftForEmployee(employeeId);
        
        if (shift) {
            const checkInTime = new Date();
            const [shiftH, shiftM] = shift.start_time.split(':').map(Number);
            const shiftDate = new Date();
            shiftDate.setHours(shiftH, shiftM, 0, 0);
            
            // Add grace period
            const graceMs = (shift.grace_minutes || 15) * 60000;
            if (checkInTime > new Date(shiftDate.getTime() + graceMs)) {
                status = 'late';
                
                // Trigger notification
                const notificationRepository = require('../repositories/NotificationRepository');
                const title = `Late Check-in Alert`;
                const message = `Employee ${employeeId} checked in late for their shift at ${checkInTime.toLocaleTimeString()}.`;
                // Assume company_id is available from shift
                await notificationRepository.create(shift.company_id, title, message, 'all');
            }
        }

        return await attendanceRepository.createCheckIn({
            employee_id: employeeId,
            check_in: new Date(),
            lat: userCoords.lat,
            lng: userCoords.lng,
            location,
            status
        });
    }

    async checkOut(employeeId, userCoords, location) {
        const record = await attendanceRepository.findTodayRecord(employeeId);
        if (!record || !record.check_in) throw new Error('No active check-in found');

        const checkInTime = new Date(record.check_in);
        const checkOutTime = new Date();
        const workHoursMs = checkOutTime - checkInTime;
        const workHours = workHoursMs / (1000 * 60 * 60);

        let overtimeHours = 0;
        
        // Fetch active shift for the employee to calculate overtime
        const shiftAssignmentRepository = require('../repositories/ShiftAssignmentRepository');
        const shift = await shiftAssignmentRepository.getActiveShiftForEmployee(employeeId);
        
        if (shift) {
            // Calculate shift duration in hours
            const [startH, startM] = shift.start_time.split(':').map(Number);
            const [endH, endM] = shift.end_time.split(':').map(Number);
            
            let shiftDurationMs = (endH * 60 + endM) * 60 * 1000 - (startH * 60 + startM) * 60 * 1000;
            // Handle night shifts wrapping around midnight
            if (shiftDurationMs < 0) {
                shiftDurationMs += 24 * 60 * 60 * 1000;
            }
            
            const breakDurationMs = (shift.break_duration_minutes || 60) * 60 * 1000;
            const standardWorkHoursMs = shiftDurationMs - breakDurationMs;
            
            if (workHoursMs > standardWorkHoursMs && shift.overtime_eligibility) {
                overtimeHours = (workHoursMs - standardWorkHoursMs) / (1000 * 60 * 60);
            }
        }

        return await attendanceRepository.updateCheckOut(record.id, {
            check_out: checkOutTime,
            lat: userCoords.lat,
            lng: userCoords.lng,
            location,
            work_hours: workHours.toFixed(2),
            overtime_hours: overtimeHours.toFixed(2)
        });
    }
}

module.exports = new AttendanceService();
