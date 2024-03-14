// components/Banner.js

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Banner.module.css'; // Import CSS module for styling
import Link from 'next/link';
import Image from 'next/image';

const Banner = () => {
    return (
        <div className={styles.maincontainer}>
            <Header />
            <div className={styles.section1}>
                <div className={styles.left}>
                    <div className={styles.wrapper}>
                        <h1>Turn Your Shared Videos into Revenue Streams</h1>
                        <h3 className={styles.headingslogan}>Fast, Easy And Secure.</h3>
                        <div className={styles.buttonsContainer}>
                            <Link href="/UploadForm" legacyBehavior>
                                <a className={styles.button}>Start Upload</a>
                            </Link>
                            <Link href="https://t.me/nutcracker_video_convert_bot"  legacyBehavior>
                                <a className={styles.buttonsec} target="_blank">Upload Via Telegram</a>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.bannerimg}>
                        <img src="/static/images/logo.svg" />
                    </div>
                    <div className={`${styles.usp1} ${styles.usp}`}>Upload Videos</div>
                    <div className={`${styles.usp2} ${styles.usp}`}>Convert Link</div>
                    <div className={`${styles.usp3} ${styles.usp}`}>Share Videos</div>
                    <div className={`${styles.usp4} ${styles.usp}`}>Start Earning</div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Banner;
