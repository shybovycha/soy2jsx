const { compileFile } = require('./src/compiler');

const fs = require('fs');
const process = require('process');
const glob = require('glob');

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
                compileFile(f)
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
    compileFile(process.argv[2]).then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    console.error(`${firstArg} does not exist or is not a file or a directory`);
}
