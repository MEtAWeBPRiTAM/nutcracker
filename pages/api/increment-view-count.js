// pages/api/increment-view-count.js

import client from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { videoId } = req.query;

      // Validate videoId
      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      // Update view count in the database only if played for at least 5 seconds
      const playedForMinimumDuration = req.body.playedForMinimumDuration;
      if (!playedForMinimumDuration) {
        return res.status(400).json({ error: "Duration played is required" });
      }

      // Check if the video was played for at least 5 seconds
      if (playedForMinimumDuration < 5) {
        return res.status(200).json({ success: true, message: "Video not played for minimum duration" });
      }

      // Update view count in the videoRecord collection
      const db = client.db("nutCracker");
      const videoCollections = db.collection("videosRecord");
      const result = await videoCollections.updateOne(
        { fileUniqueId: videoId },
        { $inc: { viewCount: 1 } } // Increment view count by 1
      );

      if (result.modifiedCount !== 1) {
        return res.status(404).json({ error: "Video not found" });
      }

      // Get related user from videoRecord collection
      const videoRecord = await videoCollections.findOne({ fileUniqueId: videoId });
      const relatedUser = videoRecord.relatedUser;

      // Update total views for the related user in the userRecord collection
      const userCollections = db.collection("userRecord");
      await userCollections.updateOne(
        { userId: relatedUser },
        { $inc: { totalViews: 1 } } // Increment total views by 1
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      res.status(500).json({ error: "Error incrementing view count" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
