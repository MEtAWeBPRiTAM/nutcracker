const chokidar = require('chokidar');
const { exec } = require('child_process');

const directoryToWatch = './public/uploads/';
// const commandToRestartServer = 'sudo kill $(pgrep next-serv)';
// const commandToRestartServer2 = 'npm start';
const commandToRestartServer3 = 'pm2 restart 9';
// const commandToRestartServer4 = 'rs';

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
  exec(commandToRestartServer3, (error, stdout, stderr) => {
    console.log("Trying to restart");
    if (error) {
      console.error(`Error executing command: ${error}`);
      console.log(`Error executing command: ${error}`);
      return;
    }
    console.log(`Server restarted successfully`);
  });
}
