// components/Header.js

import React from 'react';
import styles from './Header.module.css'; // Import CSS module for styling
import Image from 'next/image';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <a href="/"><img src="/static/images/logo.png"/></a>
                <h1>NutCracker</h1>
            </div>
            <nav className={styles.navbar}>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/UploadForm">Upload</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
