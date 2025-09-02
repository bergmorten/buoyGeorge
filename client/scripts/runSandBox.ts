import chokidar from 'chokidar';
import { storeAmplifyOutput } from './uploadAmplifyOutput';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'node:crypto';
import { styleText } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const amplifyOutputsPath = join(__dirname, '../amplify_outputs.json');
const profile = process.env.AWS_PROFILE;
if (!profile) {
    console.error('AWS_PROFILE environment variable is not set');
    process.exit(1);
}
let fileHash = '';

function md5() {
    const data = readFileSync(amplifyOutputsPath, 'utf-8');
    return createHash('md5').update(data).digest('hex');
}
if (existsSync(amplifyOutputsPath)) {
    fileHash = md5();
}

chokidar.watch(amplifyOutputsPath).on('all', async (event) => {
    if (event === 'add' || event === 'change') {
        const newHash = md5();
        if (true || newHash !== fileHash) {
            console.log('\n\namplify_outputs changed, uploading...');
            fileHash = newHash;
            try {
                await storeAmplifyOutput();
            } catch (error) {
                console.error('Error uploading amplify_outputs:', error);
            }
            console.log('Done\n\n');
        }
    }
});

const command = 'npx';
const args = [
    'ampx',
    'sandbox',
    '--stream-function-logs',
    '--profile',
    profile,
];

const child = spawn(command, args);
// Listen for data on the stdout stream
child.stdout.on('data', (data) => {
    const text = data.toString().trim() as string;
    if (text.includes('ERROR')) {
        console.error(
            styleText('red', `${new Date().toLocaleTimeString()}: ${text}`),
        ); // Output any errors
    } else {
        console.log(`${new Date().toLocaleTimeString()}: ${text}`); // Output the streamed data
    }
});

// Listen for data on the stderr stream (for errors)
child.stderr.on('data', (data) => {
    const text = data.toString().trim() as string;
    console.error(
        styleText('red', `${new Date().toLocaleTimeString()}: ${text}`),
    ); // Output any errors
});

// Listen for the 'close' event when the child process exits
child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});

// Listen for the 'error' event if the command fails to spawn
child.on('error', (err) => {
    console.error('Failed to start child process.', err);
});
