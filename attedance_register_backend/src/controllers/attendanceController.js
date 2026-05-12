const attendanceService = require('../services/AttendanceService');
const branchRepository = require('../repositories/BranchRepository');
const employeeService = require('../services/EmployeeService');

class AttendanceController {
    async checkIn(req, res) {
        try {
            const { employee_id, branch_id, lat, lng, location } = req.body;
            
            let branch = await branchRepository.findById(branch_id);
            if (!branch) {
                // Fallback: try to find any branch for the company
                const companyId = req.user.company_id || 1;
                const db = require('../config/database');
                const [branches] = await db.query('SELECT * FROM branches WHERE company_id = ? LIMIT 1', [companyId]);
                branch = branches[0];
            }

            if (!branch) throw new Error('No branches found for your company. Please create a branch in Settings first.');

            const branchCoords = { lat: branch.latitude, lng: branch.longitude, radius: branch.radius_meters };
            const userCoords = { lat, lng };

            const result = await attendanceService.checkIn(employee_id, branchCoords, userCoords, location);
            res.status(201).json({ success: true, message: 'Checked in successfully', id: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async checkOut(req, res) {
        try {
            const { employee_id, lat, lng, location } = req.body;
            const userCoords = { lat, lng };

            await attendanceService.checkOut(employee_id, userCoords, location);
            res.status(200).json({ success: true, message: 'Checked out successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getDailyReport(req, res) {
        try {
            const companyId = req.user?.company_id || 1;
            const { date_range, department, branch } = req.query;
            
            const attendanceRepository = require('../repositories/AttendanceRepository');
            const records = await attendanceRepository.getReport(companyId, { date_range, department, branch });

            let onTime = 0;
            let late = 0;
            let absent = 0;

            const attendanceRecords = records.map(emp => {
                let statusStr = emp.status || 'Absent';
                
                if (emp.check_in) {
                    if (emp.status === 'late') {
                        late++;
                        statusStr = 'Late';
                    } else {
                        onTime++;
                        statusStr = 'On Time';
                    }
                } else {
                    absent++;
                }

                return {
                    id: emp.id,
                    name: `${emp.first_name} ${emp.last_name}`,
                    role: emp.designation_name || 'Associate',
                    dept: emp.department_name || 'Engineering',
                    branch: emp.branch_name || 'Main Branch',
                    checkIn: emp.check_in ? new Date(emp.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    checkOut: emp.check_out ? new Date(emp.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    status: statusStr,
                    initials: `${emp.first_name ? emp.first_name[0] : 'E'}${emp.last_name ? emp.last_name[0] : 'E'}`.toUpperCase(),
                    date: emp.attendance_date ? new Date(emp.attendance_date).toISOString().split('T')[0] : null
                };
            });

            const total = records.length || 1;
            const rate = Math.round(((onTime + late) / total) * 100) || 100;

            const stats = [
                { label: 'On Time', value: onTime.toString(), icon: 'how_to_reg', color: 'emerald' },
                { label: 'Late', value: late.toString(), icon: 'schedule', color: 'amber' },
                { label: 'Absent', value: absent.toString(), icon: 'person_off', color: 'rose' },
                { label: 'Attendance Rate', value: `${rate}%`, icon: 'analytics', color: 'primary' }
            ];
            
            res.status(200).json({ success: true, data: { attendanceRecords, stats } });
        } catch (error) {
            console.error('getDailyReport Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async bulkCheckIn(req, res) {
        try {
            const { employee_ids, branch_id, lat, lng, location, remarks } = req.body;
            if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
                return res.status(400).json({ success: false, message: 'Please provide an array of employee_ids' });
            }

            const branch = await branchRepository.findById(branch_id);
            if (!branch) throw new Error('Branch not found');

            const branchCoords = { lat: branch.latitude, lng: branch.longitude, radius: branch.radius_meters };
            const userCoords = { lat, lng };

            const successIds = [];
            const failedIds = [];

            // Loop and mark attendance for each
            for (const empId of employee_ids) {
                try {
                    await attendanceService.checkIn(empId, branchCoords, userCoords, location);
                    successIds.push(empId);
                } catch (e) {
                    failedIds.push({ id: empId, reason: e.message });
                }
            }

            res.status(200).json({ 
                success: true, 
                message: `Bulk check-in completed. ${successIds.length} succeeded, ${failedIds.length} failed.`, 
                data: { successIds, failedIds } 
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async manualMarkAttendance(req, res) {
        try {
            const { employee_id, date, check_in, check_out, status, remarks } = req.body;
            // Assuming HR role validates this route
            
            const attendanceRepository = require('../repositories/AttendanceRepository');
            let workHours = 0;
            if (check_in && check_out) {
                workHours = (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60);
            }
            
            const sql = 'INSERT INTO attendance (employee_id, attendance_date, check_in, check_out, status, work_hours) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE check_in=VALUES(check_in), check_out=VALUES(check_out), status=VALUES(status), work_hours=VALUES(work_hours)';
            await attendanceRepository.execute(sql, [employee_id, date, check_in, check_out, status, workHours.toFixed(2)]);
            
            res.status(200).json({ success: true, message: 'Attendance recorded manually' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async syncOfflineLogs(req, res) {
        try {
            const { logs } = req.body; // Array of { employee_id, type, timestamp, lat, lng }
            if (!Array.isArray(logs) || logs.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid payload' });
            }

            const attendanceRepository = require('../repositories/AttendanceRepository');
            let synced = 0;
            let failed = 0;

            for (const log of logs) {
                try {
                    const dateObj = new Date(log.timestamp);
                    const dateStr = dateObj.toISOString().split('T')[0];
                    
                    if (log.type === 'check_in') {
                        const sql = 'INSERT IGNORE INTO attendance (employee_id, attendance_date, check_in, check_in_lat, check_in_lng, status) VALUES (?, ?, ?, ?, ?, ?)';
                        await attendanceRepository.execute(sql, [log.employee_id, dateStr, dateObj, log.lat, log.lng, 'present']);
                    } else if (log.type === 'check_out') {
                        // Assuming check_in exists
                        const sql = 'UPDATE attendance SET check_out = ?, check_out_lat = ?, check_out_lng = ? WHERE employee_id = ? AND attendance_date = ?';
                        await attendanceRepository.execute(sql, [dateObj, log.lat, log.lng, log.employee_id, dateStr]);
                        
                        // We could recalculate work_hours here
                        await attendanceRepository.execute('UPDATE attendance SET work_hours = TIMESTAMPDIFF(MINUTE, check_in, check_out)/60 WHERE employee_id = ? AND attendance_date = ? AND check_in IS NOT NULL', [log.employee_id, dateStr]);
                    }
                    synced++;
                } catch (e) {
                    failed++;
                }
            }

            res.status(200).json({ success: true, message: `Offline sync completed. Synced: ${synced}, Failed: ${failed}` });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async qrCheckIn(req, res) {
        try {
            const { qr_payload, employee_id, lat, lng, location } = req.body;
            // The QR payload could be a JWT or an encrypted string generated by the terminal
            // We verify the timestamp inside it to prevent replay attacks (QR valid for 30s)
            
            let decodedQr;
            try {
                // In real app, verify signature. Using base64 decode for mockup:
                const decodedStr = Buffer.from(qr_payload, 'base64').toString('ascii');
                decodedQr = JSON.parse(decodedStr);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid QR Code format' });
            }

            const { branch_id, timestamp } = decodedQr;
            const now = Date.now();
            if (now - timestamp > 30000) {
                return res.status(400).json({ success: false, message: 'QR Code Expired. Please scan the current code.' });
            }

            const branch = await branchRepository.findById(branch_id);
            if (!branch) throw new Error('Terminal Branch not found');

            const branchCoords = { lat: branch.latitude, lng: branch.longitude, radius: branch.radius_meters };
            const userCoords = { lat, lng };

            const result = await attendanceService.checkIn(employee_id, branchCoords, userCoords, location);
            res.status(201).json({ success: true, message: 'QR Check-in successful', id: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AttendanceController();
