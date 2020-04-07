// Generoi SDK:n apikuvauksen perusteella.
const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const ylopsDir = process.env.YLOPS_SERVICE_DIR;
const generatedDir = 'src/generated';
const specfile = `${ylopsDir}/target/openapi/ylops.spec.json`;

function execOag(gendir) {
    const oagCmd = exec(`openapi-generator generate -c ../../generator.config.json -i "${specfile}" -g typescript-axios`, {
        cwd: gendir
    });
    oagCmd.stdout.pipe(process.stdout);
    oagCmd.stderr.pipe(process.stderr);

    return oagCmd;
}

function execMvn() {
    const mvnCmd = exec('mvn clean compile -Pgenerate-openapi', {
        cwd: ylopsDir
    });
    mvnCmd.stdout.pipe(process.stdout);
    mvnCmd.stderr.pipe(process.stderr);

    return mvnCmd;
}

function start() {
    if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir);
    }
    process.chdir(generatedDir);
    const gendir = process.cwd();

    const mvnCmd = execMvn();

    mvnCmd.on('exit', (code, signal) => {
        console.log(`mvn process exited with code ${code} and signal ${signal}\n`);
        if (code === 0) {
            const oagCmd = execOag(gendir);

            oagCmd.on('exit', (code, signal) => {
                process.exit(code);
            });
        } else {
            process.exit(code);
        }
    });
}

function main() {
    if (ylopsDir) {
        start();
    } else {
        console.log('\x1b[1mYLOPS_SERVICE_DIR\x1b[0m is not set.\n');
        console.log(`For example, call export \x1b[1mYLOPS_SERVICE_DIR=${path.join(os.homedir(), '/eperusteet-ylops/eperusteet-ylops-service')}\x1b[0m\n`);
        process.exit(1);
    }
}

main();
