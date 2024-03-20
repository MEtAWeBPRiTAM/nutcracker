import client from "../../lib/db";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("videos", 10);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      upload(req, res, async function (err) {
        if (err) {
          console.error("Error uploading files:", err);
          return res.status(500).json({ error: "Error uploading files" });
        }

        const files = req.files;
        const videoUrls = [];
        function generateRandomHex(length) {
          const characters = 'abcdef0123456789';
          let randomHex = '';
      
          for (let i = 0; i < length; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length);
              randomHex += characters.charAt(randomIndex);
          }
      
          return randomHex;
      }
      
      // Generate a random hexadecimal string with 24 characters
      const randomHex = generateRandomHex(24);
      console.log(randomHex);
        for (const file of files) {
          const { filename } = file;
          const videoId = randomHex;

          const db = client.db("nutCracker");
          const videoCollections = db.collection("videosRecord");
          const pathLc = `/public/uploads/${videoId}`;
          const videoTemplate = {
            fileUniqueId: videoId,
            videoName: filename,
            localStoragePath: pathLc,
            relatedUser: '25651563',
            viewCount: 0
          };

          await videoCollections.insertOne(videoTemplate);
          const videoUrl = `http://nutcracker.live/video/${videoId}`;
          videoUrls.push(videoUrl);
        }

        res.status(200).json({ success: true, videoUrls });
      });
    } catch (error) {
      console.error("Error connecting to the database:", error);
      res.status(500).json({ error: "Error connecting to the database" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
