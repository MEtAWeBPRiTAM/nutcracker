// pages/api/restartServer.js

let restarting = false;

export default function handler(req, res) {
    if (restarting) {
        res.status(400).json({ message: 'Server is already restarting' });
        return;
    }

    restarting = true;
    console.log('Restarting server...');

    // Perform any cleanup or necessary tasks before restarting
    
    setTimeout(() => {
        console.log('Server restarted');
        process.exit(0);
    }, 1000); // Delay the server shutdown to allow time for responses to complete
    
    res.status(200).json({ message: 'Server restart initiated' });
}
