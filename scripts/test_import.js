const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'test_bulk_import_csv.csv');
const fileData = fs.readFileSync(filePath);

const wb = XLSX.read(fileData, { type: 'buffer' });
const wsname = wb.SheetNames[0];
const ws = wb.Sheets[wsname];

const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log('Raw Data Length:', rawData.length);
console.log('Raw Data First Row:', rawData[0]);

const firstRow = rawData[0];
const hasHeaders = firstRow.some(cell => 
  typeof cell === 'string' && ['name', 'guardian', 'room', 'address'].some(key => cell.toLowerCase().includes(key))
);
console.log('Has Headers:', hasHeaders);

const jsonData = XLSX.utils.sheet_to_json(ws);
console.log('JSON Data Length:', jsonData.length);
if (jsonData.length > 0) {
  console.log('JSON Data First Row Keys:', Object.keys(jsonData[0]));
  console.log('JSON Data First Row:', jsonData[0]);
}

const parsedData = jsonData.map((row) => {
  const newRow = {};
  const keys = Object.keys(row);
  
  if (keys.length === 1 && keys[0].includes(',')) {
      const headerParts = keys[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      const valParts = String(row[keys[0]]).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      
      headerParts.forEach((header, index) => {
          const normalizedKey = header.toLowerCase();
          const val = valParts[index] || '';
          
          if (normalizedKey.includes('name')) newRow.name = val;
          else if (normalizedKey.includes('guardian') || normalizedKey.includes('father')) newRow.guardian = val;
          else if (normalizedKey.includes('room')) newRow.room = val;
          else if (normalizedKey.includes('address')) newRow.address = val;
          else if (normalizedKey.includes('rent')) newRow.rent = val;
          else if (normalizedKey.includes('due')) newRow.dues = val;
          else if (normalizedKey.includes('contact') || normalizedKey.includes('phone') || normalizedKey.includes('mobile')) newRow.contactNumber = val;
      });
  } else {
      Object.keys(row).forEach(key => {
          const normalizedKey = key.trim().toLowerCase();
          if (normalizedKey.includes('name')) newRow.name = row[key];
          else if (normalizedKey.includes('guardian') || normalizedKey.includes('father')) newRow.guardian = row[key];
          else if (normalizedKey.includes('room')) newRow.room = row[key];
          else if (normalizedKey.includes('address')) newRow.address = row[key];
          else if (normalizedKey.includes('rent')) newRow.rent = row[key];
          else if (normalizedKey.includes('due')) newRow.dues = row[key];
          else if (normalizedKey.includes('contact') || normalizedKey.includes('phone') || normalizedKey.includes('mobile')) newRow.contactNumber = row[key];
          else if (normalizedKey.includes('branch')) newRow.branch = row[key];
          else newRow[normalizedKey] = row[key];
      });
  }
  return newRow;
});

console.log('Parsed Data Length:', parsedData.length);
console.log('Parsed Data First Row:', parsedData[0]);
