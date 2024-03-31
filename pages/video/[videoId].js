// pages/video/[videoId].js

import { useRouter } from 'next/router';
import VideoPlayer from '../../components/VideoPlayer'; // Import the VideoPlayer component
import styles from '../styles/videopage.module.css'; // Import the VideoPlayer component

function VideoPlayerPage() {
    const router = useRouter();
    const { videoId } = router.query;

    useEffect(() => {
        // Increment view count when the component mounts
        if (videoId) {
            incrementViewCount(videoId);
        }
    }, [videoId]);

    return (
        <div className={styles.maincontainer}>
            {videoId && <VideoPlayer videoId={videoId} />} {/* Pass the videoId to the VideoPlayer component */}
        </div>
    );
}

async function incrementViewCount(videoId) {
    try {
        // Send a request to your backend API to increment the view count for the given videoId
        const response = await fetch(`/api/incrementViewCount?videoId=${videoId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to increment view count');
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

export default VideoPlayerPage;