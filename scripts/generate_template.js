
const XLSX = require('xlsx');
const path = require('path');

// Headers matching our Adapter
const headers = [
    'name',
    'contactNumber',
    'guardian',
    'guardianContact',
    'address',
    'roomNo',
    'admissionDate',
    'rent',
    'advanceAmount',
    'dues',
    // 'branchId' is usually internal, maybe omit or leave optional? 
    // Better to let user select branch during upload if possible, or support column. 
    // For now, let's include it but maybe user will leave it blank.
    // 'branchId' 
];

const sampleData = [
    {
        name: 'John Doe',
        contactNumber: '9876543210',
        guardian: 'Mr. Doe',
        guardianContact: '9998887776',
        address: '123, Hostel Lane, City',
        roomNo: '101',
        admissionDate: '2024-01-01',
        rent: 5000,
        advanceAmount: 10000,
        dues: 0
    },
    {
        name: 'Jane Smith',
        contactNumber: '8765432109',
        guardian: 'Mrs. Smith',
        guardianContact: '8887776665',
        address: '456, College Road, City',
        roomNo: '102',
        admissionDate: '2024-02-15',
        rent: 5500,
        advanceAmount: 11000,
        dues: 500
    }
];

// Create Workbook and Worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });

// Append Worksheet
XLSX.utils.book_append_sheet(wb, ws, "Students");

// Write File
const outputPath = path.join(__dirname, 'student_import_template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Template created successfully at: ${outputPath}`);
