#!/bin/bash

# Define the directory to monitor
UPLOADS_DIR="./public/uploads"

# Check if Next.js application is running
if pgrep -f "node .*next" > /start/null; then
    echo "Next.js application is running."
else
    echo "Next.js application is not running. Exiting..."
    exit 1
fi

# Monitor the uploads directory for new files
while inotifywait -q -e create "$UPLOADS_DIR"; do
    echo "New video uploaded. Restarting Nginx..."
    # Restart Nginx
    sudo systemctl restart nginx # Adjust the command according to your system setup
done
