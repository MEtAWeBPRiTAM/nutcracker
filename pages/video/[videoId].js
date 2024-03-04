import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import fetchVideoDetails from '../../lib/fetchVideoDetails';
import ReactPlayer from 'react-player';
import styles from '../styles/videopage.module.css';
import Header from '../../components/Header'
import Footer from '../../components/Footer'

function VideoPage() {
    const router = useRouter();
    const video = router.query.videoId;
    const [videoDetails, setVideoDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await fetchVideoDetails(video);
                setVideoDetails(data);
            } catch (error) {
                console.error('Error fetching video details:', error);
            }
        };

        if (video) {
            fetchDetails();
        }
    }, [video]);

    if (!videoDetails) {
        return <div>Loading...</div>;
    }
    return (
        <div className={styles.maincontainer}>
            <Header/>
            <div className={styles.container}>
                <div className={styles.videocontainer}>
                    <ReactPlayer url={`/uploads/${videoDetails.videoName}`} controls={true} width="100%" height="auto" className={styles.video} />
                </div>
                <div className={styles.videotitle}>
                    <h1>{videoDetails.videoName}</h1>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default VideoPage;
