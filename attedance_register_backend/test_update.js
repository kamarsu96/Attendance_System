const employeeRepository = require('./src/repositories/EmployeeRepository');
const db = require('./src/config/database');

async function testUpdate() {
    try {
        const id = 4;
        
        // 1. Set initial state
        console.log('--- Setting initial state ---');
        await employeeRepository.update(id, {
            first_name: 'Original',
            last_name: 'User',
            gender: 'male',
            city: 'OriginalCity',
            bank_name: 'OriginalBank'
        });

        // 2. Perform partial update
        console.log('--- Performing partial update ---');
        const partialData = {
            first_name: 'Updated',
            // gender and city are missing
            bank_name: 'UpdatedBank'
        };
        await employeeRepository.update(id, partialData);
        
        // 3. Verify
        console.log('--- Verifying results ---');
        const emp = await employeeRepository.findById(id);
        
        const success = 
            emp.first_name === 'Updated' && 
            emp.last_name === 'User' && // Preserved
            emp.gender === 'male' && // Preserved
            emp.city === 'OriginalCity' && // Preserved
            emp.bank_name === 'UpdatedBank';

        if (success) {
            console.log('SUCCESS: Partial update preserved existing fields.');
        } else {
            console.log('FAILURE: Partial update wiped out some fields.');
            console.log('Current state:', JSON.stringify({
                first_name: emp.first_name,
                last_name: emp.last_name,
                gender: emp.gender,
                city: emp.city,
                bank_name: emp.bank_name
            }, null, 2));
        }

        // 4. Test long document name
        console.log('--- Testing long document name ---');
        const employeeService = require('./src/services/EmployeeService');
        const longName = 'this_is_a_very_long_filename_that_exceeds_fifty_characters_and_should_be_truncated_automatically.pdf';
        
        try {
            // Mock addDocument to verify truncation
            const originalAddDocument = employeeRepository.addDocument;
            let capturedDocType = '';
            employeeRepository.addDocument = async (empId, doc) => {
                capturedDocType = doc.document_type;
                console.log('Captured document_type:', capturedDocType);
                return { insertId: 1 };
            };

            await employeeService.updateEmployee(id, {}, { 
                documents: [{ originalname: longName, buffer: Buffer.from('test') }]
            });

            if (capturedDocType.length <= 50 && capturedDocType.startsWith('this_is_a_very_long_filename')) {
                console.log('SUCCESS: Document type truncated correctly.');
            } else {
                console.log('FAILURE: Document type not truncated correctly. Length:', capturedDocType.length);
            }

            employeeRepository.addDocument = originalAddDocument;
        } catch (e) {
            console.error('Document truncation test failed with error:', e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testUpdate();
