import os
import re
import string
import random
import string
from dotenv import load_dotenv
import re
import asyncio
import requests
from pyrogram import Client, filters
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv
import pymongo
from pymongo import MongoClient
import datetime
import secrets

# Load environment variables
load_dotenv()

# Initialize MongoDB client
MONGO_URI = os.getenv("mongoDB_uri")
client = MongoClient(MONGO_URI)
db = client["nutCracker"]
video_collection = db["videosRecord"]
user_collection = db["userRecord"]
tmp_record_collection = db["tmpRecord"]
sessions_collection = db["sessions"]
conversation_state = {}

# Initialize Telegram bot
API_ID = os.getenv("api_id")
API_HASH = os.getenv("api_hash")
BOT_TOKEN = os.getenv("bot1Token")
app = Client("my_bot", api_id=API_ID, api_hash=API_HASH, bot_token=BOT_TOKEN)


# Function to generate random hex
def generate_random_hex(length):
    characters = "abcdef0123456789"
    random_hex = "".join(secrets.choice(characters) for _ in range(length))
    return random_hex


# Function to download and store video
def download_and_store_video(video_url, folder="../public/uploads/"):
    filename = generate_random_filename() + ".mp4"
    filepath = os.path.join(folder, filename)

    with requests.get(video_url, stream=True) as r:
        r.raise_for_status()
        with open(filepath, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    return filepath


# Command handler for /convertsitelink
@app.on_message(filters.command("convertsitelink"))
async def convert_site_link_command_handler(bot, message):
    await message.reply("Please provide the video link:")
    user_id = message.chat.id
    await save_session_data(user_id, {"converting_site_link": True})


# Command handler for /titlerename
@app.on_message(filters.command("titlerename"))
async def title_rename(bot, message):
    if message.text == "/titlerename":
        await bot.send_message(
            message.chat.id, "Please enter the video ID (fileUniqueId):"
        )
        return

    args = message.text.split(maxsplit=1)
    if len(args) < 2:
        await bot.send_message(
            message.chat.id, "Please provide the video ID along with the new title."
        )
        return

    video_id, new_title = args[1].split(maxsplit=1)

    video_info = video_collection.find_one({"fileUniqueId": video_id})
    if video_info is None:
        await bot.send_message(
            message.chat.id, "No video found with the provided video ID."
        )
        return

    video_collection.update_one(
        {"fileUniqueId": video_id}, {"$set": {"videoName": new_title}}
    )

    await bot.send_message(
        message.chat.id,
        f"The title of the video with ID '{video_id}' has been updated to '{new_title}'.",
    )


# Command handler for /start
@app.on_message(filters.command("start"))
async def start_command(bot, message):
    user_id = message.from_user.id
    userName = message.from_user.username or ""
    user_record = user_collection.find_one({"userId": user_id})
    if user_record:
        await bot.send_message(message.chat.id, f"Welcome back, {userName}! Upload, Share and Earn.")
    else:
        insert_user_record(user_id, userName)
        await bot.send_message(
            message.chat.id,
            f"Welcome, {userName}! We're glad you're here. You can start sharing videos directly.",
        )


# Command handler for /getmyuserid
@app.on_message(filters.command("getmyuserid"))
async def get_user_id(bot, message):
    user_id = message.from_user.id
    await bot.send_message(
        message.chat.id, f"Your user ID is: {user_id}"
    )


# Command handler for /myaccountsinfo
@app.on_message(filters.command("myaccountsinfo"))
async def get_account_info(bot, message):
    user_id = message.from_user.id

    try:
        user_info = user_collection.find_one({'userId': user_id})

        if user_info:
            user_name = user_info.get('userName', 'N/A')
            total_views = user_info.get('totalViews', 'N/A')
            bank_details = user_info.get('bankDetails', 'N/A')
            total_earnings = user_info.get('totalEarnings', 'N/A')

            info_message = f"Your account information:\n\n"
            info_message += f"User ID: {user_id}\n"
            info_message += f"User Name: {user_name}\n"
            info_message += f"Total Views: {total_views}\n"
            info_message += f"Bank Details: {bank_details}\n"
            info_message += f"Total Earnings: {total_earnings}\n"

            await bot.send_message(message.chat.id, info_message)
        else:
            await bot.send_message(message.chat.id, "No account information found.")
    except Exception as e:
        print("Error fetching user information:", e)
        await bot.send_message(message.chat.id, "An error occurred while fetching your account information.")


# Command handler for /availablebots
@app.on_message(filters.command("availablebots"))
async def available_bots(bot, message):
    bot_list = [
        ("Nutcracker video convert bot.", "https://t.me/nutcracker_video_convert_bot"),
        ("NutCracker Link Convert Bot", "https://t.me/NutCracker_Link_Convert_Bot"),
        ("NutCracker Finance Bot", "https://t.me/NutCracker_Finance_Bot"),
    ]

    keyboard = [[InlineKeyboardButton(bot[0], url=bot[1])] for bot in bot_list]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await bot.send_message(
        message.chat.id,
        "Available Bots:",
        reply_markup=reply_markup
    )

# Command handler for /deletelink
@app.on_message(filters.command("deletelink"))
async def delete_link_command_handler(bot, message):
    try:
        # Flag to control whether the middleware should process messages
        app.should_process_message = True

        # Prompt the user to enter the video ID
        await bot.send_message(message.chat.id, 'Please enter the video ID you want to delete:')
        
    except Exception as e:
        print("Error in delete_link_command_handler:", e)
        await bot.send_message(message.chat.id, "An error occurred. Please try again later.")

# Message handler to capture the next message from the user
@app.on_message(filters.text & filters.private & ~filters.bot)
async def text_middleware(bot, message):
    try:
        # Check if the middleware should process the message
        if not hasattr(app, 'should_process_message') or not app.should_process_message:
            return

        # Extract the video ID from the user's response
        video_id = message.text

        # Attempt to delete the video link
        await delete_video_link(bot, message, video_id)

        # Prevent further processing of messages
        app.should_process_message = False

    except Exception as e:
        print("Error in text_middleware:", e)
        await bot.send_message(message.chat.id, "An error occurred. Please try again later.")

async def delete_video_link(bot, message, video_id):
    try:
        # Find the video record
        video_record = video_collection.find_one({"uniqueLink": video_id})

        # Check if the video record exists
        if not video_record:
            await bot.send_message(message.chat.id, "No video found with the provided ID.")
            return  # Exit the function early

        # Delete the video record
        deletion_result = video_collection.delete_one({"uniqueLink": video_id})

        # Check if the video record was deleted
        if deletion_result.deleted_count == 1:
            await bot.send_message(message.chat.id, "Video link deleted successfully.")
        else:
            await bot.send_message(message.chat.id, "An error occurred while deleting the video link. Please try again later.")

    except Exception as error:
        print("Error deleting video link:", error)
        await bot.send_message(message.chat.id, "An error occurred while deleting the video link. Please try again later.")



# Command handler for /uploadfromdevice
@app.on_message(filters.command("uploadfromdevice"))
async def upload_from_device(bot, message):
    await bot.send_message(message.chat.id, "Start uploading your video...")


@app.on_message(filters.text)
async def text_middleware(bot, message):
    user_id = message.chat.id
    session_data = await load_session_data(user_id)
    if session_data.get("converting_site_link", False):
        video_link = message.text.strip()
        video_id = video_link.split('/')[-1]
        await process_site_link(bot, message, video_id)
        await save_session_data(user_id, {})
    else:
        user_id = message.from_user.id
        sender_username = message.from_user.username
        video_links = re.findall(r"(https?://\S+)", message.text)
        if video_links:
            message_init = await bot.send_message(
                message.chat.id, "Processing request... 👍"
            )
            for video_link in video_links:
                unique_link = await process_video_link(video_link, user_id, sender_username)
                await message.reply(
                    f"""Your video has been uploaded successfully... \n\n😊😊Now you can start using the link:\n\n{unique_link}"""
                )
            await message_init.delete()
        else:
            await bot.send_message(
                message.chat.id, """\nPlease Choose From Menu Options... \n\n👇👇"""
            )


# Helper function to generate random filename
def generate_random_filename(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))


