const { Telegraf, session } = require('telegraf');
const { Markup } = require('telegraf');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Initialize session middleware
dotenv.config();

// Initialize session middleware

const MONGO_URI = process.env.mongoDB_uri;
const client = new MongoClient(MONGO_URI);
const db = client.db("nutCracker"); // Change to your database name
const videoCollection = db.collection("videosRecord");
const userCollection = db.collection("userRecord");
const withdrawalCollection = db.collection("bankRecord");

// const API_TOKEN = process.env.bot3Token; // Change to your third bot token
const bot = new Telegraf('6945504983:AAGpTyY1kEfdoNFzH-SaD-11Sm2ieeFyC3M');

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



// Define Google Sheets credentials
bot.command("withdraw", async (ctx) => {
    const user_id = ctx.message.from.id;
    const user_record = await get_user_record(user_id);

    if (!user_record) {
        await ctx.reply("You don't have a user record. Please contact support for assistance.");
        return;
    }

    if (!ctx.session) {
        ctx.session = {};
    }

    const withdrawal_record = await withdrawalCollection.findOne({ userId: user_id });

    if (withdrawal_record) {
        await ctx.reply("Enter the withdrawal amount in dollars:");
        ctx.session.withdrawalRecord = withdrawal_record; // Store the withdrawal record in the session
    } else {
        await ctx.reply("Please provide your bank details in the following format: BankName AccountNo IFSC AccountHolderName");
        ctx.session.expectingBankDetails = true; // Set a flag to expect bank details
    }
});

// Handle user's response to the withdrawal amount or bank details
bot.on("text", async (ctx) => {
    const user_id = ctx.message.from.id;
    const { withdrawalRecord, expectingBankDetails } = ctx.session;

    if (expectingBankDetails) {
        // Parse bank details from user input
        const bankDetails = ctx.message.text.split(/\s+/);
        if (bankDetails.length !== 4) {
            await ctx.reply("Invalid bank details format. Please provide BankName AccountNo IFSC AccountHolderName");
            return;
        }

        // Save bank details to the withdrawal collection
        const success = await async function save_to_withdrawal_collection(user_id, bankDetails, withdrawalAmount) {
            try {
                await withdrawalCollection.insertOne({
                    userId: user_id,
                    bankDetails: bankDetails,
                    withdrawalAmount: withdrawalAmount,
                    createdAt: new Date()
                });
                return true; // Success
            } catch (error) {
                console.error('Error saving withdrawal request to withdrawal collection:', error);
                return false; // Failure
            }
        }

        if (success) {
            await ctx.reply("Your bank details have been saved successfully. Now you can provide the withdrawal amount.");
            ctx.session.expectingBankDetails = false; // Reset the flag
        } else {
            await ctx.reply("Failed to save your bank details. Please try again later.");
        }
    } else if (withdrawalRecord) {
        // User provided withdrawal amount
        const withdrawalAmount = parseFloat(ctx.message.text);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            await ctx.reply("Invalid withdrawal amount. Please enter a valid amount in dollars.");
            return;
        }

        // Update the withdrawal record with the withdrawal amount
        const success = await update_withdrawal_amount(withdrawalRecord, withdrawalAmount);

        if (success) {
            await ctx.reply("Your withdrawal request has been processed successfully. Thank you!");
        } else {
            await ctx.reply("Failed to process your withdrawal request. Please try again later.");
        }

        // Clear the session
        delete ctx.session.withdrawalRecord;
    }
});

async function update_withdrawal_amount(withdrawalRecord, withdrawalAmount) {
    try {
        await withdrawalCollection.updateOne(
            { _id: withdrawalRecord._id },
            { $set: { withdrawalAmount: withdrawalAmount } }
        );
        return true; // Success
    } catch (error) {
        console.error('Error updating withdrawal amount:', error);
        return false; // Failure
    }
}



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
        createdAt: new Date()
    });
}

// Initialize the bot
bot.launch();

