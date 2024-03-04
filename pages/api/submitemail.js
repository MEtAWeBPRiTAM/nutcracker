// pages/api/submit-email.js

// Import necessary modules
import db from '../../lib/db';

// Define the API route for handling email submissions
export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { email } = req.body;

            // Check if the email already exists in the database
            const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

            if (!existingUser) {
                // If the email doesn't exist, insert a new user entry
                const insertQuery = 'INSERT INTO users (email) VALUES (?)';
                const result = await db.query(insertQuery, [email]);

                // Get the auto-generated user_id of the new user
                const userId = result.insertId;

                res.status(200).json({ userId, message: 'New user created successfully!' });
            } else {
                // If the email already exists, return the existing user's user_id
                const userId = existingUser.user_id;

                res.status(200).json({ userId, message: 'User already exists!' });
            }
        } catch (error) {
            console.error('Error submitting email:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
