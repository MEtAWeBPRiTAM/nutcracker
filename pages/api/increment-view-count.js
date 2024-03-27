// pages/api/increment-view-count.js

import client from "../../lib/db"

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { videoId } = req.query;

      // Validate videoIdz
      if (!videoId) {
        console.log("VErr");
        return res.status(400).json({ error: "Video ID is required" });
      }

      // Update view count in the database
      const db = client.db("nutCracker");
      const videoCollections = db.collection("videosRecord");
      const result = await videoCollections.updateOne(
        { fileUniqueId: videoId },
        { $inc: { viewCount: 1 } } // Increment view count by 1
      );

      console.log("connn")
      if (result.modifiedCount !== 1) {
        return res.status(404).json({ error: "Video not found" });
      }

      res.status(200).json({ success: true });
      console.log("vSucc");

      
    } catch (error) {
      console.error("Error incrementing view count:", error);
      console.log("Error incrementing view count:", error);
      res.status(500).json({ error: "Error incrementing view count" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
