require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const MONGO_URI = process.env.mongoDB_uri;
const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize Telegram bot
const botToken = process.env.bot1Token;
const bot = new Telegraf(botToken);
const db = client.db("nutCracker"); // Change to your database name
const videoCollection = db.collection("videosRecord");
const userCollection = db.collection("userRecord");
bot.use(session());



// Handle commands
bot.command("start", async (ctx) => {
    const user_id = ctx.message.from.id;
    const user_name = ctx.message.from.username || " ";
    const user_record = await get_user_record(user_id);
    const first = ctx.message.from.first_name;
    if (user_record) {
        ctx.reply(`Welcome back! ....`);
    } else {
        console.log("new");
        await insert_user_record(user_id, user_name);
        ctx.reply(
            `Welcome! ${first}\n\nWe're glad you're here.\nTo start using our platform\nYou can start sharing videos directly\n\n Note: If anything went wrong don't worry about it as we are on testing phase`
        );
    }
});

// My Account Info command handler
bot.command('myaccountsinfo', async (ctx) => {
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

// Available Bots command handler
bot.command('availablebots', (ctx) => {
    const botList = [
        ["Nutcracker video convert bot", "https://t.me/nutcracker_video_convert_bot"],
        ["NutCracker Link Convert Bot", "https://t.me/NutCracker_Link_Convert_Bot"],
        ["NutCracker Finance Bot", "https://t.me/NutCracker_Finance_Bot"]
    ];
    const keyboard = botList.map(bot => [{ text: bot[0], url: bot[1] }]);
    ctx.reply("Available Bots:", { reply_markup: { inline_keyboard: keyboard } });
});

bot.command('uploadfromdevice', async (ctx) => {
    ctx.reply("Please upload the video file.");
});

// Handle video messages
bot.on('video', async (ctx) => {
    const { message } = ctx;
    const userId = message.from.id;
    const fileId = message.video.file_id;
    const fileUniqueId = message.video.file_unique_id;

    try {
        // Construct the file URL using the file_id
        console.log(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileId}`;
        
        // Download and store the video file
        const fileName = `${fileUniqueId}.mp4`;
        const filePath = path.join(__dirname, '..', 'uploads', fileName); // Adjust the path as needed
        const writer = fs.createWriteStream(filePath);

        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Save video information to MongoDB or perform any other operations
        const videoInfo = {
            fileName,
            filePath,
            userId,
            fileSize: message.video.file_size,
            duration: message.video.duration,
            mime_type: message.video.mime_type,
            fileUniqueId
            // Add more video information as needed
        };

        // Save videoInfo to MongoDB or perform any other operations
        await videoCollection.insertOne(videoInfo);

        ctx.reply(`Video uploaded successfully. You can start using the link: https://nutcracker.live/play/${fileUniqueId}`);
    } catch (error) {
        console.error("Error uploading video:", error);
        ctx.reply("An error occurred while uploading the video.");
    }
});

// Handle /titlerename command
bot.command('titlerename', async (ctx) => {
    // Set the conversation state to 'awaiting_video_id'
    ctx.session = { state: 'awaiting_video_id' };
    // Send a message requesting the video ID
    ctx.reply("Please enter the video ID (fileUniqueId):");
});

// Handle text messages for /titlerename command
bot.on('text', async (ctx) => {
    if (ctx.session && ctx.session.state === 'awaiting_video_id') {
        const videoId = ctx.message.text.trim();
        // Check if the message text starts with a valid video ID format
        const videoIdRegex = /^[a-fA-F0-9]{24}$/;
        if (videoIdRegex.test(videoId)) {
            // Check if the video exists in the database
            const video = await videoCollection.findOne({ fileUniqueId: videoId });
            if (video) {
                // Update the conversation state to 'awaiting_new_title'
                ctx.session.state = 'awaiting_new_title';
                // Store the video ID for later use
                ctx.session.videoId = videoId;
                // Send a message requesting the new title
                ctx.reply("Please provide the new title for the video:");
            } else {
                ctx.reply("No video found with the provided video ID for editing title.");
                delete ctx.session;
            }
        } else {
            ctx.reply("Invalid video ID format. Please enter a valid video ID.");
        }
    } else if (ctx.session && ctx.session.state === 'awaiting_new_title') {
        // Extract the new title
        const newTitle = ctx.message.text.trim();
        // Extract the video ID from conversation state
        const videoId = ctx.session.videoId;
        try {
            // Update the title in the database
            await videoCollection.updateOne({ fileUniqueId: videoId }, { $set: { videoName: newTitle } });
            ctx.reply(`The title of the video with ID '${videoId}' has been updated to '${newTitle}'.`);
        } catch (error) {
            console.error("Error updating video title:", error);
            ctx.reply("An error occurred while updating the video title.");
        } finally {
            delete ctx.session;
        }
    }
});




// Handle /deletelink command
bot.command('deletelink', async (ctx) => {
    // Set the conversation state to 'awaiting_video_id'
    ctx.session = { state: 'awaiting_video_id' };
    // Send a message requesting the video ID
    ctx.reply("Please enter the video ID (fileUniqueId) to delete:");
});

// Handle text messages for /deletelink command
bot.on('text', async (ctx) => {
    if (ctx.session && ctx.session.state === 'awaiting_video_id') {
        const videoId = ctx.message.text.trim();
        // Check if the message text starts with a valid video ID format
        const videoIdRegex = /^[a-fA-F0-9]{24}$/;
        if (videoIdRegex.test(videoId)) {
            // Check if the video exists in the database
            const video = await videoCollection.findOne({ fileUniqueId: videoId });
            if (video) {
                try {
                    // Delete the video from the database
                    await videoCollection.deleteOne({ fileUniqueId: videoId });
                    ctx.reply(`The video with ID '${videoId}' has been deleted.`);
                } catch (error) {
                    console.error("Error deleting video:", error);
                    ctx.reply("An error occurred while deleting the video.");
                } finally {
                    delete ctx.session;
                }
            } else {
                ctx.reply("No video found with the provided video ID for deleting.");
                delete ctx.session;
            }
        } else {
            ctx.reply("Invalid video ID format. Please enter a valid video ID.");
        }
    }
});




// Handle /getmyuserid command
bot.command('getmyuserid', (ctx) => {
    const userId = ctx.message.from.id;
    ctx.reply(`Here is your user ID: ${userId}`);
});


async function get_user_record(user_id) {
    const user_information = await userCollection.findOne({
        userId: user_id
    });
    return user_information;
}

async function insert_user_record(user_id, user_name) {
    await userCollection.insertOne({
        userId: user_id,
        userName: user_name,
        totalViews: 0,
        bankDetails: "",
        currentEarning: "",
        totalEarnings: "",
        createdAt: new Date()
    });
}
// Start the bot
bot.launch().then(() => {
    console.log('Bot is running');
}).catch((err) => {
    console.error('Bot launch error:', err);
});
