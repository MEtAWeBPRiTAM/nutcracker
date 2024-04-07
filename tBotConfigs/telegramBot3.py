# Latest Script Update: 2024-03-09
import os
from dotenv import load_dotenv
import asyncio
import uvloop
from pyrogram import Client, filters
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton
import pymongo
from pymongo import MongoClient, DESCENDING
import datetime
from oauth2client.service_account import ServiceAccountCredentials
import gspread



asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

load_dotenv()

MONGO_URI = os.getenv("mongoDB_uri")
client = MongoClient(MONGO_URI)
db = client["nutCracker"]  # Change to your database name
videoCollection = db["videoRecord"]
userCollection = db["userRecord"]

thirdBotToken = os.getenv("bot3Token")  # Change to your third bot token
API_ID = os.getenv("api_id")
API_HASH = os.getenv("api_hash")

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credentials = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
gc = gspread.authorize(credentials)

# Initialize the Telegram bot
app = Client("third_bot", api_id=API_ID, api_hash=API_HASH, bot_token=thirdBotToken)


# Handle commands
def get_user_record(user_id):
    user_information = userCollection.find_one({"userId": user_id})
    print(user_information)
    return user_information


def insert_user_record(user_id, user_name):
    userCollection.insert_one(
        {
            "userId": user_id,
            "userName": user_name,
            "totalViews": 0,
            "createdAt": datetime.datetime.now(),
        }
    )
    return "Done! User record inserted successfully."


@app.on_message(filters.command("start"))
async def start_command(bot, message):
    user_id = message.from_user.id
    user_name = (message.from_user.username) or " "
    user_record = get_user_record(user_id)
    first = message.from_user.first_name
    if user_record:
        await bot.send_message(message.chat.id, f"Welcome back! ....")
    else:
        print("new")
        insert_user_record(user_id, user_name)
        await bot.send_message(
            message.chat.id,
            f"Welcome! {first}\n\nWe're glad you're here.\nTo start using our platform\nYou can start sharing videos directly\n\n Note: If anything went wrong don't worry about it as we are on testing phase",
        )


@app.on_message(filters.command("availablebots"))
async def available_bots(bot, message):
    bot_list = [
        (
            """              Nutcracker video convert bot.           """,
            "https://t.me/nutcracker_video_convert_bot",
        ),
        (
            """              NutCracker Link Convert Bot             """,
            "https://t.me/NutCracker_Link_Convert_Bot",
        ),
        (
            """              NutCracker Finance Bot             """,
            "https://t.me/NutCracker_Finance_Bot",
        ),
    ]

    keyboard = [[InlineKeyboardButton(bot[0], url=bot[1])] for bot in bot_list]

    reply_markup = InlineKeyboardMarkup(keyboard)
    await bot.send_message(
        message.chat.id,
        f"""        Available Bots: 👇👇         """,
        reply_markup=reply_markup,
    )


@app.on_message(filters.command("getmyid"))
async def get_my_id(bot, message):
    user_id = message.from_user.id
    await bot.send_message(
        message.chat.id, f"""Here is your 👤 user id:\n\n {user_id}"""
    )


@app.on_message(filters.command("checktotalviews"))
async def check_total_views(bot, message):
    user_id = message.from_user.id
    user_record = get_user_record(user_id)
    total_views = user_record.get("totalViews", 0)
    await bot.send_message(
        message.chat.id, f"Total views for your videos: {total_views}"
    )


@app.on_message(filters.command("viewshistory"))
async def views_history(bot, message):
    user_id = message.from_user.id
    
    # Retrieve last 10 uploaded videos' history from the database
    video_history_cursor = videoCollection.find(
        {"userId": user_id},
        {"_id": 0, "videoId": 1, "views": 1}
    ).sort([("createdAt", DESCENDING)]).limit(10)
    
    video_history = []
    for video in video_history_cursor:
        video_history.append(video)
    
    if video_history:
        # Cursor has documents
        response_message = "Last 10 video views:\n"
        for video in video_history:
            response_message += f"Video ID: {video['videoId']}, Views: {video['views']}\n"
    else:
        # Cursor is empty
        response_message = "You haven't uploaded any videos yet."
        
    await bot.send_message(message.chat.id, response_message)




# Handle commands
@app.on_message(filters.command("withdraw"))
async def withdraw_command(bot, message):
    # Initialize a dictionary to store withdrawal information
    withdrawal_info = {}
    
    # Define a function to handle user input for each field
    async def handle_response(field):
        await bot.send_message(message.chat.id, f"Please enter your {field}:")
        
        # Wait for the user's response
        response = await bot.ask(message.chat.id, f"Please enter your {field}:")
        
        # Store the response in the withdrawal_info dictionary
        withdrawal_info[field] = response.text
    
    # Wait for user input for each form field
    await handle_response("Bank Name")
    await handle_response("Account Number")
    await handle_response("IFSC")
    await handle_response("Account Holder Name")
    await handle_response("Withdrawal Amount (in dollars)")
    
    # Send data to Google Sheet
    success = send_to_google_sheet(withdrawal_info)
    
    # Inform the user about the status of their withdrawal request
    if success:
        await bot.send_message(message.chat.id, "Your withdrawal request has been processed successfully. Thank you!")
    else:
        await bot.send_message(message.chat.id, "Failed to process your withdrawal request. Please try again later.")
    

def send_to_google_sheet(data):
    try:
        # Open the Google Sheet
        sheet = gc.open("Withdrawal Form").sheet1
        
        # Append the data to the Google Sheet
        sheet.append_row([data["Bank Name"], data["Account Number"], data["IFSC"],
                          data["Account Holder Name"], data["Withdrawal Amount (in dollars)"]])
        return True
    except Exception as e:
        print("Error:", e)
        return False



    

def send_to_google_sheet(data):
    # Open the Google Sheet
    sheet = gc.open("Withdrawal Form").sheet1
    
    # Append the data to the Google Sheet
    sheet.append_row([data["UPI ID"], data["Bank Account Number"], data["Withdrawal Amount"]])


app.run()
