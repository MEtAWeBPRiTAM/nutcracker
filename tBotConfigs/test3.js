require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const { MongoClient } = require('mongodb');
const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');



const app = new Telegraf(process.env.bot1Token);
const stage = new Scenes.Stage();

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



        async function downloadAndStoreVideo(videoUrl, folder = "../uploads/") {
            const response = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream'
            });

            const filename = path.basename(new URL(videoUrl).pathname);
            const originalFilepath = path.join(folder, filename);
            const convertedFilename = `${filename.split('.')[0]}_converted.mp4`;
            const convertedFilepath = path.join(folder, convertedFilename);

            const writer = fs.createWriteStream(originalFilepath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', async () => {
                    try {
                        await new Promise((resolve, reject) => {
                            ffmpeg(originalFilepath)
                                .outputOptions('-vf scale=640:-1')
                                .on('error', reject)
                                .on('end', resolve)
                                .save(convertedFilepath);
                        });
                        resolve({ filepath: convertedFilepath, filename: convertedFilename });
                    } catch (error) {
                        reject(error);
                    }
                });
                writer.on('error', reject);
            });
        }



        app.on('video', async (ctx) => {
            const user_id = ctx.message.from.id;
            const video_file = ctx.message.video.file_id;
            const video_url = await ctx.telegram.getFileLink(video_file);

            try {
                const { filepath, filename } = await downloadAndStoreVideo(video_url);
                const videoId = generateRandomHex(24);

                const video_info = {
                    videoName: filename,
                    fileLocalPath: `../uploads/${filename}`,
                    file_size: ctx.message.video.file_size,
                    duration: ctx.message.video.duration,
                    mime_type: 'video/mp4', // Update with actual MIME type if available
                    fileUniqueId: videoId,
                    relatedUser: user_id,
                    userName: ctx.message.from.username || "",
                    viewCount: 0
                };

                await videoCollection.insertOne(video_info);

                const videoUrl = `http://nutcracker.live/video/${videoId}`;
                await ctx.reply(`Your video has been uploaded successfully...\n\n😊😊Now you can start using the link:\n\n${videoUrl}`);
            } catch (error) {
                console.error(error);
                await ctx.reply('An error occurred while processing your request. Please try again later.');
            }
        });


        const titlerenameScene = new Scenes.BaseScene('titlerenameScene');

        titlerenameScene.enter((ctx) => {
            ctx.reply('Please enter the video ID:');
        });

        titlerenameScene.on('text', async (ctx) => {
            const messageText = ctx.message.text.trim();

            // Check if a video ID is provided
            if (!ctx.session.videoId) {
                const videoId = messageText;
                console.log(videoId);
                const videoRecord = await videoCollection.findOne({ uniqueLink: videoId });

                if (!videoRecord) {
                    ctx.reply('No video found with the provided video ID.');
                    return ctx.scene.leave();
                }

                ctx.session.videoId = videoId;
                ctx.reply('Please enter the new title:');
            } else {
                // Assuming the text input is the new title
                const newTitle = messageText;

                try {
                    const updatedRecord = await videoCollection.findOneAndUpdate(
                        { uniqueLink: ctx.session.videoId },
                        { $set: { filename: newTitle } },
                        { returnOriginal: false } // Ensure to return the updated document
                    );

                    if (!updatedRecord.value) {
                        // The record was not found or not updated
                        ctx.reply('No video found with the provided video ID or the title was not updated.');
                    } else {
                        // The record was successfully updated
                        ctx.reply(`The title of the video with ID '${ctx.session.videoId}' has been updated to '${newTitle}'.`);
                    }
                } catch (error) {
                    console.error(error);
                    ctx.reply('An error occurred while processing your request. Please try again later.');
                }

                return ctx.scene.leave();
            }
        });


        app.command('titlerename', async (ctx) => {
            ctx.scene.enter('titlerenameScene');
        });
        stage.register(titlerenameScene);



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

        app.command('getmyid', async (ctx) => {
            await ctx.reply(`Here is your user id: ${ctx.message.from.id}`);
        });
        app.command('uploadfromdevice', async (ctx) => {
            await ctx.reply(`Share video to get started`);
        });

        // My Account Info command handler
        app.command('myaccountsinfo', async (ctx) => {
            const { id } = ctx.from;

            try {
                const userInfo = await userCollection.findOne({ userId: id });

                if (userInfo) {
                    const { userId, userName, totalViews, bankDetails, totalEarnings } = userInfo;

                    let infoMessage = "Your account information:\n\n";
                    infoMessage += `User ID: ${userId}\n`;
                    infoMessage += `User Name: ${userName}\n`;
                    infoMessage += `Total Views: ${totalViews}\n`;
                    infoMessage += `Bank Details: ${bankDetails}\n`;
                    infoMessage += `Total Earnings: ${totalEarnings}\n`;

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

        app.command('deletelink', async (ctx) => {
            const chatId = ctx.chat.id;

            // Flag to control whether the middleware should process messages
            let shouldProcessMessage = true;

            // Prompt the user to enter the video ID
            await ctx.reply('Please enter the video ID you want to delete:');

            // Set up a middleware to capture the next message from the user
            app.on('text', async (ctx) => {
                // Check if the middleware should process the message
                if (!shouldProcessMessage) return;

                // Extract the video ID from the user's response
                const videoId = ctx.message.text;

                // Attempt to delete the video link
                await deleteVideoLink(ctx, videoId);

                // Prevent further processing of messages
                shouldProcessMessage = false;
            });
        });

        async function deleteVideoLink(ctx, videoId) {
            try {
                // Find the video record
                const videoRecord = await videoCollection.findOne({ uniqueLink: videoId });
                console.log(videoRecord)

                // Check if the video record exists
                if (!videoRecord) {
                    await ctx.reply("No video found with the provided ID.");
                    return; // Exit the function early
                }

                // Delete the video record
                const deletionResult = await videoCollection.deleteOne({ uniqueLink: videoId });
                console.log(deletionResult)

                // Check if the video record was deleted
                if (deletionResult.deletedCount === 1) {
                    await ctx.reply("Video link deleted successfully.");
                } else {
                    await ctx.reply("An error occurred while deleting the video link. Please try again later.");
                }
            } catch (error) {
                console.error("Error deleting video link:", error);
                await ctx.reply("An error occurred while deleting the video link. Please try again later.");
            }
        }
        const tmpRecordCollection = db.collection('tmpRecord');
        app.command('convertsitelink', (ctx) => {
            // Prompt the user to provide the video link
            ctx.reply('Please provide the video link:');

            // Set session flag to indicate that user is converting a site link
            ctx.session.convertingSiteLink = true;
        });

        // Middleware to handle the user's response
        app.on('text', async (ctx) => {
            // Check if the user is in the process of converting a site link
            if (ctx.session && ctx.session.convertingSiteLink) {
                const videoLink = ctx.message.text;

                // Extract video ID from the provided link (assuming it's the last segment of the URL path)
                const videoId = videoLink.split('/').pop();

                // Continue with the conversion process
                await processSiteLink(ctx, videoId);

                // Reset the session flag
                delete ctx.session.convertingSiteLink;
            }
        });

        // Function to process the provided site link
        async function processSiteLink(ctx, videoId) {
            try {
                // Search for the video ID in the 'tmpRecord' collection
                const tmpRecord = await tmpRecordCollection.findOne({ uniqueLink: videoId });

                // Check if the video ID was found in the 'tmpRecord' collection
                if (!tmpRecord) {
                    await ctx.reply("No video found.");
                    return;
                }

                // Move the video file from '/tmpvideos' to '/uploads'
                const sourceFilePath = `../tmpvideos/${tmpRecord.filename}`; // Update source file path
                const destFilePath = `../uploads/${tmpRecord.filename}`;

                // Check if the source file exists
                if (fs.existsSync(sourceFilePath)) {
                    // Rename the source file to the destination file
                    await promisify(fs.rename)(sourceFilePath, destFilePath);

                    // Create a new record in the 'videosRecord' collection
                    const newVideoRecord = {
                        filename: tmpRecord.filename,
                        // fileLocalPath: `../uploads/${tmpRecord.filename}`,
                        // file_size: tmpRecord.file_size,
                        // duration: tmpRecord.duration,
                        // mime_type: tmpRecord.mime_type,
                        uniqueLink: videoId,
                        // relatedUser: tmpRecord.relatedUser,
                        // userName: tmpRecord.userName || '',
                        viewCount: 0,
                    };
                    await videoCollection.insertOne(newVideoRecord);

                    // Generate a unique link for the user to play the converted video
                    const uniqueLink = `https://nutcracker.live/play/${videoId}`;

                    // Inform the user about the successful conversion and provide the unique link
                    await ctx.reply(`Video converted successfully! You can play it using the following link:\n${uniqueLink}`);
                } else {
                    await ctx.reply("The source video file does not exist.");
                }
            } catch (error) {
                console.error("Error processing site link:", error);
                await ctx.reply("An error occurred while processing the site link. Please try again later.");
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

