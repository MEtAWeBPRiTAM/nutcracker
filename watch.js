const chokidar = require('chokidar');
const { exec } = require('child_process');

const uploadDir = './public/uploads';
const nginxRestartCommand = 'sudo service nginx restart'; // Command to restart Nginx
const nextJsRestartCommand = 'sudo systemctl restart nutcracker'; // Command to restart Next.js server

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
  exec(nginxRestartCommand, (nginxError, nginxStdout, nginxStderr) => {
    if (nginxError) {
      console.error(`Nginx restart failed: ${nginxError}`);
      return;
    }
    console.log(`Nginx restarted successfully: ${nginxStdout}`);
    
    exec(nextJsRestartCommand, (nextJsError, nextJsStdout, nextJsStderr) => {
      if (nextJsError) {
        console.error(`Next.js server restart failed: ${nextJsError}`);
        return;
      }
      console.log(`Next.js server restarted successfully: ${nextJsStdout}`);
    });
  });
}
