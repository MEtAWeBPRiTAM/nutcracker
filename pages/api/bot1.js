// import TelegramBot from 'node-telegram-bot-api';

// // Import necessary modules
// const TelegramBot = require('node-telegram-bot-api');

// // Initialize Telegram Bot
// const token = '6945504983:AAGpTyY1kEfdoNFzH-SaD-11Sm2ieeFyC3M';
// const bot = new TelegramBot(token, { polling: true });

// // Handle /start command
// bot.onText(/\/start/, async (msg) => {
//     const chatId = msg.chat.id;
//     const username = msg.from.username;

//     // You can perform actions like storing user details here
//     // For simplicity, let's just send a welcome message
//     bot.sendMessage(chatId, `Welcome ${username} to our website!`);
// });

// // Handle other commands and user interactions as needed

// // Start your Next.js server or do other setup tasks here







// pages/api/telegramBot.js

// pages/api/telegramBot.js

// import TelegramBot from 'node-telegram-bot-api';
// const btoken = '6945504983:AAGpTyY1kEfdoNFzH-SaD-11Sm2ieeFyC3M'
// // Create a new instance of the Telegram bot
// const bot = new TelegramBot(btoken, { polling: true });

// // Log bot initialization
// console.log('Bot initialized successfully.');

// // Handle incoming messages
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const messageText = msg.text;

//     // Log incoming message
//     console.log(`Received message from ${chatId}: ${messageText}`);

//     // Echo the received message back to the user
//     bot.sendMessage(chatId, `You said: ${messageText}`)
//         .then(() => console.log('Message sent successfully.'))
        // .catch((error) => console.error('Error sending message:', error));
// });

// Handle errors
// bot.on('polling_error', (error) => {
//     console.error('Polling error:', error);
// });

// // Export an empty function to satisfy Next.js API route requirements
// export default function handler(req, res) {
//     res.status(200).end();
// }

// pages/api/bot1.js

import bot1 from '../../lib/bot1Logic';

export default function handler(req, res) {
  bot1.processUpdate(req.body);
  res.status(200).end();
}
