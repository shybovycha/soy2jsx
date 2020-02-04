const parser = require('../grammar/SOY.js');
const optimizer = require('./optimizer.js');

const fs = require('fs');
const path = require('path');
const process = require('process');
const glob = require('glob');
const recast = require('recast');

const compileFile = filename => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, sample) => {
            if (err) {
                return reject(err);
            }

            const dirname = path.dirname(filename);
            const baseFileName = path.basename(filename);
            const soyAstFilename = path.join(dirname, baseFileName + '.soy.ast');
            const jsxAstFilename = path.join(dirname, baseFileName + '.jsx.ast');
            const jsxFilename = path.join(dirname, baseFileName + '.jsx');

            let soyAst, jsxAst;

            try {
                console.log('Parsing file', filename);

                soyAst = parser.parse(sample);

                console.log('Writing SOY AST to', soyAstFilename);

                fs.writeFileSync(soyAstFilename, JSON.stringify(soyAst, null, 4));
            } catch (e) {
                console.error(`PARSE ERROR: Could not parse file ${filename}.`, e);
                return reject(e);
            }

            try {
                console.log('Optimizing AST');

                jsxAst = optimizer.optimize(soyAst);

                console.log('Writing JSX AST to', jsxAstFilename);

                fs.writeFileSync(jsxAstFilename, JSON.stringify(jsxAst, null, 4));
            } catch (e) {
                console.error(`OPTIMIZE ERROR: Could not optimize JSX AST for ${filename}.`, e);
                return reject(e);
            }

            try {
                // const parsedAst = recast.parse();
                console.log('Generating JSX from AST');

                const jsx = recast.print(jsxAst).code;

                console.log('Writing JSX to', jsxFilename);

                fs.writeFileSync(jsxFilename, jsx);

                try {
                    recast.parse(jsx);
                } catch (e) {
                    throw `Error parsing output JSX for ${filename}: ${JSON.stringify(e)}`;
                }

                return resolve(jsx);
            } catch (e) {
                console.error(`GENERATE ERROR: `, e);
                return reject(e);
            }
        });
    });
}

module.exports = { compileFile };
