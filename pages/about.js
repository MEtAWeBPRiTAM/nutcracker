import styles from '../components/about.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div className={styles.maincontainer}>
            <Header />
            <div className={styles.acontainer}>
                <div className={styles.leftpart}>
                    <h3><div className={styles.line}></div> About Us</h3>
                    <p>
                        Welcome to NutCracker, where your videos become your revenue stream. At NutCracker, we provide a dynamic platform for users to effortlessly upload their videos and unlock the potential for earning revenue through views. Our user-friendly interface empowers creators of all backgrounds to showcase their content and engage with a global audience.</p>
                    <p>
                        NutCracker is more than just a video hosting platform; it's a community built on the principles of creativity, innovation, and empowerment. Whether you're a budding filmmaker, a talented vlogger, or an aspiring content creator, NutCracker offers you the tools and support you need to thrive in the digital landscape.
                    </p>
                    <p>
                        Join NutCracker today and embark on a journey where your creativity knows no bounds. Together, let's redefine the way we create, share, and monetize video content. Welcome to NutCracker—where your videos take center stage and your success knows no limits.
                    </p>
                </div>
                <div className={styles.rightpart}>
                    <h3>Our Mission</h3>
                    <p>
                        Our mission is to democratize the world of online content creation by providing equal opportunities for all. We believe that every voice deserves to be heard, every story deserves to be shared, and every creator deserves to be rewarded for their hard work and dedication.
                    </p>
                    <h3>How it Works:</h3>
                    <div className={styles.howworks}>
                        <div className={styles.howworksbox}>
                            <h1>1</h1>
                            <p>Upload Video on our Website</p>
                        </div>
                        <div className={styles.howworksbox}>
                            <h1>2</h1>
                            <p>Get a temporary link for Uploaded video</p>
                        </div>
                        <div className={styles.howworksbox}>
                            <h1>3</h1>
                            <p>Convert link in our Telegram Bot</p>
                        </div>
                        <div className={styles.howworksbox}>
                            <h1>1</h1>
                            <p>Or Upload direct via Telegram Bot</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default About;