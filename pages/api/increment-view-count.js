import client from "../../lib/db";


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
    const db = client.db("nutCracker");

    console.log('Connected to MongoDB');

    // Update view count in videosRecord collection
    const updatedVideo = await db.collection('videosRecord').findOneAndUpdate(
      { fileUniqueId: videoId },
      { $inc: { viewCount: 1 } },
      { returnOriginal: false }
    );

    console.log('Updated video:', updatedVideo);

    // Fetch related user from video information
    const relatedUser = await db.collection('userRecord').findOne({ _id: updatedVideo.relatedUserId });

    console.log('Related user:', relatedUser);

    // Update view count in userRecord collection and totalViews
    await db.collection('userRecord').updateOne(
      { _id: relatedUser._id },
      { $inc: { totalViews: 1 } }
    );

    console.log('UserRecord updated');

    return res.status(200).json({ message: 'View count incremented successfully' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
