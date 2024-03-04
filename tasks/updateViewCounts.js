// // tasks/updateViewCounts.js
// // import node-cron from 'node-cron';
// // Import necessary dependencies and database connection
// const db = require('../lib/db');
// const cron = require('node-cron');

// // Function to update view counts
// async function updateViewCounts() {
//     try {
//         // Query to update view counts for each video
//         const viewCountQuery = 'Your SQL query to update view counts goes here';
//         await db.query(viewCountQuery);

//         console.log('View counts updated successfully');
//     } catch (error) {
//         console.error('Error updating view counts:', error);
//     }
// }

// // Schedule the task to run every hour (you can adjust the schedule as needed)
// cron.schedule('0 * * * *', updateViewCounts);

// // Log when the task starts
// console.log('View count update task scheduled');

// // Export the function if needed
// module.exports = updateViewCounts;
