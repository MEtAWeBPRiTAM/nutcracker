require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const fetch = require('node-fetch');


const app = new Telegraf(process.env.bot1Token);
const stage = new Scenes.Stage();
const uploadFromLinkScene = new Scenes.BaseScene('uploadFromLinkScene');

// Register the stage with the bot
app.use(session());
app.use(stage.middleware());

// Initialize MongoDB
const MONGO_URI = process.env.mongoDB_uri;
const client = new MongoClient(MONGO_URI);


async function main() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // Database & Collection
        const db = client.db('nutCracker');
        const videoCollection = db.collection('videosRecord');
        const userCollection = db.collection('userRecord');


        // Handle messages
        app.on('video', async (ctx) => {
            const user_id = ctx.message.from.id;
            const file_id = ctx.message.video.file_id;

            try {
                const fileInfo = await ctx.telegram.getFile(file_id);
                const videoUrl = `https://api.telegram.org/file/bot${process.env.bot1Token}/${fileInfo.file_path}`;
                const originalFilename = fileInfo.file_path.split('/').pop();

                const videoId = generateRandomHex(24);
                const videoName = `${videoId}_${originalFilename}`;

                const video_info = {
                    filename: videoName,
                    fileLocalPath: `../uploads/${videoId}`,
                    file_size: ctx.message.video.file_size,
                    duration: ctx.message.video.duration,
                    mime_type: ctx.message.video.mime_type,
                    uniqueLink: videoId,
                    relatedUser: user_id,
                    userName: ctx.message.from.username || '',
                    viewCount: 0,
                };

                await videoCollection.insertOne(video_info);

                // Download video file
                const videoFilePath = `../uploads/${videoName}`;
                const writer = fs.createWriteStream(videoFilePath);
                const response = await axios({
                    url: videoUrl,
                    method: 'GET',
                    responseType: 'stream'
                });
                response.data.pipe(writer);

                await ctx.reply(`Your video has been uploaded successfully...\n\n😊😊Now you can start using the link:\n\nhttp://nutcracker.live/video/${videoId}`);
            } catch (error) {
                console.error(error);
                await ctx.reply('An error occurred while processing your request. Please try again later.');
            }
        });

        app.command('titlerename', async (ctx) => {
            const args = ctx.message.text.split(' ');
            if (args.length < 2) {
                await ctx.reply('Please provide the video ID along with the new title.');
                return;
            }

            const videoId = args[1];
            const newTitle = args.slice(2).join(' ');

            try {
                const video_info = await videoCollection.findOneAndUpdate(
                    { fileUniqueId: videoId },
                    { $set: { videoName: newTitle } }
                );

                if (!video_info.value) {
                    await ctx.reply('No video found with the provided video ID.');
                    return;
                }

                await ctx.reply(`The title of the video with ID '${videoId}' has been updated to '${newTitle}'.`);
            } catch (error) {
                console.error(error);
                await ctx.reply('An error occurred while processing your request. Please try again later.');
            }
        });

        app.command('start', async (ctx) => {
            const user_id = ctx.message.from.id;
            const userName = ctx.message.from.username || '';
            const userRecord = await userCollection.findOne({ userId: user_id });

            if (userRecord) {
                await ctx.reply("Welcome back! Upload, Share and Earn.");
            } else {
                await userCollection.insertOne({
                    userId: user_id,
                    userName: userName,
                    upiNumber: 0,
                    uploadedVideos: 0,
                    totalViews: 0,
                    createdAt: new Date(),
                });
                await ctx.reply(`Welcome! ${ctx.message.from.first_name}\n\nWe're glad you're here.\nTo start using our platform\nYou can start sharing videos directly\n`);
            }
        });

        app.command('getmyuserid', async (ctx) => {
            await ctx.reply(`Here is your user id: ${ctx.message.from.id}`);
        });

        // My Account Info command handler
        app.command('myaccountsinfo', async (ctx) => {
            const { id } = ctx.from;

            try {
                const userInfo = await userCollection.findOne({ userId: id });

                if (userInfo) {
                    let infoMessage = "Your account information:\n\n";
                    for (const [key, value] of Object.entries(userInfo)) {
                        infoMessage += `${key}: ${value}\n`;
                    }
                    ctx.reply(infoMessage);
                } else {
                    ctx.reply("No account information found.");
                }
            } catch (err) {
                console.error("Error fetching user information:", err);
                ctx.reply("An error occurred while fetching your account information.");
            }
        });

        app.command('availablebots', async (ctx) => {
            const bot_list = [
                ["Nutcracker video convert bot.", "https://t.me/nutcracker_video_convert_bot"],
                ["NutCracker Link Convert Bot", "https://t.me/NutCracker_Link_Convert_Bot"],
                ["NutCracker Finance Bot", "https://t.me/NutCracker_Finance_Bot"]
            ];

            const keyboard = bot_list.map(bot => [{ text: bot[0], url: bot[1] }]);

            await ctx.reply("Available Bots:", { reply_markup: { inline_keyboard: keyboard } });
        });

        // Define the scene for uploading video from link

        // Scene enters when /uploadfromlink command is triggered
        app.command('uploadfromlink', (ctx) => {
            ctx.scene.enter('uploadFromLinkScene');
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
                if(unique_link){
                    ctx.reply(`Your video has been uploaded successfully...\n\n😊😊Now you can start using the link:\n\n${unique_link}`);
                }
            } catch (err) {
                console.error('Error uploading video from link:', err);
                ctx.reply('An error occurred while processing the video link. Please try again later.');
            }

            // Leave the scene to stop further processing of text messages
            ctx.scene.leave();
        });

        // Register the scene with Telegraf's stage
        // const stage = new Scenes.Stage([uploadFromLinkScene]);
        app.use(stage.middleware());
        stage.register(uploadFromLinkScene);

        async function downloadAndStoreVideo(videoUrl, folder = "../uploads/") {
            const filename = path.basename(new URL(videoUrl).pathname);
            const filepath = path.join(folder, filename);
        
            const writer = fs.createWriteStream(filepath);
        
            try {
                const response = await axios({
                    url: videoUrl,
                    method: 'GET',
                    responseType: 'stream'
                });
        
                response.data.pipe(writer);
        
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
        
                console.log("Video downloaded successfully:", filepath);
        
                // Check the content type of the downloaded file
                const contentType = response.headers['content-type'];
                console.log("Content Type:", contentType);
        
                // Check if the content type indicates a video file
                if (!contentType.startsWith('video')) {
                    throw new Error("Downloaded file is not a video.");
                }
            } catch (error) {
                console.error("Error downloading video:", error);
                // If an error occurs during the download process, delete the incomplete file
                fs.unlinkSync(filepath);
                throw error;
            }
        
            return filepath;
        }
        
        
        async function processVideoLink(videoLink, user_id, sender_username) {
            try {
                const videoPath = await downloadAndStoreVideo(videoLink);
                const videoId = generateRandomHex(24);
                
                const video_info = {
                    filename: path.basename(videoPath),
                    fileLocalPath: `../uploads/${videoId}`,
                    file_size: fs.statSync(videoPath).size,
                    duration: 0,  // Update with actual duration if available
                    mime_type: 'video/mp4',  // Update with actual MIME type if available
                    uniqueLink: videoId,
                    relatedUser: user_id,
                    userName: sender_username || '',
                };
            
                await videoCollection.insertOne(video_info);
                const videoUrl = `http://nutcracker.live/video/${videoId}`;
                return videoUrl;
            } catch (error) {
                console.error("Error processing video link:", error);
                throw error;
            }
        }


        // Start the bot
        app.launch();
    } catch (error) {
        console.error('Error during MongoDB connection:', error);
    }
}

main();

function generateRandomHex(length) {
    const characters = 'abcdef0123456789';
    let random_hex = '';
    for (let i = 0; i < length; i++) {
        random_hex += characters[Math.floor(Math.random() * characters.length)];
    }
    return random_hex;
}

