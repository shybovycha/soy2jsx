const soyparser = require('soyparser');
const process = require('process');
const fs = require('fs');

const ast = soyparser.default(fs.readFileSync(process.argv[2], 'utf8'));

console.log(JSON.stringify(ast, null, 4));
