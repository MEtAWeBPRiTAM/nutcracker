// components/VideoPlayer.js

import { useEffect, useState } from "react";
import fetchVideoDetails from "../lib/fetchVideoDetails";
import ReactPlayer from "react-player";
import styles from "../pages/styles/videopage.module.css";

function VideoPlayer({ videoId }) {
  const [videoDetails, setVideoDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchVideoDetails(videoId);
        setVideoDetails(data);
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    };

    if (videoId) {
      fetchDetails();
    }
  }, [videoId]);

  const consoles = async () =>  {
     resp = "Entered";
     await console.log(resp);
  };

  if (!videoDetails) {
    return <div>Loading...</div>;
  }

  const videoUrl = `/uploads/${videoDetails.videoName}`;

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.innercontainer}>
          <div className={styles.videotitle}>
            <h2>{videoDetails.videoName}</h2>
          </div>
          <div className={styles.videocontainer}>
            <ReactPlayer
              className={styles.video}
              url={videoUrl}
              controls={true}
              width="100%"
              height="100%"
              onPlay={consoles}
            />
          </div>
          <div className={styles.shareButton}>
            <button onClick={handleShare}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
