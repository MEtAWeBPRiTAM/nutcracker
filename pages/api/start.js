// import db from '../../lib/db';

// const TelegramBot = require('node-telegram-bot-api');
// // const express = require('express');
// const bodyParser = require('body-parser');

// // const app = express();
// // const port = 3000;

// // Configure body parser
// app.use(bodyParser.json());

// // Create an instance of the Telegram bot
// const token = '6945504983:AAGpTyY1kEfdoNFzH-SaD-11Sm2ieeFyC3M';
// const bot = new TelegramBot(token, { polling: true });

// // Handle the /start command
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     const { id, first_name, last_name, username } = msg.from;

//     // Save user information to the database
//     // Replace this with your database logic to create a new user account
//     saveUserToDatabase(id, first_name, last_name, username);

//     // Respond to the user
//     bot.sendMessage(chatId, 'Welcome! Upload, Share and Earn.');
// });

// // Function to save user information to the database
// function saveUserToDatabase(id, first_name, last_name, username) {
//     const query = 'INSERT INTO tusers (telegram_id, first_name, last_name, username) VALUES (?, ?, ?, ?)';
//     const values = [id, first_name, last_name, username];

//     // Execute the SQL query
//     connection.query(query, values, (error, results, fields) => {
//         if (error) {
//             console.error('Error saving user to database:', error);
//             return;
//         }
//         console.log('User information saved to database:', id, first_name, last_name, username);
//     });
//     console.log('User information saved:', id, first_name, last_name, username);
// }

// // Start the server
// // app.listen(port, () => {
// //     console.log(`Server is running on http://localhost:${port}`);
// // });
