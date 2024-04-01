// pages/video/[videoId].js

import { useRouter } from "next/router";
import VideoPlayer from "../../components/VideoPlayer";
import styles from "../styles/videopage.module.css";

function VideoPlayerPage() {
  const router = useRouter();
  const { videoId } = router.query;

  return (
    <div className={styles.maincontainer}>
      {videoId && <VideoPlayer videoId={videoId} />}
    </div>
  );
}

export default VideoPlayerPage;