# Helper function to save session data
async def save_session_data(user_id, session_data):
    document = {"user_id": user_id, "session_data": session_data}
    try:
        result = sessions_collection.replace_one({"user_id": user_id}, document, upsert=True)
        if result.modified_count == 0 and not result.upserted_id:
            await sessions_collection.insert_one(document)
    except Exception as e:
        print("Error saving session data:", e)


# Helper function to retrieve session data
async def load_session_data(user_id):
    try:
        document = sessions_collection.find_one({"user_id": user_id})
        if document:
            return document.get("session_data", {})
        else:
            return {}
    except Exception as e:
        print("Error retrieving session data:", e)
        return {}


# Async function to process video link
async def process_video_link(video_link: str, user_id: int, sender_username: str) -> str:
    video_path = download_and_store_video(video_link)
    video_id = generate_random_hex(24)
    
    video_info = {
        "videoName": os.path.basename(video_path),
        "fileLocalPath": f"/public/uploads/{video_id}",
        "file_size": os.path.getsize(video_path),
        "duration": 0,  # Update with actual duration if available
        "mime_type": "video/mp4",  # Update with actual MIME type if available
        "fileUniqueId": video_id,
        "relatedUser": user_id,
        "userName": sender_username or "",
    }
    video_collection.insert_one(video_info)
    video_url = f"http://nutcracker.live/video/{video_id}"
    return video_url

async def process_site_link(bot, message, video_id):
    try:
        # Search for the video ID in the 'tmpRecord' collection
        tmp_record = tmp_record_collection.find_one({"uniqueLink": video_id})

        # Check if the video ID was found in the 'tmpRecord' collection
        if not tmp_record:
            await message.reply("No video found.")
            return

        # Move the video file from '/tmpvideos' to '/uploads'
        source_file_path = f"../tmpvideos/{tmp_record['filename']}"  # Update source file path
        dest_file_path = f"../uploads/{tmp_record['filename']}"

        # Check if the source file exists
        if os.path.exists(source_file_path):
            # Rename the source file to the destination file
            os.rename(source_file_path, dest_file_path)

            # Create a new record in the 'videosRecord' collection
            new_video_record = {
                "filename": tmp_record["filename"],
                "uniqueLink": video_id,
                "viewCount": 0,
            }
            video_collection.insert_one(new_video_record)

            # Generate a unique link for the user to play the converted video
            unique_link = f"https://nutcracker.live/play/{video_id}"

            # Inform the user about the successful conversion and provide the unique link
            await bot.send_message(
                message.chat.id, f"Video converted successfully! You can play it using the following link:\n{unique_link}"
            )
        else:
            await message.reply("The source video file does not exist.")
    except Exception as error:
        print("Error processing site link:", error)
        await message.reply("An error occurred while processing the site link. Please try again later.")


# Helper function to insert user record
def insert_user_record(user_id, userName):
    user_collection.insert_one(
        {
            "userId": user_id,
            "userName": userName,
            "upiNumber": 0,
            "uploadedVideos": 0,
            "totalViews": 0,
            "createdAt": datetime.datetime.now(),
        }
    )
    return "User record inserted successfully."


# Main
if __name__ == "__main__":
    app.run()
