// // calculateEarnings.js

// // Import necessary dependencies and database connection
// const db = require('../../lib/db'); // Assuming you have a db.js file for database connection

// async function calculateEarnings() {
//     try {
//         // Query to get view count for each video
//         const viewCountQuery = 'SELECT video_id, COUNT(*) AS total_views FROM video_views GROUP BY video_id';
//         const [viewCountRows] = await db.query(viewCountQuery);

//         // Calculate earnings for each video
//         for (const row of viewCountRows) {
//             const { video_id, total_views } = row;

//             // Calculate earnings based on view count
//             const earnings = Math.floor(total_views / 1000) * 0.9; // Assuming 0.9 dollars for every 1000 views

//             // Update earnings for the user who uploaded the video
//             const updateEarningsQuery = 'UPDATE earnings SET amount = amount + ? WHERE user_id = (SELECT user_id FROM videos WHERE id = ?)';
//             await db.query(updateEarningsQuery, [earnings, video_id]);
//         }

//         console.log('Earnings calculated successfully');
//     } catch (error) {
//         console.error('Error calculating earnings:', error);
//     }
// }

// // Run the function to calculate earnings
// calculateEarnings();





// calculateEarnings.js

// Import necessary dependencies and database connection
const db = require('../../lib/db'); // Assuming you have a db.js file for database connection

async function calculateEarnings() {
    try {
        // Query to get view count for each video
        const viewCountQuery = 'SELECT video_id, COUNT(*) AS total_views FROM video_views GROUP BY video_id';
        const [viewCountRows] = await db.query(viewCountQuery);

        // Calculate earnings for each video
        for (const row of viewCountRows) {
            const { video_id, total_views } = row;

            // Calculate earnings based on view count
            const earnings = Math.floor(total_views / 1000) * 0.9; // Assuming 0.9 dollars for every 1000 views

            // Update earnings for the user who uploaded the video
            const updateEarningsQuery = 'UPDATE earnings SET amount = amount + ? WHERE user_id = (SELECT user_id FROM videos WHERE id = ?)';
            await db.query(updateEarningsQuery, [earnings, video_id]);
        }

        console.log('Earnings calculated successfully');
    } catch (error) {
        console.error('Error calculating earnings:', error);
    }
}

// Run the function to calculate earnings
calculateEarnings();
