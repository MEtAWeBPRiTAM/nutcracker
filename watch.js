const chokidar = require('chokidar');
const { exec } = require('child_process');

const uploadDir = './public/uploads';

// Initialize watcher to monitor uploads directory
const watcher = chokidar.watch(uploadDir, {
  ignored: /^\./, // ignore dotfiles
  persistent: true
});

// Add event listeners
watcher
  .on('add', (path) => {
    console.log(`File ${path} has been added`);
    restartServer();
  })
  .on('error', (error) => {
    console.error(`Watcher error: ${error}`);
  });

// Function to restart the server
function restartServer() {
  console.log('Restarting server...');
  exec('npm start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Server restart failed: ${error}`);
      return;
    }
    console.log(`Server restarted successfully: ${stdout}`);
  });
}
