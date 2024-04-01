// pages/video/[videoId].js

import { useRouter } from 'next/router';
import VideoPlayer from '../../components/VideoPlayer'; // Import the VideoPlayer component
import styles from '../styles/videopage.module.css'; // Import the VideoPlayer component

function VideoPlayerPage() {
    const router = useRouter();
    const { videoId } = router.query;

    return (
        <div className={styles.maincontainer}>
            {videoId && <VideoPlayer videoId={videoId} />} {/* Pass the videoId to the VideoPlayer component */}
        </div>
    );
}


export default VideoPlayerPage;