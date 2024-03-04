import { use } from "express/lib/application";
import client from "../../lib/db";

function findOrCreateUser(userPhone) {
  return new Promise(async (resolve, reject) => {
    try {
      const userId = {};

      client.connect();
      const db = client.db("nutCracker");
      const userCollection = db.collection("userRecord");
      const user = await userCollection.findOne({ phoneNumber: userPhone });

      if (user) {
        console.log("userFound");
        userId.id = user.userId;
      } else {
        userId.id = uuidv4();
        userTamplate = {
          userId: userId.id,
          userName: "",
          upiNumber: 0,
          uploadedVideos: 0,
          phoneNumber: userPhone,
        };
        userCollection.insertOne(userTamplate);
        console.log("newUser Added");
      }
    } catch (error) {
      console.error("Error finding or creating user:", error);
      reject(error);
    }
  });
}

export { findOrCreateUser };
