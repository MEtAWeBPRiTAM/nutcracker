// pages/api/videoDetails.js

import { ObjectId } from "mongodb";
import client from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { videoId } = req.query;

      const db = client.db("nutCracker");
      const collection = db.collection("videosRecord");

      const videoDetails = await collection.findOne({ fileUniqueId: videoId });

      if (videoDetails) {
        res.status(200).json(videoDetails);
      } else {
        res.status(404).json({ error: "Video not found" });
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
