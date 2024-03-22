import { MongoClient } from 'mongodb';
import fetch from 'node-fetch'; 

async function setupChangeStream() {
  const client = new MongoClient('mongodb+srv://kamleshSoni:TLbtEzobixLJc3wi@nutcracker.hrrsybj.mongodb.net/?retryWrites=true&w=majority&appName=nutCracker');
  await client.connect();
  console.log('Connected to MongoDB');
  
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
  const apiUrl = 'http://nutcracker.live/api/restartServer';
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
