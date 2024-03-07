// components/VideoPlayer.js

import { useEffect, useState } from 'react';
import fetchVideoDetails from '../lib/fetchVideoDetails';
import ReactPlayer from 'react-player';
import styles from '../pages/styles/videopage.module.css';

function VideoPlayer({ videoId }) {
    const [videoDetails, setVideoDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await fetchVideoDetails(videoId);
                setVideoDetails(data);
            } catch (error) {
                console.error('Error fetching video details:', error);
            }
        };

        if (videoId) {
            fetchDetails();
        }
    }, [videoId]);

    if (!videoDetails) {
        return <div>Loading...</div>;
    }

    const videoUrl = `/uploads/${videoDetails.videoName}`;

    return (
        <div style={styles.maincontainers}>
            <div style={styles.container}>
                <div style={styles.videocontainer}>
                    <ReactPlayer url={videoUrl} controls={true} width="100%" height="100%" />
                </div>
                <div style={styles.videotitle}>
                    <h2>{videoDetails.videoName}</h2>
                </div>
            </div>
        </div>
    );
}

export default VideoPlayer;
