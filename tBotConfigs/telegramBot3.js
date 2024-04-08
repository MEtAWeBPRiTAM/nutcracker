const { Telegraf } = require('telegraf');
const { Markup } = require('telegraf');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.mongoDB_uri;
const client = new MongoClient(MONGO_URI);
const db = client.db("nutCracker"); // Change to your database name
const videoCollection = db.collection("videosRecord");
const userCollection = db.collection("userRecord");

const API_TOKEN = process.env.bot3Token; // Change to your third bot token
const bot = new Telegraf(API_TOKEN);

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

bot.command("availablebots", async (ctx) => {
    const bot_list = [
        [
            "Nutcracker video convert bot.",
            "https://t.me/nutcracker_video_convert_bot",
        ],
        [
            "NutCracker Link Convert Bot",
            "https://t.me/NutCracker_Link_Convert_Bot",
        ],
        [
            "NutCracker Finance Bot",
            "https://t.me/NutCracker_Finance_Bot",
        ],
    ];

    const keyboard = bot_list.map((bot) => [{
        text: bot[0],
        url: bot[1]
    }]);

    await ctx.reply("Available Bots: 👇👇", {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

bot.command("getmyid", async (ctx) => {
    const user_id = ctx.message.from.id;
    await ctx.reply(`Here is your 👤 user id:\n\n ${user_id}`);
});

bot.command("checktotalviews", async (ctx) => {
    const user_id = ctx.message.from.id;
    const user_record = await get_user_record(user_id);
    const total_views = user_record.totalViews || 0;
    await ctx.reply(`Total views for your videos: ${total_views}`);
});

bot.command("viewshistory", async (ctx) => {
    const user_id = ctx.message.from.id;
    
    // Retrieve last 10 uploaded videos' history from the database
    const video_history_cursor = videoCollection.find(
        { relatedUser: user_id },
        { _id: 0, videoId: 1, viewCount: 1 }
    ).sort({ createdAt: -1 }).limit(10);
    
    const video_history = await video_history_cursor.toArray();
    
    let response_message = "";
    if (video_history.length > 0) {
        response_message = "Last 10 video views:\n";
        video_history.forEach((video) => {
            response_message += `Video ID: ${video.fileUniqueId}, Views: ${video.viewCount}\n`;
        });
    } else {
        response_message = "You haven't uploaded any videos yet.";
    }
    
    await ctx.reply(response_message);
});

bot.command("withdraw", async (ctx) => {
    const user_id = ctx.message.from.id;
    const user_record = await get_user_record(user_id);
    
    if (!user_record) {
        await ctx.reply("Please provide your bank details first. Enter your bank name:");
        
        const bank_details = {};
        
        async function handleResponse(field) {
            await ctx.reply(`Please enter your ${field}:`);
            
            // Wait for the user's response
            const response = await ctx.replyWithMarkdown('Enter your response:');
            
            // Store the response in the bank_details object
            bank_details[field] = response.text;
        }
        
        await handleResponse("Bank Name");
        await handleResponse("Account Number");
        await handleResponse("IFSC");
        await handleResponse("Account Holder Name");
        
        // Update user record with bank details
        await userCollection.updateOne(
            { userId: user_id },
            { $set: { bankDetails: bank_details } }
        );
        
        await ctx.reply("Your bank details have been saved successfully.");
    } else {
        await ctx.reply("Enter withdrawal amount (in dollars):", Markup.removeKeyboard());
        
        const response = await ctx.replyWithMarkdown('Enter the withdrawal amount:');
        const withdrawal_amount = parseFloat(response.text);
        
        // Send data to Google Sheet
        const success = await send_to_google_sheet(user_record, withdrawal_amount);
        
        // Inform the user about the status of their withdrawal request
        if (success) {
            await ctx.reply("Your withdrawal request has been processed successfully. Thank you!");
        } else {
            await ctx.reply("Failed to process your withdrawal request. Please try again later.");
        }
    }
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
        createdAt: new Date()
    });
}

// Initialize the bot
bot.launch();
