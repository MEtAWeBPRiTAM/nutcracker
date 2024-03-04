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
            <div className={styles.banner}>
                <div className={styles.maincontent}>
                    <h1>Unlock Your Earnings Turn Your Shared Videos into Revenue Streams</h1>
                    <h3 className={styles.headingslogan}>Fast, Easy And Secure.</h3>
                    <div className={styles.buttonsContainer}>
                        <Link href="/UploadForm" legacyBehavior>
                            <a className={styles.button}>Start Upload</a>
                        </Link>
                        <Link href="/components/UploadForm" legacyBehavior>
                            <a className={styles.buttonsec}>Upload Via Telegram</a>
                        </Link>
                    </div>
                </div>
                <div className={styles.sidecontent}></div>
            </div>
            <Footer />
        </div>
    );
};

export default Banner;
