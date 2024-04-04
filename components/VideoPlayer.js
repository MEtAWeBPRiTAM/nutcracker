import { useEffect, useState, useRef } from "react";
import fetchVideoDetails from "../lib/fetchVideoDetails";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import styles from "../pages/styles/videopage.module.css";

function VideoPlayer({ videoId }) {
  const videoRef = useRef(null);
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

  useEffect(() => {
    if (videoDetails) {
      const player = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        fluid: true, // Make the player responsive
      });

      player.src({
        src: `/uploads/${videoDetails.videoName}`,
        type: "video/mp4",
      });

      return () => {
        if (player) {
          player.dispose(); // Cleanup when component unmounts
        }
      };
    }
  }, [videoDetails]);

  const handleShare = async () => {
    if (videoDetails && navigator.share) {
      try {
        await navigator.share({
          title: videoDetails.videoName,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing video:", error);
      }
    } else {
      const shareUrl = window.location.href;
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Video link copied to clipboard!");
      } catch (error) {
        console.error("Error copying video link:", error);
      }
    }
  };

  if (!videoDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <h2>{videoDetails.videoName}</h2>
        <div className={styles.videocontainer}>
        <div data-vjs-player>
          <video ref={videoRef} className="video-js vjs-default-skin video" />
        </div>
        </div>
        <button onClick={handleShare}>Share</button>
      </div>
    </div>
  );
}

export default VideoPlayer;
