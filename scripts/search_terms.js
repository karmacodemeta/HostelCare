const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(filePath));
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
};

const searchTerms = ['uploaded', 'successfully', 'students'];
const files = walk(path.join(__dirname, '..'));

console.log('Searching in', files.length, 'files...');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    searchTerms.forEach(term => {
        if (content.toLowerCase().includes(term.toLowerCase())) {
            console.log(`Match for "${term}" in ${path.relative(path.join(__dirname, '..'), file)}`);
            // print lines
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.toLowerCase().includes(term.toLowerCase())) {
                    console.log(`  Line ${index + 1}: ${line.trim()}`);
                }
            });
        }
    });
});
