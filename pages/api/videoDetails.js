// pages/api/videoDetails.js

import { ObjectId } from 'mongodb';
import client from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { videoId } = req.query;
      // console.log('Received videoId:', videoId); 

      // Attempt to create an ObjectId from the videoId string
      // const fileUniqueId = new ObjectId(videoId);
      // console.log('Created objectId:', objectId); 

      const db = client.db("nutCracker");
      const collection = db.collection("videosRecord");

      const videoDetails = await collection.findOne({ fileUniqueId: videoId });

      if (videoDetails) {
        res.status(200).json(videoDetails);
      } else {
        res.status(404).json({ error: 'Video not found' });
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { videoId } = req.body;
      const db = client.db("nutCracker");
      const collection = db.collection("videosRecord");

      // Update view count
      await collection.updateOne(
        { fileUniqueId: videoId },
        { $inc: { viewCount: 1 } }
      );

      res.status(200).json({ message: 'View count updated successfully' });
    } catch (error) {
      console.error('Error updating view count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
