const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'test_bulk_import.xlsx');
const wb = XLSX.readFile(filePath);
const wsname = wb.SheetNames[0];
const ws = wb.Sheets[wsname];

const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log('XLSX Raw Data Length:', rawData.length);
console.log('XLSX Raw Data First Row:', rawData[0]);

const jsonData = XLSX.utils.sheet_to_json(ws);
console.log('XLSX JSON Data Length:', jsonData.length);
if (jsonData.length > 0) {
  console.log('XLSX JSON Data First Row Keys:', Object.keys(jsonData[0]));
  console.log('XLSX JSON Data First Row:', jsonData[0]);
}
