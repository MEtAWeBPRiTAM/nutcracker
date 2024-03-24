const chokidar = require('chokidar');
const { exec } = require('child_process');

const directoryToWatch = './public/uploads';
const commandToRestartServer = 'pm2 restart nutcracker';

const watcher = chokidar.watch(directoryToWatch, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher
  .on('add', path => {
    console.log(`File ${path} has been added`);
    restartServer();
  })
  .on('change', path => {
    console.log(`File ${path} has been changed`);
    restartServer();
  });

function restartServer() {
  exec(commandToRestartServer, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.log(`Server restarted successfully`);
  });
}
