const { Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const os = require('os');
const fs = require('fs');
const request = require('request');
const { randomBytes } = require('crypto');

dotenv.config();

const MONGO_URI = process.env.mongoDB_uri;
const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let db, videoCollection, userCollection, conversationState = {};

async function main() {
    await client.connect();
    db = client.db("nutCracker");
    videoCollection = db.collection("videosRecord");
    userCollection = db.collection("userRecord");

    const botToken = process.env.bot1Token;

    const bot = new Telegraf(botToken);

    bot.start((ctx) => startCommand(ctx));

    bot.command('getmyuserid', (ctx) => getUserId(ctx));

    bot.command('myaccountsinfo', (ctx) => getAccountInfo(ctx));

    bot.command('availablebots', (ctx) => availableBots(ctx));

    bot.command('uploadfromdevice', (ctx) => uploadFromDevice(ctx));

    bot.command('titlerename', (ctx) => titleRename(ctx));

    bot.on('message', async (ctx) => {
        try {
            if (ctx.message.video) {
                await handleVideo(ctx);
            } else if (ctx.message.photo) {
                await handleImage(ctx);
            } else {
                await handleMessage(ctx);
            }
        } catch (error) {
            console.error(error);
            await ctx.reply('An error occurred while processing your request.');
        }
    });

    bot.launch();
}

async function handleVideo(ctx) {
    const userId = ctx.message.from.id;
    const file_id = ctx.message.video.file_id;
    const videoUrl = await ctx.telegram.getFileLink(file_id);
    const messageInit = await ctx.reply("Processing request...");
    
    try {
        // Download and store the video
        const videoPath = await downloadAndStoreVideo(videoUrl);
        const videoFileExtension = videoUrl.slice(videoUrl.lastIndexOf('.'));
        const newFilename = generateRandomFilename() + videoFileExtension;
        const newVideoPath = `../public/uploads/${newFilename}`;
        fs.renameSync(videoPath, newVideoPath);

        const videoFile = fs.createReadStream(newVideoPath);

        // Generate unique video ID
        const videoId = generateRandomHex(24);

        // Insert video information into database
        const video_info = {
            "videoName": newFilename,
            "fileLocalPath": `/public/uploads/${videoId}`,
            "file_size": ctx.message.video.file_size,
            "duration": ctx.message.video.duration,
            "mime_type": ctx.message.video.mime_type,
            "fileUniqueId": videoId,
            "relatedUser": userId,
            "userName": ctx.message.from.username || "",
            "viewCount": 0,
        };
        await videoCollection.insertOne(video_info);

        const videoUrl = `http://nutcracker.live/video/${videoId}`;
        await ctx.reply(`Your video has been uploaded successfully...\n\n😊😊Now you can start using the link:\n\n${videoUrl}`);
        await messageInit.delete();
    } catch (error) {
        console.error(error);
        await messageInit.edit("An error occurred while processing your request. Please try again later.");
    }
}

async function handleImage(ctx) {
    // Implementation for handling images
}

async function titleRename(ctx) {
    // Implementation for renaming titles
}

async function startCommand(ctx) {
    const userId = ctx.message.from.id;
    const userName = ctx.message.from.username || "";
    const user_record = await get_user_record(userId);
    const first = ctx.message.from.first_name;

    if (user_record) {
        await ctx.reply("Welcome back!!\n\nUpload, Share and Earn.");
    } else {
        console.log("new");
        await insert_user_record(userId, userName);
        await ctx.reply(`Welcome! ${first}\n\nWe're glad you're here.\nTo start using our platform\nYou can start sharing videos directly\n\nNote: If anything went wrong don't worry about it as we are on the testing phase.`);
    }
}

async function getUserId(ctx) {
    const userId = ctx.message.from.id;
    await ctx.reply(`Here is your 👤 user id:\n\n${userId}`);
}

async function getAccountInfo(ctx) {
    await ctx.reply("We are under construction, please check back later.... 😊");
}

async function availableBots(ctx) {
    const bot_list = [
        (
            "Nutcracker video convert bot.",
            "https://t.me/nutcracker_video_convert_bot"
        ),
        (
            "NutCracker Link Convert Bot",
            "https://t.me/NutCracker_Link_Convert_Bot"
        ),
        (
            "NutCracker Finance Bot",
            "https://t.me/NutCracker_Finance_Bot"
        ),
    ];

    let bot_list_message = "Available Bots: 👇👇\n";
    bot_list.forEach(bot => {
        bot_list_message += `\n${bot[0]}: ${bot[1]}`;
    });

    await ctx.reply(bot_list_message);
}

async function uploadFromDevice(ctx) {
    await ctx.reply("Start Uploading Your Video ...😉");
}

async function handleMessage(ctx) {
    const userId = ctx.message.from.id;
    const sender_username = ctx.message.from.username || "";
    const text = ctx.message.text;
    const video_links = text.match(/(https?:\/\/\S+)/g);

    if (video_links) {
        const messageInit = await ctx.reply("Processing request... 👍");
        for (let video_link of video_links) {
            const unique_link = await processVideoLink(video_link, userId, sender_username);
            await ctx.reply(`Your video has been uploaded successfully...\n\n😊😊Now you can start using the link:\n\n${unique_link}`);
        }
        await messageInit.delete();
    } else {
        await ctx.reply("\nPlease Choose From Menu Options... \n\n👇👇");
    }
}


async function downloadAndStoreVideo(videoUrl, folder = "../public/uploads/") {
    const filename = generateRandomFilename() + ".mp4";
    const filepath = folder + filename;

    const file = fs.createWriteStream(filepath);
    await new Promise((resolve, reject) => {
        request.get(videoUrl).pipe(file)
        .on('error', error => {
            reject(error);
        })
        .on('finish', () => {
            resolve();
        });
    });

    return filepath;
}

async function processVideoLink(videoLink, userId, senderUsername) {
    const videoPath = await downloadAndStoreVideo(videoLink);
    const videoId = generateRandomHex(24);

    const videoInfo = {
        "videoName": os.path.basename(videoPath),
        "fileLocalPath": `/public/uploads/${videoId}`,
        "file_size": fs.statSync(videoPath).size,
        "duration": 0,  // Update with actual duration if available
        "mime_type": "video/mp4",  // Update with actual MIME type if available
        "fileUniqueId": videoId,
        "relatedUser": userId,
        "userName": senderUsername || "",
    };
    await videoCollection.insertOne(videoInfo);
    const videoUrl = `http://nutcracker.live/video/${videoId}`;
    return videoUrl;
}

function generateRandomHex(length) {
    return randomBytes(length).toString('hex');
}

function generateRandomFilename(length = 10) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let filename = '';
    for (let i = 0; i < length; i++) {
        filename += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return filename;
}
async function get_user_record(user_id) {
    // Implementation to retrieve user record from the database
    const userInformation = await userCollection.findOne({"userId": user_id});
    console.log(userInformation);
    return userInformation;
}

main();
