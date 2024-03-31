// // pages/api/incrementViewCount.js

// import client from '../../lib/db';

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     try {
//       console.log("Received increment view count request.");
//       const { videoId } = req.body;

//       console.log("Video ID:", videoId);

//       const db = client.db("nutCracker");
//       const collection = db.collection("videosRecord");

//       // Update viewCount for the video
//       const result = await collection.updateOne(
//         { fileUniqueId: videoId },
//         { $inc: { viewCount: 1 } } // Increment viewCount by 1
//       );

//       console.log("Result:", result);

//       if (result.modifiedCount === 1) {
//         res.status(200).json({ message: 'View count updated successfully' });
//       } else {
//         res.status(404).json({ error: 'Video not found' });
//       }
//     } catch (error) {
//       console.error('Error incrementing view count:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
