import styles from '../components/pages.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
const Terms = () => {
    return (
        <div className={styles.maincontainer}>
            <Header />
            <div className={styles.maincontainer2}>
                <h1 className={styles.mainheading}>Terms and Conditions</h1>
                <div className={styles.container}>
                    <p>This Nutcracker Service Agreement (the "Agreement") outlines the terms and conditions governing the use of services provided by Nutcracker ("we") to you ("User") served by Nutcracker. By utilizing our services, the User agrees to abide by the following terms and conditions:</p>
                    <ul>
                        <li>
                            Bandwidth Usage: We reserve the right to deactivate direct linking on user accounts that exhibit excessive bandwidth usage.
                        </li>
                        <li>Blogspot Websites: Earnings generated from Blogger Blogspot websites, due to a high volume of fraudulent activity, are not eligible for compensation.</li>

                        <li><span>Legal Compliance:</span>Users must adhere to all applicable laws in their jurisdiction, including those governing copyright and trademark. Content that infringes upon copyrights or trademarks is not permitted. In the event of an infringement claim, the User may be required to remove the copyrighted material until the matter is resolved.</li>

                        <li><span>Dispute Resolution: </span>In the event of disputes between users, Nutcracker is not obligated to intervene.</li>
                        <li><span>Liability:</span> Nutcracker bears no responsibility for the loss of business or any damages incurred due to website unavailability or data loss. We do not guarantee future reliability in serving, hosting, or storing images, videos, or files.</li>
                        <li><span>Changes to Terms of Service:</span>We retain the right to modify the Terms of Service at any time without prior notification to users.</li>
                        <li><span>Cooperation with Legal Authorities:</span>Nutcracker is committed to cooperating with legal authorities in any investigation that may arise. The online circulation or possession of child pornography or content related to rape/gang rape is a punishable offense.</li>
                        <p>By using Nutcracker's services, the User acknowledges and agrees to comply with these terms and conditions. Failure to adhere to these terms may result in the termination of services provided by Nutcracker.</p>

                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Terms;
