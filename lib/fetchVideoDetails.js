// lib/fetchVideoDetails.js

const fetchVideoDetails = async (videoId) => {
    try {
      const response = await fetch(`/api/videoDetails?videoId=${videoId}`);
  
      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  };
  
  export default fetchVideoDetails;
  