import { MongoClient, ServerApiVersion } from "mongodb";

const mongoDbUrl = process.env.mongoDB_uri;

const client = new MongoClient(mongoDbUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

export default client;
