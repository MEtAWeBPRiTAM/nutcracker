const { MongoClient } = require('mongodb');
const fetch = require('node-fetch'); // for making HTTP requests

async function setupChangeStream() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  
  const db = client.db('your_database_name');
  const collection = db.collection('videosRecord');
  
  const changeStream = collection.watch();
  
  changeStream.on('change', async (change) => {
    if (change.operationType === 'insert') {
      // Trigger your API endpoint here
      await triggerNextJSRestart();
    }
  });
}

async function triggerNextJSRestart() {
  const apiUrl = 'http://localhost:3000/api/restartServer'; // Update with your Next.js server URL
  try {
    const response = await fetch(apiUrl, { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to trigger server restart');
    }
    console.log('Server restart initiated successfully');
  } catch (error) {
    console.error('Error triggering server restart:', error);
  }
}

setupChangeStream().catch(console.error);
