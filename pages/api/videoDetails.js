// pages/api/videoDetails.js

import db from '../../lib/db'; // Import your database connection module

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { videoId } = req.query;
      // Fetch video details from the database based on the provided video ID
      const [videoDetails] = await db.query('SELECT * FROM uploadVideos WHERE recordId = ?', [videoId]);
      console.log([videoId]);

      if (videoDetails && videoDetails.length > 0) {
        // If video details are found, return the details as JSON response
        res.status(200).json(videoDetails[0]);
      } else {
        // If video details are not found, return a 404 error
        res.status(404).json({ error: 'Video not found' });
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    // Handle other HTTP methods (POST, PUT, DELETE, etc.)
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
