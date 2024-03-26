import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { videoId } = req.body;

  try {
    const { db } = await connectToDatabase();

    // Update view count in videosRecord collection
    const updatedVideo = await db.collection('videosRecord').findOneAndUpdate(
      { fileUniqueId: videoId },
      { $inc: { viewCount: 1 } },
      { returnOriginal: false }
    );

    // Fetch related user from video information
    const relatedUser = await db.collection('userRecord').findOne({ _id: updatedVideo.relatedUserId });

    // Update view count in userRecord collection and totalViews
    await db.collection('userRecord').updateOne(
      { _id: relatedUser._id },
      { $inc: { totalViews: 1 } }
    );

    console.log("Increment success");
    return res.status(200).json({ message: 'View count incremented successfully' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
