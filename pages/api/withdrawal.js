// withdrawal.js

// Import necessary dependencies and database connection
const db = require('../../lib/db'); // Assuming you have a db.js file for database connection

// Endpoint to handle withdrawal requests
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, withdrawalAmount, withdrawalMethod } = req.body;

        try {
            // Check if withdrawal amount is valid and within user's earnings
            const checkBalanceQuery = 'SELECT amount FROM earnings WHERE user_id = ?';
            const [balanceRows] = await db.query(checkBalanceQuery, [userId]);
            const balance = balanceRows[0]?.amount || 0;

            if (withdrawalAmount < 20) {
                return res.status(400).json({ error: 'Minimum withdrawal amount is $20' });
            }

            if (withdrawalAmount > balance) {
                return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
            }

            // Process withdrawal based on withdrawal method (bank transfer, UPI payment)
            if (withdrawalMethod === 'bank_transfer') {
                // Implement logic for bank transfer
                // Deduct withdrawn amount from user's earnings
            } else if (withdrawalMethod === 'upi_payment') {
                // Implement logic for UPI payment gateway
                // Deduct withdrawn amount from user's earnings
            } else {
                return res.status(400).json({ error: 'Invalid withdrawal method' });
            }

            // Deduct withdrawn amount from user's earnings
            const updateEarningsQuery = 'UPDATE earnings SET amount = amount - ? WHERE user_id = ?';
            await db.query(updateEarningsQuery, [withdrawalAmount, userId]);

            return res.status(200).json({ message: 'Withdrawal request processed successfully' });
        } catch (error) {
            console.error('Error processing withdrawal request:', error);
            return res.status(500).json({ error: 'Error processing withdrawal request' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
