const parser = require('./SOY.js');
const fs = require('fs');
const util = require('util');
const process = require('process');

function parseFile(filename) {
    console.log('Parsing file', filename);

    fs.readFile(filename, 'utf8', (err, sample) => {
        if (err) {
            console.error('Could not read input file');
            return;
        }

        try {
            const data = parser.parse(sample);

            if (data) {
                console.log(`File ${filename} parsed successfully`)
                console.log('Parser result: ', util.inspect(data, { depth: null, showHidden: false }));
            } else {
                throw `Parsing ${filename} failed. Data does not exist: ` + JSON.stringify(data);
            }
        } catch (e) {
            console.error('ERROR: Could not parse file.', e);
        }
    });
}

parseFile(process.argv[2]);
