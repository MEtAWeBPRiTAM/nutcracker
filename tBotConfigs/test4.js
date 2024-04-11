const { Telegraf, Scenes } = require('telegraf');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const fs = require('fs');

require('dotenv').config();

// Initialize MongoDB
const MONGO_URI = process.env.mongoDB_uri;
const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

client.connect()
    .then(() => {
        db = client.db("nutCracker");
        console.log("Connected to MongoDB");
    })
    .catch(err => console.error(err));

// Initialize Telegraf bot
const bot = new Telegraf(process.env.bot1Token);

// Define the scene for uploading video from link

// Scene enters when /uploadfromlink command is triggered
const uploadFromLinkScene = new Scenes.BaseScene('uploadFromLinkScene');
bot.command('uploadfromlink', async (ctx) => {
    try {
        await ctx.scene.enter('uploadFromLinkScene');
    } catch (error) {
        console.error("Error entering scene:", error);
        ctx.reply('An error occurred while processing the command. Please try again later.');
    }
});

// Scene enters
uploadFromLinkScene.enter((ctx) => {
    ctx.reply('Please provide the video link.');
});

// Scene handles text input
uploadFromLinkScene.on('text', async (ctx) => {
    const videoLink = ctx.message.text;
    const user_id = ctx.message.from.id;
    const sender_username = ctx.message.from.username;

    try {
        const unique_link = await processVideoLink(videoLink, user_id, sender_username);
        ctx.reply(`Your video has been uploaded successfully...\n\n😊😊Now you can start using the link:\n\n${unique_link}`);
    } catch (err) {
        console.error('Error uploading video from link:', err);
        ctx.reply('An error occurred while processing the video link. Please try again later.');
    }

    // Leave the scene to stop further processing of text messages
    ctx.scene.leave();
});
stage.register(uploadFromLinkScene);
// Register the scene with Telegraf's stage
const stage = new Scenes.Stage([uploadFromLinkScene]);
bot.use(stage.middleware());

// Function to process video link and upload the video
async function processVideoLink(video_link, user_id, sender_username) {
    const video_path = await downloadAndStoreVideo(video_link);
    const videoId = generateRandomHex(24);
    const originalFileName = getOriginalFileName(video_link);

    const video_info = {
        "videoName": originalFileName,
        "originalFileName": originalFileName,
        "fileLocalPath": `/public/uploads/${videoId}`,
        "file_size": fs.statSync(video_path).size,
        "duration": 0, // Update with actual duration if available
        "mime_type": "video/mp4", // Update with actual MIME type if available
        "fileUniqueId": videoId,
        "relatedUser": user_id,
        "userName": sender_username || "",
    };
    
    await db.collection("videosRecord").insertOne(video_info);

    const videoUrl = `http://nutcracker.live/video/${videoId}`;
    return videoUrl;
}

// Function to download and store video from link
async function downloadAndStoreVideo(video_url) {
    const filename = generateRandomFilename() + ".mp4";
    const filepath = `../public/uploads/${filename}`;

    const response = await fetch(video_url);
    const fileStream = fs.createWriteStream(filepath);

    await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on("error", (err) => {
            reject(err);
        });
        fileStream.on("finish", function() {
            resolve();
        });
    });

    return filepath;
}

// Function to generate random filename
function generateRandomFilename(length = 10) {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to generate random hex string
function generateRandomHex(length) {
    const characters = "abcdef0123456789";
    let randomHex = "";
    for (let i = 0; i < length; i++) {
        randomHex += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomHex;
}

// Function to extract original filename from video link
function getOriginalFileName(video_link) {
    const urlParts = video_link.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename;
}

// Start the bot
bot.launch()
    .then(() => console.log("Bot started"))
    .catch(err => console.error(err));
