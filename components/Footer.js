// components/Footer.js

import React from 'react';
import styles from './Footer.module.css'; // Import CSS module for styling

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerwrapper}>
                <p>&copy; 2024 NutCracker. All rights reserved.</p>
                <div className={styles.links}>
                    <a href="/policy">Privacy Policy</a>
                    <a href="/terms">Terms and Conditions</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
