// pages/api/restartServer.js
export default function handler(req, res) {
    // Restart your Next.js server here
    console.log('Restarting server...');
    process.exit(0); // This will terminate the server process and it will restart if it's being managed by a process manager like PM2 or forever
    res.status(200).json({ message: 'Server restart initiated' });
}
