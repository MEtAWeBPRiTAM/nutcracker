const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot('6837630862:AAGz-RZ8UMyBwY8w79Ai7GzJqpAuOKk2__M', { polling: true });

mongoose.connect('mongodb+srv://kamleshSoni:TLbtEzobixLJc3wi@nutcracker.hrrsybj.mongodb.net/?retryWrites=true&w=majority&appName=nutCracker', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define schema for storing video metadata
const videoSchema = new mongoose.Schema({
    chatId: String,
    fileId: String,
    fileName: String
});

const Video = mongoose.model('Video', videoSchema, "test");

// Listen for messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Check if the message contains a valid video link
    if (msg.text && msg.text.match(/(?:https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?/)) {
        try {
            const videoUrl = msg.text;

            // Fetch the video file
            const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            const videoBuffer = Buffer.from(response.data);

            // Save the video to the uploads directory with a unique filename
            const fileName = `video_${chatId}_${Date.now()}.mp4`;
            fs.writeFileSync(`../uploads/${fileName}`, videoBuffer);

            // Save video metadata to MongoDB
            const video = new Video({
                chatId: chatId,
                fileId: fileName,
                fileName: fileName
            });
            await video.save();

            // Send confirmation message with the unique link
            const uniqueLink = `https://yourdomain.com/${fileName}`; // Replace 'yourdomain.com' with your domain
            bot.sendMessage(chatId, `Video received and saved successfully!\nYou can view/download it from: ${uniqueLink}`);
        } catch (error) {
            console.error('Error processing video link:', error);
            bot.sendMessage(chatId, 'Error processing video link.');
        }
    } else {
        bot.sendMessage(chatId, 'Please send a valid video link.');
    }
});
