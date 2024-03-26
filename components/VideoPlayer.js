// components/VideoPlayer.js

import { useEffect, useState } from "react";
import fetchVideoDetails from "../lib/fetchVideoDetails";
import ReactPlayer from "react-player";
import styles from "../pages/styles/videopage.module.css";

function VideoPlayer({ videoId, duration }) {
  const [videoDetails, setVideoDetails] = useState(null);
  const [playedSeconds, setPlayedSeconds] = useState(0);



  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchVideoDetails(videoId);
        setVideoDetails(data);
        console.log(setVideoDetails);
        console.log(data);
      } catch (error) {
        console.error("Error fetching video details:", error);
        console.log("Error fetching video details:", error);
      }
    };

    if (videoId) {
      fetchDetails();
    }

    const handleProgress = (progress) => {
      setPlayedSeconds(progress.playedSeconds);
    };

    const updateViewCount = async () => {
      let minDuration;
      if (duration <= 60) minDuration = 2;
      else if (duration <= 600) minDuration = 30;
      else minDuration = 60;

      if (playedSeconds >= minDuration) {
        try {
          await fetch('/api/videoDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoId }),
          });
        } catch (error) {
          console.error('Error updating view count:', error);
        }
      }
    }
    updateViewCount();
  }, [videoId, playedSeconds]);

  // const handleShare = async () => {
  //     if (navigator.share) {
  //         try {
  //             await navigator.share({
  //                 title: videoDetails.videoName,
  //                 url: window.location.href
  //             });
  //         } catch (error) {
  //             console.error('Error sharing video:', error);
  //         }
  //     } else {
  //         // Fallback for browsers that don't support Web Share API
  //         // You can implement your custom share functionality here
  //         const shareUrl = window.location.href;
  //         try {
  //             await navigator.clipboard.writeText(shareUrl);
  //             alert('Video link copied to clipboard!');
  //         } catch (error) {
  //             console.error('Error copying video link:', error);
  //         }
  //     }
  // };

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
      // Fallback for browsers that don't support Web Share API
      // You can implement your custom share functionality here
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

  const videoUrl = `/uploads/${videoDetails.videoName}`;
  console.log(videoUrl);

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



// components/VideoPlayer.js

// import { useEffect, useState } from "react";
// import fetchVideoDetails from "../lib/fetchVideoDetails";
// import ReactPlayer from "react-player";
// import styles from "../pages/styles/videopage.module.css";

// function VideoPlayer({ videoId }) {
//   const [videoDetails, setVideoDetails] = useState(null);

//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         const data = await fetchVideoDetails(videoId);
//         setVideoDetails(data);
//       } catch (error) {
//         console.error("Error fetching video details:", error);
//       }
//     };

//     if (videoId) {
//       fetchDetails();
//       restartServer(); // Call restartServer function when component mounts
//     }
//   }, [videoId]);

//   const restartServer = async () => {
//     try {
//       const response = await fetch("/api/restartServer", { method: "POST" });
//       if (!response.ok) {
//         throw new Error("Failed to restart server");
//       }
//       console.log("Server restart initiated successfully");
//     } catch (error) {
//       console.error("Error restarting server:", error);
//     }
//   };

//   const handleShare = async () => {
//     if (videoDetails && navigator.share) {
//       try {
//         await navigator.share({
//           title: videoDetails.videoName,
//           url: window.location.href,
//         });
//       } catch (error) {
//         console.error("Error sharing video:", error);
//       }
//     } else {
//       // Fallback for browsers that don't support Web Share API
//       const shareUrl = window.location.href;
//       try {
//         await navigator.clipboard.writeText(shareUrl);
//         alert("Video link copied to clipboard!");
//       } catch (error) {
//         console.error("Error copying video link:", error);
//       }
//     }
//   };

//   if (!videoDetails) {
//     return <div>Loading...</div>;
//   }

//   const videoUrl = `/uploads/${videoDetails.videoName}`;

//   return (
//     <div>
//       <div className={styles.container}>
//         <div className={styles.innercontainer}>
//           <div className={styles.videotitle}>
//             <h2>{videoDetails.videoName}</h2>
//           </div>
//           <div className={styles.videocontainer}>
//             <ReactPlayer
//               className={styles.video}
//               url={videoUrl}
//               controls={true}
//               width="100%"
//               height="100%"
//             />
//           </div>
//           <div className={styles.shareButton}>
//             <button onClick={handleShare}>Share</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default VideoPlayer;
