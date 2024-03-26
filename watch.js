const chokidar = require('chokidar');
const { exec } = require('child_process');

const directoryToWatch = './public/uploads/';
const commandToRestartServer2 = 'sudo systemctl reload nginx';
const commandToRestartServer = 'pm2 restart 9';

const watcher = chokidar.watch(directoryToWatch, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher.on('add', path => {
  console.log(`File ${path} has been added`);
  restartServer();
});
// .on('change', path => {
//   console.log(`File ${path} has been changed`);
//   restartServer();
// });

function restartServer() {
  exec(commandToRestartServer2, commandToRestartServer, (error, stdout, stderr) => {
    console.log("Trying to restart");
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.log(`Server restarted successfully`);
  });
}
