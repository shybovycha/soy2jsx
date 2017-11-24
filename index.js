const parser = require('./SOY.js');

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

            try {
                const dirname = path.dirname(filename);
                const baseFileName = path.basename(filename);
                const astFilename = path.join(dirname, baseFileName + '.ast');
                const jsxFilename = path.join(dirname, baseFileName + '.jsx');

                const ast = parser.parse(sample);

                if (ast) {
                    fs.writeFileSync(astFilename, JSON.stringify(ast, null, 4));

                    const jsx = recast.print(ast).code;

                    fs.writeFileSync(jsxFilename, jsx);

                    try {
                        recast.parse(jsx);
                    } catch (e) {
                        throw `Error parsing output JSX: ${JSON.stringify(e)}`;
                    }

                    return resolve(ast);
                } else {
                    throw `Parsing ${filename} failed. Data does not exist: ` + JSON.stringify(ast);
                }
            } catch (e) {
                console.error(`ERROR: Could not parse file ${filename}.`, e);
                return reject(err);
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

