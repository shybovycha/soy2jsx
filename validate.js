const fs = require('fs');
const path = require('path');
const util = require('util');
const process = require('process');
const glob = require('glob');
const recast = require('recast');

const firstArg = process.argv[2];
const stat = fs.lstatSync(firstArg);

if (stat.isDirectory()) {
    glob(firstArg + '/**/*.jsx', (err, files) => {
        if (err) {
            console.error('Error: ', err);
            process.exit(1);
            return;
        }

        const excluded = [ /sdmakehome/, /\/target\/classes\// ];

        files = files.filter(f => !excluded.some(r => r.test(f)));

        const results = { successful: [], failed: [], outputs: [] };

        Promise
            .all(files.map(f => new Promise((resolve, reject) =>
                recast.parse(fs.readFileSync(f))
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
    console.log(JSON.stringify(recast.parse(fs.readFileSync(process.argv[2])), null, 4));
} else {
    console.error(`${firstArg} does not exist or is not a file or a directory`);
}
