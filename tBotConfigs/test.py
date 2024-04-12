from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
from pymongo import MongoClient
import os

# Initialize MongoDB client
client = MongoClient('mongodb+srv://kamleshSoni:TLbtEzobixLJc3wi@nutcracker.hrrsybj.mongodb.net/?retryWrites=true&w=majority&appName=nutCracker')
db = client['nutCracker']
tmpRecordCollection = db['tmpRecord']

# Function to handle /convertsitelink command
def convert_site_link(update, context):
    # Prompt the user to provide the video link
    update.message.reply_text('Please provide the video link:')
    
    # Set session flag to indicate that user is converting a site link
    context.user_data['converting_site_link'] = True

# Function to process the provided site link
def process_site_link(update, context):
    video_link = update.message.text
    
    # Check if the user is in the process of converting a site link
    if context.user_data.get('converting_site_link'):
        # Extract video ID from the provided link (assuming it's the last segment of the URL path)
        video_id = video_link.split('/')[-1]
        
        # Search for the video ID in the 'tmpRecord' collection
        tmp_record = tmpRecordCollection.find_one({'uniqueLink': video_id})
        
        # Check if the video ID was found in the 'tmpRecord' collection
        if tmp_record:
            source_file_path = f'../tmpvideos/{tmp_record["filename"]}'  # Update source file path
            dest_file_path = f'../uploads/{tmp_record["filename"]}'
            
            # Check if the source file exists
            if os.path.exists(source_file_path):
                # Move the video file from '/tmpvideos' to '/uploads'
                os.rename(source_file_path, dest_file_path)
                
                # Create a new record in the 'videosRecord' collection
                new_video_record = {
                    'filename': tmp_record['filename'],
                    'uniqueLink': video_id,
                    'viewCount': 0
                }
                db['videosRecord'].insert_one(new_video_record)
                
                # Generate a unique link for the user to play the converted video
                unique_link = f'https://nutcracker.live/play/{video_id}'
                
                # Inform the user about the successful conversion and provide the unique link
                update.message.reply_text(f'Video converted successfully! You can play it using the following link:\n{unique_link}')
            else:
                update.message.reply_text('The source video file does not exist.')
        else:
            update.message.reply_text('No video found.')
        
        # Reset the session flag
        del context.user_data['converting_site_link']
    else:
        update.message.reply_text('Please start the conversion process by using the /convertsitelink command.')

def start(update, context):
    # Reply with "Hello"
    update.message.reply_text('Hello!')
# Create the Updater and pass it your bot's token
updater = Updater('6183932093:AAHs-oVwawQbINs_8Jq3EiAfMASGXSiUDuE', use_context=True)

# Get the dispatcher to register handlers
dp = updater.dispatcher

# Register command handlers
dp.add_handler(CommandHandler('start', start))
dp.add_handler(CommandHandler('convertsitelink', convert_site_link))

# Register a handler for text messages
dp.add_handler(MessageHandler(Filters.text & ~Filters.command, process_site_link))

# Start the Bot
updater.start_polling()

# Run the bot until you press Ctrl-C
updater.idle()
