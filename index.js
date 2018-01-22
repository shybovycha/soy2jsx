const parser = require('./SOY.js');
const optimizer = require('./optimizer.js');

const fs = require('fs');
const path = require('path');
const util = require('util');
const process = require('process');
const glob = require('glob');
const recast = require('recast');

function parseFile(filename) {
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
                soyAst = parser.parse(sample);

                fs.writeFileSync(soyAstFilename, JSON.stringify(soyAst, null, 4));
            } catch (e) {
                console.error(`ERROR: Could not parse file ${filename}.`, e);
                return reject(e);
            }

            try {
                jsxAst = optimizer.optimize(soyAst);

                fs.writeFileSync(jsxAstFilename, JSON.stringify(jsxAst, null, 4));
            } catch (e) {
                console.error(`ERROR: Could not optimize JSX AST for ${filename}.`, e);
                return reject(e);
            }

            try {
                const jsx = recast.print(jsxAst).code;

                fs.writeFileSync(jsxFilename, jsx);

                try {
                    recast.parse(jsx);
                } catch (e) {
                    throw `Error parsing output JSX for ${filename}: ${JSON.stringify(e)}`;
                }

                return resolve(jsx);
            } catch (e) {
                console.error(`ERROR: `, e);
                return reject(e);
            }
        });
    });
}

const firstArg = process.argv[2];
const stat = fs.lstatSync(firstArg);

if (stat.isDirectory()) {
    glob(firstArg + '/**/*.soy', (err, files) => {
        if (err) {
            console.error('Error: ', err);
            process.exit(1);
            return;
        }

        const results = { successful: [], failed: [], outputs: [] };

        const excluded = [ /sdmakehome/, /\/target\/classes\// ];

        files = files.filter(f => !excluded.some(r => r.test(f)));

        Promise
            .all(files.map(f => new Promise((resolve, reject) =>
                parseFile(f)
                    .then(data => {
                        results.outputs.push(data);
                        resolve(results.successful.push(f));
                    })
                    .catch(err => resolve(results.failed.push(f))))
            ))
            .then(data => {
                const fileCnt = files.length;
                const successCnt = results.successful.length;
                const failureCnt = results.failed.length
                const failures = results.failed.join('\n');

                console.log(`Succeeded: ${successCnt} / ${fileCnt}\nFailed: ${failureCnt} / ${fileCnt}\n${failures}`);
            });
    });
} else if (stat.isFile()) {
    parseFile(process.argv[2]).then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    console.error(`${firstArg} does not exist or is not a file or a directory`);
}

