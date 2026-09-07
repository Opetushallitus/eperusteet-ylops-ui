import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const vueTscBin = path.join(
  path.dirname(require.resolve('vue-tsc/package.json')),
  'bin/vue-tsc.js',
);

const result = spawnSync(
  process.execPath,
  [vueTscBin, '--noEmit', '--pretty', 'false'],
  {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: process.env,
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
const missingApiCall = /error TS(?:2339|2551): Property '[^']+' does not exist on type '(?:[^']*\b)?\w+Api\b[^']*'/;

const errors = output
  .split(/\r?\n/)
  .map(line => line.trimEnd())
  .filter(line => missingApiCall.test(line));

if (errors.length === 0) {
  console.log('No missing API calls.');
  process.exit(0);
}

console.error('Missing API calls:');
for (const line of errors) {
  console.error(line);
}
console.error(`\nFound ${errors.length} missing API call(s).`);
process.exit(1);
