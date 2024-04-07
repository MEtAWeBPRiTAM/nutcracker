import os
from dotenv import load_dotenv
import re
import asyncio
import uvloop # Correct import statement
from pyrogram import Client, filters
from pyrogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
import pymongo
from pymongo import MongoClient
import datetime

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

load_dotenv()

MONGO_URI = os.getenv("mongoDB_uri")
client = MongoClient(MONGO_URI)
db = client["nutCracker"]  
textCollection = db["textRecord"]
userCollection = db["userRecord"]

secondBotToken = os.getenv("bot2Token")  # Change to your second bot token
API_ID = os.getenv("api_id")
API_HASH = os.getenv("api_hash")

# Initialize the Telegram bot
app = Client("second_bot", api_id=API_ID, api_hash=API_HASH, bot_token=secondBotToken)


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
            "upiNumber": 0,
            "uploadedVideos": 0,
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


@app.on_message(filters.command("keepthetext"))
async def keep_the_text(bot, message):
    # Assuming the text to keep is provided as the command argument
    text_to_keep = message.text.split("/keepthetext ", 1)[1]

    # Save the text to the database or perform any desired action
    textCollection.insert_one({"user_id": message.from_user.id, "text": text_to_keep})

    await bot.send_message(
        message.chat.id,
        f"""Text added successfully! You can now share a video with this text using /uploadfromdevice""",
    )


@app.on_message(filters.command("deletethetext"))
async def delete_the_text(bot, message):
    # Remove the text associated with the user from the database or perform any desired action
    textCollection.delete_one({"user_id": message.from_user.id})

    await bot.send_message(
        message.chat.id,
        f"""Text deleted successfully!""",
    )


@app.on_message(filters.command("keepthepicture"))
async def keep_the_picture(bot, message):
    # Assuming the picture URL to keep is provided as the command argument
    picture_url = message.text.split("/keepthepicture ", 1)[1]

    # Save the picture URL to the database or perform any desired action
    # This could be used to set a preview image for the link

    await bot.send_message(
        message.chat.id,
        f"""Picture added successfully!""",
    )


@app.on_message(filters.command("deletethepicture"))
async def delete_the_picture(bot, message):
    # Remove the picture associated with the user from the database or perform any desired action
    # This could be used to remove the preview image from the link

    await bot.send_message(
        message.chat.id,
        f"""Picture deleted successfully!""",
    )


@app.on_message(filters.command("getmyid"))
async def get_my_id(bot, message):
    user_id = message.from_user.id
    await bot.send_message(
        message.chat.id, f"""Here is your 👤 user id:\n\n {user_id}"""
    )


app.run()
