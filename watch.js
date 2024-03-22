const fs = require('fs');
const { exec } = require('child_process');

const watchDirectory = './public/uploads';

fs.watch(watchDirectory, (eventType, filename) => {
  console.log(`Event type: ${eventType}`);
  if (filename) {
    console.log(`File ${filename} has been ${eventType}`);
    // Restart the server here
    restartServer();
  } else {
    console.log('No filename provided');
  }
});

function restartServer() {
  console.log('Restarting server...');
  exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Server restarted successfully`);
  });
}
