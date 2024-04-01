// components/VideoPlayer.js

import React, { useState, useEffect } from "react";

function VideoPlayer({ videoId }) {
  const [videoDetails, setVideoDetails] = useState(null);

  useEffect(() => {
    async function fetchVideoDetails() {
      try {
        const response = await fetch(`/api/videoDetails?videoId=${videoId}`);
        if (response.ok) {
          const data = await response.json();
          setVideoDetails(data);
        } else {
          throw new Error("Failed to fetch video details");
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    }

    fetchVideoDetails();
  }, [videoId]);

  return (
    <div>
      {videoDetails ? (
        <div>
          <h2>{videoDetails.title}</h2>
          <p>{videoDetails.description}</p>
          {/* Render video player here using videoDetails */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default VideoPlayer;
