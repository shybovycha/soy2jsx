const preprocessor = require('./preprocessor.js');

const process = require('process');
const fs = require('fs');

const ast = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const jsxAst = preprocessor.process(ast);

console.log(JSON.stringify(contextTree, null, 4));
