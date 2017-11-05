const parser = require('./SOY.js');

const fs = require('fs');
const util = require('util');
const process = require('process');
const glob = require('glob');

function parseFile(filename) {
    // console.log('Parsing file', filename);

    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, sample) => {
            if (err) {
                // console.error('Could not read input file');
                return reject(err);
            }

            try {
                const data = parser.parse(sample);

                if (data) {
                    // console.log(`File ${filename} parsed successfully`);
                    // console.log('Parser result: ', util.inspect(data, { depth: null, showHidden: false }));
                    return resolve(data);
                } else {
                    throw `Parsing ${filename} failed. Data does not exist: ` + JSON.stringify(data);
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

        const results = { successful: [], failed: [] };

        const excluded = [ /sdmakehome/, /\/target\/classes\// ];

        files = files.filter(f => !excluded.some(r => r.test(f)));

        Promise.all(files.map(f => new Promise((resolve, reject) => 
            parseFile(f)
                .then(data => resolve(results.successful.push(f)))
                .catch(err => resolve(results.failed.push(f))))
        ))
            .then(data => console.log(`Succeeded: ${results.successful.length} / ${files.length}\nFailed:\n${results.failed.join('\n')}`));
    });
} else if (stat.isFile()) {
    parseFile(process.argv[2]).then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    console.error(`${firstArg} does not exist or is not a file or a directory`);
}

