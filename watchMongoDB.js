import { MongoClient } from 'mongodb';
import fetch from 'node-fetch'; // for making HTTP requests

async function setupChangeStream() {
  const client = new MongoClient('mongoDB_uri');
  await client.connect();
  
  const db = client.db('nutCracker');
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
  const apiUrl = 'http://nutcracker.live/api/restartServer'; // Update with your Next.js server URL
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
