import { removeAmplifyOutput } from './deleteExisting';
import { spawn } from 'child_process';
import { styleText } from 'node:util';

const profile = process.env.AWS_PROFILE;
if (!profile) {
    console.error('AWS_PROFILE environment variable is not set');
    process.exit(1);
}

const command = 'npx';
const args = ['ampx', 'sandbox', '--profile', profile, 'delete'];

const child = spawn(command, args, { stdio: ['pipe'] });
process.stdin.setRawMode(true); // For raw key presses, without buffering
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (key) => {
    const keyStr = typeof key === 'string' ? key : key.toString();
    child.stdin.write(keyStr);

    // Optional: Handle specific key presses like Ctrl+C to exit
    if (keyStr === '\u0003') {
        // Ctrl+C
        process.exit();
    }
});
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
child.on('close', async (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
        console.log('Cleanup completed successfully');
        removeAmplifyOutput()
            .then(() => {
                console.log('Amplify output removed successfully');
                process.exit(0);
            })
            .catch((err) => {
                console.error(
                    'Error occurred while removing Amplify output:',
                    err,
                );
                process.exit(1);
            });
    } else {
        console.error('Cleanup failed');
    }
});

// Listen for the 'error' event if the command fails to spawn
child.on('error', (err) => {
    console.error('Failed to start child process.', err);
});
