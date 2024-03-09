# Latest Script Update: 2021-07-20
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
videoCollection = db["videosRecord"]
userCollection = db["userRecord"]
# textCollection = db["textRecord"]

videoConverterToken = os.getenv("bot1Token")
API_ID = os.getenv("api_id")
API_HASH = os.getenv("api_hash")
# secondBotToken = os.getenv("bot2Token")

# Initialize the Telegram bot
app = Client("my_bot", api_id=API_ID, api_hash=API_HASH, bot_token=videoConverterToken)
# app2 = Client("my_bot", api_id=API_ID, api_hash=API_HASH, bot_token=secondBotToken)


# Handle commands
def get_user_record(user_id):
    userInformation = userCollection.find_one({"userId": user_id})
    print(userInformation)
    return userInformation


def insert_user_record(user_id, userName):
    userCollection.insert_one(
        {
            "userId": user_id,
            "userName": userName,
            "upiNumber": 0,
            "uploadedVideos": 0,
            "createdAt": datetime.datetime.now(),
        }
    )
    return "Done! User record inserted successfully."


@app.on_message(filters.command("start"))
async def startCommand(bot, message):
    user_id = message.from_user.id
    userName = (message.from_user.username) or " "
    user_record = get_user_record(user_id)
    first = message.from_user.first_name
    if user_record:
        await bot.send_message(message.chat.id, f"Welcome back! ....")
    else:
        print("new")
        insert_user_record(user_id, userName)
        await bot.send_message(
            message.chat.id,
            f"Welcome! {first}\n\nWe're glad you're here.\nTo start using our platform\nYou can start sharing videos directly\n\n Note: If anything went wrong don't worry about it as we are on testing phase",
        )


@app.on_message(filters.command("getmyuserid"))
async def getUserId(bot, message):
    user_id = message.from_user.id
    await bot.send_message(
        message.chat.id, f"""Here is your 👤 user id:\n\n {user_id}"""
    )


@app.on_message(filters.command("myaccountsinfo"))
async def getAccountInfo(bot, message):
    await bot.send_message(
        message.chat.id, f"We are under construction, please check back later.... 😊"
    )


@app.on_message(filters.command("availablebots"))
async def availableBots(bot, message):
    bot_list = [
        (
            """              NutCracker Link Convert Bot             """,
            "https://t.me/NutCracker_Link_Convert_Bot",
        ),
        (
            """              nutcracker video convert bot.           """,
            "https://t.me/nutcracker_video_convert_bot",
        ),
    ]

    keyboard = [[InlineKeyboardButton(bot[0], url=bot[1])] for bot in bot_list]

    reply_markup = InlineKeyboardMarkup(keyboard)
    await bot.send_message(
        message.chat.id,
        f"""        Available Bots: 👇👇         """,
        reply_markup=reply_markup,
    )


@app.on_message(filters.command("uploadfromdevice"))
async def uploadFromDevice(bot, message):
    await bot.send_message(message.chat.id, f"""Start Uploading Your Video ...😉""")


@app.on_message(filters.text)
async def handleMessage(bot, message):
    user_id = message.from_user.id
    sender_username = message.from_user.username
    video_links = re.findall(r"(https?://\S+)", message.text)
    if video_links:
        messageInit = await bot.send_message(
            message.chat.id, "Processing request... 👍"
        )
        await bot.send_chat_action(message.chat.id, "typing")
        for video_link in video_links:
            unique_link = await process_video_link(video_link, user_id, sender_username)
            await message.reply(
                f"""Your video has been uploaded successfully... \n\n😊😊Now you can start using the link:\n\n{unique_link}"""
            )
        await messageInit.delete()
    else:
        await bot.send_message(
            message.chat.id, """\nPlease Choose From Menu Options... \n\n👇👇"""
        )


@app.on_message(filters.video)
async def handle_video(bot, message: Message):
    messageInit = await message.reply("Processing request...")
    try:
        user_id = message.from_user.id
        file_id = message.video.file_id
        video_path = await bot.download_media(file_id, file_name="../public/uploads/")
        video_file = open(video_path, "rb")
        fileName = os.path.basename(video_path)
        try:
            video_info = {
                "videoName": fileName,
                "fileLocalPath": f"/public/uploads/{fileName}",
                "file_size": message.video.file_size,
                "duration": message.video.duration,
                "mime_type": message.video.mime_type,
                "fileUniqueId": message.video.file_unique_id,
                "relatedUser:": user_id,
                "userName": message.from_user.username or "",
            }
            videoCollection.insert_one(video_info)
        except Exception as e:
            print(e)
            return
        videoUrl = (
            f"http://nutcracker.live/public/uploads/{message.video.file_unique_id}"
        )
        await message.reply(
            f"""Your video has been uploaded successfully... \n\n😊😊Now you can start using the link:\n\n{videoUrl}"""
        )
        await messageInit.delete()
    except Exception as e:
        print(e)
        await messageInit.edit(
            f"An error occured while processing your request. Please try again later."
        )
        return


@app.on_message(filters.photo)
async def handleImage(bot, message):
    caption = message.caption
    imageInfo = message.photo
    if caption:
        print(caption)
        print(imageInfo)
        sender_username = message.from_user.username
        user_id = message.from_user.id
        uniqueId = message.message_id
        video_links = re.findall(r"(https?://\S+)", caption)
        if video_links:
            messageInit = await bot.send_message(
                message.chat.id, "Processing request... 👍"
            )
            await bot.send_chat_action(message.chat.id, "typing")
            for video_link in video_links:
                localFilePath = os.path.join(
                    f"../public/uploads", f"{os.path.basename(video_link)}"
                )
                unique_link = await process_video_link(
                    video_link, user_id, sender_username, localFilePath, uniqueId
                )
                await message.reply(
                    f"""Your video has been uploaded successfully... \n\n😊😊Now you can start using the link:\n\n{unique_link}"""
                )
                await messageInit.delete()
        else:
            await bot.send_message(
                message.chat.id,
                f"""
                                                We Only accept videos or video link .. 

                                          """,
                reply_to_message_id=message.message_id,
            )


async def process_video_link(
    video_link: str, user_id: int, sender_username: str
) -> str:
    video_path = await app.download_media(video_link)
    video_meta = await app.get_media_info(video_path)
    fileName = os.path.basename(video_path)
    video_info = {
        "videoName": fileName,
        "fileLocalPath": f"/public/uploads/{fileName}",
        "file_size": video_meta.file_size,
        "duration": video_meta.duration,
        "mime_type": video_meta.mime_type,
        "fileUniqueId": video_meta.file_unique_id,
        "relatedUser": user_id,
        "userName": sender_username or "",
    }
    videoCollection.insert_one(video_info)
    videoUrl = f"http://nutcracker.live/public/uploads/{video_meta.file_unique_id}"
    return videoUrl


app.run()




