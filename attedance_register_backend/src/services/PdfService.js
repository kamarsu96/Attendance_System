const PDFDocument = require('pdfkit');

class PdfService {
    generatePayslip(payslipData, password = null) {
        return new Promise((resolve, reject) => {
            try {
                const options = {};
                if (password) {
                    options.userPassword = password;
                    options.ownerPassword = 'admin-secret-swams';
                    options.permissions = {
                        printing: 'highResolution',
                        modifying: false,
                        copying: false
                    };
                }

                const doc = new PDFDocument({ size: 'A4', margin: 50, ...options });
                const chunks = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err) => reject(err));

                // Header
                doc.fontSize(20).font('Helvetica-Bold').text(payslipData.company.name, { align: 'center' });
                doc.fontSize(10).font('Helvetica').text(payslipData.company.address, { align: 'center' });
                doc.moveDown();
                doc.rect(50, doc.y, 500, 2).fill('#1e293b');
                doc.moveDown(2);

                doc.fontSize(14).font('Helvetica-Bold').text('PAYSLIP', { align: 'center' });
                doc.fontSize(10).font('Helvetica-Oblique').text(`For the month of ${payslipData.period}`, { align: 'center' });
                doc.moveDown(2);

                // Employee Info Table-like structure
                const startY = doc.y;
                doc.fontSize(10).font('Helvetica-Bold').text('Employee Name:', 50, startY);
                doc.font('Helvetica').text(payslipData.employee.name, 150, startY);
                
                doc.font('Helvetica-Bold').text('Employee Code:', 300, startY);
                doc.font('Helvetica').text(payslipData.employee.code, 400, startY);

                doc.moveDown();
                const nextY = doc.y;
                doc.font('Helvetica-Bold').text('Designation:', 50, nextY);
                doc.font('Helvetica').text(payslipData.employee.designation, 150, nextY);
                
                doc.font('Helvetica-Bold').text('PAN Number:', 300, nextY);
                doc.font('Helvetica').text(payslipData.employee.pan, 400, nextY);

                doc.moveDown(2);

                // Attendance Summary
                doc.rect(50, doc.y, 500, 20).fill('#f1f5f9');
                doc.fill('#475569').fontSize(9).font('Helvetica-Bold').text('ATTENDANCE SUMMARY', 60, doc.y - 14);
                
                doc.moveDown();
                const attY = doc.y;
                doc.fill('#1e293b').fontSize(10).font('Helvetica-Bold').text('Present Days:', 50, attY);
                doc.font('Helvetica').text(payslipData.attendance.present, 120, attY);
                
                doc.font('Helvetica-Bold').text('Absent Days:', 200, attY);
                doc.font('Helvetica').text(payslipData.attendance.absent, 270, attY);
                
                doc.font('Helvetica-Bold').text('Overtime (Hrs):', 350, attY);
                doc.font('Helvetica').text(payslipData.attendance.overtime, 430, attY);

                doc.moveDown(2);

                // Earnings and Deductions
                const tableTop = doc.y;
                doc.fontSize(11).font('Helvetica-Bold').text('Earnings', 50, tableTop);
                doc.text('Deductions', 300, tableTop);
                doc.moveDown();
                doc.rect(50, doc.y, 500, 1).stroke('#e2e8f0');
                doc.moveDown();

                let earnY = doc.y;
                payslipData.earnings.forEach(e => {
                    doc.fontSize(9).font('Helvetica').text(e.label, 50, earnY);
                    doc.text(e.amount.toFixed(2), 220, earnY, { align: 'right', width: 50 });
                    earnY += 15;
                });

                let dedY = doc.y;
                payslipData.deductions.forEach(d => {
                    doc.fontSize(9).font('Helvetica').text(d.label, 300, dedY);
                    doc.text(d.amount.toFixed(2), 470, dedY, { align: 'right', width: 50 });
                    dedY += 15;
                });

                doc.y = Math.max(earnY, dedY) + 20;
                doc.rect(50, doc.y, 500, 1).stroke('#e2e8f0');
                doc.moveDown();

                // Net Pay
                doc.fontSize(12).font('Helvetica-Bold').fill('#0f172a').text('Net Payable Amount:', 50);
                doc.fontSize(14).text(`INR ${payslipData.summary.netPay.toLocaleString('en-IN')}`, 350, doc.y - 14, { align: 'right', width: 200 });
                
                doc.moveDown();
                doc.fontSize(8).font('Helvetica-Oblique').fill('#64748b').text('This is a system generated payslip and does not require a physical signature.', { align: 'center' });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new PdfService();
