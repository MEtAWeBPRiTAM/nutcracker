import nextConnect from 'next-connect';
import { createReadStream } from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import multer from 'multer';
import db from '../../lib/db';
import findOrCreateUser from './function';

// Replace these placeholders with your MySQL database configuration
const botToken = 'bot6837630862:AAGz-RZ8UMyBwY8w79Ai7GzJqpAuOKk2__M';
const bot = new TelegramBot(botToken);

// Set the webhook URL
const webhookUrl = 'https://api.telegram.org/bot6837630862:AAGz-RZ8UMyBwY8w79Ai7GzJqpAuOKk2__M';
bot.setWebHook(webhookUrl);

const handler = nextConnect();
handler.use(upload.single('video'));
handler.post(async (req, res) => {
  const { body } = req;
  const chatId = body.message.chat.id;
  const userPhone = body.message.from.id;

  try {
    // Search for user in database
    let recordId = await findOrCreateUser(userPhone);

    if (body.message.video) {
      const videoId = body.message.video.file_id;
      bot.downloadFile(videoId, 'downloads/').then(async (path) => {
        bot.sendMessage(chatId, 'Video received. Uploading...');
        // Upload video to database
        await uploadVideo(recordId, path);
        bot.sendMessage(chatId, 'Video uploaded successfully!');
      }).catch((err) => {
        bot.sendMessage(chatId, `Error uploading video: ${err.message}`);
      });
    } else {
      bot.sendMessage(chatId, 'Please send a video.');
    }
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }

  res.json({ message: 'Video received!' });
});

export default handler;
