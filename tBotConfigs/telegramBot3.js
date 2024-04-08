const { Telegraf } = require('telegraf');
const { session } = require('telegraf/session');
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
const credentials = {
    client_email: 'nutcracker@pacific-shelter-419612.iam.gserviceaccount.com',
    private_key: '74180f958a55a753a7b4c53231976d5405cf46f9',
};

bot.command("withdraw", async (ctx) => {
    const user_id = ctx.message.from.id;
    const user_record = await get_user_record(user_id);

    if (!user_record) {
        await ctx.reply("You don't have a user record. Please contact support for assistance.");
        return;
    }

    if (!user_record.bankDetails) {
        await ctx.reply("Please provide your bank details to proceed with the withdrawal.\n\nEnter the following information separated by a space:\n1. Bank Name\n2. Account Number\n3. IFSC Code\n4. Account Holder Name\n5. Withdrawal Amount (in dollars)");
        await handleBankDetails(ctx); // Directly call the function
    } else {
        await ctx.reply("Enter withdrawal amount (in dollars):", Markup.removeKeyboard());
        await handleWithdrawalAmount(ctx);
    }
});

// bot.on('text', async (ctx) => {
//     const state = ctx.session.state;

//     if (state === 'awaitingBankDetails') {
//         await handleBankDetails(ctx);
//     }
// });

async function handleWithdrawalAmount(ctx) {
    const user_id = ctx.message.from.id;
    const user_record = await get_user_record(user_id);
    const response = ctx.message.text;
    const withdrawal_amount = parseFloat(response);

    if (!user_record || !user_record.bankDetails) {
        await ctx.reply("Please provide your bank details first.");
        return;
    }

    // Send data to Google Sheet
    const success = await send_to_google_sheet(user_record, withdrawal_amount);

    // Inform the user about the status of their withdrawal request
    if (success) {
        await ctx.reply("Your withdrawal request has been processed successfully. Thank you!");
    } else {
        await ctx.reply("Failed to process your withdrawal request. Please try again later.");
    }
}

async function handleBankDetails(ctx) {
    const user_id = ctx.message.from.id;
    const user_record = await get_user_record(user_id);
    const response = ctx.message.text;

    if (!user_record) {
        await ctx.reply("You don't have a user record. Please contact support for assistance.");
        return;
    }

    const bankDetails = user_record.bankDetails || {};
    const details = response.split(/\s+/);

    // if (details.length !== 5) {
    //     await ctx.reply("Invalid format. Please provide all the required bank details.");
    //     return;
    // }

    const [bankName, accountNo, ifsc, accountHolderName, withdrawalAmount] = details;

    // Update bank details in user record
    bankDetails.bankName = bankName;
    bankDetails.accountNo = accountNo;
    bankDetails.ifsc = ifsc;
    bankDetails.accountHolderName = accountHolderName;

    // Send withdrawal amount to Google Sheet
    const withdrawalAmountInDollars = parseFloat(withdrawalAmount);
    const success = await send_to_google_sheet(user_record, withdrawalAmountInDollars);

    // Inform the user about the status of their withdrawal request
    if (success) {
        await ctx.reply("Your withdrawal request has been processed successfully. Thank you!");
    } else {
        await ctx.reply("Failed to process your withdrawal request. Please try again later.");
    }
}


async function send_to_google_sheet(user_record, withdrawal_amount) {
    if (!user_record.bankDetails) {
        console.error('Bank details are missing.');
        return false; // Failure
    }

    const { bankName, accountNo, ifsc, accountHolderName } = user_record.bankDetails;

    try {
        const doc = new GoogleSpreadsheet('1nsLTwieJwWZqKVaWyxhrOT-oBsNfN8XMukaOX_mycRI');
        await doc.useServiceAccountAuth(credentials);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            Bank_Name: bankName,
            Account_Number: accountNo,
            IFSC: ifsc,
            Account_Holder_Name: accountHolderName,
            Withdrawal_Amount: withdrawal_amount,
        });

        return true; // Success
    } catch (error) {
        console.error('Error sending data to Google Sheet:', error);
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

